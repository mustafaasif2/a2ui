import { Mastra } from '@mastra/core/mastra';
import { a2uiAgent } from './agents/a2ui-agent';

// Mastra instance for use in Express - no separate server needed
export const mastra = new Mastra({
  agents: { a2uiAgent },
});
