import { useState, useCallback } from 'react';
import jsonpointer from 'jsonpointer';
import type { SurfaceState, A2UIMessage, ComponentDefinition } from '../../types';
import { validateJSONPointer, validateComponentDefinition } from '../../utils/validation';

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
        console.log(`useSurfaceState [${surfaceId}]: Ignoring message with mismatched surfaceId:`, message.surfaceId, 'expected:', surfaceId);
        return;
      }
      console.log(`useSurfaceState [${surfaceId}]: Processing ${message.type} message`);

      switch (message.type) {
        case 'surfaceUpdate':
          setSurface((prev) => {
            const newComponents = new Map(prev.components);
            message.components.forEach((comp: ComponentDefinition) => {
              // Validate component definition before adding (security requirement)
              if (!validateComponentDefinition(comp)) {
                const compId = (comp as any)?.id || 'unknown';
                console.error(`Invalid component definition for component ${compId}:`, comp);
                return; // Skip invalid components
              }
              newComponents.set(comp.id, comp);
            });
            // Validate that root component exists if specified
            const rootId = message.root || prev.root;
            if (rootId && !newComponents.has(rootId)) {
              console.warn(`Root component ${rootId} not found in surfaceUpdate. Rendering will be delayed.`);
            }
            return {
              ...prev,
              components: newComponents,
              root: rootId,
              // Don't set isReady yet - wait for beginRendering (message ordering validation)
              isReady: false,
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
          setSurface((prev) => {
            const rootId = message.root || prev.root;
            // Message ordering validation: ensure root component exists before rendering
            if (!rootId) {
              console.warn('beginRendering called without root component ID');
              return prev;
            }
            if (!prev.components.has(rootId)) {
              console.warn(`beginRendering called but root component ${rootId} not yet defined. Waiting for surfaceUpdate.`);
              return prev; // Don't set isReady until root exists
            }
            return {
              ...prev,
              isReady: true,
              root: rootId,
            };
          });
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
      // Validate path before using it (security requirement)
      if (!validateJSONPointer(path)) {
        console.error(`Invalid JSON Pointer path: ${path}`);
        return;
      }

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
