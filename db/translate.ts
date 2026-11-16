/**
 * Auto-translate EN DB content into RU + AZ, filling the *_ru / *_az columns.
 *
 * Uses the free MyMemory translation API (no key). It is rate-limited, so we
 * translate sequentially with small pauses and cache identical strings.
 *
 * Run (local):  npx tsx db/translate.ts
 * Run (server): DATABASE_URL="postgresql://hv_user:hvpass2026@localhost:5432/healthvoyage" npx tsx db/translate.ts
 *
 * Idempotent-ish: only fills columns that are still NULL, so re-running resumes.
 * Proper-noun fields (resort/person names) are copied as-is, not translated.
 */
import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://hv_user:hvpass2026@localhost:5432/healthvoyage";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("localhost")
    ? undefined
    : { rejectUnauthorized: false },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const cache = new Map<string, string>();

// MyMemory: translate plain text EN -> target ("ru" | "az").
async function mt(text: string, target: "ru" | "az"): Promise<string> {
  const key = `${target}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  if (!text || !text.trim()) return text;

  // API caps each call ~500 bytes; split long text on sentence boundaries.
  const chunks = splitForApi(text, 450);
  const out: string[] = [];
  for (const chunk of chunks) {
    let translated = chunk;
    try {
      const url =
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(chunk) +
        `&langpair=en|${target}`;
      const res = await fetch(url);
      const json: any = await res.json();
      const t = json?.responseData?.translatedText;
      if (t && typeof t === "string" && !/MYMEMORY WARNING/i.test(t)) {
        translated = t;
      }
    } catch {
      /* keep original chunk on failure */
    }
    out.push(translated);
    await sleep(250); // be gentle with the free endpoint
  }
  const result = out.join(" ");
  cache.set(key, result);
  return result;
}

// Translate an HTML string: translate text nodes, keep tags intact.
async function mtHtml(html: string, target: "ru" | "az"): Promise<string> {
  if (!html) return html;
  const parts = html.split(/(<[^>]+>)/g); // tags vs text
  const translated: string[] = [];
  for (const part of parts) {
    if (part.startsWith("<") || !part.trim()) {
      translated.push(part);
    } else {
      translated.push(await mt(part, target));
    }
  }
  return translated.join("");
}

function splitForApi(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let buf = "";
  for (const sentence of text.split(/(?<=[.!?。])\s+/)) {
    if ((buf + " " + sentence).length > max) {
      if (buf) out.push(buf);
      buf = sentence;
    } else {
      buf = buf ? buf + " " + sentence : sentence;
    }
  }
  if (buf) out.push(buf);
  return out;
}

async function run() {
  console.log("Translating DB content EN -> RU + AZ (MyMemory free API)…");

  // 1) countries: name + blurb
  const countries = await pool.query(
    `SELECT id, name, blurb FROM countries
     WHERE name_ru IS NULL OR name_az IS NULL`
  );
  for (const c of countries.rows) {
    const name_ru = await mt(c.name, "ru");
    const name_az = await mt(c.name, "az");
    const blurb_ru = c.blurb ? await mt(c.blurb, "ru") : null;
    const blurb_az = c.blurb ? await mt(c.blurb, "az") : null;
    await pool.query(
      `UPDATE countries SET name_ru=$1, name_az=$2, blurb_ru=$3, blurb_az=$4 WHERE id=$5`,
      [name_ru, name_az, blurb_ru, blurb_az, c.id]
    );
    console.log(`  country: ${c.name} -> ${name_ru} / ${name_az}`);
  }

  // 2) treatments: name
  const treatments = await pool.query(
    `SELECT id, name FROM treatments WHERE name_ru IS NULL OR name_az IS NULL`
  );
  for (const t of treatments.rows) {
    const name_ru = await mt(t.name, "ru");
    const name_az = await mt(t.name, "az");
    await pool.query(`UPDATE treatments SET name_ru=$1, name_az=$2 WHERE id=$3`, [
      name_ru,
      name_az,
      t.id,
    ]);
    console.log(`  treatment: ${t.name} -> ${name_ru} / ${name_az}`);
  }

  // 3) sanatoriums: summary + description translated; NAME kept as-is (proper noun)
  const sanas = await pool.query(
    `SELECT id, name, summary, description FROM sanatoriums
     WHERE summary_ru IS NULL OR description_ru IS NULL`
  );
  for (const s of sanas.rows) {
    const summary_ru = await mt(s.summary, "ru");
    const summary_az = await mt(s.summary, "az");
    const description_ru = await mtHtml(s.description, "ru");
    const description_az = await mtHtml(s.description, "az");
    await pool.query(
      `UPDATE sanatoriums
       SET name_ru=name, name_az=name,
           summary_ru=$1, summary_az=$2, description_ru=$3, description_az=$4
       WHERE id=$5`,
      [summary_ru, summary_az, description_ru, description_az, s.id]
    );
    console.log(`  sanatorium: ${s.name}`);
  }

  // 4) testimonials: quote translated; name kept
  const tms = await pool.query(
    `SELECT id, quote FROM testimonials WHERE quote_ru IS NULL OR quote_az IS NULL`
  );
  for (const t of tms.rows) {
    const quote_ru = await mt(t.quote, "ru");
    const quote_az = await mt(t.quote, "az");
    await pool.query(`UPDATE testimonials SET quote_ru=$1, quote_az=$2 WHERE id=$3`, [
      quote_ru,
      quote_az,
      t.id,
    ]);
    console.log(`  testimonial #${t.id}`);
  }

  // 5) faqs
  const faqs = await pool.query(
    `SELECT id, question, answer FROM faqs WHERE question_ru IS NULL OR answer_ru IS NULL`
  );
  for (const f of faqs.rows) {
    const q_ru = await mt(f.question, "ru");
    const q_az = await mt(f.question, "az");
    const a_ru = await mtHtml(f.answer, "ru");
    const a_az = await mtHtml(f.answer, "az");
    await pool.query(
      `UPDATE faqs SET question_ru=$1, question_az=$2, answer_ru=$3, answer_az=$4 WHERE id=$5`,
      [q_ru, q_az, a_ru, a_az, f.id]
    );
    console.log(`  faq #${f.id}`);
  }

  // 6) blog categories
  const cats = await pool.query(
    `SELECT id, name FROM blog_categories WHERE name_ru IS NULL OR name_az IS NULL`
  );
  for (const c of cats.rows) {
    const name_ru = await mt(c.name, "ru");
    const name_az = await mt(c.name, "az");
    await pool.query(`UPDATE blog_categories SET name_ru=$1, name_az=$2 WHERE id=$3`, [
      name_ru,
      name_az,
      c.id,
    ]);
    console.log(`  blog category: ${c.name}`);
  }

  // 7) blog posts
  const posts = await pool.query(
    `SELECT id, title, excerpt, body FROM blog_posts WHERE title_ru IS NULL OR body_ru IS NULL`
  );
  for (const p of posts.rows) {
    const title_ru = await mt(p.title, "ru");
    const title_az = await mt(p.title, "az");
    const excerpt_ru = p.excerpt ? await mt(p.excerpt, "ru") : null;
    const excerpt_az = p.excerpt ? await mt(p.excerpt, "az") : null;
    const body_ru = await mtHtml(p.body, "ru");
    const body_az = await mtHtml(p.body, "az");
    await pool.query(
      `UPDATE blog_posts
       SET title_ru=$1, title_az=$2, excerpt_ru=$3, excerpt_az=$4, body_ru=$5, body_az=$6
       WHERE id=$7`,
      [title_ru, title_az, excerpt_ru, excerpt_az, body_ru, body_az, p.id]
    );
    console.log(`  blog post: ${p.title}`);
  }

  console.log("Done translating.");
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
