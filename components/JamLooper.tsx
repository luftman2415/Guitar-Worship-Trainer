
import React, { useState, useRef } from 'react';
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
  const dialog = useDialog();

  const startRecording = async () => {
    await resume();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } });
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
        }
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (e) {
      dialog.alert({ title: "Acceso Denegado", message: "Se requiere permiso de micrófono." });
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
    
    if (sourceNodeRef.current) sourceNodeRef.current.stop();

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
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setStatus('idle');
  };

  const clearLoop = () => {
    dialog.confirm({
      title: "¿Borrar Loop?",
      message: "Esta acción eliminará el loop actual.",
      onConfirm: () => {
        stopLoop();
        setAudioBuffer(null);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300 overflow-hidden">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
        <Icon name="repeat" size={40} />
      </div>
      
      <h2 className="text-3xl font-black mb-2 text-slate-800 dark:text-white tracking-tight">Jam Looper</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 font-medium">Graba y crea capas instantáneamente.</p>

      <div className="flex justify-center mb-12 relative">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center border-[10px] transition-all duration-300 relative ${
          status === 'recording' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' : 
          status === 'looping' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 
          'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
        }`}>
          {status === 'looping' && (
            <div className="absolute inset-[-10px] rounded-full border-[10px] border-emerald-500 border-t-transparent animate-spin duration-[2000ms] pointer-events-none"></div>
          )}
          <button 
            onClick={() => {
              if (status === 'idle' && !audioBuffer) startRecording();
              else if (status === 'recording') stopRecording();
              else if (status === 'idle' && audioBuffer) playLoop(audioBuffer);
              else if (status === 'looping') stopLoop();
            }} 
            className="flex flex-col items-center justify-center w-full h-full z-10 transition-transform active:scale-95"
          >
            {status === 'recording' ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-6 h-6 bg-red-600 rounded-lg mb-3"></div>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Grabando</span>
              </div>
            ) : status === 'looping' ? (
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-emerald-600 tracking-tighter">ON</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Sincronizado</span>
              </div>
            ) : !audioBuffer ? (
              <div className="flex flex-col items-center">
                <Icon name="mic" size={40} className="text-slate-400 mb-2" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grabar</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Icon name="play" size={40} className="text-emerald-500 ml-1 mb-2" fill="currentColor" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Play Loop</span>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center justify-center">
        {audioBuffer ? (
          <>
            <button 
              onClick={() => { stopLoop(); playLoop(audioBuffer); }} 
              className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Icon name="repeat" size={18} /> Re-Sync
            </button>
            <button 
              onClick={clearLoop} 
              className="px-6 py-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-500 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-800 hover:bg-rose-100 transition-colors"
            >
              <Icon name="trash" size={18} />
            </button>
          </>
        ) : (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Oprime el círculo para crear tu base</p>
        )}
      </div>
    </div>
  );
};

export default JamLooper;
