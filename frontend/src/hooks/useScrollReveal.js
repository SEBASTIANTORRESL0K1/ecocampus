import { useEffect, useState } from 'react';

/**
 * useScrollReveal
 *
 * Observes an element with IntersectionObserver and returns whether it has
 * entered the viewport. Drives the CSS-based blur-fade-up animation defined
 * in scroll-animations.css.
 *
 * `ref` is a callback ref: observing starts when the element actually mounts,
 * so elements rendered later (for example the calculator result after the last
 * question) are revealed too. With an object ref the observer was created once,
 * before such elements existed, and they stayed invisible (opacity 0).
 *
 * @param {object} options
 * @param {number} [options.threshold=0.15]  - Fraction of element visible before triggering.
 * @param {boolean} [options.triggerOnce=true] - Whether to stop observing after first reveal.
 * @returns {{ ref: (el: Element | null) => void, isVisible: boolean }}
 */
function useScrollReveal({ threshold = 0.15, triggerOnce = true } = {}) {
  const [el, setEl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!el) return;

    // Sin IntersectionObserver (navegadores muy antiguos) el contenido se muestra directamente.
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

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
  }, [el, threshold, triggerOnce]);

  return { ref: setEl, isVisible };
}

export default useScrollReveal;
