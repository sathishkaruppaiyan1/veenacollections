import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, '.tmp', 'site-audit');
const screenshotDir = path.join(outDir, 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = 'https://theveenacollections.com/';

const routes = [
  ['Home', ''],
  ['Shop', '?view=shop'],
  ['Categories', '?view=categories'],
  ['Deal', '?view=deal'],
  ['Rent', '?view=rent'],
  ['Cart', '?view=cart'],
  ['Wishlist', '?view=wishlist'],
  ['Checkout', '?view=checkout'],
  ['Track Order', '?view=track-order'],
  ['Account/Login', '?view=account'],
  ['Register', '?view=register'],
  ['Cookie Policy', '?view=cookie-policy'],
  ['Thank You', '?view=thank-you'],
  ['About Us', '?view=page&param=about-us'],
  ['Contact', '?view=page&param=contact'],
  ['Shipping Policy', '?view=page&param=shipping-policy'],
  ['Refunds Returns', '?view=page&param=refund_returns'],
  ['Rental Policy', '?view=page&param=rental-policy'],
  ['Privacy Policy', '?view=page&param=privacy-policy'],
  ['Product Detail', '?view=product&id=2366'],
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, ua: null },
  {
    name: 'mobile',
    width: 390,
    height: 844,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
];

const quickScreenshotOnly = process.argv.includes('--quick');

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function httpStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return { status: res.status, finalUrl: res.url, ok: res.ok };
  } catch (error) {
    return { status: 0, finalUrl: url, ok: false, error: error.message };
  }
}

function dumpPage(url, routeName, viewport) {
  const name = `${slugify(routeName)}-${viewport.name}`;
  const screenshot = path.join(screenshotDir, `${name}.png`);
  const profile = path.join(outDir, `chrome-profile-${name}`);
  if (existsSync(profile)) rmSync(profile, { recursive: true, force: true });

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-gpu-sandbox',
    '--disable-software-rasterizer',
    '--disable-features=VizDisplayCompositor,UseSkiaRenderer',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-background-networking',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--user-data-dir=${profile}`,
    `--window-size=${viewport.width},${viewport.height}`,
    '--force-device-scale-factor=1',
    quickScreenshotOnly ? '--timeout=10000' : '--virtual-time-budget=6000',
    `--screenshot=${screenshot}`,
  ];
  if (!quickScreenshotOnly) args.push('--dump-dom');
  if (viewport.ua) args.push(`--user-agent=${viewport.ua}`);
  args.push(url);

  let dom = '';
  let error = '';
  try {
    dom = execFileSync(chrome, args, {
      encoding: 'utf8',
      timeout: 18000,
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (err) {
    dom = err.stdout?.toString() || '';
    error = err.stderr?.toString() || err.message;
  }

  const screenshotBytes = existsSync(screenshot) ? statSync(screenshot).size : 0;
  const bodyText = dom.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = bodyText.toLowerCase();
  const flags = [];
  if (!quickScreenshotOnly && !dom.includes('id="root"')) flags.push('root-missing');
  if (!quickScreenshotOnly && bodyText.length < 500) flags.push('very-short-render');
  if (screenshotBytes < 15000) flags.push('small-screenshot');
  if (lower.includes('could not be loaded')) flags.push('page-load-message');
  if (lower.includes('404') || lower.includes('not found')) flags.push('not-found-text');
  if (lower.includes('application error') || lower.includes('runtime error')) flags.push('app-error-text');
  if (/loading\.\.\.|loading…/.test(lower) && bodyText.length < 2000) flags.push('stuck-loading-possible');

  return {
    viewport: viewport.name,
    screenshot: path.relative(root, screenshot),
    screenshotBytes,
    textLength: bodyText.length,
    title: (dom.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim(),
    h1: (dom.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    flags,
    chromeError: error ? error.split(/\r?\n/).filter(Boolean).slice(0, 4) : [],
  };
}

const batch = process.argv[2] || '';
const selectedRoutes = batch
  ? routes.filter((_, index) => {
      const [start, end] = batch.split('-').map(Number);
      return index + 1 >= start && index + 1 <= end;
    })
  : routes;

const results = [];

for (const [routeName, routePath] of selectedRoutes) {
  const url = new URL(routePath, base).toString();
  const status = await httpStatus(url);
  const checks = [];
  for (const viewport of viewports) {
    checks.push(dumpPage(url, routeName, viewport));
  }
  results.push({ routeName, url, status, checks });
  console.log(`${routeName}: HTTP ${status.status} | ${checks.map(c => `${c.viewport}:${c.flags.length ? c.flags.join(',') : 'ok'}`).join(' | ')}`);
}

writeFileSync(path.join(outDir, 'audit-results.json'), JSON.stringify(results, null, 2));

const summary = results.map(r => {
  const problems = r.checks.flatMap(c => c.flags.map(f => `${c.viewport}:${f}`));
  return {
    page: r.routeName,
    url: r.url,
    http: r.status.status,
    desktop: r.checks.find(c => c.viewport === 'desktop')?.flags.join(', ') || 'ok',
    mobile: r.checks.find(c => c.viewport === 'mobile')?.flags.join(', ') || 'ok',
    h1: r.checks.find(c => c.viewport === 'desktop')?.h1 || '',
    screenshotDesktop: r.checks.find(c => c.viewport === 'desktop')?.screenshot || '',
    screenshotMobile: r.checks.find(c => c.viewport === 'mobile')?.screenshot || '',
    problems: problems.join('; '),
  };
});

writeFileSync(path.join(outDir, 'audit-summary.json'), JSON.stringify(summary, null, 2));
console.log(`\nWrote ${path.join(outDir, 'audit-summary.json')}`);
