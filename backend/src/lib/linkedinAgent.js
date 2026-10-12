const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function findLeads(sessionCookie, searchQuery) {
  const browser = await puppeteer.launch({ 
    headless: "new", // Run in background
    args: ['--no-sandbox'] 
  });
  
  const page = await browser.newPage();

  // 1. Authenticate using your real session
  await page.setCookie({
    name: 'li_at',
    value: sessionCookie,
    domain: '.www.linkedin.com'
  });

  // 2. Search for posts about "Booking Agents" or "Music Submissions"
  const url = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(searchQuery)}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  // 3. Extract lead data (Names and Post content)
  const leads = await page.evaluate(() => {
    const posts = document.querySelectorAll('.entity-result__item');
    return Array.from(posts).map(post => ({
      author: post.querySelector('.app-aware-link')?.innerText,
      text: post.querySelector('.break-words')?.innerText,
      link: post.querySelector('.app-aware-link')?.href
    }));
  });

  await browser.close();
  return leads;
}

module.exports = { findLeads };