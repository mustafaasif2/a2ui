import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Button.css';

export default function Button({ children, onAction, ...props }: ComponentProps) {
  const label = (props.text as string) || (props.label as string) || (children as string) || 'Button';
  const action = props.action as { name: string; context?: Record<string, unknown> } | undefined;
  const style = props.style as React.CSSProperties | undefined;
  const className = (props.className as string) || 'a2ui-button';

  const handleClick = () => {
    if (action && onAction) {
      onAction(action);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={style}
      className={className}
      type="button"
    >
      {label}
    </button>
  );
}
