const BasePage = require("./BasePage");

class SearchPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = "input#js-search";
    this.searchButton = "button.submit-search";

    // We target product links inside search results.
    // From our inspection, 'product-list-container' or 'p-list-container' and 'col-item' are present.
    // Usually, a product item is a div with class containing 'col-item' or 'item' inside the listing container,
    // and the product name is an anchor tag or heading.
    this.productNameLinks = ".col-item a, .p-list-container a";
    this.filterButton = page.locator(".btn-filter");
    this.viewResultButton = page.locator(".filter-group-bottom .js-open-url");
    this.minPriceInput = page.locator("#js-min-range");
    this.maxPriceInput = page.locator("#js-max-range");
    this.submitPriceFilter = page.locator("#js-submit-filter");
  }

  async closePopups() {
    await this.page.evaluate(() => {
      const banner = document.querySelector('.global-banner-popup-container');
      if (banner) banner.style.display = 'none';
      const bg = document.querySelector('.bg-popup');
      if (bg) bg.style.display = 'none';
    }).catch(() => {});
  }

  async search(keyword) {
    await this.closePopups();
    await this.page.fill(this.searchInput, keyword);
    await this.closePopups();
    await this.page.click(this.searchButton);

    // Chờ URL chuyển hướng đến trang tìm kiếm
    await this.page
      .waitForURL(
        (url) => url.pathname.includes("/tim") || url.search.includes("q="),
        { timeout: 10000 },
      )
      .catch(() => {});
    // Chờ container chứa sản phẩm xuất hiện trong DOM
    await this.page
      .waitForSelector(
        ".p-list-container, .product-list-container, #js-product-list",
        { state: "attached", timeout: 5000 },
      )
      .catch(() => {});
  }

  async getProductCards() {
    return await this.page.evaluate(() => {
      const container = document.querySelector(
        ".p-list-container, .product-list-container, #js-product-list",
      );
      if (!container) return [];

      const productLinks = Array.from(
        container.querySelectorAll('a[href$=".html"]'),
      ).filter((link) => {
        const text = link.innerText ? link.innerText.trim() : "";
        const href = link.href || "";
        return text.length > 12 && !href.includes("cart");
      });

      const seen = new Set();
      return productLinks
        .map((link) => {
          const name = link.innerText.trim();
          const card =
            link.closest(
              '.p-item, .col-item, .product-item, [class*="product"]',
            ) || link.parentElement;
          const cardText = card
            ? (card.textContent || "").replace(/\s+/g, " ").trim()
            : name;

          return {
            name,
            text: cardText,
            href: link.href,
          };
        })
        .filter((product) => {
          if (seen.has(product.href)) return false;
          seen.add(product.href);
          return true;
        });
    });
  }

  async getProductPrices() {
    return await this.page.evaluate(() => {
      const container = document.querySelector(
        ".p-list-container, .product-list-container, #js-product-list",
      );
      if (!container) return [];

      const productLinks = Array.from(
        container.querySelectorAll('a[href$=".html"]'),
      ).filter((link) => {
        const text = link.innerText ? link.innerText.trim() : "";
        const href = link.href || "";
        return text.length > 12 && !href.includes("cart");
      });

      const seen = new Set();
      const prices = [];
      for (const link of productLinks) {
        if (seen.has(link.href)) continue;
        seen.add(link.href);

        const card =
          link.closest('.p-item, .col-item, .product-item, [class*="product"]') ||
          link.parentElement;
        if (card) {
          const priceEl = card.querySelector(".p-price");
          if (priceEl) {
            const priceText = priceEl.innerText || priceEl.textContent || "";
            const priceNum = Number(priceText.replace(/[^\d]/g, ""));
            if (priceNum > 0) {
              prices.push(priceNum);
            }
          }
        }
      }
      return prices;
    });
  }

  async getProductNames() {
    const cards = await this.getProductCards();
    return cards.map((card) => card.name);
  }

  async waitForProductResults() {
    await this.page
      .waitForSelector(
        '.p-list-container a[href$=".html"], .product-list-container a[href$=".html"], #js-product-list a[href$=".html"]',
        {
          timeout: 10000,
        },
      )
      .catch(() => {});
  }

  async openFilter() {
    await this.filterButton.click();
  }

  async selectBrand(brandName) {
    await this.page
      .locator(
        `.js-filter-title[data-filter_code="brand"][title="${brandName}"]`,
      )
      .first()
      .click();
  }

  async selectPriceRange(priceText) {
    await this.openFilter();
    await this.page
      .locator(
        `.js-filter-title[data-filter_code="price"]:has-text("${priceText}")`,
      )
      .first()
      .click();
    await this.viewResult();
  }

  async viewResult() {
    await this.viewResultButton.nth(0).click();
  }

  async sortByDropdown(optionText) {
    await this.page
      .locator(".sort-by-group select")
      .selectOption({ label: optionText });
  }

  async filterByBrand(brandName) {
    await this.openFilter();
    await this.selectBrand(brandName);
    await this.viewResult();
  }

  async filterByPrice(minPrice, maxPrice) {
    await this.closePopups();
    const box = await this.submitPriceFilter.boundingBox();
    const isClickable = box && box.width > 0 && box.height > 0;
    if (!isClickable) {
      if (await this.filterButton.isVisible()) {
        await this.openFilter();
        await this.page.waitForTimeout(500);
      }
    }
    await this.closePopups();
    await this.minPriceInput.fill(minPrice !== undefined && minPrice !== null ? minPrice.toString() : "");
    await this.maxPriceInput.fill(maxPrice !== undefined && maxPrice !== null ? maxPrice.toString() : "");
    await this.closePopups();
    await this.submitPriceFilter.click();
    await this.page.waitForTimeout(2000);
  }

  async getProductCount() {
    const cards = await this.getProductCards();
    return cards.length;
  }

  async clickViewMore() {
    const selector = "#js-product-count";
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(2000);
  }
}

module.exports = SearchPage;
