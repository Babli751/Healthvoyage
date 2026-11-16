"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitInquiry, type InquiryState } from "@/app/[locale]/contact/actions";

interface Props {
  sanatoriumId?: number;
  sanatoriumName?: string;
  compact?: boolean;
}

export function InquiryForm({ sanatoriumId, sanatoriumName, compact }: Props) {
  const t = useTranslations("form");
  const [state, action, pending] = useActionState<InquiryState | null, FormData>(submitInquiry, null);

  if (state?.ok) {
    return (
      <div className="inquiry-success">
        <div className="inquiry-success-icon">✓</div>
        <h3>{t("successTitle")}</h3>
        <p>{sanatoriumName ? t("successBodyResort", { name: sanatoriumName }) : t("successBody")}</p>
      </div>
    );
  }

  return (
    <form action={action} className={`inquiry-form ${compact ? "compact" : ""}`}>
      {sanatoriumId && <input type="hidden" name="sanatoriumId" value={sanatoriumId} />}
      {sanatoriumName && <input type="hidden" name="sanatoriumName" value={sanatoriumName} />}

      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />

      <div className="inquiry-grid">
        <label className="field">
          <span>{t("fullName")}</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="field">
          <span>{t("email")}</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label className="field">
          <span>{t("phone")}</span>
          <input name="phone" autoComplete="tel" />
        </label>
        <label className="field">
          <span>{t("country")}</span>
          <input name="country" autoComplete="country-name" />
        </label>
      </div>

      <label className="field">
        <span>{t("help")}</span>
        <textarea
          name="message"
          required
          rows={compact ? 3 : 4}
          placeholder={sanatoriumName ? t("placeholderResort", { name: sanatoriumName }) : t("placeholderGeneric")}
        />
      </label>

      {state?.error && <p className="form-error">{state.error}</p>}

      <button className="btn" type="submit" disabled={pending}>
        {pending ? t("sending") : t("submit")}
      </button>
      <p className="inquiry-note">{t("note")}</p>
    </form>
  );
}
