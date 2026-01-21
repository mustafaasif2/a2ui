# A2UI

A React application that generates dynamic UIs using the A2UI protocol, powered by Mastra AI agents. A2UI enables AI agents to create and update user interfaces in real-time through natural language prompts.

## Overview

A2UI is a protocol-based system that allows AI agents to generate, update, and manage user interfaces dynamically. The project implements a two-layer architecture:

- **A2UI Protocol**: Defines the component specification and rendering protocol (what to render)
- **AG-UI Transport**: Handles communication, event streaming, and agent-to-frontend messaging (how messages are sent)

This separation allows A2UI to focus on UI component specifications while AG-UI handles the communication infrastructure, making it easy to swap transport layers if needed.

## Features

- **Dynamic UI Generation**: Generate UIs on-the-fly using natural language prompts
- **Real-time Streaming**: Stream agent responses and UI updates via Server-Sent Events (SSE)
- **Component Registry**: Extensible component system for A2UI components
- **Surface Management**: Multiple independent UI surfaces with state management
- **Type-Safe**: Full TypeScript support with shared types across packages
- **Protocol-Based**: Clean separation between component spec (A2UI) and transport (AG-UI)

## Architecture

### Monorepo Structure

The project is organized as a pnpm workspace with three main packages:

```
a2ui/
├── packages/
│   ├── frontend/    # React frontend application
│   ├── backend/     # Express + Mastra backend server
│   └── shared/      # Shared types, utilities, and React components
└── package.json     # Root workspace configuration
```

### Package Details

#### Frontend (`@a2ui/frontend`)
- **Tech Stack**: React 19, TypeScript, Vite
- **Port**: 3000
- **Key Features**:
  - Chat interface for user interaction
  - A2UI renderer component
  - Component registry for A2UI components
  - Message context management
  - Agent service integration

#### Backend (`@a2ui/backend`)
- **Tech Stack**: Express, Mastra, TypeScript
- **Port**: 3001
- **Key Features**:
  - Mastra agent with A2UI generation tool
  - SSE streaming endpoint
  - AG-UI transport integration
  - LLM-powered UI generation (Google Gemini 2.5 Flash)

#### Shared (`@a2ui/shared`)
- **Exports**:
  - `.` - Core types and utilities
  - `./react` - React components and hooks
  - `./a2ui` - A2UI protocol generator
  - `./transport` - AG-UI transport adapter

### Protocol Architecture

#### AG-UI (Transport Layer)
- Handles communication, event streaming, and agent-to-frontend messaging
- Uses `@ag-ui/client` on frontend and `@ag-ui/mastra` on backend
- Provides event-driven communication with streaming support
- Transports A2UI messages as tool call results

#### A2UI (Component Specification)
- Defines component structure and rendering protocol
- Specifies component types, props, data binding, and surface management
- Messages are transported via AG-UI tool call results
- See `packages/shared/src/transport/agui-transport.ts` for the transport adapter

### Component System

A2UI supports the following component types:

- **Text**: Display text content
- **Button**: Interactive button with actions
- **Card**: Container component with styling
- **Row**: Horizontal layout container
- **Column**: Vertical layout container
- **List**: List container with template support
- **TextField**: Input field for forms

Components are registered in `ComponentRegistry` and can be extended with custom components.

### Message Flow

1. User sends a message via chat interface
2. Frontend sends request to backend `/api/agents/a2uiAgent/run`
3. Backend agent processes request using Mastra
4. Agent calls `generate-a2ui` tool
5. Tool generates A2UI `surfaceUpdate` message using LLM
6. Message is wrapped for AG-UI transport
7. Backend streams events via SSE
8. Frontend extracts A2UI messages from AG-UI events
9. A2UI renderer updates the UI surface

## Prerequisites

- **Node.js**: 18+ 
- **pnpm**: 8.15.0+ (package manager)
- **Google Generative AI API Key**: [Get one here](https://makersuite.google.com/app/apikey)

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Setup

Create `packages/backend/.env` with your API key:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
PORT=3001  # Optional, defaults to 3001
```

### Running the Application

```bash
# Start both frontend and backend concurrently
pnpm dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

### Individual Services

```bash
# Run frontend only
pnpm run dev:frontend

# Run backend only
pnpm run dev:backend
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Type a message in the chat interface, for example:
   - "create a form with name and email fields"
   - "show me a list of items"
   - "create a card with a title and description"
   - "make a button that says 'Click me'"
3. The AI agent will generate the UI and it will appear in the renderer area
4. You can continue chatting to update or modify the UI

## Development

### Project Structure

```
a2ui/
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── a2ui/          # A2UI component implementations
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Column.tsx
│   │   │   │   │   ├── List.tsx
│   │   │   │   │   ├── Row.tsx
│   │   │   │   │   ├── Text.tsx
│   │   │   │   │   └── TextField.tsx
│   │   │   │   ├── chat/          # Chat UI components
│   │   │   │   │   ├── ChatEmpty.tsx
│   │   │   │   │   ├── ChatHeader.tsx
│   │   │   │   │   ├── ChatInput.tsx
│   │   │   │   │   └── MessageList.tsx
│   │   │   │   └── ChatInterface.tsx
│   │   │   ├── contexts/          # React contexts
│   │   │   │   └── MessageContext.tsx
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   └── useAgent.ts
│   │   │   ├── lib/
│   │   │   │   └── registry/      # Component registry
│   │   │   │       └── ComponentRegistry.tsx
│   │   │   ├── services/          # Business logic
│   │   │   │   ├── actionHandler.ts
│   │   │   │   ├── agentService.ts
│   │   │   │   └── eventHandlers.ts
│   │   │   └── App.tsx
│   │   └── package.json
│   ├── backend/
│   │   ├── src/
│   │   │   ├── mastra/
│   │   │   │   ├── agents/
│   │   │   │   │   └── a2ui-agent.ts    # Mastra agent definition
│   │   │   │   └── tools/
│   │   │   │       └── generate-a2ui-tool.ts  # A2UI generation tool
│   │   │   ├── mastra/
│   │   │   │   └── index.ts
│   │   │   └── index.ts            # Express server
│   │   └── package.json
│   └── shared/
│       ├── src/
│       │   ├── a2ui/
│       │   │   └── generator.ts    # LLM-based A2UI message generator
│       │   ├── react/
│       │   │   ├── components/
│       │   │   │   ├── A2UIRenderer.tsx      # Main renderer component
│       │   │   │   ├── ComponentRenderer.tsx # Recursive component renderer
│       │   │   │   └── SurfaceLoading.tsx    # Loading state
│       │   │   └── hooks/
│       │   │       └── useSurfaceState.ts    # Surface state management
│       │   ├── transport/
│       │   │   └── agui-transport.ts         # AG-UI transport adapter
│       │   └── types.ts                     # A2UI protocol types
│       └── package.json
└── package.json
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter frontend build
pnpm --filter backend build
pnpm --filter shared build
```

### Type Checking

```bash
# Type check all packages
pnpm type-check

# Type check specific package
pnpm --filter frontend type-check
pnpm --filter backend type-check
pnpm --filter shared type-check
```

### Transport Layer

The transport adapter in `packages/shared/src/transport/agui-transport.ts` can be modified to:
- Support different transport protocols
- Add custom event handling
- Implement message queuing or batching

## Technologies

- **Frontend**: 
  - React 19
  - TypeScript
  - Vite
  - CSS Modules

- **Backend**: 
  - Express
  - Mastra (AI agent framework)
  - TypeScript
  - Server-Sent Events (SSE)

- **AI**: 
  - Google Gemini 2.5 Flash (via `@ai-sdk/google`)

- **Transport**: 
  - AG-UI (`@ag-ui/client`, `@ag-ui/mastra`, `@ag-ui/core`)

- **Protocol**: 
  - A2UI Protocol (custom specification)