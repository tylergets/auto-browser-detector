export default {
  id: 'headless-user-agent',
  name: 'Headless user agent string',
  category: 'environment',
  description:
    'Headless Chromium ships with "HeadlessChrome" in place of "Chrome" in its user agent string unless ' +
    'explicitly overridden. This is the oldest and cheapest headless check, done both server-side on the ' +
    'User-Agent header and client-side on navigator.userAgent.',
  async detect() {
    const ua = navigator.userAgent;
    const markers = ['HeadlessChrome', 'Headless', 'PhantomJS', 'Electron'];
    const hit = markers.find((m) => ua.includes(m));
    if (hit) {
      return { detected: true, details: `"${hit}" found in user agent: ${ua}` };
    }
    return { detected: false, details: `No headless markers in user agent: ${ua}` };
  },
};
