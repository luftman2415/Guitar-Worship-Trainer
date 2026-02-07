
import React, { useState, useEffect, useRef } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { Icon, NOTES } from '../constants';

const Tuner: React.FC = () => {
  const { resume, getContext } = useAudioEngine();
  const [isActive, setIsActive] = useState(false);
  const [note, setNote] = useState('--');
  const [cents, setCents] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / size) < 0.01) return -1; // Sensibility threshold

    let r1 = 0, r2 = size - 1, thres = 0.2;
    for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }

    const buf2 = buf.slice(r1, r2);
    size = buf2.length;
    const c = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] = c[i] + buf2[j] * buf2[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    
    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const updatePitch = () => {
    const ctx = getContext();
    if (!analyserRef.current || !ctx) return;
    const buf = new Float32Array(2048);
    analyserRef.current.getFloatTimeDomainData(buf);
    const ac = autoCorrelate(buf, ctx.sampleRate);
    
    if (ac !== -1) {
      const noteNum = 12 * (Math.log(ac / 440) / Math.log(2));
      const noteRaw = Math.round(noteNum) + 69;
      setNote(NOTES[noteRaw % 12]);
      setCents(Math.floor(1200 * Math.log2(ac / (440 * Math.pow(2, (noteRaw - 69) / 12)))));
    }
    rafRef.current = requestAnimationFrame(updatePitch);
  };

  const toggleTuner = async () => {
    if (isActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setIsActive(false);
      setNote('--');
      setCents(0);
    } else {
      setErrorMsg(null);
      await resume();
      const ctx = getContext();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
        streamRef.current = stream;
        const source = ctx!.createMediaStreamSource(stream);
        const analyser = ctx!.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;
        setIsActive(true);
        updatePitch();
      } catch (err) {
        setErrorMsg("Permiso de micrófono denegado.");
      }
    }
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }, []);

  const isInTune = isActive && note !== '--' && Math.abs(cents) < 5;
  const colorClass = !isActive ? 'text-slate-200 dark:text-slate-800' : isInTune ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-amber-500';

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-black mb-8 dark:text-white uppercase tracking-widest text-slate-400">Afinador</h2>
        
        {errorMsg && <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800">{errorMsg}</div>}

        <div className="relative w-72 h-72 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[10px] border-slate-50 dark:border-slate-800/50"></div>
          {isActive && (
            <div 
              className={`absolute top-0 left-1/2 w-1.5 h-12 -ml-0.75 rounded-full origin-bottom transition-all duration-75 ${isInTune ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ transform: `rotate(${cents * 1.5}deg) translateY(-118px)` }}
            />
          )}
          <div className="flex flex-col items-center">
            <span className={`text-9xl font-black ${colorClass} transition-colors duration-200 select-none tracking-tighter`}>{note}</span>
            <div className="h-6 flex items-center justify-center mt-2">
               <span className="text-slate-400 font-mono text-sm font-bold tracking-widest">
                {isActive ? (note !== '--' ? `${cents > 0 ? '+' : ''}${cents}` : 'Escuchando...') : 'Oprima abajo'}
               </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full mb-10 overflow-hidden relative shadow-inner">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-700 z-10"></div>
          {isActive && note !== '--' && (
            <div 
              className={`h-full transition-all duration-75 ${isInTune ? 'bg-emerald-500' : 'bg-amber-500 shadow-lg shadow-amber-500/50'}`} 
              style={{ 
                width: '12%', 
                position: 'absolute', 
                left: `calc(50% + ${Math.max(-45, Math.min(45, cents))}%)`, 
                transform: 'translateX(-50%)',
                borderRadius: '99px'
              }}
            ></div>
          )}
        </div>

        <button 
          onClick={toggleTuner} 
          className={`flex items-center gap-4 px-10 py-5 rounded-[1.5rem] font-black text-white transition-all w-full justify-center shadow-2xl active:scale-95 group ${
            isActive ? 'bg-rose-500 shadow-rose-500/20' : 'bg-brand-600 shadow-brand-600/20'
          }`}
        >
          <Icon name={isActive ? "micOff" : "mic"} size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="uppercase tracking-widest">{isActive ? "Detener" : "Activar Afinador"}</span>
        </button>
      </div>
    </div>
  );
};

export default Tuner;
