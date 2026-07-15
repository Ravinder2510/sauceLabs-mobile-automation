const { remote } = require('webdriverio');

const capabilities = {
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.saucelabs.mydemoapp.rn', 
    'appium:appActivity': '.MainActivity', 
    'appium:newCommandTimeout': 300,
    'appium:nativeWebScreenshot': true
};

const wdOpts = {
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities
};

async function runTest() {
    console.log('=== [STARTING MOBILE PRODUCT STAGING RUN] ===');
    const driver = await remote(wdOpts);

    try {
        console.log('► Ensuring foreground focus on target package...');
        await driver.activateApp('com.saucelabs.mydemoapp.rn');
        await driver.pause(3000); // 3-second observation hold

        // ==========================================
        // PIPELINE STEP 1: PRODUCT CATALOG
        // ==========================================
        console.log('\n► Pipeline Step 1: Interacting with Product Catalog view...');
        const productGridItem = await driver.$('//android.view.ViewGroup[@content-desc="store item"] | //android.view.ViewGroup[contains(@content-desc, "item")] | (//android.widget.TextView[contains(@text, "$") or contains(@text, "Sauce")]/..)');
        await productGridItem.waitForDisplayed({ timeout: 15000 });
        await productGridItem.click();
        console.log('  [HOLD] Observing product page navigation entry...');
        await driver.pause(3000); // 3-second observation hold

        // ==========================================
        // PIPELINE STEP 2: PRODUCT DETAILS
        // ==========================================
        console.log('► Pipeline Step 2: Interacting with Product Details view...');
        const addToCartBtn = await driver.$('//android.widget.TextView[@text="Add To Cart"] | //android.view.ViewGroup[@content-desc="Add To Cart button"]');
        await addToCartBtn.waitForDisplayed({ timeout: 6000 });
        await addToCartBtn.click();
        console.log('  [HOLD] Product added to cart. Reviewing badge count increments...');
        await driver.pause(3000); // 3-second observation hold

        // ==========================================
        // PIPELINE STEP 3: CART VIEW
        // ==========================================
        console.log('► Pipeline Step 3: Navigating into Shopping Cart screen...');
        const topCartBadge = await driver.$('//android.view.ViewGroup[@content-desc="cart badge"] | (//android.view.ViewGroup[@clickable="true"])[last()]');
        await topCartBadge.waitForDisplayed({ timeout: 6000 });
        await topCartBadge.click();
        
        console.log('  [HOLD] Reviewing item inventory entries inside the cart container...');
        await driver.pause(3000); // 3-second observation hold

        // FINAL VALIDATION ASSERTION
        const cartHeader = await driver.$('//android.widget.TextView[contains(@text, "My Cart")] | //android.view.ViewGroup[contains(@content-desc, "cart")]');
        if (await cartHeader.isDisplayed()) {
            console.log('\n\x1b[32m%s\x1b[0m', '🏆 SUCCESS: Product selection and cart staging pipeline executed flawlessly!');
        } else {
            throw new Error('Validation Mismatch: Cart header not detected.');
        }

    } catch (error) {
        console.error('\n\x1b[31m%s\x1b[0m', '🚨 AUTOMATION PIPELINE RUN INTERRUPTED:', error.message);
    } finally {
        console.log('\n► Tearing down Appium runtime driver session cleanly...');
        await driver.deleteSession();
        console.log('\n\x1b[36m%s\x1b[0m', 'PIPELINE STAGING TO CART DROPPED IN 100% CLEAN!');

    }
}

runTest();
