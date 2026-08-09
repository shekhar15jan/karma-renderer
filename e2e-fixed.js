const puppeteer = require('puppeteer');

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
  console.log("Starting Full E2E Verification with AUTO mode...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost', { waitUntil: 'networkidle2' });
    console.log("Loaded homepage.");
    
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Bypass'));
      if (btn) btn.click();
    });
    console.log("Clicked Bypass.");
    await delay(3000);

    // Ensure we have a workspace
    await page.evaluate(() => {
      const wMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Workspaces'));
      if (wMenu) wMenu.click();
    });
    await delay(2000);
    
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      if (inputs.length > 0 && !inputs[0].value) {
          inputs[0].value = 'Auto Workspace';
          inputs[0].dispatchEvent(new Event('input'));
          const textareas = document.querySelectorAll('textarea');
          if (textareas.length > 0) {
              textareas[0].value = 'Auto Desc';
              textareas[0].dispatchEvent(new Event('input'));
          }
          const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Workspace'));
          if (createBtn) createBtn.click();
      }
    });
    await delay(2000);

    // Go to Dashboard
    await page.evaluate(() => {
      const dMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Dashboard'));
      if (dMenu) dMenu.click();
    });
    await delay(2000);

    // Open Mission Modal
    await page.evaluate(() => {
      const startBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Start Mission'));
      if (startBtns.length > 0) startBtns[startBtns.length - 1].click();
    });
    console.log("Opened Mission Modal.");
    await delay(2000);

    // Fill Mission Modal
    await page.evaluate(async () => {
      // 1. Select Workspace (first select)
      const selects = document.querySelectorAll('select');
      if (selects.length > 0 && selects[0].options.length > 1) {
          selects[0].selectedIndex = 1;
          selects[0].dispatchEvent(new Event('change'));
      }
    });
    await delay(1000);

    await page.evaluate(async () => {
      // 2. Click "Create a project in this workspace"
      const createProjBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create a project'));
      if (createProjBtn) createProjBtn.click();
    });
    await delay(1000);

    await page.evaluate(async () => {
      // 3. Fill New Project Name & Click Create
      const inputs = Array.from(document.querySelectorAll('input'));
      const projInput = inputs.find(i => i.placeholder && i.placeholder.includes('Channel Automation'));
      if (projInput) {
          projInput.value = 'Auto Project';
          projInput.dispatchEvent(new Event('input'));
          const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Create');
          if (createBtn) createBtn.click();
      }
    });
    await delay(2000);

    await page.evaluate(async () => {
      // 4. Fill Mission Name and Description
      const inputs = Array.from(document.querySelectorAll('input'));
      const missionInput = inputs.find(i => i.placeholder && i.placeholder.includes('Weekly Tech Roundup'));
      if (missionInput) {
          missionInput.value = 'E2E Test Video Mission';
          missionInput.dispatchEvent(new Event('input'));
      }

      const textareas = document.querySelectorAll('textarea');
      if (textareas.length > 0) {
          textareas[0].value = 'Create a short video explaining the E2E test';
          textareas[0].dispatchEvent(new Event('input'));
      }

      // 5. Select Mission Type = VIDEO
      const selects = document.querySelectorAll('select');
      if (selects.length > 2) {
          selects[2].value = 'VIDEO';
          selects[2].dispatchEvent(new Event('change'));
      }

      // 6. Set Mode to AUTO
      const autoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Auto') || b.innerText.includes('AUTO'));
      if (autoBtn) autoBtn.click();
    });
    await delay(1000);

    await page.screenshot({ path: 'verify-modal-filled.png' });

    await page.evaluate(async () => {
      // 7. Click Create Mission
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Mission'));
      if (createBtn) createBtn.click();
    });
    console.log("Clicked Create Mission.");
    await delay(5000);
    
    // Check if it's running in active mission dashboard
    let maxWait = 60; 
    while (maxWait > 0) {
        await delay(5000);
        const status = await page.evaluate(() => {
            const h3s = Array.from(document.querySelectorAll('h3')).filter(h => h.innerText.includes('Active Mission'));
            if (h3s.length > 0) {
                const parent = h3s[0].parentElement;
                if (parent && parent.innerText.includes('Status:')) {
                    if (parent.innerText.includes('COMPLETED')) return 'COMPLETED';
                    if (parent.innerText.includes('FAILED')) return 'FAILED';
                    if (parent.innerText.includes('IN_PROGRESS') || parent.innerText.includes('ACTIVE') || parent.innerText.includes('RUNNING')) return 'RUNNING';
                }
            }
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
