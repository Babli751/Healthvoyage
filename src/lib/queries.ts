import { query, queryOne } from "./db";

export interface Country {
  id: number;
  name: string;
  slug: string;
  flag: string | null;
  blurb: string | null;
  cover: string | null;
}

export function getAllCountriesForStatic() {
  return query<{ slug: string }>(`SELECT slug FROM countries`);
}

export interface Treatment {
  id: number;
  name: string;
  slug: string;
}

export interface Sanatorium {
  id: number;
  name: string;
  slug: string;
  city: string;
  stars: number | null;
  summary: string;
  description: string;
  image: string | null;
  country_id: number;
}

// Sanatorium joined with its country + treatment tags, ready for cards.
export interface SanatoriumFull extends Sanatorium {
  country_name: string;
  country_slug: string;
  country_flag: string | null;
  treatments: { name: string; slug: string }[];
}

// Aggregate treatments[] via a correlated json subquery so each row is complete.
const SANATORIUM_SELECT = `
  SELECT s.id, s.name, s.slug, s.city, s.stars, s.summary, s.description, s.image, s.country_id,
         c.name AS country_name, c.slug AS country_slug, c.flag AS country_flag,
         COALESCE(
           (SELECT json_agg(json_build_object('name', t.name, 'slug', t.slug) ORDER BY t.name)
            FROM sanatorium_treatments st
            JOIN treatments t ON t.id = st.treatment_id
            WHERE st.sanatorium_id = s.id),
           '[]'
         ) AS treatments
  FROM sanatoriums s
  JOIN countries c ON c.id = s.country_id
`;

export function getCountriesWithCounts() {
  return query<Country & { count: number }>(`
    SELECT c.*, COUNT(s.id)::int AS count
    FROM countries c
    LEFT JOIN sanatoriums s ON s.country_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
}

export function getTreatmentsWithCounts() {
  return query<Treatment & { count: number }>(`
    SELECT t.*, COUNT(st.sanatorium_id)::int AS count
    FROM treatments t
    LEFT JOIN sanatorium_treatments st ON st.treatment_id = t.id
    GROUP BY t.id
    ORDER BY t.name ASC
  `);
}

export async function countSanatoriums(): Promise<number> {
  const r = await queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM sanatoriums`);
  return r?.count ?? 0;
}

export async function countTreatments(): Promise<number> {
  const r = await queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM treatments`);
  return r?.count ?? 0;
}

export function getFeaturedSanatoriums(limit = 6) {
  return query<SanatoriumFull>(`${SANATORIUM_SELECT} ORDER BY s.id ASC LIMIT $1`, [limit]);
}

export function getCountryBySlug(slug: string) {
  return queryOne<Country>(`SELECT * FROM countries WHERE slug = $1`, [slug]);
}

export function getTreatmentBySlug(slug: string) {
  return queryOne<Treatment>(`SELECT * FROM treatments WHERE slug = $1`, [slug]);
}

export function getSanatoriumBySlug(slug: string) {
  return queryOne<SanatoriumFull>(`${SANATORIUM_SELECT} WHERE s.slug = $1`, [slug]);
}

export function getRelatedSanatoriums(countryId: number, excludeId: number, limit = 4) {
  return query<SanatoriumFull>(
    `${SANATORIUM_SELECT} WHERE s.country_id = $1 AND s.id <> $2 ORDER BY s.id ASC LIMIT $3`,
    [countryId, excludeId, limit]
  );
}

// Filtered browse: country slug, treatment slug, free-text search — any combo.
export function searchSanatoriums(opts: {
  country?: string;
  treatment?: string;
  q?: string;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (opts.country) {
    params.push(opts.country);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (opts.treatment) {
    params.push(opts.treatment);
    conditions.push(
      `EXISTS (SELECT 1 FROM sanatorium_treatments st2
               JOIN treatments t2 ON t2.id = st2.treatment_id
               WHERE st2.sanatorium_id = s.id AND t2.slug = $${params.length})`
    );
  }
  if (opts.q && opts.q.trim()) {
    params.push(`%${opts.q.trim()}%`);
    const p = `$${params.length}`;
    conditions.push(
      `(s.name ILIKE ${p} OR s.city ILIKE ${p} OR s.summary ILIKE ${p}
        OR c.name ILIKE ${p}
        OR EXISTS (SELECT 1 FROM sanatorium_treatments st3
                   JOIN treatments t3 ON t3.id = st3.treatment_id
                   WHERE st3.sanatorium_id = s.id AND t3.name ILIKE ${p}))`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<SanatoriumFull>(
    `${SANATORIUM_SELECT} ${where} ORDER BY c.name ASC, s.stars DESC NULLS LAST, s.name ASC`,
    params
  );
}

export function getCountries() {
  return query<Country>(`SELECT * FROM countries ORDER BY name ASC`);
}

export function getTreatments() {
  return query<Treatment>(`SELECT * FROM treatments ORDER BY name ASC`);
}

// --- Admin writes ----------------------------------------------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface SanatoriumInput {
  name: string;
  city: string;
  stars: number | null;
  summary: string;
  description: string;
  image: string | null;
  countryId: number;
  treatmentIds: number[];
}

async function setTreatments(sanatoriumId: number, treatmentIds: number[]) {
  await query(`DELETE FROM sanatorium_treatments WHERE sanatorium_id = $1`, [sanatoriumId]);
  for (const tid of treatmentIds) {
    await query(
      `INSERT INTO sanatorium_treatments (sanatorium_id, treatment_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [sanatoriumId, tid]
    );
  }
}

export async function createSanatorium(input: SanatoriumInput): Promise<number> {
  const base = slugify(`${input.name}-${input.city}`);
  // Ensure unique slug.
  let slug = base;
  let n = 2;
  while (await queryOne(`SELECT 1 FROM sanatoriums WHERE slug = $1`, [slug])) {
    slug = `${base}-${n++}`;
  }
  const row = await queryOne<{ id: number }>(
    `INSERT INTO sanatoriums (name, slug, city, stars, summary, description, image, country_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [input.name, slug, input.city, input.stars, input.summary, input.description, input.image, input.countryId]
  );
  const id = row!.id;
  await setTreatments(id, input.treatmentIds);
  return id;
}

export async function updateSanatorium(id: number, input: SanatoriumInput): Promise<void> {
  await query(
    `UPDATE sanatoriums
     SET name=$1, city=$2, stars=$3, summary=$4, description=$5, image=$6, country_id=$7
     WHERE id=$8`,
    [input.name, input.city, input.stars, input.summary, input.description, input.image, input.countryId, id]
  );
  await setTreatments(id, input.treatmentIds);
}

export async function deleteSanatorium(id: number): Promise<void> {
  await query(`DELETE FROM sanatoriums WHERE id = $1`, [id]);
}

export async function getSanatoriumById(id: number) {
  const row = await queryOne<SanatoriumFull>(`${SANATORIUM_SELECT} WHERE s.id = $1`, [id]);
  if (!row) return null;
  const ids = await query<{ treatment_id: number }>(
    `SELECT treatment_id FROM sanatorium_treatments WHERE sanatorium_id = $1`,
    [id]
  );
  return { ...row, treatment_ids: ids.map((r) => r.treatment_id) };
}

// Full admin list (all sanatoriums, lightweight).
export function getAllSanatoriumsAdmin() {
  return query<SanatoriumFull>(`${SANATORIUM_SELECT} ORDER BY c.name ASC, s.name ASC`);
}

// --- Inquiries -------------------------------------------------------------

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  message: string;
  sanatorium_id: number | null;
  sanatorium_name: string | null;
  status: string;
  created_at: string;
}

export interface InquiryInput {
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  message: string;
  sanatoriumId?: number | null;
  sanatoriumName?: string | null;
}

export async function createInquiry(input: InquiryInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO inquiries (name, email, phone, country, message, sanatorium_id, sanatorium_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [
      input.name,
      input.email,
      input.phone ?? null,
      input.country ?? null,
      input.message,
      input.sanatoriumId ?? null,
      input.sanatoriumName ?? null,
    ]
  );
  return row!.id;
}

export function getInquiries() {
  return query<Inquiry>(`SELECT * FROM inquiries ORDER BY created_at DESC`);
}

export async function countNewInquiries(): Promise<number> {
  const r = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM inquiries WHERE status = 'new'`
  );
  return r?.count ?? 0;
}

export async function setInquiryStatus(id: number, status: string): Promise<void> {
  await query(`UPDATE inquiries SET status = $1 WHERE id = $2`, [status, id]);
}

export async function deleteInquiry(id: number): Promise<void> {
  await query(`DELETE FROM inquiries WHERE id = $1`, [id]);
}
