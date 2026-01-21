import jsonpointer from 'jsonpointer';
import type { PropValue, LiteralValue, PathValue, CombinedValue, DynamicValue } from './types';

/**
 * Resolve a prop value, handling both literal and path-based values
 * 
 * Per A2UI v0.8 spec:
 * - literalString, literalBoolean, literalNumber for literal values
 * - path for dynamic values (JSON Pointer)
 * - Can combine both (literal as default, path for binding)
 */
export function resolvePropValue(
  value: PropValue,
  dataModel: Record<string, unknown>
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // Primitive values
  if (typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  // A2UI v0.8 spec: Combined value (literal + path)
  const combined = value as CombinedValue;
  if (combined.path && (combined.literalString !== undefined || combined.literalBoolean !== undefined || combined.literalNumber !== undefined)) {
    try {
      const pathValue = jsonpointer.get(dataModel, combined.path);
      // If path resolves, use it; otherwise use literal as fallback
      return pathValue !== undefined ? pathValue : (combined.literalString ?? combined.literalBoolean ?? combined.literalNumber ?? null);
    } catch (error) {
      console.warn(`Failed to resolve path ${combined.path}:`, error);
      return combined.literalString ?? combined.literalBoolean ?? combined.literalNumber ?? null;
    }
  }

  // A2UI v0.8 spec: Path value
  const pathValue = value as PathValue;
  if (pathValue.path) {
    try {
      return jsonpointer.get(dataModel, pathValue.path);
    } catch (error) {
      console.warn(`Failed to resolve path ${pathValue.path}:`, error);
      return null;
    }
  }

  // A2UI v0.8 spec: Literal value
  const literal = value as LiteralValue;
  if (literal.literalString !== undefined) {
    return literal.literalString;
  }
  if (literal.literalBoolean !== undefined) {
    return literal.literalBoolean;
  }
  if (literal.literalNumber !== undefined) {
    return literal.literalNumber;
  }

  // Legacy DynamicValue support (for backward compatibility)
  const dynamic = value as DynamicValue;
  if (dynamic.path) {
    try {
      return jsonpointer.get(dataModel, dynamic.path);
    } catch (error) {
      console.warn(`Failed to resolve path ${dynamic.path}:`, error);
      return dynamic.literal ?? null;
    }
  }
  if (dynamic.literal !== undefined) {
    return dynamic.literal;
  }

  return value;
}

