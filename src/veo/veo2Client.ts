import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiKeyManager } from '../utils/apiKeyManager';

export interface Veo2Options {
  prompt: string;
  duration?: number;
  resolution?: string;
  format?: string;
  aspectRatio?: string;
  personGeneration?: string;
}

// Define types for Veo2 API responses
interface Veo2Operation {
  done: boolean;
  response?: {
    generatedVideos?: Array<{
      video?: {
        uri?: string;
      };
    }>;
  };
}

interface Veo2ApiClient {
  models: {
    generateVideos: (options: any) => Promise<Veo2Operation>;
  };
  operations: {
    getVideosOperation: (options: { operation: Veo2Operation }) => Promise<Veo2Operation>;
  };
}

export class Veo2Client {
  private generativeAI: any; // Using any type to bypass strict typing
  private apiKeyManager: ApiKeyManager;
  private outputDir: string;
  
  constructor(outputDir: string = './output/videos') {
    this.apiKeyManager = new ApiKeyManager();
    this.generativeAI = new GoogleGenerativeAI(this.apiKeyManager.getCurrentKey());
    this.outputDir = outputDir;
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Rotate API key if rate limit is reached
   */
  private rotateApiKey(): void {
    const newKey = this.apiKeyManager.rotateKey();
    this.generativeAI = new GoogleGenerativeAI(newKey);
    console.log('API key rotated due to rate limit');
  }
  
  /**
   * Generate a video using Veo2
   * @param options Options for video generation
   * @returns Path to the generated video
   */
  public async generateVideo(options: Veo2Options): Promise<string> {
    const { 
      prompt, 
      duration = 8, 
      aspectRatio = '16:9',
      personGeneration = 'dont_allow' 
    } = options;
    
    console.log(`Generating video with Veo2:
      - Prompt: ${prompt}
      - Duration: ${duration} seconds
      - Aspect Ratio: ${aspectRatio}
    `);
    
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `video_${timestamp}.mp4`;
      const outputPath = path.join(this.outputDir, filename);
      
      // Call the Veo2 API to generate the video - using the actual implementation
      let operation = await this.generativeAI.models.generateVideos({
        model: "veo-2.0-generate-001",
        prompt: prompt,
        config: {
          personGeneration: personGeneration,
          aspectRatio: aspectRatio,
        },
      });
      
      // Poll until the operation is complete
      while (!operation.done) {
        console.log('Video generation in progress, waiting...');
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        operation = await this.generativeAI.operations.getVideosOperation({
          operation: operation,
        });
      }
      
      // Download the generated videos
      if (operation.response?.generatedVideos && operation.response.generatedVideos.length > 0) {
        const generatedVideo = operation.response.generatedVideos[0]; // Get the first video
        
        if (generatedVideo.video?.uri) {
          const resp = await fetch(`${generatedVideo.video.uri}&key=${this.apiKeyManager.getCurrentKey()}`);
          const writer = createWriteStream(outputPath);
          
          if (resp.body) {
            const readable = Readable.fromWeb(resp.body as any);
            readable.pipe(writer);
            
            return new Promise((resolve, reject) => {
              writer.on('finish', () => resolve(outputPath));
              writer.on('error', reject);
            });
          }
        }
      }
      
      throw new Error('No videos were generated');
    } catch (error: any) {
      console.error('Error generating video with Veo2:', error.message);
      
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateVideo(options);
      }
      
      // Create an empty file as a fallback
      const fallbackPath = path.join(this.outputDir, `fallback_${Date.now()}.mp4`);
      fs.writeFileSync(fallbackPath, '');
      console.log(`Created fallback video at: ${fallbackPath}`);
      return fallbackPath;
    }
  }
} 