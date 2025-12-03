import "@/app/globals.css";
import Script from "next/script";
import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";
import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import { cn } from "@/lib/utils";
import { AppContextProvider } from "@/contexts/app";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const messages = await import(`@/i18n/messages/${locale}.json`);

  return {
    title: {
      template: `%s | ${messages.metadata.title}`,
      default: messages.metadata.title || "",
    },
    description: messages.metadata.description || "",
    keywords: messages.metadata.keywords || "",
  };
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = useMessages();
  const adsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;
  const enableAdsense =
    (process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE_DEV === "true") &&
    !!adsenseClientId;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {enableAdsense && (
          <Script
            id="adsense-script"
            strategy="beforeInteractive"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NextAuthSessionProvider>
            <AppContextProvider>
              <ThemeProvider attribute="class" disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </AppContextProvider>
          </NextAuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
