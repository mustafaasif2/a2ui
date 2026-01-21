import React from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/List.css';

export default function List({ children, ...props }: ComponentProps) {
  const style = props.style as React.CSSProperties | undefined;
  const className = `a2ui-list ${(props.className as string) || ''}`;

  // Wrap children in <li> tags if they aren't already
  const listItems = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === 'li') {
      return child;
    }
    return <li key={index}>{child}</li>;
  });

  return (
    <ul style={style} className={className}>
      {listItems}
    </ul>
  );
}
