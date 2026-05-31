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
});
