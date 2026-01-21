import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Text.css';

export default function Text({ children, ...props }: ComponentProps) {
  // If children are provided (React nodes from child components), render them
  // Otherwise, use props.text or props.content
  const hasChildren = children && (Array.isArray(children) ? children.length > 0 : true);
  const textContent = hasChildren ? undefined : ((props.text as string) || (props.content as string) || '');
  const usageHint = (props.usageHint as string) || '';
  const style = props.style as React.CSSProperties | undefined;
  
  // Determine className based on usageHint
  let className = 'a2ui-text';
  if (usageHint) {
    className += ` a2ui-text-${usageHint}`;
  }
  className += ` ${(props.className as string) || ''}`;

  // Use appropriate HTML element based on usageHint
  const Tag = usageHint === 'h1' ? 'h1' : 
              usageHint === 'h2' ? 'h2' : 
              usageHint === 'h3' ? 'h3' : 
              'p';

  return (
    <Tag style={style} className={className}>
      {hasChildren ? children : textContent}
    </Tag>
  );
}
