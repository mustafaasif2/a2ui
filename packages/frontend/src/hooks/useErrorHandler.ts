import { useCallback } from 'react';
import { AgentService } from '../services/agent/agentService';
import { DEFAULT_SURFACE_ID } from '../config/constants';
import type { ErrorMessage } from '@a2ui/shared';

/**
 * Custom hook for handling errors from A2UI components
 */
export function useErrorHandler() {
  const handleError = useCallback((error: {
    message: string;
    code?: string;
    componentId?: string;
    context?: Record<string, unknown>;
  }) => {
    const errorMessage: ErrorMessage = {
      type: 'error',
      surfaceId: DEFAULT_SURFACE_ID,
      error: {
        message: error.message,
        code: error.code,
        componentId: error.componentId,
        context: error.context,
      },
    };
    AgentService.sendError(errorMessage);
  }, []);

  return { handleError };
}
