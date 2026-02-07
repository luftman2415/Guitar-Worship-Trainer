
import React, { useState, useEffect, useRef } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { Icon } from '../constants';

type TrainerMode = 'intervals' | 'chords';

const EarTrainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TrainerMode>('intervals');
  const [gameState, setGameState] = useState<'menu' | 'quiz' | 'result'>('menu');
  const [level, setLevel] = useState<number>(1);
  const [question, setQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [currentTarget, setCurrentTarget] = useState<any>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const { resume, getContext } = useAudioEngine();

  // Track oscillators locally for immediate cleanup
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Cleanup audio when leaving the component
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
  };

  const playCustomTone = async (freq: number, startTime: number, duration: number, volume: number = 0.4) => {
    const ctx = await resume();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
    oscillatorsRef.current.push(osc);
  };

  const INTERVALS_N1 = [
    { name: 'Unísono', semi: 0 },
    { name: '2da Mayor', semi: 2 },
    { name: '3ra Mayor', semi: 4 },
    { name: '4ta Justa', semi: 5 },
    { name: '5ta Justa', semi: 7 },
    { name: '6ta Mayor', semi: 9 },
    { name: '7ma Mayor', semi: 11 },
    { name: 'Octava', semi: 12 }
  ];

  const INTERVALS_N2 = [
    { name: '2da Menor', semi: 1 },
    { name: '3ra Menor', semi: 3 },
    { name: 'Tritono', semi: 6 },
    { name: '6ta Menor', semi: 8 },
    { name: '7ma Menor', semi: 10 }
  ];

  const CHORDS_N1A = [
    { name: 'Mayor', offsets: [0, 4, 7] },
    { name: 'Menor', offsets: [0, 3, 7] }
  ];

  const CHORDS_N1B = [
    { name: 'Mayor', offsets: [0, 4, 7] },
    { name: 'Menor', offsets: [0, 3, 7] },
    { name: 'Disminuido', offsets: [0, 3, 6] }
  ];

  const CHORDS_N1C = [
    { name: 'Mayor', offsets: [0, 4, 7] },
    { name: 'Menor', offsets: [0, 3, 7] },
    { name: 'Disminuido', offsets: [0, 3, 6] },
    { name: 'Aumentado', offsets: [0, 4, 8] }
  ];

  const generateQuestion = (currentLevel: number, mode: TrainerMode) => {
    let pool: any[] = [];
    if (mode === 'intervals') {
      if (currentLevel === 1) pool = INTERVALS_N1;
      else if (currentLevel === 2) pool = INTERVALS_N2;
      else pool = [...INTERVALS_N1, ...INTERVALS_N2];
    } else {
      if (currentLevel === 1) pool = CHORDS_N1A;
      else if (currentLevel === 2) pool = CHORDS_N1B;
      else pool = CHORDS_N1C;
    }

    const target = pool[Math.floor(Math.random() * pool.length)];
    const root = 196 + Math.floor(Math.random() * 200); 
    setCurrentTarget({ ...target, root, options: pool });
    setFeedback(null);
    
    setTimeout(() => {
      if (mode === 'intervals') playInterval(root, target.semi);
      else playChord(root, target.offsets);
    }, 500);
  };

  const playInterval = async (root: number, semi: number) => {
    const ctx = await resume();
    if (!ctx) return;
    stopAllAudio();
    const target = root * Math.pow(2, semi / 12);
    const now = ctx.currentTime;
    playCustomTone(root, now, 0.8);
    playCustomTone(target, now + 0.8, 1.0);
  };

  const playChord = async (root: number, offsets: number[]) => {
    const ctx = await resume();
    if (!ctx) return;
    stopAllAudio();
    const now = ctx.currentTime;
    offsets.forEach((semi, i) => {
      const freq = root * Math.pow(2, semi / 12);
      playCustomTone(freq, now + (i * 0.05), 1.2, 0.3);
    });
  };

  const startLevel = async (lvl: number) => {
    await resume();
    setLevel(lvl);
    setScore(0);
    setQuestion(1);
    setGameState('quiz');
    generateQuestion(lvl, activeTab);
  };

  const handleAnswer = (val: any) => {
    if (feedback) return;
    
    const isCorrect = activeTab === 'intervals' 
      ? val === currentTarget.semi 
      : JSON.stringify(val) === JSON.stringify(currentTarget.offsets);

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(() => {
        if (question < 10) {
          setQuestion(q => q + 1);
          generateQuestion(level, activeTab);
        } else {
          setGameState('result');
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setScore(0);
        setQuestion(1);
        generateQuestion(level, activeTab);
      }, 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black dark:text-white tracking-tighter uppercase">Entrenador Auditivo</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Perfecciona tu oído. Acierta 10/10.</p>
      </div>

      {gameState === 'menu' && (
        <div className="space-y-10">
          <div className="flex justify-center p-2 bg-slate-100 dark:bg-slate-950 rounded-[2rem] w-fit mx-auto border border-slate-200 dark:border-slate-800">
            <button onClick={() => { stopAllAudio(); setActiveTab('intervals'); }} className={`px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'intervals' ? 'bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-white shadow-lg' : 'text-slate-400'}`}>Intervalos</button>
            <button onClick={() => { stopAllAudio(); setActiveTab('chords'); }} className={`px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chords' ? 'bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-white shadow-lg' : 'text-slate-400'}`}>Acordes</button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'intervals' ? (
              <>
                <LevelButton num={1} title="Mayores y Justos" desc="Unísono, 2da M, 3ra M, 4ta J, 5ta J, 6ta M, 7ma M, 8va J" onClick={() => startLevel(1)} color="fuchsia" />
                <LevelButton num={2} title="Menores y Tritono" desc="2da m, 3ra m, Tritono, 6ta m, 7ma m" onClick={() => startLevel(2)} color="indigo" />
                <LevelButton num={3} title="Maestro (Mix)" desc="Todos los intervalos aleatorios" onClick={() => startLevel(3)} color="brand" />
              </>
            ) : (
              <>
                <LevelButton num={1} title="Nivel 1A: Mayor vs Menor" desc="Identifica tríadas básicas" onClick={() => startLevel(1)} color="fuchsia" />
                <LevelButton num={2} title="Nivel 1B: + Disminuidos" desc="Añade acordes disminuidos" onClick={() => startLevel(2)} color="indigo" />
                <LevelButton num={3} title="Nivel 1C: + Aumentados" desc="Desafío armónico total" onClick={() => startLevel(3)} color="brand" />
              </>
            )}
          </div>
        </div>
      )}

      {gameState === 'quiz' && currentTarget && (
        <div className="space-y-12 animate-in fade-in">
          <div className="flex justify-between items-center">
            <button onClick={() => { stopAllAudio(); setGameState('menu'); }} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400"><Icon name="arrowLeft" size={24}/></button>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em] mb-1">Nivel {level}</span>
               <div className="text-sm font-black dark:text-white">Progreso: {score} / 10</div>
            </div>
            <div className="w-12"></div>
          </div>

          <div className="flex justify-center relative">
            <button 
              onClick={() => activeTab === 'intervals' ? playInterval(currentTarget.root, currentTarget.semi) : playChord(currentTarget.root, currentTarget.offsets)}
              className={`w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 border-8 ${
                feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' :
                feedback === 'wrong' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-500' :
                'border-fuchsia-100 dark:border-fuchsia-900/20 bg-white dark:bg-slate-800 text-fuchsia-600'
              }`}
            >
              <Icon name={feedback === 'correct' ? 'check' : feedback === 'wrong' ? 'x' : 'ear'} size={72} fill="currentColor" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentTarget.options.map((opt: any) => (
              <button 
                key={opt.name}
                onClick={() => handleAnswer(activeTab === 'intervals' ? opt.semi : opt.offsets)}
                className={`py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all border-2 ${
                  feedback === 'correct' && (activeTab === 'intervals' ? opt.semi === currentTarget.semi : JSON.stringify(opt.offsets) === JSON.stringify(currentTarget.offsets)) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                  feedback === 'wrong' && (activeTab === 'intervals' ? opt.semi !== currentTarget.semi : JSON.stringify(opt.offsets) !== JSON.stringify(currentTarget.offsets)) ? 'opacity-40 border-slate-100' :
                  'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 dark:text-white hover:border-fuchsia-400'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="text-center space-y-8 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Icon name="award" size={48} /></div>
          <h2 className="text-4xl font-black dark:text-white tracking-tighter">¡Excelente Oído!</h2>
          <p className="text-lg text-slate-500 font-medium">Has completado el Nivel {level} de {activeTab === 'intervals' ? 'Intervalos' : 'Acordes'}.</p>
          <button onClick={() => { stopAllAudio(); setGameState('menu'); }} className="w-full bg-brand-600 text-white py-6 rounded-3xl font-black shadow-xl shadow-brand-600/30 active:scale-95">CONTINUAR ENTRENANDO</button>
        </div>
      )}
    </div>
  );
};

const LevelButton = ({ num, title, desc, onClick, color }: any) => (
  <button onClick={onClick} className="w-full text-left bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 hover:border-fuchsia-400 transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-${color}-500/5 rounded-full`}></div>
    <span className={`text-[10px] font-black text-${color}-500 uppercase tracking-widest mb-1 block`}>Nivel {num}</span>
    <h3 className="text-xl font-black dark:text-white mb-2">{title}</h3>
    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{desc}</p>
    <div className="absolute bottom-8 right-8 w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-md group-hover:bg-fuchsia-600 group-hover:text-white transition-all">
      <Icon name="play" size={20} fill="currentColor" />
    </div>
  </button>
);

export default EarTrainer;
