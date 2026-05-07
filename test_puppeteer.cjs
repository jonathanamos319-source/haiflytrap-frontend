const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:5174/test.html");
  await page.waitForSelector(".cart-btn");
  await page.screenshot({path: "test1.png"});
  await page.click(".cart-btn");
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: "test2.png"});
  await browser.close();
})();
