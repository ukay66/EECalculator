import React from 'react';
import { resistorColors, getValidColors, getToleranceColor } from '../utils/calculations';

interface ColorBandSelectorProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    type: 'digit' | 'multiplier' | 'tolerance';
}

export const ColorBandSelector: React.FC<ColorBandSelectorProps> = ({ label, value, onChange, type }) => {
    const validValues = getValidColors(type);

    return (
        <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-slate-400 w-24 flex-shrink-0">{label}</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
                {validValues.map((val) => {
                    const colorId = type === 'tolerance' ? getToleranceColor(val) : val;
                    const colorData = resistorColors[colorId];
                    if (!colorData) return null;
                    
                    const isSelected = value === val;
                    
                    // Display text based on type
                    let displayText = '';
                    if (type === 'digit') displayText = val.toString();
                    else if (type === 'multiplier') displayText = `10^${val}`;
                    else if (type === 'tolerance') displayText = `±${val}%`;
                    
                    // Special cases for Gold/Silver multiplier display
                    if(type === 'multiplier' && val === -1) displayText = '×0.1';
                    if(type === 'multiplier' && val === -2) displayText = '×0.01';

                    return (
                        <button
                            key={val}
                            onClick={() => onChange(val)}
                            className={`
                                group relative w-8 h-8 rounded shadow-sm border transition-all duration-200
                                ${isSelected ? 'border-white scale-110 ring-2 ring-blue-500 z-10' : 'border-transparent hover:border-slate-400 hover:scale-105'}
                            `}
                            style={{ backgroundColor: colorData.hex }}
                            title={`${colorData.name} (${displayText})`}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
             <div className="text-xs text-slate-300 font-mono w-32 text-right hidden sm:block">
                 {(() => {
                     const colorId = type === 'tolerance' ? getToleranceColor(value) : value;
                     const c = resistorColors[colorId];
                     if(!c) return '';
                     let txt = '';
                     if (type === 'digit') txt = value.toString();
                     else if (type === 'multiplier') txt = value === -1 ? '×0.1' : (value === -2 ? '×0.01' : `×10^${value}`);
                     else if (type === 'tolerance') txt = `±${value}%`;
                     return `${c.name} ${txt}`;
                 })()}
             </div>
        </div>
    );
};