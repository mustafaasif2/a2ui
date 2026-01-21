# A2UI

A React application that generates dynamic UIs using the A2UI protocol, powered by Mastra AI agents.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create packages/backend/.env with:
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Start the application
pnpm dev
```

Open `http://localhost:3000` to start chatting with the AI agent.

## Features

- **Dynamic UI Generation**: Generate UIs on-the-fly using A2UI protocol
- **Real-time Streaming**: Stream agent responses and UI updates
- **Component Registry**: Extensible component system for A2UI components

## Architecture

- **Frontend**: React + Vite (port 3000)
- **Backend**: Express + Mastra (port 3001)
- **Shared**: Common types and utilities

### Protocol Architecture

This project uses a two-layer protocol architecture:

- **AG-UI (Transport Layer)**: Handles communication, event streaming, and agent-to-frontend messaging
  - Uses `@ag-ui/client` on frontend and `@ag-ui/mastra` on backend
  - Provides event-driven communication with streaming support
  
- **A2UI (Component Specification)**: Defines the component structure and rendering protocol
  - Defines component types, props, data binding, and surface management
  - Messages are transported via AG-UI tool call results
  - See `packages/shared/src/transport/agui-transport.ts` for the transport adapter

This separation allows:
- A2UI to focus on UI component specifications
- AG-UI to handle the communication infrastructure
- Easy swapping of transport layers if needed

## Prerequisites

- Node.js 18+
- pnpm 8.15.0+
- Google Generative AI API key ([Get one here](https://makersuite.google.com/app/apikey))

## Development

```bash
# Run both frontend and backend
pnpm dev

# Or run individually
pnpm run dev:frontend
pnpm run dev:backend
```

## Usage

1. Open `http://localhost:3000`
2. Type a message like:
   - "create a form with name and email fields"
   - "show me a list of items"
   - "create a card with a title and description"
3. The generated UI will appear in the renderer

## Project Structure

```
a2ui/
├── packages/
│   ├── frontend/    # React frontend
│   ├── backend/     # Express + Mastra backend
│   └── shared/      # Shared types and utilities
└── package.json
```

## Technologies

- **Frontend**: React, TypeScript, Vite
- **Backend**: Express, Mastra
- **AI**: Google Gemini (via Mastra)
- **Transport**: AG-UI (`@ag-ui/client`, `@ag-ui/mastra`)
- **Component Spec**: A2UI Protocol
