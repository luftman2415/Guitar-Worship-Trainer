
import React from 'react';
import { ChordData } from '../types';

interface ChordDisplayProps {
  chord: ChordData;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const ChordDisplay: React.FC<ChordDisplayProps> = ({ chord, size = 'small', onClick }) => {
  if (!chord) return null;
  
  let scale = 0.5;
  if (size === "medium") scale = 0.9;
  if (size === "large") scale = 2.4;

  const width = 80 * scale;
  const height = 100 * scale;

  return (
    <div 
      onClick={onClick} 
      className={`flex flex-col items-center p-2 rounded-xl transition-all ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95' : ''}`}
    >
      <div className="relative flex items-center">
        {/* Fret Label - Moved to the left outside the strings */}
        {chord.baseFret > 1 && (
          <div 
            className="absolute left-[-1.8rem] font-black text-slate-400 dark:text-slate-500" 
            style={{ fontSize: `${14 * scale}px` }}
          >
            T{chord.baseFret}
          </div>
        )}
        
        <div 
          className="relative bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-400 rounded-sm shadow-sm"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Frets */}
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="absolute w-full h-[1px] bg-slate-300 dark:bg-slate-600" style={{ top: `${i * 20}%` }}></div>
          ))}
          {/* Strings */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="absolute h-full w-[1px] bg-slate-800 dark:bg-slate-400" style={{ left: `${10 + i * 16}%` }}></div>
          ))}
          
          {/* Dots */}
          {chord.dots.map((d, i) => (
            <div 
              key={i} 
              className={`absolute rounded-full shadow-md z-10 ${d.type === 'root' ? 'bg-rose-500' : 'bg-slate-800 dark:bg-white'}`}
              style={{ 
                left: `${10 + d.string * 16}%`, 
                top: `${(d.fret - 1) * 20 + 10}%`, 
                transform: 'translate(-50%, -50%)', 
                width: `${14 * scale}px`, 
                height: `${14 * scale}px` 
              }}
            ></div>
          ))}

          {/* Muted/Open Markers */}
          {chord.muted.map((m, sIdx) => (
            <div 
              key={sIdx} 
              className="absolute top-[-22%] font-black text-slate-500 dark:text-slate-400"
              style={{ 
                left: `${10 + sIdx * 16}%`, 
                transform: 'translateX(-50%)', 
                fontSize: `${14 * scale}px` 
              }}
            >
              {m ? 'X' : (chord.dots.some(d => d.string === sIdx) ? '' : 'O')}
            </div>
          ))}
        </div>
      </div>
      <span className={`font-black mt-2 dark:text-white uppercase tracking-tighter truncate w-full text-center ${
        size === 'large' ? 'text-4xl mt-8' : size === 'medium' ? 'text-sm' : 'text-[10px]'
      }`}>
        {chord.name}
      </span>
    </div>
  );
};

export default ChordDisplay;
