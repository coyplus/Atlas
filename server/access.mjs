const COOKIE = '__Host-atlas-access';
const DAY = 86400;
const encoder = new TextEncoder();
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const hex = (bytes) =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function key(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}
async function equal(a, b) {
  const hash = async (s) =>
    new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(s)));
  const [x, y] = await Promise.all([hash(a), hash(b)]);
  return x.reduce((sum, v, i) => sum | (v ^ y[i]), 0) === 0;
}
export const retirementWorker = `self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil((async()=>{const keys=(await caches.keys()).filter(k=>k.startsWith('atlas-'));for(const k of keys)await caches.delete(k);await self.registration.unregister();if(keys.length)for(const c of await self.clients.matchAll({type:'window'}))c.navigate(c.url);})()));`;
const headers = {
  'Cache-Control': 'private, no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Type': 'text/html; charset=utf-8',
  'Referrer-Policy': 'same-origin',
};
function page(path, error = false, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private prototype</title><style>*{box-sizing:border-box}body{margin:0;background:#eff3f3;color:#191c1d;font:17px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100dvh;display:grid;place-items:center;padding:28px}main{width:100%;max-width:470px}h1{font-size:clamp(34px,8vw,45px);font-weight:400;line-height:1.1;letter-spacing:-1.5px;margin:0 0 20px}p{color:#5d6c70;margin:0 0 30px}label{display:block;font-size:15px;margin-bottom:8px}input{font:inherit;width:100%;border:1px solid #aab8bc;border-radius:12px;background:white;padding:16px}input:focus{outline:2px solid #487b93;outline-offset:3px}button{width:100%;padding:16px;border:0;border-radius:12px;background:#191c1d;color:white;font:inherit;margin-top:18px;cursor:pointer}.error{color:#b00020;font-size:15px;margin:12px 0 0}</style><main><h1>Private prototype</h1><p>Enter the password to explore the concept.</p><form method="post" action="/_access"><input type="hidden" name="returnTo" value="${escape(path)}"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="200" ${error ? 'aria-invalid="true" aria-describedby="error"' : ''}>${error ? '<p class="error" id="error" role="alert">That password isn’t right. Please try again.</p>' : ''}<button type="submit">Enter prototype</button></form></main><script>if(location.hash)document.querySelector('[name=returnTo]').value+=location.hash;</script></html>`,
    { status, headers },
  );
}
function safePath(raw) {
  if (
    typeof raw !== 'string' ||
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    /[\\\r\n]/.test(raw)
  )
    return '/';
  return raw.startsWith('/_access') ? '/' : raw;
}
export async function access(request, password, secret, now = Math.floor(Date.now() / 1000)) {
  const url = new URL(request.url);
  // This contains no application data and removes previously installed offline copies.
  if (url.pathname === '/sw.js')
    return new Response(retirementWorker, {
      headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store' },
    });
  if (!password || !secret)
    return new Response('Access is temporarily unavailable.', { status: 503, headers });
  const signingKey = await key(secret + '\0' + password);
  const cookie =
    request.headers
      .get('cookie')
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(COOKIE + '='))
      ?.slice(COOKIE.length + 1) || '';
  const [expiry, signature] = cookie.split('.');
  if (
    /^\d+$/.test(expiry || '') &&
    Number(expiry) > now &&
    Number(expiry) <= now + 7 * DAY &&
    /^[a-f0-9]{64}$/.test(signature || '')
  ) {
    const bytes = Uint8Array.from(signature.match(/../g), (s) => parseInt(s, 16));
    if (await crypto.subtle.verify('HMAC', signingKey, bytes, encoder.encode(expiry))) return null;
  }
  if (url.pathname === '/_access' && request.method === 'POST') {
    if (request.headers.get('origin') !== url.origin)
      return new Response('Request not allowed.', { status: 403, headers });
    if (Number(request.headers.get('content-length')) > 4096)
      return new Response('Request too large.', { status: 413, headers });
    let form;
    try {
      form = await request.formData();
    } catch {
      return page('/', true, 400);
    }
    const returnTo = safePath(form.get('returnTo'));
    const supplied = form.get('password');
    if (
      typeof supplied === 'string' &&
      supplied.length <= 200 &&
      (await equal(supplied, password))
    ) {
      const expires = String(now + 7 * DAY);
      const signed = hex(await crypto.subtle.sign('HMAC', signingKey, encoder.encode(expires)));
      return new Response(null, {
        status: 303,
        headers: {
          ...headers,
          Location: returnTo,
          'Set-Cookie': `${COOKIE}=${expires}.${signed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * DAY}`,
        },
      });
    }
    return page(returnTo, true, 401);
  }
  if (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html'))
    return page(safePath(url.pathname + url.search));
  return new Response('Password required.', { status: 401, headers });
}
