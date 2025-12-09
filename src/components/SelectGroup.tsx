
import React from 'react';

interface SelectGroupProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  options: { label: string; value: string | number }[];
  hint?: string;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ label, value, onChange, options, hint }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
};
