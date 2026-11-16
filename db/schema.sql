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
  cover TEXT, -- /countries/<slug>.jpg
  -- i18n: RU/AZ translations (NULL falls back to the EN column)
  name_ru TEXT, name_az TEXT,
  blurb_ru TEXT, blurb_az TEXT
);

CREATE TABLE treatments (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name_ru TEXT, name_az TEXT
);

CREATE TABLE sanatoriums (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  city        TEXT NOT NULL,
  stars       INT,
  summary     TEXT NOT NULL,
  description TEXT NOT NULL,      -- may contain simple HTML (rich editor)
  image       TEXT,              -- primary cover image
  gallery     JSONB NOT NULL DEFAULT '[]', -- extra image paths
  meta_title       TEXT,
  meta_description TEXT,
  keywords         TEXT,
  country_id  INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- i18n: RU/AZ translations (NULL falls back to the EN column)
  name_ru TEXT, name_az TEXT,
  summary_ru TEXT, summary_az TEXT,
  description_ru TEXT, description_az TEXT
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

-- Patient testimonials (shown on homepage, managed in admin)
CREATE TABLE IF NOT EXISTS testimonials (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  country    TEXT,
  resort     TEXT,
  quote      TEXT NOT NULL,
  rating     INT NOT NULL DEFAULT 5,
  published  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quote_ru TEXT, quote_az TEXT
);

-- FAQ entries
CREATE TABLE IF NOT EXISTS faqs (
  id         SERIAL PRIMARY KEY,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  published  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  question_ru TEXT, question_az TEXT,
  answer_ru TEXT, answer_az TEXT
);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name_ru TEXT, name_az TEXT
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  excerpt     TEXT,
  body        TEXT NOT NULL,       -- rich HTML
  cover       TEXT,
  category_id INT REFERENCES blog_categories(id) ON DELETE SET NULL,
  meta_title       TEXT,
  meta_description TEXT,
  keywords         TEXT,
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  title_ru TEXT, title_az TEXT,
  excerpt_ru TEXT, excerpt_az TEXT,
  body_ru TEXT, body_az TEXT
);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published, created_at DESC);
