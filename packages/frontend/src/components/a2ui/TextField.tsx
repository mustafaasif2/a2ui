import { useState, useEffect } from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/TextField.css';

export default function TextField({ updateDataModel, ...props }: ComponentProps) {
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
    
    // Update data model locally for immediate UI feedback (optimistic update)
    // This provides instant two-way binding per A2UI v0.8 spec
    // Form data will be sent to server when submit button is clicked
    if (valuePath && updateDataModel) {
      updateDataModel(valuePath, newValue);
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
