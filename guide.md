The examples they gave on their website

1. Video generation

import { GoogleGenAI } from "@google/genai";
import { createWriteStream } from "fs";
import { Readable } from "stream";

const ai = new GoogleGenAI({ apiKey: "GOOGLE_API_KEY" });

async function main() {
  let operation = await ai.models.generateVideos({
    model: "veo-2.0-generate-001",
    prompt: "Panning wide shot of a calico kitten sleeping in the sunshine",
    config: {
      personGeneration: "dont_allow",
      aspectRatio: "16:9",
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  operation.response?.generatedVideos?.forEach(async (generatedVideo, n) => {
    const resp = await fetch(`${generatedVideo.video?.uri}&key=GOOGLE_API_KEY`); // append your API key
    const writer = createWriteStream(`video${n}.mp4`);
    Readable.fromWeb(resp.body).pipe(writer);
  });
}

main();

2. Speech generation

import {GoogleGenAI} from '@google/genai';
import wav from 'wav';

async function saveWaveFile(
   filename,
   pcmData,
   channels = 1,
   rate = 24000,
   sampleWidth = 2,
) {
   return new Promise((resolve, reject) => {
      const writer = new wav.FileWriter(filename, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
      });

      writer.on('finish', resolve);
      writer.on('error', reject);

      writer.write(pcmData);
      writer.end();
   });
}

async function main() {
   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: 'Say cheerfully: Have a wonderful day!' }] }],
      config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
               voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
               },
            },
      },
   });

   const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
   const audioBuffer = Buffer.from(data, 'base64');

   const fileName = 'out.wav';
   await saveWaveFile(fileName, audioBuffer);
}
await main();

3. TTS

import {GoogleGenAI} from '@google/genai';
import wav from 'wav';

async function saveWaveFile(
   filename,
   pcmData,
   channels = 1,
   rate = 24000,
   sampleWidth = 2,
) {
   return new Promise((resolve, reject) => {
      const writer = new wav.FileWriter(filename, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
      });

      writer.on('finish', resolve);
      writer.on('error', reject);

      writer.write(pcmData);
      writer.end();
   });
}

async function main() {
   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

   const prompt = `TTS the following conversation between Joe and Jane:
         Joe: How's it going today Jane?
         Jane: Not too bad, how about you?`;

   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
               multiSpeakerVoiceConfig: {
                  speakerVoiceConfigs: [
                        {
                           speaker: 'Joe',
                           voiceConfig: {
                              prebuiltVoiceConfig: { voiceName: 'Kore' }
                           }
                        },
                        {
                           speaker: 'Jane',
                           voiceConfig: {
                              prebuiltVoiceConfig: { voiceName: 'Puck' }
                           }
                        }
                  ]
               }
            }
      }
   });

   const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
   const audioBuffer = Buffer.from(data, 'base64');

   const fileName = 'out.wav';
   await saveWaveFile(fileName, audioBuffer);
}

await main();

4. import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: API_KEY, // Do not store your API client-side!
  apiVersion: 'v1alpha',
});

// Create session object to control music generation.
const session: MusicSession = client.live.music.connect({
  model: 'models/lyria-realtime-exp',
  callbacks: {
    onMessage: (message) => {
      // Application logic: buffer and play using Web Audio API etc.
    },
    onError: (error) => {
      console.error('music session error:', error);
    },
    onClose: () => {
      console.log('Lyria RealTime stream closed.');
    }
  }
}); 

// Send initial prompts and config
await session.setWeightedPrompts({
  weightedPrompts: [{ text: 'minimal techno', weight: 1.0 }],
});
await session.setMusicGenerationConfig({
  musicGenerationConfig: { bpm: 90, temperature: 1.0 },
});

// Start generation
await session.play();

An automated agent that generates and uploads full videos to youtube. Complete hands-free.

It uses Veo2 to create 6-8 second clips, stitches them together, adds background music, voiceover, lyrics and even handles post-editing(all programmatically.)

This agent should take up at-least 3000 - 4000 lines of well structured, quality, readable and scalable codebase

Tools: NodeJS, Typescript, Veo2, etc.

Key features
1. Background music
2. Voiceover's
3. Post-editing

VEO2 DOC: https://ai.google.dev/gemini-api/docs/video#python

API Keys(it should shuffle between them incase one reaches rate limit):

GEMINI_API_KEY_1 = "AIzaSyDMpYB8KLHVBVLkE6KlALjC9DTBdUnyMX8"
GEMINI_API_KEY_2 = "AIzaSyCxwHxcdBds0mgq0Z6rm8MUjcTGlYP3hBA"
GEMINI_API_KEY_3 = "AIzaSyChURaKR40IYn06v3ZeSvyjJMCnCqd_svs"
GEMINI_API_KEY_4 = "AIzaSyDbi8GgAQ7PVYHEpEgYHNGONTGj4myR8f8"
GEMINI_API_KEY_5 = "AIzaSyDBpREvLXsH1yOrcvfrO5D2oyVJiBTw4Gc"
GEMINI_API_KEY_6 = "AIzaSyAlM6VMuVXltw99ksWZnMuvrfmfaZnbIZw"
GEMINI_API_KEY_7 = "AIzaSyBSiy6XC1bguR3kgVV6K_JQsHzVLJLQ_28"
GEMINI_API_KEY_8 = "AIzaSyBtHTFW1XjcUbvnopOBCQK6ObJ79c4J-yI"
GEMINI_API_KEY_9 = "AIzaSyA5IFqknTW5OQUxo4VVBpCiR5OMUXUbZGw"
GEMINI_API_KEY_10 = "AIzaSyBSx9M-NVXSXcmzE-bV31YfL8oiMzh8rnY"

Project Guide:
SOFY: Faceless Video AI Agent - Project Structure
Project Overview
SOFY is an open-source AI agent built with Node.js that generates faceless videos using Gemini's Veo 2, background music, and voiceovers.
It supports video syncing and editing with Remotion, configuration via YAML files, and automatic publishing to social media platforms like YouTube, Instagram, and TikTok.
The project is designed in multiple phases and supports different niches through a modular config system.
Phase 1: Core CLI + Video Generator
- config/: Stores YAML configuration files per niche.
- scripts/: CLI entry point to run video generation.
- src/veo/: Generates and stitches short Veo 2 videos.
- src/audio/: Handles music and TTS generation using Gemini.
- src/remotion/: Syncs visuals, adds subtitles, and renders final video. - src/config/: Loads and validates YAML config files.
- src/prompts/: Generates AI prompts based on the config.
- src/utils/: Common helpers like file I/O.
Phase 2: Multi-Niche + Config Wizard
- config/niches/: Templates for new YAML niches.
- src/cli/: Interactive CLI that assists in config creation.
- src/prompts/promptTemplates/: Prebuilt prompt strategies per niche.
Phase 3: API Server + Minimal Web UI
- src/api/: Express.js server with REST endpoints.
- public/oauth-ui/: Minimal UI for TikTok OAuth token retrieval.
- src/web/: Web interface to select niche/config and generate video.
Phase 4: Social Posting Integrations
- src/social/: Scripts to post to Instagram, YouTube, and TikTok. - src/social/tiktok/: TikTok OAuth and access token storage.
Phase 5: MongoDB + Analytics
- src/db/: Mongoose models and database connection logic.
- src/monitoring/: Tracks video generation jobs, errors, and analytics.
Phase 6: Documentation + CI/CD + Tests

SOFY: Faceless Video AI Agent - Project Structure
- docs/: Developer guides and example configs.
- tests/: Unit and integration tests.
- .github/: CI/CD workflows for PRs and releases. - Dockerfile, LICENSE, .env.example, etc.
Phase 7 (Optional): AI Auto Features
- src/scheduler/: Automatic posting based on config.
- src/discovery/: Finds trending content/topics to generate. - src/remix/: Allows remixing existing content intelligently.
Sample motivational.yaml
niche: motivational theme: growth_mindset language: en
duration: 60
style: cinematic
prompt:
type: dynamic
topic: "Discipline and Consistency" tone: inspirational
emotion: high_energy
video:
resolution: 1080p format: mp4 stitch_length: 8
voiceover:
model: gemini_tts voice: deep_male
music:
model: gemini_music mood: inspiring tempo: mid
subtitles: enable: true style: default
output:
path: ./output/motivational/ upload: false