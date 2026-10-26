-- HealthVoyage schema (raw Postgres, no ORM)
-- Run: npm run db:schema   (or psql -d healthvoyage -f db/schema.sql)

DROP TABLE IF EXISTS sanatorium_treatments CASCADE;
DROP TABLE IF EXISTS sanatoriums CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

CREATE TABLE countries (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE,
  flag  TEXT,
  blurb TEXT,
  cover TEXT -- /countries/<slug>.jpg
);

CREATE TABLE treatments (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE sanatoriums (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  city        TEXT NOT NULL,
  stars       INT,
  summary     TEXT NOT NULL,
  description TEXT NOT NULL,
  image       TEXT, -- /img/<pexels-id>.jpg
  country_id  INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sanatoriums_country ON sanatoriums(country_id);

-- many-to-many: sanatorium <-> treatment
CREATE TABLE sanatorium_treatments (
  sanatorium_id INT NOT NULL REFERENCES sanatoriums(id) ON DELETE CASCADE,
  treatment_id  INT NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  PRIMARY KEY (sanatorium_id, treatment_id)
);

-- Patient inquiries / leads
CREATE TABLE IF NOT EXISTS inquiries (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  country     TEXT, -- patient's country
  message     TEXT NOT NULL,
  -- optional context: which sanatorium the inquiry came from
  sanatorium_id   INT REFERENCES sanatoriums(id) ON DELETE SET NULL,
  sanatorium_name TEXT,
  status      TEXT NOT NULL DEFAULT 'new', -- new | contacted | closed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status, created_at DESC);
