export default {
  id: 'evaluation-stack-trace',
  name: 'Injected-script stack trace markers',
  category: 'injection',
  description:
    'Code injected by automation frameworks runs from synthetic script sources whose names leak into ' +
    'Error.stack: Playwright evaluations run inside a "UtilityScript" wrapper, and Puppeteer historically ' +
    'used "__puppeteer_evaluation_script__" source URLs. Any library code that captures a stack trace can ' +
    'therefore notice it was called from an automation harness.',
  async detect() {
    let stack = '';
    try {
      throw new Error('stack-probe');
    } catch (err) {
      stack = err.stack || '';
    }
    const markers = [
      'UtilityScript',
      '__playwright',
      '__puppeteer_evaluation_script__',
      'pptr:',
      '__driver_evaluate',
      '__webdriver_evaluate',
    ];
    const hits = markers.filter((m) => stack.includes(m));
    if (hits.length) {
      const line = stack.split('\n').find((l) => hits.some((h) => l.includes(h)))?.trim();
      return { detected: true, details: `Stack contains ${hits.join(', ')} — e.g. "${line}"` };
    }
    return { detected: false, details: 'No automation markers in Error.stack' };
  },
};
