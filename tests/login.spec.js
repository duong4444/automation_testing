const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('Kiểm thử chức năng Đăng nhập tài khoản', () => {
  test('Đăng nhập thất bại khi nhập sai mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // Đăng nhập với tài khoản không tồn tại hoặc mật khẩu sai
    await loginPage.login('tester_anphat_wrong_email@gmail.com', 'WrongPassword123');

    // Lắng nghe sự kiện alert thông báo lỗi đăng nhập nếu có
    let alertMessage = '';
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.waitForTimeout(3000);

    // Xác thực hành vi của website An Phát PC khi đăng nhập sai:
    // 1. URL phải vẫn giữ nguyên trang đăng nhập
    expect(page.url()).toContain('/dang-nhap');
    
    // 2. Các trường nhập liệu Email và Mật khẩu bị xóa sạch giá trị (clear value)
    const emailValue = await page.locator(loginPage.emailInput).inputValue();
    const passwordValue = await page.locator(loginPage.passwordInput).inputValue();
    
    console.log(`Kiểm tra trường Email sau khi đăng nhập sai: "${emailValue}"`);
    console.log(`Kiểm tra trường Mật khẩu sau khi đăng nhập sai: "${passwordValue}"`);
    
    expect(emailValue).toBe('');
    expect(passwordValue).toBe('');
  });

  // HƯỚNG DẪN: Để chạy kịch bản đăng nhập thành công này, phải đăng ký 1 tài khoản thật trước bằng tay
  // trên website An Phát PC, sau đó cập nhật thông tin email và mật khẩu của bạn vào đây.
  test('Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // THAY ĐỔI thông tin tài khoản thật tại đây để chạy test thành công:
    // const myEmail = 'dien_email_cua_ban_tai_day@gmail.com';
    // const myPassword = 'dien_mat_khau_cua_ban';

    const myEmail = 'finley.vasquez94@eldoriaan.com';
    const myPassword = 'qq112233';

    if (myEmail === 'dien_email_cua_ban_tai_day@gmail.com') {
      console.log('Bỏ qua kiểm thử đăng nhập thành công vì chưa cung cấp tài khoản thật.');
      test.skip();
      return;
    }

    await loginPage.login(myEmail, myPassword);
    await page.waitForTimeout(3000);

    // Kiểm tra đăng nhập thành công bằng cách kiểm tra chuyển hướng hoặc có tên tài khoản trên header
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dang-nhap');
    
    // Kiểm tra xem liên kết "Đăng nhập" và "Đăng ký" có biến mất khỏi header không
    const loginLink = page.locator('a[href="/dang-nhap"]').first();
    await expect(loginLink).toBeHidden({ timeout: 5000 });
    
    // Kiểm tra xem có liên kết dẫn đến trang quản lý tài khoản (/taikhoan) không
    // Cả icon tài khoản và liên kết tên hiển thị đều có thể trỏ về /taikhoan. Ta lọc liên kết chứa text.
    const accountLink = page.locator('a[href="/taikhoan"]').filter({ hasText: /[^\s]/ });
    await expect(accountLink).toBeVisible({ timeout: 5000 });
    
    // Đọc tên người dùng hiển thị trên header và xác nhận không phải rỗng
    const accountNameText = await accountLink.innerText();
    console.log(`Đăng nhập thành công! Tên người dùng hiển thị trên header: "${accountNameText.trim()}"`);
    expect(accountNameText.trim().length).toBeGreaterThan(0);
  });
});
