import type { SurfaceUpdateMessage } from '../types';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * Generate A2UI messages using an LLM based on user prompts
 */
export async function generateA2UIMessage(
  prompt: string,
  surfaceId: string
): Promise<SurfaceUpdateMessage> {
  // Use LLM to generate A2UI JSON - using Gemini 2.5 Flash
  const model = google('gemini-2.5-flash');
  
  const a2uiSchema = z.object({
    type: z.literal('surfaceUpdate'),
    surfaceId: z.string(),
    root: z.string(),
    components: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['Text', 'Button', 'Card', 'Row', 'Column', 'List', 'TextField']),
        props: z.any().optional(), // Use z.any() instead of z.record() to avoid Google API schema validation issues
        children: z.array(z.string()).optional(),
      })
    ),
  });

  const result = await generateObject({
    model,
    prompt: `Generate an A2UI surfaceUpdate message for the following request: "${prompt}"

Available component types: Text, Button, Card, Row, Column, List, TextField

Requirements:
- surfaceId should be "${surfaceId}"
- root should be the ID of the top-level component (usually "root")
- Each component must have a unique id
- Use proper component hierarchy (Column/Row for layout, Card for containers)
- For forms, use TextField components with appropriate labels
- For lists, use List component with Text children
- Make the UI match the user's request accurately`,
    schema: a2uiSchema,
  } as any);

  // The structured output returns the parsed object directly
  const parsed = result.object as unknown as SurfaceUpdateMessage;
  
  // Validate it's a surfaceUpdate message
  if (parsed.type !== 'surfaceUpdate' || parsed.surfaceId !== surfaceId) {
    throw new Error('Invalid A2UI message generated');
  }

  // Validate that root component exists
  if (parsed.root) {
    const rootComponentExists = parsed.components.some(comp => comp.id === parsed.root);
    if (!rootComponentExists) {
      throw new Error(`Root component "${parsed.root}" not found in components array`);
    }
  } else {
    // If no root specified, use the first component or create a default root
    if (parsed.components.length > 0) {
      parsed.root = parsed.components[0].id;
    } else {
      throw new Error('No components generated and no root specified');
    }
  }

  return parsed;
}
