import express, { Express, Request, Response } from 'express';
import path from 'path';
import { MonitoringService } from './monitoring';

export async function startServer(port: number): Promise<void> {
  const app: Express = express();
  const monitoring = MonitoringService.getInstance();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('/', (req, res) => {
    res.send('SOFY Video Generator API is running');
  });
  
  // Add monitoring endpoint
  app.get('/api/status', (req: Request, res: Response) => {
    try {
      const jobs = monitoring.getAllJobs();
      const metrics = monitoring.getAnalytics();
      
      // Get active jobs
      const activeJobs = jobs.filter(job => 
        job.status === 'running' || job.status === 'pending'
      );
      
      // Get recent jobs
      const recentJobs = jobs
        .filter(job => job.status === 'completed' || job.status === 'failed')
        .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
        .slice(0, 5);
      
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        metrics,
        activeJobs,
        recentJobs
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get monitoring data',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
      resolve();
    });
  });
}