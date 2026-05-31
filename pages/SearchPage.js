const BasePage = require('./BasePage');

class SearchPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = 'input#js-search';
    this.searchButton = 'button.submit-search';
    
    // We target product links inside search results. 
    // From our inspection, 'product-list-container' or 'p-list-container' and 'col-item' are present.
    // Usually, a product item is a div with class containing 'col-item' or 'item' inside the listing container,
    // and the product name is an anchor tag or heading.
    this.productNameLinks = '.col-item a, .p-list-container a';
  }

  async search(keyword) {
    await this.page.fill(this.searchInput, keyword);
    await this.page.click(this.searchButton);
    
    // Chờ URL chuyển hướng đến trang tìm kiếm
    await this.page.waitForURL(url => url.pathname.includes('/tim') || url.search.includes('q='), { timeout: 10000 }).catch(() => {});
    // Chờ container chứa sản phẩm xuất hiện trong DOM
    await this.page.waitForSelector('.p-list-container, .product-list-container, #js-product-list', { state: 'attached', timeout: 5000 }).catch(() => {});
  }

  async getProductNames() {
    // Get all product name links on the search result page scoped to the product list container
    return await this.page.evaluate(() => {
      // Find the main listing container on An Phat PC
      const container = document.querySelector('.p-list-container, .product-list-container, #js-product-list');
      if (!container) return [];

      const links = Array.from(container.querySelectorAll('a'));
      const productLinks = links.filter(l => {
        const href = l.href || '';
        const text = l.innerText ? l.innerText.trim() : '';
        // Product links typically end with .html, are not filters, and have name text
        return href.endsWith('.html') && 
               !href.includes('?filter=') && 
               !href.includes('cart') && 
               text.length > 12;
      });
      
      // Get unique product titles
      const uniqueNames = [...new Set(productLinks.map(l => l.innerText.trim()))];
      return uniqueNames.filter(name => name.length > 0);
    });
  }
}

module.exports = SearchPage;
