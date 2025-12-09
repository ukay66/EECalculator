

import React, { useState } from 'react';
import { InputGroup } from './InputGroup';
import { SelectGroup } from './SelectGroup';
import { calculate3Phase, calculateMotor, calculateTransformer, calculatePFC } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { Phase3Data, StarDeltaData, TransformerData, MotorData, PowerFactorData } from '../types';

export const ElectricalView: React.FC = () => {
    const [activeCalc, setActiveCalc] = useState<string | null>(null);

    const [phase3, setPhase3] = usePersistedState<Phase3Data>('phase3', { v: '', i: '', pf: '0.85', eff: '95', connection: 'star' });
    const [sd, setSd] = usePersistedState<StarDeltaData>('sd', { direction: 'delta-to-star', r1: '', r2: '', r3: '' });
    const [trafo, setTrafo] = usePersistedState<TransformerData>('trafo_v2', { 
        phase: 'three', 
        load: '', 
        loadUnit: 'kw', 
        v1: '', 
        v2: '', 
        pf: '0.8', 
        loadType: 'motor'
    });
    const [motor, setMotor] = usePersistedState<MotorData>('motor', { power: '', unit: 'kw', voltage: '', type: 'three', pf: '0.85', eff: '90', start: 'dol' });
    const [pf, setPf] = usePersistedState<PowerFactorData>('pf_v2', { 
        power: '', 
        oldPf: '0.7', 
        newPf: '0.95', 
        voltage: '415', 
        freq: '50',
        phase: 'three'
    });

    const CALC_TITLES: Record<string, string> = {
        'phase3': "3-Phase Power",
        'sd': "Star ↔ Delta",
        'trafo': "Transformer Sizing",
        'motor': "Motor Calculator",
        'pf': "Power Factor Correction"
    };

    const renderGrid = () => (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <Card icon="⚡" title="3-Phase Power" onClick={() => setActiveCalc('phase3')} />
            <Card icon="△" title="Star ↔ Delta" onClick={() => setActiveCalc('sd')} />
            <Card icon="🔄" title="Transformer Sizing" onClick={() => setActiveCalc('trafo')} />
            <Card icon="⚙️" title="Motor Calc" onClick={() => setActiveCalc('motor')} />
            <Card icon="📐" title="Power Factor" onClick={() => setActiveCalc('pf')} />
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

                    {activeCalc === 'phase3' && (
                        <div className="space-y-4">
                            <InputGroup label="Line Voltage" value={phase3.v} onChange={v => setPhase3({...phase3, v})} unit="V" />
                            <InputGroup label="Line Current" value={phase3.i} onChange={v => setPhase3({...phase3, i: v})} unit="A" />
                            <InputGroup label="PF" value={phase3.pf} onChange={v => setPhase3({...phase3, pf: v})} />
                            <SelectGroup label="Connection" value={phase3.connection} onChange={v => setPhase3({...phase3, connection: v as any})} options={[{label:'Star',value:'star'},{label:'Delta',value:'delta'}]} />
                            
                            {(() => {
                                const v = parseFloat(phase3.v), i = parseFloat(phase3.i), pf = parseFloat(phase3.pf);
                                if(!v || !i) return null;
                                const res = calculate3Phase(v, i, pf, parseFloat(phase3.eff), phase3.connection);
                                return (
                                    <div className="result-grid">
                                        <ResultItem label="Real Power" value={`${res.real.toFixed(2)} kW`} highlight />
                                        <ResultItem label="Apparent" value={`${res.apparent.toFixed(2)} kVA`} />
                                        <ResultItem label="Reactive" value={`${res.reactive.toFixed(2)} kVAR`} />
                                        <ResultItem label="Phase Voltage" value={`${res.phaseV.toFixed(2)} V`} />
                                        <ResultItem label="Phase Current" value={`${res.phaseI.toFixed(2)} A`} />
                                        <ResultItem label="Phase Angle" value={`${res.phaseAngle.toFixed(2)}°`} />
                                        <ResultItem label="Power/Phase" value={`${res.powerPerPhase.toFixed(2)} kW`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {activeCalc === 'sd' && (
                        <div className="space-y-4">
                            <SelectGroup label="Direction" value={sd.direction} onChange={v => setSd({...sd, direction: v as any})} options={[{label:'Delta to Star',value:'delta-to-star'},{label:'Star to Delta',value:'star-to-delta'}]} />
                            
                            <div className="bg-slate-800 p-4 rounded border border-slate-700 text-sm font-mono text-slate-300">
                                {sd.direction === 'delta-to-star' ? (
                                    <>
                                        <div className="font-bold text-blue-400 mb-2">Delta (Δ) Network: Three resistances Ra, Rb, Rc in triangle</div>
                                        <div className="font-bold mb-1 text-slate-400">Formulas:</div>
                                        <div>R₁ = (Ra·Rc) / (Ra + Rb + Rc)</div>
                                        <div>R₂ = (Ra·Rb) / (Ra + Rb + Rc)</div>
                                        <div>R₃ = (Rb·Rc) / (Ra + Rb + Rc)</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-bold text-blue-400 mb-2">Star (Y) Network: Three resistances R1, R2, R3 meeting at center</div>
                                        <div className="font-bold mb-1 text-slate-400">Formulas:</div>
                                        <div>Ra = (R₁·R₂ + R₂·R₃ + R₃·R₁) / R₂</div>
                                        <div>Rb = (R₁·R₂ + R₂·R₃ + R₃·R₁) / R₃</div>
                                        <div>Rc = (R₁·R₂ + R₂·R₃ + R₃·R₁) / R₁</div>
                                    </>
                                )}
                            </div>

                            <InputGroup label={sd.direction === 'delta-to-star' ? "Ra" : "R1"} value={sd.r1} onChange={v => setSd({...sd, r1: v})} unit="Ω" />
                            <InputGroup label={sd.direction === 'delta-to-star' ? "Rb" : "R2"} value={sd.r2} onChange={v => setSd({...sd, r2: v})} unit="Ω" />
                            <InputGroup label={sd.direction === 'delta-to-star' ? "Rc" : "R3"} value={sd.r3} onChange={v => setSd({...sd, r3: v})} unit="Ω" />
                            {(() => {
                                const r1 = parseFloat(sd.r1), r2 = parseFloat(sd.r2), r3 = parseFloat(sd.r3);
                                if(!r1 || !r2 || !r3) return null;
                                let res1, res2, res3;
                                if(sd.direction === 'delta-to-star') {
                                    const sum = r1 + r2 + r3;
                                    res1 = (r1*r3)/sum; res2 = (r1*r2)/sum; res3 = (r2*r3)/sum;
                                } else {
                                    const num = r1*r2 + r2*r3 + r3*r1;
                                    res1 = num/r2; res2 = num/r3; res3 = num/r1;
                                }
                                return (
                                    <div className="result-grid">
                                        <ResultItem label={sd.direction === 'delta-to-star' ? "R1 (from Ra/Rc)" : "Ra (opp R2)"} value={`${res1.toFixed(2)} Ω`} />
                                        <ResultItem label={sd.direction === 'delta-to-star' ? "R2 (from Ra/Rb)" : "Rb (opp R3)"} value={`${res2.toFixed(2)} Ω`} />
                                        <ResultItem label={sd.direction === 'delta-to-star' ? "R3 (from Rb/Rc)" : "Rc (opp R1)"} value={`${res3.toFixed(2)} Ω`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {activeCalc === 'trafo' && (
                        <div className="space-y-4">
                            <SelectGroup label="Phase" value={trafo.phase} onChange={v => setTrafo({...trafo, phase: v as any})} options={[{label:'Three Phase',value:'three'},{label:'Single Phase',value:'single'}]} />
                            
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <InputGroup label="Load" value={trafo.load} onChange={v => setTrafo({...trafo, load: v})} />
                                </div>
                                <div className="w-24">
                                    <SelectGroup label="Unit" value={trafo.loadUnit} onChange={v => setTrafo({...trafo, loadUnit: v as any})} options={[{label:'kW',value:'kw'},{label:'kVA',value:'kva'}]} />
                                </div>
                            </div>

                            {trafo.loadUnit === 'kw' && (
                                <InputGroup label="Power Factor (PF)" value={trafo.pf} onChange={v => setTrafo({...trafo, pf: v})} placeholder="0.8" />
                            )}

                            <div className="flex gap-2">
                                <InputGroup label="Primary V (V)" value={trafo.v1} onChange={v => setTrafo({...trafo, v1: v})} unit="V" />
                                <InputGroup label="Secondary V (V)" value={trafo.v2} onChange={v => setTrafo({...trafo, v2: v})} unit="V" />
                            </div>

                            <SelectGroup label="Load Type" value={trafo.loadType} onChange={v => setTrafo({...trafo, loadType: v as any})} 
                                options={[
                                    {label:'Resistive (Lighting/Heat)', value:'resistive'},
                                    {label:'Motor (Inductive)', value:'motor'},
                                    {label:'Nonlinear (Rectifiers/UPS)', value:'nonlinear'}
                                ]}
                                hint={trafo.loadType === 'motor' ? 'Applies 1.25x Multiplier' : trafo.loadType === 'nonlinear' ? 'Applies 1.35x Multiplier' : 'Applies 1.0x Multiplier'}
                            />

                            {(() => {
                                const res = calculateTransformer(trafo);
                                if (!res) return null;
                                return (
                                    <div className="result-box space-y-3">
                                        <ResultItem label="Required Rating" value={`${res.requiredKva.toFixed(2)} kVA`} highlight />
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <ResultItem label="Primary Current" value={`${res.i1.toFixed(1)} A`} />
                                            <ResultItem label="Secondary Current" value={`${res.i2.toFixed(1)} A`} />
                                        </div>
                                        <div className="text-xs text-slate-500 text-center mt-2">
                                            Based on {trafo.loadType} load multiplier: ×{res.multiplier}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {activeCalc === 'motor' && (
                        <div className="space-y-4">
                             <div className="flex flex-col space-y-1">
                                <label className="text-sm font-medium text-slate-300">Motor Power</label>
                                <div className="flex shadow-sm">
                                    <input 
                                        type="number" 
                                        value={motor.power} 
                                        onChange={e => setMotor({...motor, power: e.target.value})} 
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-l-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono focus:z-10" 
                                        placeholder="0" 
                                    />
                                    <select 
                                        value={motor.unit} 
                                        onChange={e => setMotor({...motor, unit: e.target.value as any})} 
                                        className="bg-slate-700 border border-l-0 border-slate-700 rounded-r-md px-4 py-2 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-600 cursor-pointer focus:z-10"
                                    >
                                        <option value="kw">kW</option>
                                        <option value="hp">HP</option>
                                        <option value="w">W</option>
                                    </select>
                                </div>
                            </div>
                            <InputGroup label="Voltage" value={motor.voltage} onChange={v => setMotor({...motor, voltage: v})} unit="V" />
                            <SelectGroup label="Type" value={motor.type} onChange={v => setMotor({...motor, type: v as any})} options={[{label:'3-Phase',value:'three'},{label:'Single',value:'single'}]} />
                            <InputGroup label="Power Factor" value={motor.pf} onChange={v => setMotor({...motor, pf: v})} placeholder="0.85" />
                            <InputGroup label="Efficiency (%)" value={motor.eff} onChange={v => setMotor({...motor, eff: v})} placeholder="90" />
                            <SelectGroup label="Starting Method" value={motor.start} onChange={v => setMotor({...motor, start: v})} 
                                options={[
                                    {label:'Direct On Line (DOL)', value:'dol'},
                                    {label:'Star-Delta', value:'star-delta'},
                                    {label:'Soft Starter', value:'soft'},
                                    {label:'VFD', value:'vfd'}
                                ]} 
                            />
                            
                            {(() => {
                                if(!motor.power || !motor.voltage) return null;
                                const res = calculateMotor(parseFloat(motor.power), motor.unit, parseFloat(motor.voltage), motor.type, parseFloat(motor.pf), parseFloat(motor.eff), motor.start);
                                return (
                                    <div className="result-grid">
                                        <ResultItem label="Full Load Current" value={`${res.current.toFixed(1)} A`} highlight />
                                        <ResultItem label="Start Current" value={`${res.startCurrent.toFixed(1)} A`} />
                                        <ResultItem label="Torque" value={`${res.torque.toFixed(1)} Nm`} />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {activeCalc === 'pf' && (
                        <div className="space-y-4">
                            <SelectGroup label="System Phase" value={pf.phase} onChange={v => setPf({...pf, phase: v as any})} options={[{label:'Three Phase',value:'three'},{label:'Single Phase',value:'single'}]} />
                            <InputGroup label="Real Power" value={pf.power} onChange={v => setPf({...pf, power: v})} unit="kW" />
                            <div className="flex gap-2">
                                <div className="flex-1"><InputGroup label="System Voltage" value={pf.voltage} onChange={v => setPf({...pf, voltage: v})} unit="V" /></div>
                                <div className="w-32"><SelectGroup label="Frequency" value={pf.freq} onChange={v => setPf({...pf, freq: v as any})} options={[{label:'50 Hz',value:'50'},{label:'60 Hz',value:'60'}]} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Existing PF" value={pf.oldPf} onChange={v => setPf({...pf, oldPf: v})} placeholder="0.7" max={1} />
                                <InputGroup label="Desired PF" value={pf.newPf} onChange={v => setPf({...pf, newPf: v})} placeholder="0.98" max={1} />
                            </div>

                            <div className="bg-slate-800 p-4 rounded border border-slate-700 text-sm font-mono text-slate-300">
                                <div className="font-bold text-blue-400 mb-2">Formulas:</div>
                                <div className="space-y-1 text-xs">
                                    <div>kVAR = kW × [tan(acos(PF₁)) - tan(acos(PF₂))]</div>
                                    <div>C(µF) = (kVAR × 10⁹) / (2πf × V²) {pf.phase==='three'?'× 1/3 (Delta)':''}</div>
                                    <div>I = (kW × 1000) / ({pf.phase==='three'?'√3 × ':''}V × PF)</div>
                                </div>
                            </div>

                            {(() => {
                                const res = calculatePFC(pf);
                                if(!res) return null;
                                return (
                                    <div className="space-y-4">
                                        <div className="result-box text-center">
                                            <div className="text-sm text-slate-400">Required Capacitor Bank</div>
                                            <div className="text-4xl font-bold text-yellow-400">{res.requiredKvar.toFixed(2)} kVAR</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {res.isThreePhase ? 'Total for 3-Phase System' : 'Single Phase Rating'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <ResultItem label="Current (Old)" value={`${res.iOld.toFixed(1)} A`} />
                                            <ResultItem label="Current (New)" value={`${res.iNew.toFixed(1)} A`} highlight />
                                            
                                            <ResultItem label="Apparent (Old)" value={`${res.kvaOld.toFixed(1)} kVA`} />
                                            <ResultItem label="Apparent (New)" value={`${res.kvaNew.toFixed(1)} kVA`} />

                                            <ResultItem label="Reduction" value={`${res.iReduction.toFixed(1)} A`} />
                                            <ResultItem label="% Saved" value={`${res.percentReduction.toFixed(1)}%`} />
                                        </div>

                                        <div className="bg-slate-900 border border-blue-900 p-3 rounded text-center">
                                            <div className="text-xs text-blue-400 font-bold uppercase mb-1">Capacitance Needed</div>
                                            <div className="text-xl text-white font-mono">{Math.round(res.capacitanceMicro)} µF</div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                {res.isThreePhase ? 'Per Phase (Delta Connection assumed)' : 'Total Capacitance'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    )}
                </div>
            ) : renderGrid()}
        </div>
    );
};

const Card = ({icon, title, onClick}: any) => (
    <div onClick={onClick} className="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="font-bold text-white">{title}</div>
    </div>
);

const ResultItem = ({label, value, highlight}: any) => (
    <div className={`p-3 rounded border ${highlight ? 'bg-slate-700 border-green-500' : 'bg-slate-800 border-slate-700'}`}>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="font-mono font-bold text-lg text-white">{value}</div>
    </div>
);