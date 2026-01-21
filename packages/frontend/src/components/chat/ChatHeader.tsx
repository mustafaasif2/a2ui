interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ChatHeader({
  title = 'A2UI React Application',
  subtitle = 'Dynamic Interface Rendering with Mastra',
}: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <h2>{title}</h2>
      {subtitle && <p className="chat-subtitle">{subtitle}</p>}
    </div>
  );
}
