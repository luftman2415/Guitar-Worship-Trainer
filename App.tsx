
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { AppView, PracticeStats, ChordData, Song } from './types';
import { Icon } from './constants';
import Tuner from './components/Tuner';
import Metronome from './components/Metronome';
import ScaleStudio from './components/ScaleStudio';
import PadPlayer from './components/PadPlayer';
import TrackTrainer from './components/TrackTrainer';
import IdeaRecorder from './components/IdeaRecorder';
import JamLooper from './components/JamLooper';
import EarTrainer from './components/EarTrainer';
import TheoryHub from './components/TheoryHub';
import PracticeRoutine from './components/PracticeRoutine';

// --- PERSISTENT AUDIO ENGINE CONTEXT ---
const AudioContextContext = createContext<any>(null);
export const useGlobalAudio = () => useContext(AudioContextContext);

// --- DIALOG SYSTEM ---
const DialogContext = createContext<any>(null);
export const useDialog = () => useContext(DialogContext);

const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<any>({ isOpen: false, title: '', message: '' });
  const [padState, setPadState] = useState({ isPlaying: false, activeKey: null as string | null, volume: 0.4 });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0;
      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    }
    return audioCtxRef.current;
  }, []);

  const stopPads = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    oscillatorsRef.current.forEach(({ osc, gain }) => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => { try { osc.stop(); } catch(e) {} }, 500);
    });
    oscillatorsRef.current = [];
  }, []);

  const playPad = useCallback((key: string) => {
    const ctx = getCtx();
    if (!ctx || !masterGainRef.current) return;
    stopPads();
    const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootIdx = NOTES.indexOf(key);
    const baseFreq = 130.81 * Math.pow(2, rootIdx / 12);
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = i === 2 ? 'sine' : 'sawtooth';
      osc.frequency.value = freq;
      filter.type = 'lowpass'; filter.frequency.value = 600;
      osc.connect(filter); filter.connect(oscGain); oscGain.connect(masterGainRef.current!);
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.15 / (i + 1), ctx.currentTime + 1.5);
      osc.start();
      oscillatorsRef.current.push({ osc, gain: oscGain });
    });
    setPadState(prev => ({ ...prev, isPlaying: true, activeKey: key }));
  }, [getCtx, stopPads]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(padState.isPlaying ? padState.volume : 0, audioCtxRef.current.currentTime, 0.1);
    }
  }, [padState.volume, padState.isPlaying]);

  const togglePad = useCallback(async () => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    if (padState.isPlaying) { stopPads(); setPadState(prev => ({ ...prev, isPlaying: false })); }
    else if (padState.activeKey) { playPad(padState.activeKey); }
  }, [getCtx, padState.isPlaying, padState.activeKey, playPad, stopPads]);

  const closeDialog = () => setDialog({ isOpen: false });
  const dialogUtils = {
    confirm: (p: any) => setDialog({ isOpen: true, title: p.title, message: p.message, onConfirm: () => { p.onConfirm(); closeDialog(); } }),
    alert: (p: any) => setDialog({ isOpen: true, title: p.title, message: p.message, onConfirm: () => closeDialog() }),
    prompt: (p: any) => setDialog({ isOpen: true, title: p.title, message: p.message, promptMode: true, onConfirm: (val: any) => { p.onConfirm(val); closeDialog(); } })
  };

  return (
    <AudioContextContext.Provider value={{ padState, setPadState, playPad, togglePad, getCtx }}>
      <DialogContext.Provider value={dialogUtils}>
        {children}
        {dialog.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black mb-2 dark:text-white">{dialog.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">{dialog.message}</p>
              {dialog.promptMode && <input id="promptInput" autoFocus className="w-full p-4 mb-6 bg-slate-50 dark:bg-slate-700 rounded-2xl dark:text-white border outline-none font-bold" />}
              <div className="flex gap-3">
                <button onClick={closeDialog} className="flex-1 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold">Cancelar</button>
                <button onClick={() => dialog.onConfirm?.((document.getElementById('promptInput') as any)?.value)} className="flex-1 px-5 py-3 rounded-xl bg-brand-600 text-white font-black">Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </DialogContext.Provider>
    </AudioContextContext.Provider>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const savedDark = localStorage.getItem('gwt_darkMode');
    if (savedDark === 'true') setDarkMode(true);
    const handleUpdate = () => setUpdateTrigger(p => p + 1);
    window.addEventListener('gwt-stats-updated', handleUpdate);
    return () => window.removeEventListener('gwt-stats-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('gwt_darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <RootProvider>
      <AppContent view={view} setView={setView} darkMode={darkMode} setDarkMode={setDarkMode} updateTrigger={updateTrigger} />
    </RootProvider>
  );
};

const AppContent = ({ view, setView, darkMode, setDarkMode, updateTrigger }: any) => {
  const { padState } = useGlobalAudio();
  
  const NavItem = ({ id, icon, label }: { id: AppView, icon: string, label: string }) => {
    const isActive = view === id;
    return (
      <button 
        onClick={() => setView(id)} 
        className={`flex-shrink-0 min-w-[4.8rem] flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
          isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-brand-100 dark:bg-brand-900/30 scale-110' : ''}`}>
          <Icon name={icon} size={24} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-24 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-50">
        <div className="flex justify-center w-full py-8"><div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">GW</div></div>
        <div className="flex-1 overflow-y-auto w-full px-2 flex flex-col items-center gap-4 no-scrollbar">
          <NavItem id="home" icon="home" label="Inic" />
          <NavItem id="tuner" icon="mic" label="Afin" />
          <NavItem id="tracks" icon="music" label="Pist" />
          <NavItem id="metronome" icon="activity" label="Temp" />
          <NavItem id="pads" icon="layers" label="Pads" />
          <NavItem id="looper" icon="repeat" label="Loop" />
          <NavItem id="recorder" icon="mic" label="Idea" />
          <NavItem id="routine" icon="zap" label="Ruti" />
          <NavItem id="scales" icon="grid" label="Esca" />
          <NavItem id="ear" icon="ear" label="Oido" />
          <NavItem id="analyze" icon="analyze" label="Teor" />
        </div>
        <div className="py-8 flex flex-col items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl transition-all border border-slate-100 dark:border-slate-700">
            <Icon name={darkMode ? "sun" : "moon"} size={22} />
          </button>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar safe-area-pb">
        <NavItem id="home" icon="home" label="Inicio" />
        <NavItem id="tuner" icon="mic" label="Afinar" />
        <NavItem id="tracks" icon="music" label="Pistas" />
        <NavItem id="metronome" icon="activity" label="Tempo" />
        <NavItem id="pads" icon="layers" label="Pads" />
        <NavItem id="looper" icon="repeat" label="Loop" />
        <NavItem id="recorder" icon="mic" label="Ideas" />
        <NavItem id="routine" icon="zap" label="Rutinas" />
        <NavItem id="scales" icon="grid" label="Escalas" />
        <NavItem id="ear" icon="ear" label="Oído" />
        <NavItem id="analyze" icon="analyze" label="Teoría" />
      </nav>

      <main className="flex-1 md:ml-24 p-4 md:p-12 pb-32 md:pb-12 max-w-6xl mx-auto w-full">
        {padState.isPlaying && view !== 'pads' && (
          <div onClick={() => setView('pads')} className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-[100] cursor-pointer">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl shadow-2xl flex items-center justify-center text-white ring-4 ring-brand-500/20 animate-pulse">
              <Icon name="layers" size={24} />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-[10px] font-black px-2 py-1 rounded-full">{padState.activeKey}</span>
            </div>
          </div>
        )}
        <div className="animate-in fade-in duration-500">
          <ViewSwitcher view={view} setView={setView} updateTrigger={updateTrigger} />
        </div>
      </main>

      <footer className="hidden md:block md:ml-24 py-12 text-center border-t border-slate-100 dark:border-slate-900">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Copyright © 2025 LUFTMANDMAURICIO</p>
      </footer>
    </div>
  );
};

const ViewSwitcher = ({ view, setView, updateTrigger }: any) => {
  switch (view) {
    case 'home': return <Home updateTrigger={updateTrigger} setView={setView} />;
    case 'tuner': return <Tuner />;
    case 'tracks': return <TrackTrainer />;
    case 'metronome': return <Metronome />;
    case 'pads': return <PadPlayer />;
    case 'looper': return <JamLooper />;
    case 'recorder': return <IdeaRecorder />;
    case 'routine': return <PracticeRoutine />;
    case 'scales': return <ScaleStudio />;
    case 'ear': return <EarTrainer />;
    case 'analyze': return <TheoryHub />;
    default: return <Home updateTrigger={updateTrigger} setView={setView} />;
  }
};

const Home = ({ updateTrigger, setView }: any) => {
  const [stats, setStats] = useState<PracticeStats>({ streak: 0, totalMinutes: 0, lastDate: null });
  useEffect(() => {
    const raw = localStorage.getItem('gwt_stats');
    if (raw) setStats(JSON.parse(raw));
  }, [updateTrigger]);

  return (
    <div className="space-y-12 py-8">
      <section className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-800 dark:text-white">Guitar <span className="text-brand-600">Worship</span> Trainer</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium">Estudio local profesional para guitarristas de alabanza.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-8 transition-all hover:scale-105">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-3xl flex items-center justify-center shrink-0"><Icon name="award" size={40} /></div>
          <div><div className="text-5xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{stats.streak}</div><div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Días racha</div></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-8 transition-all hover:scale-105">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-3xl flex items-center justify-center shrink-0"><Icon name="clock" size={40} /></div>
          <div><div className="text-5xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{stats.totalMinutes.toFixed(1)}</div><div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Minutos Totales</div></div>
        </div>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: HERRAMIENTAS */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-4"><h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Herramientas</h2><div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard id="tuner" icon="mic" title="Afinador" desc="Precisión cromática local." gradient="from-indigo-500 to-indigo-700" onClick={() => setView('tuner')} />
            <FeatureCard id="tracks" icon="music" title="Pistas y Canciones" desc="Gestiona tus pistas y letras." gradient="from-brand-500 to-brand-700" onClick={() => setView('tracks')} />
            <FeatureCard id="metronome" icon="activity" title="Metrónomo" desc="Velocidad y ritmos Pro." gradient="from-rose-500 to-rose-700" onClick={() => setView('metronome')} />
            <FeatureCard id="pads" icon="layers" title="Worship Pads" desc="Ambientes envolventes persistentes." gradient="from-sky-500 to-sky-700" onClick={() => setView('pads')} />
            <FeatureCard id="looper" icon="repeat" title="Looper" desc="Graba y sincroniza al instante." gradient="from-emerald-500 to-emerald-700" onClick={() => setView('looper')} />
            <FeatureCard id="recorder" icon="mic" title="Grabadora de Ideas y Riffs" desc="Captura tus creaciones localmente." gradient="from-red-500 to-rose-600" onClick={() => setView('recorder')} />
          </div>
        </div>

        {/* SECTION 2: ENTRENAMIENTO */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-4"><h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Entrenamiento</h2><div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard id="routine" icon="zap" title="Rutinas" desc="Entrenamiento personalizado." gradient="from-amber-500 to-orange-600" onClick={() => setView('routine')} />
            <FeatureCard id="scales" icon="grid" title="Escalas" desc="Mástil y teoría completa." gradient="from-amber-500 to-amber-700" onClick={() => setView('scales')} />
            <FeatureCard id="ear" icon="ear" title="Oído" desc="Entrenador auditivo avanzado." gradient="from-fuchsia-500 to-pink-600" onClick={() => setView('ear')} />
          </div>
        </div>

        {/* SECTION 3: CONOCIMIENTO */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-4"><h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Conocimiento</h2><div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard id="analyze" icon="analyze" title="Teoría" desc="Círculo de quintas y análisis." gradient="from-violet-500 to-fuchsia-600" onClick={() => setView('analyze')} />
          </div>
        </div>
      </div>
      
      <div className="md:hidden py-12 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Copyright © 2025 LUFTMANDMAURICIO</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, gradient, onClick }: any) => (
  <div onClick={onClick} className={`group relative overflow-hidden p-10 rounded-[3rem] shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
    <div className="relative z-10 text-white">
      <div className="mb-6 bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md"><Icon name={icon} size={28} /></div>
      <h3 className="text-2xl font-black mb-2 tracking-tight">{title}</h3>
      <p className="text-white/70 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default App;
