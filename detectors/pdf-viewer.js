export default {
  id: 'pdf-viewer',
  name: 'navigator.pdfViewerEnabled',
  category: 'navigator',
  description:
    'Desktop Chrome ships with the built-in PDF viewer enabled, so navigator.pdfViewerEnabled is true. ' +
    'Headless Chromium reports false because the PDF viewer component is not loaded, giving a one-line ' +
    'headless check that survives user agent spoofing.',
  async detect() {
    if (typeof navigator.pdfViewerEnabled !== 'boolean') {
      return { detected: null, details: 'navigator.pdfViewerEnabled not supported in this browser' };
    }
    const isChromeUA = /Chrome\//.test(navigator.userAgent);
    if (!isChromeUA) {
      return {
        detected: null,
        details: `Not Chrome; pdfViewerEnabled === ${navigator.pdfViewerEnabled} carries no signal`,
      };
    }
    if (!navigator.pdfViewerEnabled) {
      return { detected: true, details: 'Chrome UA but navigator.pdfViewerEnabled === false (typical of headless)' };
    }
    return { detected: false, details: 'navigator.pdfViewerEnabled === true' };
  },
};
