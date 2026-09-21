export default {
  id: 'cdp-runtime-domain',
  name: 'CDP Runtime domain side-channel',
  category: 'cdp',
  description:
    'When a Chrome DevTools Protocol client enables the Runtime domain (as Playwright, Puppeteer, and ' +
    'DevTools itself do), logging an Error causes the browser to serialize it for the protocol, which reads ' +
    'its .stack property. Planting a getter on .stack and calling console.debug therefore reveals an attached ' +
    'CDP session without any visible side effect. This also fires when real DevTools are open.',
  async detect() {
    let accessed = false;
    const err = new Error('cdp-probe');
    Object.defineProperty(err, 'stack', {
      configurable: false,
      enumerable: false,
      get() {
        accessed = true;
        return '';
      },
    });
    console.debug(err);
    // Serialization is synchronous, but give the engine a microtask for safety.
    await Promise.resolve();
    if (accessed) {
      return {
        detected: true,
        details: 'Error.stack getter was read during console.debug — a CDP Runtime domain (automation or DevTools) is attached',
      };
    }
    return { detected: false, details: 'Error.stack getter untouched by console serialization' };
  },
};
