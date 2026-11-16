// One-off, SAFE additive seed: inserts the Czech Republic + its resorts only.
// Does NOT truncate. Idempotent: skips the country if it already exists.
// Run: tsx db/add-czech.ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const env = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch { /* ignore */ }
}
loadEnv();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Candidate image ids (same pools as seed.ts). We pick ones not already used in DB.
const IMG_CANDIDATES = [
  "39440977", "13230442", "28518909", "31138249", "32963833", "28407597", "15083379", "7041600", "13245235", "7222178",
  "19666207", "19666192", "6187418", "7365437", "3757640", "8298854", "26846554", "10610447", "19737856", "7222168",
  "19150538", "7233264", "20669197", "1612351", "2259226", "27429700", "37729825", "10613691", "7820689",
];

const COUNTRY = {
  name: "Czech Republic",
  flag: "🇨🇿",
  blurb: "Karlovy Vary, Mariánské Lázně and Františkovy Lázně — world-famous spa towns with mineral springs, drinking cures and peat mud for digestive, metabolic and musculoskeletal care.",
};

// name, city, stars, summary, description, treatment-tag-slugs
const RESORTS: Array<{ name: string; city: string; stars: number | null; summary: string; description: string; treatments: string[] }> = [
  { name: "Hotel Mozart", city: "Karlovy Vary", stars: 3, summary: "Cozy spa hotel in the historic centre near the colonnades and springs.", description: "A small, cozy three-star spa hotel in the historic centre of Karlovy Vary, close to the colonnades and mineral springs. Treatment procedures are carried out at the medical centre of the neighbouring Atlantic Palace hotel. Treats gastrointestinal disease, metabolic disorders, diabetes, excess weight and musculoskeletal conditions.", treatments: ["digestive-system", "endocrine-and-metabolism", "diabetes", "musculoskeletal-and-joints", "balneotherapy-mineral-water"] },
  { name: "Spa Hotel Čajkovskij", city: "Karlovy Vary", stars: 4, summary: "Spa hotel built around the traditional Karlovy Vary drinking cure.", description: "A four-star medical-wellness hotel in the resort part of Karlovy Vary, near the mineral springs and colonnades. Its treatment wing offers medical consultations, a mineral-water drinking cure, therapeutic baths, massage and physiotherapy. Main focus is the traditional Karlovy Vary drinking cure for gastrointestinal, digestive and metabolic disorders, plus some musculoskeletal problems.", treatments: ["digestive-system", "endocrine-and-metabolism", "musculoskeletal-and-joints", "balneotherapy-mineral-water"] },
  { name: "Bristol Vila Tereza", city: "Karlovy Vary", stars: 4, summary: "Historic-villa spa hotel with pool, jacuzzi and drinking cure.", description: "A cozy four-star spa hotel in a historic villa near the resort colonnades and mineral springs, with a treatment wing, pool, jacuzzi, saunas and fitness centre. Offers mineral-water drinking cures, therapeutic baths, massages and physiotherapy. Treats gastrointestinal disease, metabolic disorders, excess weight, some kidney and urinary-tract conditions and musculoskeletal problems, with rehabilitation and wellness programs.", treatments: ["digestive-system", "endocrine-and-metabolism", "urology-and-kidneys", "musculoskeletal-and-joints", "balneotherapy-mineral-water", "rehabilitation"] },
  { name: "Hotel Kriváň", city: "Mariánské Lázně", stars: 4, summary: "Central sanatorium hotel with own treatment centre, pool and sauna.", description: "A sanatorium hotel in the centre of Mariánské Lázně, near the main colonnade and mineral springs, with its own treatment centre, pool and sauna. Treatment is based on mineral water, therapeutic peat and physiotherapy. Treats gastrointestinal, kidney and urinary-tract disease, metabolic disorders, respiratory, skin, nervous-system and musculoskeletal conditions.", treatments: ["digestive-system", "urology-and-kidneys", "endocrine-and-metabolism", "respiratory", "skin-conditions", "nervous-system", "musculoskeletal-and-joints", "balneotherapy-mineral-water", "mud-therapy"] },
  { name: "Ensana Health Spa Hotel Butterfly", city: "Mariánské Lázně", stars: 4, summary: "Modern spa hotel with its own Ferdinand mineral spring.", description: "A modern four-star sanatorium hotel next to the resort park and colonnades in Mariánské Lázně, with an indoor pool, jacuzzi, sauna and treatment wing. Its special feature is its own Ferdinand mineral spring, whose water is used for drinking cures and mineral baths. Treats digestive, kidney and urinary-tract disease, metabolic disorders, joint and spine conditions and respiratory and nervous-system disorders.", treatments: ["digestive-system", "urology-and-kidneys", "endocrine-and-metabolism", "musculoskeletal-and-joints", "respiratory", "nervous-system", "balneotherapy-mineral-water"] },
  { name: "Art Deco Wolker", city: "Karlovy Vary", stars: 4, summary: "Historic-building hotel, part of the ASTORIA Hotel & Medical Spa.", description: "A cozy hotel in a historic building in the centre of Karlovy Vary, near the Vřídelní and Market colonnades. It is part of the ASTORIA Hotel & Medical Spa complex: accommodation is in Wolker, while meals and treatment procedures take place in the main ASTORIA building about 5 minutes' walk away. Treats gastrointestinal disease, metabolic disorders, musculoskeletal conditions, excess weight and states of physical exhaustion.", treatments: ["digestive-system", "endocrine-and-metabolism", "musculoskeletal-and-joints", "balneotherapy-mineral-water", "rehabilitation"] },
  { name: "Goethe Spa & Medical Hotel", city: "Františkovy Lázně", stars: 3, summary: "Classic spa hotel for heart, joints and gynecological care.", description: "A cozy classic three-star treatment hotel in the centre of Františkovy Lázně, near the colonnade and mineral springs. Main profile: heart and cardiovascular disease, musculoskeletal, joint and spine conditions, gynecological disease, rehabilitation after oncological treatment, and digestive and nervous-system disorders. Procedures include mineral and carbon-dioxide baths, mud applications, massages, physiotherapy, electrotherapy, magnetotherapy, oxygen therapy and therapeutic gymnastics.", treatments: ["cardiovascular", "musculoskeletal-and-joints", "gynecology", "digestive-system", "nervous-system", "balneotherapy-mineral-water", "mud-therapy", "rehabilitation"] },
  { name: "Spa Hotel Silva", city: "Mariánské Lázně", stars: 4, summary: "Quiet forest-edge spa hotel focused on respiratory recovery.", description: "A cozy four-star spa hotel in a quiet, scenic spot on the edge of the forest, near the famous colonnade and mineral springs. Main profile: respiratory disease, recovery after illness, general strengthening of the body, stress relief, and relief of muscle tension and chronic fatigue, with special attention to respiratory health including after COVID-19. Procedures include mineral and herbal baths, pearl baths, underwater massage, dry CO₂ baths, mineral-water inhalations, oxygen therapy, physiotherapy, wraps and sauna.", treatments: ["respiratory", "rehabilitation", "nervous-system", "balneotherapy-mineral-water", "spa-and-wellness"] },
  { name: "Humboldt Park Hotel & Spa", city: "Karlovy Vary", stars: 4, summary: "Elegant 19th-century villa hotel near the Mill Colonnade.", description: "An elegant four-star medical-wellness hotel in a historic 19th-century villa in the centre of Karlovy Vary, near the famous Mill Colonnade and thermal springs. Main profile: gastrointestinal disease, metabolic disorders (diabetes, gout), musculoskeletal conditions, rheumatism and arthrosis, plus general health and body-strengthening programs.", treatments: ["digestive-system", "endocrine-and-metabolism", "diabetes", "musculoskeletal-and-joints", "balneotherapy-mineral-water"] },
  { name: "Karlsbad Grande Madonna", city: "Karlovy Vary", stars: 4, summary: "Comfortable spa hotel steps from the Vřídlo thermal spring.", description: "A comfortable four-star medical-wellness hotel in the historic centre of Karlovy Vary, just 100–150 m from the famous Vřídlo thermal spring and the treatment colonnades. Main profile: gastrointestinal disease, liver and gallbladder, metabolic disorders and supportive treatment of musculoskeletal conditions. Procedures include a mineral-water drinking cure, thermal baths with natural Vřídlo water (72°C), mud procedures, carbon-dioxide baths, massages, hydrotherapy, physiotherapy and HIL therapy, supervised by doctors and tailored individually.", treatments: ["digestive-system", "endocrine-and-metabolism", "musculoskeletal-and-joints", "balneotherapy-mineral-water", "mud-therapy"] },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Skip if already added.
    const existing = await client.query("SELECT id FROM countries WHERE slug = $1", [slugify(COUNTRY.name)]);
    if (existing.rows.length > 0) {
      console.log("Czech Republic already exists — nothing to do.");
      await client.query("ROLLBACK");
      return;
    }

    // Resolve treatment slug -> id (treatments are shared; they already exist).
    const { rows: tr } = await client.query<{ id: number; slug: string }>("SELECT id, slug FROM treatments");
    const tId = new Map(tr.map((r) => [r.slug, r.id]));
    for (const r of RESORTS) {
      for (const slug of r.treatments) {
        if (!tId.has(slug)) throw new Error(`Unknown treatment slug: ${slug}`);
      }
    }

    // Pick images not already used by any sanatorium. Prefer the curated
    // candidates, then fall back to any other unused /public/img/*.jpg on disk.
    const { rows: used } = await client.query<{ image: string | null }>("SELECT image FROM sanatoriums");
    const usedIds = new Set(used.map((u) => (u.image ?? "").replace(/^\/img\/|\.jpg$/g, "")));
    const onDisk = readdirSync(join(process.cwd(), "public", "img"))
      .filter((f) => f.endsWith(".jpg"))
      .map((f) => f.replace(/\.jpg$/, ""));
    const pool2 = [...IMG_CANDIDATES, ...onDisk.filter((id) => !IMG_CANDIDATES.includes(id))];
    const free = pool2.filter((id) => !usedIds.has(id));
    if (free.length < RESORTS.length) throw new Error(`Not enough free images: need ${RESORTS.length}, have ${free.length}`);

    const countrySlug = slugify(COUNTRY.name);
    const { rows: cr } = await client.query<{ id: number }>(
      "INSERT INTO countries (name, slug, flag, blurb, cover) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [COUNTRY.name, countrySlug, COUNTRY.flag, COUNTRY.blurb, `/countries/${countrySlug}.jpg`]
    );
    const countryId = cr[0].id;

    let i = 0;
    for (const r of RESORTS) {
      const image = `/img/${free[i++]}.jpg`;
      const { rows: sr } = await client.query<{ id: number }>(
        `INSERT INTO sanatoriums (name, slug, city, stars, summary, description, image, country_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [r.name, slugify(`${r.name}-${r.city}`), r.city, r.stars, r.summary, r.description, image, countryId]
      );
      const sanId = sr[0].id;
      for (const slug of r.treatments) {
        await client.query(
          "INSERT INTO sanatorium_treatments (sanatorium_id, treatment_id) VALUES ($1,$2)",
          [sanId, tId.get(slug)!]
        );
      }
    }

    await client.query("COMMIT");
    console.log(`Done. Added Czech Republic + ${RESORTS.length} resorts.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
