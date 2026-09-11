import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
const errors = [],
  vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));
const d = new JSDOM(fs.readFileSync('tests/fixtures/index.html', 'utf8'), {
  url: 'http://atlas.local/',
  runScripts: 'dangerously',
  virtualConsole: vc,
  beforeParse(w) {
    w.CSS = { escape: (x) => x };
  },
});
for (const a of process.argv.slice(2)) {
  const e = d.window.document.querySelector(`[data-action="${a}"]`);
  if (!e) {
    console.log('MISSING', a);
    break;
  }
  e.click();
  console.log(
    a,
    'TOAST',
    d.window.document.querySelector('#toast')?.textContent,
    'SHEET',
    d.window.document.querySelector('.sheet')?.textContent.slice(0, 230),
  );
}
console.log('ERRORS', errors);
console.log(
  'BUTTONS',
  [...d.window.document.querySelectorAll('.sheet [data-action],#support-dock [data-action]')].map(
    (e) => e.dataset.action,
  ),
);
d.window.close();
