
export interface ChordDot {
  string: number;
  fret: number;
  type: 'note' | 'root';
}

export interface ChordData {
  id?: number;
  name: string;
  dots: ChordDot[];
  muted: boolean[];
  baseFret: number;
}

export interface Song {
  id: number | string;
  title: string;
  artist: string;
  body?: string;
  key?: string;
  bpm?: string | number;
  customChords?: ChordData[];
  hasAudio?: boolean;
  isTeacher?: boolean;
  filename?: string;
}

export interface PracticeStats {
  streak: number;
  totalMinutes: number;
  lastDate: string | null;
}

export interface Recording {
  id: number | string;
  blob: Blob;
  date: Date;
}

export type AppView = 
  | 'home' 
  | 'tuner' 
  | 'tracks' 
  | 'metronome' 
  | 'pads' 
  | 'looper' 
  | 'recorder' 
  | 'routine' 
  | 'scales' 
  | 'ear' 
  | 'analyze';
