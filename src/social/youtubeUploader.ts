import fs from 'fs';
import path from 'path';
import { VideoConfig } from '../config/configLoader';
import { google } from 'googleapis';
import { MonitoringService, LogLevel } from '../monitoring';

export class YouTubeUploader {
  private config: VideoConfig;
  private monitoring = MonitoringService.getInstance();
  
  constructor(config: VideoConfig) {
    this.config = config;
  }
  
  /**
   * Authenticate with YouTube API using OAuth2
   * @returns OAuth2 client
   */
  private async authenticate() {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      
      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing required Google API credentials in environment variables');
      }
      
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'urn:ietf:wg:oauth:2.0:oob'
      );
      
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      
      return oauth2Client;
    } catch (error: any) {
      this.monitoring.log(LogLevel.ERROR, `YouTube authentication error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Upload a video to YouTube as a Short
   * @param videoPath Path to the video file
   * @returns YouTube video URL
   */
  public async uploadVideo(videoPath: string): Promise<string> {
    if (!this.config.output.upload) {
      console.log('YouTube upload is disabled in the configuration');
      return '';
    }
    
    console.log(`Uploading video to YouTube Shorts: ${videoPath}`);
    this.monitoring.log(LogLevel.INFO, `Starting YouTube Shorts upload: ${videoPath}`);
    
    try {
      // Verify the video file exists
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }
      
      // Get file size for upload progress tracking
      const fileSize = fs.statSync(videoPath).size;
      console.log(`Video file size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
      
      // Authenticate
      const auth = await this.authenticate();
      const youtube = google.youtube({
        version: 'v3',
        auth
      });
      
      // Generate video metadata optimized for YouTube Shorts
      const title = this.generateShortsTitle();
      const description = this.generateShortsDescription();
      const tags = this.generateShortsTags();
      
      const categoryId = this.config.output.category_id || 
        parseInt(process.env.YOUTUBE_DEFAULT_CATEGORY_ID || '22'); // 22 = People & Blogs
      
      const privacyStatus = this.config.output.privacy_status || 
        (process.env.YOUTUBE_DEFAULT_PRIVACY_STATUS as 'public' | 'unlisted' | 'private') || 
        'public';
      
      console.log('YouTube Shorts metadata:');
      console.log(`- Title: ${title}`);
      console.log(`- Description: ${description}`);
      console.log(`- Tags: ${tags.join(', ')}`);
      console.log(`- Category ID: ${categoryId}`);
      console.log(`- Privacy Status: ${privacyStatus}`);
      
      // Create the YouTube upload
      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: categoryId.toString(),
          },
          status: {
            privacyStatus,
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });
      
      const videoId = res.data.id;
      if (!videoId) {
        throw new Error('Failed to get video ID from upload response');
      }
      
      const videoUrl = `https://youtube.com/shorts/${videoId}`;
      this.monitoring.log(LogLevel.INFO, `YouTube Shorts upload successful: ${videoUrl}`);
      
      return videoUrl;
    } catch (error: any) {
      this.monitoring.log(LogLevel.ERROR, `YouTube Shorts upload failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a title optimized for YouTube Shorts
   * @returns Optimized title
   */
  private generateShortsTitle(): string {
    if (this.config.output.title) {
      return this.config.output.title;
    }
    
    // Generate a title based on the content
    const topic = this.config.prompt.topic;
    const theme = this.config.theme;
    
    // Ensure #shorts is included
    let title = `${topic} - ${theme} | #shorts`;
    
    // Add motivational elements for better engagement
    const motivationalPhrases = [
      'Transform Your Life',
      'Unlock Your Potential',
      'Master Your Mindset',
      'Achieve Your Dreams',
      'Build Your Future'
    ];
    
    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    title = `${randomPhrase} | ${topic} #shorts`;
    
    return title;
  }
  
  /**
   * Generate a description optimized for YouTube Shorts
   * @returns Optimized description
   */
  private generateShortsDescription(): string {
    if (this.config.output.description) {
      return this.config.output.description;
    }
    
    const topic = this.config.prompt.topic;
    const theme = this.config.theme;
    
    // Create an engaging description for Shorts
    let description = `Transform your life through ${topic.toLowerCase()}. `;
    description += `This ${theme} video will inspire you to take action and achieve your goals. `;
    description += `\n\n#shorts #motivation #${theme.toLowerCase().replace('_', '')} #${topic.toLowerCase().replace(' ', '')} #inspiration #growth #mindset`;
    
    return description;
  }
  
  /**
   * Generate tags optimized for YouTube Shorts
   * @returns Array of optimized tags
   */
  private generateShortsTags(): string[] {
    if (this.config.output.tags && this.config.output.tags.length > 0) {
      return this.config.output.tags;
    }
    
    // Generate tags based on content
    const baseTags = [
      'shorts',
      'motivation',
      'inspiration',
      this.config.niche,
      this.config.theme,
      this.config.prompt.topic.toLowerCase().replace(' ', ''),
      'growth',
      'mindset',
      'success',
      'personal development'
    ];
    
    // Add trending tags for better discoverability
    const trendingTags = [
      'motivational',
      'inspirational',
      'self improvement',
      'goal setting',
      'discipline',
      'consistency',
      'achievement',
      'success mindset'
    ];
    
    return [...baseTags, ...trendingTags];
  }
} 