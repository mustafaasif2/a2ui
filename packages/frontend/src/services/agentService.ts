import { HttpAgent, randomUUID } from '@ag-ui/client';
import { API_CONFIG } from '../config/constants';
import { createEventHandler, type StreamCallbacks } from './eventHandlers';

const agUiAgent = new HttpAgent({
  url: `${API_CONFIG.BASE_URL}/api/agents/${API_CONFIG.AGENT_ID}/run`,
});

export class AgentService {
  static async streamAgentResponse(userMessage: string, callbacks: StreamCallbacks): Promise<void> {
    agUiAgent.addMessage({
      id: randomUUID(),
      role: 'user',
      content: userMessage,
    });

    const eventHandler = createEventHandler(callbacks);
    await agUiAgent.runAgent({}, eventHandler);
  }
}
