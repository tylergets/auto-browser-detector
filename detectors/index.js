// Manifest of all detection methods. Add new detectors here — one file per method.
import navigatorWebdriver from './navigator-webdriver.js';
import headlessUserAgent from './headless-user-agent.js';
import uaClientHints from './ua-client-hints.js';
import windowChrome from './window-chrome.js';
import pluginsAndMimetypes from './plugins-and-mimetypes.js';
import pdfViewer from './pdf-viewer.js';
import permissionsInconsistency from './permissions-inconsistency.js';
import webglVendor from './webgl-vendor.js';
import windowDimensions from './window-dimensions.js';
import connectionRtt from './connection-rtt.js';
import mediaCodecs from './media-codecs.js';
import cdpRuntimeDomain from './cdp-runtime-domain.js';
import evaluationStackTrace from './evaluation-stack-trace.js';
import playwrightBindings from './playwright-bindings.js';
import functionTostring from './function-tostring.js';
import iframeChrome from './iframe-chrome.js';
import seleniumAttributes from './selenium-attributes.js';
import navigatorLanguages from './navigator-languages.js';
import pluginIntegrity from './plugin-integrity.js';
import navigatorOverrides from './navigator-overrides.js';
import workerNavigator from './worker-navigator.js';
import crossRealmFunctions from './cross-realm-functions.js';
import getterReceiver from './getter-receiver.js';
import iframeFingerprint from './iframe-fingerprint.js';
import canvasReadback from './canvas-readback.js';

export default [
  navigatorWebdriver,
  headlessUserAgent,
  uaClientHints,
  windowChrome,
  pluginsAndMimetypes,
  pdfViewer,
  permissionsInconsistency,
  webglVendor,
  windowDimensions,
  connectionRtt,
  mediaCodecs,
  cdpRuntimeDomain,
  evaluationStackTrace,
  playwrightBindings,
  functionTostring,
  iframeChrome,
  seleniumAttributes,
  navigatorLanguages,
  pluginIntegrity,
  navigatorOverrides,
  workerNavigator,
  crossRealmFunctions,
  getterReceiver,
  iframeFingerprint,
  canvasReadback,
];
