// SAFE additive seed: Austria (Vienna) + Turkey hospital clinics.
// Does NOT truncate. Idempotent per country (skips a country that already exists).
// Fills EN + RU + AZ (name/summary/description + country blurb). New treatments get EN/RU/AZ names.
// Run on the box:
//   cd /var/www/healthvoyage && DATABASE_URL="postgresql://hv_user:hvpass2026@localhost:5432/healthvoyage" npx tsx db/add-clinics-at-tr.ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const env = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch { /* ignore */ }
}
loadEnv();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// --- New treatment profiles (hospital-oriented). name EN / RU / AZ ---
const NEW_TREATMENTS: Array<{ slug: string; en: string; ru: string; az: string }> = [
  { slug: "oncology", en: "Oncology", ru: "Онкология", az: "Onkologiya" },
  { slug: "cardiac-surgery", en: "Cardiac Surgery", ru: "Кардиохирургия", az: "Ürək cərrahiyyəsi" },
  { slug: "neurosurgery", en: "Neurosurgery", ru: "Нейрохирургия", az: "Neyrocərrahiyyə" },
  { slug: "organ-transplant", en: "Organ Transplant", ru: "Трансплантация органов", az: "Orqan transplantasiyası" },
  { slug: "reproductive-ivf", en: "Reproductive Medicine & IVF", ru: "Репродуктивная медицина и ЭКО", az: "Reproduktiv tibb və EKO" },
  { slug: "ophthalmology", en: "Ophthalmology", ru: "Офтальмология", az: "Oftalmologiya" },
  { slug: "plastic-surgery", en: "Plastic & Reconstructive Surgery", ru: "Пластическая и реконструктивная хирургия", az: "Plastik və rekonstruktiv cərrahiyyə" },
  { slug: "obstetrics", en: "Obstetrics & Pregnancy", ru: "Акушерство и ведение беременности", az: "Mamalıq və hamiləliyin aparılması" },
  { slug: "pediatrics", en: "Pediatric Care", ru: "Детская медицина", az: "Uşaq təbabəti" },
  { slug: "robotic-surgery", en: "Robotic Surgery", ru: "Роботизированная хирургия", az: "Robot cərrahiyyəsi" },
  { slug: "general-surgery", en: "General Surgery", ru: "Общая хирургия", az: "Ümumi cərrahiyyə" },
  { slug: "hematology", en: "Hematology", ru: "Гематология", az: "Hematologiya" },
];

type Clinic = {
  name: string; city: string;
  summary_en: string; summary_ru: string; summary_az: string;
  description_en: string; description_ru: string; description_az: string;
  treatments: string[];
};

type Country = {
  name: string; name_ru: string; name_az: string; flag: string;
  blurb_en: string; blurb_ru: string; blurb_az: string;
  clinics: Clinic[];
};

const COUNTRIES: Country[] = [
  {
    name: "Austria", name_ru: "Австрия", name_az: "Avstriya", flag: "🇦🇹",
    blurb_en: "Vienna's leading university and private hospitals — high-tech oncology, cardiology, orthopedics, neurosurgery and advanced diagnostics for international patients.",
    blurb_ru: "Ведущие университетские и частные клиники Вены — высокотехнологичная онкология, кардиология, ортопедия, нейрохирургия и современная диагностика для иностранных пациентов.",
    blurb_az: "Vyananın aparıcı universitet və özəl klinikaları — yüksək texnologiyalı onkologiya, kardiologiya, ortopediya, neyrocərrahiyyə və müasir diaqnostika xarici pasiyentlər üçün.",
    clinics: [
      {
        name: "Vienna General Hospital", city: "Vienna",
        summary_en: "Major university hospital (AKH Wien) tied to the Medical University of Vienna.",
        summary_ru: "Крупная университетская больница (AKH Wien), связанная с Медицинским университетом Вены.",
        summary_az: "Vyana Tibb Universiteti ilə bağlı böyük universitet xəstəxanası (AKH Wien).",
        description_en: "Vienna General Hospital, also known as Universitätsklinikum AKH Wien, is a large university hospital in the 9th district of Vienna, closely tied to the Medical University of Vienna. Part of the Wiener Gesundheitsverbund network, it brings together a broad range of specialized, high-tech care. It includes numerous university clinics and specialized units — hematology and hemostaseology, gastroenterology and hepatology, neurosurgery and dedicated oncology centres. Many outpatient units work by prior appointment.",
        description_ru: "Vienna General Hospital, также известная как Universitätsklinikum AKH Wien, — крупная университетская больница в 9-м районе Вены, тесно связанная с Медицинским университетом Вены. Входит в сеть клиник Wiener Gesundheitsverbund и объединяет широкий спектр специализированной и высокотехнологичной медицинской помощи. Включает многочисленные университетские клиники и специализированные подразделения — гематология и гемостазиология, гастроэнтерология и гепатология, нейрохирургия и специализированные онкологические центры. Многие амбулаторные подразделения работают по предварительной записи.",
        description_az: "Vienna General Hospital, həmçinin Universitätsklinikum AKH Wien kimi tanınan, Vyananın 9-cu rayonunda yerləşən böyük universitet xəstəxanasıdır və Vyana Tibb Universiteti ilə sıx bağlıdır. Wiener Gesundheitsverbund şəbəkəsinin bir hissəsidir və geniş spektrli ixtisaslaşmış, yüksək texnologiyalı tibbi yardımı birləşdirir. Çoxsaylı universitet klinikalarını və ixtisaslaşmış bölmələri əhatə edir — hematologiya və hemostaziologiya, qastroenterologiya və hepatologiya, neyrocərrahiyyə və ixtisaslaşmış onkoloji mərkəzlər. Bir çox ambulator bölmələr əvvəlcədən qeydiyyatla işləyir.",
        treatments: ["oncology", "hematology", "digestive-system", "neurosurgery"],
      },
      {
        name: "Wiener Privatklinik", city: "Vienna",
        summary_en: "Private multidisciplinary hospital in Vienna's 9th district for international patients.",
        summary_ru: "Частная многопрофильная больница в 9-м районе Вены, в том числе для иностранных пациентов.",
        summary_az: "Vyananın 9-cu rayonunda xarici pasiyentlər üçün özəl çoxprofilli xəstəxana.",
        description_en: "Wiener Privatklinik is a private multidisciplinary hospital in the 9th district of Vienna. It focuses on diagnostics, treatment and inpatient care with doctors across many specialties, including for patients from abroad. Core profile: specialized treatment, consultations with doctors across fields, and medical diagnostics — oncology, cardiology, orthopedics and surgery, neurosurgery and comprehensive diagnostics.",
        description_ru: "Wiener Privatklinik — частная многопрофильная больница в 9-м районе Вены. Ориентирована на диагностику, лечение и стационарную помощь с привлечением врачей различных специальностей, включая пациентов из-за рубежа. Главный профиль — специализированное лечение, консультации врачей различных направлений и медицинская диагностика: онкология, кардиология, ортопедия и хирургия, нейрохирургия и комплексная диагностика.",
        description_az: "Wiener Privatklinik Vyananın 9-cu rayonunda özəl çoxprofilli xəstəxanadır. Diaqnostika, müalicə və stasionar yardıma yönəlib, müxtəlif ixtisaslardan həkimlərin, o cümlədən xaricdən gələn pasiyentlərin cəlb edilməsi ilə. Əsas profil — ixtisaslaşmış müalicə, müxtəlif sahələrdən həkim konsultasiyaları və tibbi diaqnostika: onkologiya, kardiologiya, ortopediya və cərrahiyyə, neyrocərrahiyyə və kompleks diaqnostika.",
        treatments: ["oncology", "cardiovascular", "musculoskeletal-and-joints", "neurosurgery", "general-surgery"],
      },
      {
        name: "Döbling Private Clinic", city: "Vienna",
        summary_en: "Private clinic with orthopedics, oncology, gynecology and da Vinci robotic surgery.",
        summary_ru: "Частная клиника: ортопедия, онкология, гинекология и роботизированная хирургия da Vinci.",
        summary_az: "Özəl klinika: ortopediya, onkologiya, ginekologiya və da Vinci robot cərrahiyyəsi.",
        description_en: "Döbling Private Clinic is a private hospital in Vienna. Key fields include orthopedics and traumatology, obstetrics and gynecology, reproductive medicine, gastroenterology, oncology and ophthalmology. On-site X-ray, CT, MRI and laboratory diagnostics are available; the da Vinci Xi robotic system is used for a number of operations. Core profile: cardiology, oncology, gynecology, surgery and diagnostic examinations.",
        description_ru: "Döbling Private Clinic — частная больница в Вене. Среди ключевых направлений — ортопедия и травматология, акушерство и гинекология, репродуктивная медицина, гастроэнтерология, онкология и офтальмология. На месте доступны рентген, КТ, МРТ и лабораторная диагностика; для ряда операций используется роботизированная система da Vinci Xi. Главный профиль — кардиология, онкология, гинекология, хирургия и диагностические обследования.",
        description_az: "Döbling Private Clinic Vyanada özəl xəstəxanadır. Əsas istiqamətlər arasında ortopediya və travmatologiya, mamalıq və ginekologiya, reproduktiv tibb, qastroenterologiya, onkologiya və oftalmologiya var. Yerində rentgen, KT, MRT və laborator diaqnostika mövcuddur; bir sıra əməliyyatlar üçün da Vinci Xi robot sistemi istifadə olunur. Əsas profil — kardiologiya, onkologiya, ginekologiya, cərrahiyyə və diaqnostik müayinələr.",
        treatments: ["musculoskeletal-and-joints", "obstetrics", "gynecology", "reproductive-ivf", "oncology", "ophthalmology", "robotic-surgery", "cardiovascular"],
      },
      {
        name: "St. Josef Hospital Vienna", city: "Vienna",
        summary_en: "Hospital focused on women's health, childbirth and oncological care.",
        summary_ru: "Больница с профилем женского здоровья, родовспоможения и онкологического лечения.",
        summary_az: "Qadın sağlamlığı, doğuş və onkoloji müalicə profilli xəstəxana.",
        description_en: "St. Josef Hospital Vienna focuses on women's health, childbirth and oncological care. Key fields: obstetrics and pregnancy management, gynecology, neonatology, oncology and tumour surgery, and plastic and reconstructive surgery.",
        description_ru: "St. Josef Hospital Vienna специализируется на женском здоровье, родовспоможении и онкологическом лечении. Ключевые направления: акушерство и ведение беременности, гинекология, неонатология, онкология и опухолевая хирургия, пластическая и реконструктивная хирургия.",
        description_az: "St. Josef Hospital Vienna qadın sağlamlığı, doğuş və onkoloji müalicə üzrə ixtisaslaşıb. Əsas istiqamətlər: mamalıq və hamiləliyin aparılması, ginekologiya, neonatologiya, onkologiya və şiş cərrahiyyəsi, plastik və rekonstruktiv cərrahiyyə.",
        treatments: ["obstetrics", "gynecology", "pediatrics", "oncology", "plastic-surgery"],
      },
      {
        name: "Orthopädisches Spital Speising", city: "Vienna",
        summary_en: "Orthopedic hospital for joint and spine surgery and rehabilitation.",
        summary_ru: "Ортопедическая больница: хирургия суставов и позвоночника, реабилитация.",
        summary_az: "Ortopedik xəstəxana: oynaq və onurğa cərrahiyyəsi, reabilitasiya.",
        description_en: "Orthopädisches Spital Speising is an orthopedic hospital in Vienna. Core profile: orthopedics, joint and spine surgery — spinal conditions, joint replacement (endoprosthetics), traumatology, pediatric orthopedics and rehabilitation.",
        description_ru: "Orthopädisches Spital Speising — ортопедическая больница в Вене. Главный профиль — ортопедия, хирургия суставов и позвоночника: заболевания позвоночника, эндопротезирование суставов, травматология, детская ортопедия и реабилитация.",
        description_az: "Orthopädisches Spital Speising Vyanada ortopedik xəstəxanadır. Əsas profil — ortopediya, oynaq və onurğa cərrahiyyəsi: onurğa xəstəlikləri, oynaqların endoprotezlənməsi, travmatologiya, uşaq ortopediyası və reabilitasiya.",
        treatments: ["musculoskeletal-and-joints", "pediatrics", "rehabilitation", "general-surgery"],
      },
    ],
  },
  {
    name: "Turkey", name_ru: "Турция", name_az: "Türkiyə", flag: "🇹🇷",
    blurb_en: "Turkey's leading international hospital groups — high-tech oncology, cardiac surgery, organ transplant, IVF and robotic surgery with strong experience treating patients from abroad.",
    blurb_ru: "Ведущие международные госпитали Турции — высокотехнологичная онкология, кардиохирургия, трансплантация органов, ЭКО и роботизированная хирургия, с большим опытом лечения иностранных пациентов.",
    blurb_az: "Türkiyənin aparıcı beynəlxalq xəstəxana qrupları — yüksək texnologiyalı onkologiya, ürək cərrahiyyəsi, orqan transplantasiyası, EKO və robot cərrahiyyəsi, xarici pasiyentlərin müalicəsində böyük təcrübə ilə.",
    clinics: [
      {
        name: "Acıbadem Healthcare Group", city: "Istanbul",
        summary_en: "Large international network of multidisciplinary hospitals with advanced high-tech medicine.",
        summary_ru: "Крупная международная сеть многопрофильных госпиталей с развитой высокотехнологичной медициной.",
        summary_az: "İnkişaf etmiş yüksək texnologiyalı tibblə böyük beynəlxalq çoxprofilli xəstəxana şəbəkəsi.",
        description_en: "Acıbadem Healthcare Group is a large international network of multidisciplinary hospitals with advanced high-tech medicine. Core fields: oncology and chemotherapy, cardiology and cardiac surgery, organ transplantation, neurosurgery and orthopedics, IVF and reproductive medicine.",
        description_ru: "Acıbadem Healthcare Group — крупная международная сеть многопрофильных госпиталей с развитой высокотехнологичной медициной. Ключевые направления: онкология и химиотерапия, кардиология и кардиохирургия, трансплантация органов, нейрохирургия и ортопедия, ЭКО и репродуктивная медицина.",
        description_az: "Acıbadem Healthcare Group inkişaf etmiş yüksək texnologiyalı tibblə böyük beynəlxalq çoxprofilli xəstəxana şəbəkəsidir. Əsas istiqamətlər: onkologiya və kimyaterapiya, kardiologiya və ürək cərrahiyyəsi, orqan transplantasiyası, neyrocərrahiyyə və ortopediya, EKO və reproduktiv tibb.",
        treatments: ["oncology", "cardiovascular", "cardiac-surgery", "organ-transplant", "neurosurgery", "musculoskeletal-and-joints", "reproductive-ivf"],
      },
      {
        name: "Memorial Healthcare Group", city: "Istanbul",
        summary_en: "Multidisciplinary medicine, oncology and reproductive health.",
        summary_ru: "Многопрофильная медицина, онкология и репродуктивное здоровье.",
        summary_az: "Çoxprofilli tibb, onkologiya və reproduktiv sağlamlıq.",
        description_en: "Memorial Healthcare Group covers multidisciplinary medicine, oncology and reproductive health. Core fields: oncology, cardiology, liver and kidney transplantation, IVF and infertility treatment, neurosurgery and surgery.",
        description_ru: "Memorial Healthcare Group — многопрофильная медицина, онкология и репродуктивное здоровье. Ключевые направления: онкология, кардиология, трансплантация печени и почек, ЭКО и лечение бесплодия, нейрохирургия и хирургия.",
        description_az: "Memorial Healthcare Group — çoxprofilli tibb, onkologiya və reproduktiv sağlamlıq. Əsas istiqamətlər: onkologiya, kardiologiya, qaraciyər və böyrək transplantasiyası, EKO və sonsuzluğun müalicəsi, neyrocərrahiyyə və cərrahiyyə.",
        treatments: ["oncology", "cardiovascular", "organ-transplant", "reproductive-ivf", "neurosurgery", "general-surgery"],
      },
      {
        name: "Anadolu Medical Center", city: "Kocaeli",
        summary_en: "Oncology, treatment of complex diseases and high-tech diagnostics.",
        summary_ru: "Онкология, лечение сложных заболеваний и высокотехнологичная диагностика.",
        summary_az: "Onkologiya, mürəkkəb xəstəliklərin müalicəsi və yüksək texnologiyalı diaqnostika.",
        description_en: "Anadolu Medical Center specializes in oncology, treatment of complex diseases and high-tech diagnostics. Core fields: oncology and radiotherapy, hematology, cardiology, neurosurgery and robotic surgery.",
        description_ru: "Anadolu Medical Center специализируется на онкологии, лечении сложных заболеваний и высокотехнологичной диагностике. Ключевые направления: онкология и радиотерапия, гематология, кардиология, нейрохирургия и роботизированная хирургия.",
        description_az: "Anadolu Medical Center onkologiya, mürəkkəb xəstəliklərin müalicəsi və yüksək texnologiyalı diaqnostika üzrə ixtisaslaşıb. Əsas istiqamətlər: onkologiya və radioterapiya, hematologiya, kardiologiya, neyrocərrahiyyə və robot cərrahiyyəsi.",
        treatments: ["oncology", "hematology", "cardiovascular", "neurosurgery", "robotic-surgery"],
      },
      {
        name: "Koç University Hospital", city: "Istanbul",
        summary_en: "University medicine, research and treatment of complex pathologies.",
        summary_ru: "Университетская медицина, научные исследования и лечение сложных патологий.",
        summary_az: "Universitet təbabəti, elmi tədqiqatlar və mürəkkəb patologiyaların müalicəsi.",
        description_en: "Koç University Hospital focuses on university medicine, scientific research and treatment of complex pathologies. Core fields: oncology, transplantology, cardiology, neurosurgery, and genetics and personalized medicine.",
        description_ru: "Koç University Hospital — университетская медицина, научные исследования и лечение сложных патологий. Ключевые направления: онкология, трансплантология, кардиология, нейрохирургия, генетика и персонализированная медицина.",
        description_az: "Koç University Hospital — universitet təbabəti, elmi tədqiqatlar və mürəkkəb patologiyaların müalicəsi. Əsas istiqamətlər: onkologiya, transplantologiya, kardiologiya, neyrocərrahiyyə, genetika və fərdiləşdirilmiş tibb.",
        treatments: ["oncology", "organ-transplant", "cardiovascular", "neurosurgery"],
      },
      {
        name: "Group Florence Nightingale", city: "Istanbul",
        summary_en: "Complex surgery, oncology and transplantology.",
        summary_ru: "Сложные хирургические операции, онкология и трансплантология.",
        summary_az: "Mürəkkəb cərrahi əməliyyatlar, onkologiya və transplantologiya.",
        description_en: "Group Florence Nightingale specializes in complex surgery, oncology and transplantology. Core fields: cardiac surgery, oncology, organ transplantation, orthopedics and neurosurgery, and robotic surgery.",
        description_ru: "Group Florence Nightingale специализируется на сложных хирургических операциях, онкологии и трансплантологии. Ключевые направления: кардиохирургия, онкология, трансплантация органов, ортопедия и нейрохирургия, роботизированная хирургия.",
        description_az: "Group Florence Nightingale mürəkkəb cərrahi əməliyyatlar, onkologiya və transplantologiya üzrə ixtisaslaşıb. Əsas istiqamətlər: ürək cərrahiyyəsi, onkologiya, orqan transplantasiyası, ortopediya və neyrocərrahiyyə, robot cərrahiyyəsi.",
        treatments: ["cardiac-surgery", "oncology", "organ-transplant", "musculoskeletal-and-joints", "neurosurgery", "robotic-surgery"],
      },
      {
        name: "Medipol Mega University Hospital", city: "Istanbul",
        summary_en: "Large university medical complex with a wide range of specialties.",
        summary_ru: "Крупный университетский медицинский комплекс с широким спектром специализаций.",
        summary_az: "Geniş ixtisas spektri olan böyük universitet tibb kompleksi.",
        description_en: "Medipol Mega University Hospital is a large university medical complex with a wide range of specialties. Core fields: oncology, cardiology and cardiac surgery, transplantation, neurosurgery, and pediatric medicine and IVF.",
        description_ru: "Medipol Mega University Hospital — крупный университетский медицинский комплекс с широким спектром специализаций. Ключевые направления: онкология, кардиология и кардиохирургия, трансплантация, нейрохирургия, детская медицина и ЭКО.",
        description_az: "Medipol Mega University Hospital geniş ixtisas spektri olan böyük universitet tibb kompleksidir. Əsas istiqamətlər: onkologiya, kardiologiya və ürək cərrahiyyəsi, transplantasiya, neyrocərrahiyyə, uşaq təbabəti və EKO.",
        treatments: ["oncology", "cardiovascular", "cardiac-surgery", "organ-transplant", "neurosurgery", "pediatrics", "reproductive-ivf"],
      },
      {
        name: "Liv Hospital", city: "Istanbul",
        summary_en: "Private multidisciplinary medicine and modern surgical technologies.",
        summary_ru: "Частная многопрофильная медицина и современные хирургические технологии.",
        summary_az: "Özəl çoxprofilli tibb və müasir cərrahi texnologiyalar.",
        description_en: "Liv Hospital offers private multidisciplinary medicine and modern surgical technologies. Core fields: oncology, cardiology, orthopedics, neurosurgery, and aesthetic and reconstructive surgery.",
        description_ru: "Liv Hospital — частная многопрофильная медицина и современные хирургические технологии. Ключевые направления: онкология, кардиология, ортопедия, нейрохирургия, эстетическая и реконструктивная хирургия.",
        description_az: "Liv Hospital — özəl çoxprofilli tibb və müasir cərrahi texnologiyalar. Əsas istiqamətlər: onkologiya, kardiologiya, ortopediya, neyrocərrahiyyə, estetik və rekonstruktiv cərrahiyyə.",
        treatments: ["oncology", "cardiovascular", "musculoskeletal-and-joints", "neurosurgery", "plastic-surgery"],
      },
    ],
  },
  {
    name: "South Korea", name_ru: "Южная Корея", name_az: "Cənubi Koreya", flag: "🇰🇷",
    blurb_en: "South Korea's leading hospitals — women's health and IVF, cardiac surgery, oncology, transplantology and robotic surgery, with dedicated support for international patients.",
    blurb_ru: "Ведущие госпитали Южной Кореи — женское здоровье и ЭКО, кардиохирургия, онкология, трансплантология и роботизированная хирургия, с сопровождением иностранных пациентов.",
    blurb_az: "Cənubi Koreyanın aparıcı xəstəxanaları — qadın sağlamlığı və EKO, ürək cərrahiyyəsi, onkologiya, transplantologiya və robot cərrahiyyəsi, xarici pasiyentlər üçün müşayiətlə.",
    clinics: [
      {
        name: "Gangnam Women's Hospital", city: "Seoul",
        summary_en: "Specialized centre (CHA network) for women's health, obstetrics and reproductive medicine.",
        summary_ru: "Специализированный центр (сеть CHA): женское здоровье, акушерство и репродуктивная медицина.",
        summary_az: "İxtisaslaşmış mərkəz (CHA şəbəkəsi): qadın sağlamlığı, mamalıq və reproduktiv tibb.",
        description_en: "Gangnam Women's Hospital is a large specialized medical centre in Seoul, part of the CHA medical network. Its main focus is women's reproductive health — from pregnancy planning and infertility treatment to pregnancy management, childbirth and postpartum recovery. Key fields: obstetrics (pregnancy management, delivery, high-risk pregnancy monitoring), gynecology and surgical gynecology, reproductive medicine (infertility treatment, IVF, egg freezing), neonatology with intensive care, and robotic minimally invasive gynecological surgery.",
        description_ru: "Gangnam Women's Hospital — крупный специализированный медицинский центр в Сеуле, входящий в медицинскую сеть CHA. Основной профиль — женское репродуктивное здоровье: от планирования беременности и лечения бесплодия до ведения беременности, родов и послеродового восстановления. Ключевые направления: акушерство (ведение беременности, роды, наблюдение беременности высокого риска), гинекология и хирургическая гинекология, репродуктивная медицина (лечение бесплодия, ЭКО, заморозка яйцеклеток), неонатология с отделением интенсивной терапии, роботизированная малоинвазивная гинекологическая хирургия.",
        description_az: "Gangnam Women's Hospital Seulda böyük ixtisaslaşmış tibb mərkəzidir, CHA tibb şəbəkəsinin bir hissəsidir. Əsas profil — qadın reproduktiv sağlamlığı: hamiləlik planlaşdırması və sonsuzluğun müalicəsindən hamiləliyin aparılması, doğuş və doğuşdan sonrakı bərpaya qədər. Əsas istiqamətlər: mamalıq (hamiləliyin aparılması, doğuş, yüksək riskli hamiləliyin müşahidəsi), ginekologiya və cərrahi ginekologiya, reproduktiv tibb (sonsuzluğun müalicəsi, EKO, yumurta hüceyrələrinin dondurulması), intensiv terapiya ilə neonatologiya, robot minimal invaziv ginekoloji cərrahiyyə.",
        treatments: ["obstetrics", "gynecology", "reproductive-ivf", "pediatrics", "robotic-surgery"],
      },
      {
        name: "Sejong Hospital", city: "Bucheon",
        summary_en: "Cardiac centre known for complex heart surgery and minimally invasive procedures.",
        summary_ru: "Кардиоцентр, известный сложными операциями на сердце и малоинвазивными вмешательствами.",
        summary_az: "Mürəkkəb ürək əməliyyatları və minimal invaziv müdaxilələrlə tanınan ürək mərkəzi.",
        description_en: "Sejong Hospital is a multidisciplinary medical centre in South Korea, specializing primarily in the diagnosis and treatment of heart and cardiovascular disease. Its main profile is cardiology and cardiac surgery, known for complex heart operations, treatment of congenital and acquired heart conditions, and minimally invasive procedures. Key fields: cardiology, cardiac surgery, pediatric cardiology (congenital heart defects), neurology, rehabilitation and general diagnostics.",
        description_ru: "Sejong Hospital — многопрофильный медицинский центр в Южной Корее, специализирующийся прежде всего на диагностике и лечении заболеваний сердца и сердечно-сосудистой системы. Главный профиль — кардиология и кардиохирургия; госпиталь известен сложными операциями на сердце, лечением врождённых и приобретённых сердечных патологий и малоинвазивными вмешательствами. Ключевые направления: кардиология, кардиохирургия, детская кардиология (врождённые пороки сердца), неврология, реабилитация и общая диагностика.",
        description_az: "Sejong Hospital Cənubi Koreyada çoxprofilli tibb mərkəzidir, əsasən ürək və ürək-damar sisteminin xəstəliklərinin diaqnostikası və müalicəsi üzrə ixtisaslaşıb. Əsas profil — kardiologiya və ürək cərrahiyyəsi; xəstəxana mürəkkəb ürək əməliyyatları, anadangəlmə və qazanılmış ürək patologiyalarının müalicəsi və minimal invaziv müdaxilələrlə tanınır. Əsas istiqamətlər: kardiologiya, ürək cərrahiyyəsi, uşaq kardiologiyası (anadangəlmə ürək qüsurları), nevrologiya, reabilitasiya və ümumi diaqnostika.",
        treatments: ["cardiovascular", "cardiac-surgery", "pediatrics", "nervous-system", "rehabilitation"],
      },
      {
        name: "SAM Medical Center", city: "Anyang",
        summary_en: "Multidisciplinary centre combining general, women's and Eastern medicine, with a focus on oncology.",
        summary_ru: "Многопрофильный центр, объединяющий общую, женскую и восточную медицину, с акцентом на онкологию.",
        summary_az: "Ümumi, qadın və Şərq təbabətini birləşdirən çoxprofilli mərkəz, onkologiyaya diqqətlə.",
        description_en: "SAM Medical Center is a multidisciplinary medical centre in South Korea combining general, women's and Eastern medicine, with special attention to oncology and comprehensive patient care. Main profile: oncology, comprehensive diagnostics, gynecology and treatment of internal-organ disease. It offers integrative treatment programs and services for international patients, including language support. Key fields: oncology, gynecology and reproductive medicine, gastroenterology, orthopedics, cardiology and comprehensive check-up diagnostics.",
        description_ru: "SAM Medical Center — многопрофильный медицинский центр в Южной Корее, объединяющий общую, женскую и восточную медицину, с особым вниманием к онкологии и комплексному лечению пациентов. Главный профиль — онкология, комплексная диагностика, гинекология и лечение заболеваний внутренних органов. Центр предлагает интегративные программы лечения и услуги для иностранных пациентов, включая языковое сопровождение. Ключевые направления: онкология, гинекология и репродуктивная медицина, гастроэнтерология, ортопедия, кардиология и комплексная диагностика (Check-up).",
        description_az: "SAM Medical Center Cənubi Koreyada ümumi, qadın və Şərq təbabətini birləşdirən çoxprofilli tibb mərkəzidir, onkologiyaya və pasiyentlərin kompleks müalicəsinə xüsusi diqqətlə. Əsas profil — onkologiya, kompleks diaqnostika, ginekologiya və daxili orqan xəstəliklərinin müalicəsi. Mərkəz inteqrativ müalicə proqramları və xarici pasiyentlər üçün xidmətlər, o cümlədən dil dəstəyi təklif edir. Əsas istiqamətlər: onkologiya, ginekologiya və reproduktiv tibb, qastroenterologiya, ortopediya, kardiologiya və kompleks diaqnostika (Check-up).",
        treatments: ["oncology", "gynecology", "reproductive-ivf", "digestive-system", "musculoskeletal-and-joints", "cardiovascular"],
      },
      {
        name: "Soonchunhyang University Hospital Bucheon", city: "Bucheon",
        summary_en: "University hospital for complex disease, high-tech surgery and transplantology.",
        summary_ru: "Университетский госпиталь: сложные заболевания, высокотехнологичная хирургия и трансплантология.",
        summary_az: "Universitet xəstəxanası: mürəkkəb xəstəliklər, yüksək texnologiyalı cərrahiyyə və transplantologiya.",
        description_en: "Soonchunhyang University Hospital Bucheon is a large university multidisciplinary hospital in Bucheon, South Korea, specializing in the treatment of complex diseases, high-tech surgery and comprehensive diagnostics. Main profile: multidisciplinary medicine, oncology, complex surgery and transplantology. It also treats international patients and provides Russian-language support. Key fields: oncology, surgery (including robotic and minimally invasive), gastroenterology and endoscopy, transplantology (liver and kidney), cardiology and neurology, gynecology, and intensive and emergency care.",
        description_ru: "Soonchunhyang University Hospital Bucheon — крупный университетский многопрофильный госпиталь в городе Пучхон (Южная Корея), специализирующийся на лечении сложных заболеваний, высокотехнологичной хирургии и комплексной диагностике. Главный профиль — многопрофильная медицина, онкология, сложная хирургия и трансплантология. Госпиталь принимает иностранных пациентов и предоставляет сопровождение на русском языке. Ключевые направления: онкология, хирургия (в том числе роботизированная и малоинвазивная), гастроэнтерология и эндоскопия, трансплантология (печень и почки), кардиология и неврология, гинекология, реанимация и экстренная медицина.",
        description_az: "Soonchunhyang University Hospital Bucheon Cənubi Koreyanın Pucheon şəhərində böyük universitet çoxprofilli xəstəxanasıdır, mürəkkəb xəstəliklərin müalicəsi, yüksək texnologiyalı cərrahiyyə və kompleks diaqnostika üzrə ixtisaslaşıb. Əsas profil — çoxprofilli tibb, onkologiya, mürəkkəb cərrahiyyə və transplantologiya. Xəstəxana xarici pasiyentləri qəbul edir və rus dilində müşayiət təqdim edir. Əsas istiqamətlər: onkologiya, cərrahiyyə (o cümlədən robot və minimal invaziv), qastroenterologiya və endoskopiya, transplantologiya (qaraciyər və böyrək), kardiologiya və nevrologiya, ginekologiya, reanimasiya və təcili tibbi yardım.",
        treatments: ["oncology", "general-surgery", "robotic-surgery", "digestive-system", "organ-transplant", "cardiovascular", "nervous-system", "gynecology"],
      },
      {
        name: "Bundang Jesaeng Hospital", city: "Seongnam",
        summary_en: "Multidisciplinary hospital for oncology, urology and breast/thyroid surgery.",
        summary_ru: "Многопрофильный госпиталь: онкология, урология, хирургия молочной и щитовидной железы.",
        summary_az: "Çoxprofilli xəstəxana: onkologiya, urologiya, süd və qalxanabənzər vəzi cərrahiyyəsi.",
        description_en: "Bundang Jesaeng Hospital is a multidisciplinary medical hospital in Seongnam (Bundang district), South Korea, specializing in comprehensive diagnostics and the treatment of oncological, urological, cardiovascular and other diseases. Main profile: multidisciplinary medicine, oncology, urology, breast and thyroid surgery, and spine and joint conditions. Key fields: oncology (breast and thyroid cancer, onco-urology), urology, cardiology, orthopedics (spine and joints), neurology and neurosurgery, general surgery, and comprehensive check-up diagnostics.",
        description_ru: "Bundang Jesaeng Hospital — многопрофильный медицинский госпиталь в городе Соннам (район Бунданг), Южная Корея, специализирующийся на комплексной диагностике, лечении онкологических, урологических, сердечно-сосудистых и других заболеваний. Главный профиль — многопрофильная медицина, онкология, урология, хирургия молочной и щитовидной железы, заболевания позвоночника и суставов. Ключевые направления: онкология (рак молочной и щитовидной железы, онкоурология), урология, кардиология, ортопедия (позвоночник и суставы), неврология и нейрохирургия, общая хирургия, комплексная диагностика (Check-up).",
        description_az: "Bundang Jesaeng Hospital Cənubi Koreyanın Seongnam şəhərində (Bundang rayonu) çoxprofilli tibb xəstəxanasıdır, kompleks diaqnostika, onkoloji, uroloji, ürək-damar və digər xəstəliklərin müalicəsi üzrə ixtisaslaşıb. Əsas profil — çoxprofilli tibb, onkologiya, urologiya, süd və qalxanabənzər vəzi cərrahiyyəsi, onurğa və oynaq xəstəlikləri. Əsas istiqamətlər: onkologiya (süd və qalxanabənzər vəzi xərçəngi, onko-urologiya), urologiya, kardiologiya, ortopediya (onurğa və oynaqlar), nevrologiya və neyrocərrahiyyə, ümumi cərrahiyyə, kompleks diaqnostika (Check-up).",
        treatments: ["oncology", "urology-and-kidneys", "cardiovascular", "musculoskeletal-and-joints", "nervous-system", "neurosurgery", "general-surgery"],
      },
    ],
  },
];

// Image candidates (same pool style as seed/add-czech). Picks unused /public/img/*.jpg.
const IMG_CANDIDATES = [
  "39440977", "28518909", "31138249", "32963833", "28407597", "7041600", "7222178",
  "19666207", "19666192", "6187418", "7365437", "3757640", "8298854", "26846554",
  "19737856", "7222168", "19150538", "7233264", "20669197", "2259226", "27429700",
  "37729825", "7820689",
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Ensure new treatments exist (idempotent) + fill RU/AZ names.
    for (const t of NEW_TREATMENTS) {
      await client.query(
        `INSERT INTO treatments (slug, name, name_ru, name_az)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (slug) DO UPDATE SET
           name_ru = COALESCE(treatments.name_ru, EXCLUDED.name_ru),
           name_az = COALESCE(treatments.name_az, EXCLUDED.name_az)`,
        [t.slug, t.en, t.ru, t.az]
      );
    }

    // treatment slug -> id (all treatments now)
    const { rows: tr } = await client.query<{ id: number; slug: string }>("SELECT id, slug FROM treatments");
    const tId = new Map(tr.map((r) => [r.slug, r.id]));

    // Images already used.
    const { rows: used } = await client.query<{ image: string | null }>("SELECT image FROM sanatoriums");
    const usedIds = new Set(used.map((u) => (u.image ?? "").replace(/^\/img\/|\.jpg$/g, "")));
    const onDisk = readdirSync(join(process.cwd(), "public", "img"))
      .filter((f) => f.endsWith(".jpg"))
      .map((f) => f.replace(/\.jpg$/, ""));
    const imgPool = [...IMG_CANDIDATES, ...onDisk.filter((id) => !IMG_CANDIDATES.includes(id))];
    const freeImgs = imgPool.filter((id) => !usedIds.has(id));
    let imgIdx = 0;

    let addedCountries = 0, addedClinics = 0;

    for (const C of COUNTRIES) {
      const countrySlug = slugify(C.name);
      const existing = await client.query("SELECT id FROM countries WHERE slug = $1", [countrySlug]);
      if (existing.rows.length > 0) {
        console.log(`${C.name} already exists — skipping.`);
        continue;
      }

      // validate treatment slugs for this country
      for (const cl of C.clinics) {
        for (const slug of cl.treatments) {
          if (!tId.has(slug)) throw new Error(`Unknown treatment slug: ${slug}`);
        }
      }
      if (freeImgs.length - imgIdx < C.clinics.length) {
        throw new Error(`Not enough free images for ${C.name}: need ${C.clinics.length}, have ${freeImgs.length - imgIdx}`);
      }

      const { rows: cr } = await client.query<{ id: number }>(
        `INSERT INTO countries (name, slug, flag, blurb, cover, name_ru, name_az, blurb_ru, blurb_az)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [C.name, countrySlug, C.flag, C.blurb_en, `/countries/${countrySlug}.jpg`, C.name_ru, C.name_az, C.blurb_ru, C.blurb_az]
      );
      const countryId = cr[0].id;
      addedCountries++;

      for (const cl of C.clinics) {
        const image = `/img/${freeImgs[imgIdx++]}.jpg`;
        const { rows: sr } = await client.query<{ id: number }>(
          `INSERT INTO sanatoriums
            (name, slug, city, stars, summary, description, image, country_id,
             name_ru, name_az, summary_ru, summary_az, description_ru, description_az)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
          [
            cl.name, slugify(`${cl.name}-${cl.city}`), cl.city, null,
            cl.summary_en, cl.description_en, image, countryId,
            cl.name, cl.name, cl.summary_ru, cl.summary_az, cl.description_ru, cl.description_az,
          ]
        );
        const sanId = sr[0].id;
        for (const slug of cl.treatments) {
          await client.query(
            "INSERT INTO sanatorium_treatments (sanatorium_id, treatment_id) VALUES ($1,$2)",
            [sanId, tId.get(slug)!]
          );
        }
        addedClinics++;
      }
      console.log(`Added ${C.name} + ${C.clinics.length} clinics.`);
    }

    await client.query("COMMIT");
    console.log(`Done. Countries added: ${addedCountries}, clinics added: ${addedClinics}.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
