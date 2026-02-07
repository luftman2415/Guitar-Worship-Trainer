
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
  { name: "Disminuido", formula: "1 - b3 - b5", example: "C - Eb - Gb" },
  { name: "Aumentado", formula: "1 - 3 - #5", example: "C - E - G#" },
  { name: "Sus2", formula: "1 - 2 - 5", example: "C - D - G" },
  { name: "Sus4", formula: "1 - 4 - 5", example: "C - F - G" },
  { name: "Maj7", formula: "1 - 3 - 5 - 7", example: "C - E - G - B" },
  { name: "min7", formula: "1 - b3 - 5 - b7", example: "C - Eb - G - Bb" },
  { name: "Dom7", formula: "1 - 3 - 5 - b7", example: "C - E - G - Bb" }
];

export const TEACHER_TRACKS = [
  { id: 't1', title: "La Sunamita", artist: "Montesanto", filename: "La Sunamita.mp3", isTeacher: true },
  { id: 't2', title: "No hay lugar más alto", artist: "Miel San Marcos", filename: "No hay lugar mas alto.mp3", isTeacher: true },
  { id: 't3', title: "Santo es el que vive", artist: "Montesanto", filename: "Santo es el que vive.mp3", isTeacher: true },
  { id: 't4', title: "Si tu presencia conmigo no va", artist: "Oasis Ministry", filename: "Si tu presencia conmigo no va.mp3", isTeacher: true },
  { id: 't5', title: "Tus cuerdas de amor", artist: "Julio Melgar", filename: "Tus cuerdas de amor.mp3", isTeacher: true },
  { id: 't6', title: "Hosanna", artist: "Marco Barrientos", filename: "Hosanna.mp3", isTeacher: true },
  { id: 't7', title: "La bondad de Dios", artist: "Church of the City", filename: "La bondad de Dios.mp3", isTeacher: true }
];

export const EXERCISES = [
  { id: 1, category: "CALENTAMIENTO", name: "Spider Walk (1-2-3-4)", desc: "Dedo por traste en todas las cuerdas. Ida y vuelta.", defaultTime: 5 },
  { id: 2, category: "TÉCNICA", name: "Bending y Vibrato", desc: "Bend de tono completo. Vibrato lento y controlado.", defaultTime: 10 },
  { id: 3, category: "RITMO", name: "Funk Strumming (Muting)", desc: "Mano izquierda muda cuerdas. Ritmo semicorcheas.", defaultTime: 10 },
  { id: 4, category: "TEORÍA", name: "Escala Mayor (3 Octavas)", desc: "Círculo de cuartas. Todas las posiciones.", defaultTime: 15 },
  { id: 5, category: "REPERTORIO", name: "Repaso Canciones", desc: "Tocar setlist completo sin detenerse.", defaultTime: 20 }
];

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = "", fill = "none" }) => {
  const icons: Record<string, React.ReactNode> = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
    mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>,
    micOff: <><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><path d="M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>,
    music: <><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></>,
    grid: <><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></>,
    sun: <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>,
    play: <polygon points="5 3 19 12 5 21 5 3"></polygon>,
    pause: <><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></>,
    stop: <rect x="6" y="6" width="12" height="12"></rect>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>,
    minus: <line x1="5" y1="12" x2="19" y2="12"></line>,
    search: <><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
    trash: <><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></>,
    edit: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>,
    award: <><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></>,
    clock: <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>,
    analyze: <><path d="M2 12h10M9 4v16M3 7l13 13M16 7l-13 13"></path></>,
    ear: <path d="M12 2a10 10 0 0 0-10 10v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a8 8 0 0 1 15.6 1.6"></path>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></>,
    repeat: <><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></>
  };
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};
