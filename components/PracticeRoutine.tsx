
import React, { useState, useEffect, useRef } from 'react';
import { EXERCISES, Icon } from '../constants';

const PracticeRoutine: React.FC = () => {
  const [view, setView] = useState<'landing' | 'list' | 'timer'>('landing');
  const [routine, setRoutine] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (view === 'timer' && timeLeft > 0 && !isPaused) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [view, timeLeft, isPaused]);

  const generateRoutine = (totalMinutes: number) => {
    const shuffle = [...EXERCISES].sort(() => 0.5 - Math.random());
    const selected = shuffle.slice(0, 3); // 3 random exercises
    const perEx = Math.floor(totalMinutes / 3);
    setRoutine(selected.map(ex => ({ ...ex, duration: perEx })));
    setActiveIndex(0);
    setTimeLeft(perEx * 60);
    setView('timer');
  };

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const nextEx = () => {
    if (activeIndex < routine.length - 1) {
      const ni = activeIndex + 1;
      setActiveIndex(ni);
      setTimeLeft(routine[ni].duration * 60);
    } else {
      setView('landing');
    }
  };

  if (view === 'timer' && routine.length > 0) {
    const ex = routine[activeIndex];
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center animate-in zoom-in-95">
        <button onClick={() => setView('landing')} className="absolute top-8 left-8 p-3 text-slate-400"><Icon name="arrowLeft" size={24}/></button>
        <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] block mb-2">{ex.category}</span>
        <h2 className="text-3xl font-black dark:text-white mb-4 tracking-tighter">{ex.name}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-12 font-medium">{ex.desc}</p>
        
        <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[10px] border-slate-100 dark:border-slate-800"></div>
          <div 
            className="absolute inset-0 rounded-full border-[10px] border-brand-500 transition-all duration-1000" 
            style={{ clipPath: `inset(0 0 ${100 - (timeLeft / (ex.duration * 60) * 100)}% 0)` }}
          ></div>
          <div className="text-7xl font-black font-mono tracking-tighter dark:text-white">{format(timeLeft)}</div>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => setIsPaused(!isPaused)} className="w-20 h-20 rounded-3xl bg-brand-600 text-white flex items-center justify-center shadow-xl">
            <Icon name={isPaused ? "play" : "pause"} size={32} fill="currentColor" />
          </button>
          <button onClick={nextEx} className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <Icon name="repeat" size={32} />
          </button>
        </div>
        <p className="mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paso {activeIndex + 1} de {routine.length}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 p-16 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Icon name="zap" size={48} />
        </div>
        <h2 className="text-5xl font-black mb-4 dark:text-white tracking-tighter">Generador de Rutinas</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-12">Planificamos tu ensayo por ti.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <button onClick={() => generateRoutine(20)} className="bg-brand-600 text-white p-10 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-brand-600/20 active:scale-95 transition-all">20 MINUTOS</button>
          <button onClick={() => generateRoutine(60)} className="bg-slate-900 dark:bg-slate-800 text-white p-10 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">60 MINUTOS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6">Todos los Ejercicios</h3>
        {EXERCISES.map(ex => (
          <div key={ex.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-2 block">{ex.category}</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{ex.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{ex.desc}</p>
            </div>
            <div className="flex items-center gap-6">
               <span className="text-xs font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl">{ex.defaultTime}m</span>
               <button onClick={() => { setRoutine([{...ex, duration: ex.defaultTime}]); setActiveIndex(0); setTimeLeft(ex.defaultTime * 60); setView('timer'); }} className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                 <Icon name="play" size={24} fill="currentColor" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeRoutine;
