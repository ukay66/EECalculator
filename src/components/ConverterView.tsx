
import React, { useState } from 'react';
import { InputGroup } from './InputGroup';
import { SelectGroup } from './SelectGroup';
import { unitMultipliers, lengthMap, weightMap, volumeMap, areaMap, convertTemp } from '../utils/calculations';

export const ConverterView: React.FC = () => {
    const [tab, setTab] = useState<'prefix'|'number'|'imperial'>('prefix');
    
    // Prefix / Units
    const [pVal, setPVal] = useState('1');
    const [pFrom, setPFrom] = useState('prefix_1e3'); 
    const [pTo, setPTo] = useState('prefix_1e-3');
    
    // Number Systems (All 4 inputs)
    const [nDec, setNDec] = useState('0');
    const [nBin, setNBin] = useState('0');
    const [nOct, setNOct] = useState('0');
    const [nHex, setNHex] = useState('0');

    // Imperial (5 Rows)
    const [impLen, setImpLen] = useState({ v1: '1', u1: 'm', v2: '', u2: 'ft' });
    const [impWgt, setImpWgt] = useState({ v1: '1', u1: 'kg', v2: '', u2: 'lb' });
    const [impVol, setImpVol] = useState({ v1: '1', u1: 'L', v2: '', u2: 'gal' });
    const [impArea, setImpArea] = useState({ v1: '1', u1: 'm2', v2: '', u2: 'ft2' });
    const [impTemp, setImpTemp] = useState({ v1: '0', u1: 'C', v2: '', u2: 'F' });

    // Prefix Logic
    const convertPrefix = () => {
        const val = parseFloat(pVal);
        const mFrom = unitMultipliers[pFrom];
        const mTo = unitMultipliers[pTo];
        if(!mFrom || !mTo) return "Incompatible Units";
        
        // Base value conversion
        const base = val * mFrom;
        const res = base / mTo;
        
        // Format
        if(Math.abs(res) < 1e-3 || Math.abs(res) > 1e4) return res.toExponential(4);
        return res.toPrecision(6).replace(/\.?0+$/,"");
    }

    // Number Logic
    const updateNumber = (val: string, base: number) => {
        // Clean input based on base
        let clean = val;
        if(base === 2) clean = val.replace(/[^01]/g, '');
        if(base === 8) clean = val.replace(/[^0-7]/g, '');
        if(base === 10) clean = val.replace(/[^0-9]/g, '');
        if(base === 16) clean = val.replace(/[^0-9a-fA-F]/g, '');

        if(!clean) {
            setNDec(''); setNBin(''); setNOct(''); setNHex('');
            return;
        }

        const dec = parseInt(clean, base);
        if(isNaN(dec)) return;

        setNDec(dec.toString(10));
        setNBin(dec.toString(2));
        setNOct(dec.toString(8));
        setNHex(dec.toString(16).toUpperCase());
    }

    // Imperial Logic
    const calcImp = (val: string, u1: string, u2: string, map: Record<string, number>, isTemp=false) => {
        if(val === '') return '';
        const v = parseFloat(val);
        if(isNaN(v)) return '';
        
        if(isTemp) {
            return convertTemp(v, u1, u2).toFixed(2);
        } else {
            const base = v * map[u1];
            return (base / map[u2]).toFixed(4).replace(/\.?0+$/,"");
        }
    }

    // Initialize initial values logic
    React.useEffect(() => {
        setImpLen(prev => ({ ...prev, v2: calcImp(prev.v1, prev.u1, prev.u2, lengthMap) }));
        setImpWgt(prev => ({ ...prev, v2: calcImp(prev.v1, prev.u1, prev.u2, weightMap) }));
        setImpVol(prev => ({ ...prev, v2: calcImp(prev.v1, prev.u1, prev.u2, volumeMap) }));
        setImpArea(prev => ({ ...prev, v2: calcImp(prev.v1, prev.u1, prev.u2, areaMap) }));
        setImpTemp(prev => ({ ...prev, v2: calcImp(prev.v1, prev.u1, prev.u2, {}, true) }));
    }, []);

    return (
        <div>
             <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2 overflow-x-auto">
                <button onClick={() => setTab('prefix')} className={`px-4 py-2 rounded ${tab==='prefix'?'bg-slate-700 text-white':'text-slate-400'}`}>Prefix/Units</button>
                <button onClick={() => setTab('number')} className={`px-4 py-2 rounded ${tab==='number'?'bg-slate-700 text-white':'text-slate-400'}`}>Number Systems</button>
                <button onClick={() => setTab('imperial')} className={`px-4 py-2 rounded ${tab==='imperial'?'bg-slate-700 text-white':'text-slate-400'}`}>SI ↔ Imperial</button>
            </div>

            {tab === 'prefix' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-slate-800 rounded mb-4 text-sm text-slate-400">
                        Supports Linear (pico...mega), Area (mm²...km²), and Volume (mm³...m³) conversion. Ensure From/To types match.
                    </div>
                    <InputGroup label="Value" value={pVal} onChange={setPVal} />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                             <label className="text-sm font-medium text-slate-300">From</label>
                             <select className="bg-slate-800 border border-slate-700 rounded p-2 text-white" value={pFrom} onChange={e => setPFrom(e.target.value)}>
                                <optgroup label="Prefix (Linear)">
                                    <option value="prefix_1e-12">pico (p)</option>
                                    <option value="prefix_1e-9">nano (n)</option>
                                    <option value="prefix_1e-6">micro (µ)</option>
                                    <option value="prefix_1e-3">milli (m)</option>
                                    <option value="prefix_1e3">kilo (k)</option>
                                    <option value="prefix_1e6">Mega (M)</option>
                                </optgroup>
                                <optgroup label="Area">
                                    <option value="area_1e-6">mm²</option>
                                    <option value="area_1e-4">cm²</option>
                                    <option value="area_1e6">km²</option>
                                </optgroup>
                                <optgroup label="Volume">
                                    <option value="volume_1e-9">mm³</option>
                                    <option value="volume_1e-6">cm³</option>
                                    <option value="volume_1e-3">Liter (L)</option>
                                </optgroup>
                             </select>
                        </div>
                        <div className="flex flex-col space-y-1">
                             <label className="text-sm font-medium text-slate-300">To</label>
                             <select className="bg-slate-800 border border-slate-700 rounded p-2 text-white" value={pTo} onChange={e => setPTo(e.target.value)}>
                                <optgroup label="Prefix (Linear)">
                                    <option value="prefix_1e-12">pico (p)</option>
                                    <option value="prefix_1e-9">nano (n)</option>
                                    <option value="prefix_1e-6">micro (µ)</option>
                                    <option value="prefix_1e-3">milli (m)</option>
                                    <option value="prefix_1e3">kilo (k)</option>
                                    <option value="prefix_1e6">Mega (M)</option>
                                </optgroup>
                                <optgroup label="Area">
                                    <option value="area_1e-6">mm²</option>
                                    <option value="area_1e-4">cm²</option>
                                    <option value="area_1e6">km²</option>
                                </optgroup>
                                <optgroup label="Volume">
                                    <option value="volume_1e-9">mm³</option>
                                    <option value="volume_1e-6">cm³</option>
                                    <option value="volume_1e-3">Liter (L)</option>
                                </optgroup>
                             </select>
                        </div>
                    </div>
                    <div className="text-center bg-slate-800 p-6 rounded border border-slate-700">
                        <div className="text-sm text-slate-400 mb-1">Result</div>
                        <div className="text-3xl font-mono font-bold text-white">{convertPrefix()}</div>
                    </div>
                </div>
            )}

            {tab === 'number' && (
                 <div className="space-y-6 animate-fade-in">
                    <InputGroup label="Decimal (10)" value={nDec} onChange={v => updateNumber(v, 10)} />
                    <InputGroup label="Binary (2)" value={nBin} onChange={v => updateNumber(v, 2)} />
                    <InputGroup label="Octal (8)" value={nOct} onChange={v => updateNumber(v, 8)} />
                    <InputGroup label="Hexadecimal (16)" value={nHex} onChange={v => updateNumber(v, 16)} type="text" />
                 </div>
            )}

            {tab === 'imperial' && (
                 <div className="space-y-6 animate-fade-in">
                     <div className="flex justify-between px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>SI (Metric)</span>
                        <span>Imperial</span>
                     </div>
                     {/* Length */}
                     <ImpRow label="Length" 
                        v1={impLen.v1} u1={impLen.u1} 
                        onV1={v => setImpLen(prev => ({...prev, v1: v, v2: calcImp(v, prev.u1, prev.u2, lengthMap)}))} 
                        onU1={u => setImpLen(prev => ({...prev, u1: u, v2: calcImp(prev.v1, u, prev.u2, lengthMap)}))}
                        v2={impLen.v2} u2={impLen.u2} 
                        onV2={v => setImpLen(prev => ({...prev, v2: v, v1: calcImp(v, prev.u2, prev.u1, lengthMap)}))} 
                        onU2={u => setImpLen(prev => ({...prev, u2: u, v1: calcImp(prev.v2, u, prev.u1, lengthMap)}))}
                        siOpts={['m','cm','mm','km']}
                        impOpts={['ft','in','yd','mi']}
                     />
                     {/* Weight */}
                     <ImpRow label="Weight" 
                        v1={impWgt.v1} u1={impWgt.u1} 
                        onV1={v => setImpWgt(prev => ({...prev, v1: v, v2: calcImp(v, prev.u1, prev.u2, weightMap)}))} 
                        onU1={u => setImpWgt(prev => ({...prev, u1: u, v2: calcImp(prev.v1, u, prev.u2, weightMap)}))}
                        v2={impWgt.v2} u2={impWgt.u2} 
                        onV2={v => setImpWgt(prev => ({...prev, v2: v, v1: calcImp(v, prev.u2, prev.u1, weightMap)}))} 
                        onU2={u => setImpWgt(prev => ({...prev, u2: u, v1: calcImp(prev.v2, u, prev.u1, weightMap)}))}
                        siOpts={['kg','g']}
                        impOpts={['lb','oz','st']}
                     />
                     {/* Volume */}
                     <ImpRow label="Volume" 
                        v1={impVol.v1} u1={impVol.u1} 
                        onV1={v => setImpVol(prev => ({...prev, v1: v, v2: calcImp(v, prev.u1, prev.u2, volumeMap)}))} 
                        onU1={u => setImpVol(prev => ({...prev, u1: u, v2: calcImp(prev.v1, u, prev.u2, volumeMap)}))}
                        v2={impVol.v2} u2={impVol.u2} 
                        onV2={v => setImpVol(prev => ({...prev, v2: v, v1: calcImp(v, prev.u2, prev.u1, volumeMap)}))} 
                        onU2={u => setImpVol(prev => ({...prev, u2: u, v1: calcImp(prev.v2, u, prev.u1, volumeMap)}))}
                        siOpts={['L','mL','m3']}
                        impOpts={['gal','qt','pt','floz']}
                     />
                     {/* Area */}
                     <ImpRow label="Area" 
                        v1={impArea.v1} u1={impArea.u1} 
                        onV1={v => setImpArea(prev => ({...prev, v1: v, v2: calcImp(v, prev.u1, prev.u2, areaMap)}))} 
                        onU1={u => setImpArea(prev => ({...prev, u1: u, v2: calcImp(prev.v1, u, prev.u2, areaMap)}))}
                        v2={impArea.v2} u2={impArea.u2} 
                        onV2={v => setImpArea(prev => ({...prev, v2: v, v1: calcImp(v, prev.u2, prev.u1, areaMap)}))} 
                        onU2={u => setImpArea(prev => ({...prev, u2: u, v1: calcImp(prev.v2, u, prev.u1, areaMap)}))}
                        siOpts={['m2','ha']}
                        impOpts={['ft2','acre']}
                     />
                     {/* Temp */}
                     <ImpRow label="Temp" 
                        v1={impTemp.v1} u1={impTemp.u1} 
                        onV1={v => setImpTemp(prev => ({...prev, v1: v, v2: calcImp(v, prev.u1, prev.u2, {}, true)}))} 
                        onU1={u => setImpTemp(prev => ({...prev, u1: u, v2: calcImp(prev.v1, u, prev.u2, {}, true)}))}
                        v2={impTemp.v2} u2={impTemp.u2} 
                        onV2={v => setImpTemp(prev => ({...prev, v2: v, v1: calcImp(v, prev.u2, prev.u1, {}, true)}))} 
                        onU2={u => setImpTemp(prev => ({...prev, u2: u, v1: calcImp(prev.v2, u, prev.u1, {}, true)}))}
                        siOpts={['C','K']}
                        impOpts={['F']}
                     />
                 </div>
            )}
        </div>
    )
}

const ImpRow = ({label, v1, u1, onV1, onU1, v2, u2, onV2, onU2, siOpts, impOpts}: any) => (
    <div className="bg-slate-800 p-3 rounded border border-slate-700">
        <div className="text-xs font-bold text-slate-400 mb-2">{label}</div>
        <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1">
                <input type="number" value={v1} onChange={e => onV1(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" />
                <select value={u1} onChange={e => onU1(e.target.value)} className="bg-slate-700 text-white rounded px-1 text-sm border-none focus:ring-0">
                    {siOpts.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div className="text-blue-500 font-bold">⇄</div>
            <div className="flex-1 flex gap-1">
                <input type="number" value={v2} onChange={e => onV2(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" />
                <select value={u2} onChange={e => onU2(e.target.value)} className="bg-slate-700 text-white rounded px-1 text-sm border-none focus:ring-0">
                    {impOpts.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        </div>
    </div>
)
