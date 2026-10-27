import { IconAward } from "@/components/Icon";

const PARTNERS = [
  "Medical Tourism Association", "ISO 9001 Certified", "Ministry of Health Licensed",
  "Booking Verified", "TripAdvisor Excellence", "European Spas Association", "Thermal Spa Network",
];

export function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...PARTNERS, ...PARTNERS].map((p, i) => (
          <span key={i} className="marquee-item"><IconAward width={18} height={18} /> {p}</span>
        ))}
      </div>
    </div>
  );
}
