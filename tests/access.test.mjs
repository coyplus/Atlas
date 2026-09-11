import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access } from '../server/access.mjs';
const origin = 'https://atlas.example';
const pw = 'test-password-only',
  secret = 'test-secret-only';
const req = (path, options = {}) => new Request(origin + path, options);
test('all entry points and assets require access; absent configuration fails closed', async () => {
  for (const path of ['/', '/presentation/', '/assets/demo.js', '/scenarios.json'])
    assert.ok(await access(req(path), pw, secret));
  assert.equal((await access(req('/'), '', secret)).status, 503);
  const page = await access(
    req('/presentation/?p=sam', { headers: { accept: 'text/html' } }),
    pw,
    secret,
  );
  const html = await page.text();
  assert.match(html, /Enter the password/);
  assert.ok(!html.includes(pw));
});
test('correct login returns to the deep link; wrong, forged, expired and cross-origin attempts fail', async () => {
  const login = async (password, returnTo = '/presentation/#6', originHeader = origin) =>
    access(
      req('/_access', {
        method: 'POST',
        headers: { Origin: originHeader },
        body: new URLSearchParams({ password, returnTo }),
      }),
      pw,
      secret,
      1000,
    );
  assert.equal((await login('wrong')).status, 401);
  assert.equal((await login(pw, '/', 'https://other.example')).status, 403);
  const result = await login(pw);
  assert.equal(result.status, 303);
  assert.equal(result.headers.get('location'), '/presentation/#6');
  const cookie = result.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(await access(req('/', { headers: { cookie } }), pw, secret, 1001), null);
  assert.equal(
    (await access(req('/', { headers: { cookie } }), pw, secret, 1000 + 7 * 86400)).status,
    401,
  );
  assert.equal(
    (
      await access(
        req('/', { headers: { cookie: cookie.replace(/=\d+/, '=999999999') } }),
        pw,
        secret,
        1001,
      )
    ).status,
    401,
  );
  assert.equal((await login(pw, '//evil.example')).headers.get('location'), '/');
  assert.equal(
    (await access(req('/', { headers: { cookie } }), 'changed', secret, 1001)).status,
    401,
  );
});
