import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Column.css';

export default function Column({ children, ...props }: ComponentProps) {
  const style: React.CSSProperties = {
    ...(props.style as React.CSSProperties),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: (props.gap as string) || '1rem',
  };
  const className = `a2ui-column ${(props.className as string) || ''}`;

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
