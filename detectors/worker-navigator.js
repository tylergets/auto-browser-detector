// Reference: https://deviceandbrowserinfo.com/learning_zone/articles/analyze-open-bullet2-puppeteer-mode
export default {
  id: 'worker-navigator',
  name: 'Page / worker navigator mismatch',
  category: 'navigator',
  description:
    'Fingerprint patches may change navigator in the page but miss dedicated Web Workers. This compares ' +
    'userAgent, platform, language, languages, and hardwareConcurrency across both contexts. A mismatch ' +
    'suggests an override, not necessarily automation: privacy tools and language preferences can also ' +
    'produce differences. Browser automation can apply locale settings only to the page. ' +
    'Blocked or unavailable workers are reported as not applicable.',
  async detect() {
    if (!window.Worker || !window.Blob || !URL.createObjectURL) {
      return { detected: null, details: 'Blob workers are unavailable' };
    }
    const keys = ['userAgent', 'platform', 'language', 'languages', 'hardwareConcurrency'];
    const pageValues = Object.fromEntries(keys.map((key) => [key, navigator[key]]));
    let url;
    let worker;
    let timer;
    try {
      url = URL.createObjectURL(new Blob([
        `postMessage(Object.fromEntries(${JSON.stringify(keys)}.map(key => [key, navigator[key]])))`,
      ], { type: 'text/javascript' }));
      worker = new Worker(url);
      const values = await new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('Worker timed out after 3 seconds')), 3000);
        worker.onmessage = (event) => resolve(event.data);
        worker.onerror = (event) => {
          event.preventDefault();
          reject(new Error('Worker failed to load or execute (possibly blocked by CSP)'));
        };
        worker.onmessageerror = () => reject(new Error('Worker response could not be read'));
      });
      const differences = keys.filter((key) => JSON.stringify(pageValues[key]) !== JSON.stringify(values[key]));
      return {
        detected: differences.length > 0,
        details: differences.length
          ? differences.map((key) => `${key}: page=${JSON.stringify(pageValues[key])}, worker=${JSON.stringify(values[key])}`).join('; ')
          : `Page and worker agree on ${keys.join(', ')}`,
      };
    } catch (err) {
      return { detected: null, details: `Worker comparison unavailable: ${err.message}` };
    } finally {
      clearTimeout(timer);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
    }
  },
};
