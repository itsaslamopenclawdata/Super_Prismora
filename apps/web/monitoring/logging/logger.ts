/**
 * Centralized logging for PhotoIdentifier frontend
 * Integrates with ELK stack for log aggregation and search
 */

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  page?: string;
  userAgent?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  logger: string;
  message: string;
  service: string;
  environment: string;
  version: string;
  context?: LogContext;
  stackTrace?: string;
}

class Logger {
  private serviceName: string;
  private environment: string;
  private version: string;
  private isBrowser: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 50;

  constructor() {
    this.serviceName = 'photoidentifier-frontend';
    this.environment = process.env.NODE_ENV || 'development';
    this.version = process.env.npm_package_version || '0.1.0';
    this.isBrowser = typeof window !== 'undefined';

    // Setup global error handler
    if (this.isBrowser) {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  private createLogEntry(level: LogEntry['level'], message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      logger: this.serviceName,
      message,
      service: this.serviceName,
      environment: this.environment,
      version: this.version,
      context,
    };
  }

  private async sendToLogstash(entry: LogEntry): Promise<void> {
    // In development, log to console
    if (this.environment === 'development') {
      console.log(`[${entry.level.toUpperCase()}]`, entry);
      return;
    }

    // In production, send to Logstash
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // If logging fails, buffer the log entry
      this.bufferLog(entry);
    }
  }

  private bufferLog(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext): void {
    const entry = this.createLogEntry(level, message, context);
    this.sendToLogstash(entry);
  }

  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('error', message, context);
    if (error) {
      entry.stackTrace = error.stack;
    }
    this.sendToLogstash(entry);
  }

  private handleError(event: ErrorEvent): void {
    this.error(event.message, event.error, {
      source: event.filename,
      line: event.lineno,
      col: event.colno,
      type: 'window.error',
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.error(
      'Unhandled promise rejection',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        type: 'promise.rejection',
      }
    );
  }

  // Method to log page views
  public logPageView(page: string): void {
    this.info(`Page view: ${page}`, {
      page,
      type: 'page.view',
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    });
  }

  // Method to log user actions
  public logUserAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      type: 'user.action',
      action,
      ...context,
    });
  }

  // Method to log API calls
  public logApiCall(endpoint: string, method: string, status: number, duration: number): void {
    this.info(`API call: ${method} ${endpoint}`, {
      type: 'api.call',
      endpoint,
      method,
      status,
      duration,
    });
  }

  // Method to log performance metrics
  public logPerformance(name: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${name}`, {
      type: 'performance',
      name,
      duration,
      ...context,
    });
  }
}

// Create singleton logger instance
const logger = new Logger();

// Export logger
export default logger;

// Export types
export type { LogContext, LogEntry };
