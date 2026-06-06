const { test, expect } = require("@playwright/test");
const LoginPage = require("../pages/LoginPage");

test.describe("Kiểm thử chức năng Đăng nhập tài khoản", () => {
  test("Đăng nhập thất bại khi nhập sai mật khẩu", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // Lắng nghe sự kiện alert thông báo lỗi đăng nhập nếu có
    let alertMessage = "";
    page.once("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Đăng nhập với tài khoản không tồn tại hoặc mật khẩu sai
    await loginPage.login(
      "tester_anphat_wrong_email@gmail.com",
      "WrongPassword123",
    );

    await page.waitForTimeout(3000);

    // Xác thực hành vi của website An Phát PC khi đăng nhập sai:
    // 1. URL phải vẫn giữ nguyên trang đăng nhập
    expect(page.url()).toContain("/dang-nhap");

    // 2. Các trường nhập liệu Email và Mật khẩu bị xóa sạch giá trị (clear value)
    const emailValue = await page.locator(loginPage.emailInput).inputValue();
    const passwordValue = await page
      .locator(loginPage.passwordInput)
      .inputValue();

    console.log(`Kiểm tra trường Email sau khi đăng nhập sai: "${emailValue}"`);
    console.log(
      `Kiểm tra trường Mật khẩu sau khi đăng nhập sai: "${passwordValue}"`,
    );

    expect(emailValue).toBe("");
    expect(passwordValue).toBe("");
  });

  // HƯỚNG DẪN: Để chạy kịch bản đăng nhập thành công này, phải đăng ký 1 tài khoản thật trước bằng tay
  // trên website An Phát PC, sau đó cập nhật thông tin email và mật khẩu của bạn vào đây.
  test("Đăng nhập thành công với tài khoản hợp lệ", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // THAY ĐỔI thông tin tài khoản thật tại đây để chạy test thành công:
    // const myEmail = 'dien_email_cua_ban_tai_day@gmail.com';
    // const myPassword = 'dien_mat_khau_cua_ban';

    const myEmail = "finley.vasquez94@eldoriaan.com";
    const myPassword = "qq112233";

    if (myEmail === "dien_email_cua_ban_tai_day@gmail.com") {
      console.log(
        "Bỏ qua kiểm thử đăng nhập thành công vì chưa cung cấp tài khoản thật.",
      );
      test.skip();
      return;
    }

    await loginPage.login(myEmail, myPassword);
    await page.waitForTimeout(3000);

    // Kiểm tra đăng nhập thành công bằng cách kiểm tra chuyển hướng hoặc có tên tài khoản trên header
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/dang-nhap");

    // Kiểm tra xem liên kết "Đăng nhập" và "Đăng ký" có biến mất khỏi header không
    const loginLink = page.locator('a[href="/dang-nhap"]').first();
    await expect(loginLink).toBeHidden({ timeout: 5000 });

    // Kiểm tra xem có liên kết dẫn đến trang quản lý tài khoản (/taikhoan) không
    // Cả icon tài khoản và liên kết tên hiển thị đều có thể trỏ về /taikhoan. Ta lọc liên kết chứa text.
    const accountLink = page
      .locator('a[href="/taikhoan"]')
      .filter({ hasText: /[^\s]/ });
    await expect(accountLink).toBeVisible({ timeout: 5000 });

    // Đọc tên người dùng hiển thị trên header và xác nhận không phải rỗng
    const accountNameText = await accountLink.innerText();
    console.log(
      `Đăng nhập thành công! Tên người dùng hiển thị trên header: "${accountNameText.trim()}"`,
    );
    expect(accountNameText.trim().length).toBeGreaterThan(0);
  });

  test("Đăng nhập thất bại khi bỏ trống Email hoặc Mật khẩu", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // 1. Trường hợp bỏ trống cả 2
    await page.click(loginPage.submitButton);
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/dang-nhap");

    // 2. Trường hợp chỉ điền Email, bỏ trống Mật khẩu
    await page.fill(loginPage.emailInput, "test_empty_password@gmail.com");
    await page.click(loginPage.submitButton);
    await page.waitForTimeout(1000);

    // Đảm bảo vẫn ở trang đăng nhập
    expect(page.url()).toContain("/dang-nhap");
  });

  test("Đăng nhập thất bại khi nhập email sai định dạng", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // Nhập email sai định dạng và mật khẩu
    await loginPage.login("invalid_email_format", "SomePassword123");
    await page.waitForTimeout(3000);

    // Xác thực: Vẫn giữ nguyên trang đăng nhập
    expect(page.url()).toContain("/dang-nhap");
  });

  test("Đăng nhập qua Google - Mở cửa sổ liên kết Google OAuth", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // Lắng nghe sự kiện mở popup của trình duyệt khi click nút đăng nhập Google
    const popupPromise = page.waitForEvent("popup");
    // Click vào thẻ ảnh bên trong link (tránh lỗi collapsed size do style float:left của thẻ ảnh)
    await page.click("a[href=\"javascript:open_oauth('Google')\"] img");

    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded").catch(() => {});

    // Xác thực: Cửa sổ popup được mở và trỏ đúng về hệ thống xác thực accounts.google.com
    const popupUrl = popup.url();
    console.log("URL của cửa sổ Google OAuth:", popupUrl);
    expect(popupUrl).toContain("accounts.google.com");

    await popup.close();
  });

  test("Đăng nhập qua Facebook - Mở cửa sổ liên kết Facebook OAuth", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // Lắng nghe popup khi click nút đăng nhập Facebook
    const popupPromise = page.waitForEvent("popup");
    // Click vào thẻ ảnh bên trong link
    await page.click("a[href=\"javascript:open_oauth('Facebook')\"] img");

    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded").catch(() => {});

    // Xác thực 1: Cửa sổ popup được mở và trỏ đúng về facebook.com
    const popupUrl = popup.url();
    console.log("URL của cửa sổ Facebook OAuth:", popupUrl);
    expect(popupUrl).toContain("facebook.com");

    // Xác thực 2 (Tìm lỗi thực tế): Kiểm tra xem trang có bị hiển thị lỗi cấu hình ứng dụng không
    // (Đây là lỗi thật trên website An Phát PC khi họ chưa kích hoạt/cấu hình đúng Facebook App ID)
    const popupBodyText = await popup.innerText("body");
    console.log(
      "Nội dung hiển thị trên trang Facebook OAuth:",
      popupBodyText.substring(0, 100),
    );

    expect(popupBodyText).not.toContain("Ứng dụng không hoạt động");
    expect(popupBodyText).not.toContain("App not active");

    await popup.close();
  });

  test("Kiểm tra liên kết Quên mật khẩu", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    const forgotPasswordLink = page.locator('a[href="/quen-mat-khau"]');
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/.*quen-mat-khau/);
  });

  test("Kiểm tra chuyển hướng tới trang Đăng ký từ trang Đăng nhập", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    const registerLink = page
      .locator('a[href="/dang-ky"]')
      .filter({ hasText: "Đăng ký" })
      .first();
    await registerLink.click();
    await expect(page).toHaveURL(/.*dang-ky/);
  });
});
