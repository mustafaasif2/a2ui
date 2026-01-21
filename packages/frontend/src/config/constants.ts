export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  AGENT_ID: 'a2uiAgent',
} as const;

export const DEFAULT_SURFACE_ID = 'main';
