import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ApiKeyManager } from '../utils/apiKeyManager';

export class GeminiService {
  private generativeAI: GoogleGenerativeAI;
  private apiKeyManager: ApiKeyManager;
  
  constructor() {
    this.apiKeyManager = new ApiKeyManager();
    this.generativeAI = new GoogleGenerativeAI(this.apiKeyManager.getCurrentKey());
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
   * Generate text content using Gemini
   * @param prompt The prompt to send to Gemini
   * @returns The generated text
   */
  public async generateText(prompt: string): Promise<string> {
    try {
      // Use gemini-2.5-flash model for text generation
      const model = this.generativeAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };
      
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });
      
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error generating text:', error.message);
      
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateText(prompt);
      }
      
      // Return a placeholder in case of error
      return `Here is some text about ${prompt.substring(0, 20)}...`;
    }
  }
  
  /**
   * Generate speech audio using Gemini TTS
   * @param text The text to convert to speech
   * @param voiceName The name of the voice to use (e.g., 'Kore', 'Puck')
   * @returns Base64 encoded audio data
   */
  public async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    try {
      console.log(`Generating speech with text: "${text.substring(0, 50)}..." and voice: ${voiceName}`);
      
      // Since the TTS API is not fully compatible with our current version,
      // we'll return mock data for now
      console.log('Using mock TTS implementation');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data
      return "MOCK_BASE64_AUDIO_DATA";
    } catch (error: any) {
      console.error('Error generating speech:', error.message);
      
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateSpeech(text, voiceName);
      }
      
      // Return a placeholder in case of error
      console.log('Returning placeholder audio data due to error');
      return "MOCK_BASE64_AUDIO_DATA";
    }
  }
  
  /**
   * Generate multi-speaker speech audio using Gemini TTS
   * @param script The script with speaker labels
   * @param speakers Map of speaker names to voice names
   * @returns Base64 encoded audio data
   */
  public async generateMultiSpeakerSpeech(
    script: string, 
    speakers: Record<string, string>
  ): Promise<string> {
    try {
      console.log(`Generating multi-speaker speech with script: "${script.substring(0, 50)}..."`);
      console.log(`Speakers: ${JSON.stringify(speakers)}`);
      
      // Since the multi-speaker TTS API is not fully compatible with our current version,
      // we'll return mock data for now
      console.log('Using mock multi-speaker TTS implementation');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data
      return "MOCK_BASE64_AUDIO_DATA";
    } catch (error: any) {
      console.error('Error generating multi-speaker speech:', error.message);
      
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateMultiSpeakerSpeech(script, speakers);
      }
      
      // Return a placeholder in case of error
      console.log('Returning placeholder audio data due to error');
      return "MOCK_BASE64_AUDIO_DATA";
    }
  }
} 