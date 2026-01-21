/**
 * A2UI Protocol Types
 * Based on A2UI Specification v0.8 (stable) and v0.9 (draft)
 * 
 * Architecture:
 * - A2UI: Component specification protocol (defines what to render)
 * - AG-UI: Transport layer (handles communication, events, streaming)
 * 
 * A2UI messages are transported via AG-UI events. See @a2ui/shared/transport
 * for the transport adapter that bridges AG-UI events and A2UI messages.
 */

// Message Types
export type A2UIMessage =
  | SurfaceUpdateMessage
  | DataModelUpdateMessage
  | BeginRenderingMessage
  | DeleteSurfaceMessage
  | UserActionMessage;

export interface SurfaceUpdateMessage {
  type: 'surfaceUpdate';
  surfaceId: string;
  components: ComponentDefinition[];
  root?: string; // Component ID
}

export interface DataModelUpdateMessage {
  type: 'dataModelUpdate';
  surfaceId: string;
  dataModel: Record<string, unknown>;
}

export interface BeginRenderingMessage {
  type: 'beginRendering';
  surfaceId: string;
}

export interface DeleteSurfaceMessage {
  type: 'deleteSurface';
  surfaceId: string;
}

export interface UserActionMessage {
  type: 'userAction';
  surfaceId: string;
  action: ActionDefinition;
  context?: Record<string, unknown>;
}

// Component Definitions
export interface ComponentDefinition {
  id: string;
  type: string;
  props?: Record<string, PropValue>;
  children?: string[]; // Component IDs
  template?: TemplateDefinition;
}

export interface TemplateDefinition {
  children: string[]; // Component IDs for template
  dataPath?: string; // JSON Pointer path to array
}

export type PropValue =
  | string
  | number
  | boolean
  | null
  | DynamicValue
  | PropValue[];

export interface DynamicValue {
  literal?: unknown;
  path?: string; // JSON Pointer path
}

// Actions
export interface ActionDefinition {
  name: string;
  context?: Record<string, unknown>;
}

// Component Catalog
export interface ComponentCatalog {
  components: ComponentTypeDefinition[];
}

export interface ComponentTypeDefinition {
  type: string;
  props?: PropDefinition[];
  children?: 'single' | 'multiple' | 'none';
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'dynamic';
  required?: boolean;
}

// Surface State
export interface SurfaceState {
  surfaceId: string;
  components: Map<string, ComponentDefinition>;
  dataModel: Record<string, unknown>;
  root?: string;
  isReady: boolean;
}

// Transport
export interface Transport {
  connect(): void;
  disconnect(): void;
  send(message: UserActionMessage): void;
  onMessage(callback: (message: A2UIMessage) => void): void;
  onError(callback: (error: Error) => void): void;
}
