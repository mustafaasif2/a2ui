interface ChatEmptyProps {
  message?: string;
  options?: string[];
  onSelectOption?: (option: string) => void;
}

const DEFAULT_OPTIONS = [
  'Create a form with name and email fields',
  'Create a card with a title and description',
  'Build a login form',
  'Generate a product card layout',
];

export default function ChatEmpty({
  message = 'Start a conversation to generate dynamic UIs using A2UI protocol.',
  options = DEFAULT_OPTIONS,
  onSelectOption,
}: ChatEmptyProps) {
  return (
    <div className="chat-empty">
      <div style={{ marginBottom: '0.5rem' }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#d1d5db', marginBottom: '1rem' }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p>{message}</p>
      {options.length > 0 && onSelectOption && (
        <div className="chat-options">
          {options.map((option, i) => (
            <button
              key={i}
              className="chat-option-button"
              onClick={() => onSelectOption(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
