export default {
  id: 'navigator-webdriver',
  name: 'navigator.webdriver',
  category: 'navigator',
  description:
    'The W3C WebDriver specification requires automated browsers to set navigator.webdriver to true. ' +
    'Playwright, Puppeteer, and Selenium all set this flag by default, making it the single most widely ' +
    'used automation signal. Stealth tooling patches it, so sites often pair this check with integrity checks on the property descriptor.',
  async detect() {
    const value = navigator.webdriver;
    if (value === true) {
      return { detected: true, details: 'navigator.webdriver === true' };
    }
    // A deleted or redefined property is itself suspicious: in a normal Chrome it is
    // an own getter on Navigator.prototype returning false.
    const proto = Object.getPrototypeOf(navigator);
    const desc = Object.getOwnPropertyDescriptor(proto, 'webdriver');
    if (!desc) {
      return { detected: true, details: 'webdriver property removed from Navigator.prototype (stealth patching)' };
    }
    if (Object.getOwnPropertyDescriptor(navigator, 'webdriver')) {
      return { detected: true, details: 'webdriver redefined as own property of navigator (stealth patching)' };
    }
    return { detected: false, details: `navigator.webdriver === ${String(value)}` };
  },
};
