export default {
  id: 'permissions-inconsistency',
  name: 'Notification permission contradiction',
  category: 'environment',
  description:
    'In headless Chromium, Notification.permission reports "denied" while the Permissions API reports the ' +
    'notifications permission as "prompt" — two views of the same state that a real browser keeps in sync. ' +
    'The contradiction was popularized as a reliable headless Chrome check.',
  async detect() {
    if (typeof Notification === 'undefined' || !navigator.permissions?.query) {
      return { detected: null, details: 'Notification or Permissions API not available' };
    }
    let status;
    try {
      status = await navigator.permissions.query({ name: 'notifications' });
    } catch (err) {
      return { detected: null, details: `permissions.query failed: ${err.message}` };
    }
    const notif = Notification.permission;
    if (notif === 'denied' && status.state === 'prompt') {
      return {
        detected: true,
        details: 'Notification.permission === "denied" but permissions.query reports "prompt"',
      };
    }
    return {
      detected: false,
      details: `Notification.permission === "${notif}", permissions.query === "${status.state}" (consistent)`,
    };
  },
};
