
import React from 'react';

interface InputGroupProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: 'number' | 'text';
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  disabled?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  label, value, onChange, type = 'number', unit, placeholder, min, max, step, hint, disabled 
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {unit && (
          <div className="absolute right-3 text-blue-200 font-bold text-sm font-mono pointer-events-none">
            {unit}
          </div>
        )}
      </div>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
};