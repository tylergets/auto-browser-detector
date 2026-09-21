// Background: https://github.com/abrahamjuliot/creepjs/blob/master/src/lies/index.ts
export default {
  id: 'cross-realm-functions',
  name: 'Cross-realm native function inspection',
  category: 'injection',
  description:
    'A patched Function.prototype.toString can make JavaScript wrappers look native. This borrows ' +
    'toString from a fresh same-origin iframe and compares page functions with their iframe counterparts. ' +
    'It can expose wrappers and proxies even when the page reports native-looking source. Extensions ' +
    'can trigger it too; patches applied consistently to every realm may still pass.',
  async detect() {
    if (!document.body) return { detected: null, details: 'No document body for a reference iframe' };
    const frame = document.createElement('iframe');
    frame.hidden = true;
    try {
      document.body.append(frame);
      const reference = frame.contentWindow;
      if (!reference) return { detected: null, details: 'Reference iframe is unavailable' };
      const source = reference.Function.prototype.toString;
      const targets = (scope) => [
        ['Function.toString', scope.Function.prototype.toString],
        ['Permissions.query', scope.Permissions?.prototype.query],
        ['Canvas.getImageData', scope.CanvasRenderingContext2D?.prototype.getImageData],
        ['Canvas.toDataURL', scope.HTMLCanvasElement?.prototype.toDataURL],
        ['WebGL.getParameter', scope.WebGLRenderingContext?.prototype.getParameter],
        ['Navigator.hardwareConcurrency', Object.getOwnPropertyDescriptor(scope.Navigator.prototype, 'hardwareConcurrency')?.get],
        ['Navigator.webdriver', Object.getOwnPropertyDescriptor(scope.Navigator.prototype, 'webdriver')?.get],
      ];
      const baseline = targets(reference);
      const differences = [];
      let checked = 0;
      for (const [index, [label, fn]] of targets(window).entries()) {
        const original = baseline[index][1];
        if (typeof original !== 'function') continue;
        checked++;
        if (typeof fn !== 'function') {
          differences.push(`${label}: missing function/getter`);
          continue;
        }
        try {
          if (source.call(fn) !== source.call(original)) differences.push(`${label}: source differs from iframe`);
        } catch {
          differences.push(`${label}: function inspection threw`);
        }
      }
      return {
        detected: checked ? differences.length > 0 : null,
        details: differences.length ? differences.join('; ') : `Compared ${checked} functions using iframe toString`,
      };
    } catch (err) {
      return { detected: null, details: `Reference realm unavailable: ${err.message}` };
    } finally {
      frame.remove();
    }
  },
};
