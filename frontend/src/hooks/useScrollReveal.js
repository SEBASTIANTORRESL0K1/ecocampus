import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal
 *
 * Observes an element with IntersectionObserver and returns whether it has
 * entered the viewport. Drives the CSS-based blur-fade-up animation defined
 * in scroll-animations.css.
 *
 * @param {object} options
 * @param {number} [options.threshold=0.15]  - Fraction of element visible before triggering.
 * @param {boolean} [options.triggerOnce=true] - Whether to stop observing after first reveal.
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
function useScrollReveal({ threshold = 0.15, triggerOnce = true } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(el);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  return { ref, isVisible };
}

export default useScrollReveal;
