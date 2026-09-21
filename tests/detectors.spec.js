import { test } from '@playwright/test';
import detectors from '../detectors/index.js';

// Informational harness: each test runs one detection method inside a real page and
// records the outcome for the report. Tests never fail on the detection result —
// only on a detector throwing or the page failing to load.
for (const detector of detectors) {
  test(detector.id, async ({ page }, testInfo) => {
    await page.goto('/live.html?norun');
    // Import the detector inside the page so injection-artifact methods
    // (stack traces, bindings) observe a genuine Playwright evaluation environment.
    const result = await page.evaluate(async (id) => {
      const all = (await import('./detectors/index.js')).default;
      const d = all.find((x) => x.id === id);
      try {
        return await d.detect();
      } catch (err) {
        return { detected: null, details: `Detector threw: ${err.message}`, error: true };
      }
    }, detector.id);

    await testInfo.attach('result', {
      contentType: 'application/json',
      body: JSON.stringify({ id: detector.id, ...result }),
    });
    // Surface the outcome in the runner output without asserting on it.
    console.log(`[${testInfo.project.name}] ${detector.id}: detected=${result.detected} — ${result.details}`);
  });
}
