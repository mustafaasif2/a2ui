import { Router, Request, Response } from 'express';
import { MastraAgent } from '@ag-ui/mastra';
import { SERVER_CONFIG } from '../../config';
import type { Mastra } from '@mastra/core/mastra';

/**
 * Creates agent routes for the Express server
 */
export function createAgentRoutes(mastra: Mastra): Router {
  const router = Router();
  const agUiAgent = MastraAgent.getLocalAgent({
    mastra,
    agentId: SERVER_CONFIG.AGENT_ID,
  });

  router.post('/api/agents/:agentId/run', async (req: Request, res: Response) => {
    if (req.params.agentId !== SERVER_CONFIG.AGENT_ID) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    agUiAgent.run(req.body).subscribe({
      next: (event) => res.write(`data: ${JSON.stringify(event)}\n\n`),
      error: (error) => {
        console.error('Stream error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      },
      complete: () => res.end(),
    });
  });

  return router;
}
