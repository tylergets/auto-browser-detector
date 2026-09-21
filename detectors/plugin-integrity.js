// References:
// https://github.com/fingerprintjs/BotD/blob/main/src/detectors/plugins_array.ts
// https://github.com/fingerprintjs/BotD/blob/main/src/detectors/mime_types_consistence.ts
export default {
  id: 'plugin-integrity',
  name: 'Plugin and MIME object integrity',
  category: 'navigator',
  description:
    'Simple stealth scripts replace navigator.plugins or navigator.mimeTypes with ordinary arrays or ' +
    'plain objects. This checks the browser object types and MIME-to-plugin links rather than requiring ' +
    'a particular plugin count. Empty native lists pass. Extensions that replace these APIs can also trigger it.',
  async detect() {
    if (!window.PluginArray || !window.MimeTypeArray || !window.Plugin || !window.MimeType ||
        !navigator.plugins || !navigator.mimeTypes) {
      return { detected: null, details: 'Plugin or MIME APIs are unavailable' };
    }
    const issues = [];
    if (!(navigator.plugins instanceof PluginArray)) issues.push('plugins is not a PluginArray');
    if (!(navigator.mimeTypes instanceof MimeTypeArray)) issues.push('mimeTypes is not a MimeTypeArray');
    const plugins = Array.from(navigator.plugins);
    for (const plugin of plugins) {
      if (!(plugin instanceof Plugin)) issues.push('non-Plugin entry');
      for (const mime of Array.from(plugin)) {
        if (!(mime instanceof MimeType)) issues.push('non-MimeType plugin entry');
      }
    }
    for (const mime of Array.from(navigator.mimeTypes)) {
      if (!(mime instanceof MimeType)) issues.push('non-MimeType entry');
      if (!plugins.includes(mime.enabledPlugin)) issues.push(`${mime.type}: enabledPlugin missing from plugins`);
      else if (!Array.from(mime.enabledPlugin).some((entry) => entry.type === mime.type)) {
        issues.push(`${mime.type}: missing from enabledPlugin`);
      }
    }
    return {
      detected: issues.length > 0,
      details: issues.length ? [...new Set(issues)].join('; ') : 'Native plugin/MIME objects with consistent links',
    };
  },
};
