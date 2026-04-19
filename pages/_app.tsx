import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import i18n, { type Resource, type InitOptions } from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { CartProvider } from '../context/cart';
import { AuthProvider } from '../context/auth';
import { CurrencyProvider } from '../context/currency';
import { ConsentProvider } from '../context/consent';
import { CookieBanner } from '../components/cookie-banner';
import { CartDrawer } from '../components/cart-drawer';
import { AuthDrawer } from '../components/auth-drawer';
import { ErrorBoundary } from '../components/error-boundary';
import { AnalyticsScripts } from '../components/analytics/scripts';
import { trackPageView, schedulePageViewFallback } from '../lib/analytics';

/**
 * Product-paden worden door product.tsx zelf getracked (met resourceId +
 * products), zodat Shopify Analytics één PAGE_VIEW krijgt met volledige
 * data — conform Shopify's eigen Hydrogen pattern. _app.tsx skipt hier om
 * te voorkomen dat er een eerste 'page'-fallback PAGE_VIEW vooraf gaat.
 */
function isProductPath(url: string): boolean {
  const path = url.split('?')[0].replace(/^\/(en|nl|de|es)/, '');
  return path === '/product' || path.startsWith('/product/');
}

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

  // Page view tracking — vuurt op elke route change EN op initial mount.
  // GA4 config staat op `send_page_view: false` zodat we hier handmatig vuren.
  // routeChangeComplete fires alleen bij subsequent navigaties, dus zonder de
  // initial fire mist GA4 elke landing page.
  //
  // Uitzondering: product-paden — product.tsx stuurt zelf één PAGE_VIEW met
  // resourceId + products zodra de Shopify GID beschikbaar is. We schedulen
  // een fallback van 3s die alsnog een 'page'-type PAGE_VIEW stuurt als
  // product.tsx niet op tijd klaar is (trage load, ontbrekende GID).
  useEffect(() => {
    const fire = (url: string) => {
      if (isProductPath(url)) {
        schedulePageViewFallback(url);
      } else {
        trackPageView(url);
      }
    };
    fire(router.asPath);
    router.events.on('routeChangeComplete', fire);
    return () => { router.events.off('routeChangeComplete', fire); };
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
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <I18nextProvider i18n={instanceRef.current}>
        <ConsentProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
                <CartDrawer />
                <AuthDrawer />
                <CookieBanner />
                <AnalyticsScripts />
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </ConsentProvider>
      </I18nextProvider>
    </>
  );
}

export default MyApp;
