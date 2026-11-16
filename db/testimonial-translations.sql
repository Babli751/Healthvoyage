-- Hand-written RU/AZ translations for the 3 testimonials (machine output was EN).
-- Safe: targeted UPDATEs by id. Names are proper nouns, left unchanged.

UPDATE testimonials SET
  quote_ru = 'Координатор отвечал на каждый вопрос в течение нескольких часов. Мой псориаз улучшился за 14 дней Нафталана больше, чем за годы кремов.',
  quote_az = 'Koordinator hər suala saatlar ərzində cavab verdi. Psoriazım 14 günlük Naftalan müalicəsində illərlə kremlərdən daha çox yaxşılaşdı.'
WHERE id = 1;

UPDATE testimonials SET
  quote_ru = 'После операции на колене мне была нужна серьёзная реабилитация. Программа была профессиональной, персонал заботливым, а цена намного ниже, чем дома.',
  quote_az = 'Diz əməliyyatından sonra ciddi reabilitasiyaya ehtiyacım var idi. Proqram peşəkar, personal qayğıkeş, qiymət isə evdəkindən qat-qat ucuz idi.'
WHERE id = 2;

UPDATE testimonials SET
  quote_ru = 'Всё — от встречи в аэропорту до расписания врача — было организовано. Это было похоже на путешествие с семьёй.',
  quote_az = 'Hava limanından qarşılanmadan həkim cədvəlinə qədər hər şey təşkil olunmuşdu. Sanki ailə ilə səyahət edirdim.'
WHERE id = 3;
