// Background: https://github.com/abrahamjuliot/creepjs/blob/master/src/lies/index.ts
// Web IDL getters validate their receiver: https://webidl.spec.whatwg.org/#dfn-attribute-getter
export default {
  id: 'getter-receiver',
  name: 'Navigator getter receiver validation',
  category: 'injection',
  description:
    'Native navigator getters require a real Navigator receiver and cannot be called as constructors. ' +
    'A replacement getter or Proxy apply trap that returns a spoofed value for any receiver violates ' +
    'those rules, even if toString looks native. This tests invalid receivers and construction without ' +
    'changing browser prototypes. Well-behaved patches can pass; extensions can also fail these checks.',
  async detect() {
    const keys = ['webdriver', 'hardwareConcurrency', 'deviceMemory', 'languages', 'platform', 'userAgent'];
    const issues = [];
    let checked = 0;
    for (const key of keys) {
      let owner = navigator;
      let descriptor;
      while (owner && !descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(owner, key);
        owner = Object.getPrototypeOf(owner);
      }
      if (!descriptor) continue;
      checked++;
      if (typeof descriptor.get !== 'function') {
        issues.push(`${key}: replaced by a data property`);
        continue;
      }
      const getter = descriptor.get;
      const probes = [
        ['plain object', () => Reflect.apply(getter, {}, [])],
        ['prototype-only Navigator', () => Reflect.apply(getter, Object.create(Navigator.prototype), [])],
        ['null', () => Reflect.apply(getter, null, [])],
        ['construction', () => Reflect.construct(getter, [])],
      ];
      for (const [label, probe] of probes) {
        try {
          probe();
          issues.push(`${key}: accepted ${label}`);
        } catch (err) {
          if (err?.name !== 'TypeError') issues.push(`${key}: ${label} threw ${err?.name || 'unknown error'} instead of TypeError`);
        }
      }
    }
    return {
      detected: checked ? issues.length > 0 : null,
      details: issues.length ? issues.join('; ') : `${checked} navigator getters reject invalid receivers and construction`,
    };
  },
};
