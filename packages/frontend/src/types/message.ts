export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
}
