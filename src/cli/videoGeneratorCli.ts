import { ConfigLoader } from '../config/configLoader';
import { VideoOrchestratorService } from '../services/videoOrchestratorService';

export class VideoGeneratorCli {
  /**
   * Run the video generator CLI
   * @param args Command line arguments
   */
  public static async run(args: string[]): Promise<void> {
    try {
      // Parse command line arguments
      const options = this.parseArgs(args);
      
      if (options.help) {
        this.printHelp();
        return;
      }
      
      if (options.listNiches) {
        this.listAvailableNiches();
        return;
      }
      
      if (!options.niche) {
        console.error('Error: No niche specified');
        this.printHelp();
        process.exit(1);
      }
      
      // Load the configuration for the specified niche
      const config = ConfigLoader.loadConfig(options.niche);
      
      // Create the video orchestrator
      const orchestrator = new VideoOrchestratorService(config);
      
      // Generate the video
      const finalVideoPath = await orchestrator.generateVideo();
      
      console.log(`Video generation complete! Final video saved to: ${finalVideoPath}`);
      
      if (config.output.upload) {
        console.log('Video upload is enabled in the configuration, but not implemented yet');
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
  
  /**
   * Parse command line arguments
   * @param args Command line arguments
   * @returns Parsed options
   */
  private static parseArgs(args: string[]): {
    niche?: string;
    help: boolean;
    listNiches: boolean;
  } {
    const options = {
      niche: undefined as string | undefined,
      help: false,
      listNiches: false,
    };
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--niche' || arg === '-n') {
        options.niche = args[++i];
      } else if (arg === '--help' || arg === '-h') {
        options.help = true;
      } else if (arg === '--list-niches' || arg === '-l') {
        options.listNiches = true;
      }
    }
    
    return options;
  }
  
  /**
   * Print help information
   */
  private static printHelp(): void {
    console.log(`
SOFY Video Generator CLI

Usage: npm run generate -- [options]

Options:
  --niche, -n <niche>  Specify the niche configuration to use
  --list-niches, -l    List available niche configurations
  --help, -h           Show this help information
    `);
  }
  
  /**
   * List available niche configurations
   */
  private static listAvailableNiches(): void {
    const niches = ConfigLoader.listAvailableNiches();
    
    if (niches.length === 0) {
      console.log('No niche configurations found');
      return;
    }
    
    console.log('Available niche configurations:');
    niches.forEach(niche => {
      console.log(`- ${niche}`);
    });
  }
} 