import QRCode from 'qrcode';
import fs from 'node:fs';
const url = process.argv[2];
if (!url || !/^https?:\/\//.test(url))
  throw new Error('Usage: npm run qr -- https://your-atlas-host.example/?p=jordan');
await QRCode.toFile('docs/phone-preview-qr.png', url, {
  width: 640,
  margin: 4,
  color: { dark: '#171919', light: '#ffffff' },
});
fs.writeFileSync('docs/phone-preview-url.txt', url + '\n');
console.log('QR saved to docs/phone-preview-qr.png for ' + url);
