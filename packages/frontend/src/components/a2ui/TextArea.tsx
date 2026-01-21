import { useState, useEffect } from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/TextArea.css';

export default function TextArea({ updateDataModel, ...props }: ComponentProps) {
  const label = (props.label as string) || '';
  const placeholder = (props.placeholder as string) || '';
  const value = (props.value as string) || '';
  const valuePath = props._valuePath as string | undefined;
  const rows = (props.rows as number) || 4;
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (valuePath && updateDataModel) {
      updateDataModel(valuePath, newValue);
    }
  };

  return (
    <div className="a2ui-textarea">
      {label && <label className="a2ui-textarea-label">{label}</label>}
      <textarea
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="a2ui-textarea-input"
      />
    </div>
  );
}
