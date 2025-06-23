# SOFY: Faceless Video AI Agent

An automated agent that generates and uploads full videos to YouTube. Complete hands-free.

## Overview

SOFY is an open-source AI agent built with Node.js that generates faceless videos using Google's Gemini API, background music, and voiceovers. It supports video syncing and editing with Remotion, configuration via YAML files, and automatic publishing to social media platforms like YouTube, Instagram, and TikTok.

## Current Status

The project is currently in a working state with mock implementations for API endpoints that are not fully available or documented. The system successfully:

1. Loads configuration from YAML files
2. Generates text content using Gemini API
3. Creates placeholder video clips (mock implementation)
4. Creates placeholder audio files (mock implementation)
5. Stitches everything together into a final video (mock implementation)

## Making It Work Perfectly

To make this project work perfectly, the following changes would be needed:

### 1. API Access and Compatibility

- **Veo2 API**: The current Gemini API does not fully expose the `generateVideos` method as shown in the guide. You would need access to the Veo2 API through Google's Vertex AI or wait for it to be available in the public Gemini API.

- **TTS API**: The Text-to-Speech functionality requires access to the `gemini-2.5-flash-preview-tts` model, which may not be fully available or compatible with the current SDK version. The correct implementation would use the responseModalities and speechConfig parameters as shown in the guide.

### 2. Remotion Implementation

- Implement the actual video editing functionality using Remotion instead of the current placeholder implementation.
- Set up proper video stitching, audio mixing, and subtitle rendering.

### 3. API Key Management

- The current implementation includes API key rotation to handle rate limits, but you should ensure your API keys have the necessary permissions and quotas.

### 4. Social Media Integration

- Implement the social media posting functionality for YouTube, Instagram, and TikTok.

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Gemini API keys:
   ```
   GEMINI_API_KEY_1=your_api_key_1
   GEMINI_API_KEY_2=your_api_key_2
   # Add more keys as needed
   ```
4. Run the tests:
   ```
   npm run test:veo2    # Test video generation
   npm run test:tts     # Test TTS generation
   npm run test:full    # Test full pipeline
   ```

## Configuration

The system is configured using YAML files in the `config/niches` directory. Each niche has its own configuration file with settings for:

- Video style and duration
- Prompt themes and topics
- Voiceover settings
- Music settings
- Output settings

## Project Structure

- `config/`: Stores YAML configuration files per niche
- `scripts/`: CLI entry points to run video generation
- `src/veo/`: Generates and stitches short Veo2 videos
- `src/audio/`: Handles music and TTS generation using Gemini
- `src/remotion/`: Syncs visuals, adds subtitles, and renders final video
- `src/config/`: Loads and validates YAML config files
- `src/prompts/`: Generates AI prompts based on the config
- `src/utils/`: Common helpers like file I/O
- `src/services/`: Core services for Gemini API interaction

## License

ISC 

npm run test:veo2  # Test video generation
npm run test:tts   # Test speech generation 