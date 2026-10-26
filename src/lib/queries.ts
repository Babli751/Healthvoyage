import { query, queryOne } from "./db";

export interface Country {
  id: number;
  name: string;
  slug: string;
  flag: string | null;
  blurb: string | null;
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
  SELECT s.id, s.name, s.slug, s.city, s.stars, s.summary, s.description, s.country_id,
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
