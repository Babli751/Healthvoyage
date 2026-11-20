"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/hero/b1.jpg", alt: "Spa pool" },
  { src: "/hero/b2.jpg", alt: "Wellness spa" },
  { src: "/hero/b3.jpg", alt: "Mineral spring" },
  { src: "/hero/b4.jpg", alt: "Mud therapy" },
  { src: "/hero/b5.jpg", alt: "Therapeutic treatment" },
  { src: "/hero/b6.jpg", alt: "Robotic therapy" },
  { src: "/hero/b7.jpg", alt: "Hospital" },
];

export function HeroCarousel({ fullBleed = false }: { fullBleed?: boolean }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  if (fullBleed) {
    return (
      <div className="hero3-bg">
        {SLIDES.map((s, idx) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            sizes="100vw"
            priority={idx === 0}
            className={`hero3-slide ${idx === i ? "is-active" : ""}`}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="hero3-arch">
      {SLIDES.map((s, idx) => (
        <Image
          key={s.src}
          src={s.src}
          alt={s.alt}
          fill
          sizes="100vw"
          priority={idx === 0}
          className={`hero3-slide ${idx === i ? "is-active" : ""}`}
          style={{ objectFit: "cover" }}
        />
      ))}
      {!fullBleed && (
        <div className="hero3-dotsnav" aria-hidden="true">
          {SLIDES.map((_, idx) => (
            <span key={idx} className={idx === i ? "on" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}
