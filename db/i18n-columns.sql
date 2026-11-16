-- Add RU/AZ translation columns to existing tables WITHOUT dropping data.
-- Safe to run repeatedly (IF NOT EXISTS). Apply on the live DB:
--   PGPASSWORD=hvpass2026 psql -h localhost -U hv_user -d healthvoyage -f db/i18n-columns.sql

ALTER TABLE countries        ADD COLUMN IF NOT EXISTS name_ru TEXT,  ADD COLUMN IF NOT EXISTS name_az TEXT,
                             ADD COLUMN IF NOT EXISTS blurb_ru TEXT, ADD COLUMN IF NOT EXISTS blurb_az TEXT;
ALTER TABLE treatments       ADD COLUMN IF NOT EXISTS name_ru TEXT,  ADD COLUMN IF NOT EXISTS name_az TEXT;
ALTER TABLE sanatoriums      ADD COLUMN IF NOT EXISTS name_ru TEXT,        ADD COLUMN IF NOT EXISTS name_az TEXT,
                             ADD COLUMN IF NOT EXISTS summary_ru TEXT,     ADD COLUMN IF NOT EXISTS summary_az TEXT,
                             ADD COLUMN IF NOT EXISTS description_ru TEXT, ADD COLUMN IF NOT EXISTS description_az TEXT;
ALTER TABLE testimonials     ADD COLUMN IF NOT EXISTS quote_ru TEXT, ADD COLUMN IF NOT EXISTS quote_az TEXT;
ALTER TABLE faqs             ADD COLUMN IF NOT EXISTS question_ru TEXT, ADD COLUMN IF NOT EXISTS question_az TEXT,
                             ADD COLUMN IF NOT EXISTS answer_ru TEXT,   ADD COLUMN IF NOT EXISTS answer_az TEXT;
ALTER TABLE blog_categories  ADD COLUMN IF NOT EXISTS name_ru TEXT, ADD COLUMN IF NOT EXISTS name_az TEXT;
ALTER TABLE blog_posts       ADD COLUMN IF NOT EXISTS title_ru TEXT,   ADD COLUMN IF NOT EXISTS title_az TEXT,
                             ADD COLUMN IF NOT EXISTS excerpt_ru TEXT, ADD COLUMN IF NOT EXISTS excerpt_az TEXT,
                             ADD COLUMN IF NOT EXISTS body_ru TEXT,     ADD COLUMN IF NOT EXISTS body_az TEXT;
