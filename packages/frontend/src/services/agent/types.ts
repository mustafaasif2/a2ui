import type { A2UIMessage } from '@a2ui/shared';

/**
 * Stream callbacks for agent communication
 * These map directly to A2UI transport callbacks
 */
export interface StreamCallbacks {
  onTextDelta?: (text: string) => void;
  onA2UIMessage?: (message: A2UIMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  onStateSnapshot?: (state: any) => void;
  onStateDelta?: (delta: Record<string, unknown>) => void;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}
