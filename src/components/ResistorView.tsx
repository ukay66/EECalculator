import React, { useState } from 'react';
import { resistorColors, calculate4BandResistor, calculate5BandResistor, getResistorColorsFromValue } from '../utils/calculations';
import { InputGroup } from './InputGroup';
import { SelectGroup } from './SelectGroup';
import { ColorBandSelector } from './ColorBandSelector';

export const ResistorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'4band'|'5band'|'val2color'>('4band');

  // State
  const [b4, setB4] = useState({ b1: 1, b2: 0, mult: 2, tol: 5 });
  const [b5, setB5] = useState({ b1: 1, b2: 0, b3: 0, mult: 2, tol: 1 });
  const [valIn, setValIn] = useState({ val: '', unit: 1000, tol: 5, bands: 4 });

  return (
    <div>
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2 overflow-x-auto">
            <button onClick={() => setActiveTab('4band')} className={`px-4 py-2 rounded ${activeTab==='4band'?'bg-slate-700 text-white':'text-slate-400'}`}>4-Band</button>
            <button onClick={() => setActiveTab('5band')} className={`px-4 py-2 rounded ${activeTab==='5band'?'bg-slate-700 text-white':'text-slate-400'}`}>5-Band</button>
            <button onClick={() => setActiveTab('val2color')} className={`px-4 py-2 rounded ${activeTab==='val2color'?'bg-slate-700 text-white':'text-slate-400'}`}>Value to Color</button>
        </div>

        {activeTab === '4band' && (
            <div className="space-y-6 animate-fade-in">
                <ResistorVisual bands={[b4.b1, b4.b2, b4.mult, b4.tol]} type={4} />
                <div className="text-center text-4xl font-mono font-bold text-white py-4 bg-slate-900 rounded-lg border border-slate-800">
                    {calculate4BandResistor(b4.b1, b4.b2, b4.mult, b4.tol).value} <span className="text-lg text-slate-400">{calculate4BandResistor(b4.b1, b4.b2, b4.mult, b4.tol).tolerance}</span>
                </div>
                <div className="space-y-3">
                    <ColorBandSelector label="Band 1" value={b4.b1} onChange={v => setB4({...b4, b1: v})} type="digit" />
                    <ColorBandSelector label="Band 2" value={b4.b2} onChange={v => setB4({...b4, b2: v})} type="digit" />
                    <ColorBandSelector label="Multiplier" value={b4.mult} onChange={v => setB4({...b4, mult: v})} type="multiplier" />
                    <ColorBandSelector label="Tolerance" value={b4.tol} onChange={v => setB4({...b4, tol: v})} type="tolerance" />
                </div>
            </div>
        )}

        {activeTab === '5band' && (
            <div className="space-y-6 animate-fade-in">
                <ResistorVisual bands={[b5.b1, b5.b2, b5.b3, b5.mult, b5.tol]} type={5} />
                <div className="text-center text-4xl font-mono font-bold text-white py-4 bg-slate-900 rounded-lg border border-slate-800">
                    {calculate5BandResistor(b5.b1, b5.b2, b5.b3, b5.mult, b5.tol).value} <span className="text-lg text-slate-400">{calculate5BandResistor(b5.b1, b5.b2, b5.b3, b5.mult, b5.tol).tolerance}</span>
                </div>
                <div className="space-y-3">
                    <ColorBandSelector label="Band 1" value={b5.b1} onChange={v => setB5({...b5, b1: v})} type="digit" />
                    <ColorBandSelector label="Band 2" value={b5.b2} onChange={v => setB5({...b5, b2: v})} type="digit" />
                    <ColorBandSelector label="Band 3" value={b5.b3} onChange={v => setB5({...b5, b3: v})} type="digit" />
                    <ColorBandSelector label="Multiplier" value={b5.mult} onChange={v => setB5({...b5, mult: v})} type="multiplier" />
                    <ColorBandSelector label="Tolerance" value={b5.tol} onChange={v => setB5({...b5, tol: v})} type="tolerance" />
                </div>
            </div>
        )}

        {activeTab === 'val2color' && (
             <div className="space-y-6 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex gap-2">
                        <InputGroup label="Resistance" value={valIn.val} onChange={v => setValIn({...valIn, val: v})} />
                        <SelectGroup label="Unit" value={valIn.unit} onChange={v => setValIn({...valIn, unit: parseFloat(v)})} options={[{label:'Ω',value:1},{label:'kΩ',value:1000},{label:'MΩ',value:1e6}]} />
                     </div>
                     <div className="flex gap-2">
                         <SelectGroup label="Tolerance" value={valIn.tol} onChange={v => setValIn({...valIn, tol: parseFloat(v)})} 
                             options={[
                                 {label:'±5%',value:5}, {label:'±10%',value:10}, {label:'±1%',value:1}, 
                                 {label:'±2%',value:2}, {label:'±0.5%',value:0.5}
                             ]} />
                         <SelectGroup label="Type" value={valIn.bands} onChange={v => setValIn({...valIn, bands: parseFloat(v) as any})} 
                             options={[{label:'4-Band',value:4},{label:'5-Band',value:5}]} />
                     </div>
                 </div>

                 {valIn.val && (
                     <div className="mt-8">
                         {(() => {
                             const ohms = parseFloat(valIn.val) * valIn.unit;
                             const cols = getResistorColorsFromValue(ohms, valIn.bands as 4|5, valIn.tol);
                             
                             if (!cols) return <div className="text-center text-slate-500">Enter a valid resistance</div>;
                             
                             const bandArray = valIn.bands === 4 
                                ? [cols.b1, cols.b2, cols.mult, cols.tol]
                                : [cols.b1, cols.b2, cols.b3, cols.mult, cols.tol];

                             return (
                                 <div className="space-y-6">
                                     <ResistorVisual bands={bandArray} type={valIn.bands} />
                                     <div className="flex justify-center flex-wrap gap-4">
                                         {bandArray.map((b, i) => {
                                             // Determine type for correct color lookup
                                             let type = 'digit';
                                             if (i === bandArray.length - 1) type = 'tolerance';
                                             else if (i === bandArray.length - 2) type = 'multiplier';
                                             
                                             const colorId = type === 'tolerance' ? (b === 5 ? -1 : b === 10 ? -2 : b) : b;
                                             const c = resistorColors[colorId];
                                             return (
                                                 <div key={i} className="flex flex-col items-center">
                                                     <div className="w-12 h-16 rounded mb-2 border border-slate-600 shadow-md" style={{background: c?.hex}}></div>
                                                     <div className="text-xs text-slate-400">{c?.name}</div>
                                                 </div>
                                             )
                                         })}
                                     </div>
                                 </div>
                             )
                         })()}
                     </div>
                 )}
             </div>
        )}
    </div>
  );
};

const ResistorVisual = ({ bands, type }: { bands: number[], type: number }) => {
    // Helper to get color style
    const getStyle = (val: number, isMult=false, isTol=false) => {
        // Special mapping for tolerance values to color IDs
        let colorId = val;
        if (isTol) {
            if(val===1) colorId=1;
            else if(val===2) colorId=2;
            else if(val===0.5) colorId=5;
            else if(val===0.25) colorId=6;
            else if(val===0.1) colorId=7;
            else if(val===0.05) colorId=8;
            else if(val===5) colorId=-1; // Gold
            else if(val===10) colorId=-2; // Silver
        }
        
        return resistorColors[colorId]?.hex || '#888';
    };

    return (
        <div className="flex justify-center py-6">
            <div className="relative w-72 h-20 bg-[#f3e5ab] rounded-full border-4 border-slate-600 flex items-center justify-center overflow-hidden shadow-inner isolate">
                 {/* Wires */}
                 <div className="absolute -left-10 top-1/2 w-10 h-2 bg-slate-400 -z-10 -translate-y-1/2"></div>
                 <div className="absolute -right-10 top-1/2 w-10 h-2 bg-slate-400 -z-10 -translate-y-1/2"></div>

                 {/* Bands - Straight Vertical Lines */}
                 <div className="w-4 h-full mx-2 shadow-sm" style={{backgroundColor: getStyle(bands[0])}}></div>
                 <div className="w-4 h-full mx-2 shadow-sm" style={{backgroundColor: getStyle(bands[1])}}></div>
                 {type === 5 && <div className="w-4 h-full mx-2 shadow-sm" style={{backgroundColor: getStyle(bands[2])}}></div>}
                 <div className="w-4 h-full mx-2 shadow-sm" style={{backgroundColor: getStyle(bands[type===5?3:2], true)}}></div>
                 
                 <div className="flex-1"></div> {/* Spacer for tolerance band gap */}
                 
                 <div className="w-4 h-full mx-4 shadow-sm" style={{backgroundColor: getStyle(bands[type===5?4:3], false, true)}}></div>
            </div>
        </div>
    )
}