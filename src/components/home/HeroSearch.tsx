"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconSearch, IconMapPin } from "@/components/Icon";

type Opt = { value: string; label: string };

export function HeroSearch({
  action,
  treatments,
  countries,
}: {
  action: string;
  treatments: Opt[];
  countries: Opt[];
}) {
  const t = useTranslations("home");
  const [treatment, setTreatment] = useState("");
  const [country, setCountry] = useState("");

  const treatmentSel = useRef<HTMLSelectElement>(null);
  const countrySel = useRef<HTMLSelectElement>(null);

  // Open a native <select> when the whole field is clicked (not just the arrow).
  function openSelect(el: HTMLSelectElement | null) {
    if (!el) return;
    if (typeof (el as unknown as { showPicker?: () => void }).showPicker === "function") {
      try {
        (el as unknown as { showPicker: () => void }).showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    el.focus();
  }

  const treatmentLabel =
    treatments.find((o) => o.value === treatment)?.label ?? t("searchAnyTreatment");
  const countryLabel =
    countries.find((o) => o.value === country)?.label ?? t("searchAnyDestination");

  return (
    <form action={action} className="hero2-search">
      <div className="hero2-field" onClick={() => openSelect(treatmentSel.current)}>
        <IconSearch width={20} height={20} />
        <span>
          <small>{t("searchTreatment")}</small>
          <span className="hero2-value">{treatmentLabel}</span>
        </span>
        <select
          ref={treatmentSel}
          className="hero2-hit"
          name="treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          aria-label={t("searchTreatment")}
        >
          <option value="">{t("searchAnyTreatment")}</option>
          {treatments.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg className="hero2-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>

      <div className="hero2-field hero2-field-div" onClick={() => openSelect(countrySel.current)}>
        <IconMapPin width={20} height={20} />
        <span>
          <small>{t("searchDestination")}</small>
          <span className="hero2-value">{countryLabel}</span>
        </span>
        <select
          ref={countrySel}
          className="hero2-hit"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          aria-label={t("searchDestination")}
        >
          <option value="">{t("searchAnyDestination")}</option>
          {countries.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg className="hero2-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>

      <button className="hero2-search-btn grad-primary">
        <IconSearch width={20} height={20} /> {t("searchBtn")}
      </button>
    </form>
  );
}
