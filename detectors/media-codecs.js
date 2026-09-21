export default {
  id: 'media-codecs',
  name: 'Proprietary media codec support',
  category: 'rendering',
  description:
    'Branded Chrome bundles proprietary codecs (H.264, AAC), while plain Chromium builds — including the ' +
    'chromium binary Playwright and Puppeteer download — often lack them. A browser claiming to be Chrome ' +
    'in its user agent but unable to play H.264/AAC is very likely an automation-bundled Chromium.',
  async detect() {
    const video = document.createElement('video');
    const checks = {
      'H.264': video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
      'AAC': video.canPlayType('audio/mp4; codecs="mp4a.40.2"'),
      'MP3': video.canPlayType('audio/mpeg'),
    };
    const summary = Object.entries(checks)
      .map(([k, v]) => `${k}: ${v || 'no'}`)
      .join(', ');
    const isChromeUA = /Chrome\//.test(navigator.userAgent);
    const missing = Object.entries(checks).filter(([, v]) => v === '').map(([k]) => k);
    if (isChromeUA && missing.length) {
      return { detected: true, details: `Chrome UA but missing proprietary codecs (${summary})` };
    }
    return { detected: false, details: summary };
  },
};
