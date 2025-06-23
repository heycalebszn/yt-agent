#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GeminiService } from '../services/geminiService';

// Load environment variables
dotenv.config();

/**
 * Save audio data to a file
 * @param filename Path to save the file
 * @param audioData Base64 encoded audio data
 */
async function saveAudioFile(filename: string, audioData: string): Promise<void> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, 'base64');
    
    // Write buffer to file
    fs.writeFileSync(filename, buffer);
    
    console.log(`Audio saved to ${filename}`);
  } catch (error: any) {
    console.error('Error saving audio file:', error.message);
    
    // Create an empty file as a fallback
    fs.writeFileSync(filename, '');
  }
}

async function testTTS() {
  try {
    console.log('Testing Text-to-Speech generation...');
    
    const geminiService = new GeminiService();
    const outputDir = './output/test';
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Test single voice TTS
    const singleVoiceText = 'Say cheerfully: Have a wonderful day!';
    console.log(`Generating single voice TTS with text: "${singleVoiceText}"`);
    
    const singleVoiceData = await geminiService.generateSpeech(singleVoiceText, 'Kore');
    const singleVoiceOutputPath = path.join(outputDir, 'single_voice.wav');
    
    await saveAudioFile(singleVoiceOutputPath, singleVoiceData);
    console.log(`Single voice TTS generated successfully! Path: ${singleVoiceOutputPath}`);
    
    // Test multi-speaker TTS
    const multiSpeakerText = `TTS the following conversation between Joe and Jane:
      Joe: How's it going today Jane?
      Jane: Not too bad, how about you?`;
    
    console.log(`Generating multi-speaker TTS with text: "${multiSpeakerText}"`);
    
    const speakers = {
      'Joe': 'Kore',
      'Jane': 'Puck'
    };
    
    const multiSpeakerData = await geminiService.generateMultiSpeakerSpeech(multiSpeakerText, speakers);
    const multiSpeakerOutputPath = path.join(outputDir, 'multi_speaker.wav');
    
    await saveAudioFile(multiSpeakerOutputPath, multiSpeakerData);
    console.log(`Multi-speaker TTS generated successfully! Path: ${multiSpeakerOutputPath}`);
    
  } catch (error: any) {
    console.error('Error testing TTS:', error.message);
    process.exit(1);
  }
}

// Run the test
testTTS()
  .then(() => console.log('Test completed'))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 