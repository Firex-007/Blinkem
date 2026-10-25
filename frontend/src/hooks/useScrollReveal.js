import { useEffect } from 'react';

/**
 * useScrollReveal: observes all elements with the .scroll-reveal class.
 * As user scrolls down, triggers blur -> deblur and fade-in smoothly.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.08,
      }
    );

    // Initial query
    const attach = () => {
      const elements = document.querySelectorAll('.scroll-reveal:not(.is-revealed)');
      elements.forEach((el) => {
        // If element is already in viewport on initial mount, reveal immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    attach();
    const timer = setTimeout(attach, 200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}

export default useScrollReveal;
