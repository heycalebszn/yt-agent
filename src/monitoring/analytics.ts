import fs from 'fs';
import path from 'path';
import { JobInfo, JobStatus } from './jobTracker';

/**
 * Analytics metrics interface
 */
export interface AnalyticsMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number; // in milliseconds
  successRate: number; // percentage
  jobsByNiche: Record<string, number>;
  processingTimeByNiche: Record<string, number>; // average in milliseconds
}

/**
 * Analytics service for tracking and analyzing job metrics
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private metricsFile: string;
  private metrics: AnalyticsMetrics;
  
  private constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    const analyticsDir = path.join(dataDir, 'analytics');
    
    // Ensure analytics directory exists
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true });
    }
    
    this.metricsFile = path.join(analyticsDir, 'metrics.json');
    this.metrics = this.loadMetrics();
  }
  
  /**
   * Get analytics service instance (singleton)
   * @returns Analytics service instance
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    
    return AnalyticsService.instance;
  }
  
  /**
   * Update metrics with new job information
   * @param job Job information
   */
  public trackJob(job: JobInfo): void {
    // Increment total jobs
    this.metrics.totalJobs++;
    
    // Update niche counts
    if (!this.metrics.jobsByNiche[job.niche]) {
      this.metrics.jobsByNiche[job.niche] = 0;
    }
    this.metrics.jobsByNiche[job.niche]++;
    
    // Update status counts
    if (job.status === JobStatus.COMPLETED) {
      this.metrics.completedJobs++;
    } else if (job.status === JobStatus.FAILED) {
      this.metrics.failedJobs++;
    }
    
    // Update processing time metrics if job is completed or failed
    if ((job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) && job.endTime) {
      const processingTime = job.endTime.getTime() - job.startTime.getTime();
      
      // Update average processing time
      const totalProcessingTime = this.metrics.averageProcessingTime * (this.metrics.completedJobs + this.metrics.failedJobs - 1);
      this.metrics.averageProcessingTime = (totalProcessingTime + processingTime) / (this.metrics.completedJobs + this.metrics.failedJobs);
      
      // Update processing time by niche
      if (!this.metrics.processingTimeByNiche[job.niche]) {
        this.metrics.processingTimeByNiche[job.niche] = processingTime;
      } else {
        const jobsForNiche = this.metrics.jobsByNiche[job.niche];
        const totalTimeForNiche = this.metrics.processingTimeByNiche[job.niche] * (jobsForNiche - 1);
        this.metrics.processingTimeByNiche[job.niche] = (totalTimeForNiche + processingTime) / jobsForNiche;
      }
    }
    
    // Update success rate
    this.metrics.successRate = this.metrics.totalJobs > 0 
      ? (this.metrics.completedJobs / this.metrics.totalJobs) * 100 
      : 0;
    
    // Save updated metrics
    this.saveMetrics();
  }
  
  /**
   * Get current analytics metrics
   * @returns Analytics metrics
   */
  public getMetrics(): AnalyticsMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Generate a report of the current metrics
   * @returns Report as a string
   */
  public generateReport(): string {
    const { totalJobs, completedJobs, failedJobs, averageProcessingTime, successRate, jobsByNiche, processingTimeByNiche } = this.metrics;
    
    let report = '=== SOFY Analytics Report ===\n\n';
    
    report += `Total Jobs: ${totalJobs}\n`;
    report += `Completed Jobs: ${completedJobs}\n`;
    report += `Failed Jobs: ${failedJobs}\n`;
    report += `Success Rate: ${successRate.toFixed(2)}%\n`;
    report += `Average Processing Time: ${(averageProcessingTime / 1000).toFixed(2)} seconds\n\n`;
    
    report += '=== Jobs by Niche ===\n';
    Object.entries(jobsByNiche).forEach(([niche, count]) => {
      report += `${niche}: ${count} jobs\n`;
    });
    
    report += '\n=== Average Processing Time by Niche ===\n';
    Object.entries(processingTimeByNiche).forEach(([niche, time]) => {
      report += `${niche}: ${(time / 1000).toFixed(2)} seconds\n`;
    });
    
    return report;
  }
  
  /**
   * Load metrics from file
   * @returns Analytics metrics
   */
  private loadMetrics(): AnalyticsMetrics {
    if (fs.existsSync(this.metricsFile)) {
      try {
        const data = fs.readFileSync(this.metricsFile, 'utf8');
        return JSON.parse(data) as AnalyticsMetrics;
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    }
    
    // Return default metrics if file doesn't exist or there's an error
    return {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageProcessingTime: 0,
      successRate: 0,
      jobsByNiche: {},
      processingTimeByNiche: {}
    };
  }
  
  /**
   * Save metrics to file
   */
  private saveMetrics(): void {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }
} 