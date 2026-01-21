import type { SurfaceUpdateMessage, ComponentDefinition } from '../types';
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
  
  // Schema matching A2UI v0.8 specification
  const componentSchema = z.object({
    id: z.string(),
    component: z.union([
      z.object({
        Text: z.object({
          text: z.union([
            z.object({ literalString: z.string() }),
            z.object({ path: z.string() }),
            z.object({ literalString: z.string().optional(), path: z.string() }),
          ]).optional(),
          usageHint: z.string().optional(),
        }).passthrough(), // Allow additional props
      }),
      z.object({
        Button: z.object({
          child: z.string().optional(), // Component ID
          action: z.object({
            name: z.string(),
            context: z.any().optional(), // Use z.any() instead of z.record() to avoid Google API schema validation issues
          }).optional(),
          explicitList: z.array(z.string()).optional(), // For multiple children
        }).passthrough(),
      }),
      z.object({
        Card: z.object({
          explicitList: z.array(z.string()).optional(), // Component IDs
        }).passthrough(),
      }),
      z.object({
        Row: z.object({
          explicitList: z.array(z.string()).optional(), // Component IDs
        }).passthrough(),
      }),
      z.object({
        Column: z.object({
          explicitList: z.array(z.string()).optional(), // Component IDs
        }).passthrough(),
      }),
      z.object({
        List: z.object({
          explicitList: z.array(z.string()).optional(), // For static lists
          template: z.object({
            children: z.array(z.string()),
            dataPath: z.string(),
          }).optional(), // For dynamic lists
        }).passthrough(),
      }),
      z.object({
        TextField: z.object({
          value: z.union([
            z.object({ literalString: z.string() }),
            z.object({ path: z.string() }),
            z.object({ literalString: z.string().optional(), path: z.string() }),
          ]).optional(),
          label: z.union([
            z.object({ literalString: z.string() }),
            z.object({ path: z.string() }),
            z.object({ literalString: z.string().optional(), path: z.string() }),
          ]).optional(),
          placeholder: z.union([
            z.object({ literalString: z.string() }),
            z.object({ path: z.string() }),
            z.object({ literalString: z.string().optional(), path: z.string() }),
          ]).optional(),
        }).passthrough(),
      }),
    ]),
    template: z.object({
      children: z.array(z.string()),
      dataPath: z.string().optional(),
    }).optional(),
  });

  const a2uiSchema = z.object({
    type: z.literal('surfaceUpdate'),
    surfaceId: z.string(),
    root: z.string(),
    components: z.array(componentSchema),
  });

  const result = await generateObject({
    model,
    prompt: `Generate an A2UI v0.8 surfaceUpdate message for the following request: "${prompt}"

A2UI v0.8 Specification Requirements:
- surfaceId must be "${surfaceId}"
- root must be the ID of the top-level component (usually "root")
- Each component must have a unique id
- Components use nested structure: { "id": "...", "component": { "Text": { "text": { "literalString": "..." } } } }
- For text values, use { "literalString": "..." } or { "path": "/data/path" } or both
- For container components (Row, Column, Card, List), use "explicitList" array of component IDs for static children
- For dynamic lists, use "template" with "children" and "dataPath"
- Button components use "child" (single) or "explicitList" (multiple) for children
- Use proper component hierarchy (Column/Row for layout, Card for containers)
- For forms, use TextField components with label using literalString
- Make the UI match the user's request accurately

Example structure:
{
  "type": "surfaceUpdate",
  "surfaceId": "${surfaceId}",
  "root": "root",
  "components": [
    {
      "id": "root",
      "component": {
        "Column": {
          "explicitList": ["title", "content"]
        }
      }
    },
    {
      "id": "title",
      "component": {
        "Text": {
          "text": { "literalString": "Hello" }
        }
      }
    }
  ]
}`,
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
