
import React, { useState } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { Icon, NOTES, SCALES, CHORD_FORMULAS } from '../constants';

const ScaleStudio: React.FC = () => {
  const [root, setRoot] = useState('C');
  const [scaleName, setScaleName] = useState('Mayor (Jónica)');
  const [activeTab, setActiveTab] = useState<'fretboard' | 'harmony' | 'formulas'>('fretboard');
  const { resume, getContext } = useAudioEngine();

  const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E'];
  const OPEN_STRING_FREQS = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];

  const getScaleNotes = () => {
    const rootIndex = NOTES.indexOf(root);
    const intervals = SCALES[scaleName];
    return intervals.map(i => NOTES[(rootIndex + i) % 12]);
  };

  const getHarmony = () => {
    const notes = getScaleNotes();
    if (notes.length < 7) return [];
    
    return notes.map((r, i) => {
      const third = notes[(i + 2) % notes.length];
      const fifth = notes[(i + 4) % notes.length];
      
      const rIdx = NOTES.indexOf(r);
      const tIdx = NOTES.indexOf(third);
      const fIdx = NOTES.indexOf(fifth);
      
      const semiThird = (tIdx - rIdx + 12) % 12;
      const semiFifth = (fIdx - rIdx + 12) % 12;
      
      let type = '';
      if (semiThird === 4 && semiFifth === 7) type = '';
      else if (semiThird === 3 && semiFifth === 7) type = 'm';
      else if (semiThird === 3 && semiFifth === 6) type = 'dim';
      else if (semiThird === 4 && semiFifth === 8) type = 'aug';
      else type = '?';
      
      return { degree: i + 1, name: r + type, notes: [r, third, fifth] };
    });
  };

  const playNote = async (stringIdx: number, fret: number) => {
    await resume();
    const ctx = getContext();
    if (!ctx) return;
    const baseFreq = OPEN_STRING_FREQS[stringIdx];
    const freq = baseFreq * Math.pow(2, fret / 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.connect(ctx.destination);
    osc.connect(gain);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.start(now);
    osc.stop(now + 0.9);
  };

  const activeNotes = getScaleNotes();
  const harmony = getHarmony();

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 border-emerald-500/10">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 mb-14">
          <div>
            <div className="inline-block px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-emerald-500/20">Teoría Pro</div>
            <h2 className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">Scale <span className="text-emerald-500">Studio</span></h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tónica</label>
              <select value={root} onChange={e => setRoot(e.target.value)} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black dark:text-white border-2 border-slate-100 dark:border-slate-700 outline-none w-36 shadow-lg">
                {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escala / Modo</label>
              <select value={scaleName} onChange={e => setScaleName(e.target.value)} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black dark:text-white border-2 border-slate-100 dark:border-slate-700 outline-none shadow-lg">
                {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b-2 border-slate-100 dark:border-slate-800 mb-12 overflow-x-auto no-scrollbar">
          {(['fretboard', 'harmony', 'formulas'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-12 py-6 font-black text-xs uppercase tracking-[0.2em] transition-all relative shrink-0 ${activeTab === tab ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'fretboard' ? 'Mástil' : tab === 'harmony' ? 'Campo Armónico' : 'Diccionario'}
              {activeTab === tab && <div className="absolute bottom-[-2px] left-0 w-full h-1.5 bg-emerald-500 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="min-h-[480px]">
          {activeTab === 'fretboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div className="overflow-x-auto pb-10 cursor-grab active:cursor-grabbing no-scrollbar">
                <div className="min-w-[1200px] bg-slate-800 dark:bg-slate-950 p-6 rounded-[3rem] border-[16px] border-slate-900 shadow-2xl relative">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`flex-1 border-r ${i === 0 ? 'border-amber-600 border-r-[14px]' : 'border-slate-700/50'} relative`}>
                        {[3, 5, 7, 9, 12, 15].includes(i) && <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-600/40 ${i === 12 ? 'top-1/4 h-6 w-6' : 'top-1/2 -translate-y-1/2 w-10 h-10'}`}></div>}
                        {i === 12 && <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-600/40"></div>}
                        <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs font-black text-slate-500">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col py-10 relative z-10">
                    {STRINGS.map((openNote, sIdx) => (
                      <div key={sIdx} className="flex h-16 items-center relative">
                        <div className={`absolute w-full ${sIdx < 2 ? 'h-[1.5px]' : sIdx < 4 ? 'h-[4px]' : 'h-[6px]'} bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-sm opacity-60`}></div>
                        {[...Array(16)].map((_, fret) => {
                          const note = NOTES[(NOTES.indexOf(openNote) + fret) % 12];
                          const isRoot = note === root;
                          const isScaleNote = activeNotes.includes(note);
                          return (
                            <div key={fret} className="flex-1 flex justify-center relative z-20">
                              {isScaleNote && (
                                <button 
                                  onClick={() => playNote(sIdx, fret)} 
                                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black shadow-2xl transition-all hover:scale-125 active:scale-90 ${
                                    isRoot ? 'bg-rose-500 text-white ring-4 ring-rose-500/40' : 'bg-emerald-500 text-white'
                                  }`}
                                >
                                  {note}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-12 bg-slate-50 dark:bg-slate-950 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30"></div>
                  <span className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Tónica ({root})</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"></div>
                  <span className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Notas Escala</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'harmony' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-8">
                {harmony.map(h => (
                  <div key={h.degree} className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3.5rem] text-center border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Grado {h.degree}</div>
                    <div className="text-5xl font-black text-slate-800 dark:text-white mb-8 group-hover:text-emerald-500 transition-colors">{h.name}</div>
                    <div className="flex justify-center gap-3">
                      {h.notes.map((n, idx) => (
                        <span key={idx} className="text-xs font-black bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-[3rem] border-2 border-emerald-100 dark:border-emerald-800/40 text-center max-w-2xl mx-auto shadow-inner">
                <p className="text-emerald-700 dark:text-emerald-300 font-bold text-lg leading-relaxed">
                  Estos son los acordes que puedes usar para componer en <span className="font-black underline">{root} {scaleName}</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 overflow-hidden rounded-[3.5rem] border-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[12px] font-black text-slate-400 uppercase tracking-widest border-b-4 border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-12 py-8">Acorde</th>
                    <th className="px-12 py-8">Fórmula</th>
                    <th className="px-12 py-8">Ejemplo (C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                  {CHORD_FORMULAS.map((f, i) => (
                    <tr key={i} className="group hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-12 py-8 font-black text-slate-800 dark:text-white text-2xl group-hover:text-emerald-500">{f.name}</td>
                      <td className="px-12 py-8">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-900/30 px-5 py-2.5 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800 shadow-sm">{f.formula}</span>
                      </td>
                      <td className="px-12 py-8 text-slate-500 dark:text-slate-400 font-bold text-lg">{f.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScaleStudio;
