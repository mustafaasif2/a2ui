import React from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Row.css';

export default function Row({ children, ...props }: ComponentProps) {
  const style: React.CSSProperties = {
    ...(props.style as React.CSSProperties),
    display: 'flex',
    flexDirection: 'row' as const,
    gap: (props.gap as string) || '1rem',
  };
  const className = `a2ui-row ${(props.className as string) || ''}`;

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
