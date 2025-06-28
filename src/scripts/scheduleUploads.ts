import { CronJob } from 'cron';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { ConfigLoader } from '../config/configLoader';
import { YouTubeUploader } from '../social/youtubeUploader';
import { MonitoringService, LogLevel, MonitoringDashboard } from '../monitoring';
import { generateVideo } from './generateVideo';

// Load environment variables
dotenv.config();

/**
 * Schedule YouTube Shorts uploads using cron
 */
async function scheduleYouTubeUploads(): Promise<void> {
  const monitoring = MonitoringService.getInstance();
  
  // Get settings from environment variables
  const cronSchedule = process.env.CRON_SCHEDULE || '0 12 * * *'; // Default: daily at noon
  const timezone = process.env.TIMEZONE || 'America/New_York';
  const autoUploadEnabled = process.env.AUTO_UPLOAD_ENABLED === 'true';
  const configPath = process.env.DEFAULT_CONFIG_PATH || './config/motivational.yaml';
  const enableDashboard = process.env.ENABLE_DASHBOARD !== 'false'; // Default to true
  
  if (!autoUploadEnabled) {
    console.log('Automatic YouTube uploads are disabled. Set AUTO_UPLOAD_ENABLED=true to enable.');
    return;
  }
  
  // Start monitoring dashboard if enabled
  if (enableDashboard) {
    const dashboard = MonitoringDashboard.getInstance();
    dashboard.start();
  }
  
  console.log(`Scheduling YouTube Shorts uploads with cron pattern: ${cronSchedule} (${timezone})`);
  monitoring.log(LogLevel.INFO, `YouTube Shorts upload scheduler started with pattern: ${cronSchedule} (${timezone})`);
  
  // Create cron job
  const job = new CronJob(
    cronSchedule,
    async function() {
      try {
        const jobStartTime = new Date();
        console.log(`Running scheduled YouTube Shorts upload job at ${jobStartTime.toISOString()}`);
        monitoring.log(LogLevel.INFO, `Starting scheduled YouTube Shorts upload job`, undefined, { timestamp: jobStartTime });
        
        // Load configuration
        const config = ConfigLoader.loadConfig(configPath);
        
        // Add YouTube metadata to the config if not present
        if (!config.output.title && process.env.YOUTUBE_SHORTS_DEFAULT_TITLE) {
          config.output.title = process.env.YOUTUBE_SHORTS_DEFAULT_TITLE;
        }
        if (!config.output.description && process.env.YOUTUBE_SHORTS_DEFAULT_DESCRIPTION) {
          config.output.description = process.env.YOUTUBE_SHORTS_DEFAULT_DESCRIPTION;
        }
        if (!config.output.tags && process.env.YOUTUBE_DEFAULT_TAGS) {
          config.output.tags = process.env.YOUTUBE_DEFAULT_TAGS.split(',');
        }
        
        // Set upload flag
        config.output.upload = true;
        
        // Generate the video
        await generateVideo(configPath);
        
        // Get the latest generated video
        const outputPath = process.env.VIDEO_OUTPUT_PATH || './output';
        const videoFiles = fs.readdirSync(outputPath)
          .filter((file: string) => file.endsWith('.mp4'))
          .map((file: string) => ({
            name: file,
            time: fs.statSync(path.join(outputPath, file)).mtime.getTime()
          }))
          .sort((a: any, b: any) => b.time - a.time);
        
        if (videoFiles.length === 0) {
          throw new Error('No video files found in output directory');
        }
        
        const latestVideo = path.join(outputPath, videoFiles[0].name);
        
        // Upload to YouTube
        const uploader = new YouTubeUploader(config);
        const videoUrl = await uploader.uploadVideo(latestVideo);
        
        const jobEndTime = new Date();
        const duration = (jobEndTime.getTime() - jobStartTime.getTime()) / 1000;
        
        console.log(`Successfully uploaded YouTube Short: ${videoUrl}`);
        console.log(`Job completed in ${duration.toFixed(2)} seconds`);
        
        monitoring.log(LogLevel.INFO, `Scheduled upload completed: ${videoUrl}`, undefined, { 
          duration,
          videoPath: latestVideo,
          videoUrl
        });
      } catch (error: any) {
        console.error('Error in scheduled upload:', error.message);
        monitoring.log(LogLevel.ERROR, `Scheduled upload failed: ${error.message}`);
      }
    },
    null, // onComplete
    true,  // start immediately
    timezone
  );
  
  console.log(`Scheduler started. Next run scheduled for: ${job.nextDates()}`);
  monitoring.log(LogLevel.INFO, `Next scheduled run: ${job.nextDates()}`);
}

// If this script is run directly
if (require.main === module) {
  scheduleYouTubeUploads()
    .then(() => {
      console.log('YouTube upload scheduler initialized');
    })
    .catch((error) => {
      console.error('Error initializing YouTube upload scheduler:', error);
      process.exit(1);
    });
}

export { scheduleYouTubeUploads }; 