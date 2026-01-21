import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Badge.css';

export default function Badge({ children, ...props }: ComponentProps) {
  const text = (props.text as string) || (children as string) || '';
  const variant = (props.variant as string) || 'default';
  const style = props.style as React.CSSProperties | undefined;
  const className = `a2ui-badge a2ui-badge-${variant} ${(props.className as string) || ''}`;

  return (
    <span style={style} className={className}>
      {text || children}
    </span>
  );
}
