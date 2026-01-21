import React, { useEffect } from 'react';
import type { A2UIMessage } from '../../types';
import { useSurfaceState } from '../hooks/useSurfaceState';
import ComponentRenderer, { type ComponentRegistry } from './ComponentRenderer';
import SurfaceLoading from './SurfaceLoading';

interface A2UIRendererProps {
  surfaceId?: string;
  messages?: A2UIMessage[];
  componentRegistry: ComponentRegistry;
  defaultSurfaceId?: string;
  onAction?: (action: { name: string; context?: Record<string, unknown> }) => void;
  className?: string;
}

export default function A2UIRenderer({
  surfaceId,
  messages = [],
  componentRegistry,
  defaultSurfaceId = 'main',
  onAction,
  className = 'a2ui-renderer',
}: A2UIRendererProps) {
  const currentSurfaceId = surfaceId || defaultSurfaceId;
  const { surface, handleMessage } = useSurfaceState(currentSurfaceId);

  useEffect(() => {
    messages.forEach((message) => {
      handleMessage(message);
    });
  }, [messages, handleMessage]);

  const handleAction = (action: { name: string; context?: Record<string, unknown> }) => {
    onAction?.(action);
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
      />
    </div>
  );
}
