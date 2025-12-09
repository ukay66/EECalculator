
import React, { useState } from 'react';
import { InputGroup } from './InputGroup';
import { SelectGroup } from './SelectGroup';
import { 
    calculateOhmsLaw, calculateLedResistor, calculateCapacitorCode, calculate555, 
    calculateFilter 
} from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { 
    OhmsLawData, LedData, DividerData, CapacitorData, Timer555Data, 
    BatteryLifeData, RCTimeData, OpAmpData, FilterData, PcbData 
} from '../types';

export const ElectronicsView: React.FC = () => {
    const [activeCalc, setActiveCalc] = useState<string | null>(null);

    // State Hooks
    const [ohms, setOhms] = usePersistedState<OhmsLawData>('ohms', { v: '', i: '', r: '', p: '' });
    const [led, setLed] = usePersistedState<LedData>('led', { supplyV: '', forwardV: '2.0', current: '20' });
    const [divider, setDivider] = usePersistedState<DividerData>('divider', { vin: '', r1: '', r1Unit: 1000, r2: '', r2Unit: 1000 });
    const [cap, setCap] = usePersistedState<CapacitorData>('cap', { code: '', tolerance: '' });
    const [timer, setTimer] = usePersistedState<Timer555Data>('timer', { mode: 'astable-no-diode', r1: '', r1Unit: 1000, r2: '', r2Unit: 1000, c: '', cUnit: 1e-6 });
    const [batt, setBatt] = usePersistedState<BatteryLifeData>('batt_life', { capacity: '', capUnit: 1, current: '', currUnit: 1, eff: '85' });
    const [rc, setRc] = usePersistedState<RCTimeData>('rc', { r: '', rUnit: 1000, c: '', cUnit: 1e-6 });
    const [opamp, setOpamp] = usePersistedState<OpAmpData>('opamp', { config: 'non-inverting', r1: '', r1Unit: 1000, r2: '', r2Unit: 1000, v1: '', v2: '', vPlus: '', vMinus: '', vcc: '12', vee: '0' });
    const [filter, setFilter] = usePersistedState<FilterData>('filter', { type: 'lowpass', r: '', rUnit: 1000, c: '', cUnit: 1e-6, r2: '', r2Unit: 1000, c2: '', c2Unit: 1e-6 });
    const [pcb, setPcb] = usePersistedState<PcbData>('pcb', { current: '', tempRise: '10', thickness: '0.035', layer: 'external' });

    const CALC_TITLES: Record<string, string> = {
        'ohms': "Ohm's Law",
        'led': "LED Resistor",
        'divider': "Voltage Divider",
        'cap': "Capacitor Code",
        'timer': "555 Timer",
        'batt': "Battery Life",
        'rc': "RC Time Constant",
        'opamp': "Op-Amp",
        'filter': "Filter",
        'pcb': "PCB Trace"
    };

    const getOpAmpFormula = (cfg: string) => {
       switch(cfg) {
          case 'non-inverting': return 'Vout = Vin × (1 + R2/R1)';
          case 'inverting': return 'Vout = -Vin × (R2/R1)';
          case 'differential': return 'Vout = (R2/R1) × (V2 - V1)';
          case 'comparator': return 'Vout = Vcc (if V+ > V-) else Vee';
          case 'voltage-follower': return 'Vout = Vin';
          default: return '';
       }
    };

    const renderGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
            <Card icon="Ω" title="Ohm's Law" onClick={() => setActiveCalc('ohms')} />
            <Card icon="💡" title="LED Resistor" onClick={() => setActiveCalc('led')} />
            <Card icon="÷" title="Voltage Divider" onClick={() => setActiveCalc('divider')} />
            <Card icon="⏸️" title="Capacitor Code" onClick={() => setActiveCalc('cap')} />
            <Card icon="⏱️" title="555 Timer" onClick={() => setActiveCalc('timer')} />
            <Card icon="🔋" title="Battery Life" onClick={() => setActiveCalc('batt')} />
            <Card icon="⏲️" title="RC Time Constant" onClick={() => setActiveCalc('rc')} />
            <Card icon="▷" title="Op-Amp" onClick={() => setActiveCalc('opamp')} />
            <Card icon="🔽" title="Filter" onClick={() => setActiveCalc('filter')} />
            <Card icon="🔧" title="PCB Trace" onClick={() => setActiveCalc('pcb')} />
        </div>
    );

    return (
        <div>
            {activeCalc ? (
                <div className="animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">{CALC_TITLES[activeCalc] || activeCalc}</h2>
                        <button onClick={() => setActiveCalc(null)} className="text-slate-400 hover:text-white flex items-center gap-1">← Back</button>
                    </div>

                    {/* OHM'S LAW */}
                    {activeCalc === 'ohms' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Voltage (V)" value={ohms.v} onChange={v => setOhms({...ohms, v})} unit="V" />
                                <InputGroup label="Current (I)" value={ohms.i} onChange={v => setOhms({...ohms, i: v})} unit="A" />
                                <InputGroup label="Resistance (R)" value={ohms.r} onChange={v => setOhms({...ohms, r: v})} unit="Ω" />
                                <InputGroup label="Power (P)" value={ohms.p} onChange={v => setOhms({...ohms, p: v})} unit="W" />
                            </div>
                            {(() => {
                                const res = calculateOhmsLaw(ohms.v, ohms.i, ohms.r, ohms.p);
                                if(isNaN(res.V)) return null;
                                return (
                                    <div className="result-grid mt-4">
                                        <ResultItem label="Voltage" value={`${res.V.toFixed(2)} V`} />
                                        <ResultItem label="Current" value={`${res.I.toFixed(3)} A`} />
                                        <ResultItem label="Resistance" value={`${res.R.toFixed(2)} Ω`} />
                                        <ResultItem label="Power" value={`${res.P.toFixed(2)} W`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {/* LED RESISTOR */}
                    {activeCalc === 'led' && (
                        <div className="space-y-4">
                            <InputGroup label="Supply Voltage" value={led.supplyV} onChange={v => setLed({...led, supplyV: v})} unit="V" />
                            <SelectGroup label="LED Color" value={led.forwardV} onChange={v => setLed({...led, forwardV: v})} 
                                options={[
                                    {label:'Red (2.0V)', value:'2.0'}, {label:'Blue (3.2V)', value:'3.2'}, 
                                    {label:'Green (3.0V)', value:'3.0'}, {label:'White (3.4V)', value:'3.4'},
                                    {label:'Custom', value:'custom'}
                                ]} 
                            />
                            {led.forwardV === 'custom' && <InputGroup label="Custom Forward V" value={led.customV || ''} onChange={v => setLed({...led, customV: v})} unit="V" />}
                            <InputGroup label="LED Current" value={led.current} onChange={v => setLed({...led, current: v})} unit="mA" />
                            
                            {(() => {
                                const fwd = led.forwardV === 'custom' ? parseFloat(led.customV || '0') : parseFloat(led.forwardV);
                                const res = calculateLedResistor(parseFloat(led.supplyV), fwd, parseFloat(led.current));
                                if(!res) return null;
                                return (
                                    <div className="result-box space-y-2">
                                        <ResultItem label="Required Resistor" value={`${res.resistance.toFixed(1)} Ω`} highlight />
                                        <ResultItem label="Nearest Standard (E12)" value={`${res.nearest} Ω`} />
                                        <ResultItem label="Power Dissipation" value={`${(res.power*1000).toFixed(1)} mW`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}
                    
                    {/* VOLTAGE DIVIDER */}
                    {activeCalc === 'divider' && (
                        <div className="space-y-4">
                            <InputGroup label="Input Voltage (Vin)" value={divider.vin} onChange={v => setDivider({...divider, vin: v})} unit="V" />
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="R1" value={divider.r1} onChange={v => setDivider({...divider, r1: v})} /></div>
                                <div className="w-20"><SelectGroup label="Unit" value={divider.r1Unit} onChange={v => setDivider({...divider, r1Unit: parseFloat(v)})} options={[{label:'Ω',value:1},{label:'kΩ',value:1000},{label:'MΩ',value:1e6}]} /></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="R2" value={divider.r2} onChange={v => setDivider({...divider, r2: v})} /></div>
                                <div className="w-20"><SelectGroup label="Unit" value={divider.r2Unit} onChange={v => setDivider({...divider, r2Unit: parseFloat(v)})} options={[{label:'Ω',value:1},{label:'kΩ',value:1000},{label:'MΩ',value:1e6}]} /></div>
                            </div>
                            {(() => {
                                const r1 = parseFloat(divider.r1) * divider.r1Unit;
                                const r2 = parseFloat(divider.r2) * divider.r2Unit;
                                const vin = parseFloat(divider.vin);
                                if(!r1 || !r2 || !vin) return null;
                                const vout = vin * (r2 / (r1 + r2));
                                return (
                                    <div className="result-box">
                                        <ResultItem label="Vout" value={`${vout.toFixed(3)} V`} highlight />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {/* CAPACITOR CODE */}
                    {activeCalc === 'cap' && (
                        <div className="space-y-4">
                            <InputGroup label="Code (3 digits)" value={cap.code} onChange={v => setCap({...cap, code: v})} placeholder="104" max={999} />
                            {(() => {
                                const res = calculateCapacitorCode(cap.code, cap.tolerance);
                                if(!res) return null;
                                return (
                                    <div className="result-box text-center">
                                        <div className="text-4xl font-bold text-white">{res.display}</div>
                                        <div className="text-sm text-slate-400">{res.valPf} pF</div>
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {/* 555 TIMER */}
                    {activeCalc === 'timer' && (
                        <div className="space-y-4">
                            <SelectGroup label="Mode" value={timer.mode} onChange={v => setTimer({...timer, mode: v as any})} 
                                options={[
                                    {label:'Astable (No Diode)', value:'astable-no-diode'},
                                    {label:'Astable (With Diode)', value:'astable-with-diode'},
                                    {label:'Monostable', value:'monostable'}
                                ]} 
                            />
                            {/* R1 */}
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="R1" value={timer.r1} onChange={v => setTimer({...timer, r1: v})} /></div>
                                <div className="w-20"><SelectGroup label="Unit" value={timer.r1Unit} onChange={v => setTimer({...timer, r1Unit: parseFloat(v)})} options={[{label:'kΩ',value:1000},{label:'Ω',value:1}]} /></div>
                            </div>
                            {/* R2 (Only for Astable) */}
                            {timer.mode.includes('astable') && (
                                <div className="flex gap-2">
                                    <div className="flex-1"><InputGroup label="R2" value={timer.r2} onChange={v => setTimer({...timer, r2: v})} /></div>
                                    <div className="w-20"><SelectGroup label="Unit" value={timer.r2Unit} onChange={v => setTimer({...timer, r2Unit: parseFloat(v)})} options={[{label:'kΩ',value:1000},{label:'Ω',value:1}]} /></div>
                                </div>
                            )}
                            {/* C */}
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="C" value={timer.c} onChange={v => setTimer({...timer, c: v})} /></div>
                                <div className="w-20"><SelectGroup label="Unit" value={timer.cUnit} onChange={v => setTimer({...timer, cUnit: parseFloat(v)})} options={[{label:'µF',value:1e-6},{label:'nF',value:1e-9}]} /></div>
                            </div>

                            {(() => {
                                const R1 = parseFloat(timer.r1) * timer.r1Unit;
                                const R2 = parseFloat(timer.r2) * timer.r2Unit;
                                const C = parseFloat(timer.c) * timer.cUnit;
                                if(!R1 || !C) return null;
                                
                                const res = calculate555(timer.mode, R1, R2, C);
                                if(timer.mode === 'monostable') {
                                    return <ResultItem label="Pulse Width" value={`${(res.pulse! * 1000).toFixed(2)} ms`} highlight />
                                }
                                return (
                                    <div className="result-grid">
                                        <ResultItem label="Frequency" value={`${res.freq?.toFixed(2)} Hz`} highlight />
                                        <ResultItem label="Duty Cycle" value={`${res.duty?.toFixed(1)} %`} />
                                        <ResultItem label="Period" value={`${(res.period! * 1000).toFixed(2)} ms`} />
                                        <ResultItem label="T-high" value={`${(res.thigh! * 1000).toFixed(2)} ms`} />
                                        <ResultItem label="T-low" value={`${(res.tlow! * 1000).toFixed(2)} ms`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}
                    
                    {/* BATTERY LIFE */}
                    {activeCalc === 'batt' && (
                        <div className="space-y-4">
                            <InputGroup label="Capacity" value={batt.capacity} onChange={v => setBatt({...batt, capacity: v})} unit={batt.capUnit === 1 ? 'mAh' : 'Ah'} />
                            <InputGroup label="Current" value={batt.current} onChange={v => setBatt({...batt, current: v})} unit={batt.currUnit === 1 ? 'mA' : 'A'} />
                            <InputGroup label="Efficiency" value={batt.eff} onChange={v => setBatt({...batt, eff: v})} unit="%" />
                            {(() => {
                                const cap = parseFloat(batt.capacity) * batt.capUnit;
                                const curr = parseFloat(batt.current) * batt.currUnit;
                                const eff = parseFloat(batt.eff) / 100;
                                if(!cap || !curr) return null;
                                const hours = (cap * eff) / curr;
                                return <ResultItem label="Runtime" value={`${hours.toFixed(2)} hours`} highlight />
                            })()}
                        </div>
                    )}

                    {/* RC TIME */}
                    {activeCalc === 'rc' && (
                        <div className="space-y-4">
                            <div className="text-xs text-blue-400 font-mono mb-2">
                                <span className="font-bold text-blue-300">Formula: </span>
                                τ = R × C
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="R" value={rc.r} onChange={v => setRc({...rc, r: v})} /></div>
                                <div className="w-20"><SelectGroup label="Unit" value={rc.rUnit} onChange={v => setRc({...rc, rUnit: parseFloat(v)})} options={[{label:'kΩ',value:1000},{label:'Ω',value:1}]} /></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="C" value={rc.c} onChange={v => setRc({...rc, c: v})} /></div>
                                <div className="w-20"><SelectGroup label="Unit" value={rc.cUnit} onChange={v => setRc({...rc, cUnit: parseFloat(v)})} options={[{label:'µF',value:1e-6},{label:'nF',value:1e-9}]} /></div>
                            </div>
                            {(() => {
                                const R = parseFloat(rc.r) * rc.rUnit;
                                const C = parseFloat(rc.c) * rc.cUnit;
                                if(!R || !C) return null;
                                const tau = R * C;
                                return (
                                    <div className="result-grid">
                                        <ResultItem label="τ (63.2%)" value={`${(tau*1000).toFixed(2)} ms`} highlight />
                                        <ResultItem label="5τ (99%)" value={`${(tau*5000).toFixed(2)} ms`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {/* OP AMP */}
                    {activeCalc === 'opamp' && (
                        <div className="space-y-4">
                            <SelectGroup label="Config" value={opamp.config} onChange={v => setOpamp({...opamp, config: v as any})}
                                options={[
                                    {label:'Non-Inverting', value:'non-inverting'}, {label:'Inverting', value:'inverting'},
                                    {label:'Differential', value:'differential'}, {label:'Comparator', value:'comparator'},
                                    {label:'Voltage Follower', value:'voltage-follower'}
                                ]}
                            />
                            
                            <div className="text-xs text-blue-400 font-mono mt-1 mb-2">
                                <span className="font-bold text-blue-300">Formula: </span>
                                {getOpAmpFormula(opamp.config)}
                            </div>

                            {['non-inverting', 'inverting', 'differential'].includes(opamp.config) && (
                                <>
                                    <InputGroup label="R1" value={opamp.r1} onChange={v => setOpamp({...opamp, r1: v})} />
                                    <InputGroup label="R2" value={opamp.r2} onChange={v => setOpamp({...opamp, r2: v})} />
                                </>
                            )}
                            {opamp.config === 'differential' && (
                                <>
                                    <InputGroup label="V1" value={opamp.v1 || ''} onChange={v => setOpamp({...opamp, v1: v})} unit="V" />
                                    <InputGroup label="V2" value={opamp.v2 || ''} onChange={v => setOpamp({...opamp, v2: v})} unit="V" />
                                </>
                            )}
                            
                            {/* Comparator Layout */}
                            {opamp.config === 'comparator' && (
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative mt-4">
                                    <div className="text-center text-slate-500 mb-4 text-xs uppercase tracking-widest font-bold">Comparator Configuration</div>
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        {/* Inputs Left */}
                                        <div className="flex flex-col gap-4 w-full md:w-1/3">
                                            <InputGroup label="VCC (Power +)" value={opamp.vcc || ''} onChange={v => setOpamp({...opamp, vcc: v})} unit="V" placeholder="12" />
                                            <div className="flex flex-col gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                                                <InputGroup label="Inverting (V-)" value={opamp.vMinus || ''} onChange={v => setOpamp({...opamp, vMinus: v})} unit="V" placeholder="0" />
                                                <InputGroup label="Non-Inv (V+)" value={opamp.vPlus || ''} onChange={v => setOpamp({...opamp, vPlus: v})} unit="V" placeholder="0" />
                                            </div>
                                            <InputGroup label="VEE (Power -)" value={opamp.vee || ''} onChange={v => setOpamp({...opamp, vee: v})} unit="V" placeholder="0" />
                                        </div>
                                        
                                        {/* Arrow / Symbol (Hidden on mobile) */}
                                        <div className="hidden md:flex text-slate-600 text-4xl">→</div>

                                        {/* Output Right */}
                                        <div className="w-full md:w-1/3 flex flex-col justify-center">
                                             <label className="text-sm font-medium text-slate-300 mb-2 text-center">Output</label>
                                             {(() => {
                                                const vPlus = parseFloat(opamp.vPlus || 'NaN');
                                                const vMinus = parseFloat(opamp.vMinus || 'NaN');
                                                const vcc = parseFloat(opamp.vcc || 'NaN');
                                                const vee = parseFloat(opamp.vee || 'NaN');
                                                
                                                if (isNaN(vPlus) || isNaN(vMinus) || isNaN(vcc) || isNaN(vee)) {
                                                    return <div className="text-center text-slate-500 text-sm">Enter all values</div>
                                                }

                                                let ideal, practical;
                                                if (vPlus === vMinus) {
                                                    ideal = 0;
                                                    practical = 0;
                                                } else {
                                                    ideal = vPlus > vMinus ? vcc : vee;
                                                    practical = vPlus > vMinus ? (vcc * 0.85) : (vee * 0.85);
                                                }
                                                
                                                return (
                                                    <div className="space-y-3">
                                                        <div className="bg-slate-900 border border-slate-600 rounded p-4 text-center">
                                                            <div className="text-xs text-slate-500 mb-1">Ideal Output</div>
                                                            <div className="font-bold text-xl text-white">{ideal.toFixed(2)} V</div>
                                                        </div>
                                                        <div className="bg-slate-900 border border-blue-500 rounded p-4 text-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                                            <div className="text-xs text-blue-400 font-bold mb-1">Practical Output</div>
                                                            <div className="font-bold text-2xl text-white">{practical.toFixed(2)} V</div>
                                                            <div className="text-[10px] text-slate-500 mt-1">~85% Rail Swing</div>
                                                        </div>
                                                    </div>
                                                )
                                             })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Standard Calculations */}
                            {(() => {
                                const R1 = parseFloat(opamp.r1) * opamp.r1Unit;
                                const R2 = parseFloat(opamp.r2) * opamp.r2Unit;
                                let gain = 0, vout = 0;
                                
                                if (opamp.config === 'comparator') return null; // Handled above

                                if(opamp.config === 'non-inverting') gain = 1 + (R2/R1);
                                else if(opamp.config === 'inverting') gain = -(R2/R1);
                                else if(opamp.config === 'voltage-follower') gain = 1;
                                else if(opamp.config === 'differential') {
                                    gain = R2/R1;
                                    vout = gain * (parseFloat(opamp.v2||'0') - parseFloat(opamp.v1||'0'));
                                    return <ResultItem label="Vout" value={`${vout.toFixed(2)} V`} highlight />
                                }
                                return <ResultItem label="Gain" value={`${gain.toFixed(2)}`} highlight />
                            })()}
                        </div>
                    )}
                    
                    {/* FILTER CALCULATOR */}
                    {activeCalc === 'filter' && (
                        <div className="space-y-4">
                            <SelectGroup label="Filter Type" value={filter.type} onChange={v => setFilter({...filter, type: v as any})} 
                                options={[
                                    {label:'Low-Pass', value:'lowpass'},
                                    {label:'High-Pass', value:'highpass'},
                                    {label:'Band-Pass', value:'bandpass'}
                                ]}
                            />

                            {/* STANDARD INPUTS */}
                            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">{filter.type === 'bandpass' ? 'High-Pass Stage' : 'Filter Components'}</h4>
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1"><InputGroup label="R" value={filter.r} onChange={v => setFilter({...filter, r: v})} /></div>
                                    <div className="w-20"><SelectGroup label="Unit" value={filter.rUnit} onChange={v => setFilter({...filter, rUnit: parseFloat(v)})} options={[{label:'kΩ',value:1000},{label:'Ω',value:1}]} /></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1"><InputGroup label="C" value={filter.c} onChange={v => setFilter({...filter, c: v})} /></div>
                                    <div className="w-20"><SelectGroup label="Unit" value={filter.cUnit} onChange={v => setFilter({...filter, cUnit: parseFloat(v)})} options={[{label:'µF',value:1e-6},{label:'nF',value:1e-9},{label:'pF',value:1e-12}]} /></div>
                                </div>
                            </div>

                            {/* BANDPASS EXTRA INPUTS */}
                            {filter.type === 'bandpass' && (
                                <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                    <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Low-Pass Stage</h4>
                                    <div className="flex gap-2 mb-2">
                                        <div className="flex-1"><InputGroup label="R2" value={filter.r2 || ''} onChange={v => setFilter({...filter, r2: v})} /></div>
                                        <div className="w-20"><SelectGroup label="Unit" value={filter.r2Unit || 1000} onChange={v => setFilter({...filter, r2Unit: parseFloat(v)})} options={[{label:'kΩ',value:1000},{label:'Ω',value:1}]} /></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1"><InputGroup label="C2" value={filter.c2 || ''} onChange={v => setFilter({...filter, c2: v})} /></div>
                                        <div className="w-20"><SelectGroup label="Unit" value={filter.c2Unit || 1e-6} onChange={v => setFilter({...filter, c2Unit: parseFloat(v)})} options={[{label:'µF',value:1e-6},{label:'nF',value:1e-9},{label:'pF',value:1e-12}]} /></div>
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const R = parseFloat(filter.r) * filter.rUnit;
                                const C = parseFloat(filter.c) * filter.cUnit;
                                if(!R || !C) return null;
                                
                                let R2 = 0, C2 = 0;
                                if(filter.type === 'bandpass') {
                                    R2 = parseFloat(filter.r2 || '0') * (filter.r2Unit || 1);
                                    C2 = parseFloat(filter.c2 || '0') * (filter.c2Unit || 1);
                                    if(!R2 || !C2) return null;
                                }

                                const res = calculateFilter(filter.type, R, C, R2, C2);
                                if(res.error) return <div className="text-red-400 text-sm text-center">{res.error}</div>

                                if (filter.type === 'bandpass') {
                                    return (
                                        <div className="result-grid">
                                            <ResultItem label="Center Freq" value={`${res.center.toFixed(1)} Hz`} highlight />
                                            <ResultItem label="Bandwidth" value={`${res.bw.toFixed(1)} Hz`} />
                                            <ResultItem label="Lower Cutoff" value={`${res.fLow.toFixed(1)} Hz`} />
                                            <ResultItem label="Upper Cutoff" value={`${res.fHigh.toFixed(1)} Hz`} />
                                            <ResultItem label="Q Factor" value={`${res.q.toFixed(2)}`} />
                                        </div>
                                    )
                                }
                                
                                return (
                                    <div className="result-grid">
                                        <ResultItem label="Cutoff Freq" value={`${res.fc.toFixed(1)} Hz`} highlight />
                                        <ResultItem label="Angular Freq" value={`${(2 * Math.PI * res.fc).toFixed(1)} rad/s`} />
                                        <ResultItem label="Period" value={`${(1000/res.fc).toFixed(2)} ms`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {/* PCB */}
                    {activeCalc === 'pcb' && (
                        <div className="space-y-4">
                           <InputGroup label="Current" value={pcb.current} onChange={v => setPcb({...pcb, current: v})} unit="A" />
                           <SelectGroup label="Temp Rise" value={pcb.tempRise} onChange={v => setPcb({...pcb, tempRise: v})} options={[{label:'10°C',value:'10'},{label:'20°C',value:'20'}]} />
                           <SelectGroup label="Copper" value={pcb.thickness} onChange={v => setPcb({...pcb, thickness: v})} options={[{label:'1 oz',value:'0.035'},{label:'2 oz',value:'0.070'}]} />
                           <SelectGroup label="Layer" value={pcb.layer} onChange={v => setPcb({...pcb, layer: v as any})} options={[{label:'External',value:'external'},{label:'Internal',value:'internal'}]} />
                           
                           {(() => {
                               const I = parseFloat(pcb.current);
                               if(!I) return null;
                               const k = pcb.layer === 'external' ? 0.048 : 0.024;
                               const dT = parseFloat(pcb.tempRise);
                               const areaMils = Math.pow(I / (k * Math.pow(dT, 0.44)), 1/0.725);
                               const thickMils = parseFloat(pcb.thickness) / 0.0254 * 1000; // thickness input is mm, convert to mils approx. Actually input is mm (0.035). 0.035mm is 1.37 mil.
                               // Correct logic: 1oz = 0.035mm = 1.378 mils
                               const thickMilsCorrect = parseFloat(pcb.thickness) / 0.0254; 
                               
                               const widthMils = areaMils / thickMilsCorrect;
                               const widthMm = widthMils * 0.0254;
                               return <ResultItem label="Min Width" value={`${widthMm.toFixed(2)} mm (${widthMils.toFixed(1)} mil)`} highlight />
                           })()}
                        </div>
                    )}

                </div>
            ) : renderGrid()}
        </div>
    );
};

const Card = ({icon, title, onClick}: any) => (
    <div onClick={onClick} className="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors flex flex-col items-center justify-center text-center gap-2 h-32">
        <div className="text-3xl">{icon}</div>
        <div className="font-bold text-white text-sm">{title}</div>
    </div>
);

const ResultItem = ({label, value, highlight}: any) => (
    <div className={`p-3 rounded border ${highlight ? 'bg-slate-700 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="font-mono font-bold text-lg text-white">{value}</div>
    </div>
);
