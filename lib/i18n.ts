import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './i18n/settings';
 
export default getRequestConfig(async ({locale}) => {
  // 验证 locale 是否有效
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`../i18n/messages/${locale}.json`)).default
  };
});