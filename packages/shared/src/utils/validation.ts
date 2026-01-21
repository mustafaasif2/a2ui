/**
 * Validation utilities for A2UI messages and components
 * Per A2UI v0.8 spec security requirements
 */

import type { ComponentDefinition, ComponentTypeDefinition, UserActionMessage, ErrorMessage } from '../types';

/**
 * Validates a JSON Pointer path
 * Per A2UI spec, paths must be valid JSON Pointer format
 */
export function validateJSONPointer(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // JSON Pointer must start with '/' or be empty
  if (path !== '' && !path.startsWith('/')) {
    return false;
  }

  // Validate path segments (basic validation)
  // More strict validation could check for proper escaping
  try {
    // Try to parse as JSON Pointer (basic check)
    const segments = path.split('/').filter(s => s !== '');
    // Each segment should be a valid identifier or array index
    for (const segment of segments) {
      // Unescape JSON Pointer escapes
      const unescaped = segment.replace(/~1/g, '/').replace(/~0/g, '~');
      // Should be a valid property name or array index
      if (unescaped === '' || unescaped.includes('~') && !unescaped.match(/^~[01]$/)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a string value to prevent XSS
 * Basic sanitization - in production, use a proper sanitization library
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  
  // Basic XSS prevention - escape HTML entities
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates component ID format
 * Component IDs should be non-empty strings
 */
export function validateComponentId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Validates a UserAction message structure
 * Per A2UI v0.8 spec requirements
 */
export function validateUserActionMessage(action: unknown): action is UserActionMessage {
  if (!action || typeof action !== 'object') {
    return false;
  }

  const msg = action as Record<string, unknown>;
  
  // Required fields per spec
  if (msg.type !== 'userAction') {
    return false;
  }
  
  if (typeof msg.name !== 'string' || msg.name.length === 0) {
    return false;
  }
  
  if (typeof msg.surfaceId !== 'string' || msg.surfaceId.length === 0) {
    return false;
  }
  
  if (typeof msg.sourceComponentId !== 'string' || msg.sourceComponentId.length === 0) {
    return false;
  }
  
  // Timestamp must be valid ISO 8601 string
  if (typeof msg.timestamp !== 'string' || !msg.timestamp.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    return false;
  }
  
  // Context is optional but if present must be an object
  if (msg.context !== undefined && (typeof msg.context !== 'object' || msg.context === null || Array.isArray(msg.context))) {
    return false;
  }
  
  return true;
}

/**
 * Validates an Error message structure
 * Per A2UI v0.8 spec requirements
 */
export function validateErrorMessage(error: unknown): error is ErrorMessage {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const msg = error as Record<string, unknown>;
  
  if (msg.type !== 'error') {
    return false;
  }
  
  if (typeof msg.surfaceId !== 'string' || msg.surfaceId.length === 0) {
    return false;
  }
  
  if (!msg.error || typeof msg.error !== 'object') {
    return false;
  }
  
  const errorObj = msg.error as Record<string, unknown>;
  
  if (typeof errorObj.message !== 'string' || errorObj.message.length === 0) {
    return false;
  }
  
  // Optional fields validation
  if (errorObj.code !== undefined && typeof errorObj.code !== 'string') {
    return false;
  }
  
  if (errorObj.componentId !== undefined && typeof errorObj.componentId !== 'string') {
    return false;
  }
  
  if (errorObj.context !== undefined && (typeof errorObj.context !== 'object' || errorObj.context === null || Array.isArray(errorObj.context))) {
    return false;
  }
  
  return true;
}

/**
 * Validates component definition structure
 * Per A2UI v0.8 spec
 */
export function validateComponentDefinition(comp: unknown): comp is ComponentDefinition {
  if (!comp || typeof comp !== 'object') {
    return false;
  }

  const def = comp as Record<string, unknown>;
  
  // Must have id
  if (typeof def.id !== 'string' || !validateComponentId(def.id)) {
    return false;
  }
  
  // Must have component (nested structure per v0.8)
  if (!def.component || typeof def.component !== 'object') {
    return false;
  }
  
  const componentType = def.component as ComponentTypeDefinition;
  const keys = Object.keys(componentType);
  
  // Must have exactly one component type key
  if (keys.length !== 1) {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes component props to prevent injection attacks
 * Validates and sanitizes prop values
 */
export function sanitizeComponentProps(props: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(props)) {
    // Skip special A2UI keys
    if (key === 'explicitList' || key === 'template' || key === 'child' || key === 'action') {
      sanitized[key] = value;
      continue;
    }
    
    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      // Recursively sanitize array elements
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      // For other types, pass through (numbers, booleans, objects)
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
