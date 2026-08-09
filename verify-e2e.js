const puppeteer = require('puppeteer');
const fs = require('fs');


async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
  console.log("Starting Full E2E Verification with AUTO mode...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    fs.writeFileSync('test-source.md', '# UI E2E Test\nThis is a test document uploaded from the frontend UI.');

    await page.goto('http://localhost', { waitUntil: 'networkidle2' });
    console.log("Loaded homepage.");
    
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Bypass'));
      if (btn) btn.click();
    });
    console.log("Clicked Bypass.");
    await delay(3000);

    // Create workspace if needed
    await page.evaluate(() => {
      const wMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Workspaces'));
      if (wMenu) wMenu.click();
    });
    await delay(2000);
    
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      const textareas = document.querySelectorAll('textarea');
      if (inputs.length > 0) {
          inputs[0].value = 'Auto Workspace';
          inputs[0].dispatchEvent(new Event('input'));
      }
      if (textareas.length > 0) {
          textareas[0].value = 'Auto Desc';
          textareas[0].dispatchEvent(new Event('input'));
      }
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Workspace'));
      if (createBtn) createBtn.click();
    });
    await delay(2000);

    await page.evaluate(() => {
      const dMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Dashboard'));
      if (dMenu) dMenu.click();
    });
    await delay(2000);

    await page.evaluate(() => {
      const startMissionBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Start Mission'));
      if (startMissionBtn) startMissionBtn.click();
    });
    console.log("Opened Mission Modal.");
    await delay(1000);

    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs.length > 0) {
        inputs[0].value = 'Puppeteer Auto Mission';
        inputs[0].dispatchEvent(new Event('input'));
      }
    });

    await page.evaluate(() => {
      const newProjBtn = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('+ New'));
      if (newProjBtn) newProjBtn.click();
    });
    await delay(1000);
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs.length > 1) {
          inputs[1].value = 'Auto Project';
          inputs[1].dispatchEvent(new Event('input'));
      }
      const createProjBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Project'));
      if (createProjBtn) createProjBtn.click();
    });
    await delay(2000);

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile('test-source.md');
        console.log("Uploaded test-source.md");
    } else {
        console.log("File input not found!");
    }

    // Set AUTO mode
    await page.evaluate(() => {
        const select = document.querySelector('select[name="runMode"]') || document.querySelectorAll('select')[0]; // Adjust if multiple selects
        if (select) {
            select.value = 'AUTO';
            select.dispatchEvent(new Event('change'));
            console.log("Set Run Mode to AUTO");
        }
    });

    await page.evaluate(() => {
      const createRunBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create & Run'));
      if (createRunBtn) createRunBtn.click();
    });
    console.log("Clicked Create & Run. Waiting for mission to start...");
    await delay(5000);
    
    // Check if it's running. Navigate to Executions tab.
    await page.evaluate(() => {
        const eMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Executions'));
        if (eMenu) eMenu.click();
    });
    console.log("Checking Executions view...");
    
    // Poll UI for completion
    let maxWait = 60; // 60 * 5s = 5 minutes max
    while (maxWait > 0) {
        await delay(5000);
        const status = await page.evaluate(() => {
            // Find the most recent execution status badge
            const badges = Array.from(document.querySelectorAll('.badge, span'));
            const comp = badges.find(b => b.innerText.includes('COMPLETED'));
            const run = badges.find(b => b.innerText.includes('RUNNING'));
            const fail = badges.find(b => b.innerText.includes('FAILED'));
            if (fail) return 'FAILED';
            if (comp) return 'COMPLETED';
            if (run) return 'RUNNING';
            return 'UNKNOWN';
        });
        console.log(`Current Status: ${status}`);
        if (status === 'COMPLETED' || status === 'FAILED') break;
        maxWait--;
    }

    await page.screenshot({ path: 'verify-final.png', fullPage: true });
    console.log("Check verify-final.png for results.");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
})();
