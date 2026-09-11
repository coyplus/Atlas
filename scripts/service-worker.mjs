import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (!p.endsWith('.map') && !p.endsWith('/sw.js')) files.push(p);
  }
}
walk('dist');
const digest = crypto.createHash('sha256');
for (const p of files.sort()) digest.update(fs.readFileSync(p));
const version = digest.digest('hex').slice(0, 16),
  urls = files.map((p) => '/' + p.slice(5));
fs.writeFileSync(
  'dist/sw.js',
  `const CACHE='atlas-${version}';const FILES=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('atlas-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET')return;if(event.request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match('/index.html'))||fetch(event.request)));return;}if(!FILES.includes(url.pathname))return;event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(url.pathname))||fetch(event.request)));});
`,
);
console.log('Offline shell and ' + urls.length + ' assets, release ' + version);
