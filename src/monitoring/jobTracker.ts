import fs from 'fs';
import path from 'path';
import { VideoConfig } from '../config/configLoader';

/**
 * Job status enum
 */
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Job step enum
 */
export enum JobStep {
  INIT = 'initialization',
  VIDEO_GENERATION = 'video_generation',
  SCRIPT_GENERATION = 'script_generation',
  VOICEOVER_GENERATION = 'voiceover_generation',
  MUSIC_GENERATION = 'music_generation',
  VIDEO_EDITING = 'video_editing',
  FINAL_RENDER = 'final_render'
}

/**
 * Job information interface
 */
export interface JobInfo {
  id: string;
  niche: string;
  theme: string;
  startTime: Date;
  endTime?: Date;
  status: JobStatus;
  currentStep?: JobStep;
  error?: string;
  outputPath?: string;
}

/**
 * Job tracker for monitoring video generation jobs
 */
export class JobTracker {
  private jobs: Map<string, JobInfo>;
  private jobsDir: string;
  
  constructor() {
    this.jobs = new Map<string, JobInfo>();
    this.jobsDir = path.join(process.cwd(), 'data', 'jobs');
    
    // Ensure jobs directory exists
    if (!fs.existsSync(this.jobsDir)) {
      fs.mkdirSync(this.jobsDir, { recursive: true });
    }
    
    // Load existing jobs
    this.loadJobs();
  }
  
  /**
   * Create a new job
   * @param config Video configuration
   * @returns Job ID
   */
  public createJob(config: VideoConfig): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const jobInfo: JobInfo = {
      id: jobId,
      niche: config.niche,
      theme: config.theme,
      startTime: new Date(),
      status: JobStatus.PENDING
    };
    
    this.jobs.set(jobId, jobInfo);
    this.saveJob(jobInfo);
    
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
    const job = this.jobs.get(jobId);
    
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }
    
    job.status = status;
    
    if (step) {
      job.currentStep = step;
    }
    
    if (error) {
      job.error = error;
    }
    
    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      job.endTime = new Date();
    }
    
    this.saveJob(job);
  }
  
  /**
   * Set job output path
   * @param jobId Job ID
   * @param outputPath Path to the output file
   */
  public setJobOutput(jobId: string, outputPath: string): void {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }
    
    job.outputPath = outputPath;
    this.saveJob(job);
  }
  
  /**
   * Get job information
   * @param jobId Job ID
   * @returns Job information
   */
  public getJobInfo(jobId: string): JobInfo | undefined {
    return this.jobs.get(jobId);
  }
  
  /**
   * Get all jobs
   * @returns Array of job information
   */
  public getAllJobs(): JobInfo[] {
    return Array.from(this.jobs.values());
  }
  
  /**
   * Save job to disk
   * @param job Job information
   */
  private saveJob(job: JobInfo): void {
    const jobPath = path.join(this.jobsDir, `${job.id}.json`);
    fs.writeFileSync(jobPath, JSON.stringify(job, null, 2));
  }
  
  /**
   * Load jobs from disk
   */
  private loadJobs(): void {
    if (!fs.existsSync(this.jobsDir)) {
      return;
    }
    
    const jobFiles = fs.readdirSync(this.jobsDir).filter(file => file.endsWith('.json'));
    
    for (const jobFile of jobFiles) {
      try {
        const jobPath = path.join(this.jobsDir, jobFile);
        const jobData = fs.readFileSync(jobPath, 'utf8');
        const job = JSON.parse(jobData) as JobInfo;
        
        // Convert string dates back to Date objects
        job.startTime = new Date(job.startTime);
        if (job.endTime) {
          job.endTime = new Date(job.endTime);
        }
        
        this.jobs.set(job.id, job);
      } catch (error) {
        console.error(`Error loading job from ${jobFile}:`, error);
      }
    }
  }
} 