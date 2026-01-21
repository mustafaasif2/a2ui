import { useState, useCallback } from 'react';
import type { SurfaceState, A2UIMessage, ComponentDefinition } from '../../types';

export function useSurfaceState(surfaceId: string) {
  const [surface, setSurface] = useState<SurfaceState>({
    surfaceId,
    components: new Map(),
    dataModel: {},
    isReady: false,
  });

  const handleMessage = useCallback(
    (message: A2UIMessage) => {
      if (message.surfaceId !== surfaceId) {
        return;
      }

      switch (message.type) {
        case 'surfaceUpdate':
          setSurface((prev) => {
            const newComponents = new Map(prev.components);
            message.components.forEach((comp: ComponentDefinition) => {
              newComponents.set(comp.id, comp);
            });
            return {
              ...prev,
              components: newComponents,
              root: message.root || prev.root,
              isReady: message.root ? true : prev.isReady,
            };
          });
          break;

        case 'dataModelUpdate':
          setSurface((prev) => ({
            ...prev,
            dataModel: { ...prev.dataModel, ...message.dataModel },
          }));
          break;

        case 'beginRendering':
          setSurface((prev) => ({ ...prev, isReady: true }));
          break;

        case 'deleteSurface':
          setSurface({
            surfaceId,
            components: new Map(),
            dataModel: {},
            isReady: false,
          });
          break;
      }
    },
    [surfaceId]
  );

  return {
    surface,
    handleMessage,
  };
}
