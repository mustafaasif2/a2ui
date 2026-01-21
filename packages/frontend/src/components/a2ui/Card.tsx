import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Card.css';

export default function Card({ children, ...props }: ComponentProps) {
  const title = props.title as string | undefined;
  const style = props.style as React.CSSProperties | undefined;
  const className = `a2ui-card ${(props.className as string) || ''}`;

  return (
    <div style={style} className={className}>
      {title && <h3 className="a2ui-card-title">{title}</h3>}
      <div className="a2ui-card-content">{children}</div>
    </div>
  );
}
