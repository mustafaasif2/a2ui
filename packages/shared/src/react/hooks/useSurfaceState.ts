import { useState, useCallback } from 'react';
import jsonpointer from 'jsonpointer';
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
          setSurface((prev) => ({
            ...prev,
            isReady: true,
            root: message.root || prev.root, // Per spec, beginRendering can specify root
          }));
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

  const updateDataModel = useCallback(
    (path: string, value: unknown) => {
      setSurface((prev) => {
        const newDataModel = JSON.parse(JSON.stringify(prev.dataModel)); // Deep clone
        try {
          // Use JSON Pointer to set the value (per A2UI v0.8 spec)
          jsonpointer.set(newDataModel, path, value);
        } catch (error) {
          console.error(`Failed to update data model at path ${path}:`, error);
          // Fallback: try to create the path structure
          const pathParts = path.replace(/^\//, '').split('/');
          let current: any = newDataModel;
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i].replace(/~1/g, '/').replace(/~0/g, '~'); // Unescape JSON Pointer
            if (!(part in current) || typeof current[part] !== 'object' || current[part] === null || Array.isArray(current[part])) {
              current[part] = {};
            }
            current = current[part];
          }
          const lastPart = pathParts[pathParts.length - 1].replace(/~1/g, '/').replace(/~0/g, '~');
          current[lastPart] = value;
        }
        return {
          ...prev,
          dataModel: newDataModel,
        };
      });
    },
    []
  );

  return {
    surface,
    handleMessage,
    updateDataModel,
  };
}
