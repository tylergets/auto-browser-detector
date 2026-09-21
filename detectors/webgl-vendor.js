export default {
  id: 'webgl-vendor',
  name: 'WebGL vendor / renderer',
  category: 'rendering',
  description:
    'The WEBGL_debug_renderer_info extension exposes the GPU vendor and renderer. Headless and server-side ' +
    'browsers commonly fall back to software rendering, reporting "Google Inc." with a SwiftShader, ' +
    'llvmpipe, or Mesa renderer instead of real GPU hardware — a strong signal for datacenter automation.',
  async detect() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      return { detected: true, details: 'WebGL context unavailable (common in stripped headless builds)' };
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const softwareMarkers = /swiftshader|llvmpipe|softpipe|mesa offscreen|software/i;
    if (softwareMarkers.test(String(renderer)) || softwareMarkers.test(String(vendor))) {
      return { detected: true, details: `Software renderer: ${vendor} / ${renderer}` };
    }
    return { detected: false, details: `${vendor} / ${renderer}` };
  },
};
