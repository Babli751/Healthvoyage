"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/contact/actions";
import { IconBadge, IconArrowRight } from "@/components/Icon";

export function ConsultCta({ treatments }: { treatments: string[] }) {
  const [state, action, pending] = useActionState<InquiryState | null, FormData>(submitInquiry, null);

  return (
    <section id="consult" className="container sec">
      <div className="reveal consult grad-primary">
        <div className="consult-orb" aria-hidden="true" />
        <div className="consult-left">
          <h2 className="sectitle" style={{ color: "#fff" }}>Get a free personal treatment plan</h2>
          <p>Tell us about your condition. A coordinator will reply within 24 hours with suitable resorts and prices.</p>
          <ul className="consult-list">
            {["No obligation, 100% free", "Reply within 24 hours", "Your data stays confidential"].map((x) => (
              <li key={x}><IconBadge width={20} height={20} /> {x}</li>
            ))}
          </ul>
        </div>

        <form action={action} className="consult-form">
          {state?.ok ? (
            <div className="consult-done">
              <IconBadge width={52} height={52} />
              <h3>Thank you!</h3>
              <p>We&apos;ll be in touch shortly.</p>
            </div>
          ) : (
            <>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />
              <input required name="name" placeholder="Full name" />
              <div className="consult-row">
                <input required type="email" name="email" placeholder="Email" />
                <input name="phone" placeholder="Phone / WhatsApp" />
              </div>
              <select name="country" defaultValue="">
                <option value="">Treatment of interest</option>
                {treatments.map((t) => <option key={t} value="">{t}</option>)}
              </select>
              <textarea name="message" rows={3} placeholder="Describe your condition (optional)" defaultValue="Requesting a free treatment plan." />
              {state?.error && <p className="form-error">{state.error}</p>}
              <button className="consult-btn grad-primary" disabled={pending}>
                {pending ? "Sending…" : <>Request free plan <IconArrowRight width={16} height={16} /></>}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
