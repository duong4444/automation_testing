class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.closePopups();
  }

  async getTitle() {
    return await this.page.title();
  }

  async closePopups() {
    // Hide promotional banner popups if they exist to prevent them from intercepting click events
    await this.page.evaluate(() => {
      const selectors = ['.global-banner-popup-container', '.bg-popup', '.ads-popup'];
      selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
          el.style.display = 'none';
        }
      });
    }).catch(() => {});
  }
}

module.exports = BasePage;
