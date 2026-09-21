export default {
  id: 'window-dimensions',
  name: 'Window / screen dimension anomalies',
  category: 'environment',
  description:
    'A real browser window has chrome around the viewport, so outerWidth/outerHeight exceed the inner ' +
    'dimensions and the window sits inside the screen. Headless browsers report outer dimensions of 0 or ' +
    'exactly equal to the viewport, and often a viewport as large as the "screen" itself.',
  async detect() {
    const { innerWidth, innerHeight, outerWidth, outerHeight } = window;
    const dims = `inner ${innerWidth}x${innerHeight}, outer ${outerWidth}x${outerHeight}, screen ${screen.width}x${screen.height}, avail ${screen.availWidth}x${screen.availHeight}`;
    const problems = [];
    if (outerWidth === 0 || outerHeight === 0) {
      problems.push('outerWidth/outerHeight is 0');
    }
    if (outerWidth === innerWidth && outerHeight === innerHeight && !document.fullscreenElement) {
      problems.push('outer dimensions exactly equal viewport with no window chrome');
    }
    if (screen.availWidth === screen.width && screen.availHeight === screen.height
        && innerWidth === screen.width && innerHeight === screen.height && !document.fullscreenElement) {
      problems.push('viewport fills entire screen with no taskbar/dock reserved');
    }
    if (problems.length) {
      return { detected: true, details: `${problems.join('; ')} (${dims})` };
    }
    return { detected: false, details: dims };
  },
};
