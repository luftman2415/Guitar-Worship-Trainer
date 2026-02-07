
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { AppView } from './types.ts';
import { Icon } from './constants.tsx';
import Tuner from './components/Tuner.tsx';
import Metronome from './components/Metronome.tsx';
import ScaleStudio from './components/ScaleStudio.tsx';
import PadPlayer from './components/PadPlayer.tsx';
import TrackTrainer from './components/TrackTrainer.tsx';
import IdeaRecorder from './components/IdeaRecorder.tsx';
import JamLooper from './components/JamLooper.tsx';
import EarTrainer from './components/EarTrainer.tsx';
import TheoryHub from './components/TheoryHub.tsx';
import PracticeRoutine from './components/PracticeRoutine.tsx';

export const useDialog = () => ({
  alert: (args: { title: string; message: string }) => window.alert(`${args.title}\n\n${args.message}`),
  confirm: (args: { title: string; message: string; onConfirm: () => void }) => {
    if (window.confirm(`${args.title}\n\n${args.message}`)) args.onConfirm();
  },
  prompt: (args: { title: string; message: string; onConfirm: (val: string) => void }) => {
    const res = window.prompt(`${args.title}\n\n${args.message}`);
    if (res !== null) args.onConfirm(res);
  }
});

const AudioContextContext = createContext<any>(null);
export const useGlobalAudio = () => useContext(AudioContextContext);

const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    const rootIdx = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(key);
    const baseFreq = 130.81 * Math.pow(2, rootIdx / 12);
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = i === 2 ? 'sine' : 'sawtooth';
      osc.frequency.value = freq;
      osc.connect(oscGain); oscGain.connect(masterGainRef.current!);
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.1 / (i + 1), ctx.currentTime + 1.5);
      osc.start();
      oscillatorsRef.current.push({ osc, gain: oscGain });
    });
    setPadState(prev => ({ ...prev, isPlaying: true, activeKey: key }));
  }, [getCtx, stopPads]);

  const togglePad = useCallback(() => {
    if (padState.isPlaying) {
      stopPads();
      setPadState(prev => ({ ...prev, isPlaying: false }));
    } else if (padState.activeKey) {
      playPad(padState.activeKey);
    }
  }, [padState.isPlaying, padState.activeKey, stopPads, playPad]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(padState.isPlaying ? padState.volume : 0, audioCtxRef.current.currentTime, 0.1);
    }
  }, [padState.volume, padState.isPlaying]);

  return (
    <AudioContextContext.Provider value={{ padState, setPadState, playPad, togglePad, getCtx }}>
      {children}
    </AudioContextContext.Provider>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const NavItem = ({ id, icon, label, activeColor = 'performance' }: any) => {
    const isActive = view === id;
    const colors: Record<string, string> = {
      performance: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-indigo-500/20',
      training: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-pink-500/20',
      study: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-500/20'
    };

    return (
      <button 
        onClick={() => setView(id)} 
        className={`w-full flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? `${colors[activeColor]} shadow-lg ring-1 scale-105` : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        <Icon name={icon} size={24} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </button>
    );
  };

  return (
    <RootProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        {/* Barra Lateral Pro */}
        <nav className="hidden md:flex fixed left-0 top-0 h-screen w-32 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col py-8 items-center gap-2 z-50 overflow-y-auto no-scrollbar shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl mb-6 cursor-pointer hover:rotate-6 transition-transform" onClick={() => setView('home')}>G</div>
          
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-4 mb-1">Live</p>
          <NavItem id="tuner" icon="mic" label="Afin" activeColor="performance" />
          <NavItem id="pads" icon="layers" label="Pads" activeColor="performance" />
          <NavItem id="metronome" icon="activity" label="Metr" activeColor="performance" />
          <NavItem id="looper" icon="repeat" label="Loop" activeColor="performance" />
          
          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Lab</p>
          <NavItem id="ear" icon="ear" label="Oído" activeColor="training" />
          <NavItem id="recorder" icon="mic" label="Capt" activeColor="training" />
          <NavItem id="routine" icon="zap" label="Rut" activeColor="training" />
          
          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Study</p>
          <NavItem id="scales" icon="grid" label="Esca" activeColor="study" />
          <NavItem id="analyze" icon="award" label="Teor" activeColor="study" />
          <NavItem id="tracks" icon="music" label="Pist" activeColor="study" />
          
          <button onClick={() => setDarkMode(!darkMode)} className="mt-auto p-4 text-slate-400 hover:text-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <Icon name={darkMode ? "sun" : "moon"} size={20} />
          </button>
        </nav>

        <main className="flex-1 md:ml-32 p-6 md:p-12 pb-32">
          {view === 'home' && <Home setView={setView} />}
          {view === 'tuner' && <Tuner />}
          {view === 'tracks' && <TrackTrainer />}
          {view === 'metronome' && <Metronome />}
          {view === 'pads' && <PadPlayer />}
          {view === 'looper' && <JamLooper />}
          {view === 'recorder' && <IdeaRecorder />}
          {view === 'routine' && <PracticeRoutine />}
          {view === 'scales' && <ScaleStudio />}
          {view === 'ear' && <EarTrainer />}
          {view === 'analyze' && <TheoryHub />}
        </main>

        {/* Móvil Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full glass-nav border-t border-slate-200 dark:border-slate-800 p-2 flex justify-around z-50 overflow-x-auto no-scrollbar shadow-2xl">
          <NavItem id="home" icon="home" label="Inic" />
          <NavItem id="tuner" icon="mic" label="Afin" />
          <NavItem id="pads" icon="layers" label="Pads" />
          <NavItem id="tracks" icon="music" label="Pist" />
          <NavItem id="scales" icon="grid" label="Esca" />
        </nav>
      </div>
    </RootProvider>
  );
};

const Home = ({ setView }: any) => (
  <div className="space-y-16 animate-in fade-in duration-1000 max-w-7xl mx-auto">
    <header className="text-center space-y-6">
      <div className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] mb-4 shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">Worship Studio Pro</div>
      <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">Guitar <span className="text-indigo-600 drop-shadow-2xl">Coach</span></h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-xs max-w-xl mx-auto leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-6">Tu centro de entrenamiento definitivo para el ministerio</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <SectionGroup title="PERFORMANCE" subtitle="Manejo de Sonido y Tiempo" color="indigo">
        <FeatureCard title="Afinador Pro" desc="Precisión Cromática" icon="mic" color="indigo" onClick={() => setView('tuner')} />
        <FeatureCard title="Worship Pads" desc="Ambiente Celestial" icon="layers" color="violet" onClick={() => setView('pads')} />
        <FeatureCard title="Jam Looper" desc="Borrado Instantáneo" icon="repeat" color="emerald" onClick={() => setView('looper')} />
        <FeatureCard title="Metrónomo" desc="Beat Maestro" icon="activity" color="rose" onClick={() => setView('metronome')} />
      </SectionGroup>

      <SectionGroup title="ENTRENAMIENTO" subtitle="Oído y Creatividad" color="pink">
        <FeatureCard title="Ear Trainer" desc="Quiz de Intervalos" icon="ear" color="fuchsia" onClick={() => setView('ear')} />
        <FeatureCard title="Capturador" desc="Graba tus Ideas" icon="mic" color="slate" onClick={() => setView('recorder')} />
        <FeatureCard title="Rutinas" desc="Ensayo Guiado" icon="zap" color="amber" onClick={() => setView('routine')} />
      </SectionGroup>

      <SectionGroup title="ESTUDIO" subtitle="Teoría y Repertorio Real" color="emerald">
        <FeatureCard title="Escalas Pro" desc="Mástil e Intervalos" icon="grid" color="brand" onClick={() => setView('scales')} />
        <FeatureCard title="Teoría Hub" desc="Campo Armónico" icon="award" color="orange" onClick={() => setView('analyze')} />
        <FeatureCard title="Cancionero" desc="7 Pistas de Clase" icon="music" color="sky" onClick={() => setView('tracks')} />
      </SectionGroup>
    </div>
  </div>
);

const SectionGroup = ({ title, subtitle, children, color }: any) => (
  <section className="space-y-6">
    <div className={`px-4 border-l-8 border-${color}-500 rounded-sm`}>
      <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.3em]">{title}</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </section>
);

const FeatureCard = ({ title, desc, icon, color, onClick }: any) => (
  <div onClick={onClick} className={`group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl cursor-pointer hover:border-${color}-500 hover:ring-8 hover:ring-${color}-500/5 hover:translate-y-[-4px] transition-all relative overflow-hidden`}>
    <div className="flex items-center gap-6 relative z-10">
      <div className={`w-16 h-16 bg-${color}-500/10 text-${color}-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-${color}-500 group-hover:text-white transition-all shadow-xl`}>
        <Icon name={icon} />
      </div>
      <div>
        <h3 className="text-xl font-black dark:text-white mb-1 tracking-tighter">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300">{desc}</p>
      </div>
    </div>
    <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-${color}-500/5 rounded-full scale-150 group-hover:scale-[4] transition-transform duration-700`}></div>
  </div>
);

export default App;
