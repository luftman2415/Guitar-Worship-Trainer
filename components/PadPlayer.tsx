
import React from 'react';
import { useGlobalAudio } from '../App';
import { Icon, NOTES } from '../constants';

const PadPlayer: React.FC = () => {
  const { padState, setPadState, playPad, togglePad } = useGlobalAudio();

  const handleKeySelect = (key: string) => {
    playPad(key);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-8 mb-16">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-inner">
            <Icon name="layers" size={48} />
          </div>
          <div>
            <h2 className="text-5xl font-black dark:text-white tracking-tighter">Worship Pads</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Ambiente celestial para tus oraciones.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-16">
          {NOTES.map(k => (
            <button 
              key={k} 
              onClick={() => handleKeySelect(k)} 
              className={`py-8 rounded-[2rem] font-black text-2xl transition-all shadow-sm border ${
                padState.activeKey === k && padState.isPlaying 
                  ? 'bg-brand-600 text-white border-brand-500 scale-105 shadow-2xl shadow-brand-500/40 ring-4 ring-brand-500/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 border border-slate-100 dark:border-slate-800 shadow-inner">
          <button 
            onClick={togglePad} 
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 shrink-0 ${
              padState.isPlaying ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-brand-600 text-white shadow-brand-600/30'
            }`}
          >
            <Icon name={padState.isPlaying ? "pause" : "play"} size={40} fill="currentColor" />
          </button>
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nivel de Ambiente</label>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-white">{Math.round(padState.volume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={padState.volume} 
              onChange={(e) => setPadState((p: any) => ({ ...p, volume: parseFloat(e.target.value) }))} 
              className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-600"
            />
          </div>
        </div>
      </div>
      
      <div className="text-center p-10 bg-brand-50/50 dark:bg-brand-900/10 rounded-[3rem] border border-brand-100 dark:border-brand-800/30">
        <p className="text-brand-700 dark:text-brand-300 font-bold leading-relaxed">
          TIP: Los pads nunca se detienen. Puedes salir de esta pantalla y usar el afinador o el cancionero mientras el ambiente sigue sonando.
        </p>
      </div>
    </div>
  );
};

export default PadPlayer;
