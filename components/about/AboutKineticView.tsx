"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { buttonLinkClasses } from "@/components/ui/Button";
import { ArrowRight, Lock } from "@/components/icons";

const AVATAR_IMAGE_URL =
  "https://i.ibb.co/fGqCLRv7/538209952-122137466222878313-2700935945624281694-n.jpg";

type Social = { label: string; url: string; handle: string };
type Skill = { label: string; level: number; group?: string };
type Experience = {
  org: string;
  roleVi: string;
  roleEn: string;
  period: string;
  descVi: string;
  descEn: string;
};
type Project = {
  titleVi: string;
  titleEn: string;
  url?: string;
  descVi: string;
  descEn: string;
};
type Cert = {
  name: string;
  issuer: string;
  year: number;
  status: string;
};
type TagItem = { name: string; count: number };

type AboutKineticViewProps = {
  name: string;
  title: string;
  location: string;
  socials: ReadonlyArray<Social>;
  skills: ReadonlyArray<Skill>;
  experience: ReadonlyArray<Experience>;
  projects: ReadonlyArray<Project>;
  certs: ReadonlyArray<Cert>;
  interests: ReadonlyArray<TagItem>;
  labels: {
    introTitle: string;
    introText: string;
    skillsTitle: string;
    experienceTitle: string;
    certificationsTitle: string;
    philosophyTitle: string;
    philosophyText: string;
    interestsTitle: string;
    writeupsNav: string;
    contactNav: string;
  };
  locale: string;
};

type TabKey = "overview" | "skills" | "experience" | "certs";

// Apple-Grade Ultra-Smooth Bezier Motion Curve
const APPLE_EASE = [0.22, 1, 0.36, 1];

export function AboutKineticView({
  name,
  title,
  location,
  socials,
  skills,
  experience,
  projects,
  certs,
  interests,
  labels,
  locale,
}: AboutKineticViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const reduce = useReducedMotion();

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: locale === "vi" ? "Tổng quan" : "Overview" },
    { key: "skills", label: labels.skillsTitle, count: skills.length },
    { key: "experience", label: labels.experienceTitle, count: experience.length + projects.length },
    { key: "certs", label: labels.certificationsTitle, count: certs.length },
  ];

  return (
    <div className="relative z-10 pb-24 transform-gpu">
      {/* ── Section 1: Hero Profile Dossier ── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: APPLE_EASE }}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch transform-gpu"
      >
        {/* Left Column: Avatar Card with Breathing Aura */}
        <div className="lg:col-span-5 flex flex-col relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-tr from-[#e60026]/20 via-[#ff2a4b]/10 to-transparent blur-2xl z-0 animate-pulse"
          />

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.3, ease: APPLE_EASE } }}
            className="relative z-10 flex flex-col justify-between h-full border border-[#e60026]/40 bg-[#0a0a0d]/95 p-4 backdrop-blur-xl shadow-[0_0_35px_rgba(230,0,38,0.2)] rounded-sm group transition-all duration-300 hover:border-[#e60026] hover:shadow-[0_0_50px_rgba(230,0,38,0.35)] transform-gpu"
          >
            {/* HUD Corner Brackets */}
            <span
              aria-hidden
              className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_10px_#e60026] z-10"
            />
            <span
              aria-hidden
              className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_10px_#e60026] z-10"
            />

            {/* Avatar Photo Frame */}
            <div className="relative overflow-hidden rounded-sm border border-neutral-800/90 shadow-inner">
              <img
                src={AVATAR_IMAGE_URL}
                alt={name}
                className="h-80 sm:h-96 md:h-[460px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent opacity-80" />
            </div>

            {/* Profile Bio Details */}
            <div className="p-4 pt-5 font-mono">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                {name}
              </h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#ff2a4b]">
                {title}
              </p>
              <p className="mt-2.5 text-xs text-neutral-400 font-medium">📍 {location}</p>

              {/* Social Badges */}
              <div className="mt-5 flex flex-wrap gap-2 pt-3.5 border-t border-neutral-800/80">
                {socials.map((s) => (
                  <Badge
                    key={s.label}
                    href={s.url}
                    tone="neutral"
                    className="font-mono text-xs bg-[#141419] border border-neutral-700/80 text-neutral-200 hover:border-[#e60026] hover:text-white transition-all duration-200 shadow-sm"
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Bio Text & Dossier Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Main Bio Container */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.3, ease: APPLE_EASE } }}
            className="relative border border-[#e60026]/40 bg-[#0a0a0d]/95 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(230,0,38,0.15)] rounded-sm transition-all duration-300 hover:border-[#e60026] transform-gpu"
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026]"
            />
            <span
              aria-hidden
              className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026]"
            />

            <h2 className="eyebrow mb-4 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
              />
              {labels.introTitle}
            </h2>
            <p className="font-mono text-base sm:text-lg leading-relaxed text-neutral-200">
              {labels.introText}
            </p>
          </motion.div>

          {/* Dossier Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="border border-[#e60026]/30 bg-[#0e0407]/80 p-4 rounded-sm shadow-md">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#ff2a4b]">
                AFFILIATION / TEAM
              </p>
              <p className="mt-1 text-sm font-black text-white">ARESx CTF Team</p>
              <p className="mt-1 text-xs text-neutral-400">Web Exploitation & Vulnerability Triage</p>
            </div>

            <div className="border border-[#e60026]/30 bg-[#0e0407]/80 p-4 rounded-sm shadow-md">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#ff2a4b]">
                ACADEMICS
              </p>
              <p className="mt-1 text-sm font-black text-white">FPT University Da Nang</p>
              <p className="mt-1 text-xs text-neutral-400">Information Assurance (Expected 2027)</p>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/writeups"
              className={buttonLinkClasses({ variant: "primary", size: "sm" })}
            >
              {labels.writeupsNav} <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/contact"
              className={buttonLinkClasses({ variant: "outline", size: "sm" })}
            >
              {labels.contactNav}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Interactive Cyber Tabbed Navigation ── */}
      <div className="mt-20 border-b border-neutral-800 pb-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 font-bold uppercase tracking-wider transition-colors duration-200 ${
                  isActive ? "text-white" : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.count !== undefined ? (
                    <span
                      className={`px-1.5 py-0.5 text-[0.65rem] rounded-[2px] ${
                        isActive
                          ? "bg-[#e60026] text-white"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </span>

                {/* Sliding Gliding Active Indicator Line */}
                {isActive ? (
                  <motion.span
                    layoutId="active-about-tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#e60026] shadow-[0_0_12px_#e60026]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Tab Content Switcher with GPU-Accelerated Smooth Motion ── */}
      <div className="mt-10 min-h-[320px]">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: APPLE_EASE }}
              className="space-y-12 font-mono transform-gpu"
            >
              {/* Philosophy Quote */}
              <div className="relative overflow-hidden border border-[#e60026]/40 bg-[#0a0a0d]/95 px-6 py-10 md:px-10 backdrop-blur-xl shadow-[0_0_35px_rgba(230,0,38,0.18)] rounded-sm">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
                />
                <span
                  aria-hidden
                  className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
                />

                <p className="eyebrow relative mb-4 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
                  />
                  {labels.philosophyTitle}
                </p>
                <blockquote className="relative max-w-3xl text-pretty font-mono text-lg leading-relaxed text-neutral-200 md:text-xl">
                  “{labels.philosophyText}”
                </blockquote>
              </div>

              {/* Security Interests Tags */}
              <div>
                <h3 className="eyebrow mb-6 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
                  />
                  {labels.interestsTitle}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {interests.map((tag) => (
                    <Badge
                      key={tag.name}
                      href={`/tags/${tag.name}`}
                      tone="neutral"
                      className="font-mono text-xs bg-[#141419] border border-neutral-700/80 text-neutral-200 hover:border-[#e60026] hover:text-white transition-all duration-200 shadow-sm"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div
              key="skills-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: APPLE_EASE }}
              className="space-y-8 font-mono transform-gpu"
            >
              <h3 className="eyebrow flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
                />
                {labels.skillsTitle}
              </h3>

              <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                {skills.map((s) => (
                  <motion.div
                    key={s.label}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="p-4 border border-neutral-800/80 bg-[#0a0a0d]/90 rounded-sm backdrop-blur-md transition-all hover:border-[#e60026]/60 shadow-md"
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-3 text-xs">
                      <span className="font-bold text-white tracking-wide">{s.label}</span>
                      <span className="font-black text-[#ff2a4b] px-2 py-0.5 bg-[#e60026]/10 border border-[#e60026]/40 rounded-[2px]">
                        {s.level}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-sm bg-neutral-900 border border-neutral-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.level}%` }}
                        transition={{ duration: 0.8, ease: APPLE_EASE }}
                        className="h-full bg-gradient-to-r from-[#e60026] via-[#ff2a4b] to-white shadow-[0_0_12px_#e60026]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "experience" && (
            <motion.div
              key="experience-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: APPLE_EASE }}
              className="space-y-16 font-mono transform-gpu"
            >
              {/* Experience Timeline */}
              <div>
                <h3 className="eyebrow mb-8 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
                  />
                  {labels.experienceTitle}
                </h3>

                <div className="relative border-l-2 border-[#e60026]/40 pl-6 sm:pl-8 ml-3 space-y-8">
                  {experience.map((exp) => (
                    <div key={exp.org} className="relative group">
                      {/* Pulsing Node */}
                      <span
                        aria-hidden
                        className="absolute -left-[31px] sm:-left-[39px] top-6 h-3.5 w-3.5 rounded-full bg-[#e60026] border-2 border-black shadow-[0_0_12px_#e60026] transition-transform duration-300 group-hover:scale-125"
                      />

                      <motion.div
                        whileHover={{ y: -4, transition: { duration: 0.25 } }}
                        className="relative border border-[#e60026]/40 bg-[#0a0a0d]/90 p-6 backdrop-blur-xl shadow-[0_0_25px_rgba(230,0,38,0.15)] rounded-sm transition-all duration-300 hover:border-[#e60026] hover:shadow-[0_0_35px_rgba(230,0,38,0.35)]"
                      >
                        <span
                          aria-hidden
                          className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026]"
                        />
                        <span
                          aria-hidden
                          className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026]"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-base font-black uppercase text-white group-hover:text-[#ff2a4b] transition-colors">
                            {locale === "vi" ? exp.roleVi : exp.roleEn}
                          </h4>
                          <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff2a4b] bg-[#e60026]/10 px-2 py-0.5 border border-[#e60026]/30 rounded-[2px]">
                            {exp.period}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-neutral-300">{exp.org}</p>
                        <p className="mt-3.5 text-xs leading-relaxed text-neutral-300">
                          {locale === "vi" ? exp.descVi : exp.descEn}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Projects Grid */}
              <div>
                <h3 className="eyebrow mb-8 flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
                  />
                  Projects & Homelabs
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {projects.map((proj) => (
                    <motion.div
                      key={proj.titleEn}
                      whileHover={{ y: -5, transition: { duration: 0.25 } }}
                      className="h-full"
                    >
                      <div className="relative flex flex-col justify-between h-full border border-[#e60026]/40 bg-[#0a0a0d]/90 p-6 backdrop-blur-xl shadow-[0_0_25px_rgba(230,0,38,0.15)] rounded-sm transition-all duration-300 hover:border-[#e60026] hover:shadow-[0_0_35px_rgba(230,0,38,0.35)] group">
                        <span
                          aria-hidden
                          className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026]"
                        />
                        <span
                          aria-hidden
                          className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026]"
                        />

                        <div>
                          <h4 className="font-mono text-sm font-black uppercase text-white group-hover:text-[#ff2a4b] transition-colors">
                            {locale === "vi" ? proj.titleVi : proj.titleEn}
                          </h4>
                          {proj.url ? (
                            <p className="mt-1 font-mono text-xs font-bold text-[#ff2a4b]">
                              {proj.url}
                            </p>
                          ) : null}
                          <p className="mt-3.5 font-mono text-xs leading-relaxed text-neutral-300">
                            {locale === "vi" ? proj.descVi : proj.descEn}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "certs" && (
            <motion.div
              key="certs-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: APPLE_EASE }}
              className="space-y-8 font-mono transform-gpu"
            >
              <h3 className="eyebrow flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff2a4b]">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026] animate-pulse"
                />
                {labels.certificationsTitle}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {certs.map((c) => (
                  <motion.div
                    key={c.name}
                    whileHover={{ y: -3, transition: { duration: 0.25 } }}
                  >
                    <div className="relative flex items-center justify-between gap-4 border border-[#e60026]/40 bg-[#0a0a0d]/90 px-5 py-4 backdrop-blur-xl rounded-sm transition-all hover:border-[#e60026] hover:shadow-[0_0_20px_rgba(230,0,38,0.25)]">
                      <span
                        aria-hidden
                        className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#e60026]"
                      />
                      <span
                        aria-hidden
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#e60026]"
                      />

                      <div className="flex items-center gap-3">
                        <Lock className="text-lg text-[#ff2a4b]" aria-hidden />
                        <div>
                          <p className="text-sm font-extrabold text-white">{c.name}</p>
                          <p className="text-xs text-neutral-400">
                            {c.issuer} · {c.year}
                          </p>
                        </div>
                      </div>
                      <Badge
                        tone={c.status === "earned" ? "mint" : "warn"}
                        className="shrink-0 text-xs font-bold"
                      >
                        {c.status === "earned"
                          ? locale === "vi"
                            ? "Đã đạt"
                            : "Earned"
                          : locale === "vi"
                            ? "Đang ôn"
                            : "In progress"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
