import jsonpointer from 'jsonpointer';
import type { PropValue, DynamicValue } from './types';

/**
 * Resolve a prop value, handling both literal and path-based values
 */
export function resolvePropValue(
  value: PropValue,
  dataModel: Record<string, unknown>
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const dynamic = value as DynamicValue;
    if (dynamic.path) {
      try {
        return jsonpointer.get(dataModel, dynamic.path);
      } catch (error) {
        console.warn(`Failed to resolve path ${dynamic.path}:`, error);
        return dynamic.literal ?? null;
      }
    }
    return dynamic.literal ?? null;
  }

  return value;
}

