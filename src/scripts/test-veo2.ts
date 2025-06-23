#!/usr/bin/env node

import dotenv from 'dotenv';
import { Veo2Client } from '../veo/veo2Client';

// Load environment variables
dotenv.config();

async function testVeo2() {
  try {
    console.log('Testing Veo2 video generation...');
    
    const veo2Client = new Veo2Client('./output/test');
    
    const prompt = 'Panning wide shot of a calico kitten sleeping in the sunshine';
    
    console.log(`Generating video with prompt: "${prompt}"`);
    
    const videoPath = await veo2Client.generateVideo({
      prompt,
      aspectRatio: '16:9',
      personGeneration: 'dont_allow'
    });
    
    console.log(`Video generated successfully! Path: ${videoPath}`);
  } catch (error: any) {
    console.error('Error testing Veo2:', error.message);
    process.exit(1);
  }
}

// Run the test
testVeo2()
  .then(() => console.log('Test completed'))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 