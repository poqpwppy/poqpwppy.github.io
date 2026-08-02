import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontSans, fontSerif, fontPixel } from "@/lib/fonts";
import { MenuButton } from "@/components/layout/MenuButton";
import { HudCursor } from "@/components/layout/HudCursor";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { Footer } from "@/components/layout/Footer";
import { Background } from "@/components/background/Background";
import { PageTransition } from "@/components/layout/PageTransition";
import { IntroLoader } from "@/components/layout/IntroLoader";
import { CustomScrollbar } from "@/components/ui/CustomScrollbar";
import "../globals.css";

/** Prerender both locales. `vi` is served unprefixed (as-needed). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://poqpwppy.dev",
    ),
    title: {
      default: t("siteTitle"),
      template: "%s — poqpwppy",
    },
    description: t("siteDescription"),
    openGraph: {
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      siteName: "poqpwppy",
      title: t("siteTitle"),
      description: t("siteDescription"),
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
    },
  };
}

export const viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fontSans.variable} ${fontSerif.variable} ${fontPixel.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <IntroLoader>
            <div className="flex min-h-screen flex-col justify-between">
              <ReadingProgress />
              <Background />
              <a href="#main" className="skip-link">
                Skip to content
              </a>
              <MenuButton />
              <HudCursor />
              <CustomScrollbar />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </IntroLoader>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
