# SOFY: Faceless Video AI Agent

An automated agent that generates and uploads full videos to YouTube. Complete hands-free.

## Features

- Generate 6-8 second video clips using Google's Veo2 API
- Stitch clips together into a complete video
- Add background music
- Add AI-generated voiceovers
- Add subtitles
- Post-editing with Remotion
- Support for multiple niches through YAML configuration

## Prerequisites

- Node.js (v16+)
- Google Gemini API keys

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/yt-agent.git
cd yt-agent
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Gemini API keys:

```
GEMINI_API_KEY_1=your_api_key_1
GEMINI_API_KEY_2=your_api_key_2
# Add more keys as needed
```

## Configuration

The project uses YAML configuration files located in the `config/niches` directory. Each file represents a different video niche.

Example configuration:

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

## Usage

### Generate a Video

```bash
npm run generate -- --niche motivational
```

### List Available Niches

```bash
npm run generate -- --list-niches
```

### Show Help

```bash
npm run generate -- --help
```

## Project Structure

- `config/`: Stores YAML configuration files per niche
- `src/veo/`: Generates and stitches short Veo2 videos
- `src/audio/`: Handles music and TTS generation
- `src/remotion/`: Syncs visuals, adds subtitles, and renders final video
- `src/config/`: Loads and validates YAML config files
- `src/prompts/`: Generates AI prompts based on the config
- `src/utils/`: Common helpers like file I/O
- `src/cli/`: CLI interface for video generation
- `src/api/`: Express.js server with REST endpoints (future)
- `src/social/`: Scripts to post to social media platforms (future)

## License

ISC 

npm run test:veo2  # Test video generation
npm run test:tts   # Test speech generation 