export default {
  id: 'iframe-chrome',
  name: 'Fresh iframe environment comparison',
  category: 'injection',
  description:
    'Spoofing scripts usually patch only the top frame. Creating a fresh same-origin iframe yields a clean ' +
    'JavaScript realm whose navigator.webdriver and window.chrome reflect the browser\'s true state, so a ' +
    'mismatch between the iframe and the top frame exposes tampering — and the iframe view of webdriver ' +
    'exposes automation even when the top frame was patched.',
  async detect() {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    try {
      const w = iframe.contentWindow;
      if (!w) {
        return { detected: null, details: 'Could not access iframe contentWindow' };
      }
      const problems = [];
      if (w.navigator.webdriver === true) {
        problems.push('iframe navigator.webdriver === true');
      }
      if (w.navigator.webdriver !== navigator.webdriver) {
        problems.push(
          `webdriver mismatch: top=${String(navigator.webdriver)} iframe=${String(w.navigator.webdriver)} (top frame patched)`
        );
      }
      if (Boolean(w.chrome) !== Boolean(window.chrome)) {
        problems.push(`window.chrome mismatch: top=${Boolean(window.chrome)} iframe=${Boolean(w.chrome)}`);
      }
      if (problems.length) {
        return { detected: true, details: problems.join('; ') };
      }
      return { detected: false, details: 'Fresh iframe realm consistent with top frame and clean' };
    } finally {
      iframe.remove();
    }
  },
};
