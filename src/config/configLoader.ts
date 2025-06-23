import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export interface VideoConfig {
  niche: string;
  theme: string;
  language: string;
  duration: number;
  style: string;
  prompt: {
    type: string;
    topic: string;
    tone: string;
    emotion: string;
  };
  video: {
    resolution: string;
    format: string;
    stitch_length: number;
  };
  voiceover: {
    model: string;
    voice: string;
  };
  music: {
    model: string;
    mood: string;
    tempo: string;
  };
  subtitles: {
    enable: boolean;
    style: string;
  };
  output: {
    path: string;
    upload: boolean;
  };
}

export class ConfigLoader {
  /**
   * Load a configuration file from the config directory
   * @param nicheName The name of the niche configuration to load
   * @returns The parsed configuration object
   */
  public static loadConfig(nicheName: string): VideoConfig {
    const configPath = path.join(process.cwd(), 'config', 'niches', `${nicheName}.yaml`);
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.parse(fileContents) as VideoConfig;
    
    this.validateConfig(config);
    
    return config;
  }
  
  /**
   * Validate that the configuration has all required fields
   * @param config The configuration object to validate
   */
  private static validateConfig(config: VideoConfig): void {
    const requiredFields = [
      'niche',
      'theme',
      'language',
      'duration',
      'style',
      'prompt',
      'video',
      'voiceover',
      'music',
      'subtitles',
      'output'
    ];
    
    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new Error(`Missing required field in configuration: ${field}`);
      }
    }
  }
  
  /**
   * List all available niche configurations
   * @returns Array of available niche names
   */
  public static listAvailableNiches(): string[] {
    const configDir = path.join(process.cwd(), 'config', 'niches');
    
    if (!fs.existsSync(configDir)) {
      return [];
    }
    
    return fs.readdirSync(configDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.basename(file, path.extname(file)));
  }
} 