"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitInquiry, type InquiryState } from "@/app/[locale]/contact/actions";
import { IconBadge, IconArrowRight } from "@/components/Icon";

export function ConsultCta({ treatments }: { treatments: string[] }) {
  const t = useTranslations("consult");
  const [state, action, pending] = useActionState<InquiryState | null, FormData>(submitInquiry, null);

  return (
    <section id="consult" className="container sec">
      <div className="reveal consult grad-primary">
        <div className="consult-orb" aria-hidden="true" />
        <div className="consult-left">
          <h2 className="sectitle" style={{ color: "#fff" }}>{t("title")}</h2>
          <p>{t("subtitle")}</p>
          <ul className="consult-list">
            {[t("b1"), t("b2"), t("b3")].map((x) => (
              <li key={x}><IconBadge width={20} height={20} /> {x}</li>
            ))}
          </ul>
        </div>

        <form action={action} className="consult-form">
          {state?.ok ? (
            <div className="consult-done">
              <IconBadge width={52} height={52} />
              <h3>{t("thanks")}</h3>
              <p>{t("thanksSub")}</p>
            </div>
          ) : (
            <>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />
              <input required name="name" placeholder={t("fullName")} />
              <div className="consult-row">
                <input required type="email" name="email" placeholder={t("email")} />
                <input name="phone" placeholder={t("phone")} />
              </div>
              <select name="country" defaultValue="">
                <option value="">{t("treatmentOfInterest")}</option>
                {treatments.map((tr) => <option key={tr} value="">{tr}</option>)}
              </select>
              <textarea name="message" rows={3} placeholder={t("describe")} defaultValue={t("defaultMsg")} />
              {state?.error && <p className="form-error">{state.error}</p>}
              <button className="consult-btn grad-primary" disabled={pending}>
                {pending ? t("sending") : <>{t("submit")} <IconArrowRight width={16} height={16} /></>}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
