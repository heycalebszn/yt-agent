export * from './jobTracker';
export * from './logger';
export * from './analytics';

import { JobTracker, JobInfo, JobStatus, JobStep } from './jobTracker';
import { Logger, LogLevel } from './logger';
import { AnalyticsService, AnalyticsMetrics } from './analytics';
import { VideoConfig } from '../config/configLoader';

/**
 * Main monitoring service that combines job tracking, logging, and analytics
 */
export class MonitoringService {
  private static instance: MonitoringService;
  private jobTracker: JobTracker;
  private logger: Logger;
  private analyticsService: AnalyticsService;
  
  private constructor() {
    this.jobTracker = new JobTracker();
    this.logger = Logger.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
  }
  
  /**
   * Get monitoring service instance (singleton)
   * @returns Monitoring service instance
   */
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    
    return MonitoringService.instance;
  }
  
  /**
   * Start tracking a new job
   * @param config Video configuration
   * @returns Job ID
   */
  public startJob(config: VideoConfig): string {
    const jobId = this.jobTracker.createJob(config);
    this.logger.info(`Started new job with ID: ${jobId}`, jobId, { niche: config.niche, theme: config.theme });
    this.jobTracker.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.INIT);
    return jobId;
  }
  
  /**
   * Update job status
   * @param jobId Job ID
   * @param status New status
   * @param step Current step
   * @param error Error message (if any)
   */
  public updateJobStatus(jobId: string, status: JobStatus, step?: JobStep, error?: string): void {
    this.jobTracker.updateJobStatus(jobId, status, step, error);
    
    if (error) {
      this.logger.error(`Job ${jobId} encountered an error in step ${step}: ${error}`, jobId);
    } else {
      this.logger.info(`Job ${jobId} status updated to ${status}${step ? ` (step: ${step})` : ''}`, jobId);
    }
    
    // If job is completed or failed, update analytics
    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      const jobInfo = this.jobTracker.getJobInfo(jobId);
      if (jobInfo) {
        this.analyticsService.trackJob(jobInfo);
        
        if (status === JobStatus.COMPLETED) {
          this.logger.info(`Job ${jobId} completed successfully`, jobId);
        } else {
          this.logger.warning(`Job ${jobId} failed`, jobId);
        }
      }
    }
  }
  
  /**
   * Set job output path
   * @param jobId Job ID
   * @param outputPath Path to the output file
   */
  public setJobOutput(jobId: string, outputPath: string): void {
    this.jobTracker.setJobOutput(jobId, outputPath);
    this.logger.info(`Job ${jobId} output set to ${outputPath}`, jobId);
  }
  
  /**
   * Get job information
   * @param jobId Job ID
   * @returns Job information
   */
  public getJobInfo(jobId: string): JobInfo | undefined {
    return this.jobTracker.getJobInfo(jobId);
  }
  
  /**
   * Get all jobs
   * @returns Array of job information
   */
  public getAllJobs(): JobInfo[] {
    return this.jobTracker.getAllJobs();
  }
  
  /**
   * Get analytics metrics
   * @returns Analytics metrics
   */
  public getAnalytics(): AnalyticsMetrics {
    return this.analyticsService.getMetrics();
  }
  
  /**
   * Generate an analytics report
   * @returns Analytics report as a string
   */
  public generateAnalyticsReport(): string {
    return this.analyticsService.generateReport();
  }
  
  /**
   * Log a message
   * @param level Log level
   * @param message Log message
   * @param jobId Job ID (optional)
   * @param data Additional data (optional)
   */
  public log(level: LogLevel, message: string, jobId?: string, data?: any): void {
    this.logger.log(level, message, jobId, data);
  }
} 