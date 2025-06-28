import { MonitoringService, JobStatus, LogLevel, JobInfo } from './index';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

/**
 * Dashboard configuration interface
 */
interface DashboardConfig {
  refreshInterval: number; // in milliseconds
  maxLogEntries: number;
  showActiveJobsOnly: boolean;
}

/**
 * Real-time monitoring dashboard for displaying logs, job status, and analytics
 */
export class MonitoringDashboard {
  private static instance: MonitoringDashboard;
  private monitoring: MonitoringService;
  private config: DashboardConfig;
  private isRunning: boolean = false;
  private refreshTimer: NodeJS.Timeout | null = null;
  private lastLogTimestamp: Date = new Date(0);
  private lastJobCount: number = 0;
  
  private constructor(config?: Partial<DashboardConfig>) {
    this.monitoring = MonitoringService.getInstance();
    this.config = {
      refreshInterval: config?.refreshInterval || 5000,
      maxLogEntries: config?.maxLogEntries || 10,
      showActiveJobsOnly: config?.showActiveJobsOnly || false
    };
  }
  
  /**
   * Get dashboard instance (singleton)
   * @param config Dashboard configuration
   * @returns Dashboard instance
   */
  public static getInstance(config?: Partial<DashboardConfig>): MonitoringDashboard {
    if (!MonitoringDashboard.instance) {
      MonitoringDashboard.instance = new MonitoringDashboard(config);
    }
    
    return MonitoringDashboard.instance;
  }
  
  /**
   * Start the dashboard
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Dashboard is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting real-time monitoring dashboard...');
    
    // Initial render
    this.render();
    
    // Set up refresh timer
    this.refreshTimer = setInterval(() => {
      this.render();
    }, this.config.refreshInterval);
    
    // Handle process exit
    process.on('SIGINT', () => {
      this.stop();
      process.exit(0);
    });
  }
  
  /**
   * Stop the dashboard
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    this.isRunning = false;
    console.log('Monitoring dashboard stopped');
  }
  
  /**
   * Render the dashboard
   */
  private render(): void {
    // Clear console
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    
    // Get data
    const jobs = this.monitoring.getAllJobs();
    const metrics = this.monitoring.getAnalytics();
    const logs = this.getRecentLogs();
    
    // Check for changes
    const hasNewJobs = jobs.length !== this.lastJobCount;
    this.lastJobCount = jobs.length;
    
    // Print header
    console.log('=== SOFY MONITORING DASHBOARD ===');
    console.log(`Last updated: ${new Date().toISOString()}`);
    console.log('');
    
    // Print active jobs
    console.log('=== ACTIVE JOBS ===');
    const activeJobs = jobs.filter(job => job.status === JobStatus.RUNNING || job.status === JobStatus.PENDING);
    
    if (activeJobs.length === 0) {
      console.log('No active jobs');
    } else {
      activeJobs.forEach(job => {
        this.renderJobInfo(job);
      });
    }
    
    console.log('');
    
    // Print recent jobs if not showing active only
    if (!this.config.showActiveJobsOnly) {
      console.log('=== RECENT JOBS ===');
      const recentJobs = jobs
        .filter(job => job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED)
        .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
        .slice(0, 5);
      
      if (recentJobs.length === 0) {
        console.log('No recent jobs');
      } else {
        recentJobs.forEach(job => {
          this.renderJobInfo(job);
        });
      }
      
      console.log('');
    }
    
    // Print analytics
    console.log('=== ANALYTICS ===');
    console.log(`Total Jobs: ${metrics.totalJobs}`);
    console.log(`Success Rate: ${metrics.successRate.toFixed(2)}%`);
    console.log(`Average Processing Time: ${(metrics.averageProcessingTime / 1000).toFixed(2)} seconds`);
    
    // Print top niches
    const topNiches = Object.entries(metrics.jobsByNiche)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topNiches.length > 0) {
      console.log('Top Niches:');
      topNiches.forEach(([niche, count]) => {
        console.log(`  - ${niche}: ${count} jobs`);
      });
    }
    
    console.log('');
    
    // Print recent logs
    console.log('=== RECENT LOGS ===');
    if (logs.length === 0) {
      console.log('No recent logs');
    } else {
      logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toISOString();
        const level = log.level.toUpperCase().padEnd(7);
        const jobInfo = log.jobId ? `[Job: ${log.jobId}] ` : '';
        console.log(`${timestamp} ${level} ${jobInfo}${log.message}`);
      });
    }
    
    // Update last log timestamp
    if (logs.length > 0) {
      this.lastLogTimestamp = new Date(logs[0].timestamp);
    }
    
    // Print footer
    console.log('');
    console.log('Press Ctrl+C to exit');
  }
  
  /**
   * Render job information
   * @param job Job information
   */
  private renderJobInfo(job: JobInfo): void {
    const duration = job.endTime 
      ? ((job.endTime.getTime() - job.startTime.getTime()) / 1000).toFixed(2)
      : ((new Date().getTime() - job.startTime.getTime()) / 1000).toFixed(2);
    
    let statusColor = '';
    switch (job.status) {
      case JobStatus.RUNNING:
        statusColor = '\x1b[33m'; // Yellow
        break;
      case JobStatus.COMPLETED:
        statusColor = '\x1b[32m'; // Green
        break;
      case JobStatus.FAILED:
        statusColor = '\x1b[31m'; // Red
        break;
      default:
        statusColor = '\x1b[0m'; // Reset
    }
    
    console.log(`${job.id} | ${statusColor}${job.status}\x1b[0m | ${job.niche} | ${job.theme} | ${duration}s${job.currentStep ? ` | Step: ${job.currentStep}` : ''}`);
    
    if (job.error) {
      console.log(`  Error: ${job.error}`);
    }
  }
  
  /**
   * Get recent logs
   * @returns Array of log entries
   */
  private getRecentLogs(): any[] {
    try {
      const logsDir = path.join(process.cwd(), 'data', 'logs');
      
      if (!fs.existsSync(logsDir)) {
        return [];
      }
      
      // Get today's log file
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const logFile = path.join(logsDir, `${today}.log`);
      
      if (!fs.existsSync(logFile)) {
        return [];
      }
      
      // Read log file
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim() !== '');
      
      // Parse log entries
      const logs = [];
      for (let i = logLines.length - 1; i >= 0; i--) {
        try {
          const line = logLines[i];
          const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
          
          if (timestampMatch) {
            const timestamp = new Date(timestampMatch[1]);
            
            // Skip if older than last timestamp
            if (timestamp <= this.lastLogTimestamp && logs.length > 0) {
              continue;
            }
            
            const levelMatch = line.match(/^[\d\-T:.Z]+ (\w+)\s+/);
            const level = levelMatch ? levelMatch[1].toLowerCase() : 'info';
            
            const jobIdMatch = line.match(/\[Job: ([^\]]+)\]/);
            const jobId = jobIdMatch ? jobIdMatch[1] : undefined;
            
            const message = line.replace(/^[\d\-T:.Z]+ \w+\s+(\[Job: [^\]]+\] )?/, '');
            
            logs.push({
              timestamp,
              level,
              jobId,
              message
            });
            
            if (logs.length >= this.config.maxLogEntries) {
              break;
            }
          }
        } catch (error) {
          // Skip invalid log entries
        }
      }
      
      return logs.reverse();
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }
} 