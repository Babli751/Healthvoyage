"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/contact/actions";

interface Props {
  sanatoriumId?: number;
  sanatoriumName?: string;
  compact?: boolean;
}

export function InquiryForm({ sanatoriumId, sanatoriumName, compact }: Props) {
  const [state, action, pending] = useActionState<InquiryState | null, FormData>(submitInquiry, null);

  if (state?.ok) {
    return (
      <div className="inquiry-success">
        <div className="inquiry-success-icon">✓</div>
        <h3>Thank you — we&apos;ve received your request.</h3>
        <p>Our team will get back to you by email shortly{sanatoriumName ? ` about ${sanatoriumName}` : ""}.</p>
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
          <span>Full name *</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="field">
          <span>Email *</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label className="field">
          <span>Phone / WhatsApp</span>
          <input name="phone" autoComplete="tel" />
        </label>
        <label className="field">
          <span>Your country</span>
          <input name="country" autoComplete="country-name" />
        </label>
      </div>

      <label className="field">
        <span>How can we help? *</span>
        <textarea
          name="message"
          required
          rows={compact ? 3 : 4}
          placeholder={sanatoriumName ? `I'm interested in ${sanatoriumName}…` : "Describe your condition, preferred destination and dates…"}
        />
      </label>

      {state?.error && <p className="form-error">{state.error}</p>}

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Request a free consultation"}
      </button>
      <p className="inquiry-note">Free service. We&apos;ll never share your details with third parties.</p>
    </form>
  );
}
