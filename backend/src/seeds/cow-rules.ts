import type { Rule } from "~/types"

export const COW_RULES: Omit<Rule, "_id">[] = [
  // --- PREPARATION ---
  {
    asset_type: "cow",
    day_offset: -14,
    category: "housing",
    severity: "critical",
    title_kh: "ការរៀបចំរោងគោ និងបរិស្ថានជុំវិញ",
    instructions_kh: "សាងសង់រោងឲ្យមានដំបូលខ្ពស់ស្រឡះល្អ។ បាតរោងត្រូវចាក់ស៊ីម៉ងត៍ ឬរៀបឥដ្ឋឲ្យមានចំណោតបន្តិច ដើម្បីងាយស្រួលលាងសម្អាត និងមិនឲ្យដក់ទឹកនោម (ការពារជំងឺរលាកក្រចកជើងគោ)។ ត្រូវរៀបចំមុង ឬត្រៀមគំនរដុតភ្នក់ភ្លើងដើម្បីដេញមូសនៅពេលយប់។",
    source_page: 1,
  },
  // --- ARRIVAL DAY ---
  {
    asset_type: "cow",
    day_offset: 0,
    category: "health",
    severity: "important",
    title_kh: "ការទទួលគោ និងការត្រួតពិនិត្យសុខភាពដំបូង",
    instructions_kh: "នៅពេលគោមកដល់ថ្មីៗ ត្រូវឲ្យវាសម្រាកក្នុងរោង។ ផ្តល់ទឹកស្អាតឲ្យផឹកឲ្យបានគ្រប់គ្រាន់ និងឲ្យស៊ីស្មៅស្រស់ ឬចំបើង។ កុំទាន់ឲ្យស៊ីកន្ទក់ ឬចំណីគ្រាប់ច្រើនពេកនៅថ្ងៃដំបូង ព្រោះអាចធ្វើឲ្យគោក្បាំងពោះស្លាប់។",
    source_page: 2,
  },
  // --- WEEK 1 ---
  {
    asset_type: "cow",
    day_offset: 3,
    category: "health",
    severity: "critical",
    title_kh: "ការទម្លាក់សត្វល្អិត និងកម្ចាត់តុកកែគោ (Tick/Parasite Control)",
    instructions_kh: "ត្រូវទម្លាក់សត្វល្អិតខាងក្នុង (ព្រូន ញីស) ដោយប្រើថ្នាំចាក់ឬថ្នាំផឹក។ ចំពោះសត្វល្អិតខាងក្រៅ (តុកកែគោ ចៃ) ត្រូវបាញ់ថ្នាំលើស្បែកវា។ នេះជារឿងសំខាន់បំផុត បើមិនទម្លាក់សត្វល្អិតទេ ឲ្យស៊ីចំណីច្រើនប៉ុណ្ណាក៏គោមិនធាត់ដែរ។",
    source_page: 3,
  },
  {
    asset_type: "cow",
    day_offset: 7,
    category: "vaccine",
    severity: "critical",
    title_kh: "ចាក់វ៉ាក់សាំងការពារជំងឺសារទឹក និងអុតក្តាម (HS & FMD)",
    instructions_kh: "ទាក់ទងពេទ្យសត្វភូមិ ដើម្បីចាក់វ៉ាក់សាំងការពារជំងឺសារទឹក (Hemorrhagic Septicemia) និងជំងឺអុតក្តាម (Foot and Mouth Disease)។ ជំងឺទាំង២នេះអាចសម្លាប់គោបានលឿនបំផុត។ ហាមចាក់វ៉ាក់សាំងពេលគោកំពុងឈឺ។",
    source_page: 4,
  },
  // --- NUTRITION ---
  {
    asset_type: "cow",
    day_offset: 10,
    category: "feed",
    severity: "important",
    title_kh: "ក្បួនឲ្យចំណី និងការប្រើដុំអំបិលរ៉ែ",
    instructions_kh: "គោមួយក្បាលត្រូវការស៊ីស្មៅស្រស់ប្រមាណ ១០% នៃទម្ងន់ខ្លួនវាក្នុងមួយថ្ងៃ។ ត្រូវទិញ 'ដុំអំបិលរ៉ែ' ព្យួរក្នុងរោងឲ្យវាលិទ្ធរាល់ថ្ងៃ ដើម្បីបំប៉នវីតាមីន ជួយឲ្យគោស៊ីស្មៅបានច្រើន ឆាប់ធាត់ និងកាត់បន្ថយជំងឺ។",
    source_page: 5,
  },
  // --- HYGIENE ROUTINE ---
  {
    asset_type: "cow",
    day_offset: 30,
    category: "housing",
    severity: "important",
    title_kh: "អនាម័យរោងគោ និងការងូតទឹក",
    instructions_kh: "ត្រូវប្រមូលលាមកគោចេញពីរោងរាល់ថ្ងៃ កុំឲ្យវាដេកប្រឡាក់លាមកខ្លួនឯង។ គួរងូតទឹកឲ្យគោឲ្យបាន ១ដង ក្នុងមួយសប្តាហ៍នារដូវក្តៅ ដើម្បីជួយបញ្ចុះកម្តៅ និងឲ្យស្បែកវាស្អាតល្អ។",
    source_page: 6,
  },
  // --- VACCINE BOOSTER ---
  {
    asset_type: "cow",
    day_offset: 90,
    category: "vaccine",
    severity: "important",
    title_kh: "ចាក់វ៉ាក់សាំងការពារជំងឺដុំពកលើស្បែក (Lumpy Skin Disease)",
    instructions_kh: "ប្រសិនបើក្នុងតំបន់អ្នកមានការរាតត្បាតជំងឺដុំពកលើស្បែក ត្រូវហៅពេទ្យសត្វមកចាក់វ៉ាក់សាំងការពារវា។ បន្តកម្ចាត់មូសនៅពេលយប់ ព្រោះមូសជាអ្នកចម្លងជំងឺនេះ។",
    source_page: 7,
  },
  // --- HEALTH MAINTENANCE ---
  {
    asset_type: "cow",
    day_offset: 180,
    category: "health",
    severity: "important",
    title_kh: "ការទម្លាក់សត្វល្អិតលើកទី២",
    instructions_kh: "គោគួរតែត្រូវបានទម្លាក់សត្វល្អិតខាងក្នុង និងបាញ់ថ្នាំសម្លាប់តុកកែគោខាងក្រៅរៀងរាល់ ៦ខែម្តង ដើម្បីរក្សាសុខភាពអោយរឹងមាំ និងធានាការលូតលាស់សាច់បានល្អ។",
    source_page: 8,
  },
  // ===== ADDITIONS FROM MAFF MANUAL "បច្ចេកទេសចិញ្ចឹមគោជាលក្ខណៈគ្រួសារ" (2017) =====

  // --- DAY 14: DAILY INSPECTION ROUTINE ---
  {
    asset_type: "cow",
    day_offset: 14,
    category: "health",
    severity: "important",
    title_kh: "បង្កើតការត្រួតពិនិត្យសុខភាពប្រចាំថ្ងៃ",
    instructions_kh: "ត្រួតពិនិត្យជារៀងរាល់ព្រឹក មុនឲ្យចំណី៖\n១) ការដើរ និងការស៊ី — ស៊ីបានធម្មតាឬទេ?\n២) ភ្នែក និងច្រមុះ — មានទឹករំអិលឬទេ?\n៣) លាមក — រឹង ឬរាក?\n៤) ស្បែក — មានតុកកែ ឬបន្ទុះមួសទេ?\nកត់ត្រាសញ្ញាខុសភ្លាមៗ — ការរកជំងឺឆាប់ ជួយសន្សំចំណាយព្យាបាល។",
    source_page: 2,
  },
  // --- DAY 60: PLANT PASTURE (COST REDUCTION) ---
  {
    asset_type: "cow",
    day_offset: 60,
    category: "planting",
    severity: "important",
    title_kh: "ដាំដំណាំចំណីសត្វ (ស្មៅ + លេហ្គីម)",
    instructions_kh: "ចំណាយធំបំផុតក្នុងការចិញ្ចឹមគោគឺចំណី។ ចាប់ផ្តើមដាំចម្ការផ្ទាល់ខ្លួន៖\n• ភ្ជួររាស់ដី ២-៣ដង រួចដាក់ជីលាមកសត្វ ១-២តោន ក្នុង ១០០ម²\n• ដាំស្មៅគុណភាពខ្ពស់៖ Mulato, Marandu, ស្មៅហ្គីន (Ginea), ស្មៅដំរី (Elephant)\n• ផ្សំជាមួយលេហ្គីម៖ សណ្តែកបាយ, Stylo-184, Leucaena (កន្ទុំចេត) — ផ្តល់ប្រូតេអ៊ីនល្អ\n• ចន្លោះជួរដាំ ០.៥ម៉ែត្រ",
    source_page: 7,
  },
  // --- DAY 90: BODY CONDITION + WEIGHT TRACKING ---
  {
    asset_type: "cow",
    day_offset: 90,
    category: "health",
    severity: "important",
    title_kh: "វាស់ទម្ងន់ និងពិនិត្យកាយសម្បទា",
    instructions_kh: "វាស់ទម្ងន់ដោយរង្វាស់ព្រលឹងទ្រូង (Heart Girth)៖ ទម្ងន់(គ.ក.) = (រង្វាស់ទ្រូងសង់ទីម៉ែត្រ)² × ប្រវែងកាយ ÷ ១០.៨៤០\n• បើឆ្អឹងជិតបែកស្បែក = ខ្វះជាតិអាហារ — បន្ថែមលេហ្គីម និងជីរ៉ែ\n• បើគោទម្ងន់ ២៥០គ.ក. — ត្រូវការទឹកប្រហែល ៣០លីត្រ/ថ្ងៃ\n• កត់ត្រាទម្ងន់រៀងរាល់ ៣ខែ ដើម្បីតាមដានការលូតលាស់",
    source_page: 7,
  },
  // --- DAY 270: HEAT CYCLE AWARENESS (FEMALE) — KEY TO SCALING ---
  {
    asset_type: "cow",
    day_offset: 270,
    category: "health",
    severity: "important",
    title_kh: "តាមដានរដូវ មេគោ និងសម្រេចបង្កាត់ពូជ",
    instructions_kh: "មេគោអាយុ ៩ខែ+ ចាប់ផ្តើមមានរដូវ — នេះជាផ្លូវស្នូលឆ្ពោះទៅកាន់ការពង្រីកហ្វូងគោ។\n• វដ្តរដូវ៖ រៀងរាល់ ២១ថ្ងៃ ហើយរយៈពេលរដូវនីមួយៗ ១-២ថ្ងៃ\n• សញ្ញារដូវ៖ មេឡើងពីលើគ្នា, រេរេ, បន្តូម, ផ្ទៃទឹកស្ងួត\n• បង្កាត់ ១៨ម៉ោងក្រោយចាប់ផ្តើមរដូវ — ល្អបំផុតបង្កាត់ ២ដង (ព្រឹក + ល្ងាច)\n• ជម្រើស៖ បង្កាត់ធម្មជាតិ (បាត) ឬ AI (ហៅអ្នកបច្ចេកទេស)\n• ក្រោយបង្កាត់ ហាម ៖ ផឹកទឹកភ្លាម, ភ្ជួរស្រែ, ដឹក ឬប្រើគោហត់ខ្លាំង",
    source_page: 3,
  },
  // --- DAY 365: ANNUAL VACCINATION REFRESH ---
  // NOTE: cow.pdf doesn't cover vaccination schedules; this rule encodes general
  // MAFF veterinary practice (boosters at year 1) — verify with your local vet.
  {
    asset_type: "cow",
    day_offset: 365,
    category: "vaccine",
    severity: "critical",
    title_kh: "ចាក់វ៉ាក់សាំងប្រចាំឆ្នាំ (HS, FMD, LSD booster)",
    instructions_kh: "មួយឆ្នាំក្រោយ ភាពស៊ាំពីវ៉ាក់សាំងលើកទី១ ចាប់ផ្តើមថយចុះ៖\n• ហៅពេទ្យសត្វមកចាក់ HS (សារទឹក) និង FMD (អុតក្តាម) ឡើងវិញ\n• ចាក់ LSD (ដុំពកលើស្បែក) ឡើងវិញ ប្រសិនបើតំបន់នៅរាតត្បាត\n• បន្តកម្ចាត់សត្វល្អិតខាងក្នុង (ព្រូន ញីស) ៦ខែម្តង — រៀងរាល់ ១៨០ថ្ងៃ",
    source_page: 0,
  },
  // --- DAY 540: 18-MONTH DECISION POINT ---
  {
    asset_type: "cow",
    day_offset: 540,
    category: "harvest",
    severity: "info",
    title_kh: "សម្រេចចិត្ត៖ លក់, បង្កាត់ ឬរក្សាសម្រាប់ផលិតកម្ម",
    instructions_kh: "គោអាយុ ១៨ខែ ដល់ដំណាក់កាលផលិតកម្មពេញលេញ — ជាពេលសម្រេចចិត្ត៖\n១) លក់សាច់៖ វាស់ទម្ងន់; បើ ៣០០គ.ក.+ ល្អសម្រាប់លក់\n២) រក្សាមេគោ បង្កាត់៖ តាមដានរដូវ ហៅ AI ឬបាត\n៣) គោភ្ជួរស្រែ៖ ហ្វឹកហាត់ឲ្យស្គាល់ការងារ\nកត់ត្រាការសម្រេចចិត្ត និងផែនការណ៍បន្ទាប់ក្នុង Ledger។",
    source_page: 1,
  },
]
