import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Image.css';

export default function Image({ ...props }: ComponentProps) {
  const src = (props.src as string) || (props.url as string) || '';
  const alt = (props.alt as string) || '';
  const width = props.width as string | number | undefined;
  const height = props.height as string | number | undefined;
  const style = props.style as React.CSSProperties | undefined;
  const className = `a2ui-image ${(props.className as string) || ''}`;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={style}
      className={className}
    />
  );
}
