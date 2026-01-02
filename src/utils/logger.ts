/**
 * Conditional Logger Utility
 * 
 * Prevents console logs from appearing in production builds.
 * Use this instead of console.log/error/warn throughout the application.
 * 
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.log('Debug message');
 *   logger.error('Error message');
 *   logger.warn('Warning message');
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log error messages (only in development)
   */
  error: (...args: any[]): void => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args: any[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: any[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: any[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
