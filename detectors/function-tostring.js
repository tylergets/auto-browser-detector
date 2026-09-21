export default {
  id: 'function-tostring',
  name: 'Native function toString integrity',
  category: 'injection',
  description:
    'Stealth plugins hide automation by replacing native functions (navigator.permissions.query, ' +
    'WebGL getParameter, etc.) with JavaScript proxies. A genuine native function stringifies to ' +
    '"function name() { [native code] }"; patched ones either stringify to JS source or require patching ' +
    'Function.prototype.toString itself, which this check also verifies. Vanilla Playwright is expected to ' +
    'pass — a failure here indicates spoofing, which is its own bot signal.',
  async detect() {
    const nativePattern = /^function (?:get |set )?[\w$]*\(\) \{\s*\[native code\]\s*\}$/;
    const suspects = [
      ['Function.prototype.toString', Function.prototype.toString],
      ['navigator.permissions.query', navigator.permissions?.query],
      ['HTMLCanvasElement.prototype.toDataURL', HTMLCanvasElement.prototype.toDataURL],
      ['WebGLRenderingContext.prototype.getParameter', window.WebGLRenderingContext?.prototype.getParameter],
      ['Navigator.prototype own webdriver getter', Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver')?.get],
    ];
    const patched = [];
    for (const [label, fn] of suspects) {
      if (typeof fn !== 'function') continue;
      let src;
      try {
        src = Function.prototype.toString.call(fn);
      } catch {
        patched.push(`${label} (toString threw — revoked proxy)`);
        continue;
      }
      if (!nativePattern.test(src)) {
        patched.push(label);
      }
    }
    if (patched.length) {
      return { detected: true, details: `Non-native implementations: ${patched.join(', ')}` };
    }
    return { detected: false, details: `All ${suspects.length} probed natives stringify as [native code]` };
  },
};
