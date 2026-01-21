import { useState, useEffect } from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Select.css';

export default function Select({ updateDataModel, ...props }: ComponentProps) {
  const label = (props.label as string) || '';
  const value = (props.value as string) || '';
  const valuePath = props._valuePath as string | undefined;
  const options = (props.options as Array<{ label: string; value: string } | string>) || [];
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    
    if (valuePath && updateDataModel) {
      updateDataModel(valuePath, newValue);
    }
  };

  return (
    <div className="a2ui-select">
      {label && <label className="a2ui-select-label">{label}</label>}
      <select
        value={selectedValue}
        onChange={handleChange}
        className="a2ui-select-input"
      >
        {options.map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
