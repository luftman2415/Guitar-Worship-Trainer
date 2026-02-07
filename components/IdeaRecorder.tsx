
import React, { useState, useEffect, useRef } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useDialog } from '../App';
import { Icon } from '../constants';
import { getRecordingsFromDB, saveRecordingToDB, deleteRecordingFromDB } from '../services/db';
import { Recording } from '../types';

const IdeaRecorder: React.FC = () => {
  const { resume } = useAudioEngine();
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const dialog = useDialog();

  useEffect(() => {
    loadRecordings();
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const loadRecordings = async () => {
    const recs = await getRecordingsFromDB();
    setRecordings(recs.sort((a: any, b: any) => b.date - a.date));
  };

  const startRecording = async () => {
    await resume();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const id = Date.now();
        await saveRecordingToDB({ id, blob, date: new Date() });
        loadRecordings();
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      dialog.alert({ title: "Error", message: "No se pudo acceder al micrófono." });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  const deleteRec = (id: string | number) => {
    dialog.confirm({
      title: "¿Borrar grabación?",
      message: "Esta acción no se puede deshacer.",
      onConfirm: async () => {
        await deleteRecordingFromDB(id);
        loadRecordings();
      }
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-6 right-8 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-black font-mono tracking-widest text-slate-500 shadow-inner">
          {formatTimer(timer)}
        </div>
        
        <h2 className="text-3xl font-black mb-8 text-slate-800 dark:text-white tracking-tight">Capturador de Ideas</h2>
        
        <div className="flex justify-center mb-10">
          <button 
            onClick={isRecording ? stopRecording : startRecording} 
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 border-[8px] active:scale-95 group ${
              isRecording 
                ? 'bg-rose-600 border-rose-200 animate-pulse scale-105' 
                : 'bg-rose-500 border-rose-50 hover:bg-rose-600'
            }`}
          >
            <Icon name={isRecording ? "stop" : "mic"} size={40} className="text-white group-hover:scale-110 transition-transform" fill={isRecording ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
          {isRecording ? 'GRABANDO...' : 'TOCA PARA CAPTURAR'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Mis Grabaciones ({recordings.length})</h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-4"></div>
        </div>
        
        <div className="space-y-3">
          {recordings.length === 0 && (
            <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
              <Icon name="music" size={32} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-medium">No tienes grabaciones guardadas aún.</p>
            </div>
          )}
          {recordings.map((rec: any) => (
            <div key={rec.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all border border-transparent hover:border-brand-100 dark:hover:border-brand-800">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => playRecording(rec.blob)} 
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl text-brand-600 shadow-sm hover:scale-110 active:scale-95 transition-all"
                >
                  <Icon name="play" size={18} fill="currentColor" />
                </button>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">Idea {new Date(rec.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(rec.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => deleteRec(rec.id)} 
                className="p-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeaRecorder;
