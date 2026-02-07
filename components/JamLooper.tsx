
import React, { useState, useRef, useEffect } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useDialog } from '../App';
import { Icon } from '../constants';

const JamLooper: React.FC = () => {
  const { resume, getContext } = useAudioEngine();
  const [status, setStatus] = useState<'idle' | 'recording' | 'looping'>('idle');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dialog = useDialog();

  useEffect(() => {
    return () => {
      stopLoop();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    await resume();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const ctx = getContext();
        try {
          const decodedBuffer = await ctx!.decodeAudioData(arrayBuffer);
          setAudioBuffer(decodedBuffer);
          playLoop(decodedBuffer);
        } catch (e) {
          dialog.alert({ title: "Error", message: "Error al procesar el audio." });
          setStatus('idle');
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (e) {
      dialog.alert({ title: "Sin Acceso", message: "Se requiere micrófono para el Looper." });
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const playLoop = async (bufferToPlay: AudioBuffer) => {
    await resume();
    const ctx = getContext();
    if (!ctx || !bufferToPlay) return;
    
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
    }

    const source = ctx.createBufferSource();
    source.buffer = bufferToPlay;
    source.loop = true;
    source.connect(ctx.destination);
    source.start();
    sourceNodeRef.current = source;
    setStatus('looping');
  };

  const stopLoop = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setStatus('idle');
  };

  const clearLoop = () => {
    dialog.confirm({
      title: "¿Borrar Loop?",
      message: "Esta acción limpiará el audio actual de la memoria.",
      onConfirm: () => {
        stopLoop();
        if (mediaRecorderRef.current && status === 'recording') mediaRecorderRef.current.stop();
        setAudioBuffer(null);
        chunksRef.current = [];
        setStatus('idle');
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-emerald-500/20 text-center animate-in zoom-in-95 duration-300 overflow-hidden">
      <div className="w-24 h-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30">
        <Icon name="repeat" size={48} />
      </div>
      
      <h2 className="text-4xl font-black mb-2 text-slate-800 dark:text-white tracking-tighter">Jam Looper</h2>
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-12 font-black uppercase tracking-widest opacity-60">Control Total. Borrado al instante.</p>

      <div className="flex justify-center mb-16">
        <div className={`w-64 h-64 rounded-full flex items-center justify-center border-[20px] transition-all duration-500 relative ${
          status === 'recording' ? 'border-red-500 bg-red-500/10 animate-pulse' : 
          status === 'looping' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.3)]' : 
          'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
        }`}>
          {status === 'looping' && (
            <div className="absolute inset-[-20px] rounded-full border-[20px] border-emerald-500 border-t-transparent animate-spin duration-[3000ms] pointer-events-none"></div>
          )}
          <button 
            onClick={() => {
              if (status === 'idle' && !audioBuffer) startRecording();
              else if (status === 'recording') stopRecording();
              else if (status === 'idle' && audioBuffer) playLoop(audioBuffer);
              else if (status === 'looping') stopLoop();
            }} 
            className="flex flex-col items-center justify-center w-full h-full z-10 transition-transform active:scale-90"
          >
            {status === 'recording' ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-600 rounded-xl mb-4 shadow-xl"></div>
                <span className="text-xs font-black text-red-600">PARAR</span>
              </div>
            ) : status === 'looping' ? (
              <div className="flex flex-col items-center">
                <Icon name="pause" size={64} className="text-emerald-600 mb-2" fill="currentColor" />
                <span className="text-xs font-black text-emerald-500">PAUSA</span>
              </div>
            ) : audioBuffer ? (
              <div className="flex flex-col items-center">
                <Icon name="play" size={64} className="text-indigo-600 mb-2" fill="currentColor" />
                <span className="text-xs font-black text-indigo-600">PLAY</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Icon name="mic" size={64} className="text-slate-300 dark:text-slate-700 mb-2" />
                <span className="text-xs font-black text-slate-400">REC</span>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {audioBuffer ? (
          <>
            <button 
              onClick={() => { stopLoop(); playLoop(audioBuffer); }} 
              className="flex-1 bg-indigo-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 flex items-center justify-center gap-3"
            >
              <Icon name="repeat" size={20} /> Re-Sync
            </button>
            <button 
              onClick={clearLoop} 
              className="w-24 h-20 rounded-3xl bg-rose-500 text-white font-black flex items-center justify-center shadow-2xl shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all"
            >
              <Icon name="trash" size={32} />
            </button>
          </>
        ) : (
          <div className="w-full py-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Pulsa para grabar tu primer loop</div>
        )}
      </div>
    </div>
  );
};

export default JamLooper;
