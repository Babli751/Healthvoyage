-- Hand-written RU/AZ for country + treatment names (machine output had errors).
-- Safe: targeted UPDATEs by EN name. No schema change.

-- Countries
UPDATE countries SET name_ru='Азербайджан',  name_az='Azərbaycan'  WHERE name='Azerbaijan';
UPDATE countries SET name_ru='Беларусь',     name_az='Belarus'     WHERE name='Belarus';
UPDATE countries SET name_ru='Чехия',        name_az='Çexiya'      WHERE name='Czech Republic';
UPDATE countries SET name_ru='Грузия',       name_az='Gürcüstan'   WHERE name='Georgia';
UPDATE countries SET name_ru='Венгрия',      name_az='Macarıstan'  WHERE name='Hungary';
UPDATE countries SET name_ru='Литва',        name_az='Litva'       WHERE name='Lithuania';
UPDATE countries SET name_ru='Россия',       name_az='Rusiya'      WHERE name='Russia';
UPDATE countries SET name_ru='Сербия',       name_az='Serbiya'     WHERE name='Serbia';
UPDATE countries SET name_ru='Словакия',     name_az='Slovakiya'   WHERE name='Slovakia';
UPDATE countries SET name_ru='Словения',     name_az='Sloveniya'   WHERE name='Slovenia';

-- Treatments
UPDATE treatments SET name_ru='Бальнеотерапия (минеральная вода)', name_az='Balneoterapiya (mineral su)'      WHERE name='Balneotherapy (Mineral Water)';
UPDATE treatments SET name_ru='Сердечно-сосудистая система',       name_az='Ürək-damar sistemi'               WHERE name='Cardiovascular';
UPDATE treatments SET name_ru='Сахарный диабет',                  name_az='Şəkərli diabet'                   WHERE name='Diabetes';
UPDATE treatments SET name_ru='Пищеварительная система',          name_az='Həzm sistemi'                     WHERE name='Digestive System';
UPDATE treatments SET name_ru='Эндокринная система и метаболизм', name_az='Endokrin sistem və metabolizm'    WHERE name='Endocrine & Metabolism';
UPDATE treatments SET name_ru='Гинекология',                     name_az='Ginekologiya'                     WHERE name='Gynecology';
UPDATE treatments SET name_ru='Грязелечение',                    name_az='Palçıq terapiyası'                WHERE name='Mud Therapy';
UPDATE treatments SET name_ru='Опорно-двигательная система и суставы', name_az='Dayaq-hərəkət sistemi və oynaqlar' WHERE name='Musculoskeletal & Joints';
UPDATE treatments SET name_ru='Терапия нафталаном',              name_az='Naftalan terapiyası'              WHERE name='Naftalan Therapy';
UPDATE treatments SET name_ru='Нервная система',                 name_az='Sinir sistemi'                    WHERE name='Nervous System';
UPDATE treatments SET name_ru='Реабилитация',                    name_az='Reabilitasiya'                    WHERE name='Rehabilitation';
UPDATE treatments SET name_ru='Органы дыхания',                  name_az='Tənəffüs sistemi'                 WHERE name='Respiratory';
UPDATE treatments SET name_ru='Соль / галотерапия',             name_az='Duz / haloterapiya'               WHERE name='Salt / Halotherapy';
UPDATE treatments SET name_ru='Кожные заболевания',             name_az='Dəri xəstəlikləri'                WHERE name='Skin Conditions';
UPDATE treatments SET name_ru='Спа и велнес',                   name_az='Spa və sağlamlıq'                 WHERE name='Spa & Wellness';
UPDATE treatments SET name_ru='Урология и почки',              name_az='Urologiya və böyrəklər'           WHERE name='Urology & Kidneys';
