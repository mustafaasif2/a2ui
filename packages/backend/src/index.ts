import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MastraAgent } from '@ag-ui/mastra';
import { mastra } from './mastra';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const agUiAgent = MastraAgent.getLocalAgent({
  mastra,
  agentId: 'a2uiAgent',
});

app.post('/api/agents/:agentId/run', async (req, res) => {
  if (req.params.agentId !== 'a2uiAgent') {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
