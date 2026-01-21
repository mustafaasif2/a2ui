import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateA2UIMessage } from '@a2ui/shared/a2ui';
import { wrapA2UIMessageForAGUITransport } from '@a2ui/shared/transport';

/**
 * A2UI Tool for AG-UI Transport
 * 
 * This tool generates A2UI component specifications and wraps them
 * for transport via AG-UI. The separation is:
 * - A2UI: Component specification (what to render)
 * - AG-UI: Transport layer (how messages are sent)
 */
export const generateA2UITool = createTool({
  id: 'generate-a2ui',
  description: 'Generate a dynamic UI using the A2UI protocol. The A2UI message will be transported via AG-UI.',
  inputSchema: z.object({
    prompt: z.string().describe('UI description (e.g., "create a form", "show a list")'),
    surfaceId: z.string().optional().default('main'),
  }),
  outputSchema: z.object({
    message: z.any(),
  }),
  execute: async ({ context }) => {
    // Generate A2UI component specification
    const a2uiMessage = await generateA2UIMessage(context.prompt, context.surfaceId || 'main');
    
    // Wrap for AG-UI transport
    return wrapA2UIMessageForAGUITransport(a2uiMessage);
  },
});
