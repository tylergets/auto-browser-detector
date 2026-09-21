export default {
  id: 'ua-client-hints',
  name: 'User-Agent Client Hints inconsistency',
  category: 'environment',
  description:
    'navigator.userAgentData (User-Agent Client Hints) is populated by the browser engine independently of ' +
    'the user agent string. When automation tooling spoofs the UA string but forgets the client hints — or ' +
    'vice versa — the brand list, platform, or headless marker contradicts navigator.userAgent.',
  async detect() {
    const uad = navigator.userAgentData;
    if (!uad) {
      return { detected: null, details: 'navigator.userAgentData not available in this browser' };
    }
    const ua = navigator.userAgent;
    const brands = uad.brands.map((b) => `${b.brand} ${b.version}`).join(', ');
    const problems = [];

    const headlessBrand = uad.brands.find((b) => /headless/i.test(b.brand));
    if (headlessBrand) {
      problems.push(`brand list contains "${headlessBrand.brand}"`);
    }
    const chromeBrand = uad.brands.find((b) => /^(Google Chrome|Chromium)$/.test(b.brand));
    const uaChromeMajor = (ua.match(/(?:Chrome|HeadlessChrome)\/(\d+)/) || [])[1];
    if (chromeBrand && uaChromeMajor && chromeBrand.version !== uaChromeMajor) {
      problems.push(`brand major version ${chromeBrand.version} != UA string major version ${uaChromeMajor}`);
    }
    if (ua.includes('Chrome/') && !chromeBrand && !headlessBrand) {
      problems.push('UA string claims Chrome but client hints list no Chrome/Chromium brand');
    }
    if (uad.mobile && !/Mobile/.test(ua)) {
      problems.push('client hints say mobile but UA string does not');
    }

    if (problems.length) {
      return { detected: true, details: `${problems.join('; ')} (brands: ${brands})` };
    }
    return { detected: false, details: `Client hints consistent with UA string (brands: ${brands})` };
  },
};
