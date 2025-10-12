/**
 * Centralized logging utility
 * - Disables console.log in production
 * - Provides consistent logging interface
 * - Improves performance by avoiding string serialization in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    this.config = {
      enabled: import.meta.env.DEV,
      minLevel: import.meta.env.DEV ? 'debug' : 'error',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled && level !== 'error') {
      return false;
    }
    return this.levels[level] >= this.levels[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level];

    return `[${timestamp}] ${emoji} ${message}`;
  }

  /**
   * Debug logs (only in development)
   * Use for verbose logging during development
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      if (data !== undefined) {
        console.log(this.formatMessage('debug', message), data);
      } else {
        console.log(this.formatMessage('debug', message));
      }
    }
  }

  /**
   * Info logs (only in development)
   * Use for general information
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      if (data !== undefined) {
        console.info(this.formatMessage('info', message), data);
      } else {
        console.info(this.formatMessage('info', message));
      }
    }
  }

  /**
   * Warning logs (development + production)
   * Use for potentially problematic situations
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      if (data !== undefined) {
        console.warn(this.formatMessage('warn', message), data);
      } else {
        console.warn(this.formatMessage('warn', message));
      }
    }
  }

  /**
   * Error logs (always enabled)
   * Use for errors and exceptions
   */
  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error 
        ? { message: error.message, stack: error.stack, name: error.name }
        : error;

      if (errorData !== undefined) {
        console.error(this.formatMessage('error', message), errorData);
      } else {
        console.error(this.formatMessage('error', message));
      }
    }
  }

  /**
   * Group related logs together (only in development)
   */
  group(label: string, callback: () => void): void {
    if (this.shouldLog('debug')) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  /**
   * Measure execution time (only in development)
   */
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const logger = new Logger();
