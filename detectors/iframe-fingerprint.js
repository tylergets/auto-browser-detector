// Background: https://github.com/abrahamjuliot/creepjs/blob/master/src/lies/index.ts
export default {
  id: 'iframe-fingerprint',
  name: 'Cross-frame fingerprint consistency',
  category: 'navigator',
  description:
    'Compares browser identity and hardware properties with a fresh same-origin iframe. Unlike the ' +
    'webdriver check, this can catch prototype-level overrides of CPU count, platform, language, or ' +
    'user agent while webdriver stays unchanged. Only values expected to agree across these frames ' +
    'are compared. Privacy extensions can cause differences; all-frame patches can evade the check.',
  async detect() {
    if (!document.body) return { detected: null, details: 'No document body for a reference iframe' };
    const frame = document.createElement('iframe');
    frame.hidden = true;
    try {
      document.body.append(frame);
      const reference = frame.contentWindow;
      if (!reference) return { detected: null, details: 'Reference iframe is unavailable' };
      const keys = ['userAgent', 'appVersion', 'platform', 'vendor', 'language', 'languages',
        'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints'];
      const differences = [];
      for (const key of keys) {
        const page = JSON.stringify(navigator[key]);
        const iframe = JSON.stringify(reference.navigator[key]);
        if (page !== iframe) differences.push(`${key}: page=${page}, iframe=${iframe}`);
      }
      return {
        detected: differences.length > 0,
        details: differences.length ? differences.join('; ') : `Page and iframe agree on ${keys.join(', ')}`,
      };
    } catch (err) {
      return { detected: null, details: `Frame comparison unavailable: ${err.message}` };
    } finally {
      frame.remove();
    }
  },
};
