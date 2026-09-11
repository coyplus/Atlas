// Reproducible visual inventory. Runs only against an isolated local demo session.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2] || 'before';
const out = path.resolve('docs/audit/' + phase);
await fs.mkdir(out, { recursive: true });
// Refresh only an affected screen family while keeping the complete gallery.
const refresh = process.argv.find((arg) => arg.startsWith('--refresh='))?.split('=')[1];
const previous = refresh
  ? JSON.parse(await fs.readFile(path.join(out, 'inventory.json'), 'utf8'))
  : null;
const browser = await chromium.launch();
const compact = process.argv.includes('--compact');
const desktop = process.argv.includes('--desktop');
const large = process.argv.includes('--large');
const viewport = desktop
  ? { width: 1280, height: 980 }
  : large
    ? { width: 430, height: 932 }
    : compact
      ? { width: 320, height: 568 }
      : { width: 390, height: 844 };
const context = await browser.newContext({
  viewport,
  reducedMotion: 'reduce',
});
await context.addInitScript(() => {
  window.__ATLAS_TEST__ = true;
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:4174/?p=alex&theme=vanilla&tab=now');
await page.waitForFunction(() => !!window.atlas);
await page.evaluate(() => document.fonts.ready);
const initial = await page.evaluate(() => window.atlas.getState());
const dataset = JSON.parse(await fs.readFile('public/scenarios.json', 'utf8'));
const routes = [];
const add = (person, tab, name, actions = [], extra = {}) =>
  routes.push({ person, tab, name, actions, ...extra });
for (const [person, p] of Object.entries(initial.people)) {
  for (const tab of ['now', 'future', 'you']) add(person, tab, tab);
  for (const item of [...p.l1.accounts, ...p.l1.pots])
    add(person, 'now', 'container-' + item.id, [
      (p.l1.accounts.includes(item) ? 'account:' : 'pot:') + item.id,
    ]);
  for (const rule of p.l1.rules)
    add(person, 'now', 'rule-' + rule.id, ['container-rule:' + rule.id]);
  for (const action of [
    'collection',
    'gallery',
    'settings',
    'points',
    'membership',
    'portrait',
    'badges',
    'journey',
    'checkin-home',
    'receipts',
  ])
    add(person, action === 'collection' || action === 'gallery' ? 'now' : 'you', action, [action]);
  for (const month of [60, 120, 240]) add(person, 'future', 'future-' + month, [], { month });
  for (const drawer of ['docked', 'expanded'])
    add(person, 'future', 'future-' + drawer, [], { drawer });
  add(person, 'future', 'possibilities', ['future-add']);
}
for (const person of ['jordan', 'elena']) {
  for (const id of [
    'balance',
    'safespend',
    'afterbills',
    'eatingout',
    'cardusage',
    'groceryrhythm',
    'grocery',
    'subs',
    'dd',
    'cashback',
    'wealth',
    'investments',
    'ratio',
    'goldenratio',
    'safetydays',
    'freedom',
    'creditscore',
    'rateswatch',
    'spent',
    'whereitgoes',
  ])
    add(person, 'now', 'number-' + id, ['module:' + id]);
  for (const action of [
    'quick-more',
    'products',
    'statements',
    'cards',
    'pay',
    'transfer',
    'connect-bank',
    'rules',
    'quiz',
    'invite',
    'autonomy',
    'personality-correct',
    'now-background',
    'chat',
    'future-own',
    'future-assumptions',
    'future-speed',
  ])
    add(person, action.startsWith('future') ? 'future' : 'now', action, [action]);
  for (const tool of ['instinct', 'worth', 'ahead'])
    add(person, 'you', 'checkin-' + tool, ['checkin-tool:' + tool]);
  for (const tier of ['hsbc', 'premier', 'elite'])
    add(person, 'you', 'tier-' + tier, ['membership-tier:' + tier]);
  for (const benefit of dataset.shared.modules.benefits)
    add(person, 'you', 'benefit-' + benefit.id, ['benefit:' + benefit.id]);
}
for (const [person, pot] of [
  ['jordan', 'grocery-wallet'],
  ['sam', 'family-budget'],
  ['elena', 'fam'],
  ['jordan', 'house'],
]) {
  for (const detail of [
    'container-how',
    'container-agreement',
    'container-info',
    'container-more',
    'container-members',
    'container-rule-new',
  ])
    add(person, 'now', detail + '-' + pot, ['pot:' + pot, detail + ':' + pot]);
}
add('elena', 'future', 'make-it-mine', ['future-horizon:horizon-family-giving']);
add('sam', 'future', 'what-if-review', ['future-review'], { idea: true });
add('sam', 'now', 'pot-colours', ['pot:hol'], { palette: true });
add('sam', 'now', 'pot-photo', ['pot-personalise:hol']);
add('jordan', 'you', 'badge-empty', ['badge-filter:earned']);
add('elena', 'now', 'human', ['human']);

if (compact || desktop || large) {
  const picked = routes.filter((r) =>
    [
      'now',
      'future',
      'you',
      'future-expanded',
      'container-family-budget',
      'container-house',
      'container-inv',
      'membership',
      'portrait',
      'points',
      'pay',
      'checkin-home',
      'checkin-ahead',
      'make-it-mine',
      'pot-photo',
      'future-assumptions',
      'what-if-review',
    ].includes(r.name),
  );
  routes.splice(0, routes.length, ...picked);
}
const report = [];
for (const [index, r] of routes.entries()) {
  const key = String(index).padStart(3, '0') + '-' + r.person + '-' + r.name;
  if (refresh && !r.name.includes(refresh)) {
    const saved = previous.screens.find((screen) => screen.key === key);
    if (!saved) throw new Error(`No existing capture for ${key}; run a full inventory first.`);
    report.push(saved);
    continue;
  }
  try {
    await page.evaluate(
      ({ initial, r }) => {
        window.atlas.hydrate(structuredClone(initial));
        window.atlas.go(r.person, r.tab);
        if (r.month) window.atlas.setT(r.month);
        if (r.drawer) {
          const s = window.atlas.getState();
          s.people[r.person].ui.future.drawer = r.drawer;
          window.atlas.setT(s.month);
        }
        if (r.idea) document.querySelector('[data-action^="future-try:"]')?.click();
        for (const action of r.actions) window.atlas.dispatch(action);
        if (r.palette) document.querySelector('.pot-colour-control summary')?.click();
        document.querySelector('#content')?.scrollTo(0, 0);
      },
      { initial, r },
    );
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    if (r.name === 'now') await page.waitForTimeout(2100);
    await page.evaluate(() => document.activeElement?.blur());
    const evidence = await page.evaluate(() => {
      document.querySelectorAll('[data-audit-scroll]').forEach((e) => delete e.dataset.auditScroll);
      const phone = document.querySelector('#phone'),
        active =
          document.querySelector('.agreement-sheet') ||
          document.querySelector('#overlay > .sheet') ||
          document.querySelector('#content');
      const bounds = phone.getBoundingClientRect();
      const visible = (e) => {
        const r = e.getBoundingClientRect(),
          s = getComputedStyle(e);
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.bottom > bounds.top &&
          r.top < bounds.bottom &&
          s.visibility !== 'hidden' &&
          !e.closest('[inert],[hidden]')
        );
      };
      const smallTargets = [
        ...phone.querySelectorAll('button,input,select,summary,[role="button"]'),
      ]
        .filter(visible)
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width < 40 || r.height < 40;
        })
        .map((e) => ({
          label: e.getAttribute('aria-label') || e.textContent.trim().slice(0, 80),
          class: e.className,
          width: Math.round(e.getBoundingClientRect().width),
          height: Math.round(e.getBoundingClientRect().height),
        }));
      const smallText = [...active.querySelectorAll('p,small,label,dt,dd,b')]
        .filter(visible)
        .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 12)
        .map((e) => ({
          text: e.textContent.trim().slice(0, 100),
          size: getComputedStyle(e).fontSize,
          class: e.className,
        }));
      const scrollers = [active, ...active.querySelectorAll('*')].filter(
        (e) =>
          ['auto', 'scroll'].includes(getComputedStyle(e).overflowY) &&
          e.scrollHeight > e.clientHeight + 32 &&
          e.clientHeight > 60,
      );
      const scroller = scrollers.sort(
        (a, b) => b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight),
      )[0];
      if (scroller) scroller.dataset.auditScroll = 'true';
      return {
        title:
          document.querySelector('#dialog-title')?.textContent ||
          document.querySelector('.agreement-sheet h2')?.textContent ||
          window.atlas.getView().tab,
        text: active.innerText,
        smallTargets,
        smallText,
        overflow: active.scrollWidth > active.clientWidth + 1,
        scroll: scroller ? scroller.scrollHeight - scroller.clientHeight : 0,
        navHidden: document.querySelector('.tabbar').hidden,
      };
    });
    await page.screenshot({ path: path.join(out, key + '.png') });
    if (evidence.scroll > 250) {
      await page.locator('[data-audit-scroll]').evaluate((e) => {
        e.scrollTop = e.scrollHeight;
      });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      await page.screenshot({ path: path.join(out, key + '-bottom.png') });
    }
    report.push({ ...r, key, ...evidence });
  } catch (e) {
    report.push({ ...r, key, error: e.message });
  }
  if (index % 30 === 0) console.log(`${index + 1}/${routes.length} ${key}`);
}
await fs.writeFile(
  path.join(out, 'inventory.json'),
  JSON.stringify({ viewport, screens: report, errors }, null, 2),
);
const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
await fs.writeFile(
  path.join(out, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>Atlas ${phase} audit</title><style>body{margin:24px;background:#e7e9eb;color:#171919;font:14px system-ui}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px}article{min-width:0}img{width:100%;border-radius:12px}h2{font-size:14px}details{margin:8px 0}a{color:inherit}</style><h1>Atlas · ${phase} visual inventory</h1><p>${report.length} screen variants. Captured at ${viewport.width} × ${viewport.height}. Open an image to inspect at full size.</p><main>${report.map((r) => `<article><h2>${esc(r.key)} · ${esc(r.title || '')}</h2>${r.error ? `<p>${esc(r.error)}</p>` : `<a href="${r.key}.png"><img loading="lazy" src="${r.key}.png"></a>${r.scroll > 250 ? `<details><summary>Bottom of screen</summary><a href="${r.key}-bottom.png"><img loading="lazy" src="${r.key}-bottom.png"></a></details>` : ''}<details><summary>Copy and checks</summary><p>${esc(r.text)}</p><p>${r.smallTargets.length} small targets · ${r.smallText.length} small text samples · overflow ${r.overflow}</p></details>`}</article>`).join('')}</main>`,
);
console.log(
  JSON.stringify({
    screens: report.length,
    failures: report.filter((r) => r.error).map((r) => [r.key, r.error]),
    errors,
  }),
);
await browser.close();
