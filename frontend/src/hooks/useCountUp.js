import { useEffect, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

export default function useCountUp(value, duration = 640) {
  const reduced = usePrefersReducedMotion();
  const numeric = Number(value) || 0;
  const [display, setDisplay] = useState(reduced ? numeric : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(numeric);
      return undefined;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric, duration, reduced]);

  return display;
}
