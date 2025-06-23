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
      // For text-only input, use the gemini-1.0-pro model
      const model = this.generativeAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
      
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
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateText(prompt);
      }
      throw error;
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
      // Note: This is a mock implementation since the actual API structure may differ
      // In a real implementation, we would use the proper TTS API
      
      console.log(`Generating speech with text: "${text.substring(0, 50)}..." and voice: ${voiceName}`);
      
      // Mock implementation - in a real scenario, we'd call the Gemini TTS API
      // For now, return a placeholder response
      return "MOCK_BASE64_AUDIO_DATA";
      
      /* 
      // Actual implementation would look something like this:
      const model = this.generativeAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });
      
      const result = await model.generateContent({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        }
      });
      
      const data = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) {
        throw new Error('No audio data received from TTS API');
      }
      
      return data;
      */
    } catch (error: any) {
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateSpeech(text, voiceName);
      }
      throw error;
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
      // Note: This is a mock implementation since the actual API structure may differ
      // In a real implementation, we would use the proper TTS API
      
      console.log(`Generating multi-speaker speech with script: "${script.substring(0, 50)}..."`);
      console.log(`Speakers: ${JSON.stringify(speakers)}`);
      
      // Mock implementation - in a real scenario, we'd call the Gemini TTS API
      // For now, return a placeholder response
      return "MOCK_BASE64_AUDIO_DATA";
      
      /* 
      // Actual implementation would look something like this:
      const speakerVoiceConfigs = Object.entries(speakers).map(([speaker, voiceName]) => ({
        speaker,
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }));
      
      const model = this.generativeAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });
      
      const result = await model.generateContent({
        contents: [{ parts: [{ text: script }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs
            }
          }
        }
      });
      
      const data = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) {
        throw new Error('No audio data received from TTS API');
      }
      
      return data;
      */
    } catch (error: any) {
      // If rate limit is reached, rotate API key and try again
      if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
        this.rotateApiKey();
        return this.generateMultiSpeakerSpeech(script, speakers);
      }
      throw error;
    }
  }
} 