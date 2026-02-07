
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
  { name: "Add9", formula: "1 - 3 - 5 - 9", example: "C - E - G - D" },
  { name: "9na", formula: "1 - 3 - 5 - b7 - 9", example: "C - E - G - Bb - D" },
  { name: "11na", formula: "1 - 5 - b7 - 9 - 11", example: "C - G - Bb - D - F" },
  { name: "13na", formula: "1 - 3 - 5 - b7 - 9 - 13", example: "C - E - G - Bb - D - A" },
  { name: "Dim", formula: "1 - b3 - b5", example: "C - Eb - Gb" },
  { name: "Aug", formula: "1 - 3 - #5", example: "C - E - G#" }
];

export const TEACHER_TRACKS = [
  { id: 't1', title: "Hosanna", artist: "Marco Barrientos", key: "G", bpm: 120, isTeacher: true },
  { id: 't2', title: "La bondad de Dios", artist: "Bethel / Church of the City", key: "A", bpm: 72, isTeacher: true },
  { id: 't3', title: "La Sunamita", artist: "Montesanto", key: "Em", bpm: 128, isTeacher: true },
  { id: 't4', title: "Tus cuerdas de amor", artist: "Julio Melgar", key: "G", bpm: 74, isTeacher: true },
  { id: 't5', title: "Hermoso Nombre", artist: "Hillsong", key: "D", bpm: 68, isTeacher: true },
  { id: 't6', title: "Way Maker", artist: "Sinach", key: "E", bpm: 64, isTeacher: true },
  { id: 't7', title: "Rey de Reyes", artist: "Miel San Marcos", key: "B", bpm: 76, isTeacher: true }
];

export const EXERCISES = [
  { id: 1, category: "CALENTAMIENTO", name: "Spider Walk", desc: "1-2-3-4 en todas las cuerdas.", defaultTime: 5 },
  { id: 2, category: "TÉCNICA", name: "Bending / Vibrato", desc: "Control de tono y expresión.", defaultTime: 10 },
  { id: 3, category: "REPERTORIO", name: "Setlist Clase", desc: "Repaso de las 7 pistas.", defaultTime: 15 }
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
    award: <circle cx="12" cy="8" r="7"></circle>,
    clock: <circle cx="12" cy="12" r="10"></circle>,
    ear: <path d="M12 2a10 10 0 0 0-10 10v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5"></path>,
    minus: <line x1="5" y1="12" x2="19" y2="12"></line>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
    micOff: <><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>,
    stop: <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></>,
    check: <polyline points="20 6 9 17 4 12"></polyline>,
    settings: <circle cx="12" cy="12" r="3"></circle>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};
