import dotenv from 'dotenv';
import { MonitoringDashboard } from '../monitoring';

// Load environment variables
dotenv.config();

/**
 * Start the monitoring dashboard
 */
function startMonitoring(): void {
  try {
    // Get configuration from environment variables
    const refreshInterval = parseInt(process.env.MONITOR_REFRESH_INTERVAL || '5000');
    const maxLogEntries = parseInt(process.env.MONITOR_MAX_LOG_ENTRIES || '10');
    const showActiveJobsOnly = process.env.MONITOR_SHOW_ACTIVE_ONLY === 'true';
    
    // Create dashboard instance
    const dashboard = MonitoringDashboard.getInstance({
      refreshInterval,
      maxLogEntries,
      showActiveJobsOnly
    });
    
    // Start the dashboard
    dashboard.start();
    
    console.log(`Monitoring dashboard started with refresh interval of ${refreshInterval}ms`);
    console.log('Press Ctrl+C to exit');
  } catch (error: any) {
    console.error('Error starting monitoring dashboard:', error.message);
    process.exit(1);
  }
}

// If this script is run directly
if (require.main === module) {
  startMonitoring();
}

export { startMonitoring }; 