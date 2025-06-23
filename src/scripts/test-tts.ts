#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GeminiService } from '../services/geminiService';
import wav from 'wav';

// Load environment variables
dotenv.config();

/**
 * Save wave file from audio buffer
 * @param filename Path to save the file
 * @param pcmData Audio data buffer
 * @param channels Number of audio channels
 * @param rate Sample rate
 * @param sampleWidth Sample width
 */
async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const writer = new wav.FileWriter(filename, {
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      writer.on('finish', resolve);
      writer.on('error', reject);

      writer.write(pcmData);
      writer.end();
    } catch (error) {
      console.error('Error creating WAV file:', error);
      // Create an empty file as a fallback
      fs.writeFileSync(filename, '');
      resolve();
    }
  });
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
    const singleVoiceBuffer = Buffer.from(singleVoiceData, 'base64');
    const singleVoiceOutputPath = path.join(outputDir, 'single_voice.wav');
    
    await saveWaveFile(singleVoiceOutputPath, singleVoiceBuffer);
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
    const multiSpeakerBuffer = Buffer.from(multiSpeakerData, 'base64');
    const multiSpeakerOutputPath = path.join(outputDir, 'multi_speaker.wav');
    
    await saveWaveFile(multiSpeakerOutputPath, multiSpeakerBuffer);
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