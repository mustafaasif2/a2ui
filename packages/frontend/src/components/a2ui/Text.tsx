import type { ComponentProps } from '@a2ui/shared/react';

export default function Text({ children, ...props }: ComponentProps) {
  const content = (props.text as string) || (props.content as string) || (children as string) || '';
  const style = props.style as React.CSSProperties | undefined;
  const className = (props.className as string) || '';

  return (
    <p style={style} className={className}>
      {content}
    </p>
  );
}
