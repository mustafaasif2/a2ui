import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Divider.css';

export default function Divider({ ...props }: ComponentProps) {
  const orientation = (props.orientation as string) || 'horizontal';
  const style = props.style as React.CSSProperties | undefined;
  const className = `a2ui-divider a2ui-divider-${orientation} ${(props.className as string) || ''}`;

  return <hr style={style} className={className} />;
}
