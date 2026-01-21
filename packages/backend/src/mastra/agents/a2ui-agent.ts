import 'dotenv/config';
import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { generateA2UITool } from '../tools/generate-a2ui-tool';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required');
}

export const a2uiAgent = new Agent({
  name: 'A2UI Agent',
  description: 'Generates dynamic UIs using the A2UI protocol',
  instructions: `Generate UIs using the generate-a2ui tool. Available components: Text, Button, Card, Row, Column, List, TextField.`,
  model: google('gemini-2.5-flash'),
  tools: {
    generateA2UITool,
  },
});
