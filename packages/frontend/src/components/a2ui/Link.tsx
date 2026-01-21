import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Link.css';

export default function Link({ children, ...props }: ComponentProps) {
  const href = (props.href as string) || (props.url as string) || '#';
  const target = (props.target as string) || '_self';
  const style = props.style as React.CSSProperties | undefined;
  const className = `a2ui-link ${(props.className as string) || ''}`;

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      style={style}
      className={className}
    >
      {children || (props.text as string) || href}
    </a>
  );
}
