const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { startServer } = require('./app');

async function runTest() {
  const host = '127.0.0.1';
  const port = 8888;

  // Start your Node server
  const server = startServer(port, host);

  let driver;

  try {
    // 🔥 Chrome options for Jenkins (VERY IMPORTANT)
    const options = new chrome.Options();
    options.addArguments('--headless=new');          // Run without GUI
    options.addArguments('--no-sandbox');            // Required in Jenkins/Linux
    options.addArguments('--disable-dev-shm-usage'); // Prevent crashes
    options.addArguments('--disable-gpu');
    options.addArguments('--remote-debugging-port=9222');

    // 🔥 Use correct ChromeDriver path
    const service = new chrome.ServiceBuilder('/usr/local/bin/chromedriver');

    // Build driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeService(service)
      .setChromeOptions(options)
      .build();

    // Open app
    await driver.get(`http://${host}:${port}`);

    // Wait for result element
    const resultElement = await driver.wait(
      until.elementLocated(By.id('result')),
      10000
    );

    // Get text
    const text = await resultElement.getText();

    // Assertion
    assert.strictEqual(text, 'Sum is: 5');

    console.log('✅ Selenium Test Passed');

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;

  } finally {
    if (driver) {
      await driver.quit();
    }

    // Properly close server
    await new Promise((resolve) => server.close(resolve));
  }
}

runTest();
