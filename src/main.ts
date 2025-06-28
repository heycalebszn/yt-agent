import dotenv from 'dotenv';
import { startServer } from './app';
import { MonitoringDashboard } from './monitoring';
import { scheduleYouTubeUploads } from './scripts/scheduleUploads';

dotenv.config();

async function bootstrap() {
  try {
    // Start monitoring dashboard if enabled
    const enableDashboard = process.env.ENABLE_DASHBOARD !== 'false'; // Default to true
    if (enableDashboard) {
      console.log('Starting monitoring dashboard...');
      const refreshInterval = parseInt(process.env.MONITOR_REFRESH_INTERVAL || '5000');
      const maxLogEntries = parseInt(process.env.MONITOR_MAX_LOG_ENTRIES || '10');
      const showActiveJobsOnly = process.env.MONITOR_SHOW_ACTIVE_ONLY === 'true';
      
      const dashboard = MonitoringDashboard.getInstance({
        refreshInterval,
        maxLogEntries,
        showActiveJobsOnly
      });
      
      dashboard.start();
    }
    
    // Start YouTube upload scheduler if enabled
    const autoUploadEnabled = process.env.AUTO_UPLOAD_ENABLED === 'true';
    if (autoUploadEnabled) {
      console.log('Starting YouTube upload scheduler...');
      await scheduleYouTubeUploads();
    }
    
    // Start the server
    const port = process.env.PORT || 3000;
    await startServer(Number(port));
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();