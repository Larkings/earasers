import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const init = () => {
      const els = document.querySelectorAll('[data-reveal]');
      if (!els.length) return () => {};

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      els.forEach(el => obs.observe(el));
      return () => obs.disconnect();
    };

    const cleanup = init();
    router.events.on('routeChangeComplete', () => { cleanup?.(); init(); });

    return () => { cleanup?.(); };
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
