export * from './promptTemplate';
export * from './promptGenerator';

import { PromptGenerator } from './promptGenerator';
import { VideoConfig } from '../config/configLoader';

/**
 * Convenience function to generate video prompts
 * @param config Video configuration
 * @param count Number of prompts to generate
 * @returns Array of video prompts
 */
export async function generateVideoPrompts(config: VideoConfig, count: number): Promise<string[]> {
  const generator = new PromptGenerator();
  return generator.generateVideoPrompts(config, count);
}

/**
 * Convenience function to generate a script prompt
 * @param config Video configuration
 * @returns Script prompt
 */
export function generateScriptPrompt(config: VideoConfig): string {
  const generator = new PromptGenerator();
  return generator.generateScriptPrompt(config);
}

/**
 * Convenience function to generate a music prompt
 * @param config Video configuration
 * @returns Music prompt
 */
export function generateMusicPrompt(config: VideoConfig): string {
  const generator = new PromptGenerator();
  return generator.generateMusicPrompt(config);
} 