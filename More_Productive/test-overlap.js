import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1080 });
  await page.goto('http://localhost:5173');
  
  // Wait for React to render
  await page.waitForSelector('.timeline-task-block');
  
  // Try to use page.evaluate to add a duplicate task at 09:00 directly into localStorage
  await page.evaluate(() => {
     const data = localStorage.getItem('chrono_schedules_v1');
     if (data) {
       const parsed = JSON.parse(data);
       // find today's key
       const today = new Date();
       const y = today.getFullYear();
       const m = String(today.getMonth() + 1).padStart(2, '0');
       const d = String(today.getDate()).padStart(2, '0');
       const dateStr = `${y}-${m}-${d}`;
       const key = `u1_${dateStr}`;
       if (parsed[key]) {
         parsed[key].push({
           id: 'overlap_test',
           startTime: '09:00',
           endTime: '10:00',
           title: 'Overlapping Task',
           category: 'study'
         });
         localStorage.setItem('chrono_schedules_v1', JSON.stringify(parsed));
       }
     }
  });
  
  // Reload to see the changes
  await page.reload();
  await page.waitForSelector('.timeline-task-block');
  
  // take a screenshot of the timeline container
  const el = await page.$('.timeline-board-wrapper');
  await el.screenshot({ path: 'overlap_test.png' });
  
  await browser.close();
})();
