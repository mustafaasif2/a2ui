import type { SurfaceState } from '../../types';
import { resolvePropValue } from '../../utils';

/**
 * Creates an action handler for Button components
 * Per A2UI v0.8 spec: resolve context values with bound data and include required fields
 */
export function createButtonActionHandler(
  componentId: string,
  componentType: string,
  componentProps: Record<string, unknown>,
  surface: SurfaceState,
  onAction?: (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => void,
  isActionLoading?: boolean
): {
  onAction?: (() => void) | undefined;
  isLoading?: boolean;
} {
  if (componentType !== 'Button') {
    return {};
  }

  // Pass loading state to button
  const result: { onAction?: (() => void) | undefined; isLoading?: boolean } = {
    isLoading: isActionLoading,
  };

  if ('action' in componentProps && componentProps.action) {
    // Button has explicit action defined
    const action = componentProps.action as { name: string; context?: Record<string, unknown> };
    result.onAction = (() => {
      if (onAction) {
        // Resolve context values with bound data from data model
        let finalContext = action.context;
        if (action.context) {
          const resolvedContext: Record<string, unknown> = {};
          Object.entries(action.context).forEach(([key, value]) => {
            // If value is a path or combined value, resolve it
            if (typeof value === 'object' && value !== null && 'path' in value) {
              resolvedContext[key] = resolvePropValue(value as any, surface.dataModel);
            } else {
              // Otherwise, try to resolve it as a prop value
              resolvedContext[key] = resolvePropValue(value as any, surface.dataModel);
            }
          });
          finalContext = Object.keys(resolvedContext).length > 0 ? resolvedContext : action.context;
        }
        
        onAction({
          name: action.name,
          sourceComponentId: componentId,
          surfaceId: surface.surfaceId,
          timestamp: new Date().toISOString(),
          context: finalContext,
        });
      }
    }) as any;
  } else {
    // Button without explicit action - provide default action handler
    // This ensures buttons always work, even if LLM doesn't generate an action
    result.onAction = (() => {
      if (onAction) {
        const buttonLabel = (componentProps.text || componentProps.label || 'Button') as string;
        const isSubmitButton = buttonLabel.toLowerCase().includes('submit') || 
                               buttonLabel.toLowerCase().includes('login') ||
                               buttonLabel.toLowerCase().includes('send');
        
        const context: Record<string, unknown> = {
          buttonId: componentId,
          label: buttonLabel,
        };
        
        // For submit buttons, include the entire data model (form data)
        // This allows the server to process all form fields at once
        if (isSubmitButton) {
          context.formData = surface.dataModel;
        }
        
        onAction({
          name: isSubmitButton ? 'submit' : 'buttonClick',
          sourceComponentId: componentId,
          surfaceId: surface.surfaceId,
          timestamp: new Date().toISOString(),
          context,
        });
      }
    }) as any;
  }

  return result;
}
