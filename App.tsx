
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

const AudioContextContext = createContext<any>(null);
export const useGlobalAudio = () => useContext(AudioContextContext);

// Added DialogContext to handle global alerts, confirmations and prompts
const DialogContext = createContext<any>(null);
export const useDialog = () => useContext(DialogContext);

const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [padState, setPadState] = useState({ isPlaying: false, activeKey: null as string | null, volume: 0.4 });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  // Dialog state management
  const [dialogConfig, setDialogConfig] = useState<any>(null);
  const [promptValue, setPromptValue] = useState('');

  const dialog = {
    alert: (cfg: any) => setDialogConfig({ ...cfg, type: 'alert' }),
    confirm: (cfg: any) => setDialogConfig({ ...cfg, type: 'confirm' }),
    prompt: (cfg: any) => {
      setPromptValue('');
      setDialogConfig({ ...cfg, type: 'prompt' });
    }
  };

  const handleDialogConfirm = () => {
    if (dialogConfig?.onConfirm) {
      dialogConfig.onConfirm(dialogConfig.type === 'prompt' ? promptValue : undefined);
    }
    setDialogConfig(null);
  };

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

  return (
    <AudioContextContext.Provider value={{ padState, setPadState, playPad, togglePad, getCtx }}>
      <DialogContext.Provider value={dialog}>
        {children}
        {/* Render global dialog if configuration exists */}
        {dialogConfig && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <h3 className="text-xl font-black mb-2 dark:text-white tracking-tight">{dialogConfig.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">{dialogConfig.message}</p>
              
              {dialogConfig.type === 'prompt' && (
                <input 
                  autoFocus
                  value={promptValue}
                  onChange={e => setPromptValue(e.target.value)}
                  className="w-full p-4 mb-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 dark:text-white font-bold"
                />
              )}
              
              <div className="flex gap-3">
                {dialogConfig.type !== 'alert' && (
                  <button onClick={() => setDialogConfig(null)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
                )}
                <button onClick={handleDialogConfirm} className="flex-1 py-4 rounded-2xl font-black text-white bg-indigo-600 shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-widest">Aceptar</button>
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
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const NavItem = ({ id, icon, label, colorClass }: any) => {
    const isActive = view === id;
    return (
      <button 
        onClick={() => setView(id)} 
        className={`w-full flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? `${colorClass} shadow-xl scale-110` : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        <Icon name={icon} size={24} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </button>
    );
  };

  return (
    <RootProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        {/* Barra Lateral Profesional */}
        <nav className="hidden md:flex fixed left-0 top-0 h-screen w-32 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col py-8 items-center gap-2 z-50 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-brand-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl mb-6 cursor-pointer" onClick={() => setView('home')}>W</div>
          
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-4 mb-2">Vivo</p>
          <NavItem id="tuner" icon="mic" label="Afin" colorClass="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
          <NavItem id="pads" icon="layers" label="Pads" colorClass="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
          <NavItem id="metronome" icon="activity" label="Metr" colorClass="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
          <NavItem id="looper" icon="repeat" label="Loop" colorClass="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
          
          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Lab</p>
          <NavItem id="ear" icon="ear" label="Oído" colorClass="text-pink-500 bg-pink-50 dark:bg-pink-900/20" />
          <NavItem id="recorder" icon="mic" label="Capt" colorClass="text-pink-500 bg-pink-50 dark:bg-pink-900/20" />
          <NavItem id="routine" icon="zap" label="Rut" colorClass="text-pink-500 bg-pink-50 dark:bg-pink-900/20" />
          
          <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Estud</p>
          <NavItem id="scales" icon="grid" label="Esca" colorClass="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
          <NavItem id="analyze" icon="award" label="Teor" colorClass="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
          <NavItem id="tracks" icon="music" label="Pist" colorClass="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
          
          <button onClick={() => setDarkMode(!darkMode)} className="mt-auto p-4 text-slate-400 hover:text-indigo-500 transition-colors">
            <Icon name={darkMode ? "sun" : "moon"} size={20} />
          </button>
        </nav>

        <main className="flex-1 md:ml-32 p-6 md:p-12 pb-32 animate-fade-in">
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
        <nav className="md:hidden fixed bottom-0 left-0 w-full glass-nav border-t border-slate-200 dark:border-slate-800 p-2 flex justify-around z-50">
          <NavItem id="home" icon="home" label="Inic" colorClass="text-indigo-500" />
          <NavItem id="tuner" icon="mic" label="Afin" colorClass="text-indigo-500" />
          <NavItem id="pads" icon="layers" label="Pads" colorClass="text-indigo-500" />
          <NavItem id="tracks" icon="music" label="Pist" colorClass="text-emerald-500" />
          <NavItem id="scales" icon="grid" label="Esca" colorClass="text-emerald-500" />
        </nav>
      </div>
    </RootProvider>
  );
};

const Home = ({ setView }: any) => (
  <div className="space-y-16 max-w-7xl mx-auto">
    <header className="text-center space-y-6">
      <div className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl">Worship Guitar Academy</div>
      <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">Guitar <span className="text-indigo-600">Coach</span></h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-xs max-w-xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-6">Tu plataforma de entrenamiento para el ministerio</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <SectionGroup title="PERFORMANCE" subtitle="Vivo y Sonido" color="indigo">
        <FeatureCard title="Afinador Pro" desc="Cromático de precisión" icon="mic" color="indigo" onClick={() => setView('tuner')} />
        <FeatureCard title="Worship Pads" desc="Ambiente espiritual" icon="layers" color="indigo" onClick={() => setView('pads')} />
        <FeatureCard title="Jam Looper" desc="Crea tus bases" icon="repeat" color="indigo" onClick={() => setView('looper')} />
        <FeatureCard title="Metrónomo" desc="Tempo maestro" icon="activity" color="indigo" onClick={() => setView('metronome')} />
      </SectionGroup>

      <SectionGroup title="ENTRENAMIENTO" subtitle="Oído y Técnica" color="pink">
        <FeatureCard title="Ear Trainer" desc="Quiz de intervalos" icon="ear" color="pink" onClick={() => setView('ear')} />
        <FeatureCard title="Capturador" desc="Graba tus ideas" icon="mic" color="pink" onClick={() => setView('recorder')} />
        <FeatureCard title="Rutinas" desc="Ensayo guiado" icon="zap" color="pink" onClick={() => setView('routine')} />
      </SectionGroup>

      <SectionGroup title="ESTUDIO" subtitle="Teoría y Repertorio" color="emerald">
        <FeatureCard title="Escalas Pro" desc="Mástil e intervalos" icon="grid" color="emerald" onClick={() => setView('scales')} />
        <FeatureCard title="Teoría Hub" desc="Campo armónico" icon="award" color="emerald" onClick={() => setView('analyze')} />
        <FeatureCard title="Cancionero" desc="7 Pistas de clase" icon="music" color="emerald" onClick={() => setView('tracks')} />
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

const FeatureCard = ({ title, desc, icon, color, onClick }: any) => {
  const colorMap: any = {
    indigo: 'hover:border-indigo-500 hover:ring-indigo-500/10 bg-indigo-500/5 text-indigo-600',
    pink: 'hover:border-pink-500 hover:ring-pink-500/10 bg-pink-500/5 text-pink-600',
    emerald: 'hover:border-emerald-500 hover:ring-emerald-500/10 bg-emerald-500/5 text-emerald-600'
  };

  return (
    <div onClick={onClick} className={`group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl cursor-pointer hover:translate-y-[-4px] transition-all relative overflow-hidden ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
      <div className="flex items-center gap-6 relative z-10">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-lg ${colorMap[color].split(' ')[2]} ${colorMap[color].split(' ')[3]} group-hover:scale-110 group-hover:bg-current group-hover:text-white`}>
          <Icon name={icon} />
        </div>
        <div>
          <h3 className="text-xl font-black dark:text-white mb-1 tracking-tighter">{title}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300">{desc}</p>
        </div>
      </div>
      <div className={`absolute -bottom-12 -right-12 w-32 h-32 opacity-5 rounded-full scale-150 group-hover:scale-[4] transition-transform duration-700 bg-current`}></div>
    </div>
  );
};

export default App;
