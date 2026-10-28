import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

// Load DATABASE_URL from .env (no dotenv dep: parse the file ourselves).
function loadEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const env = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch {
    /* ignore */
  }
}
loadEnv();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

// ---------------------------------------------------------------------------
const T = {
  musculoskeletal: "Musculoskeletal & Joints",
  nervous: "Nervous System",
  cardio: "Cardiovascular",
  digestive: "Digestive System",
  respiratory: "Respiratory",
  skin: "Skin Conditions",
  gynecology: "Gynecology",
  urology: "Urology & Kidneys",
  endocrine: "Endocrine & Metabolism",
  diabetes: "Diabetes",
  rehab: "Rehabilitation",
  spa: "Spa & Wellness",
  naftalan: "Naftalan Therapy",
  balneo: "Balneotherapy (Mineral Water)",
  mud: "Mud Therapy",
  halotherapy: "Salt / Halotherapy",
} as const;

type Tag = keyof typeof T;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Image pools by theme (Pexels IDs downloaded to /public/img/<id>.jpg).
// Each sanatorium gets a UNIQUE image: its treatment profile picks a pool, and
// we consume images from that pool without repeating (falling back if drained).
const IMG_POOLS: Record<string, string[]> = {
  thermal: ["23322331", "39440977", "13230442", "28518909", "11132693", "31138249", "18049906", "32963833", "28407597", "15083379", "7041600", "13245235", "7222178", "19666207"],
  spa: ["9146381", "18120174", "19641818", "19666192", "6187418", "7365437", "3757640", "8298854", "26846554", "10610447", "19737856", "7222168", "19150538", "7233264", "20669197"],
  rehab: ["29807423", "13538710", "20860622", "20860597", "14797757", "20860625", "5793792", "20860616", "4506160", "3248690", "5794054", "20860592", "5793917", "4506073", "20860588"],
  salt: ["13427457", "12125343", "17288260", "7717461"],
  mountain: ["14504291", "39158659", "7942026", "6049600", "1740175", "6634828", "35988767", "27769600", "39608040", "19627818"],
  nature: ["36209536", "8765693", "1612351", "2259226", "27429700", "37729825", "32334284", "10613691", "7820689"],
  seaside: ["12985227", "27566374", "29512917", "7560128", "38259971", "30973635", "27063422", "14012235"],
  luxury: ["14841129", "14011664", "5371683", "15227142", "31876128", "12695271", "3011575", "8135492", "18285958", "6903157", "29239105", "8146330", "34496715", "31488380"],
};

function poolFor(tags: string[]): string {
  if (tags.includes("halotherapy") || tags.includes("respiratory")) return "salt";
  if (tags.includes("balneo")) return "thermal";
  if (tags.includes("naftalan")) return "spa";
  if (tags.includes("rehab") || tags.includes("musculoskeletal")) return "rehab";
  if (tags.includes("spa")) return "spa";
  return "luxury";
}

// Stateful unique assigner: tracks consumed ids across the whole dataset.
function makeImageAssigner() {
  const used = new Set<string>();
  const cursors: Record<string, number> = {};
  const order = ["luxury", "nature", "mountain", "spa", "thermal", "rehab", "seaside", "salt"];

  function take(pool: string): string | null {
    const ids = IMG_POOLS[pool] ?? [];
    let i = cursors[pool] ?? 0;
    while (i < ids.length) {
      const id = ids[i++];
      if (!used.has(id)) {
        cursors[pool] = i;
        used.add(id);
        return id;
      }
    }
    cursors[pool] = i;
    return null;
  }

  return function assign(s: SanatoriumSeed): string {
    const primary = poolFor(s.treatments);
    // Try primary pool first, then any other pool, so every item is unique.
    let id = take(primary);
    if (!id) for (const p of order) { id = take(p); if (id) break; }
    // Absolute fallback (shouldn't happen with 100+ images): reuse primary[0].
    if (!id) id = IMG_POOLS[primary][0] ?? "14841129";
    return `/img/${id}.jpg`;
  };
}

interface SanatoriumSeed {
  name: string;
  city: string;
  stars?: number;
  summary: string;
  description: string;
  treatments: Tag[];
}
interface CountrySeed {
  name: string;
  flag: string;
  blurb: string;
  sanatoriums: SanatoriumSeed[];
}

const DATA: CountrySeed[] = [
  {
    name: "Azerbaijan",
    flag: "🇦🇿",
    blurb:
      "Home of Naftalan — the world's only medicinal oil resort — plus coastal balneology, salt caves and mountain spas.",
    sanatoriums: [
      { name: "Garabag Resort & Spa", city: "Naftalan", stars: 5, summary: "Modern 5-star resort using medicinal Naftalan oil for musculoskeletal and skin conditions.", description: "A modern five-star health resort in Naftalan, Azerbaijan, combining comfortable leisure, wellness programs and a wide range of spa services. Its signature feature is the use of Naftalan oil in therapeutic procedures.", treatments: ["naftalan", "musculoskeletal", "skin", "spa"] },
      { name: "Chinar Hotel & Spa", city: "Naftalan", stars: 5, summary: "5-star Naftalan oil complex for musculoskeletal and skin disorders.", description: "A modern five-star health and resort complex in the scenic town of Naftalan. Its signature feature is the use of Naftalan oil in treatments for musculoskeletal and skin conditions.", treatments: ["naftalan", "musculoskeletal", "skin", "spa"] },
      { name: "Gashalti Health Hotel", city: "Naftalan", stars: 5, summary: "5-star wellness complex applying Naftalan oil therapy.", description: "A modern five-star medical and wellness complex in Naftalan, applying Naftalan oil in its therapeutic procedures.", treatments: ["naftalan", "musculoskeletal", "skin"] },
      { name: "Naftalan Central Wellness", city: "Naftalan", stars: 4, summary: "Naftalan oil treatments, physiotherapy and massage.", description: "A health and wellness complex offering therapeutic Naftalan oil procedures, physiotherapy and massage.", treatments: ["naftalan", "musculoskeletal", "rehab"] },
      { name: "Park Naftalan", city: "Naftalan", stars: 4, summary: "Wellness programs with Naftalan oil, physiotherapy and massage.", description: "Wellness programs and therapeutic procedures using Naftalan oil, physiotherapy and massage.", treatments: ["naftalan", "musculoskeletal", "rehab"] },
      { name: "Kapaz Naftalan", city: "Naftalan", stars: 4, summary: "Health leisure and Naftalan oil procedures.", description: "Health-focused leisure and procedures using Naftalan oil, physiotherapy and massage.", treatments: ["naftalan", "musculoskeletal"] },
      { name: "Karvan Naftalan", city: "Naftalan", stars: 4, summary: "Resort complex with Naftalan spa programs.", description: "A complex for wellness leisure and sanatorium programs applying Naftalan oil.", treatments: ["naftalan", "musculoskeletal", "spa"] },
      { name: "Nafta Sanatorium", city: "Naftalan", stars: 4, summary: "Preventive programs and Naftalan procedures.", description: "Preventive and therapeutic programs with Naftalan oil procedures prescribed individually.", treatments: ["naftalan", "musculoskeletal", "rehab"] },
      { name: "Sun City Hotel & Spa Naftalan", city: "Naftalan", stars: 4, summary: "Hotel-wellness complex with spa zone and Naftalan baths.", description: "A hotel and wellness complex with a spa zone and Naftalan oil baths.", treatments: ["naftalan", "spa", "musculoskeletal"] },
      { name: "Sehirli Naftalan", city: "Naftalan", stars: 4, summary: "Naftalan oil therapy for joints and skin.", description: "Therapeutic practice with Naftalan oil for musculoskeletal and skin conditions.", treatments: ["naftalan", "musculoskeletal", "skin"] },
      { name: "Gozel Naftalan", city: "Naftalan", stars: 3, summary: "Affordable Naftalan therapy and sanatorium stay.", description: "An affordable option for sanatorium leisure and Naftalan oil therapy.", treatments: ["naftalan", "musculoskeletal"] },
      { name: "Mocuzeli Naftalan", city: "Naftalan", stars: 3, summary: "Wellness procedures with Naftalan oil.", description: "Wellness procedures using Naftalan oil.", treatments: ["naftalan", "musculoskeletal"] },
      { name: "Shikh Sanatorium", city: "Shikhovo / Bibi-Heybat", summary: "Caspian seaside: hydrogen sulfide baths, physiotherapy, Naftalan.", description: "A sanatorium by the Caspian Sea offering physiotherapy, massage, hydrogen sulfide baths, paraffin therapy and Naftalan. Treats joints and spine.", treatments: ["balneo", "musculoskeletal", "naftalan", "rehab"] },
      { name: "Bilgah Health Center", city: "Bilgah", summary: "Coastal cardiology center using iodine-bromine water.", description: "A cardiology center in the coastal zone for treatment and rehabilitation of the cardiovascular system using iodine-bromine water.", treatments: ["cardio", "balneo", "rehab"] },
      { name: "Absheron Sanatorium", city: "Mardakan", summary: "Gastroenterology sanatorium for digestive disorders.", description: "A gastroenterology sanatorium treating diseases of the stomach, intestines and digestive system.", treatments: ["digestive"] },
      { name: "Sanatorium-Resort Rehabilitation Center", city: "Absheron", summary: "Medical center for recovery after illness and injury.", description: "A medical center for restoring bodily functions after illnesses and injuries.", treatments: ["rehab"] },
      { name: "Guneshli Sanatorium", city: "Absheron", summary: "Coastal wellness sanatorium on the Absheron peninsula.", description: "A health and wellness institution in the coastal part of the Absheron peninsula.", treatments: ["spa", "rehab"] },
      { name: "Shabran Wellbeing Resort", city: "Shabran", stars: 5, summary: "Luxury Ayurveda resort with Panchakarma programs.", description: "A luxury Ayurveda resort surrounded by nature: spa, massages, Panchakarma and relaxation programs.", treatments: ["spa", "rehab"] },
      { name: "Lankaran Springs Wellness Resort", city: "Lankaran", stars: 5, summary: "Thermal 'Istisu' mineral springs and balneotherapy.", description: "Thermal mineral springs ('Istisu'), balneotherapy and the YENEE ZEN and YENEE SLIM wellness programs.", treatments: ["balneo", "spa", "rehab"] },
      { name: "Shahdag Quba & Truskavets", city: "Quba", summary: "Riverside treatment of joints, endocrine disorders and diabetes.", description: "Treatment of musculoskeletal and endocrine disorders and diabetes on the bank of the Gudialchay river.", treatments: ["musculoskeletal", "endocrine", "diabetes"] },
      { name: "Marxal Resort & Spa", city: "Sheki", stars: 5, summary: "Mountain resort at 1080m with spa, pools and hammam.", description: "A mountain resort at 1080m: spa center, pools, hammam, massages and active leisure.", treatments: ["spa", "rehab"] },
      { name: "Duzdag Physiotherapy Center", city: "Nakhchivan", summary: "Underground salt-cave speleotherapy for respiratory disease.", description: "A salt treatment center offering speleotherapy in underground salt mines for respiratory diseases.", treatments: ["halotherapy", "respiratory"] },
      { name: "Maricel Naftalan", city: "Baku", summary: "Baku wellness center: Naftalan therapy and salt rooms.", description: "A wellness center in Baku offering Naftalan therapy and salt rooms (halotherapy).", treatments: ["naftalan", "halotherapy", "respiratory"] },
    ],
  },
  {
    name: "Belarus",
    flag: "🇧🇾",
    blurb:
      "Forest-and-lake sanatoriums rich in radon water, sapropel mud and own mineral springs, with full-board medical programs.",
    sanatoriums: [
      { name: "Alfa Radon Medical & Spa Resort", city: "Boroviki", stars: 5, summary: "Radon-water and sapropel-mud resort for joints and nervous system.", description: "Located in Boroviki, this resort offers an indoor pool, a medical-diagnostic center and a spa. It specializes in musculoskeletal, peripheral nervous system and urogenital conditions, using radon water and sapropel mud alongside physiotherapy. Rooms include full board, a doctor's consultation and spa access.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "urology", "spa"] },
      { name: "Narochansky Bereg Sanatorium", city: "Lake Naroch, Minsk Region", summary: "Lakeside pine-forest sanatorium for heart, spine and respiratory care.", description: "By Lake Naroch among pine forests. Focus areas: cardiovascular, spine and joints, respiratory and digestive conditions. Offers massage, physiotherapy, therapeutic baths, inhalations, heat therapy and dietary meals.", treatments: ["cardio", "musculoskeletal", "respiratory", "digestive", "rehab"] },
      { name: "Energetik Wellness Center", city: "Zelyonaya, Minsk Region", summary: "Cardio, nervous and respiratory care near Minsk Sea.", description: "Near Minsk and the Minsk Sea. Treats cardiovascular and nervous systems, respiratory organs, spine and joints. Procedures include therapeutic baths, massage, physiotherapy, mud therapy, inhalations and a salt cave.", treatments: ["cardio", "nervous", "respiratory", "musculoskeletal", "mud", "halotherapy"] },
      { name: "Beryozka Sanatorium", city: "Soligorsk", summary: "Reservoir-side sanatorium with mineral water drinking cures.", description: "On the shore of the Soligorsk reservoir among pine forest. Treats cardiovascular and nervous systems, respiratory and digestive organs, spine, joints and gynecological conditions, with mineral-water drinking cures and spa services.", treatments: ["cardio", "nervous", "digestive", "musculoskeletal", "gynecology", "balneo"] },
      { name: "Priozyorny Sanatorium", city: "Naroch", summary: "Lake Naroch spa complex with acupuncture and mineral water.", description: "In the resort village of Naroch by the lake and pine forest. Treats cardiovascular and nervous systems, spine and joints, digestive and urogenital organs, with massage, baths, physiotherapy, mud therapy, inhalations, acupuncture and mineral-water treatment.", treatments: ["cardio", "nervous", "musculoskeletal", "digestive", "urology", "balneo", "mud"] },
      { name: "K. P. Orlovsky Sanatorium", city: "Kirovsk, Mogilev Region", summary: "Spine, digestive and respiratory care with halotherapy.", description: "About 88 km from Mogilev beside a forest park and reservoir. Treats spine and joints, digestive, respiratory and nervous systems, with massage, physiotherapy, mud therapy, baths, inhalations, halotherapy and mineral water.", treatments: ["musculoskeletal", "digestive", "respiratory", "nervous", "mud", "halotherapy"] },
      { name: "V. I. Lenin Sanatorium", city: "Bobruisk, Mogilev Region", summary: "Riverside sanatorium with own four mineral-water springs.", description: "On the Berezina river in a green park. Treats spine and joints, nervous and urogenital systems, digestive organs, with mud therapy, baths, massage, physiotherapy, manual therapy and drinking cures from four own mineral springs.", treatments: ["musculoskeletal", "nervous", "urology", "digestive", "mud", "balneo"] },
      { name: "Sosny Sanatorium (Mogilev)", city: "Shapchitsy, Mogilev Region", summary: "Pine-forest sanatorium with own mineral springs.", description: "Among coniferous forest near the Dnieper. Treats digestive and respiratory organs, spine, joints and gynecological conditions, with massage, physiotherapy, baths, mud therapy, inhalations and mineral water from own springs.", treatments: ["digestive", "respiratory", "musculoskeletal", "gynecology", "mud", "balneo"] },
      { name: "Gubernskaya Hotel", city: "Mogilev", stars: 4, summary: "4-star spa hotel (wellness, not full medical sanatorium).", description: "In the historic center of Mogilev. A four-star hotel rather than a classic sanatorium: spa zone, sauna, water procedures, massage and gym. Suited to comfortable relaxation and recovery rather than treatment of chronic disease.", treatments: ["spa", "rehab"] },
      { name: "Zolotye Peski Sanatorium", city: "Gomel Region", summary: "Riverside forest sanatorium with mineral-water pool.", description: "About 40 km from Gomel on the Sozh river. Treats cardiovascular and nervous systems, respiratory and digestive organs, spine, joints and urogenital system, with massage, physiotherapy, mud therapy, baths, inhalations, halotherapy and mineral water. Has an indoor mineral-water pool and sandy beach.", treatments: ["cardio", "nervous", "respiratory", "digestive", "musculoskeletal", "urology", "mud", "halotherapy"] },
      { name: "Chyonki Sanatorium", city: "Gomel Region", summary: "Forest-park sanatorium near Gomel with salt cave.", description: "A few km from Gomel in a forest park on the Sozh river. Treats cardiovascular and nervous systems, respiratory and digestive organs, spine, joints, metabolic and some gynecological conditions, with baths, massage, mud therapy, physiotherapy, inhalations, a salt cave and therapeutic exercise.", treatments: ["cardio", "nervous", "respiratory", "digestive", "musculoskeletal", "gynecology", "mud", "halotherapy"] },
      { name: "Serebryanye Klyuchi Sanatorium", city: "Svetlogorsk District, Gomel Region", summary: "Pine-forest riverside sanatorium with magnetotherapy.", description: "In pine forest on the Berezina river. Treats cardiovascular and nervous systems, respiratory and digestive organs, spine and joints, with massage, physiotherapy, baths, mud therapy, inhalations, magnetotherapy and mineral water from own springs.", treatments: ["cardio", "nervous", "respiratory", "digestive", "musculoskeletal", "mud", "balneo"] },
      { name: "Sosny Sanatorium (Gomel)", city: "Mozyr District, Gomel Region", summary: "Pine-forest sanatorium with Naftalan baths.", description: "Among pine forest on the Pripyat river. Treats spine and joints, digestive and respiratory organs and some gynecological conditions, with massage, physiotherapy, mud therapy, baths, inhalations and Naftalan baths.", treatments: ["musculoskeletal", "digestive", "respiratory", "gynecology", "mud", "naftalan"] },
    ],
  },
  {
    name: "Georgia",
    flag: "🇬🇪",
    blurb:
      "Balneological resorts famed for warm radon springs (Tskaltubo), Borjomi mineral water and black magnetic sand beaches.",
    sanatoriums: [
      { name: "Legends Tskaltubo Spa Resort", city: "Tskaltubo", stars: 4, summary: "Warm radon mineral springs (33–35°C) in a 16-hectare forest.", description: "The balneological resort of Tskaltubo is famous for natural warm radon mineral springs (33–35°C). This hotel-sanatorium sits at the heart of the resort, surrounded by its own 16-hectare forest. Treats andrological, gynecological, skin, urogenital, nervous, musculoskeletal, cardiovascular and endocrine conditions plus metabolic disorders.", treatments: ["balneo", "musculoskeletal", "nervous", "cardio", "skin", "gynecology", "urology", "endocrine"] },
      { name: "Tskaltubo Hotel Prometheus", city: "Tskaltubo", stars: 3, summary: "Thermal-spring hotel with mineral baths and hydromassage.", description: "In the thermal-spring town of Tskaltubo, 25 km from David the Builder International Airport. Offers wellness for spine and joints, nervous system and some gynecological and skin conditions, with mineral baths, therapeutic massage, physiotherapy, hydromassage and mud therapy. Some procedures are done at nearby balneological centers.", treatments: ["balneo", "musculoskeletal", "nervous", "gynecology", "skin", "mud"] },
      { name: "Sairme Hotels & Resorts", city: "Bagdati", stars: 4, summary: "Mountain balneological resort at 950m, Georgia's 3rd water cure.", description: "A resort at 950m in the forested mountains of Bagdati, with a balneological wellness center. Ranked third among Georgian water-cure resorts after Borjomi and Abastumani. Treats metabolic disorders (diabetes, gout), kidney and urinary diseases, digestive organs, musculoskeletal diseases, skin, neurological and gynecological conditions and circulatory diseases.", treatments: ["balneo", "endocrine", "diabetes", "urology", "digestive", "musculoskeletal", "skin", "nervous", "gynecology", "cardio"] },
      { name: "Borjomi Likani Health & Spa Centre", city: "Borjomi", summary: "Riverside spa with pediatric and digestive programs.", description: "350m from the Kura river, with a spa and wellness center featuring an indoor pool, sauna, Turkish bath, hydromassage and medical procedures. Treats children's health, digestive organs, kidneys and urinary tract, endocrine system, metabolic disorders, gynecological, andrological, musculoskeletal, cardiovascular, skin and nervous conditions.", treatments: ["balneo", "digestive", "urology", "endocrine", "gynecology", "musculoskeletal", "cardio", "skin", "nervous", "rehab"] },
      { name: "Borjomi Palace Health & Spa Center", city: "Borjomi", stars: 4, summary: "Spa hotel using Borjomi water, salts and volcanic mud.", description: "In central Borjomi, 800m from the Mineral Water Park. The medical wing uses procedures based on Borjomi water, therapeutic salts and volcanic mud. Treats gastrointestinal, metabolic, musculoskeletal, cardiovascular, ENT, gynecological, urological and neurological conditions.", treatments: ["balneo", "digestive", "endocrine", "musculoskeletal", "cardio", "gynecology", "urology", "nervous", "mud"] },
      { name: "Lopota Lake Resort & Spa", city: "Kakheti", stars: 5, summary: "Luxury lakeside spa resort for relaxation (not medical).", description: "A luxury resort by a lake among mountains and vineyards in Kakheti. A leisure and spa hotel rather than a medical sanatorium: relaxing and therapeutic massage, hydrotherapy, mud wraps, face and body treatments and anti-stress programs.", treatments: ["spa", "rehab"] },
      { name: "Kolkhida Resort & Spa", city: "Ureki", stars: 4, summary: "Black Sea resort with magnetic black-sand therapy.", description: "A health resort in Ureki on the Black Sea near the famous black magnetic sand. Offers wellness for spine and joints, nervous and cardiovascular systems, some skin and metabolic conditions, with magnetic-sand baths, therapeutic baths, massage, balneotherapy and physiotherapy. Has its own 250m beach.", treatments: ["balneo", "musculoskeletal", "nervous", "cardio", "skin", "endocrine"] },
    ],
  },
  {
    name: "Hungary",
    flag: "🇭🇺",
    blurb:
      "World-renowned thermal spa hotels at Hévíz, Sárvár and Budapest's Margaret Island for rheumatic and musculoskeletal care.",
    sanatoriums: [
      { name: "Ensana Thermal Sárvár", city: "Sárvár", stars: 4, summary: "Thermal-water spa with indoor/outdoor pools and medical center.", description: "A four-star resort hotel in central Sárvár with a large spa using the town's famous thermal water, indoor and outdoor thermal pools and a medical center. Treats musculoskeletal, gynecological, skin, respiratory and nervous-system conditions.", treatments: ["balneo", "musculoskeletal", "gynecology", "skin", "respiratory", "nervous", "spa"] },
      { name: "Ensana Thermal Hévíz", city: "Hévíz", stars: 4, summary: "600m from Lake Hévíz, rheumatic-disease programs.", description: "An upgraded four-star hotel 600m from the famous thermal lake, with a large wellness center. Offers spa, cosmetic and wellness procedures plus traditional programs for rheumatic diseases. Treats musculoskeletal, nervous, digestive and gynecological conditions.", treatments: ["balneo", "musculoskeletal", "nervous", "digestive", "gynecology", "spa"] },
      { name: "Ensana Grand Margaret Island", city: "Budapest", stars: 4, summary: "Historic island hotel linked to a top European spa center.", description: "Built in 1873 on leafy Margaret Island in central Budapest, with a large spa. An underground heated corridor connects it to the Danubius Margitsziget wellness hotel. Specializes in spine and joint conditions, chronic back pain, some nervous-system disorders and recovery from stress and lymphatic disorders, with thermal baths, mud therapy, medical massage, physiotherapy, underwater massage and therapeutic gymnastics.", treatments: ["balneo", "musculoskeletal", "nervous", "mud", "rehab", "spa"] },
      { name: "Ensana Thermal Aqua", city: "Hévíz", stars: 4, summary: "Thermal hydrotherapy center 500m from Lake Hévíz.", description: "In central Hévíz, 500m from the thermal lake, with a wellness center and large spa zone offering thermal hydrotherapy, phototherapy and mechanotherapy. Treats musculoskeletal, nervous, digestive and gynecological conditions.", treatments: ["balneo", "musculoskeletal", "nervous", "digestive", "gynecology", "spa"] },
    ],
  },
  {
    name: "Lithuania",
    flag: "🇱🇹",
    blurb:
      "Druskininkai resort town — mineral water, therapeutic mud and large spa complexes beside the Neman river and pine forests.",
    sanatoriums: [
      { name: "Hotel Violeta", city: "Druskininkai", stars: 4, summary: "Cozy spa hotel by the Neman river and promenade.", description: "A four-star hotel in the resort town by the Neman river, with comfortable rooms, restaurant, parking and spa services: massages, jacuzzi and steam baths. Close to the water park, treatment centers and mineral springs. Suited to relaxing stays combining spa and wellness.", treatments: ["spa", "rehab"] },
      { name: "Sanatorija Draugystė", city: "Druskininkai", stars: 3, summary: "Medical sanatorium with 300+ treatment procedures.", description: "A medical sanatorium by the Neman river in a green park zone, with a pool, saunas, massages and more than 300 therapeutic procedures using mineral water and therapeutic mud. Treats musculoskeletal, nervous, cardiovascular, respiratory and digestive conditions, plus rehabilitation after injury.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "cardio", "respiratory", "digestive", "rehab"] },
      { name: "Eglė Standard", city: "Druskininkai", stars: 3, summary: "Adults-only medical wing of the Eglė sanatorium in pine forest.", description: "A medical and wellness wing of the Eglė sanatorium surrounded by pine forest, for adults 18+. Treats joints and spine, nervous and cardiovascular systems, with rehabilitation, physiotherapy, therapeutic exercise, massages, mineral baths and mud therapy.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "cardio", "rehab"] },
      { name: "Hotel Lietuva PLUS", city: "Druskininkai", stars: 3, summary: "Comfortable hotel in the Grand SPA Lietuva complex.", description: "Part of the Grand SPA Lietuva complex in the town center, with pools, water park, saunas and a wellness center. Treats joints and spine and the nervous system, with rehabilitation, therapeutic baths, massages and physiotherapy.", treatments: ["musculoskeletal", "nervous", "rehab", "spa"] },
      { name: "Grand SPA Lietuva Hotel Druskininkai", city: "Druskininkai", stars: 4, summary: "4-star hotel in a large spa complex with treatment center.", description: "A four-star hotel in the resort center, part of a large spa complex with pools, water park, saunas and a treatment center. Treats joints and spine, cardiovascular, respiratory and digestive conditions, with rehabilitation, physiotherapy, therapeutic and mineral baths, mud therapy and massage.", treatments: ["balneo", "mud", "musculoskeletal", "cardio", "respiratory", "digestive", "rehab", "spa"] },
    ],
  },
  {
    name: "Russia",
    flag: "🇷🇺",
    blurb:
      "Yessentuki — the Caucasus Mineral Waters spa town — specializing in gastrointestinal, metabolic and liver treatment.",
    sanatoriums: [
      { name: "Kazakhstan Sanatorium", city: "Yessentuki", stars: 4, summary: "Multi-profile sanatorium with mineral water and mud therapy.", description: "A multi-profile sanatorium with a pool, treatment center and parkland. Treats stomach and intestinal disease, metabolic disorders, joints and spine, nervous system, ENT, urological and gynecological conditions using mineral waters, therapeutic mud, physiotherapy and massage.", treatments: ["balneo", "mud", "digestive", "endocrine", "musculoskeletal", "nervous", "urology", "gynecology"] },
      { name: "Park Shafran Sanatorium", city: "Yessentuki", stars: 5, summary: "Premium sanatorium (opened 2025) for gastro and metabolic care.", description: "A modern premium sanatorium opened in 2025, opposite the Central Resort Park near mineral-water pump rooms and a mud-bath facility. Treats stomach and intestinal disease, metabolic disorders and musculoskeletal problems, with gastroenterological rehabilitation, physiotherapy and massages.", treatments: ["balneo", "mud", "digestive", "endocrine", "musculoskeletal", "rehab"] },
      { name: "Rus Sanatorium", city: "Yessentuki", stars: 4, summary: "Modern sanatorium with large medical center and mud therapy.", description: "A modern sanatorium with buffet restaurant, pool, spa and large medical center using mineral waters, therapeutic mud and physiotherapy. Treats stomach and intestinal disease, liver and gallbladder, metabolic disorders, joints and spine, plus rehabilitation and therapeutic gymnastics.", treatments: ["balneo", "mud", "digestive", "endocrine", "musculoskeletal", "rehab"] },
      { name: "M. I. Kalinin Sanatorium", city: "Yessentuki", stars: 3, summary: "The resort's oldest sanatorium, in a green park zone.", description: "The oldest sanatorium of the resort, in a green park zone, with dietary meals, pool, gym and treatment wing using mineral water, therapeutic mud and physiotherapy. Treats stomach and intestinal disease, liver and gallbladder, diabetes, obesity and metabolic disorders.", treatments: ["balneo", "mud", "digestive", "diabetes", "endocrine"] },
      { name: "Istochnik Sanatorium", city: "Yessentuki", stars: 5, summary: "Premium-class sanatorium by the park and mineral springs.", description: "A modern premium-class sanatorium in the resort center near the park and mineral springs, with buffet restaurant, pool, saunas, spa and a modern medical center. Treats stomach and intestinal disease, liver and bile ducts, metabolic disorders and diabetes, plus joint, heart, urological and gynecological programs.", treatments: ["balneo", "digestive", "endocrine", "diabetes", "musculoskeletal", "cardio", "urology", "gynecology"] },
      { name: "Metallurg Sanatorium", city: "Yessentuki", stars: 4, summary: "Central sanatorium on 6 hectares near a mineral-water pump room.", description: "In the resort center on about 6 hectares of greenery, with pool, gym and medical center near a mineral-water pump room. Treats stomach and intestinal disease, liver, joints and spine, nervous system, respiratory organs, plus urological and gynecological conditions using mineral waters, mud, physiotherapy, massage and therapeutic exercise.", treatments: ["balneo", "mud", "digestive", "musculoskeletal", "nervous", "respiratory", "urology", "gynecology"] },
    ],
  },
  {
    name: "Serbia",
    flag: "🇷🇸",
    blurb:
      "Thermal-mineral spa towns (Vrnjačka Banja, Prolom Banja) focused on rehabilitation, rheumatic and digestive care.",
    sanatoriums: [
      { name: "Medical and Spa Centre Merkur", city: "Vrnjačka Banja", stars: 3, summary: "Thermal-mineral medical complex for diabetes and digestive care.", description: "A medical and wellness complex with thermal-mineral pools, saunas and a spa using therapeutic mineral waters, mud therapy, massage and physiotherapy. Treats diabetes, stomach and intestinal disease, liver and digestive system, metabolic disorders, joints and spine, plus rehabilitation.", treatments: ["balneo", "mud", "diabetes", "digestive", "endocrine", "musculoskeletal", "rehab"] },
      { name: "Premier Aqua", city: "Vrdnik", stars: 5, summary: "Adults-only spa hotel with Aqua Medica medical center.", description: "A comfortable adults-only spa hotel in Vrdnik between Belgrade and Novi Sad, with thermal pools, saunas, a salt room and the Aqua Medica medical center. Main profile: rehabilitation for joint and spine conditions, muscle pain and mobility disorders, with physiotherapy, therapeutic gymnastics, hydrotherapy and massage.", treatments: ["balneo", "musculoskeletal", "rehab", "halotherapy", "spa"] },
      { name: "Ribarska Banja", city: "Kruševac", summary: "Specialized rehabilitation complex in green mountain country.", description: "A specialized rehabilitation complex in green mountain country near Kruševac, with thermal-mineral pools and a medical center. Treats joints and spine, bones and muscles, and degenerative musculoskeletal changes, with rehabilitation after injury and surgery, physiotherapy, therapeutic gymnastics, hydrotherapy and electrotherapy.", treatments: ["balneo", "musculoskeletal", "rehab"] },
      { name: "Hotel Radan", city: "Prolom Banja", stars: 3, summary: "Mountain spa hotel using Prolom mineral water.", description: "A health hotel surrounded by mountains and forests, with indoor and outdoor mineral-water pools, saunas, spa and medical center. Treats kidney and urinary-tract disease, stomach and intestines, rheumatic conditions and some skin diseases, using Prolom mineral water, therapeutic mud, massage, physiotherapy and hydrotherapy.", treatments: ["balneo", "mud", "urology", "digestive", "musculoskeletal", "skin"] },
    ],
  },
  {
    name: "Slovakia",
    flag: "🇸🇰",
    blurb:
      "Piešťany spa island — famed for sulphur thermal water and healing mud, specialising in joints, spine and rehabilitation.",
    sanatoriums: [
      { name: "Ensana Pro Patria Health Spa Hotel", city: "Piešťany", stars: 2, summary: "Classic spa sanatorium on Piešťany's spa island, sulphur thermal water and mud.", description: "A therapeutic sanatorium on Kúpeľný ostrov (Spa Island) in the famous Slovak resort town of Piešťany, renowned for its natural sulphur thermal water and healing sulphur mud. Its main focus is musculoskeletal, rheumatic and some neurological conditions, plus recovery after surgery and improved mobility.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "rehab"] },
      { name: "Ensana Esplanade Wing Alameda Health Spa Hotel", city: "Piešťany", stars: 4, summary: "4-star spa hotel linked to the large Balnea treatment centre.", description: "A four-star medical-wellness hotel on the Spa Island in Piešťany. The Alameda wing belongs to the Esplanade complex and is connected to the large Balnea treatment centre for medical procedures and rehabilitation. Treats joint disease (arthrosis, arthritis, rheumatism), spine conditions, osteoporosis, neurological disorders and post-injury and orthopaedic rehabilitation.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "rehab"] },
      { name: "Ensana Splendid Wing Grand Health Spa Hotel", city: "Piešťany", stars: 3, summary: "3-star spa sanatorium in a green park, connected to Balnea Health Spa.", description: "A three-star medical-wellness sanatorium on the Spa Island in Piešťany, in a green park zone and connected to the large Balnea Health Spa centre. Combines comfortable accommodation, dining and a wide range of treatments based on thermal sulphur water and healing mud. Treats joints, spine, osteoporosis, neurological disorders, rehabilitation, certain skin conditions (psoriasis, eczema) and chronic respiratory conditions via inhalation.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "rehab", "skin", "respiratory"] },
      { name: "Ensana Thermia Palace Health Spa Hotel", city: "Piešťany", stars: 5, summary: "Luxury 5-star Art Nouveau spa hotel with the Irma Health Spa centre.", description: "A luxury five-star medical-wellness hotel in a historic Art Nouveau building on the Spa Island in Piešťany, connected to the Irma Health Spa centre using the famous sulphur thermal water and healing mud. Combines medical treatment, rehabilitation and high-end leisure. Treats joints, spine, osteoporosis, neurological disorders and post-surgery and injury rehabilitation.", treatments: ["balneo", "mud", "musculoskeletal", "nervous", "rehab", "spa"] },
    ],
  },
  {
    name: "Slovenia",
    flag: "🇸🇮",
    blurb:
      "Rogaška Slatina — home of magnesium-rich Donat Mg mineral water for digestive and metabolic health, plus thermal wellness resorts.",
    sanatoriums: [
      { name: "Grand Hotel Rogaška", city: "Rogaška Slatina", stars: 4, summary: "4-star wellness hotel built around magnesium-rich Donat Mg water.", description: "A four-star medical-wellness hotel known for its magnesium-rich Donat Mg mineral water, with a wellness centre, pool and saunas. Treats digestive disorders — especially constipation and functional bowel conditions — and offers weight-control, anti-stress and muscle-relaxation programs.", treatments: ["balneo", "digestive", "endocrine", "spa"] },
      { name: "Grand Hotel Zagreb", city: "Rogaška Slatina", stars: 4, summary: "Spa-park hotel with Donat Mg programs and physiotherapy.", description: "A four-star hotel in the resort park, part of the Rogaška Hotels complex, offering wellness programs, a pool, jacuzzi, saunas, massages and physiotherapy. Patients come for digestive and metabolic concerns treated with Donat Mg mineral water, plus muscle-relaxation and stress-reduction programs.", treatments: ["balneo", "digestive", "endocrine", "spa", "rehab"] },
      { name: "Grand Hotel Donat", city: "Rogaška Slatina", stars: 4, summary: "Central resort wellness hotel featuring Donat Mg water.", description: "A medical-wellness hotel in the resort centre offering wellness programs, a pool, saunas, massages and physiotherapy. Its signature is the magnesium-rich Donat Mg mineral water. Treats digestive problems including constipation and functional bowel disorders, with weight-control and stress-reduction programs.", treatments: ["balneo", "digestive", "endocrine", "spa"] },
      { name: "Grand Hotel Sava", city: "Rogaška Slatina", stars: 4, summary: "Superior hotel with ROI Medico & Spa and Lotus thermal pool.", description: "A comfortable medical-wellness hotel with its own ROI Medico & Spa medical centre, the Lotus thermal pool, saunas and a wellness centre, centred on treatment with magnesium-rich Donat Mg water. Treats gastrointestinal disease, digestive and metabolic disorders, type-2 diabetes (within specialised programs), excess weight, and joint and back pain, with rehabilitation and stress-reduction programs.", treatments: ["balneo", "digestive", "endocrine", "diabetes", "musculoskeletal", "rehab"] },
      { name: "Atlantida Boutique Hotel", city: "Rogaška Slatina", stars: 5, summary: "Modern 5-star boutique hotel with medical and wellness programs.", description: "A modern five-star boutique hotel with medical and wellness programs, an indoor pool, jacuzzi, saunas, a salt room and a massage centre, near the resort's medical centre. Known for health programs using magnesium-rich Donat Mg water. Treats digestive disorders, constipation and functional bowel problems, with weight-control, nutrition, stress-reduction and recovery programs.", treatments: ["balneo", "digestive", "endocrine", "halotherapy", "spa"] },
      { name: "Wellness Hotel Sotelia", city: "Podčetrtek", stars: 4, summary: "Forest-set wellness hotel in the Terme Olimia thermal resort.", description: "A comfortable wellness hotel within the Terme Olimia thermal resort, surrounded by forest and nature, connected to the thermal pools and wellness complexes. Features the Armonia spa centre, massages, saunas and jacuzzis. Treats arthrosis, spine conditions, osteoporosis and other musculoskeletal problems, with rehabilitation after injury and surgery and relief of muscle tension.", treatments: ["balneo", "musculoskeletal", "rehab", "spa"] },
    ],
  },
];

async function main() {
  const client = await pool.connect();
  try {
    console.log("Seeding…");
    await client.query("BEGIN");

    // Wipe (idempotent reseed).
    await client.query("TRUNCATE sanatorium_treatments, sanatoriums, treatments, countries RESTART IDENTITY CASCADE");

    // Treatments.
    const treatmentIds = new Map<string, number>();
    for (const [key, name] of Object.entries(T)) {
      const { rows } = await client.query<{ id: number }>(
        "INSERT INTO treatments (name, slug) VALUES ($1, $2) RETURNING id",
        [name, slugify(name)]
      );
      treatmentIds.set(key, rows[0].id);
    }
    console.log(`  ${treatmentIds.size} treatments`);

    const assignImage = makeImageAssigner();
    let sanatoriumCount = 0;
    for (const c of DATA) {
      const countrySlug = slugify(c.name);
      const { rows: cr } = await client.query<{ id: number }>(
        "INSERT INTO countries (name, slug, flag, blurb, cover) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [c.name, countrySlug, c.flag, c.blurb, `/countries/${countrySlug}.jpg`]
      );
      const countryId = cr[0].id;

      for (const s of c.sanatoriums) {
        const image = assignImage(s);
        const { rows: sr } = await client.query<{ id: number }>(
          `INSERT INTO sanatoriums (name, slug, city, stars, summary, description, image, country_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [s.name, slugify(`${s.name}-${s.city}`), s.city, s.stars ?? null, s.summary, s.description, image, countryId]
        );
        const sanatoriumId = sr[0].id;

        for (const tag of s.treatments) {
          await client.query(
            "INSERT INTO sanatorium_treatments (sanatorium_id, treatment_id) VALUES ($1, $2)",
            [sanatoriumId, treatmentIds.get(tag)!]
          );
        }
        sanatoriumCount++;
      }
      console.log(`  ${c.name}: ${c.sanatoriums.length}`);
    }

    // Seed testimonials / FAQ / blog ONLY if empty (don't clobber admin edits).
    const { rows: tc } = await client.query<{ n: string }>("SELECT COUNT(*) n FROM testimonials");
    if (Number(tc[0].n) === 0) {
      const testimonials = [
        ["Anna K.", "Germany", "Garabag Resort & Spa", "The coordinator answered every question within hours. My psoriasis improved more in 14 days of Naftalan than in years of creams.", 5],
        ["Michael R.", "United Kingdom", "Premier Aqua, Serbia", "After knee surgery I needed serious rehab. The program was professional, the staff caring, and the price far below home.", 5],
        ["Leyla M.", "Turkey", "Lopota Lake, Georgia", "Everything from the airport pickup to the doctor's schedule was handled. It felt like travelling with family.", 5],
      ];
      let o = 0;
      for (const [name, country, resort, quote, rating] of testimonials) {
        await client.query(
          "INSERT INTO testimonials (name, country, resort, quote, rating, sort_order) VALUES ($1,$2,$3,$4,$5,$6)",
          [name, country, resort, quote, rating, o++]
        );
      }
      console.log(`  ${testimonials.length} testimonials`);
    }

    const { rows: fc } = await client.query<{ n: string }>("SELECT COUNT(*) n FROM faqs");
    if (Number(fc[0].n) === 0) {
      const faqs = [
        ["Is the consultation really free?", "Yes. Our coordinators help you compare resorts, programs and prices at no cost. You pay the resort directly for your stay."],
        ["How do I know which resort suits my condition?", "Share your diagnosis or medical notes. Our team checks suitability with the resort's doctors before you book."],
        ["Do you help with visas and transfers?", "We prepare invitation letters where required and can organize airport transfers and local transport."],
        ["How long is a typical treatment program?", "Most sanatorium programs run 10–21 days. Shorter wellness stays of 5–7 days are also available."],
      ];
      let o = 0;
      for (const [q, a] of faqs) {
        await client.query("INSERT INTO faqs (question, answer, sort_order) VALUES ($1,$2,$3)", [q, a, o++]);
      }
      console.log(`  ${faqs.length} faqs`);
    }

    const { rows: bc } = await client.query<{ n: string }>("SELECT COUNT(*) n FROM blog_categories");
    if (Number(bc[0].n) === 0) {
      for (const name of ["Balneology", "Rehabilitation", "Travel Tips"]) {
        await client.query("INSERT INTO blog_categories (name, slug) VALUES ($1,$2)", [name, slugify(name)]);
      }
      console.log("  3 blog categories");
    }

    await client.query("COMMIT");
    console.log(`Done. ${DATA.length} countries, ${sanatoriumCount} sanatoriums.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
