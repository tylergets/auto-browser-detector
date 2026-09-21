export default {
  id: 'connection-rtt',
  name: 'navigator.connection.rtt === 0',
  category: 'environment',
  description:
    'The Network Information API rounds the estimated round-trip time to the nearest 25 ms, so a real ' +
    'network connection essentially never reports exactly 0. Headless environments and some automation ' +
    'stacks report rtt of 0, which sites use as a cheap supporting signal.',
  async detect() {
    const conn = navigator.connection;
    if (!conn || typeof conn.rtt !== 'number') {
      return { detected: null, details: 'Network Information API not available' };
    }
    if (conn.rtt === 0) {
      return {
        detected: true,
        details: `connection.rtt === 0 (downlink ${conn.downlink}, type ${conn.effectiveType})`,
      };
    }
    return {
      detected: false,
      details: `connection.rtt === ${conn.rtt} ms (downlink ${conn.downlink}, type ${conn.effectiveType})`,
    };
  },
};
