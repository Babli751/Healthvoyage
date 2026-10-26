import type { Metadata } from "next";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Contact & Free Consultation — HealthVoyage",
  description:
    "Request a free consultation for treatment abroad. Tell us your condition and preferred destination and our coordinators will help.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Request a free consultation</h1>
          <p>
            Tell us about your condition and where you&apos;d like to be treated. Our
            coordinators arrange consultations, treatment programs and transfers for
            international patients — at no cost to you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-main">
            <InquiryForm />
          </div>
          <aside className="contact-aside">
            <h3>Other ways to reach us</h3>
            <ul className="contact-list">
              <li><strong>Email</strong><br /><a href="mailto:info@healthvoyage.com">info@healthvoyage.com</a></li>
              <li><strong>Response time</strong><br />Usually within 1 business day</li>
              <li><strong>Languages</strong><br />English, Russian, Azerbaijani, Turkish</li>
            </ul>
            <div className="contact-steps">
              <p><strong>What happens next?</strong></p>
              <ol>
                <li>We review your request and confirm suitable resorts.</li>
                <li>We send you programs, pricing and availability.</li>
                <li>We help arrange travel, transfers and documents.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
