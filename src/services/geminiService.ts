import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

/**
 * Service for interacting with the Gemini API
 */
export class GeminiService {
  private apiKeys: string[];
  private currentKeyIndex: number;
  private genAI: GoogleGenerativeAI;
  private textModel: string;
  
  constructor() {
    this.apiKeys = this.loadApiKeys();
    this.currentKeyIndex = 0;
    this.genAI = new GoogleGenerativeAI(this.getCurrentApiKey());
    this.textModel = 'gemini-1.5-pro';
  }
  
  /**
   * Load API keys from environment variables
   * @returns Array of API keys
   */
  private loadApiKeys(): string[] {
    const keys: string[] = [];
    
    // Load API keys from environment variables (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) {
        keys.push(key);
      }
    }
    
    if (keys.length === 0) {
      // If no API keys are found in environment variables, use a default key if available
      const defaultKey = process.env.GEMINI_API_KEY;
      if (defaultKey) {
        keys.push(defaultKey);
      } else {
        throw new Error('No Gemini API keys found in environment variables');
      }
    }
    
    return keys;
  }
  
  /**
   * Get the current API key
   * @returns Current API key
   */
  private getCurrentApiKey(): string {
    return this.apiKeys[this.currentKeyIndex];
  }
  
  /**
   * Rotate to the next API key
   */
  private rotateApiKey(): void {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.genAI = new GoogleGenerativeAI(this.getCurrentApiKey());
  }
  
  /**
   * Generate text using the Gemini API
   * @param prompt The prompt to generate text from
   * @returns Generated text
   */
  public async generateText(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.textModel });
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      // If the error is due to rate limiting, try with a different API key
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        console.warn('API key rate limit reached, rotating to next key');
        this.rotateApiKey();
        return this.generateText(prompt);
      }
      
      throw error;
    }
  }
  
  /**
   * Generate images using the Gemini API (mock implementation)
   * @param prompt The prompt to generate images from
   * @param count Number of images to generate
   * @returns Array of image URLs
   */
  public async generateImages(prompt: string, count: number = 1): Promise<string[]> {
    // This is a mock implementation since Gemini doesn't have a direct image generation API yet
    console.log(`Mock image generation for prompt: ${prompt}`);
    
    // Return placeholder image URLs
    return Array(count).fill('https://via.placeholder.com/1080x1920.png?text=Generated+Image');
  }

  /**
   * Generate speech audio using Gemini TTS (mock implementation)
   * @param text The text to convert to speech
   * @param voiceName The name of the voice to use
   * @returns Path to the generated audio file
   */
  public async generateSpeech(text: string, voiceName: string): Promise<string> {
    console.log(`Mock TTS generation for text: "${text.substring(0, 50)}..." with voice: ${voiceName}`);
    
    try {
      // This is a mock implementation since the TTS API format is not clear
      // In a real implementation, this would use the Gemini TTS API
      
      // Create a temporary directory for the audio
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate a unique filename
      const filename = `speech_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;
      const outputPath = path.join(tempDir, filename);
      
      // Download a sample audio file instead of generating one
      // This is just for demonstration purposes
      const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      
      console.log(`Downloading sample audio from ${sampleAudioUrl}`);
      
      const response = await fetch(sampleAudioUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download sample audio: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      
      console.log(`Audio saved to ${outputPath}`);
      
      return outputPath;
    } catch (error: any) {
      console.error('Error generating speech:', error.message);
      
      // Create an empty file as a fallback
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const filename = `speech_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;
      const outputPath = path.join(tempDir, filename);
      
      fs.writeFileSync(outputPath, '');
      
      console.warn(`Created empty audio file at ${outputPath} due to error`);
      
      return outputPath;
    }
  }
  
  /**
   * Generate multi-speaker speech audio using Gemini TTS (mock implementation)
   * @param text The text with speaker labels to convert to speech
   * @param speakers Map of speaker names to voice names
   * @returns Path to the generated audio file
   */
  public async generateMultiSpeakerSpeech(text: string, speakers: Record<string, string>): Promise<string> {
    console.log(`Mock multi-speaker TTS generation for text: "${text.substring(0, 50)}..."`);
    console.log('Speakers:', speakers);
    
    try {
      // This is a mock implementation since the multi-speaker TTS API is not fully available
      // In a real implementation, this would use the Gemini TTS API with multi-speaker config
      
      // Create a temporary directory for the audio
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate a unique filename
      const filename = `multi_speech_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;
      const outputPath = path.join(tempDir, filename);
      
      // Download a sample audio file instead of generating one
      // This is just for demonstration purposes
      const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
      
      console.log(`Downloading sample audio from ${sampleAudioUrl}`);
      
      const response = await fetch(sampleAudioUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download sample audio: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      
      console.log(`Multi-speaker audio saved to ${outputPath}`);
      
      return outputPath;
    } catch (error: any) {
      console.error('Error generating multi-speaker speech:', error.message);
      
      // Create an empty file as a fallback
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const filename = `multi_speech_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;
      const outputPath = path.join(tempDir, filename);
      
      fs.writeFileSync(outputPath, '');
      
      console.warn(`Created empty multi-speaker audio file at ${outputPath} due to error`);
      
      return outputPath;
    }
  }
} 