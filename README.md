# SOFY: Faceless Video AI Agent

SOFY is an open-source AI agent built with Node.js that generates faceless videos using Gemini's Veo 2, background music, and voiceovers. It supports video syncing and editing, configuration via YAML files, and is designed to be extensible for various content niches.

## Project Structure

The project is organized into several key components:

- **config/**: Stores YAML configuration files per niche
- **scripts/**: CLI entry point to run video generation
- **src/veo/**: Generates and stitches short Veo 2 videos
- **src/audio/**: Handles music and TTS generation using Gemini
- **src/remotion/**: Syncs visuals, adds subtitles, and renders final video
- **src/config/**: Loads and validates YAML config files
- **src/prompts/**: Generates AI prompts based on the config
- **src/monitoring/**: Tracks video generation jobs, errors, and analytics
- **src/utils/**: Common helpers like file I/O

## Current Implementation Status

The project is currently in development with the following components implemented:

- ✅ Basic project structure
- ✅ Configuration loading and validation
- ✅ Video generation (mock implementation)
- ✅ Prompt generation system
- ✅ Job tracking and monitoring
- ✅ Analytics
- ❌ Full Veo2 API integration (waiting for API access)
- ❌ TTS and Music API integration (waiting for API access)
- ❌ Video editing with Remotion
- ❌ Social media publishing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/heyrapto/sofy.git
cd sofy

# Install dependencies
npm install
```

### Configuration

Create a YAML configuration file in the `config/` directory. See `config/motivational.yaml` for an example.

```yaml
niche: motivational
theme: growth_mindset
language: en
duration: 60
style: cinematic
prompt:
  type: dynamic
  topic: "Discipline and Consistency"
  tone: inspirational
  emotion: high_energy
video:
  resolution: 1080p
  format: mp4
  stitch_length: 8
voiceover:
  model: gemini_tts
  voice: deep_male
music:
  model: gemini_music
  mood: inspiring
  tempo: mid
subtitles:
  enable: true
  style: default
output:
  path: ./output/motivational/
  upload: false
```

### Usage

```bash
# Generate a video using a configuration file
npm run generate -- config/motivational.yaml
```

## Development Roadmap

### Phase 1: Core CLI + Video Generator
- ✅ Basic project structure
- ✅ Configuration system
- ✅ Prompt generation
- ✅ Monitoring and analytics
- ❌ Video generation with Veo2
- ❌ Audio generation with Gemini TTS

### Phase 2: Multi-Niche + Config Wizard
- ❌ Templates for new YAML niches
- ❌ Interactive CLI for config creation
- ❌ Prebuilt prompt strategies per niche

### Phase 3: API Server + Minimal Web UI
- ❌ Express.js server with REST endpoints
- ❌ Web interface to select niche/config and generate video

### Phase 4: Social Posting Integrations
- ❌ Scripts to post to Instagram, YouTube, and TikTok
- ❌ OAuth and access token storage

## API Keys

To use the Gemini API, you need to set up API keys. The system supports multiple API keys for load balancing:

```
GEMINI_API_KEY_1=your_api_key_1
GEMINI_API_KEY_2=your_api_key_2
...
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
