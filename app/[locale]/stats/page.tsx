import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata() {
  return {};
}

export function generateStaticParams() {
  return [];
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
