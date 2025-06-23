#!/usr/bin/env node

import dotenv from 'dotenv';
import { ConfigLoader } from '../config/configLoader';
import { VideoOrchestratorService } from '../services/videoOrchestratorService';

// Load environment variables
dotenv.config();

async function testFullVideoGeneration() {
  try {
    console.log('Testing full video generation process...');
    
    // Load the motivational configuration
    const config = ConfigLoader.loadConfig('motivational');
    
    // Create the video orchestrator
    const orchestrator = new VideoOrchestratorService(config);
    
    // Generate the video
    const finalVideoPath = await orchestrator.generateVideo();
    
    console.log(`Video generation complete! Final video saved to: ${finalVideoPath}`);
  } catch (error: any) {
    console.error('Error testing full video generation:', error.message);
    process.exit(1);
  }
}

// Run the test
testFullVideoGeneration()
  .then(() => console.log('Test completed'))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 