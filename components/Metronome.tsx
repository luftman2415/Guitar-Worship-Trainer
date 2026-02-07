
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useDialog } from '../App';
import { Icon } from '../constants';

const Metronome: React.FC = () => {
  const { resume, getContext } = useAudioEngine();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [subdivision, setSubdivision] = useState(1);
  const [visualBeat, setVisualBeat] = useState(false);
  const [trainerEnabled, setTrainerEnabled] = useState(false);
  const [trainerBars, setTrainerBars] = useState(4);
  const [trainerBpmInc, setTrainerBpmInc] = useState(5);
  const [presets, setPresets] = useState<any[]>([]);
  
  const nextNoteTimeRef = useRef(0);
  const timerIDRef = useRef<any>(null);
  const currentNoteRef = useRef(0);
  const currentBarRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);
  
  const bpmRef = useRef(bpm);
  const trainerEnabledRef = useRef(trainerEnabled);
  const barsIncRef = useRef(trainerBars);
  const bpmIncRef = useRef(trainerBpmInc);

  const dialog = useDialog();

  useEffect(() => {
    bpmRef.current = bpm;
    trainerEnabledRef.current = trainerEnabled;
    barsIncRef.current = trainerBars;
    bpmIncRef.current = trainerBpmInc;
  }, [bpm, trainerEnabled, trainerBars, trainerBpmInc]);

  useEffect(() => {
    const savedPresets = localStorage.getItem('gwt_metronome_presets');
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  const playClick = (time: number, type: number) => {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 0) {
      osc.frequency.setValueAtTime(1500, time);
      gain.gain.setValueAtTime(1, time);
    } else if (type === 1) {
      osc.frequency.setValueAtTime(1000, time);
      gain.gain.setValueAtTime(0.7, time);
    } else {
      osc.frequency.setValueAtTime(800, time);
      gain.gain.setValueAtTime(0.3, time);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.05);
  };

  const scheduler = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      const beatIndex = currentNoteRef.current;
      const notesPerMeasure = beatsPerMeasure * subdivision;
      let type = 2; // sub

      if (beatIndex % notesPerMeasure === 0) type = 0; // accent
      else if (beatIndex % subdivision === 0) type = 1; // normal beat

      if (type === 0 && beatIndex > 0) {
        currentBarRef.current++;
        if (trainerEnabledRef.current && currentBarRef.current % barsIncRef.current === 0) {
          const newBpm = Math.min(300, bpmRef.current + bpmIncRef.current);
          bpmRef.current = newBpm;
          setBpm(newBpm);
        }
      }

      playClick(nextNoteTimeRef.current, type);
      
      if (type !== 2) {
        setTimeout(() => {
          setVisualBeat(true);
          setTimeout(() => setVisualBeat(false), 80);
        }, (nextNoteTimeRef.current - ctx.currentTime) * 1000);
      }

      nextNoteTimeRef.current += (60.0 / bpmRef.current) / subdivision;
      currentNoteRef.current++;
    }
    timerIDRef.current = setTimeout(scheduler, 25);
  }, [getContext, beatsPerMeasure, subdivision]);

  const togglePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timerIDRef.current);
    } else {
      const ctx = await resume();
      if (ctx) {
        currentNoteRef.current = 0;
        currentBarRef.current = 0;
        nextNoteTimeRef.current = ctx.currentTime + 0.05;
        setIsPlaying(true);
        scheduler();
      }
    }
  };

  const handleTap = () => {
    const now = Date.now();
    let times = tapTimesRef.current;
    if (times.length > 0 && now - times[times.length - 1] > 2000) times = [];
    times.push(now);
    if (times.length > 4) times.shift();
    tapTimesRef.current = times;
    if (times.length > 1) {
      let intervals = [];
      for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i-1]);
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      const newBpm = Math.round(60000 / avg);
      if (newBpm >= 30 && newBpm <= 300) setBpm(newBpm);
    }
  };

  const deletePreset = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dialog.confirm({
      title: "¿Borrar Preset?",
      message: "Esta acción eliminará la configuración guardada.",
      onConfirm: () => {
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem('gwt_metronome_presets', JSON.stringify(updated));
      }
    });
  };

  const savePreset = () => {
    dialog.prompt({
      title: "Guardar configuración",
      message: "Asigna un nombre a este preset:",
      onConfirm: (name: string) => {
        if (!name) return;
        const newPreset = { id: Date.now(), name, bpm, beatsPerMeasure, subdivision, trainerEnabled, trainerBars, trainerBpmInc };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem('gwt_metronome_presets', JSON.stringify(updated));
      }
    });
  };

  useEffect(() => () => clearTimeout(timerIDRef.current), []);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
      <div className="bg-slate-50 dark:bg-slate-950 p-12 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Metrónomo Maestro</h2>
        
        <div className={`w-44 h-44 rounded-full flex items-center justify-center transition-all relative ${visualBeat ? 'bg-brand-500 scale-110 shadow-[0_0_40px_rgba(79,70,229,0.5)]' : 'bg-white dark:bg-slate-800 shadow-xl shadow-black/5'}`}>
          <div className="text-7xl font-black text-slate-800 dark:text-white font-mono z-10 tracking-tighter transition-colors">
            {bpm}
          </div>
          <div className={`absolute bottom-8 text-[10px] font-black tracking-[0.2em] uppercase ${visualBeat ? 'text-white/80' : 'text-slate-400'}`}>BPM</div>
        </div>
      </div>

      <div className="p-10 space-y-8">
        <div className="flex items-center gap-6">
          <button onClick={() => setBpm(b => Math.max(30, b - 1))} className="w-14 h-14 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all shadow-sm"><Icon name="minus" size={24} /></button>
          <input 
            type="range" 
            min="30" 
            max="250" 
            value={bpm} 
            onChange={(e) => setBpm(Number(e.target.value))} 
            className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-600 shadow-inner" 
          />
          <button onClick={() => setBpm(b => Math.min(300, b + 1))} className="w-14 h-14 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all shadow-sm"><Icon name="plus" size={24} /></button>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={togglePlay} 
            className={`flex-1 py-6 rounded-[2rem] text-white font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
              isPlaying ? 'bg-rose-500 shadow-rose-500/20' : 'bg-brand-600 shadow-brand-500/20'
            }`}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={28} fill="currentColor" />
            <span className="uppercase tracking-widest">{isPlaying ? "STOP" : "START"}</span>
          </button>
          <button onClick={handleTap} className="px-8 py-6 rounded-[2rem] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all shadow-sm border border-slate-200 dark:border-slate-700">Tap</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compás</label>
            <select 
              value={beatsPerMeasure} 
              onChange={(e) => setBeatsPerMeasure(Number(e.target.value))} 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold dark:text-white border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="2">2/4</option>
              <option value="3">3/4</option>
              <option value="4">4/4</option>
              <option value="5">5/4</option>
              <option value="6">6/8</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subdivisión</label>
            <select 
              value={subdivision} 
              onChange={(e) => setSubdivision(Number(e.target.value))} 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold dark:text-white border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="1">Negras</option>
              <option value="2">Corcheas</option>
              <option value="3">Tresillos</option>
              <option value="4">Semicorcheas</option>
            </select>
          </div>
        </div>

        <div className={`p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${trainerEnabled ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Icon name="zap" className={trainerEnabled ? "text-brand-500" : "text-slate-400"} size={22} />
              <span className="font-black text-xs uppercase tracking-widest dark:text-white">Speed Trainer</span>
            </div>
            <button 
              onClick={() => setTrainerEnabled(!trainerEnabled)} 
              className={`w-14 h-7 rounded-full transition-all relative ${trainerEnabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${trainerEnabled ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>
          {trainerEnabled && (
            <div className="flex items-center gap-4 text-sm dark:text-slate-300 animate-in slide-in-from-top-2">
              <span className="font-bold">+</span>
              <input type="number" value={trainerBpmInc} onChange={e => setTrainerBpmInc(Number(e.target.value))} className="w-16 p-2 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold" />
              <span className="font-bold text-[10px] uppercase text-slate-400">BPM cada</span>
              <input type="number" value={trainerBars} onChange={e => setTrainerBars(Number(e.target.value))} className="w-16 p-2 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold" />
              <span className="font-bold text-[10px] uppercase text-slate-400">Comp.</span>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mis Presets</span>
            <button onClick={savePreset} className="text-xs text-brand-600 font-bold hover:underline">Guardar Actual</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {presets.map(p => (
              <div key={p.id} onClick={() => { setBpm(p.bpm); setBeatsPerMeasure(p.beatsPerMeasure); setSubdivision(p.subdivision); setTrainerEnabled(p.trainerEnabled); }} className="flex-shrink-0 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-3xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 group relative border border-slate-100 dark:border-slate-700 transition-all">
                <span className="text-sm font-black dark:text-white block">{p.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.bpm} BPM</span>
                <button 
                  onClick={(e) => deletePreset(p.id, e)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 shadow-lg border border-slate-100 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
            {presets.length === 0 && <span className="text-xs text-slate-400 italic">Sin presets guardados.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metronome;
