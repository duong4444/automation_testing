const { test, expect } = require('@playwright/test');
const RegisterPage = require('../pages/RegisterPage');

test.describe('Kiểm thử chức năng Đăng ký tài khoản', () => {
  test('Đăng ký không thành công do bỏ trống các trường bắt buộc', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();
    
    // Nhấp nút Đăng ký ngay lập tức mà không điền thông tin
    await page.click(registerPage.submitButton);
    
    // An Phát PC sử dụng thông báo lỗi qua popup alert hoặc qua HTML5 validation
    // Chúng ta lắng nghe sự kiện dialog (alert) nếu có
    let alertMessage = '';
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Chờ 2 giây để xem có cảnh báo nào xuất hiện không
    await page.waitForTimeout(2000);
    
    // Kiểm tra xem trang có hiển thị thông báo lỗi hoặc giữ nguyên ở trang đăng ký
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dang-ky');
  });

  test('Đăng ký thành công với thông tin hợp lệ (Email ngẫu nhiên)', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();
    
    // Sinh thông tin ngẫu nhiên để tránh trùng lặp
    const uniqueId = Date.now();
    const randomEmail = `tester_anphat_${uniqueId}@gmail.com`;
    const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`; // Sinh số điện thoại 10 số ngẫu nhiên
    const fullName = 'Nguyễn Văn Tester';
    const password = 'TestPassword123@';
    const address = '123 Đường Cầu Giấy, Hà Nội';
    
    // Lắng nghe sự kiện alert nếu hệ thống hiển thị thông báo
    page.on('dialog', async dialog => {
      console.log('Dialog hiển thị khi đăng ký:', dialog.message());
      await dialog.accept();
    });
    
    // Thực hiện đăng ký
    await registerPage.register(fullName, randomEmail, password, address, randomPhone);
    
    // Đợi trang web phản hồi
    await page.waitForTimeout(3000);
    
    // Sau khi đăng ký thành công, thường hệ thống sẽ tự động đăng nhập và chuyển hướng về trang chủ hoặc trang thông tin tài khoản
    // Kiểm tra xem URL có thay đổi khỏi trang đăng ký không, hoặc kiểm tra sự xuất hiện của thông báo thành công
    const currentUrl = page.url();
    console.log('URL sau khi nhấn Đăng ký:', currentUrl);
    
    // Khẳng định trang đăng ký thành công bằng cách kiểm tra URL có tham số status=success
    expect(currentUrl).toContain('status=success');
  });

  test('Đăng ký thất bại do nhập mật khẩu xác nhận không khớp', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    const uniqueId = Date.now();
    const randomEmail = `tester_mismatch_${uniqueId}@gmail.com`;
    const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Điền thông tin nhưng mật khẩu xác nhận khác mật khẩu chính
    await page.fill(registerPage.fullNameInput, 'Nguyễn Văn Mismatch');
    await page.fill(registerPage.emailInput, randomEmail);
    await page.fill(registerPage.passwordInput, 'Password123!');
    await page.fill(registerPage.passwordConfirmInput, 'DifferentPassword123!'); // không khớp
    await page.fill(registerPage.addressInput, '123 Cầu Giấy, Hà Nội');
    await page.fill(registerPage.mobileInput, randomPhone);

    // Chấp nhận mọi thông báo dialog alert của hệ thống
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.click(registerPage.submitButton);
    await page.waitForTimeout(3000);

    // Xác thực: Đăng ký thất bại, vẫn ở trang đăng ký
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dang-ky');
    expect(currentUrl).not.toContain('status=success');
  });

  test('Đăng ký thất bại do Email đã tồn tại trong hệ thống', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

    const randomPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Điền thông tin với email đã tồn tại trong hệ thống
    await page.fill(registerPage.fullNameInput, 'Nguyễn Văn TrùngEmail');
    await page.fill(registerPage.emailInput, 'finley.vasquez94@eldoriaan.com'); // email đã có tài khoản
    await page.fill(registerPage.passwordInput, 'Password123!');
    await page.fill(registerPage.passwordConfirmInput, 'Password123!');
    await page.fill(registerPage.addressInput, '123 Cầu Giấy, Hà Nội');
    await page.fill(registerPage.mobileInput, randomPhone);

    // Lắng nghe alert của hệ thống nếu báo lỗi trùng email
    page.on('dialog', async dialog => {
      console.log('Dialog thông báo lỗi đăng ký:', dialog.message());
      await dialog.accept();
    });

    await page.click(registerPage.submitButton);
    await page.waitForTimeout(3000);

    // Xác thực: Vẫn ở trang đăng ký
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dang-ky');
    expect(currentUrl).not.toContain('status=success');
  });
});
