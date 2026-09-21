export default {
  id: 'window-chrome',
  name: 'window.chrome object',
  category: 'environment',
  description:
    'Real desktop Chrome exposes a window.chrome object populated with app, csi, loadTimes, and runtime ' +
    'members. Headless Chromium historically omitted it entirely, and even new headless mode ships a ' +
    'sparser object, so sites check both its presence and its expected shape.',
  async detect() {
    const isChromeUA = /Chrome\//.test(navigator.userAgent) || /Chromium|Google Chrome/.test(
      (navigator.userAgentData?.brands || []).map((b) => b.brand).join(' ')
    );
    if (!isChromeUA) {
      return { detected: null, details: 'Not a Chromium-based browser; window.chrome not expected' };
    }
    if (!window.chrome) {
      return { detected: true, details: 'window.chrome is missing in a browser claiming to be Chrome' };
    }
    const expected = ['app', 'csi', 'loadTimes', 'runtime'];
    const missing = expected.filter((k) => !(k in window.chrome));
    if (missing.length) {
      return {
        detected: true,
        details: `window.chrome exists but lacks expected members: ${missing.join(', ')}`,
      };
    }
    return { detected: false, details: `window.chrome present with ${expected.join(', ')}` };
  },
};
