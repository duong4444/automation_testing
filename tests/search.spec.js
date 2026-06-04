const { test, expect } = require("@playwright/test");
const SearchPage = require("../pages/SearchPage");

test.describe("Kiểm thử chức năng Tìm kiếm sản phẩm", () => {
  test('Tìm kiếm sản phẩm với từ khóa hợp lệ "RTX"', async ({ page }) => {
    const searchPage = new SearchPage(page);

    // Điều hướng tới trang chủ
    await searchPage.navigate();

    // Tìm kiếm với từ khóa "RTX"
    const keyword = "RTX";
    await searchPage.search(keyword);

    // Xác thực URL chứa từ khóa tìm kiếm
    await expect(page).toHaveURL(new RegExp(`q=${keyword}`, "i"));

    // Đợi các sản phẩm hiển thị trong container kết quả
    await page
      .waitForSelector(".p-list-container a, .product-list-container a", {
        timeout: 8000,
      })
      .catch(() => {});

    // Lấy danh sách sản phẩm hiển thị trên trang kết quả
    const products = await searchPage.getProductCards();

    expect(products.length).toBeGreaterThan(0);

    const matchesKeyword = products.some((product) =>
      product.text.toUpperCase().includes(keyword.toUpperCase()),
    );

    expect(matchesKeyword).toBeTruthy();
  });

  test("Tìm kiếm sản phẩm với từ khóa không tồn tại", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    // Tìm kiếm với chuỗi ngẫu nhiên không có thật
    const keyword = "KJSADKJASHDKAS";
    await searchPage.search(keyword);

    // Chờ 3 giây để trang tải xong và chắc chắn không có sản phẩm nào render
    await page.waitForTimeout(3000);

    const products = await searchPage.getProductCards();

    expect(products.length).toBeGreaterThan(0);

    // Kiểm tra xem có hiển thị thông báo không tìm thấy sản phẩm không
    const pageText = await page.innerText("body");
    expect(
      pageText.includes("không tìm thấy") ||
        pageText.includes("0 sản phẩm") ||
        pageText.includes("Không tìm thấy"),
    ).toBe(true);
  });

  test("Tìm kiếm sản phẩm với khoảng trắng thừa ở đầu và cuối từ khóa", async ({
    page,
  }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    // Từ khóa có khoảng trắng thừa "   RTX   "
    const keyword = "   RTX   ";
    await searchPage.search(keyword);

    // Xác thực URL chứa từ khóa đã được trim hoặc từ khóa gốc
    await expect(page).toHaveURL(/q=.*RTX.*/i);

    // Đợi các sản phẩm hiển thị
    await page
      .waitForSelector(".p-list-container a, .product-list-container a", {
        timeout: 8000,
      })
      .catch(() => {});

    const products = await searchPage.getProductCards();

    const matchesKeyword = products.some((product) =>
      product.text.toUpperCase().includes("RTX"),
    );
  });

  test("Tìm kiếm với từ khóa là ký tự đặc biệt", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    const keyword = "!@#$%^&*()";
    await searchPage.search(keyword);

    // Thông thường hệ thống sẽ trả về 0 kết quả hoặc lọc bỏ ký tự đặc biệt
    const products = await searchPage.getProductCards();
    console.log(
      `Tìm kiếm ký tự đặc biệt: tìm thấy ${products.length} sản phẩm`,
    );

    // Xác thực không gây lỗi crash trang (URL vẫn chứa tham số q)
    await expect(page).toHaveURL(/q=.*/);
  });

  test("Tìm kiếm với từ khóa rỗng", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    // Nhấn nút tìm kiếm mà không nhập gì
    await page.click(searchPage.searchButton);

    // Xác thực: Hệ thống có thể giữ nguyên trang chủ hoặc không thực hiện tìm kiếm
    const currentUrl = page.url();
    expect(
      currentUrl === "https://www.anphatpc.com.vn/" ||
        currentUrl.includes("q="),
    ).toBe(true);
  });

  test("Kiểm tra chức năng sắp xếp sản phẩm (Giá giảm dần)", async ({
    page,
  }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("Chuột không dây");

    const sortOption = page.getByText("Giá giảm dần");

    await expect(sortOption).toBeVisible();

    await sortOption.click();

    // Chờ danh sách sản phẩm render lại
    await page.waitForSelector(".p-item");

    // Kiểm tra URL có thay đổi
    await expect(page).toHaveURL(/sort/i);

    const prices = await searchPage.getProductPrices();

    expect(prices.length).toBeGreaterThan(1);

    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });

  test("Kiểm tra sắp xếp sản phẩm theo giá tăng dần", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("Chuột không dây");

    const sortOption = page.getByText("Giá tăng dần");

    await expect(sortOption).toBeVisible();

    await sortOption.click();

    // Chờ danh sách sản phẩm load lại
    await page.waitForSelector(".p-item");

    // Kiểm tra URL có tham số sort
    await expect(page).toHaveURL(/sort/i);

    const prices = await searchPage.getProductPrices();

    expect(prices.length).toBeGreaterThan(1);

    // Danh sách giá mong đợi sau khi sắp xếp tăng dần
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test("Lọc sản phẩm theo hãng Asus", async ({ page }) => {
    const searchPage = new SearchPage(page);

    // Mở trang chủ
    await searchPage.navigate();

    // Search trước để vào trang kết quả
    const keyword = "RTX";
    await searchPage.search(keyword);

    await expect(page).toHaveURL(/q=.*RTX.*/i);

    // Thực hiện lọc
    await searchPage.filterByBrand("Asus");

    await page
      .waitForSelector(".p-list-container a, .product-list-container a", {
        timeout: 8000,
      })
      .catch(() => {});

    // ===== Test URL =====
    const currentUrl = page.url();

    expect(
      currentUrl.toLowerCase().includes("asus") ||
        currentUrl.toLowerCase().includes("brand"),
    ).toBeTruthy();

    // ===== Test dữ liệu trả về =====
    const products = await searchPage.getProductCards();

    const hasAsusProduct = products.every((product) =>
      product.text.toLowerCase().includes("asus"),
    );

    expect(hasAsusProduct).toBeTruthy();
  });

  test("Lọc sản phẩm theo giá 4 triệu - 10 triệu", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    const keyword = "RTX";
    await searchPage.search(keyword);

    await expect(page).toHaveURL(/q=.*RTX.*/i);

    // Lọc giá
    await searchPage.selectPriceRange("4 triệu - 10 triệu");

    await page
      .waitForSelector(".p-list-container a, .product-list-container a", {
        timeout: 8000,
      })
      .catch(() => {});

    // ===== Kiểm tra URL =====
    const currentUrl = page.url();

    expect(
      currentUrl.includes("min=4000000") && currentUrl.includes("max=10000000"),
    ).toBeTruthy();

    const prices = await searchPage.getProductPrices();

    for (const price of prices) {
      expect(prices.length).toBeGreaterThan(0);
      expect(price).toBeGreaterThanOrEqual(4000000);
      expect(price).toBeLessThanOrEqual(10000000);
    }
  });

  test("Sắp xếp theo mới nhất", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();
    await searchPage.search("RTX");

    await page.getByText("Mới nhất").click();

    await expect(page).toHaveURL(/sort=new/i);

    const products = await searchPage.getProductNames();

    expect(products.length).toBeGreaterThan(0);
  });

  test("Sắp xếp theo lượt xem", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();
    await searchPage.search("RTX");

    await searchPage.sortByDropdown("Lượt xem");

    await expect(page).toHaveURL(/sort=view/i);

    const products = await searchPage.getProductNames();

    expect(products.length).toBeGreaterThan(0);
  });

  test("Sắp xếp theo đánh giá", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();
    await searchPage.search("RTX");

    await searchPage.sortByDropdown("Đánh giá");

    await expect(page).toHaveURL(/sort=rating/i);

    const products = await searchPage.getProductNames();

    expect(products.length).toBeGreaterThan(0);
  });

  test("Sắp xếp theo tên A-Z", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();
    await searchPage.search("RTX");

    await searchPage.sortByDropdown("Tên A->Z");

    await expect(page).toHaveURL(/sort=name/i);

    const names = await searchPage.getProductNames();

    const sorted = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sorted);
  });

  test("Lọc sản phẩm theo khoảng giá 1tr - 5tr", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("Chuột");

    await searchPage.filterByPrice(1000000, 5000000);

    await page.waitForSelector(".p-item");

    const prices = await searchPage.getProductPrices();

    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(1000000);
      expect(price).toBeLessThanOrEqual(5000000);
    }
  });

  test("Lọc sản phẩm từ 2 triệu trở lên", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("Chuột");

    await searchPage.filterByPrice(2000000, "");

    const prices = await searchPage.getProductPrices();

    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(2000000);
    }
  });

  test("Lọc sản phẩm dưới 3 triệu", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("Chuột");

    await searchPage.filterByPrice("", 3000000);

    const prices = await searchPage.getProductPrices();

    for (const price of prices) {
      expect(price).toBeLessThanOrEqual(3000000);
    }
  });

  test("Giá thấp nhất lớn hơn giá cao nhất", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("Chuột");

    await searchPage.filterByPrice(5000000, 1000000);

    const productNames = await searchPage.getProductNames();

    expect(productNames.length).toBe(0);
  });

  test("Xem thêm sản phẩm", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("RTX");

    const beforeCount = await searchPage.getProductCount();

    console.log("Trước:", beforeCount);

    await searchPage.clickViewMore();

    await page.waitForTimeout(3000);

    const afterCount = await searchPage.getProductCount();

    console.log("Sau:", afterCount);

    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  test("Search RTX + Filter Asus + Xem thêm", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("RTX");

    await searchPage.filterByBrand("Asus");

    const beforeCount = await searchPage.getProductCount();

    await searchPage.clickViewMore();

    await page.waitForTimeout(3000);

    const products = await searchPage.getProductCards();

    expect(products.length).toBeGreaterThan(beforeCount);

    const allAsus = products.every((product) =>
      product.text.toLowerCase().includes("asus"),
    );

    expect(allAsus).toBeTruthy();
  });

  test("Search RTX + Asus + Giá trên 20 triệu", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.search("RTX");

    await searchPage.filterByBrand("Asus");

    await searchPage.selectPriceRange("Trên 20 triệu");

    const products = await searchPage.getProductCards();

    const validProducts = products.every((product) => {
      const text = product.text.toLowerCase();

      return text.includes("rtx") && text.includes("asus");
    });

    expect(validProducts).toBeTruthy();
  });

  test("Tìm kiếm theo thông số 1 T", async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    const keyword = "1 T";

    await searchPage.search(keyword);

    const products = await searchPage.getProductCards();

    const matched = products.some((product) =>
      product.text.toUpperCase().includes("1 T"),
    );

    expect(matched).toBeTruthy();
  });
});
