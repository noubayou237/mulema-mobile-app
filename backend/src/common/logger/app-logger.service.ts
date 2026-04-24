import { Injectable, LoggerService, Scope } from '@nestjs/common';

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'verbose';

/**
 * Production-ready structured logger for Mulema backend.
 *
 * - In production (NODE_ENV=production): emits newline-delimited JSON so log
 *   aggregators (Datadog, Logtail, Cloudwatch) can parse and index fields.
 * - In every other environment: emits human-readable coloured text for local
 *   development / staging.
 *
 * Usage inside a NestJS injectable:
 *   private readonly logger = new AppLogger(MyService.name);
 *   this.logger.log('user registered', { userId });
 *   this.logger.error('payment failed', error);
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context: string;
  private readonly isProd = process.env.NODE_ENV === 'production';

  constructor(context = 'App') {
    this.context = context;
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, meta?: Record<string, unknown> | string) {
    this.emit('log', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown> | string) {
    this.emit('warn', message, meta);
  }

  error(message: string, errorOrMeta?: Error | Record<string, unknown> | string) {
    this.emit('error', message, errorOrMeta);
  }

  debug(message: string, meta?: Record<string, unknown> | string) {
    if (this.isProd) return; // suppress debug in production
    this.emit('debug', message, meta);
  }

  verbose(message: string, meta?: Record<string, unknown> | string) {
    if (this.isProd) return;
    this.emit('verbose', message, meta);
  }

  private emit(level: LogLevel, message: string, extra?: unknown) {
    const ts = new Date().toISOString();

    if (this.isProd) {
      // Structured JSON — one object per line
      const entry: Record<string, unknown> = {
        ts,
        level,
        context: this.context,
        message,
      };

      if (extra instanceof Error) {
        entry.error = extra.message;
        entry.stack = extra.stack;
      } else if (extra !== undefined) {
        entry.meta = extra;
      }

      process.stdout.write(JSON.stringify(entry) + '\n');
    } else {
      // Human-readable coloured output for development
      const colour = COLOURS[level];
      const reset = '\x1b[0m';
      const dim = '\x1b[2m';

      let line = `${dim}${ts}${reset} ${colour}[${level.toUpperCase().padEnd(7)}]${reset} ${colour}[${this.context}]${reset} ${message}`;

      if (extra instanceof Error) {
        line += `\n${extra.stack ?? extra.message}`;
      } else if (extra !== undefined) {
        const serialised =
          typeof extra === 'string' ? extra : JSON.stringify(extra, null, 2);
        line += `  ${dim}${serialised}${reset}`;
      }

      /* eslint-disable no-console */
      if (level === 'error') console.error(line);
      else if (level === 'warn') console.warn(line);
      else console.log(line);
      /* eslint-enable no-console */
    }
  }
}

const COLOURS: Record<LogLevel, string> = {
  log:     '\x1b[32m', // green
  warn:    '\x1b[33m', // yellow
  error:   '\x1b[31m', // red
  debug:   '\x1b[36m', // cyan
  verbose: '\x1b[35m', // magenta
};
