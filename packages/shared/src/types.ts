/**
 * A2UI Protocol Types
 * Based on A2UI Specification v0.8 (stable) - https://a2ui.org/specification/v0.8-a2ui/
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
  | UserActionMessage
  | ErrorMessage;

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
  root?: string; // Component ID - required per spec
}

export interface DeleteSurfaceMessage {
  type: 'deleteSurface';
  surfaceId: string;
}

/**
 * UserAction message per A2UI v0.8 spec
 * Sent from client to server when user interacts with components
 */
export interface UserActionMessage {
  type: 'userAction';
  name: string; // Action name (moved from action.name per spec)
  surfaceId: string;
  sourceComponentId: string; // Component ID that triggered the action (required per spec)
  timestamp: string; // ISO 8601 timestamp (required per spec)
  context?: Record<string, unknown>; // Resolved context with bound data
}

/**
 * Error message per A2UI v0.8 spec
 * Sent from client to server when errors occur during rendering or binding
 */
export interface ErrorMessage {
  type: 'error';
  surfaceId: string;
  error: {
    message: string;
    code?: string;
    componentId?: string;
    context?: Record<string, unknown>;
  };
}

// Component Definitions
// Per A2UI v0.8 spec: components use nested structure where component type is a key
export interface ComponentDefinition {
  id: string;
  component: ComponentTypeDefinition; // Nested structure per spec
  template?: TemplateDefinition; // For dynamic lists
}

// Component type definition - the component type (Text, Button, etc.) is the key
// and the value contains the properties for that component type
export type ComponentTypeDefinition =
  | { Text: TextComponentProps }
  | { Button: ButtonComponentProps }
  | { Card: CardComponentProps }
  | { Row: ContainerComponentProps }
  | { Column: ContainerComponentProps }
  | { List: ListComponentProps }
  | { TextField: TextFieldComponentProps }
  | { [key: string]: ComponentPropsRecord }; // Allow extensibility

// Component props record for extensibility
export type ComponentPropsRecord = Record<string, PropValue | ActionDefinition | TemplateDefinition | string[] | undefined>;

// Component-specific prop types
export interface TextComponentProps {
  text?: LiteralValue | PathValue | CombinedValue;
  usageHint?: string; // e.g., "h1", "h2", "body"
  [key: string]: PropValue | undefined;
}

export interface ButtonComponentProps {
  child?: string; // Component ID for button content
  action?: ActionDefinition; // Special property, not PropValue
  explicitList?: string[]; // For multiple children
  [key: string]: PropValue | ActionDefinition | string[] | undefined;
}

export interface CardComponentProps {
  explicitList?: string[]; // Component IDs for children
  [key: string]: PropValue | string[] | undefined;
}

export interface ContainerComponentProps {
  explicitList?: string[]; // Component IDs for static children (per spec)
  [key: string]: PropValue | string[] | undefined;
}

export interface ListComponentProps {
  explicitList?: string[]; // For static lists
  template?: TemplateDefinition; // For dynamic lists - special property
  [key: string]: PropValue | TemplateDefinition | string[] | undefined;
}

export interface TextFieldComponentProps {
  value?: LiteralValue | PathValue | CombinedValue;
  label?: LiteralValue | PathValue | CombinedValue;
  placeholder?: LiteralValue | PathValue | CombinedValue;
  [key: string]: PropValue | undefined;
}

export interface TemplateDefinition {
  children: string[]; // Component IDs for template
  dataPath?: string; // JSON Pointer path to array
}

// Prop Value Types per A2UI v0.8 spec
export type PropValue =
  | string
  | number
  | boolean
  | null
  | LiteralValue
  | PathValue
  | CombinedValue
  | PropValue[];

// Literal values per spec (literalString, literalBoolean, literalNumber)
export interface LiteralValue {
  literalString?: string;
  literalBoolean?: boolean;
  literalNumber?: number;
}

// Path-based dynamic value
export interface PathValue {
  path: string; // JSON Pointer path
}

// Combined: literal + path (literal as default, path for binding)
export interface CombinedValue {
  literalString?: string;
  literalBoolean?: boolean;
  literalNumber?: number;
  path: string; // JSON Pointer path
}

// Legacy DynamicValue for backward compatibility during migration
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
  components: ComponentCatalogTypeDefinition[];
}

export interface ComponentCatalogTypeDefinition {
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
