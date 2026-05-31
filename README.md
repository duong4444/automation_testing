# Đề tài Kiểm thử Tự động Website An Phát PC với Playwright

Dự án này sử dụng framework **Playwright** (Javascript) để thực hiện kiểm thử tự động (Automation Testing) cho 3 chức năng chính trên website thương mại điện tử **An Phát Computer (anphatpc.com.vn)**:
1. **Tìm kiếm sản phẩm** (`tests/search.spec.js`)
2. **Đăng ký tài khoản** (`tests/register.spec.js`)
3. **Đăng nhập tài khoản** (`tests/login.spec.js`)

Mã nguồn được tổ chức theo mô hình chuẩn **Page Object Model (POM)** để tăng tính tái sử dụng, dễ bảo trì và mở rộng.

---

## 📂 Cấu trúc thư mục dự án

*   `pages/`: Chứa các Page Object quản lý locator và action trên từng trang.
    *   `BasePage.js`: Trang cơ sở chứa các phương thức dùng chung.
    *   `RegisterPage.js`: Xử lý giao diện Đăng ký tài khoản.
    *   `LoginPage.js`: Xử lý giao diện Đăng nhập tài khoản.
    *   `SearchPage.js`: Xử lý giao diện Tìm kiếm sản phẩm.
*   `tests/`: Chứa mã kịch bản kiểm thử (Test specs).
    *   `register.spec.js`: Các ca kiểm thử cho chức năng Đăng ký.
    *   `login.spec.js`: Các ca kiểm thử cho chức năng Đăng nhập.
    *   `search.spec.js`: Các ca kiểm thử cho chức năng Tìm kiếm.
*   `playwright.config.js`: File cấu hình chạy test của Playwright.

---

## 🛠️ Hướng dẫn cài đặt và thiết lập

Dự án đã được cài đặt sẵn các thư viện cần thiết. Nếu bạn chạy trên một máy tính mới, hãy làm theo các bước sau:

1.  **Cài đặt Node.js:** Đảm bảo máy tính của bạn đã cài đặt Node.js (phiên bản 16 trở lên).
2.  **Cài đặt các gói phụ thuộc (Dependencies):**
    ```bash
    npm install
    ```
3.  **Cài đặt trình duyệt kiểm thử của Playwright:**
    ```bash
    npx playwright install
    ```

---

## 🚀 Hướng dẫn chạy kiểm thử tự động

Bạn có thể thực hiện kiểm thử bằng các câu lệnh dưới đây:

### 1. Chạy toàn bộ các ca kiểm thử
Mặc định hệ thống sẽ mở trình duyệt Chromium và thực thi kịch bản (do cấu hình `headless: false` trong `playwright.config.js` để dễ quan sát):
```bash
npx playwright test
```

### 2. Chạy một file kiểm thử cụ thể
*   Chỉ chạy kiểm thử **Tìm kiếm**:
    ```bash
    npx playwright test tests/search.spec.js
    ```
*   Chỉ chạy kiểm thử **Đăng ký**:
    ```bash
    npx playwright test tests/register.spec.js
    ```
*   Chỉ chạy kiểm thử **Đăng nhập**:
    ```bash
    npx playwright test tests/login.spec.js
    ```

### 3. Chạy kiểm thử với giao diện trực quan (UI Mode)
Playwright cung cấp một giao diện UI rất đẹp để theo dõi từng bước chạy, xem log và debug:
```bash
npx playwright test --ui
```

### 4. Xem báo cáo kiểm thử (HTML Report)
Sau khi chạy xong test, Playwright tự động tạo báo cáo HTML chi tiết. Bạn có thể mở báo cáo bằng lệnh:
```bash
npx playwright show-report
```

---

## ⚠️ Những lưu ý quan trọng khi chạy kiểm thử trên Web Thật

1.  **Về chức năng Đăng nhập thành công:**
    *   Trong file [login.spec.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/tests/login.spec.js), ca kiểm thử đăng nhập thành công mặc định bị bỏ qua (`test.skip()`).
    *   Để chạy được ca kiểm thử này, bạn vui lòng tự truy cập [anphatpc.com.vn](https://www.anphatpc.com.vn) đăng ký thủ công một tài khoản.
    *   Sau đó mở file [login.spec.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/tests/login.spec.js), thay đổi email và mật khẩu thật của bạn vào biến `myEmail` và `myPassword`.
2.  **Bypass Anti-bot & Captcha:**
    *   Để tránh hệ thống của An Phát PC phát hiện hoạt động tự động hóa bất thường và chặn IP của bạn, cấu hình dự án được thiết lập chạy **1 luồng (worker: 1)** để các test case chạy tuần tự.
    *   Chế độ **headed** (hiển thị trình duyệt) được bật mặc định để giảm tỷ lệ bị chặn bởi các hệ thống bảo mật đám mây.
