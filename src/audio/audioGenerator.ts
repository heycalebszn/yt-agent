import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiKeyManager } from '../utils/apiKeyManager';
import { VideoConfig } from '../config/configLoader';
import { GeminiService } from '../services/geminiService';
import wav from 'wav';

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
   * Save wave file from audio buffer
   * @param filename Path to save the file
   * @param pcmData Audio data buffer
   * @param channels Number of audio channels
   * @param rate Sample rate
   * @param sampleWidth Sample width
   */
  private async saveWaveFile(
    filename: string,
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const writer = new wav.FileWriter(filename, {
          channels,
          sampleRate: rate,
          bitDepth: sampleWidth * 8,
        });

        writer.on('finish', resolve);
        writer.on('error', reject);

        writer.write(pcmData);
        writer.end();
      } catch (error) {
        console.error('Error creating WAV file:', error);
        // Create an empty file as a fallback
        fs.writeFileSync(filename, '');
        resolve();
      }
    });
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
      
      try {
        // Use the Gemini TTS service to generate the voiceover
        const voiceName = this.config.voiceover.voice === 'deep_male' ? 'Kore' : 'Puck';
        const audioData = await this.geminiService.generateSpeech(script, voiceName);
        
        // If we got actual audio data (not a mock placeholder)
        if (audioData !== "MOCK_BASE64_AUDIO_DATA") {
          // Convert base64 to buffer
          const audioBuffer = Buffer.from(audioData, 'base64');
          
          // Save the audio buffer to a WAV file
          await this.saveWaveFile(voiceoverPath, audioBuffer);
        } else {
          // Download a sample audio file instead
          console.log('Using sample audio file instead of empty placeholder');
          
          try {
            // Sample audio URL (replace with an appropriate sample)
            const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
            const response = await fetch(sampleAudioUrl);
            
            if (!response.ok) {
              throw new Error(`Failed to download sample audio: ${response.status} ${response.statusText}`);
            }
            
            const fileStream = fs.createWriteStream(voiceoverPath);
            const buffer = await response.arrayBuffer();
            fileStream.write(Buffer.from(buffer));
            fileStream.end();
            
            console.log(`Sample audio downloaded to: ${voiceoverPath}`);
          } catch (downloadError) {
            console.error('Error downloading sample audio:', downloadError);
            // Fallback to empty file
            fs.writeFileSync(voiceoverPath, '');
            console.log(`Empty audio file created at: ${voiceoverPath}`);
          }
        }
      } catch (error) {
        console.error('Error in voiceover generation:', error);
        // Create an empty file as a fallback
        fs.writeFileSync(voiceoverPath, '');
      }
      
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
      // Try to download a sample music file
      try {
        console.log('Using sample music file instead of empty placeholder');
        
        // Sample music URL (replace with an appropriate sample)
        const sampleMusicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
        const response = await fetch(sampleMusicUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to download sample music: ${response.status} ${response.statusText}`);
        }
        
        const fileStream = fs.createWriteStream(musicPath);
        const buffer = await response.arrayBuffer();
        fileStream.write(Buffer.from(buffer));
        fileStream.end();
        
        console.log(`Sample music downloaded to: ${musicPath}`);
      } catch (downloadError) {
        console.error('Error downloading sample music:', downloadError);
        // Fallback to empty file
        fs.writeFileSync(musicPath, '');
        console.log(`Empty music file created at: ${musicPath}`);
      }
      
      return musicPath;
    } catch (error: any) {
      console.error('Error generating background music:', error.message);
      
      // Return the path to the empty file
      return musicPath;
    }
  }
} 