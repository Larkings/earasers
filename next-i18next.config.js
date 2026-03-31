const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'de', 'es'],
    localeDetection: false,
  },
  localePath: path.resolve('./public/locales'),
  defaultNS: 'common',
  ns: ['common', 'home', 'about', 'faq', 'contact', 'returns', 'affiliates', 'collection', 'product', 'account'],
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  initImmediate: false,
  react: { useSuspense: false },
};
