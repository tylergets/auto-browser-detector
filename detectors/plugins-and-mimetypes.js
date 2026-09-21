export default {
  id: 'plugins-and-mimetypes',
  name: 'navigator.plugins / mimeTypes',
  category: 'navigator',
  description:
    'Desktop Chrome always reports five built-in PDF viewer plugins and two PDF MIME types. Old headless ' +
    'Chromium reported empty lists, which became a classic headless tell. New headless mode fixed this, so ' +
    'an empty list today usually indicates an older headless build or a stripped-down embedded browser.',
  async detect() {
    const isChromeUA = /Chrome\//.test(navigator.userAgent);
    const plugins = Array.from(navigator.plugins).map((p) => p.name);
    const mimeTypes = Array.from(navigator.mimeTypes).map((m) => m.type);
    if (!isChromeUA) {
      return {
        detected: null,
        details: `Not Chrome; plugin expectations do not apply (${plugins.length} plugins)`,
      };
    }
    if (plugins.length === 0 || mimeTypes.length === 0) {
      return {
        detected: true,
        details: `Chrome UA but ${plugins.length} plugins and ${mimeTypes.length} MIME types (desktop Chrome reports 5 and 2)`,
      };
    }
    return {
      detected: false,
      details: `${plugins.length} plugins (${plugins.slice(0, 3).join(', ')}…), ${mimeTypes.length} MIME types`,
    };
  },
};
