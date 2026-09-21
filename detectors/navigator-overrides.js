// Background: https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth/evasions/navigator.webdriver
export default {
  id: 'navigator-overrides',
  name: 'Navigator instance overrides',
  category: 'injection',
  description:
    'Navigator values normally come from prototype getters. Basic spoofing scripts use ' +
    'Object.defineProperty(navigator, ...) to hide webdriver or change fingerprint values, leaving ' +
    'own properties on the navigator instance. This catches those overrides, but not prototype patches ' +
    'or automation flags. Privacy extensions and page scripts can make the same changes.',
  async detect() {
    const properties = ['webdriver', 'userAgent', 'platform', 'languages', 'plugins', 'mimeTypes', 'hardwareConcurrency'];
    const hits = properties.filter((name) => Object.prototype.hasOwnProperty.call(navigator, name));
    return {
      detected: hits.length > 0,
      details: hits.length ? `Navigator own properties: ${hits.join(', ')}` : 'No instance overrides on probed navigator properties',
    };
  },
};
