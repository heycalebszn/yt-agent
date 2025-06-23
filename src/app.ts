import express, { Express } from 'express';
import path from 'path';

export async function startServer(port: number): Promise<void> {
  const app: Express = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Static files
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Basic route
  app.get('/', (req, res) => {
    res.send('SOFY Video Generator API is running');
  });
  
  // Start the server
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
      resolve();
    });
  });
}