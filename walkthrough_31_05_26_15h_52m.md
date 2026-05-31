# Báo cáo Kết quả Kiểm thử Tự động An Phát PC

Dự án kiểm thử tự động trên website **An Phát Computer (anphatpc.com.vn)** đã được triển khai hoàn chỉnh bằng **Playwright** và Javascript, áp dụng thiết kế cấu trúc **Page Object Model (POM)**.

---

## 🌟 Kết quả chạy kiểm thử (Test Results)

Hệ thống đã thực thi toàn bộ kịch bản kiểm thử với kết quả:
*   **Số lượng ca kiểm thử:** 6
*   **Số lượng Đạt (Passed):** 5
*   **Số lượng Bỏ qua (Skipped):** 1 (Ca kiểm thử Đăng nhập thành công, do cần người dùng cung cấp thông tin tài khoản thật).

```text
Running 6 tests using 1 worker

[1/6] [chromium] › tests\login.spec.js:5:3 › Đăng nhập thất bại khi nhập sai mật khẩu (PASSED)
[2/6] [chromium] › tests\login.spec.js:34:3 › Đăng nhập thành công với tài khoản hợp lệ (SKIPPED)
[3/6] [chromium] › tests\register.spec.js:5:3 › Đăng ký không thành công do bỏ trống các trường bắt buộc (PASSED)
[4/6] [chromium] › tests\register.spec.js:28:3 › Đăng ký thành công với thông tin hợp lệ (Email ngẫu nhiên) (PASSED)
[5/6] [chromium] › tests\search.spec.js:5:3 › Tìm kiếm sản phẩm với từ khóa hợp lệ "RTX" (PASSED)
[6/6] [chromium] › tests\search.spec.js:33:3 › Tìm kiếm sản phẩm với từ khóa không tồn tại (PASSED)

5 passed, 1 skipped (54.0s)
```

---

## 📂 Các thành phần đã triển khai

### 1. Cấu hình hệ thống
*   [playwright.config.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/playwright.config.js): Cấu hình chạy test tuần tự (workers: 1) để tránh bị chặn IP, tự động bật trình duyệt có giao diện (`headless: false`) để tăng độ tin cậy và xử lý video/screenshot khi test lỗi.

### 2. Thư mục Page Objects (`pages/`)
*   [BasePage.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/pages/BasePage.js): Chứa các hàm dùng chung. Đặc biệt tích hợp hàm `closePopups()` tự động ẩn đi các banner quảng cáo xuất hiện đè lên giao diện chính trên website thật.
*   [RegisterPage.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/pages/RegisterPage.js): Định nghĩa các locator của form Đăng ký (Họ tên, Email, SĐT, Mật khẩu, Nút Đăng ký).
*   [LoginPage.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/pages/LoginPage.js): Định nghĩa locator cho form Đăng nhập (Email, Mật khẩu, Nút Đăng nhập).
*   [SearchPage.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/pages/SearchPage.js): Định nghĩa thanh tìm kiếm, nút tìm kiếm và thuật toán tìm kiếm, trích xuất danh sách sản phẩm thuộc phần kết quả.

### 3. Thư mục Kịch bản Kiểm thử (`tests/`)
*   [search.spec.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/tests/search.spec.js): Kiểm tra chức năng tìm kiếm sản phẩm với từ khóa tồn tại (RTX) và không tồn tại. Có tích hợp việc chờ kết quả render để tránh flakiness.
*   [register.spec.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/tests/register.spec.js): Kiểm tra đăng ký thành công (sử dụng thuật toán sinh Email ngẫu nhiên và sinh SĐT 10 số ngẫu nhiên) và đăng ký lỗi.
*   [login.spec.js](file:///c:/Users/ADMIN/Desktop/automation_test_%20project/tests/login.spec.js): Kiểm tra đăng nhập thất bại khi sai mật khẩu và kịch bản đăng nhập thành công.

---

## 💡 Hướng dẫn cho người dùng chạy test

Bạn có thể chạy kiểm thử trên máy tính của mình bằng cách mở cửa sổ Terminal trong thư mục [automation_test_ project](file:///c:/Users/ADMIN/Desktop/automation_test_%20project) và nhập các lệnh sau:

1.  **Chạy toàn bộ các bài test:**
    ```bash
    npx playwright test
    ```
2.  **Chạy kiểm thử bằng giao diện trực quan (UI mode):**
    ```bash
    npx playwright test --ui
    ```
3.  **Xem báo cáo kiểm thử (HTML Report) sau khi chạy:**
    ```bash
    npx playwright show-report
    ```
