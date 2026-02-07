
import { useCallback, useRef } from 'react';

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  const resume = useCallback(async () => {
    const ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [getContext]);

  const playTone = useCallback((freq: number, startTime: number, duration: number, volume: number = 0.4, type: OscillatorType = 'triangle') => {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = type;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }, [getContext]);

  return { getContext, resume, playTone };
};
