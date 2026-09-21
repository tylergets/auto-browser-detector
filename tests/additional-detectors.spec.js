import { test, expect } from '@playwright/test';

const runDetector = (page, id) => page.evaluate(async (id) => {
  const { default: detectors } = await import('./detectors/index.js');
  return detectors.find((detector) => detector.id === id).detect();
}, id);

test.beforeEach(async ({ page }) => {
  await page.goto('/live.html?norun');
});

test('Selenium attributes include empty-valued markers', async ({ page }) => {
  expect((await runDetector(page, 'selenium-attributes')).detected).toBe(false);
  await page.evaluate(() => document.documentElement.setAttribute('webdriver', ''));
  expect((await runDetector(page, 'selenium-attributes')).detected).toBe(true);
});

test('empty languages are flagged; unavailable languages are not applicable', async ({ page }) => {
  expect((await runDetector(page, 'navigator-languages')).detected).toBe(false);
  await page.evaluate(() => Object.defineProperty(navigator, 'languages', { value: [], configurable: true }));
  expect((await runDetector(page, 'navigator-languages')).detected).toBe(true);
  await page.evaluate(() => Object.defineProperty(navigator, 'languages', { value: undefined }));
  expect((await runDetector(page, 'navigator-languages')).detected).toBe(null);
});

test('plugin integrity accepts native lists and catches array replacements', async ({ page }) => {
  expect((await runDetector(page, 'plugin-integrity')).detected).toBe(false);
  await page.evaluate(() => Object.defineProperty(navigator, 'plugins', { value: Array.from(navigator.plugins) }));
  expect((await runDetector(page, 'plugin-integrity')).detected).toBe(true);
});

test('navigator overrides flag a hidden webdriver property', async ({ page }) => {
  expect((await runDetector(page, 'navigator-overrides')).detected).toBe(false);
  await page.evaluate(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  expect((await runDetector(page, 'navigator-overrides')).detected).toBe(true);
});

test('worker comparison catches page-only user agent patches', async ({ page }) => {
  const baseline = await runDetector(page, 'worker-navigator');
  expect(baseline.detected).not.toBe(null);
  expect(baseline.details).not.toContain('userAgent: page=');
  await page.evaluate(() => Object.defineProperty(navigator, 'userAgent', { value: 'Patched browser' }));
  const result = await runDetector(page, 'worker-navigator');
  expect(result.detected).toBe(true);
  expect(result.details).toContain('userAgent:');
});

test('blocked workers are not applicable', async ({ page }) => {
  await page.evaluate(() => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "worker-src 'none'";
    document.head.append(meta);
  });
  expect((await runDetector(page, 'worker-navigator')).detected).toBe(null);
});
