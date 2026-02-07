
import React, { useState, useEffect, useRef } from 'react';
import { Song, ChordData } from '../types';
import { TEACHER_TRACKS, Icon } from '../constants';
import { useDialog } from '../App';
import { saveRecordingToDB, getRecordingById, deleteRecordingFromDB } from '../services/db';
import ChordDisplay from './ChordDisplay';
import ChordBuilder from './ChordBuilder';

const TrackTrainer: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor' | 'player'>('list');
  const [activeTab, setActiveTab] = useState<'official' | 'mine'>('official');
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('gwt_songs');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const dialog = useDialog();

  useEffect(() => {
    localStorage.setItem('gwt_songs', JSON.stringify(songs));
  }, [songs]);

  const saveSong = async (songData: Song, audioFile: File | null) => {
    let savedSong = { ...songData };
    if (!savedSong.id) savedSong.id = Date.now();
    
    if (audioFile) {
      savedSong.hasAudio = true;
      await saveRecordingToDB({ 
        id: `song_${savedSong.id}_audio`, 
        blob: audioFile, 
        date: new Date() 
      });
    }

    if (songData.id) {
      setSongs(songs.map(s => s.id === savedSong.id ? savedSong : s));
    } else {
      setSongs([...songs, savedSong]);
    }
    setView('list');
  };

  const deleteSong = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    dialog.confirm({
      title: "¿Eliminar canción?",
      message: "Se borrará la letra, acordes y el audio permanentemente.",
      onConfirm: async () => {
        setSongs(songs.filter(s => s.id !== id));
        await deleteRecordingFromDB(`song_${id}_audio`);
      }
    });
  };

  if (view === 'editor') return (
    <SongEditor 
      song={currentSong || {} as Song} 
      onSave={saveSong} 
      onCancel={() => setView('list')} 
    />
  );
  
  if (view === 'player' && currentSong) return (
    <TrackPlayer 
      song={currentSong} 
      onBack={() => setView('list')} 
      onEdit={() => setView('editor')} 
    />
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-center p-2 bg-slate-100 dark:bg-slate-900 rounded-[2rem] w-fit mx-auto border border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab('official')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'official' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-md' : 'text-slate-400'}`}>Repertorio Clases</button>
        <button onClick={() => setActiveTab('mine')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'mine' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-md' : 'text-slate-400'}`}>Mis Canciones</button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{activeTab === 'official' ? 'Pistas Clase' : 'Mi Biblioteca'}</h2>
          {activeTab === 'mine' && (
            <button onClick={() => { setCurrentSong({} as Song); setView('editor'); }} className="bg-brand-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 active:scale-95"><Icon name="plus" size={24} /></button>
          )}
        </div>

        <div className="space-y-4">
          {(activeTab === 'official' ? TEACHER_TRACKS : songs).map((song) => (
            <div 
              key={song.id} 
              onClick={() => { setCurrentSong(song); setView('player'); }}
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 group cursor-pointer hover:border-brand-500 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner group-hover:text-brand-500">
                  <Icon name="music" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{song.title}</h3>
                  <p className="text-xs font-bold text-brand-500 uppercase tracking-widest">{song.artist}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!song.isTeacher && (
                   <button onClick={(e) => deleteSong(song.id, e)} className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="trash" size={20} /></button>
                )}
                <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                  <Icon name="play" size={20} fill="currentColor" />
                </div>
              </div>
            </div>
          ))}
          {activeTab === 'mine' && songs.length === 0 && (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <Icon name="music" size={48} className="mx-auto text-slate-200 mb-6" />
              <p className="text-slate-400 font-bold text-sm">No tienes canciones. Pulsa el botón + para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SongEditor = ({ song, onSave, onCancel }: any) => {
  const [title, setTitle] = useState(song.title || '');
  const [artist, setArtist] = useState(song.artist || '');
  const [body, setBody] = useState(song.body || '');
  const [key, setKey] = useState(song.key || '');
  const [bpm, setBpm] = useState(song.bpm || '');
  const [customChords, setCustomChords] = useState<ChordData[]>(song.customChords || []);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const getLibrary = () => {
    const raw = localStorage.getItem('gwt_chord_library');
    return raw ? JSON.parse(raw) : [];
  };

  const handleChordSave = (chord: ChordData, global: boolean) => {
    setCustomChords([...customChords, chord]);
    if (global) {
      const lib = getLibrary();
      lib.push({ ...chord, id: Date.now() });
      localStorage.setItem('gwt_chord_library', JSON.stringify(lib));
    }
    setShowBuilder(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl animate-in fade-in">
      <h3 className="text-3xl font-black mb-8 dark:text-white tracking-tighter">{song.id ? 'Editar' : 'Nueva'} Canción</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <input className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white font-bold" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white" placeholder="Artista" value={artist} onChange={e => setArtist(e.target.value)} />
          <div className="flex gap-4">
            <input className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white" placeholder="Tono" value={key} onChange={e => setKey(e.target.value)} />
            <input className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 dark:text-white" placeholder="BPM" type="number" value={bpm} onChange={e => setBpm(e.target.value)} />
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
          <Icon name="music" className="text-slate-300 mb-4" size={32} />
          <label className="cursor-pointer bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
            {audioFile ? audioFile.name : 'Subir MP3'}
            <input type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
          </label>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acordes Especiales</span>
          <div className="flex gap-2">
            <button onClick={() => setShowLibrary(true)} className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl text-slate-500">Biblioteca</button>
            <button onClick={() => setShowBuilder(true)} className="text-[10px] font-black bg-brand-50 text-brand-600 px-3 py-2 rounded-xl">Crear Nuevo</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl min-h-[100px] items-center border border-slate-100 dark:border-slate-700 shadow-inner">
          {customChords.map((c, i) => (
            <div key={i} className="relative group">
              <ChordDisplay chord={c} />
              <button onClick={() => setCustomChords(customChords.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
            </div>
          ))}
          {customChords.length === 0 && <p className="mx-auto text-slate-400 italic text-sm">Sin acordes personalizados</p>}
        </div>
      </div>

      <textarea className="w-full mb-10 p-6 h-64 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border dark:border-slate-700 font-mono text-sm dark:text-white whitespace-pre-wrap outline-none focus:ring-2 focus:ring-brand-500 shadow-inner" placeholder="Pega aquí la letra y los acordes..." value={body} onChange={e => setBody(e.target.value)}></textarea>
      
      <div className="flex gap-4">
        <button onClick={() => onSave({ ...song, title, artist, body, key, bpm, customChords }, audioFile)} className="flex-1 bg-brand-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-brand-600/20 active:scale-95 transition-all">Guardar Canción</button>
        <button onClick={onCancel} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold py-5 rounded-2xl">Cancelar</button>
      </div>

      {showBuilder && <ChordBuilder onSave={handleChordSave} onCancel={() => setShowBuilder(false)} />}
      {showLibrary && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 w-full max-w-sm shadow-2xl border border-slate-700">
             <h3 className="text-xl font-black mb-6 dark:text-white">Mi Biblioteca</h3>
             <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto no-scrollbar mb-8">
               {getLibrary().map((c: any, i: number) => (
                 <ChordDisplay key={i} chord={c} onClick={() => { setCustomChords([...customChords, c]); setShowLibrary(false); }} />
               ))}
               {getLibrary().length === 0 && <p className="col-span-3 text-center text-slate-400 py-10">Biblioteca vacía.</p>}
             </div>
             <button onClick={() => setShowLibrary(false)} className="w-full bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl font-bold">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackPlayer = ({ song, onBack, onEdit }: any) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomedChord, setZoomedChord] = useState<ChordData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (song.isTeacher) { setAudioUrl(`./tracks/${song.filename}`); }
      else if (song.hasAudio) {
        const record = await getRecordingById(`song_${song.id}_audio`);
        if (record) setAudioUrl(URL.createObjectURL(record.blob));
      }
    };
    load();
    return () => { if (audioUrl?.startsWith('blob:')) URL.revokeObjectURL(audioUrl); };
  }, [song]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    const update = () => {
      setCurrentTime(audio.currentTime);
      if (loopStart !== null && loopEnd !== null && audio.currentTime >= loopEnd) {
        audio.currentTime = loopStart;
      }
    };
    const metadata = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', metadata);
    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('loadedmetadata', metadata);
    };
  }, [speed, loopStart, loopEnd]);

  const toggle = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const format = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col h-[85vh]">
      {zoomedChord && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 flex items-center justify-center p-8 animate-in fade-in" onClick={() => setZoomedChord(null)}>
          <div className="bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-2xl scale-125" onClick={e => e.stopPropagation()}>
            <ChordDisplay chord={zoomedChord} size="large" />
          </div>
        </div>
      )}

      <div className="p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-brand-500 transition-colors"><Icon name="arrowLeft" size={24} /></button>
          <div className="text-center flex-1 mx-4">
            <h2 className="text-2xl font-black dark:text-white tracking-tighter truncate">{song.title}</h2>
            <p className="text-xs font-black text-brand-500 uppercase tracking-widest truncate">{song.artist}</p>
          </div>
          {!song.isTeacher && <button onClick={onEdit} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-brand-500 transition-colors"><Icon name="edit" size={24} /></button>}
        </div>

        {audioUrl ? (
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
            <div className="flex items-center gap-6 mb-6">
              <button onClick={toggle} className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-600/20 active:scale-95 transition-transform shrink-0">
                <Icon name={isPlaying ? "pause" : "play"} size={28} fill="currentColor" />
              </button>
              <div className="flex-1 space-y-2">
                <input type="range" min="0" max={duration || 1} step="0.01" value={currentTime} onChange={e => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }} className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-600" />
                <div className="flex justify-between text-[10px] font-black font-mono text-slate-400"><span>{format(currentTime)}</span><span>{format(duration)}</span></div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocidad</span>
                <button onClick={() => setSpeed(s => Math.max(0.5, s - 0.01))} className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl font-black dark:text-white">-</button>
                <span className="flex-1 text-center font-black dark:text-white">{Math.round(speed * 100)}%</span>
                <button onClick={() => setSpeed(s => Math.min(2.0, s + 0.01))} className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl font-black dark:text-white">+</button>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setLoopStart(currentTime)} className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${loopStart !== null ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 dark:text-slate-400'}`}>{loopStart !== null ? `A: ${format(loopStart)}` : 'Set A'}</button>
                <button onClick={() => setLoopEnd(currentTime)} disabled={loopStart === null} className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${loopEnd !== null ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 dark:text-slate-400 opacity-50'}`}>{loopEnd !== null ? `B: ${format(loopEnd)}` : 'Set B'}</button>
                {(loopStart !== null || loopEnd !== null) && <button onClick={() => { setLoopStart(null); setLoopEnd(null); }} className="px-4 py-4 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl font-black">×</button>}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-800 text-rose-500 font-bold text-sm">Sin audio cargado. Edita la canción para subir un MP3.</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
        {song.customChords && song.customChords.length > 0 && (
          <div className="pb-10 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Acordes Sugeridos</h4>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {song.customChords.map((c, i) => (
                <ChordDisplay key={i} chord={c} onClick={() => setZoomedChord(c)} />
              ))}
            </div>
          </div>
        )}
        <pre className="whitespace-pre-wrap font-mono text-lg dark:text-slate-300 leading-relaxed font-bold">{song.body || 'Sin letra'}</pre>
      </div>
    </div>
  );
};

export default TrackTrainer;
