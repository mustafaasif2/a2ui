import { useState } from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/TextField.css';

export default function TextField({ onAction, ...props }: ComponentProps) {
  const label = (props.label as string) || '';
  const placeholder = (props.placeholder as string) || '';
  const value = (props.value as string) || '';
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onAction) {
      onAction({
        name: 'inputChange',
        context: { value: e.target.value, field: props.name },
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
