import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiKeyManager } from '../utils/apiKeyManager';
import { VideoConfig } from '../config/configLoader';
import { GeminiService } from '../services/geminiService';

// Mock FileWriter interface instead of using wav module
interface FileWriter {
  on(event: string, callback: (...args: any[]) => void): void;
  write(data: Buffer): void;
  end(): void;
}

export class AudioGenerator {
  private apiKeyManager: ApiKeyManager;
  private geminiService: GeminiService;
  private config: VideoConfig;
  private outputDir: string;
  
  constructor(config: VideoConfig) {
    this.apiKeyManager = new ApiKeyManager();
    this.geminiService = new GeminiService();
    this.config = config;
    this.outputDir = path.resolve(process.cwd(), this.config.output.path);
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Generate a voiceover script based on the video configuration
   * @returns The generated script text
   */
  public async generateScript(duration: number): Promise<string> {
    const { prompt, theme } = this.config;
    
    const scriptPrompt = `
      Write a ${duration}-second motivational voiceover script about ${theme} with a focus on ${prompt.topic}.
      The tone should be ${prompt.tone} and the emotion should be ${prompt.emotion}.
      The script should be inspiring and suitable for a ${this.config.niche} audience.
      Keep it concise and impactful, with approximately ${Math.floor(duration / 5)} sentences.
      Do not include any timestamps or audio directions.
    `.trim();
    
    try {
      const scriptText = await this.geminiService.generateText(scriptPrompt);
      
      // Save the script to a file
      const scriptPath = path.join(this.outputDir, 'script.txt');
      fs.writeFileSync(scriptPath, scriptText);
      
      return scriptText;
    } catch (error: any) {
      console.error('Error generating script:', error.message);
      // Return a default script in case of error
      return `Here's a motivational message about ${theme} focused on ${prompt.topic}.`;
    }
  }
  
  /**
   * Save audio data to a file
   * @param filename Path to save the file
   * @param audioData Base64 encoded audio data
   */
  private async saveAudioFile(filename: string, audioData: string): Promise<void> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(audioData, 'base64');
      
      // Write buffer to file
      fs.writeFileSync(filename, buffer);
      
      console.log(`Audio saved to ${filename}`);
    } catch (error: any) {
      console.error('Error saving audio file:', error.message);
      
      // Create an empty file as a fallback
      fs.writeFileSync(filename, '');
    }
  }
  
  /**
   * Generate a voiceover audio file from the script
   * @param script The script text to convert to speech
   * @returns Path to the generated audio file
   */
  public async generateVoiceover(script: string): Promise<string> {
    console.log('Generating voiceover with script:', script.substring(0, 100) + '...');
    
    try {
      const voiceoverPath = path.join(this.outputDir, 'voiceover.wav');
      
      // Use the Gemini TTS service to generate the voiceover
      const voiceName = this.config.voiceover.voice === 'deep_male' ? 'Kore' : 'Puck';
      const audioData = await this.geminiService.generateSpeech(script, voiceName);
      
      // Save the audio data to a file
      await this.saveAudioFile(voiceoverPath, audioData);
      
      return voiceoverPath;
    } catch (error: any) {
      console.error('Error generating voiceover:', error.message);
      
      // For now, create an empty file as a fallback
      const fallbackPath = path.join(this.outputDir, 'voiceover.wav');
      fs.writeFileSync(fallbackPath, '');
      return fallbackPath;
    }
  }
  
  /**
   * Generate background music based on the configuration
   * @returns Path to the generated music file
   */
  public async generateBackgroundMusic(): Promise<string> {
    const { music } = this.config;
    const musicPath = path.join(this.outputDir, 'background_music.wav');
    
    const musicPrompt = `
      Generate a ${music.mood} background music track with a ${music.tempo} tempo.
      The music should complement a ${this.config.niche} video about ${this.config.theme}.
      The duration should be approximately ${this.config.duration} seconds.
    `.trim();
    
    console.log('Generating background music with prompt:', musicPrompt);
    
    try {
      // Note: This is a placeholder for the music generation implementation
      // In a real implementation, we would use the Lyria music generation API
      // as shown in the example code
      
      // For now, create an empty file as a placeholder
      fs.writeFileSync(musicPath, '');
      
      return musicPath;
    } catch (error: any) {
      console.error('Error generating background music:', error.message);
      
      // Return the path to the empty file
      return musicPath;
    }
  }
} 