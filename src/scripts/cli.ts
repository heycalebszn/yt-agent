#!/usr/bin/env node

import dotenv from 'dotenv';
import { VideoGeneratorCli } from '../cli/videoGeneratorCli';

// Load environment variables
dotenv.config();

// Run the CLI with command line arguments
VideoGeneratorCli.run(process.argv.slice(2))
  .catch(error => {
    console.error('Error running CLI:', error);
    process.exit(1);
  }); 