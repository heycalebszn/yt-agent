#!/usr/bin/env node

import { VideoGeneratorCli } from '../cli/videoGeneratorCli';

// Run the CLI with command line arguments (excluding the first two)
VideoGeneratorCli.run(process.argv.slice(2))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 