const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to home...');
  await page.goto('https://www.anphatpc.com.vn', { waitUntil: 'domcontentloaded' });
  
  console.log('Searching for "RTX"...');
  await page.fill('input#js-search', 'RTX');
  
  // Wait for search button and click
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button.submit-search')
  ]);
  
  console.log('Search page title:', await page.title());
  console.log('Search page URL:', page.url());

  // Let's find classes of products
  const productClasses = await page.evaluate(() => {
    // Look at elements containing products
    // We can list some typical item class names or examine the DOM of the main product container
    const classes = new Set();
    document.querySelectorAll('*').forEach(el => {
      if (el.className && typeof el.className === 'string') {
        const cls = el.className.split(/\s+/);
        cls.forEach(c => {
          if (c.startsWith('p-') || c.includes('product') || c.includes('item')) {
            classes.add(c);
          }
        });
      }
    });
    return Array.from(classes);
  });
  console.log('Product-related classes found on search results page:', productClasses.slice(0, 30));

  // Let's get actual product elements
  const productElements = await page.evaluate(() => {
    // Try to find elements representing products
    const selectors = ['.p-item', '.product-item', '.item', '.p-container', '.product-list'];
    const results = {};
    selectors.forEach(sel => {
      results[sel] = document.querySelectorAll(sel).length;
    });
    return results;
  });
  console.log('Matches for typical selectors:', productElements);

  // Let's print out the text of some headers or product names
  const productNames = await page.evaluate(() => {
    // Usually titles are in h3 or h2 or a with class containing name/title
    return Array.from(document.querySelectorAll('h3, h2, a')).map(el => {
      const cls = el.className || '';
      const text = el.innerText.trim();
      if (text.length > 5 && (cls.includes('title') || cls.includes('name') || el.tagName === 'H3')) {
        return { tag: el.tagName, class: cls, text };
      }
      return null;
    }).filter(Boolean).slice(0, 10);
  });
  console.log('Sample product names/titles found:', productNames);

  await page.screenshot({ path: 'search-results.png' });
  await browser.close();
})();
