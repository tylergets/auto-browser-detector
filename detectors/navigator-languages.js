// Reference: https://github.com/fingerprintjs/BotD/blob/main/src/detectors/languages_inconsistency.ts
export default {
  id: 'navigator-languages',
  name: 'Empty browser languages',
  category: 'navigator',
  description:
    'Older headless browsers sometimes exposed an empty navigator.languages list. Normal browsers ' +
    'usually report at least one preferred language, including privacy modes that reduce the list. ' +
    'Modern automation normally passes; custom browser settings can also produce an empty list.',
  async detect() {
    if (navigator.languages === undefined) {
      return { detected: null, details: 'navigator.languages is unavailable' };
    }
    const languages = Array.from(navigator.languages);
    return {
      detected: languages.length === 0,
      details: `navigator.languages=${JSON.stringify(languages)}`,
    };
  },
};
