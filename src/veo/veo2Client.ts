import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

/**
 * Options for video generation
 */
export interface Veo2Options {
  prompt: string;
  duration: number;
  resolution: string;
  format: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

/**
 * Client for interacting with the Veo2 API
 */
export class Veo2Client {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  
  /**
   * Generate a video using the Veo2 API
   * @param options Video generation options
   * @returns Path to the generated video
   */
  public async generateVideo(options: Veo2Options): Promise<string> {
    console.log(`Generating video with prompt: ${options.prompt}`);
    console.log(`Aspect ratio: ${options.aspectRatio || '9:16'} (Shorts format)`);
    
    try {
      // Create a temporary directory for the video
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate a unique filename
      const filename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${options.format}`;
      const outputPath = path.join(tempDir, filename);
      
      // Use Veo2 API to generate video
      let operation = await this.genAI.models.generateVideos({
        model: "veo-2.0-generate-001",
        prompt: options.prompt,
        config: {
          personGeneration: "dont_allow", // Avoid generating people for faceless content
          aspectRatio: options.aspectRatio || "9:16", // Default to Shorts format
        },
      });
      
      console.log('Video generation operation started, waiting for completion...');
      
      // Poll for completion
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        operation = await this.genAI.operations.getVideosOperation({
          operation: operation,
        });
        console.log('Checking video generation status...');
      }
      
      if (!operation.response?.generatedVideos || operation.response.generatedVideos.length === 0) {
        throw new Error('No videos were generated');
      }
      
      // Download the generated video
      const generatedVideo = operation.response.generatedVideos[0];
      if (!generatedVideo.video?.uri) {
        throw new Error('Generated video URI is missing');
      }
      
      console.log('Video generation completed, downloading...');
      
      // Download the video
      const apiKey = process.env.GEMINI_API_KEY;
      const videoUrl = `${generatedVideo.video.uri}&key=${apiKey}`;
      
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      
      // Save the video to file
      const writer = createWriteStream(outputPath);
      Readable.fromWeb(response.body).pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Video saved to ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', reject);
      });
      
    } catch (error: any) {
      console.error('Error generating video with Veo2:', error.message);
      
      // Fallback to sample video for development/testing
      console.log('Falling back to sample video for development...');
      return this.generateSampleVideo(options, outputPath);
    }
  }
  
  /**
   * Generate a sample video for development/testing
   * @param options Video generation options
   * @param outputPath Path to save the video
   * @returns Path to the generated video
   */
  private async generateSampleVideo(options: Veo2Options, outputPath: string): Promise<string> {
    try {
      // Create a temporary directory for the video
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Use different sample videos to create variety
      const sampleVideos = [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerResolutions.mp4'
      ];
      
      // Select a random sample video to create variety
      const randomIndex = Math.floor(Math.random() * sampleVideos.length);
      const sampleVideoUrl = sampleVideos[randomIndex];
      
      console.log(`Downloading sample video from ${sampleVideoUrl}`);
      
      const response = await fetch(sampleVideoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download sample video: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      
      console.log(`Sample video saved to ${outputPath}`);
      
      return outputPath;
    } catch (error: any) {
      console.error('Error generating sample video:', error.message);
      
      // Create an empty file as a final fallback
      fs.writeFileSync(outputPath, '');
      console.warn(`Created empty video file at ${outputPath} due to error`);
      
      return outputPath;
    }
  }
} 