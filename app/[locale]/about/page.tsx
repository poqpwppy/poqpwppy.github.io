import { setRequestLocale, getTranslations } from "next-intl/server";
import { allCertifications } from "@/.content-collections/generated";
import { allWriteups, allResearch } from "@/.content-collections/generated";
import { profile } from "@/lib/profile";
import { allTags } from "@/lib/stats";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { AboutKineticView } from "@/components/about/AboutKineticView";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "about");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  const certs = allCertifications;
  const interests = allTags([
    ...allWriteups.map((w) => ({ tags: w.tags ?? [] })),
    ...allResearch.map((r) => ({ tags: r.tags ?? [] })),
  ])
    .filter((x) => x.count >= 1)
    .slice(0, 24);

  const name = profile.name;
  const title = locale === "vi" ? profile.titleVi : profile.titleEn;

  return (
    <>
      <PageHero
        index="06"
        eyebrow={nav("about")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container>
        <AboutKineticView
          name={name}
          title={title}
          location={profile.location}
          socials={profile.socials}
          skills={profile.skills}
          experience={profile.experience}
          projects={profile.projects}
          certs={certs}
          interests={interests}
          labels={{
            introTitle: t("introTitle"),
            introText: t("introText"),
            skillsTitle: t("skillsTitle"),
            experienceTitle: t("experienceTitle"),
            certificationsTitle: t("certificationsTitle"),
            philosophyTitle: t("philosophyTitle"),
            philosophyText: t("philosophyText"),
            interestsTitle: t("interestsTitle"),
            writeupsNav: nav("writeups"),
            contactNav: nav("contact"),
          }}
          locale={locale}
        />
      </Container>
    </>
  );
}