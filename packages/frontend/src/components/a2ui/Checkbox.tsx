import { useState, useEffect } from 'react';
import type { ComponentProps } from '@a2ui/shared/react';
import '../../styles/a2ui/Checkbox.css';

export default function Checkbox({ updateDataModel, ...props }: ComponentProps) {
  const label = (props.label as string) || '';
  const checked = (props.checked as boolean) || (props.value as boolean) || false;
  const valuePath = props._valuePath as string | undefined;
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsChecked(newValue);
    
    if (valuePath && updateDataModel) {
      updateDataModel(valuePath, newValue);
    }
  };

  return (
    <div className="a2ui-checkbox">
      <label className="a2ui-checkbox-label">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="a2ui-checkbox-input"
        />
        {label && <span className="a2ui-checkbox-text">{label}</span>}
      </label>
    </div>
  );
}
