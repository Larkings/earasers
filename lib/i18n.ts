import { serverSideTranslations as sst } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';

export const serverSideTranslations = (locale: string, namespaces: string[]) =>
  sst(locale, namespaces, nextI18NextConfig);
