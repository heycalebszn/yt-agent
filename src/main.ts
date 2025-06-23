import dotenv from 'dotenv';
import path from 'path';
import { startServer } from './app';

// Load environment variables
dotenv.config();

async function bootstrap() {
  try {
    // Start the server
    const port = process.env.PORT || 3000;
    await startServer(Number(port));
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
