// Reference: https://github.com/fingerprintjs/BotD/blob/main/src/detectors/document_element_keys.ts
export default {
  id: 'selenium-attributes',
  name: 'Selenium document attributes',
  category: 'injection',
  description:
    'Some older Selenium tools mark the root HTML element with webdriver, driver, or selenium attributes. ' +
    'These DOM markers are separate from globals injected into window or document. Current drivers may ' +
    'leave none, and a page can also set these attributes itself.',
  async detect() {
    const root = document.documentElement;
    if (!root) return { detected: null, details: 'No root HTML element' };
    const hits = ['webdriver', 'driver', 'selenium'].filter((name) => root.hasAttribute(name));
    return {
      detected: hits.length > 0,
      details: hits.length ? `Root attributes found: ${hits.join(', ')}` : 'No known Selenium root attributes',
    };
  },
};
