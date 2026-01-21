import express, { Express } from 'express';
import { applyMiddleware } from './middleware';
import { createAgentRoutes } from './routes/agents';
import { SERVER_CONFIG } from '../config';
import type { Mastra } from '@mastra/core/mastra';

/**
 * Creates and configures the Express server
 */
export function createServer(mastra: Mastra): Express {
  const app = express();

  // Apply middleware
  applyMiddleware(app);

  // Register routes
  app.use(createAgentRoutes(mastra));

  return app;
}

/**
 * Starts the Express server
 */
export function startServer(app: Express): void {
  const PORT = SERVER_CONFIG.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
