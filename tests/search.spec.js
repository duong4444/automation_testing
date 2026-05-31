const { test, expect } = require('@playwright/test');
const SearchPage = require('../pages/SearchPage');

test.describe('Kiểm thử chức năng Tìm kiếm sản phẩm', () => {
  test('Tìm kiếm sản phẩm với từ khóa hợp lệ "RTX"', async ({ page }) => {
    const searchPage = new SearchPage(page);
    
    // Điều hướng tới trang chủ
    await searchPage.navigate();
    
    // Tìm kiếm với từ khóa "RTX"
    const keyword = 'RTX';
    await searchPage.search(keyword);
    
    // Xác thực URL chứa từ khóa tìm kiếm
    await expect(page).toHaveURL(new RegExp(`q=${keyword}`, 'i'));
    
    // Đợi các sản phẩm hiển thị trong container kết quả
    await page.waitForSelector('.p-list-container a, .product-list-container a', { timeout: 8000 }).catch(() => {});
    
    // Lấy danh sách sản phẩm hiển thị trên trang kết quả
    const productNames = await searchPage.getProductNames();
    console.log(`Tìm thấy ${productNames.length} sản phẩm tương ứng với từ khóa "${keyword}"`);
    
    // Khẳng định (Assert) có ít nhất 1 sản phẩm được trả về
    expect(productNames.length).toBeGreaterThan(0);
    
    // Khẳng định các sản phẩm đầu tiên có chứa từ khóa tìm kiếm (không phân biệt hoa thường)
    const matchesKeyword = productNames.slice(0, 5).some(name => name.toUpperCase().includes(keyword));
    expect(matchesKeyword).toBe(true);
  });

  test('Tìm kiếm sản phẩm với từ khóa không tồn tại', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();
    
    // Tìm kiếm với chuỗi ngẫu nhiên không có thật
    const keyword = 'KJSADKJASHDKAS';
    await searchPage.search(keyword);
    
    // Chờ 3 giây để trang tải xong và chắc chắn không có sản phẩm nào render
    await page.waitForTimeout(3000);
    
    // Lấy danh sách sản phẩm
    const productNames = await searchPage.getProductNames();
    
    // Khẳng định danh sách sản phẩm trống
    expect(productNames.length).toBe(0);
    
    // Kiểm tra xem có hiển thị thông báo không tìm thấy sản phẩm không
    const pageText = await page.innerText('body');
    expect(pageText.includes('không tìm thấy') || pageText.includes('0 sản phẩm') || pageText.includes('Không tìm thấy')).toBe(true);
  });
});
