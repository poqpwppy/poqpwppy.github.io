import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Standard metadata for index pages — title/subtitle double as the
 * `<title>` + description, so translations stay in one place.
 */
export async function pageMetadata(
  locale: string,
  namespace: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}
