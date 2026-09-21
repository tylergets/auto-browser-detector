export default {
  id: 'playwright-bindings',
  name: 'Automation globals on window/document',
  category: 'injection',
  description:
    'Automation frameworks leave named artifacts in the page: Playwright init scripts and exposed bindings ' +
    '(__playwright*, __pw*), Puppeteer utility world markers, Selenium/ChromeDriver document keys ' +
    '($cdc_..., $wdc_), and legacy webdriver IDE globals. Enumerating window and document keys for these ' +
    'names is a staple of commercial bot-detection scripts.',
  async detect() {
    const patterns = [
      /^__playwright/i,
      /^__pw_/i,
      /^__pwInitScripts$/i,
      /^__puppeteer/i,
      /^\$cdc_/,
      /^\$wdc_/,
      /^__driver_/,
      /^__webdriver_/,
      /^__selenium_/,
      /^__fxdriver_/,
      /^__nightmare$/,
      /^_phantom$/,
      /^callPhantom$/,
      /^domAutomation(Controller)?$/,
      /^cdc_adoQpoasnfa76pfcZLmcfl_/,
    ];
    const hits = [];
    for (const target of [window, document]) {
      for (const key of Object.getOwnPropertyNames(target)) {
        if (patterns.some((p) => p.test(key))) {
          hits.push(`${target === window ? 'window' : 'document'}.${key}`);
        }
      }
    }
    if (navigator.webdriver === undefined && 'webdriver' in window) {
      hits.push('window.webdriver');
    }
    if (hits.length) {
      return { detected: true, details: `Automation globals found: ${hits.join(', ')}` };
    }
    return { detected: false, details: 'No known automation globals on window or document' };
  },
};
