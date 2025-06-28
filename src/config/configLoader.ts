import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Video configuration interface
 */
export interface VideoConfig {
  niche: string;
  theme: string;
  language: string;
  duration: number;
  style: string;
  prompt: {
    type: 'static' | 'dynamic';
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
    title?: string;
    description?: string;
    tags?: string[];
    category_id?: number;
    privacy_status?: 'public' | 'unlisted' | 'private';
  };
}

/**
 * Config loader for loading and validating video configurations
 */
export class ConfigLoader {
  /**
   * List available niches based on config files
   * @returns Array of available niche names
   */
  static listAvailableNiches(): string[] {
    try {
      const configs = this.getAvailableConfigs();
      const niches = new Set<string>();
      
      // Load each config and extract the niche
      for (const configFile of configs) {
        try {
          const config = this.loadConfig(configFile);
          if (config.niche) {
            niches.add(config.niche);
          }
        } catch (error) {
          // Skip invalid configs
          console.error(`Error loading config ${configFile}:`, error);
        }
      }
      
      return Array.from(niches);
    } catch (error) {
      console.error('Error listing niches:', error);
      return [];
    }
  }

  /**
   * Load a configuration from a YAML file
   * @param configPath Path to the configuration file
   * @returns Video configuration
   */
  public static loadConfig(configPath: string): VideoConfig {
    try {
      const configDir = path.resolve(process.cwd(), 'config');
      const fullPath = path.resolve(configDir, configPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Configuration file not found: ${fullPath}`);
      }
      
      const configContent = fs.readFileSync(fullPath, 'utf8');
      const config = yaml.load(configContent) as VideoConfig;
      
      this.validateConfig(config);
      
      return config;
    } catch (error: any) {
      throw new Error(`Error loading configuration: ${error.message}`);
    }
  }
  
  /**
   * Validate a configuration
   * @param config Video configuration
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
    
    // Validate prompt
    if (!config.prompt.type || !['static', 'dynamic'].includes(config.prompt.type)) {
      throw new Error('Invalid prompt type: must be "static" or "dynamic"');
    }
    
    if (!config.prompt.topic) {
      throw new Error('Missing prompt topic');
    }
    
    // Validate video
    if (!config.video.resolution) {
      throw new Error('Missing video resolution');
    }
    
    if (!config.video.format) {
      throw new Error('Missing video format');
    }
    
    if (typeof config.video.stitch_length !== 'number' || config.video.stitch_length <= 0) {
      throw new Error('Invalid video stitch length: must be a positive number');
    }
    
    // Validate output
    if (!config.output.path) {
      throw new Error('Missing output path');
    }
    
    if (typeof config.output.upload !== 'boolean') {
      throw new Error('Invalid output upload: must be a boolean');
    }
  }
  
  /**
   * Get a list of available configurations
   * @returns Array of configuration names
   */
  public static getAvailableConfigs(): string[] {
    try {
      const configDir = path.resolve(process.cwd(), 'config');
      
      if (!fs.existsSync(configDir)) {
        return [];
      }
      
      return fs.readdirSync(configDir)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => file);
    } catch (error) {
      console.error('Error getting available configurations:', error);
      return [];
    }
  }
} 