import { setRequestLocale, getTranslations } from "next-intl/server";
import { profile } from "@/lib/profile";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ContactForm } from "@/components/contact/ContactForm";
import { CopyField } from "@/components/ui/CopyField";
import {
  ExternalLink,
  Github,
  Mail,
} from "@/components/icons";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "contact");
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <PageHero
        index="07"
        eyebrow={nav("contact")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container className="relative z-10 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          {/* Left Bento: Contact Form Container */}
          <AnimatedSection variant="slide-up" delay={0.05} className="lg:col-span-7">
            <div className="relative border border-[#e60026]/40 bg-[#0a0a0d]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_40px_rgba(230,0,38,0.18)] rounded-sm group transition-all duration-500 hover:border-[#e60026] hover:shadow-[0_0_55px_rgba(230,0,38,0.35)]">
              {/* HUD Corner Brackets */}
              <span aria-hidden className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_10px_#e60026]" />
              <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_10px_#e60026]" />

              <h2 className="eyebrow mb-6 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse" />
                {t("title")}
              </h2>

              <ContactForm />
            </div>
          </AnimatedSection>

          {/* Right Bento: Direct Email & Social Channels */}
          <AnimatedSection variant="slide-up" delay={0.1} className="lg:col-span-5 space-y-6 relative">
            {/* Ambient Breathing Background Glow Halo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-tr from-[#e60026]/20 via-[#ff2a4b]/15 to-transparent blur-2xl z-0 animate-pulse"
            />

            {/* Email Card */}
            <div className="relative z-10 border border-[#e60026]/40 bg-[#0a0a0d]/90 p-6 backdrop-blur-2xl shadow-[0_0_30px_rgba(230,0,38,0.15)] rounded-sm transition-all duration-500 hover:border-[#e60026] hover:shadow-[0_0_40px_rgba(230,0,38,0.3)]">
              <span aria-hidden className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026]" />
              <span aria-hidden className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026]" />
              
              <p className="eyebrow mb-4 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse" />
                {t("emailDirect")}
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 font-mono text-sm sm:text-base font-black text-[#ff2a4b] transition-colors hover:text-white"
                >
                  <Mail className="text-[1.1em] text-[#ff2a4b]" aria-hidden />
                  {profile.email}
                </a>
                <CopyField text={profile.email} label={profile.email} />
              </div>
            </div>

            {/* Social Channels Card */}
            <div className="relative z-10 border border-[#e60026]/40 bg-[#0a0a0d]/90 p-6 backdrop-blur-2xl shadow-[0_0_30px_rgba(230,0,38,0.15)] rounded-sm transition-all duration-500 hover:border-[#e60026] hover:shadow-[0_0_40px_rgba(230,0,38,0.3)]">
              <span aria-hidden className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026]" />
              <span aria-hidden className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026]" />

              <p className="eyebrow mb-5 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse" />
                {t("socialTitle")}
              </p>

              <ul className="space-y-2">
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target={s.url.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noreferrer noopener"
                      className="group flex items-center justify-between gap-3 border border-neutral-900 bg-[#060609]/80 px-4 py-3 font-mono transition-all duration-300 hover:border-[#e60026]/60 hover:bg-[#120306]/90 rounded-sm"
                    >
                      <span className="flex items-center gap-3">
                        {s.label.toLowerCase() === "github" ? (
                          <Github className="text-neutral-400 transition-colors group-hover:text-[#ff2a4b]" aria-hidden />
                        ) : (
                          <span
                            aria-hidden
                            className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_6px_#e60026]"
                          />
                        )}
                        <span className="text-xs font-bold text-neutral-200 transition-colors group-hover:text-white">
                          {s.label}
                        </span>
                      </span>

                      <span className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#ff2a4b] bg-[#e60026]/10 px-2 py-0.5 border border-[#e60026]/30 rounded-[2px]">
                          {s.handle}
                        </span>
                        <ExternalLink className="text-xs text-neutral-400 opacity-60 transition-opacity group-hover:opacity-100 group-hover:text-white" aria-hidden />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </>
  );
}


