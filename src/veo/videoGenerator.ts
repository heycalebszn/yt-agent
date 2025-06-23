import fs from 'fs';
import path from 'path';
import { GeminiService } from '../services/geminiService';
import { VideoConfig } from '../config/configLoader';
import { Veo2Client, Veo2Options } from './veo2Client';

export class VideoGenerator {
  private geminiService: GeminiService;
  private veo2Client: Veo2Client;
  private config: VideoConfig;
  private outputDir: string;
  
  constructor(config: VideoConfig) {
    this.geminiService = new GeminiService();
    this.veo2Client = new Veo2Client();
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
    const { duration, video, prompt } = this.config;
    const clipLength = video.stitch_length;
    const numberOfClips = Math.ceil(duration / clipLength);
    
    console.log(`Generating ${numberOfClips} video clips of ${clipLength} seconds each`);
    
    const videoPrompts = await this.generateVideoPrompts(numberOfClips);
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
    
    // Configure Veo2 options
    const veo2Options: Veo2Options = {
      prompt,
      duration: this.config.video.stitch_length,
      resolution: this.config.video.resolution,
      format: this.config.video.format,
    };
    
    // Generate the video using Veo2
    const videoPath = await this.veo2Client.generateVideo(veo2Options);
    
    // In a real implementation, videoPath would be the actual generated video
    // For now, create an empty file as a placeholder
    fs.writeFileSync(outputPath, '');
    
    return outputPath;
  }
  
  /**
   * Generate prompts for each video clip
   * @param numberOfClips The number of clips to generate prompts for
   * @returns Array of prompts for each clip
   */
  private async generateVideoPrompts(numberOfClips: number): Promise<string[]> {
    const { prompt, theme, style } = this.config;
    
    const basePrompt = `
      Create a ${prompt.emotion} ${style} video clip about ${theme} with a focus on ${prompt.topic}.
      The tone should be ${prompt.tone}.
      The video should be visually appealing and suitable for a ${this.config.niche} audience.
    `.trim();
    
    // For dynamic prompts, generate variations for each clip
    if (prompt.type === 'dynamic') {
      const promptsPrompt = `
        I need ${numberOfClips} different video prompt variations based on the following theme:
        "${basePrompt}"
        
        Each prompt should be unique but related to the main theme.
        Format the response as a numbered list with each prompt on a new line.
        Keep each prompt concise and specific for video generation.
      `.trim();
      
      const promptsResponse = await this.geminiService.generateText(promptsPrompt);
      
      // Parse the response into individual prompts
      return promptsResponse
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./) || line.trim().match(/^-/))
        .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
        .slice(0, numberOfClips);
    }
    
    // For static prompts, use the same prompt for all clips
    return Array(numberOfClips).fill(basePrompt);
  }
} 