/**
 * MULEMA — Production-Ready Logger
 * Safely handles logs across environments.
 * Disables plain console.logs in production to prevent performance degradation and leaks.
 */

const isProd = !__DEV__;

export const Logger = {
  info: (message, ...args) => {
    if (!isProd) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (!isProd) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In a real production setup, we would send this to Sentry/Datadog here.
  },
  error: (message, ...args) => {
    if (!isProd) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // TODO: Sentry.captureException(error) in production
  },
  debug: (message, ...args) => {
    if (!isProd) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};

export default Logger;
