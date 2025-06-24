import path from 'path';
import { ConfigLoader, VideoConfig } from '../config/configLoader';
import { VideoGenerator } from '../veo/videoGenerator';
import { MonitoringService, JobStatus, JobStep, LogLevel } from '../monitoring';
import { generateScriptPrompt, generateMusicPrompt } from '../prompts';
import { GeminiService } from '../services/geminiService';

/**
 * Main function to generate a video
 * @param configPath Path to the configuration file
 */
async function generateVideo(configPath: string): Promise<void> {
  const monitoring = MonitoringService.getInstance();
  const geminiService = new GeminiService();
  
  try {
    console.log(`Loading configuration from ${configPath}...`);
    const config = ConfigLoader.loadConfig(configPath);
    
    // Start job tracking
    const jobId = monitoring.startJob(config);
    console.log(`Started job with ID: ${jobId}`);
    
    // Generate video clips
    monitoring.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.VIDEO_GENERATION);
    console.log('Generating video clips...');
    const videoGenerator = new VideoGenerator(config);
    const videoClips = await videoGenerator.generateVideoClips();
    console.log(`Generated ${videoClips.length} video clips`);
    
    // Generate script
    monitoring.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.SCRIPT_GENERATION);
    console.log('Generating script...');
    const scriptPrompt = generateScriptPrompt(config);
    const script = await geminiService.generateText(scriptPrompt);
    console.log('Script generated');
    
    // Generate voiceover
    monitoring.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.VOICEOVER_GENERATION);
    console.log('Generating voiceover...');
    const voiceoverPath = await geminiService.generateSpeech(script, config.voiceover.voice);
    console.log(`Voiceover generated: ${voiceoverPath}`);
    
    // Generate music
    monitoring.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.MUSIC_GENERATION);
    console.log('Generating background music...');
    const musicPrompt = generateMusicPrompt(config);
    const musicPath = await geminiService.generateSpeech(musicPrompt, 'music');
    console.log(`Background music generated: ${musicPath}`);
    
    // Video editing (mock implementation)
    monitoring.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.VIDEO_EDITING);
    console.log('Editing video...');
    // In a real implementation, this would use Remotion or another video editing library
    const outputPath = path.join(config.output.path, 'final_video.mp4');
    console.log(`Video editing completed: ${outputPath}`);
    
    // Final render (mock implementation)
    monitoring.updateJobStatus(jobId, JobStatus.RUNNING, JobStep.FINAL_RENDER);
    console.log('Rendering final video...');
    // In a real implementation, this would render the final video
    console.log(`Final video rendered: ${outputPath}`);
    
    // Update job status to completed
    monitoring.setJobOutput(jobId, outputPath);
    monitoring.updateJobStatus(jobId, JobStatus.COMPLETED);
    console.log('Video generation completed successfully');
    
    // Generate analytics report
    const report = monitoring.generateAnalyticsReport();
    console.log('\nAnalytics Report:');
    console.log(report);
  } catch (error: any) {
    console.error('Error generating video:', error.message);
    monitoring.log(LogLevel.ERROR, `Error generating video: ${error.message}`);
  }
}

// If this script is run directly
if (require.main === module) {
  // Get the configuration path from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Please provide a configuration file path');
    process.exit(1);
  }
  
  const configPath = args[0];
  
  generateVideo(configPath)
    .then(() => {
      console.log('Video generation script completed');
    })
    .catch((error) => {
      console.error('Error running video generation script:', error);
      process.exit(1);
    });
} 