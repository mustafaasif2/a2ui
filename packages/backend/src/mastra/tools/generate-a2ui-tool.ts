import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { generateA2UIMessage, generateDeleteSurfaceMessage } from '@a2ui/shared/a2ui';
import { wrapA2UIMessageForAGUITransport } from '@a2ui/shared/transport';

/**
 * Unified A2UI Tool for AG-UI Transport
 * 
 * This tool handles both creating new UI components and deleting surfaces.
 * The separation is:
 * - A2UI: Component specification (what to render)
 * - AG-UI: Transport layer (how messages are sent)
 */
export const a2uiTool = createTool({
  id: 'a2ui',
  description: 'Manage A2UI surfaces: create new UI components or delete existing surfaces. Use action="delete" to remove a surface, or action="create" (default) to generate a new UI component.',
  inputSchema: z.object({
    action: z.enum(['create', 'delete']).optional().default('create').describe('Action to perform: "create" for new UI components, "delete" to remove a surface'),
    prompt: z.string().optional().describe('UI description (required for "create" action, e.g., "create a form", "show a list")'),
    surfaceId: z.string().optional().describe('Surface ID. For "create": omit or use "auto" to generate unique ID. For "delete": the exact surfaceId to remove (required).'),
  }),
  outputSchema: z.object({
    message: z.any(),
  }),
  execute: async ({ context }) => {
    // Handle delete action
    if (context.action === 'delete') {
      if (!context.surfaceId) {
        throw new Error('surfaceId is required for delete action');
      }
      const deleteMessage = generateDeleteSurfaceMessage(context.surfaceId);
      return wrapA2UIMessageForAGUITransport(deleteMessage);
    }

    // Handle create action (default)
    if (!context.prompt) {
      throw new Error('prompt is required for create action');
    }

    // Per A2UI v0.8 spec: Each surface must have a unique surfaceId
    // If surfaceId is not provided or is "main"/"auto", generate a unique UUID
    // This ensures each new component gets its own independent surface
    let targetSurfaceId = context.surfaceId;
    if (!targetSurfaceId || targetSurfaceId === 'main' || targetSurfaceId === 'auto') {
      targetSurfaceId = `surface-${randomUUID()}`;
      console.log(`a2uiTool: Generated unique surfaceId: ${targetSurfaceId}`);
    }
    
    // Generate A2UI component specification with unique surfaceId
    const a2uiMessage = await generateA2UIMessage(context.prompt, targetSurfaceId);
    
    // Wrap for AG-UI transport
    return wrapA2UIMessageForAGUITransport(a2uiMessage);
  },
});

// Keep the old name for backward compatibility
export const generateA2UITool = a2uiTool;
