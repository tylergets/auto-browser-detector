import { test, expect } from '@playwright/test';

const runDetector = (page, id) => page.evaluate(async (id) => {
  const { default: detectors } = await import('./detectors/index.js');
  return detectors.find((detector) => detector.id === id).detect();
}, id);

test.beforeEach(async ({ page }) => {
  await page.goto('/live.html?norun');
});

for (const id of ['cross-realm-functions', 'getter-receiver', 'iframe-fingerprint', 'canvas-readback']) {
  test(`${id} accepts unmodified browser APIs`, async ({ page }) => {
    const result = await runDetector(page, id);
    expect(result.detected, result.details).toBe(false);
    expect(await page.locator('iframe').count()).toBe(0);
  });
}

test('fresh-realm inspection catches a wrapper hidden by patched toString', async ({ page }) => {
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toDataURL;
    const originalToString = Function.prototype.toString;
    const wrapper = function (...args) { return Reflect.apply(original, this, args); };
    const maskedToString = function () {
      if (this === wrapper) return originalToString.call(original);
      if (this === maskedToString) return originalToString.call(originalToString);
      return originalToString.call(this);
    };
    HTMLCanvasElement.prototype.toDataURL = wrapper;
    Function.prototype.toString = maskedToString;
  });
  expect((await runDetector(page, 'function-tostring')).detected).toBe(false);
  const result = await runDetector(page, 'cross-realm-functions');
  expect(result.detected).toBe(true);
  expect(result.details).toContain('Canvas.toDataURL: source differs');
  expect(await page.locator('iframe').count()).toBe(0);
});

test('receiver checks catch a native-looking Proxy getter', async ({ page }) => {
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
    Object.defineProperty(Navigator.prototype, 'webdriver', {
      ...descriptor,
      get: new Proxy(descriptor.get, { apply: () => false }),
    });
  });
  expect((await runDetector(page, 'function-tostring')).detected).toBe(false);
  const result = await runDetector(page, 'getter-receiver');
  expect(result.detected).toBe(true);
  expect(result.details).toContain('webdriver: accepted plain object');
});

test('receiver checks accept a forwarding Proxy that preserves native validation', async ({ page }) => {
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
    Object.defineProperty(Navigator.prototype, 'webdriver', {
      ...descriptor,
      get: new Proxy(descriptor.get, {
        apply(target, receiver, args) {
          Reflect.apply(target, receiver, args);
          return false;
        },
      }),
    });
  });
  expect((await runDetector(page, 'getter-receiver')).detected).toBe(false);
  // The behavior is preserved, but a fresh realm can still reveal this Proxy's source shape.
  expect((await runDetector(page, 'cross-realm-functions')).detected).toBe(true);
});

test('frame comparison catches prototype patches missed by instance checks', async ({ page }) => {
  await page.evaluate(() => {
    const cores = navigator.hardwareConcurrency;
    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
      configurable: true,
      get: () => cores + 1,
    });
  });
  expect((await runDetector(page, 'navigator-overrides')).detected).toBe(false);
  const result = await runDetector(page, 'iframe-fingerprint');
  expect(result.detected).toBe(true);
  expect(result.details).toContain('hardwareConcurrency:');
  expect(await page.locator('iframe').count()).toBe(0);
});

test('unavailable reference realms report n/a and remove their iframes', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', { get: () => null });
  });
  for (const id of ['cross-realm-functions', 'iframe-fingerprint']) {
    expect((await runDetector(page, id)).detected).toBe(null);
    expect(await page.locator('iframe').count()).toBe(0);
  }
});

test('canvas comparison catches stable noise, not just changing reads', async ({ page }) => {
  await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      const image = Reflect.apply(original, this, args);
      image.data[0] ^= 1;
      return image;
    };
  });
  const result = await runDetector(page, 'canvas-readback');
  expect(result.detected).toBe(true);
  expect(result.details).toContain('1 changed on readback, 0 changed between reads');
});

test('blocked canvas access reports n/a', async ({ page }) => {
  await page.evaluate(() => {
    CanvasRenderingContext2D.prototype.getImageData = () => {
      throw new DOMException('Canvas access blocked', 'SecurityError');
    };
  });
  expect((await runDetector(page, 'canvas-readback')).detected).toBe(null);
});
