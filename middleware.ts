import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from './lib/i18n/settings';

export default createMiddleware({
  // 支持的语言列表
  locales,
  // 默认语言
  defaultLocale,
  // 本地语言检测
  localeDetection: true,
  localePrefix: 'as-needed'
});

export const config = {
  // 匹配所有路径，除了 /api, /_next, 和所有包含 . 的路径（如静态文件）
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
