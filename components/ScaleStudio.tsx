
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
    if (notes.length !== 7) return [];
    
    return notes.map((r, i) => {
      const third = notes[(i + 2) % 7];
      const fifth = notes[(i + 4) % 7];
      
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
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.start(now);
    osc.stop(now + 1.1);
  };

  const activeNotes = getScaleNotes();
  const harmony = getHarmony();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Estudio de Escalas</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Domina el mástil y la armonía.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tonalidad</label>
              <select value={root} onChange={e => setRoot(e.target.value)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black dark:text-white border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none w-28">
                {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escala</label>
              <select value={scaleName} onChange={e => setScaleName(e.target.value)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black dark:text-white border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none min-w-[200px]">
                {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-10 overflow-x-auto no-scrollbar">
          {(['fretboard', 'harmony', 'formulas'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] transition-all relative shrink-0 ${activeTab === tab ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'fretboard' ? 'Mástil' : tab === 'harmony' ? 'Armonización' : 'Fórmulas'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-500 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'fretboard' && (
            <div className="animate-in fade-in zoom-in-95">
              <div className="overflow-x-auto pb-10 cursor-grab active:cursor-grabbing">
                <div className="min-w-[900px] bg-slate-800 p-2 rounded-3xl border-8 border-slate-900 relative shadow-2xl">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`flex-1 border-r ${i === 0 ? 'border-slate-500 border-r-[10px]' : 'border-slate-700/50'} relative`}>
                        {[3, 5, 7, 9, 12, 15].includes(i) && <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-700/50 ${i === 12 ? 'top-1/4 h-4 w-4' : 'top-1/2 -translate-y-1/2 w-6 h-6'}`}></div>}
                        {i === 12 && <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700/50"></div>}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col py-6 relative z-10">
                    {STRINGS.map((openNote, sIdx) => (
                      <div key={sIdx} className="flex h-14 items-center relative">
                        <div className={`absolute w-full ${sIdx < 2 ? 'h-[1px]' : sIdx < 4 ? 'h-[2px]' : 'h-[3px]'} bg-gradient-to-r from-slate-400 to-slate-500 shadow-sm opacity-60`}></div>
                        {[...Array(16)].map((_, fret) => {
                          const note = NOTES[(NOTES.indexOf(openNote) + fret) % 12];
                          const isRoot = note === root;
                          const isScaleNote = activeNotes.includes(note);
                          return (
                            <div key={fret} className="flex-1 flex justify-center relative z-20">
                              {isScaleNote && (
                                <button onClick={() => playNote(sIdx, fret)} className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl transition-all hover:scale-125 active:scale-90 ${isRoot ? 'bg-rose-500 text-white ring-4 ring-rose-500/30' : 'bg-brand-500 text-white'}`}>{note}</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* LEGEND ADDED HERE */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tónica</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas de la escala</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Toca las notas para oír su sonido 🔊</p>
              </div>
            </div>
          )}

          {activeTab === 'harmony' && (
            <div className="animate-in fade-in slide-in-from-bottom-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 mb-12">
                {harmony.map(h => (
                  <div key={h.degree} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-700 hover:border-brand-500 transition-all cursor-pointer group shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grado {h.degree}</div>
                    <div className="text-4xl font-black text-slate-800 dark:text-white mb-4 group-hover:text-brand-500">{h.name}</div>
                    <div className="flex justify-center gap-1.5">{h.notes.map((n, idx) => <span key={idx} className="text-[8px] font-black bg-white dark:bg-slate-900 px-2 py-1 rounded-lg text-slate-500 border border-slate-100 dark:border-slate-700">{n}</span>)}</div>
                  </div>
                ))}
                {harmony.length === 0 && <p className="col-span-full text-center text-slate-400 italic py-20">La armonización diatónica solo está disponible para escalas de 7 notas.</p>}
              </div>
              {/* DYNAMIC MESSAGE ADDED HERE */}
              <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                  Estas son las triadas que se forman naturalmente usando solo las notas de la escala 
                  <span className="text-brand-600 dark:text-brand-400 mx-1 font-black">{root} {scaleName}</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 overflow-hidden rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="px-10 py-6">Tipo</th><th className="px-10 py-6">Fórmula</th><th className="px-10 py-6">Ejemplo (C)</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {CHORD_FORMULAS.map((f, i) => (
                    <tr key={i} className="dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-10 py-6 font-black">{f.name}</td>
                      <td className="px-10 py-6 font-mono text-brand-600 font-black">{f.formula}</td>
                      <td className="px-10 py-6 text-slate-500">{f.example}</td>
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
