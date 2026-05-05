const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE UNCAUGHT ERROR:', err.toString());
  });

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  } catch (e) {
    console.log('GOTO ERROR:', e.toString());
  }

  await browser.close();
})();
