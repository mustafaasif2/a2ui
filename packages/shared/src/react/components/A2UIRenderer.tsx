import React, { useEffect } from 'react';
import type { A2UIMessage, ErrorMessage } from '../../types';
import { useSurfaceState } from '../hooks/useSurfaceState';
import ComponentRenderer, { type ComponentRegistry } from './ComponentRenderer';
import SurfaceLoading from './SurfaceLoading';

interface A2UIRendererProps {
  surfaceId?: string;
  messages?: A2UIMessage[];
  componentRegistry: ComponentRegistry;
  defaultSurfaceId?: string;
  onAction?: (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => void;
  onError?: (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => void;
  className?: string;
}

export default function A2UIRenderer({
  surfaceId,
  messages = [],
  componentRegistry,
  defaultSurfaceId = 'main',
  onAction,
  onError,
  className = 'a2ui-renderer',
}: A2UIRendererProps) {
  const currentSurfaceId = surfaceId || defaultSurfaceId;
  const { surface, handleMessage, updateDataModel } = useSurfaceState(currentSurfaceId);

  useEffect(() => {
    messages.forEach((message) => {
      handleMessage(message);
    });
  }, [messages, handleMessage]);

  const handleAction = (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => {
    // Handle two-way binding for input components
    if (action.name === 'inputChange' && action.context?.valuePath && action.context?.value !== undefined) {
      const valuePath = action.context.valuePath as string;
      updateDataModel(valuePath, action.context.value);
    }
    onAction?.(action);
  };

  const handleError = (error: { message: string; code?: string; componentId?: string; context?: Record<string, unknown> }) => {
    // Create ErrorMessage per A2UI v0.8 spec
    const errorMessage: ErrorMessage = {
      type: 'error',
      surfaceId: currentSurfaceId,
      error: {
        message: error.message,
        code: error.code,
        componentId: error.componentId,
        context: error.context,
      },
    };
    // Call onError callback if provided (for sending to server)
    onError?.(error);
    // Also log for debugging
    console.error('A2UI Error:', errorMessage);
  };

  if (!surface.isReady || !surface.root) {
    return <SurfaceLoading />;
  }

  return (
    <div className={className}>
      <ComponentRenderer
        componentId={surface.root}
        surface={surface}
        componentRegistry={componentRegistry}
        onAction={handleAction}
        onError={handleError}
        updateDataModel={updateDataModel}
      />
    </div>
  );
}
