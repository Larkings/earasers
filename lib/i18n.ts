import { serverSideTranslations as sst } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';

export const serverSideTranslations = (locale: string, namespaces: string[]) => {
  // 'account' altijd meeladen — auth drawer gebruikt het op elke pagina
  const ns = namespaces.includes('account') ? namespaces : [...namespaces, 'account']
  return sst(locale, ns, nextI18NextConfig)
}
