import { VideoConfig } from '../config/configLoader';
import { VideoGenerator } from '../veo/videoGenerator';
import { AudioGenerator } from '../audio/audioGenerator';
import { VideoEditor } from '../remotion/videoEditor';

export class VideoOrchestratorService {
  private config: VideoConfig;
  private videoGenerator: VideoGenerator;
  private audioGenerator: AudioGenerator;
  private videoEditor: VideoEditor;
  
  constructor(config: VideoConfig) {
    this.config = config;
    this.videoGenerator = new VideoGenerator(config);
    this.audioGenerator = new AudioGenerator(config);
    this.videoEditor = new VideoEditor(config);
  }
  
  /**
   * Generate a complete video based on the configuration
   * @returns Path to the final video
   */
  public async generateVideo(): Promise<string> {
    try {
      console.log(`Starting video generation for niche: ${this.config.niche}`);
      console.log(`Theme: ${this.config.theme}, Duration: ${this.config.duration} seconds`);
      
      // Step 1: Generate video clips
      console.log('Step 1: Generating video clips');
      const videoClips = await this.videoGenerator.generateVideoClips();
      
      // Step 2: Stitch clips together
      console.log('Step 2: Stitching video clips');
      const stitchedVideo = await this.videoEditor.stitchClips(videoClips);
      
      // Step 3: Generate script and voiceover
      console.log('Step 3: Generating script and voiceover');
      const script = await this.audioGenerator.generateScript(this.config.duration);
      const voiceoverPath = await this.audioGenerator.generateVoiceover(script);
      
      // Step 4: Generate background music
      console.log('Step 4: Generating background music');
      const musicPath = await this.audioGenerator.generateBackgroundMusic();
      
      // Step 5: Add voiceover to video
      console.log('Step 5: Adding voiceover');
      const videoWithVoiceover = await this.videoEditor.addVoiceover(stitchedVideo, voiceoverPath);
      
      // Step 6: Add background music
      console.log('Step 6: Adding background music');
      const videoWithMusic = await this.videoEditor.addBackgroundMusic(videoWithVoiceover, musicPath);
      
      // Step 7: Add subtitles if enabled
      console.log('Step 7: Adding subtitles');
      const videoWithSubtitles = await this.videoEditor.addSubtitles(videoWithMusic, script);
      
      // Step 8: Render final video
      console.log('Step 8: Rendering final video');
      const finalVideo = await this.videoEditor.renderFinalVideo(videoWithSubtitles);
      
      console.log(`Video generation complete! Final video saved to: ${finalVideo}`);
      
      return finalVideo;
    } catch (error: any) {
      console.error('Error generating video:', error.message);
      throw error;
    }
  }
} 