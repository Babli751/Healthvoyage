-- Hand-written RU/AZ translations for the 4 FAQ entries (machine output was EN).
-- Safe: targeted UPDATEs by id, no schema change, no data loss.

UPDATE faqs SET
  question_ru = 'Консультация действительно бесплатна?',
  answer_ru   = 'Да. Наши координаторы помогают сравнить курорты, программы и цены бесплатно. За проживание вы платите курорту напрямую.',
  question_az = 'Konsultasiya həqiqətən pulsuzdur?',
  answer_az   = 'Bəli. Koordinatorlarımız kurortları, proqramları və qiymətləri pulsuz müqayisə etməyə kömək edir. Qalma haqqını birbaşa kurorta ödəyirsiniz.'
WHERE id = 1;

UPDATE faqs SET
  question_ru = 'Как узнать, какой курорт подходит для моего состояния?',
  answer_ru   = 'Пришлите ваш диагноз или медицинские заключения. Наша команда проверяет пригодность с врачами курорта до вашего бронирования.',
  question_az = 'Vəziyyətimə hansı kurortun uyğun olduğunu necə bilərəm?',
  answer_az   = 'Diaqnozunuzu və ya tibbi qeydlərinizi göndərin. Komandamız rezervasiyadan əvvəl kurortun həkimləri ilə uyğunluğu yoxlayır.'
WHERE id = 2;

UPDATE faqs SET
  question_ru = 'Помогаете ли вы с визами и трансферами?',
  answer_ru   = 'При необходимости мы готовим приглашения и можем организовать трансфер из аэропорта и местный транспорт.',
  question_az = 'Viza və transferlərdə kömək edirsiniz?',
  answer_az   = 'Lazım olduqda dəvət məktubları hazırlayırıq və hava limanından transfer ilə yerli nəqliyyatı təşkil edə bilərik.'
WHERE id = 3;

UPDATE faqs SET
  question_ru = 'Сколько длится типичная программа лечения?',
  answer_ru   = 'Большинство санаторных программ рассчитаны на 10–21 день. Также доступны короткие оздоровительные пребывания на 5–7 дней.',
  question_az = 'Tipik müalicə proqramı nə qədər davam edir?',
  answer_az   = 'Əksər sanatoriya proqramları 10–21 gün davam edir. 5–7 günlük qısa sağlamlıq qalmaları da mövcuddur.'
WHERE id = 4;
