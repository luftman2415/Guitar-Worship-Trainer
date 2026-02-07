
import React from 'react';

export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const SCALES: Record<string, number[]> = {
  'Mayor (Jónica)': [0, 2, 4, 5, 7, 9, 11],
  'Dórica': [0, 2, 3, 5, 7, 9, 10],
  'Frigia': [0, 1, 3, 5, 7, 8, 10],
  'Lidia': [0, 2, 4, 6, 7, 9, 11],
  'Mixolidia': [0, 2, 4, 5, 7, 9, 10],
  'Menor (Eólica)': [0, 2, 3, 5, 7, 8, 10],
  'Locria': [0, 1, 3, 5, 6, 8, 10],
  'Pentatónica Menor': [0, 3, 5, 7, 10],
  'Pentatónica Mayor': [0, 2, 4, 7, 9],
  'Blues': [0, 3, 5, 6, 7, 10]
};

export const CHORD_FORMULAS = [
  { name: "Mayor", formula: "1 - 3 - 5", example: "C - E - G" },
  { name: "Menor", formula: "1 - b3 - 5", example: "C - Eb - G" },
  { name: "Maj7", formula: "1 - 3 - 5 - 7", example: "C - E - G - B" },
  { name: "min7", formula: "1 - b3 - 5 - b7", example: "C - Eb - G - Bb" },
  { name: "Dom7", formula: "1 - 3 - 5 - b7", example: "C - E - G - Bb" },
  { name: "Sus2", formula: "1 - 2 - 5", example: "C - D - G" },
  { name: "Sus4", formula: "1 - 4 - 5", example: "C - F - G" },
  { name: "Add9", formula: "1 - 3 - 5 - 9", example: "C - E - G - D" }
];

export const TEACHER_TRACKS = [
  { id: 't1', title: "Hosanna", artist: "Marco Barrientos", key: "G", bpm: 120, isTeacher: true },
  { id: 't2', title: "La bondad de Dios", artist: "Bethel Music", key: "A", bpm: 72, isTeacher: true },
  { id: 't3', title: "La Sunamita", artist: "Montesanto", key: "Em", bpm: 128, isTeacher: true },
  { id: 't4', title: "Tus cuerdas de amor", artist: "Julio Melgar", key: "G", bpm: 74, isTeacher: true },
  { id: 't5', title: "Hermoso Nombre", artist: "Hillsong Worship", key: "D", bpm: 68, isTeacher: true },
  { id: 't6', title: "Way Maker", artist: "Sinach / Priscilla Bueno", key: "E", bpm: 64, isTeacher: true },
  { id: 't7', title: "Rey de Reyes", artist: "Miel San Marcos", key: "B", bpm: 76, isTeacher: true }
];

// Added missing EXERCISES for PracticeRoutine.tsx
export const EXERCISES = [
  { id: 'e1', name: "Escalas Cromáticas", desc: "Coordinación dedo por dedo en todo el mástil.", category: "Técnica", defaultTime: 5 },
  { id: 'e2', name: "Arpegios Maj7", desc: "Saltos de cuerda y extensión de dedos.", category: "Armonía", defaultTime: 10 },
  { id: 'e3', name: "Rítmica Worship", desc: "Patrones de rasgueo 4/4 con acentos.", category: "Ritmo", defaultTime: 15 },
  { id: 'e4', name: "Independencia", desc: "Dedos 1-3 y 2-4 alternados.", category: "Técnica", defaultTime: 5 },
  { id: 'e5', name: "Ciclo de 4tas", desc: "Encuentra la tónica en todas las posiciones.", category: "Teoría", defaultTime: 10 }
];

export const Icon = ({ name, size = 24, className = "", fill = "none" }: any) => {
  const icons: any = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
    mic: <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2"></path>,
    music: <><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>,
    layers: <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>,
    repeat: <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"></path>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>,
    grid: <rect x="3" y="3" width="7" height="7"></rect>,
    sun: <circle cx="12" cy="12" r="5"></circle>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>,
    play: <polygon points="5 3 19 12 5 21 5 3"></polygon>,
    pause: <><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></>,
    arrowLeft: <line x1="19" y1="12" x2="5" y2="12"></line>,
    trash: <polyline points="3 6 5 6 21 6"></polyline>,
    check: <polyline points="20 6 9 17 4 12"></polyline>,
    ear: <path d="M12 2a10 10 0 0 0-10 10v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5"></path>,
    award: <circle cx="12" cy="8" r="7"></circle>,
    x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>,
    minus: <line x1="5" y1="12" x2="19" y2="12"></line>,
    stop: <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>,
    edit: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>,
    micOff: <><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};
