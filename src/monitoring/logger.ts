import fs from 'fs';
import path from 'path';

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  jobId?: string;
  data?: any;
}

/**
 * Logger for the monitoring system
 */
export class Logger {
  private static instance: Logger;
  private logsDir: string;
  private currentLogFile: string;
  
  private constructor() {
    this.logsDir = path.join(process.cwd(), 'data', 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    // Set up log file for today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    this.currentLogFile = path.join(this.logsDir, `${today}.log`);
  }
  
  /**
   * Get logger instance (singleton)
   * @returns Logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    
    return Logger.instance;
  }
  
  /**
   * Log a message
   * @param level Log level
   * @param message Log message
   * @param jobId Job ID (optional)
   * @param data Additional data (optional)
   */
  public log(level: LogLevel, message: string, jobId?: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      jobId,
      data
    };
    
    // Write to console
    const formattedMessage = this.formatLogEntry(entry);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARNING:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
    
    // Write to file
    this.writeToFile(entry);
  }
  
  /**
   * Log a debug message
   * @param message Log message
   * @param jobId Job ID (optional)
   * @param data Additional data (optional)
   */
  public debug(message: string, jobId?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, jobId, data);
  }
  
  /**
   * Log an info message
   * @param message Log message
   * @param jobId Job ID (optional)
   * @param data Additional data (optional)
   */
  public info(message: string, jobId?: string, data?: any): void {
    this.log(LogLevel.INFO, message, jobId, data);
  }
  
  /**
   * Log a warning message
   * @param message Log message
   * @param jobId Job ID (optional)
   * @param data Additional data (optional)
   */
  public warning(message: string, jobId?: string, data?: any): void {
    this.log(LogLevel.WARNING, message, jobId, data);
  }
  
  /**
   * Log an error message
   * @param message Log message
   * @param jobId Job ID (optional)
   * @param data Additional data (optional)
   */
  public error(message: string, jobId?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, jobId, data);
  }
  
  /**
   * Format a log entry for console output
   * @param entry Log entry
   * @returns Formatted log entry
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(7);
    const jobInfo = entry.jobId ? `[Job: ${entry.jobId}] ` : '';
    
    let message = `${timestamp} ${level} ${jobInfo}${entry.message}`;
    
    if (entry.data) {
      message += `\n${JSON.stringify(entry.data, null, 2)}`;
    }
    
    return message;
  }
  
  /**
   * Write a log entry to file
   * @param entry Log entry
   */
  private writeToFile(entry: LogEntry): void {
    try {
      const formattedEntry = this.formatLogEntry(entry) + '\n';
      fs.appendFileSync(this.currentLogFile, formattedEntry);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }
} 