import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    description: t("homeDesc"),
    openGraph: { description: t("homeDesc") },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
    </>
  );
}
