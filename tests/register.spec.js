const { test, expect } = require("@playwright/test");
const RegisterPage = require("../pages/RegisterPage");

test.describe("Kiểm thử chức năng Đăng ký tài khoản", () => {
  test("Đăng ký không thành công do bỏ trống các trường bắt buộc", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    // An Phát PC sử dụng thông báo lỗi qua popup alert hoặc qua HTML5 validation
    // Chúng ta lắng nghe sự kiện dialog (alert) nếu có
    let alertMessage = "";
    page.once("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Nhấp nút Đăng ký ngay lập tức mà không điền thông tin
    await page.click(registerPage.submitButton);

    await expect.poll(() => alertMessage).not.toBe("");

    expect(alertMessage).toContain("Bạn chưa nhập email");
    expect(alertMessage).toContain("Bạn chưa nhập mật khẩu");
    expect(alertMessage).toContain("Bạn chưa nhập tên");
    const currentUrl = page.url();
    expect(currentUrl).toContain("/dang-ky");
  });

  test("Đăng ký thành công với thông tin hợp lệ (Email ngẫu nhiên)", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    // Sinh thông tin ngẫu nhiên để tránh trùng lặp
    const uniqueId = Date.now();
    const randomEmail = `tester_anphat_${uniqueId}@gmail.com`;
    const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`; // Sinh số điện thoại 10 số ngẫu nhiên
    const fullName = "Nguyễn Văn Tester";
    const password = "TestPassword123@";
    const address = "123 Đường Cầu Giấy, Hà Nội";

    // Lắng nghe sự kiện alert nếu hệ thống hiển thị thông báo
    page.on("dialog", async (dialog) => {
      console.log("Dialog hiển thị khi đăng ký:", dialog.message());
      await dialog.accept();
    });

    // Thực hiện đăng ký
    await registerPage.register(
      fullName,
      randomEmail,
      password,
      address,
      randomPhone,
    );

    // Đợi trang web phản hồi
    await page.waitForTimeout(3000);

    // Sau khi đăng ký thành công, thường hệ thống sẽ tự động đăng nhập và chuyển hướng về trang chủ hoặc trang thông tin tài khoản
    // Kiểm tra xem URL có thay đổi khỏi trang đăng ký không, hoặc kiểm tra sự xuất hiện của thông báo thành công
    const currentUrl = page.url();
    console.log("URL sau khi nhấn Đăng ký:", currentUrl);

    // Khẳng định trang đăng ký thành công bằng cách kiểm tra URL có tham số status=success
    expect(currentUrl).toContain("status=success");
  });

  test("Đăng ký thất bại do nhập mật khẩu xác nhận không khớp", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    const uniqueId = Date.now();
    const randomEmail = `tester_mismatch_${uniqueId}@gmail.com`;
    const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Điền thông tin nhưng mật khẩu xác nhận khác mật khẩu chính
    await page.fill(registerPage.fullNameInput, "Nguyễn Văn Mismatch");
    await page.fill(registerPage.emailInput, randomEmail);
    await page.fill(registerPage.passwordInput, "Password123!");
    await page.fill(registerPage.passwordConfirmInput, "DifferentPassword123!"); // không khớp
    await page.fill(registerPage.addressInput, "123 Cầu Giấy, Hà Nội");
    await page.fill(registerPage.mobileInput, randomPhone);

    // Chấp nhận mọi thông báo dialog alert của hệ thống
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.click(registerPage.submitButton);
    await page.waitForTimeout(3000);

    // Xác thực: Đăng ký thất bại, vẫn ở trang đăng ký
    const currentUrl = page.url();
    expect(currentUrl).toContain("/dang-ky");
    expect(currentUrl).not.toContain("status=success");
  });

  test("Đăng ký thất bại do Email đã tồn tại trong hệ thống", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Điền thông tin với email đã tồn tại trong hệ thống
    await page.fill(registerPage.fullNameInput, "Nguyễn Văn TrùngEmail");
    await page.fill(registerPage.emailInput, "finley.vasquez94@eldoriaan.com"); // email đã có tài khoản
    await page.fill(registerPage.passwordInput, "Password123!");
    await page.fill(registerPage.passwordConfirmInput, "Password123!");
    await page.fill(registerPage.addressInput, "123 Cầu Giấy, Hà Nội");
    await page.fill(registerPage.mobileInput, randomPhone);

    // Lắng nghe alert của hệ thống nếu báo lỗi trùng email
    page.on("dialog", async (dialog) => {
      console.log("Dialog thông báo lỗi đăng ký:", dialog.message());
      await dialog.accept();
    });

    await page.click(registerPage.submitButton);
    await page.waitForTimeout(3000);

    // Xác thực: Vẫn ở trang đăng ký
    const currentUrl = page.url();
    await expect(page.locator("body")).toContainText("account_exist");
    expect(currentUrl).toContain("/dang-ky");
    expect(currentUrl).not.toContain("status=success");
  });

  test("Đăng ký thất bại với số điện thoại chứa ký tự chữ", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    let dialogMessage = "";
    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const uniqueId = Date.now();
    await page.fill(registerPage.fullNameInput, "Nguyễn Văn PhoneError");
    await page.fill(
      registerPage.emailInput,
      `phone_error_${uniqueId}@gmail.com`,
    );
    await page.fill(registerPage.passwordInput, "Password123!");
    await page.fill(registerPage.passwordConfirmInput, "Password123!");
    await page.fill(registerPage.mobileInput, "03t4loi6s7d"); // Nhập SĐT chứa chữ theo phát hiện của user

    await page.click(registerPage.submitButton);
    
    // Đợi 2 giây phản hồi từ trang web
    await page.waitForTimeout(2000);

    // Xác thực 1: Kỳ vọng hệ thống hiển thị Dialog thông báo lỗi
    expect(dialogMessage).not.toBe("");
    expect(dialogMessage).toContain("Điện thoại không hợp lệ");

    // Xác thực 2: Kỳ vọng URL không được chứa status=success
    expect(page.url()).not.toContain("status=success");
  });

  test("Kiểm tra chuyển hướng từ trang Đăng ký sang Đăng nhập", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    // Tìm liên kết "Đăng nhập" dành cho người đã có tài khoản
    const loginLink = page
      .locator('a[href="/dang-nhap"]')
      .filter({ hasText: "Đăng nhập" })
      .first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*dang-nhap/);
    } else {
      // Nếu không tìm thấy text cụ thể, kiểm tra sự tồn tại của link
      const anyLoginLink = page.locator('a[href="/dang-nhap"]').first();
      await anyLoginLink.click();
      await expect(page).toHaveURL(/.*dang-nhap/);
    }
  });

  test("Đăng ký thất bại khi mật khẩu quá ngắn (Dưới 6 ký tự)", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    let dialogMessage = "";

    page.once("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const uniqueId = Date.now();
    await page.fill(registerPage.fullNameInput, "User Short Pass");
    await page.fill(registerPage.emailInput, `short_${uniqueId}@gmail.com`);
    await page.fill(registerPage.passwordInput, "123"); // Mật khẩu yếu/ngắn
    await page.fill(registerPage.passwordConfirmInput, "123");
    await page.fill(registerPage.mobileInput, "0912345678");

    await page.click(registerPage.submitButton);

    await expect.poll(() => dialogMessage).not.toBe("");
    expect(dialogMessage).toContain("Bạn chưa nhập mật khẩu");
  });

  test("Đăng ký thất bại với định dạng Email không hợp lệ (Missing dot/domain)", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);

    const uniqueId = Date.now();
    // Sinh các email không hợp lệ ngẫu nhiên để tránh bị lỗi "Email trùng lặp" che khuất bug validate thực tế
    const invalidEmails = [
      `invalid_email_${uniqueId}`,          // Không có ký tự @ và tên miền (giống "foobar")
      `invalid_${uniqueId}@com`,             // Thiếu dấu chấm ở tên miền
    ];

    for (const email of invalidEmails) {
      await registerPage.navigateToRegister(); // Quay lại trang đăng ký ở mỗi vòng lặp tránh kẹt URL thành công

      const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

      await page.fill(registerPage.fullNameInput, "Nguyễn Văn A");
      await page.fill(registerPage.emailInput, email);
      await page.fill(registerPage.passwordInput, "Password123!");
      await page.fill(registerPage.passwordConfirmInput, "Password123!");
      await page.fill(registerPage.mobileInput, randomPhone); // Sinh số điện thoại ngẫu nhiên để tránh lỗi trùng số điện thoại
      await page.click(registerPage.submitButton);

      await page.waitForTimeout(2000);

      // Xác thực: Hệ thống không được chuyển hướng thành công.
      // Nếu có bug xảy ra (đăng ký thành công), URL sẽ chứa status=success làm test case bị FAIL đỏ lập tức!
      expect(page.url()).not.toContain("status=success");
    }
  });

  test("Đăng ký thất bại khi nhập chuỗi SQL Injection trong Email", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    await page.fill(registerPage.fullNameInput, "Nguyễn Văn A");

    await page.fill(registerPage.emailInput, "' OR '1'='1'");

    await page.fill(registerPage.passwordInput, "Password123!");
    await page.fill(registerPage.passwordConfirmInput, "Password123!");
    await page.fill(registerPage.addressInput, "Hà Nội");
    await page.fill(registerPage.mobileInput, "0912345678");

    await page.click(registerPage.submitButton);

    await expect(page.locator("body")).not.toContainText("SQL");
    await expect(page.locator("body")).not.toContainText("MySQL");
    await expect(page.locator("body")).not.toContainText("syntax error");

    expect(page.url()).not.toContain("status=success");
  });
});
