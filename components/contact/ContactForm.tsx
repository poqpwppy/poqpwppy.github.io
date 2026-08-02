"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { profile } from "@/lib/profile";
import { Check } from "@/components/icons";

type Field = "name" | "email" | "subject" | "message";

const inputClass =
  "w-full border border-neutral-800 bg-[#07070a]/90 px-4 py-3 font-mono text-sm text-white placeholder:text-neutral-500 focus:border-[#e60026] focus:shadow-[0_0_12px_rgba(230,0,38,0.3)] focus:outline-none transition-all duration-300 rounded-sm";

/** Client contact form — validates, then opens a prefilled mailto. */
export function ContactForm() {
  const t = useTranslations("contact");
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function update(field: Field) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus("sending");
    const subject = encodeURIComponent(
      values.subject.trim() || "Portfolio contact",
    );
    const body = encodeURIComponent(
      `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 6000);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cf-name"
            className="mb-2 block font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-neutral-300"
          >
            {t("formName")} <span className="text-[#ff2a4b]">*</span>
          </label>
          <input
            id="cf-name"
            type="text"
            value={values.name}
            onChange={update("name")}
            placeholder={t("formNamePlaceholder")}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label
            htmlFor="cf-email"
            className="mb-2 block font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-neutral-300"
          >
            {t("formEmail")} <span className="text-[#ff2a4b]">*</span>
          </label>
          <input
            id="cf-email"
            type="email"
            value={values.email}
            onChange={update("email")}
            placeholder={t("formEmailPlaceholder")}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="cf-subject"
          className="mb-2 block font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-neutral-300"
        >
          {t("formSubject")}
        </label>
        <input
          id="cf-subject"
          type="text"
          value={values.subject}
          onChange={update("subject")}
          placeholder={t("formSubjectPlaceholder")}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="cf-message"
          className="mb-2 block font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-neutral-300"
        >
          {t("formMessage")} <span className="text-[#ff2a4b]">*</span>
        </label>
        <textarea
          id="cf-message"
          rows={6}
          value={values.message}
          onChange={update("message")}
          placeholder={t("formMessagePlaceholder")}
          className={`${inputClass} resize-y`}
          required
        />
      </div>

      {invalid ? (
        <p role="alert" className="border-l-2 border-[#e60026] bg-[#1a0005] px-4 py-2.5 font-mono text-xs text-[#ff2a4b]">
          {t("formRequired")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="cursor-pointer border border-[#e60026] bg-[#e60026] px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_0_20px_rgba(230,0,38,0.4)] transition-all duration-300 hover:bg-[#ff2a4b] hover:border-[#ff2a4b] hover:shadow-[0_0_30px_rgba(230,0,38,0.6)] disabled:cursor-wait disabled:opacity-60 rounded-sm"
        >
          {status === "sending" ? t("formSending") : t("formSend")}
        </button>
        {status === "sent" ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 font-bold">
            <Check className="text-[0.95em]" aria-hidden />
            {t("formSent")}
          </span>
        ) : null}
      </div>
    </form>
  );
}

