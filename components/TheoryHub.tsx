
import React, { useState } from 'react';
import { Icon } from '../constants';

const TheoryHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'circle' | 'analyzer'>('circle');

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-center p-2 bg-slate-100 dark:bg-slate-900 rounded-[2rem] w-fit mx-auto border border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTool('circle')} 
          className={`px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTool === 'circle' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Círculo de Quintas
        </button>
        <button 
          onClick={() => setActiveTool('analyzer')} 
          className={`px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTool === 'analyzer' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Analizador
        </button>
      </div>

      {activeTool === 'analyzer' ? <ChordAnalyzer /> : <CircleOfFifths />}
    </div>
  );
};

const CircleOfFifths = () => {
  const [selectedKey, setSelectedKey] = useState('C');
  const [useSharps, setUseSharps] = useState(false); 
  
  const CIRCLE_DATA = [
    { maj: 'C', min: 'Am', idx: 0, iv: 'F', ivMin: 'Dm', v: 'G', vMin: 'Em', acc: '0' },
    { maj: 'G', min: 'Em', idx: 1, iv: 'C', ivMin: 'Am', v: 'D', vMin: 'Bm', acc: '1 #' },
    { maj: 'D', min: 'Bm', idx: 2, iv: 'G', ivMin: 'Em', v: 'A', vMin: 'F#m', acc: '2 #' },
    { maj: 'A', min: 'F#m', idx: 3, iv: 'D', ivMin: 'Bm', v: 'E', vMin: 'C#m', acc: '3 #' },
    { maj: 'E', min: 'C#m', idx: 4, iv: 'A', ivMin: 'F#m', v: 'B', vMin: 'G#m', acc: '4 #' },
    { maj: 'B', min: 'G#m', idx: 5, iv: 'E', ivMin: 'C#m', v: 'F#', vMin: 'D#m', acc: '5 #' },
    { 
      maj: 'Gb', majAlt: 'F#', 
      min: 'Ebm', minAlt: 'D#m', 
      idx: 6, 
      iv: 'Cb', ivAlt: 'B', ivMin: 'Abm', ivMinAlt: 'G#m',
      v: 'Db', vAlt: 'C#', vMin: 'Bbm', vMinAlt: 'A#m',
      acc: '6 b', accAlt: '6 #' 
    },
    { maj: 'Db', min: 'Bbm', idx: 7, iv: 'Gb', ivMin: 'Ebm', v: 'Ab', vMin: 'Fm', acc: '5 b' },
    { maj: 'Ab', min: 'Fm', idx: 8, iv: 'Db', ivMin: 'Bbm', v: 'Eb', vMin: 'Cm', acc: '4 b' },
    { maj: 'Eb', min: 'Cm', idx: 9, iv: 'Ab', ivMin: 'Fm', v: 'Bb', vMin: 'Gm', acc: '3 b' },
    { maj: 'Bb', min: 'Gm', idx: 10, iv: 'Eb', ivMin: 'Cm', v: 'F', vMin: 'Dm', acc: '2 b' },
    { maj: 'F', min: 'Dm', idx: 11, iv: 'Bb', ivMin: 'Gm', v: 'C', vMin: 'Am', acc: '1 b' }
  ];

  const current = CIRCLE_DATA.find(d => d.maj === selectedKey || (d.majAlt && d.majAlt === selectedKey)) || CIRCLE_DATA[0];
  const rotation = -30 * current.idx;
  const isGbFsharp = current.idx === 6;

  return (
    <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
      <div className="flex flex-col items-center">
        <div className="relative w-80 h-80 mb-20 flex items-center justify-center">
          <div 
            className="w-full h-full rounded-full border-4 border-slate-100 dark:border-slate-800 relative transition-transform duration-700" 
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {CIRCLE_DATA.map((k, i) => {
              const isSelected = k.maj === selectedKey || (k.majAlt && k.majAlt === selectedKey);
              const displayName = (k.idx === 6) ? 'Gb/F#' : k.maj;
              const displayMin = (k.idx === 6) ? 'Ebm/D#m' : k.min;
              
              return (
                <div key={i} className="absolute w-full h-full left-0 top-0 pointer-events-none" style={{ transform: `rotate(${30 * i}deg)` }}>
                  <div 
                    onClick={() => { setSelectedKey(k.maj); if(k.idx !== 6) setUseSharps(false); }} 
                    className={`pointer-events-auto cursor-pointer absolute left-1/2 -ml-12 -top-6 w-24 h-24 flex flex-col items-center justify-center transition-all ${isSelected ? 'scale-125 z-20' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center ${isSelected ? 'bg-brand-600 text-white shadow-2xl rotate-[-30deg]' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                      <span className="font-black text-lg leading-none">{displayName}</span>
                      <span className="text-[8px] font-bold opacity-60 mt-1">{displayMin}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 m-auto w-48 h-48 rounded-full border-8 border-slate-50 dark:border-slate-950 pointer-events-none shadow-inner bg-white/5 dark:bg-slate-900/5 backdrop-blur-sm"></div>
          <div className="absolute -top-10 left-1/2 -ml-5 w-10 h-10 text-brand-500 drop-shadow-2xl z-30">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <TheoryCard 
            label="SUBDOMINANTE (IV)" 
            value={(isGbFsharp && useSharps) ? current.ivAlt : current.iv} 
            rel={(isGbFsharp && useSharps) ? current.ivMinAlt : current.ivMin}
          />
          <TheoryCard 
            label="TÓNICA (I)" 
            value={(isGbFsharp && useSharps) ? current.majAlt : current.maj} 
            rel={(isGbFsharp && useSharps) ? current.minAlt : current.min}
            acc={(isGbFsharp && useSharps) ? current.accAlt : current.acc}
            isTonic
            highlight 
          />
          <TheoryCard 
            label="DOMINANTE (V)" 
            value={(isGbFsharp && useSharps) ? current.vAlt : current.v} 
            rel={(isGbFsharp && useSharps) ? current.vMinAlt : current.vMin}
          />
        </div>

        <div className="text-center space-y-6">
          {isGbFsharp && (
            <button onClick={() => setUseSharps(!useSharps)} className="text-sm font-black text-brand-600 underline bg-brand-50 px-4 py-2 rounded-full">
              Ver como {useSharps ? 'Gb' : 'F#'}
            </button>
          )}
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium max-w-xl mx-auto leading-relaxed">
            Usa el Círculo de Quintas para componer progresiones, modular a otras tonalidades o encontrar las notas alteradas de una escala.
          </p>
        </div>
      </div>
    </div>
  );
};

const TheoryCard = ({ label, value, rel, acc, highlight, isTonic }: any) => (
  <div className={`p-10 rounded-[3rem] text-center border transition-all ${
    highlight 
      ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800 shadow-2xl scale-110 z-10' 
      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
  }`}>
    <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${highlight ? 'text-brand-600' : 'text-slate-400'}`}>{label}</div>
    <div className={`text-6xl font-black mb-2 tracking-tighter ${highlight ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-white'}`}>{value}</div>
    <div className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
      {isTonic ? 'Relativa: ' : ''}{rel}
    </div>
    {acc && (
      <div className="inline-block px-4 py-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 font-bold border border-slate-100 dark:border-slate-700 mt-2">
        {acc}
      </div>
    )}
  </div>
);

const ChordAnalyzer = () => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const analyze = () => {
    if (!input.trim()) return;
    const chords = input.toUpperCase().split(/[\s,]+/).filter(c => c);
    setAnalysis({
      key: chords[0] || 'C',
      type: 'Mayor',
      progression: chords.map(c => ({ name: c, degree: '?' }))
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95">
      <h2 className="text-3xl font-black mb-6 dark:text-white tracking-tighter">Analizador Inteligente</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto text-sm font-medium">Escribe una secuencia de acordes para analizar su función armónica.</p>
      
      <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-12">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          placeholder="Ej: G D Em C" 
          className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 dark:text-white font-mono text-xl shadow-inner transition-all"
        />
        <button onClick={analyze} className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-600/20 active:scale-95">Analizar</button>
      </div>

      {analysis ? (
        <div className="bg-slate-50 dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 animate-in fade-in">
           <div className="flex flex-col items-center mb-8">
             <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2">Tonalidad Estimada</span>
             <h4 className="text-5xl font-black dark:text-white">{analysis.key} {analysis.type}</h4>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {analysis.progression.map((p: any, i: number) => (
               <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm">
                 <div className="text-2xl font-black dark:text-white">{p.name}</div>
                 <div className="text-[10px] font-bold text-slate-400 mt-1">Grado {p.degree}</div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="p-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-950 text-slate-300">
          <Icon name="analyze" size={60} className="mx-auto mb-6 opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Introduce acordes para comenzar</p>
        </div>
      )}
    </div>
  );
};

export default TheoryHub;
