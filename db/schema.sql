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
  blurb TEXT
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
