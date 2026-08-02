import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="container-narrow flex flex-col items-center py-32 text-center">
      <p className="font-mono text-sm tracking-[0.3em] text-accent">
        {t("errorCode")}
      </p>
      <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-4 text-fg2">{t("desc")}</p>
      <Link
        href="/"
        className="mt-10 inline-block border border-line2 bg-bg2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-fg2 transition-colors hover:border-accent hover:text-accent"
      >
        ← {t("backHome")}
      </Link>
    </div>
  );
}
