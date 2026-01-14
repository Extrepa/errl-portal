import { useEffect, useRef, useState } from 'react';

/**
 * Simple requestAnimationFrame ticker returning elapsed time in seconds.
 */
export const useGlobalTicker = () => {
  const start = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const tick = (ts: number) => {
      if (start.current === null) start.current = ts;
      const elapsedMs = ts - start.current;
      setTime(elapsedMs / 1000);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return time;
};
