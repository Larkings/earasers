import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import i18n, { type Resource, type InitOptions } from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { CartProvider } from '../context/cart';
import { AuthProvider } from '../context/auth';
import { CurrencyProvider } from '../context/currency';
import { CookieBanner } from '../components/cookie-banner';
import { CartDrawer } from '../components/cart-drawer';
import { AuthDrawer } from '../components/auth-drawer';

const LOCALE_KEY = 'earasers-locale';
const SUPPORTED = ['en', 'nl', 'de', 'es'];

function detectLocale(): string {
  const langs = navigator.languages ?? [navigator.language];
  for (const lang of langs) {
    const code = lang.slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(code)) return code;
  }
  return 'en';
}

type I18nInstance = ReturnType<typeof i18n.createInstance>;

function createI18nInstance(
  locale: string,
  resources: Resource,
  ns: string[],
): I18nInstance {
  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'en',
    ns,
    defaultNS: 'common',
    resources,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  } as InitOptions);
  return instance;
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const { _nextI18Next } = pageProps || {};
  const locale   = (_nextI18Next?.initialLocale  ?? 'en')       as string;
  const resources = (_nextI18Next?.initialI18nStore ?? {})       as unknown as Resource;
  const ns        = (_nextI18Next?.ns             ?? ['common']) as string[];

  // instanceRef is null on every SSR render and on the very first client render,
  // so both paths create the instance synchronously with the same data → no mismatch.
  const instanceRef = useRef<I18nInstance | null>(null);
  if (!instanceRef.current) {
    instanceRef.current = createI18nInstance(locale, resources, ns);
  } else {
    // Synchronously inject any namespaces the new page brought in before render,
    // so t() never falls back to keys on the first client-side navigation render.
    const inst = instanceRef.current;
    const localeData = (resources as Record<string, Record<string, unknown>>)[locale] || {};
    Object.entries(localeData).forEach(([nsKey, nsData]) => {
      if (!inst.hasResourceBundle(locale, nsKey)) {
        inst.addResourceBundle(locale, nsKey, nsData as Record<string, unknown>, true, true);
      }
    });
  }

  // Keep language in sync when the locale changes (e.g. user switches language)
  useEffect(() => {
    const inst = instanceRef.current;
    if (!inst) return;
    if (inst.language !== locale) {
      inst.changeLanguage(locale);
    }
  }, [locale]);

  // Auto-detect locale on first visit
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (!stored && router.locale === 'en') {
      const detected = detectLocale();
      if (detected !== 'en') {
        localStorage.setItem(LOCALE_KEY, detected);
        router.replace(router.asPath, router.asPath, { locale: detected, scroll: false });
      } else {
        localStorage.setItem(LOCALE_KEY, 'en');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-reveal observer
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
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
      );

      els.forEach(el => obs.observe(el));
      return () => obs.disconnect();
    };

    const cleanup = init();
    router.events.on('routeChangeComplete', () => { cleanup?.(); init(); });
    return () => { cleanup?.(); };
  }, [router]);

  return (
    <I18nextProvider i18n={instanceRef.current}>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <Component {...pageProps} />
            <CartDrawer />
            <AuthDrawer />
            <CookieBanner />
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </I18nextProvider>
  );
}

export default MyApp;
