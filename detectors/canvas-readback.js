// Background: https://github.com/abrahamjuliot/creepjs/blob/master/src/canvas/index.ts
export default {
  id: 'canvas-readback',
  name: 'Canvas pixel round-trip integrity',
  category: 'injection',
  description:
    'Writes random opaque pixels, reads them twice, and compares both reads with the original bytes. ' +
    'It also copies the canvas with drawImage and checks that readback. This catches some canvas-noise ' +
    'and fingerprint-spoofing patches without relying on a known GPU or font fingerprint. Privacy ' +
    'browsers can intentionally add noise, so a mismatch is evidence of altered canvas output, not ' +
    'proof of automation. Blocked canvas access is reported as not applicable.',
  async detect() {
    const canvas = document.createElement('canvas');
    const copy = document.createElement('canvas');
    canvas.width = copy.width = 16;
    canvas.height = copy.height = 16;
    try {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const copyContext = copy.getContext('2d', { willReadFrequently: true });
      if (!context || !copyContext) return { detected: null, details: '2D canvas is unavailable' };
      const image = context.createImageData(16, 16);
      crypto.getRandomValues(image.data);
      // Opaque sRGB pixels avoid alpha premultiplication rounding and font/GPU differences.
      for (let i = 3; i < image.data.length; i += 4) image.data[i] = 255;
      const expected = image.data.slice();
      context.putImageData(image, 0, 0);
      const first = context.getImageData(0, 0, 16, 16).data.slice();
      const second = context.getImageData(0, 0, 16, 16).data.slice();
      copyContext.drawImage(canvas, 0, 0);
      const copied = copyContext.getImageData(0, 0, 16, 16).data;
      const count = (a, b) => a.reduce((total, value, i) => total + Number(value !== b[i]), 0);
      const changed = count(expected, first);
      const unstable = count(first, second);
      const copyChanged = count(expected, copied);
      return {
        detected: changed > 0 || unstable > 0 || copyChanged > 0,
        details: `Of ${expected.length} channels: ${changed} changed on readback, ${unstable} changed between reads, ${copyChanged} changed after drawImage`,
      };
    } catch (err) {
      return { detected: null, details: `Canvas readback unavailable: ${err.message}` };
    } finally {
      canvas.width = copy.width = 0;
    }
  },
};
