import dotenv from 'dotenv';
import { startServer } from './app';

dotenv.config();

async function bootstrap() {
  try {
    const port = process.env.PORT || 3000;
    await startServer(Number(port));
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
