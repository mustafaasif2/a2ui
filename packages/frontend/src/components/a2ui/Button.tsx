import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Button.css';

export default function Button({ children, onAction, ...props }: ComponentProps) {
  // If children are provided (React nodes from child components), render them
  // Otherwise, fall back to props.text or props.label
  // Note: ComponentRenderer passes children when Button has 'child' or 'explicitList' props
  const hasChildren = children !== undefined && children !== null && 
    (Array.isArray(children) ? children.length > 0 : true);
  
  // Only use text/label if no children are provided
  // This prevents rendering both children and text prop (which would cause duplication)
  const label = hasChildren ? null : ((props.text as string) || (props.label as string) || 'Button');
  
  const style = props.style as React.CSSProperties | undefined;
  const className = (props.className as string) || 'a2ui-button';
  const isLoading = (props.isLoading as boolean) || false;
  const isDisabled = isLoading;

  const handleClick = () => {
    if (onAction && !isDisabled) {
      // onAction is already wrapped by ComponentRenderer with proper A2UI format
      // It's a function that takes no arguments and internally calls the action handler
      console.log('Button clicked, triggering action:', props.componentId);
      (onAction as () => void)();
    } else if (isDisabled) {
      console.log('Button is disabled (action in progress):', props.componentId);
    } else {
      console.warn('Button clicked but no onAction handler provided:', props.componentId);
    }
  };

  // Show loading text if button is loading (only for buttons without children)
  const displayText = isLoading && !hasChildren ? 'Processing...' : (hasChildren ? children : label);

  return (
    <button
      onClick={handleClick}
      style={style}
      className={className}
      type="button"
      disabled={isDisabled}
    >
      {displayText}
    </button>
  );
}
