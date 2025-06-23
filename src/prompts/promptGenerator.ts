import { VideoConfig } from '../config/configLoader';
import { GeminiService } from '../services/geminiService';
import { PromptTemplateFactory } from './promptTemplate';

/**
 * Generates prompts for video, script, and music based on configuration
 */
export class PromptGenerator {
  private geminiService: GeminiService;
  
  constructor() {
    this.geminiService = new GeminiService();
  }
  
  /**
   * Generate video prompts based on configuration
   * @param config Video configuration
   * @param count Number of prompts to generate
   * @returns Array of video prompts
   */
  public async generateVideoPrompts(config: VideoConfig, count: number): Promise<string[]> {
    console.log(`Generating ${count} video prompts for ${config.niche} niche`);
    
    const template = PromptTemplateFactory.createTemplate(config.niche);
    
    // If the prompt type is static, use template-based prompts
    if (config.prompt.type === 'static') {
      return template.generateVideoPrompts(config, count);
    }
    
    // For dynamic prompts, try to use Gemini to generate variations
    try {
      // Get a base prompt from the template
      const basePrompts = await template.generateVideoPrompts(config, 1);
      const basePrompt = basePrompts[0];
      
      // Generate variations using Gemini
      const promptsPrompt = `
        I need ${count} different video prompt variations based on the following theme:
        "${basePrompt}"
        
        Each prompt should be unique but related to the main theme of ${config.theme} with a focus on ${config.prompt.topic}.
        The tone should be ${config.prompt.tone} and the emotion should be ${config.prompt.emotion}.
        Format the response as a numbered list with each prompt on a new line.
        Keep each prompt concise and specific for video generation.
      `.trim();
      
      const promptsResponse = await this.geminiService.generateText(promptsPrompt);
      
      // Parse the response into individual prompts
      const generatedPrompts = promptsResponse
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./) || line.trim().match(/^-/))
        .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
        .slice(0, count);
      
      // If we got enough prompts, return them
      if (generatedPrompts.length >= count) {
        return generatedPrompts;
      }
      
      // Otherwise, fall back to template-based prompts
      console.log('Not enough prompts generated, falling back to templates');
      return template.generateVideoPrompts(config, count);
    } catch (error) {
      console.error('Error generating dynamic prompts:', error);
      // Fall back to template-based prompts
      return template.generateVideoPrompts(config, count);
    }
  }
  
  /**
   * Generate a script prompt based on configuration
   * @param config Video configuration
   * @returns Script prompt
   */
  public generateScriptPrompt(config: VideoConfig): string {
    const template = PromptTemplateFactory.createTemplate(config.niche);
    return template.generateScriptPrompt(config);
  }
  
  /**
   * Generate a music prompt based on configuration
   * @param config Video configuration
   * @returns Music prompt
   */
  public generateMusicPrompt(config: VideoConfig): string {
    const template = PromptTemplateFactory.createTemplate(config.niche);
    return template.generateMusicPrompt(config);
  }
} 