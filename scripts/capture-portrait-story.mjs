import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const out = 'docs/screenshots/portrait-metrics';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const captures = [];
for (const width of [390, 430]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 932 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4174/?p=sam&theme=vanilla&tab=you');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => document.fonts.ready);
  const save = async (name) => {
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: `${out}/${name}.png` });
    captures.push(name);
  };
  const look = async (selector) => {
    await page
      .locator(selector)
      .first()
      .evaluate((el) => {
        el.closest('.sheet-body').scrollTop +=
          el.getBoundingClientRect().top -
          document.querySelector('.support-bar').getBoundingClientRect().bottom -
          20;
      });
    await page.waitForTimeout(220);
  };
  for (const person of ['sam', 'jordan', 'elena', 'alex']) {
    await page.evaluate((person) => {
      window.atlas.go(person, 'you');
      window.atlas.dispatch('portrait-story');
    }, person);
    await save(`${person}-${width}-metrics`);
    await look('[data-action="portrait-metric:allocation"]');
    await save(`${person}-${width}-allocation`);
    await look('[data-action="portrait-metric:timing"]');
    await save(`${person}-${width}-timing`);
    await page.evaluate(() => window.atlas.dispatch('portrait-metric:timing'));
    await save(`${person}-${width}-measurement`);
    await page.evaluate(() => {
      window.atlas.closeAll();
      window.atlas.dispatch('portrait');
    });
    await save(`${person}-${width}-explore`);
    await look('.ps-tile');
    await save(`${person}-${width}-interpretation`);
  }
  await page.evaluate(() => {
    window.atlas.go('elena', 'you');
    window.atlas.dispatch('member:aisha');
    window.atlas.dispatch('portrait-story');
  });
  await save(`aisha-${width}-shared`);
  await context.close();
}
await browser.close();
await fs.writeFile(
  `${out}/index.html`,
  `<!doctype html><meta charset="utf-8"><title>Explore and Behind the portrait</title><style>body{background:#e7e9eb;color:#171919;font:14px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}img{width:100%;border-radius:12px}h2{font-size:14px}a{color:inherit}</style><h1>Explore the interpretation. Inspect the measurements.</h1><main>${captures.map((name) => `<article><h2>${name}</h2><a href="${name}.png"><img loading="lazy" src="${name}.png"></a></article>`).join('')}</main>`,
);
console.log(`Captured ${captures.length} views.`);
