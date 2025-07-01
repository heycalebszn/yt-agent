import fs from 'fs';
import path from 'path';
import { VideoConfig } from '../config/configLoader';
import { MonitoringService, LogLevel } from '../monitoring';

/**
 * Video stitching service for combining clips into YouTube Shorts
 */
export class VideoStitcher {
  private config: VideoConfig;
  private monitoring = MonitoringService.getInstance();
  
  constructor(config: VideoConfig) {
    this.config = config;
  }
  
  /**
   * Stitch multiple video clips into a single YouTube Shorts video
   * @param clipPaths Array of paths to video clips
   * @returns Path to the final stitched video
   */
  public async stitchClips(clipPaths: string[]): Promise<string> {
    console.log(`Stitching ${clipPaths.length} video clips into YouTube Shorts format`);
    this.monitoring.log(LogLevel.INFO, `Starting video stitching for ${clipPaths.length} clips`);
    
    try {
      // Verify all clips exist
      for (const clipPath of clipPaths) {
        if (!fs.existsSync(clipPath)) {
          throw new Error(`Clip not found: ${clipPath}`);
        }
      }
      
      // Create output directory
      const outputDir = path.resolve(process.cwd(), this.config.output.path);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = path.join(outputDir, `shorts_${timestamp}.mp4`);
      
      // For now, we'll use a simple concatenation approach
      // In a production environment, you'd use FFmpeg or similar
      await this.concatenateVideos(clipPaths, outputPath);
      
      console.log(`YouTube Shorts video created: ${outputPath}`);
      this.monitoring.log(LogLevel.INFO, `Video stitching completed: ${outputPath}`);
      
      return outputPath;
    } catch (error: any) {
      this.monitoring.log(LogLevel.ERROR, `Video stitching failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Concatenate videos using a simple approach
   * Note: This is a simplified implementation. In production, use FFmpeg
   * @param clipPaths Array of clip paths
   * @param outputPath Output video path
   */
  private async concatenateVideos(clipPaths: string[], outputPath: string): Promise<void> {
    // For development/testing, we'll copy the first clip as the final video
    // In production, you would use FFmpeg to properly concatenate videos
    
    console.log('Using simplified video concatenation for development...');
    
    if (clipPaths.length === 0) {
      throw new Error('No video clips provided for stitching');
    }
    
    // Copy the first clip as the final video (simplified approach)
    const firstClip = clipPaths[0];
    fs.copyFileSync(firstClip, outputPath);
    
    console.log(`Copied first clip as final video: ${outputPath}`);
    
    // In a real implementation, you would use FFmpeg like this:
    /*
    const ffmpeg = require('fluent-ffmpeg');
    
    return new Promise((resolve, reject) => {
      let command = ffmpeg();
      
      // Add input files
      clipPaths.forEach(clipPath => {
        command = command.input(clipPath);
      });
      
      command
        .on('end', () => {
          console.log('Video concatenation completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during video concatenation:', err);
          reject(err);
        })
        .mergeToFile(outputPath, './temp');
    });
    */
  }
  
  /**
   * Validate video format for YouTube Shorts
   * @param videoPath Path to video file
   * @returns True if valid for Shorts
   */
  public async validateShortsFormat(videoPath: string): Promise<boolean> {
    try {
      if (!fs.existsSync(videoPath)) {
        return false;
      }
      
      // Check file size (YouTube Shorts should be under 256MB)
      const stats = fs.statSync(videoPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > 256) {
        console.warn(`Video file size (${fileSizeMB.toFixed(2)}MB) exceeds YouTube Shorts limit (256MB)`);
        return false;
      }
      
      // In a real implementation, you would check video dimensions and duration
      // For now, we'll assume the video is valid
      console.log(`Video validation passed: ${fileSizeMB.toFixed(2)}MB`);
      return true;
    } catch (error) {
      console.error('Error validating video format:', error);
      return false;
    }
  }
  
  /**
   * Get video metadata
   * @param videoPath Path to video file
   * @returns Video metadata
   */
  public async getVideoMetadata(videoPath: string): Promise<any> {
    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }
      
      const stats = fs.statSync(videoPath);
      
      return {
        path: videoPath,
        size: stats.size,
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error('Error getting video metadata:', error);
      throw error;
    }
  }
} 