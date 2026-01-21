# A2UI React Application

A React + TypeScript application for dynamic UI rendering using the A2UI protocol, powered by Mastra AI agents.

## Features

- **Dynamic UI Generation**: Generate UIs on-the-fly using A2UI protocol
- **Human-in-the-Loop**: Tool calls require user approval before execution
- **Real-time Streaming**: Stream agent responses and UI updates
- **Component Registry**: Extensible component system for A2UI components

## Architecture

- **Frontend**: React + Vite (port 3000)
- **Backend**: Express + Mastra (port 3001)
- **Shared**: Common types and utilities

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8.15.0+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

Run both frontend and backend with a single command:

```bash
pnpm dev
```

This will start:
- Backend Express server on `http://localhost:3001`
- Frontend Vite dev server on `http://localhost:3000`

### Individual Commands

```bash
# Frontend only
pnpm run dev:frontend

# Backend only
pnpm run dev:backend
```

## API Endpoints

### Express Server (Port 3001)

- `POST /api/agents/:agentId/stream` - Stream agent responses with tool approval
- `GET /api/tool-approvals` - Get all pending tool approvals
- `GET /api/tool-approvals/:toolCallId` - Get specific approval
- `POST /api/tool-approvals/:toolCallId/approve` - Approve a tool call
- `POST /api/tool-approvals/:toolCallId/reject` - Reject a tool call

## Usage

1. Start the application: `pnpm dev`
2. Open `http://localhost:3000` in your browser
3. Type a message like "create a form" or "show me a list"
4. When the agent wants to call the `generate-a2ui` tool, you'll see an approval modal
5. Approve or reject the tool call
6. The generated UI will appear in the renderer

## Project Structure

```
a2ui/
├── packages/
│   ├── frontend/          # React frontend
│   ├── backend/           # Express + Mastra backend
│   └── shared/            # Shared types and utilities
├── package.json
└── README.md
```

## Technologies

- **Frontend**: React, TypeScript, Vite
- **Backend**: Express, Mastra, TypeScript
- **AI**: Google Gemini (via Mastra)
- **Protocol**: A2UI
# a2ui
