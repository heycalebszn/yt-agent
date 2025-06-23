import { VideoConfig } from '../config/configLoader';

/**
 * Interface for prompt templates
 */
export interface PromptTemplate {
  generateVideoPrompts(config: VideoConfig, count: number): Promise<string[]>;
  generateScriptPrompt(config: VideoConfig): string;
  generateMusicPrompt(config: VideoConfig): string;
}

/**
 * Base prompt template with common functionality
 */
export abstract class BasePromptTemplate implements PromptTemplate {
  /**
   * Generate video prompts based on configuration
   * @param config Video configuration
   * @param count Number of prompts to generate
   */
  abstract generateVideoPrompts(config: VideoConfig, count: number): Promise<string[]>;
  
  /**
   * Generate a script prompt based on configuration
   * @param config Video configuration
   */
  generateScriptPrompt(config: VideoConfig): string {
    const { duration, theme, prompt } = config;
    
    return `
      Write a ${duration}-second motivational voiceover script about ${theme} with a focus on ${prompt.topic}.
      The tone should be ${prompt.tone} and the emotion should be ${prompt.emotion}.
      The script should be inspiring and suitable for a ${config.niche} audience.
      Keep it concise and impactful, with approximately ${Math.floor(duration / 5)} sentences.
      Do not include any timestamps or audio directions.
    `.trim();
  }
  
  /**
   * Generate a music prompt based on configuration
   * @param config Video configuration
   */
  generateMusicPrompt(config: VideoConfig): string {
    const { music, duration, theme, niche } = config;
    
    return `
      Generate a ${music.mood} background music track with a ${music.tempo} tempo.
      The music should complement a ${niche} video about ${theme}.
      The duration should be approximately ${duration} seconds.
    `.trim();
  }
}

/**
 * Motivational prompt template for generating motivational video prompts
 */
export class MotivationalPromptTemplate extends BasePromptTemplate {
  /**
   * Generate motivational video prompts
   * @param config Video configuration
   * @param count Number of prompts to generate
   */
  async generateVideoPrompts(config: VideoConfig, count: number): Promise<string[]> {
    const { theme, style, prompt } = config;
    
    // Base prompt templates for motivational videos
    const templates = [
      `High-energy ${style} montage: Diverse individuals consistently mastering challenging daily routines (exercise, study, craft) from dawn till dusk, showcasing discipline building momentum towards a powerful, inspirational sunrise.`,
      
      `Visually stunning, rapid-cut ${style} sequence illustrating small, consistent daily actions compounding into monumental personal growth, with dynamic transitions and an uplifting score conveying unstoppable progress.`,
      
      `Dramatic ${style} video: A high-energy journey depicting initial struggles and setbacks overcome through unwavering discipline and consistency, leading to breakthrough Eureka moments and a triumphant, inspiring conclusion.`,
      
      `Inspirational ${style} clip: Abstract representations of a growth mindset manifesting through consistent, disciplined effort, evolving from raw potential to refined strength, with dynamic light, motion graphics, and powerful visuals.`,
      
      `High-energy ${style} portrayal of an athlete's intense, consistent training (morning runs, gym reps, skill practice) through all conditions, showcasing how pure discipline and repetition forge peak performance and ultimate achievement.`,
      
      `Visually appealing, high-energy ${style} short: A creator (artist, musician, coder) meticulously practicing their craft daily, demonstrating the quiet discipline and consistency required to transform raw talent into undeniable mastery, with progression shots.`,
      
      `Dynamic, high-energy montage: Diverse individuals engaged in disciplined, consistent effort (learning, building, working out), visually transitioning from focused struggle to powerful, confident achievement, conveying an inspirational growth mindset.`,
      
      `${style}, high-energy sequence: Characters making disciplined choices daily, pushing past comfort zones with consistent effort, visually representing internal growth and self-mastery, culminating in a powerful, self-assured stance against a challenging backdrop.`,
      
      `Time-lapse transformation: A visual metaphor using a time-lapse of a seed growing into a mighty tree, intercut with a person consistently practicing a skill over months, emphasizing gradual, consistent effort yielding magnificent growth.`,
      
      `"Small Wins Big": Rapid-fire montage of seemingly small, consistent actions (e.g., one push-up, one page read, one line of code) accumulating into massive, visually impressive results.`
    ];
    
    // Return the requested number of templates, cycling through if needed
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(templates[i % templates.length]);
    }
    
    return result;
  }
}

/**
 * Factory for creating prompt templates based on niche
 */
export class PromptTemplateFactory {
  /**
   * Create a prompt template based on the niche
   * @param niche The niche to create a template for
   */
  static createTemplate(niche: string): PromptTemplate {
    switch (niche.toLowerCase()) {
      case 'motivational':
        return new MotivationalPromptTemplate();
      // Add more niches as needed
      default:
        return new MotivationalPromptTemplate(); // Default to motivational
    }
  }
} 