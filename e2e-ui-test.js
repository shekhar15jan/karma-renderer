const puppeteer = require('puppeteer');
const fs = require('fs');

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
  console.log("Starting UI E2E test with File Upload...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
      // ignore tailwind warning
      if (msg.text().includes('tailwindcss.com')) return;
      console.log('PAGE LOG:', msg.text());
  });
  page.on('requestfailed', request => {
    // console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    // 1. Create a dummy test file
    fs.writeFileSync('test-source.md', '# UI E2E Test\nThis is a test document uploaded from the frontend UI.');

    // 2. Load page
    await page.goto('http://localhost', { waitUntil: 'networkidle2' });
    console.log("Loaded homepage.");
    
    // 3. Login
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Bypass'));
      if (btn) btn.click();
    });
    console.log("Clicked Bypass.");
    await delay(2000);

    // 4. If Workspaces is empty, we need to create one first.
    // The test might run on a fresh DB, or an existing one. 
    // Let's navigate to Workspaces and create one just in case.
    await page.evaluate(() => {
      const wMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Workspaces'));
      if (wMenu) wMenu.click();
    });
    await delay(2000);
    
    // Create workspace
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      const textareas = document.querySelectorAll('textarea');
      if (inputs.length > 0) {
          inputs[0].value = 'E2E Workspace';
          inputs[0].dispatchEvent(new Event('input'));
      }
      if (textareas.length > 0) {
          textareas[0].value = 'E2E Desc';
          textareas[0].dispatchEvent(new Event('input'));
      }
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Workspace'));
      if (createBtn) createBtn.click();
    });
    console.log("Attempted to create Workspace (might already exist).");
    await delay(2000);

    // 5. Back to Dashboard
    await page.evaluate(() => {
      const dMenu = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Dashboard'));
      if (dMenu) dMenu.click();
    });
    await delay(2000);

    // 6. Click Start Mission
    await page.evaluate(() => {
      const startMissionBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Start Mission'));
      if (startMissionBtn) startMissionBtn.click();
    });
    console.log("Clicked Start Mission.");
    await delay(1000);
    await page.screenshot({ path: 'ui-modal-opened.png', fullPage: true });

    // 7. Fill out modal (Name)
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs.length > 0) {
        inputs[0].value = 'Puppeteer UI E2E Mission';
        inputs[0].dispatchEvent(new Event('input'));
      }
    });

    // We must create a project if one doesn't exist
    // Click "+ New" next to project
    await page.evaluate(() => {
      const newProjBtn = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('+ New'));
      if (newProjBtn) newProjBtn.click();
    });
    await delay(1000);
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      // The second input might be the new project name
      if (inputs.length > 1) {
          inputs[1].value = 'E2E Project';
          inputs[1].dispatchEvent(new Event('input'));
      }
      const createProjBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Project'));
      if (createProjBtn) createProjBtn.click();
    });
    console.log("Created Project.");
    await delay(2000);

    // 8. Upload File
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile('test-source.md');
        console.log("Uploaded test-source.md");
    } else {
        console.log("File input not found!");
    }

    // 9. Click Create & Run
    await page.evaluate(() => {
      const createRunBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create & Run'));
      if (createRunBtn) createRunBtn.click();
    });
    console.log("Clicked Create & Run.");
    await delay(3000);
    
    await page.screenshot({ path: 'ui-test-final.png', fullPage: true });
    console.log("Check ui-test-final.png for results.");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
})();
