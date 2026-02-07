
import React, { useState } from 'react';
import { ChordData, ChordDot } from '../types';
import { Icon } from '../constants';

interface ChordBuilderProps {
  onSave: (chord: ChordData, global: boolean) => void;
  onCancel: () => void;
  initial?: ChordData;
}

const ChordBuilder: React.FC<ChordBuilderProps> = ({ onSave, onCancel, initial }) => {
  const [name, setName] = useState(initial?.name || '');
  const [dots, setDots] = useState<ChordDot[]>(initial?.dots || []);
  const [muted, setMuted] = useState(initial?.muted || [false, false, false, false, false, false]);
  const [baseFret, setBaseFret] = useState(initial?.baseFret || 1);
  const [saveGlobal, setSaveGlobal] = useState(false);

  const toggleMute = (sIdx: number) => {
    const newMuted = [...muted];
    newMuted[sIdx] = !newMuted[sIdx];
    if (newMuted[sIdx]) setDots(dots.filter(d => d.string !== sIdx));
    setMuted(newMuted);
  };

  const handleFretClick = (sIdx: number, fret: number) => {
    const existing = dots.find(d => d.string === sIdx && d.fret === fret);
    if (existing) {
      if (existing.type === 'note') {
        setDots(dots.map(d => d === existing ? { ...d, type: 'root' } : d));
      } else {
        setDots(dots.filter(d => d !== existing));
      }
    } else {
      const newDots = dots.filter(d => d.string !== sIdx);
      newDots.push({ string: sIdx, fret, type: 'note' });
      setDots(newDots);
      const newMuted = [...muted];
      newMuted[sIdx] = false;
      setMuted(newMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto no-scrollbar">
        <h3 className="text-2xl font-black mb-6 dark:text-white text-center tracking-tight">Constructor</h3>
        
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Nombre del acorde" 
          className="w-full p-4 mb-6 bg-slate-50 dark:bg-slate-700 rounded-2xl border dark:border-slate-600 dark:text-white font-black text-center text-xl outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex items-center justify-center gap-4 mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traste Base</label>
          <input 
            type="number" 
            min="1" 
            value={baseFret} 
            onChange={e => setBaseFret(Number(e.target.value))} 
            className="w-20 p-2 bg-slate-50 dark:bg-slate-700 rounded-xl border dark:border-slate-600 dark:text-white text-center font-bold"
          />
        </div>

        <div className="relative w-52 h-64 mx-auto bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-slate-500 rounded-sm mb-10 shadow-inner">
          {/* Grid lines */}
          {[1, 2, 3, 4].map(i => <div key={i} className="absolute w-full h-[1px] bg-slate-300 dark:bg-slate-600" style={{ top: `${i * 20}%` }}></div>)}
          {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="absolute h-full w-[1px] bg-slate-800 dark:bg-slate-400" style={{ left: `${10 + i * 16}%` }}></div>)}
          
          {/* Interactivity Area */}
          <div className="absolute top-[-25px] left-0 w-full flex justify-between px-[10%]">
            {[0, 1, 2, 3, 4, 5].map(s => (
              <button 
                key={s} 
                onClick={() => toggleMute(s)} 
                className={`w-6 text-xs font-black transition-colors ${muted[s] ? 'text-rose-500' : 'text-slate-400 hover:text-brand-500'}`}
              >
                {muted[s] ? 'X' : (dots.some(d => d.string === s) ? '' : 'O')}
              </button>
            ))}
          </div>

          {[0, 1, 2, 3, 4].map(fIdx => (
            <div key={fIdx} className="absolute w-full h-[20%]" style={{ top: `${fIdx * 20}%` }}>
              {[0, 1, 2, 3, 4, 5].map(sIdx => {
                const dot = dots.find(d => d.string === sIdx && d.fret === fIdx + 1);
                return (
                  <div 
                    key={sIdx} 
                    onClick={() => handleFretClick(sIdx, fIdx + 1)}
                    className="absolute w-[16%] h-full flex items-center justify-center cursor-pointer" 
                    style={{ left: `${10 + sIdx * 16}%`, transform: 'translateX(-50%)' }}
                  >
                    {dot && (
                      <div className={`w-5 h-5 rounded-full shadow-lg ${dot.type === 'root' ? 'bg-rose-500 ring-2 ring-white' : 'bg-slate-800 dark:bg-white'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl cursor-pointer" onClick={() => setSaveGlobal(!saveGlobal)}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${saveGlobal ? 'bg-brand-600 border-brand-600' : 'border-slate-300'}`}>
            {saveGlobal && <Icon name="check" size={14} className="text-white" />}
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Guardar en biblioteca global</span>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => onSave({ name, dots, muted, baseFret }, saveGlobal)} 
            className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
          >
            Listo
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold py-4 rounded-2xl"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChordBuilder;
