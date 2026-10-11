/**
 * The PNG icons of the PWA, rendered from assets/icon.svg by the same headless
 * Chrome the tests use — no ImageMagick. `npm run icons` after changing the SVG.
 *
 * The maskable icon and Apple's touch icon get the background edge to edge:
 * the system cuts its own shape out of them, and the maskable one keeps the
 * drawing inside the middle 80%, the part every shape leaves.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CHROME, startChrome } from './chrome.mjs';
import { root } from './load.mjs';

if (!CHROME) {
  console.error('No Chrome found — set CHROME=/path/to/chrome.');
  process.exit(1);
}

const svg = await readFile(join(root, 'assets', 'icon.svg'), 'utf8');
// The same drawing on a square background, scaled into the safe zone when asked.
const square = (scale) =>
  svg
    .replace(/<rect width="512" height="512" rx="112"/, '<rect width="512" height="512" rx="0"')
    .replace('<g>', `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">`);

const targets = [
  ['pwa/icon-192.png', 192, svg],
  ['pwa/icon-512.png', 512, svg],
  ['pwa/icon-maskable-512.png', 512, square(0.8)],
  ['pwa/apple-touch-icon.png', 180, square(0.92)],
];

const chrome = await startChrome();
try {
  const [tab] = (await chrome.targets()).filter((t) => t.type === 'page');
  const s = await chrome.attach(tab.targetId, 'icons');
  await chrome.send('Page.enable', {}, s);
  await chrome.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, s);
  for (const [name, size, source] of targets) {
    await chrome.send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false }, s);
    const html = `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`;
    await chrome.send('Page.navigate', { url: `data:text/html;base64,${Buffer.from(html).toString('base64')}` }, s);
    await chrome.until(s, `document.readyState === 'complete' && !!document.querySelector('svg')`);
    const { data } = await chrome.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } }, s);
    await writeFile(join(root, 'assets', name), Buffer.from(data, 'base64'));
    console.log(`assets/${name} ${size}×${size}`);
  }
} finally {
  await chrome.close();
}
