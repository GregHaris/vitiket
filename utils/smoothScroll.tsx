"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2,
      easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
    });

    lenis.on(
      "scroll",
      ({}: {
        scroll: number;
        limit: number;
        velocity: number;
        direction: number;
        progress: number;
      }) => {
        const target = document.activeElement as HTMLElement | null;
        if (target && target.closest(".modal-content")) {
          return;
        }
      },
    );

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
