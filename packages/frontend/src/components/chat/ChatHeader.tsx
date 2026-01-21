interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ChatHeader({
  title = 'Chat',
  subtitle = 'Ask me to generate dynamic UIs',
}: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <h2>{title}</h2>
      {subtitle && <p className="chat-subtitle">{subtitle}</p>}
    </div>
  );
}
