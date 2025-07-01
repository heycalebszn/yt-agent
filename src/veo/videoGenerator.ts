import fs from 'fs';
import path from 'path';
import { GeminiService } from '../services/geminiService';
import { VideoConfig } from '../config/configLoader';
import { Veo2Client, Veo2Options } from './veo2Client';
import { PromptGenerator } from '../prompts/promptGenerator';

export class VideoGenerator {
  private geminiService: GeminiService;
  private veo2Client: Veo2Client;
  private promptGenerator: PromptGenerator;
  private config: VideoConfig;
  private outputDir: string;
  
  constructor(config: VideoConfig) {
    this.geminiService = new GeminiService();
    this.veo2Client = new Veo2Client();
    this.promptGenerator = new PromptGenerator();
    this.config = config;
    this.outputDir = path.resolve(process.cwd(), this.config.output.path);
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Generate a series of short video clips based on the configuration
   * @returns Array of paths to generated video clips
   */
  public async generateVideoClips(): Promise<string[]> {
    const { duration, video } = this.config;
    const clipLength = video.stitch_length;
    const numberOfClips = Math.ceil(duration / clipLength);
    
    console.log(`Generating ${numberOfClips} video clips of ${clipLength} seconds each`);
    console.log(`Video format: ${video.format}, Resolution: ${video.resolution}`);
    console.log(`Aspect ratio: 9:16 (YouTube Shorts format)`);
    
    const videoPrompts = await this.promptGenerator.generateVideoPrompts(this.config, numberOfClips);
    const videoClipPaths: string[] = [];
    
    for (let i = 0; i < numberOfClips; i++) {
      console.log(`Generating clip ${i + 1}/${numberOfClips}`);
      
      try {
        // Generate a video clip using Veo2
        const clipPath = await this.generateSingleClip(videoPrompts[i], i);
        videoClipPaths.push(clipPath);
      } catch (error: any) {
        console.error(`Error generating clip ${i + 1}:`, error.message);
        // Continue with the next clip
      }
    }
    
    return videoClipPaths;
  }
  
  /**
   * Generate a single video clip using Veo2
   * @param prompt The prompt for this specific clip
   * @param index The index of the clip
   * @returns Path to the generated video clip
   */
  private async generateSingleClip(prompt: string, index: number): Promise<string> {
    const outputPath = path.join(this.outputDir, `clip_${index + 1}.mp4`);
    
    // Configure Veo2 options for YouTube Shorts
    const veo2Options: Veo2Options = {
      prompt,
      duration: this.config.video.stitch_length,
      resolution: this.config.video.resolution,
      format: this.config.video.format,
      aspectRatio: '9:16', // YouTube Shorts format
    };
    
    // Generate the video using Veo2
    const videoPath = await this.veo2Client.generateVideo(veo2Options);
    
    // Copy the generated video to the output directory
    fs.copyFileSync(videoPath, outputPath);
    console.log(`Video clip ${index + 1} saved to: ${outputPath}`);
    
    return outputPath;
  }
} 