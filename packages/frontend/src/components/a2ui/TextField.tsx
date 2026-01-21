import { useState, useEffect } from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/TextField.css';

export default function TextField({ onAction, updateDataModel, ...props }: ComponentProps) {
  const label = (props.label as string) || '';
  const placeholder = (props.placeholder as string) || '';
  const value = (props.value as string) || '';
  const valuePath = props._valuePath as string | undefined;
  const [inputValue, setInputValue] = useState(value);

  // Sync with data model value changes (two-way binding)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Update data model for two-way binding (per A2UI v0.8 spec)
    if (valuePath && updateDataModel) {
      updateDataModel(valuePath, newValue);
    }
    
    // Send userAction message per A2UI v0.8 spec
    // ComponentRenderer will wrap this with sourceComponentId, surfaceId, and timestamp
    if (onAction) {
      onAction({
        name: 'inputChange',
        context: {
          value: newValue,
          valuePath: valuePath,
          field: props.name || props.componentId,
        },
      });
    }
  };

  return (
    <div className="a2ui-textfield">
      {label && <label className="a2ui-textfield-label">{label}</label>}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="a2ui-textfield-input"
      />
    </div>
  );
}
