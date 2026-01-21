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
  isActionLoading?: boolean;
}

export default function A2UIRenderer({
  surfaceId,
  messages = [],
  componentRegistry,
  defaultSurfaceId = 'main',
  onAction,
  onError,
  className = 'a2ui-renderer',
  isActionLoading = false,
}: A2UIRendererProps) {
  const currentSurfaceId = surfaceId || defaultSurfaceId;
  const { surface, handleMessage, updateDataModel } = useSurfaceState(currentSurfaceId);

  useEffect(() => {
    console.log(`A2UIRenderer [${currentSurfaceId}]: Processing ${messages.length} messages:`, messages);
    messages.forEach((message) => {
      console.log(`A2UIRenderer [${currentSurfaceId}]: Processing message:`, message.type, 'with surfaceId:', message.surfaceId);
      handleMessage(message);
    });
    console.log(`A2UIRenderer [${currentSurfaceId}]: Surface state after processing:`, {
      isReady: surface.isReady,
      root: surface.root,
      componentCount: surface.components.size,
    });
  }, [messages, handleMessage, currentSurfaceId, surface.isReady, surface.root, surface.components.size]);

  const handleAction = (action: { name: string; sourceComponentId: string; surfaceId: string; timestamp: string; context?: Record<string, unknown> }) => {
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
    // The callback should send the error message via AG-UI transport
    onError?.(error);
    // Also log for debugging
    console.error('A2UI Error:', errorMessage);
  };

  // If surface was deleted (no components and not ready), don't render anything
  // This happens when deleteSurface message was processed
  if (surface.components.size === 0 && !surface.isReady) {
    return null;
  }

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
        isActionLoading={isActionLoading}
      />
    </div>
  );
}
