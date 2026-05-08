import type { Rule } from "~/types"

export const LEMON_RULES: Omit<Rule, "_id">[] = [
  // --- PLANNING ---
  {
    asset_type: "lemon",
    day_offset: -30,
    category: "planting",
    severity: "info",
    title_kh: "ការរៀបចំចន្លោះគុម្ពក្រូចឆ្មារ",
    instructions_kh: "កំណត់ចន្លោះគុម្ព ៤ម៉ែត្រ x ៤ម៉ែត្រ ឬ ៥ម៉ែត្រ x ៥ម៉ែត្រ កុំដាំញឹកពេក បើមិនដូច្នោះទេពេលវាធំវានឹងបាំងពន្លឺគ្នា ហើយងាយកើតជំងឺផ្សិត។",
    source_page: 0,
  },
  // --- PREPARATION ---
  {
    asset_type: "lemon",
    day_offset: -15,
    category: "planting",
    severity: "critical",
    title_kh: "រៀបចំរណ្តៅដាំក្រូចឆ្មារ",
    instructions_kh: "ជីករណ្តៅទំហំ ៥០x៥០x៥០ សង់ទីម៉ែត្រ។ ហាលដីរណ្តៅចោល១៥ថ្ងៃ ដើម្បីសម្លាប់មេរោគក្នុងដី។ លាយដីដែលជីកចេញជាមួយជីកំប៉ុស ឬលាមកគោរលួយ (ប្រមាណ ៥-១០គីឡូក្រាម) រួចចាក់បញ្ចុះចូលរណ្តៅវិញឲ្យពេញ។",
    source_page: 1,
  },
  // --- PLANTING DAY ---
  {
    asset_type: "lemon",
    day_offset: 0,
    category: "planting",
    severity: "critical",
    title_kh: "ការដាំកូនក្រូចឆ្មារ",
    instructions_kh: "កាត់ថង់ប្លាស្ទិចចេញពីកូនដើមដោយប្រុងប្រយ័ត្ន កុំឲ្យបែកដី។ ដាំកណ្តាលរណ្តៅ លុបដីឲ្យហាប់ល្មម និងដោតឈើចងទប់កុំឲ្យរង្គើពេលមានខ្យល់។ បន្ទាប់មកស្រោចទឹកឲ្យជោក (ប្រហែល ៥ ទៅ ១០លីត្រ ក្នុងមួយដើម)។",
    source_page: 2,
  },
  // --- WEEK 1 ---
  {
    asset_type: "lemon",
    day_offset: 7,
    category: "irrigation",
    severity: "important",
    title_kh: "ការថែទាំកន្លែងតមែក និងការស្រោចទឹក",
    instructions_kh: "យកចំបើងគ្របគល់ដើម្បីរក្សាសំណើម រួចស្រោចទឹក ៥-១០លីត្រ ជារៀងរាល់ថ្ងៃនារដូវប្រាំង។ បើកូនក្រូចជាប្រភេទតមែក៖ ហាមទុកត្រួយដែលដុះចេញពីក្រោមថ្នេរតមែកដាច់ខាត ត្រូវកាច់ចោលភ្លាម ព្រោះវាជាមែកព្រៃ ដែលនឹងសម្លាប់មែកក្រូចឆ្មារយើង។",
    source_page: 3,
  },
  // --- MONTH 1 ---
  {
    asset_type: "lemon",
    day_offset: 30,
    category: "fertilizer",
    severity: "important",
    title_kh: "ដាក់ជីបំប៉នលើកទី១",
    instructions_kh: "ប្រើជី NPK 15-15-15 (ប្រហែល ៥០ក្រាម) ឬជីធម្មជាតិ ដាក់ជុំវិញគល់ (ចម្ងាយពីគល់ ២០-៣០សង់ទីម៉ែត្រ) រួចស្រោចទឹកឲ្យរលាយចូលដី។ ជៀសវាងដាក់ជីផ្ទាល់ជាប់គល់ព្រោះអាចធ្វើឲ្យខ្លោច។",
    source_page: 4,
  },
  // --- MONTH 2 ---
  {
    asset_type: "lemon",
    day_offset: 60,
    category: "health",
    severity: "critical",
    title_kh: "ការតាមដានដង្កូវគូរគំនូរលើស្លឹក",
    instructions_kh: "ក្រូចឆ្មារងាយនឹងត្រូវដង្កូវស៊ីស្លឹកណាស់ (ស្លឹកមានស្នាមគំនូរពណ៌សៗ រួញចូលគ្នា)។ បើឃើញស្លឹកមានស្នាមបែបនេះ ត្រូវបាញ់ថ្នាំសម្លាប់សត្វល្អិតជីវសាស្រ្ត (ដូចជាទឹកស្តៅ) ឬកាត់ស្លឹកនោះដុតចោល។",
    source_page: 5,
  },
  // --- MONTH 3 ---
  {
    asset_type: "lemon",
    day_offset: 90,
    category: "fertilizer",
    severity: "important",
    title_kh: "ដាក់ជីបំប៉នលើកទី២ និងតាក់តែងមែក",
    instructions_kh: "ដាក់ជីបំប៉នម្តងទៀត ដើម្បីជួយឲ្យដើមលូតលាស់លឿន។ ត្រូវកាត់មែកណាដែលខ្វែងគ្នា មែកងាប់ ឬមែកដែលដុះទាបជ្រុលចេញ ឲ្យស្រឡះល្អ។",
    source_page: 6,
  },
  // --- MONTH 6 ---
  {
    asset_type: "lemon",
    day_offset: 180,
    category: "health",
    severity: "info",
    title_kh: "ការត្រួតពិនិត្យជំងឺរលាកគល់ និងជំងឺផ្សិត",
    instructions_kh: "ពិនិត្យមើលគល់ និងស្លឹក បើមានឡើងផ្សិតសៗ ឬជំងឺរលាកគល់ ត្រូវកោសចេញ និងលាបថ្នាំកម្ចាត់ផ្សិត (ឬកំបោរស)។ បន្តស្រោចទឹកនិងដកស្មៅ។",
    source_page: 7,
  },
  // --- YEAR 1: ANNUAL CARE ---
  {
    asset_type: "lemon",
    day_offset: 360,
    category: "fertilizer",
    severity: "important",
    title_kh: "ការដាក់ជីប្រចាំឆ្នាំ និងតាក់តែងមែកធំ",
    instructions_kh: "ក្រូចឆ្មារអាយុ១ឆ្នាំ ជាពេលត្រូវតាក់តែងមែកបង្កើតទម្រង់ដើមឲ្យស្អាត (រាងឆ័ត្រ)។ ដាក់ជីកំប៉ុស (១០-១៥គីឡូ) បូក NPK លាយគ្នាដើម្បីត្រៀមឲ្យវាចាប់ផ្តើមចេញផ្កានៅឆ្នាំទី២ ឬទី៣។",
    source_page: 8,
  },
  // ===== ADDITIONS FROM MAFF MANUAL "ដំណាំក្រូចឆ្មារ" (2017) =====

  // --- WEEK 1: INTENSIVE WATERING ---
  {
    asset_type: "lemon",
    day_offset: 1,
    category: "irrigation",
    severity: "critical",
    title_kh: "ការស្រោចទឹកដំណាក់កាលដំបូង (២ដងក្នុងមួយថ្ងៃ)",
    instructions_kh: "ក្នុង ២សប្តាហ៍ដំបូងក្រោយដាំ ត្រូវស្រោចទឹក ២ដងក្នុងមួយថ្ងៃ (ព្រឹក និងល្ងាច) ប្រមាណ ៣-៤ កូនធុងក្នុងមួយរណ្តៅ។ កុំប្រើទឹកដែលមានជាតិក្លរច្រើនពេក (ទឹករ៉ូប៊ីណេផ្ទាល់) ព្រោះវាសម្លាប់សារធាតុមីក្រូជីវសាស្ត្រនៅឫស។",
    source_page: 14,
  },
  // --- WEEK 2: TRANSITION TO MAINTENANCE WATERING ---
  {
    asset_type: "lemon",
    day_offset: 14,
    category: "irrigation",
    severity: "important",
    title_kh: "ប្តូរទៅការស្រោចទឹក ២ដងក្នុងមួយសប្តាហ៍",
    instructions_kh: "បន្ទាប់ពី ២សប្តាហ៍ដំបូង កូនក្រូចចាប់ផ្តើមឫសរឹងមាំ។ ប្តូរទៅស្រោចទឹក ២ដងក្នុងមួយសប្តាហ៍ ប្រមាណ ១កូនធុងក្នុងមួយដើម។ នារដូវប្រាំងស្រោចបន្ថែម ការពារកុំឲ្យស្លឹកស្វិត។",
    source_page: 14,
  },
  // --- DAY 45: WEED CONTROL (1m RADIUS) ---
  {
    asset_type: "lemon",
    day_offset: 45,
    category: "irrigation",
    severity: "important",
    title_kh: "សម្អាតស្មៅជុំវិញគល់ (រង្វង់ ១ម៉ែត្រ)",
    instructions_kh: "ដកស្មៅក្នុងរង្វង់ ១ម៉ែត្រជុំវិញគល់ឲ្យស្អាត។ ស្មៅរវាងជួរអាចទុកបាន ឬកាត់ឲ្យខ្លី។ ការសម្អាតនេះជួយឲ្យដីខ្យល់ចេញចូលបាន និងកាត់បន្ថយការប្រកួតប្រជែងធាតុចិញ្ចឹមរវាងស្មៅ និងកូនក្រូច។",
    source_page: 19,
  },
  // --- DAY 120: LEAF MINER & CITRUS BUTTERFLY MONITORING ---
  {
    asset_type: "lemon",
    day_offset: 120,
    category: "pesticide",
    severity: "important",
    title_kh: "ត្រួតពិនិត្យដង្កូវផ្ទែនទី និងដង្កូវចង្រៃក្រូច",
    instructions_kh: "ពិនិត្យមើលស្លឹកថ្មីៗ៖ បើមានស្នាមគូរគំនូរពណ៌ស (ដង្កូវផ្ទែនទី Phyllocnistis citrella) ឬដង្កូវលឿនចាប់ស្លឹកស៊ី (ដង្កូវចង្រៃក្រូច Papilio demoleus) ត្រូវកាត់ស្លឹកដែលមានដង្កូវដុតចោល។ បាញ់ទឹកស្តៅ ឬថ្នាំជីវសាស្ត្រ ពេលរកឃើញ។",
    source_page: 20,
  },
  // --- DAY 240: APHID & SCALE MONITORING ---
  {
    asset_type: "lemon",
    day_offset: 240,
    category: "pesticide",
    severity: "important",
    title_kh: "ត្រួតពិនិត្យចៃក្រូច និងចៃក្រមួន",
    instructions_kh: "ពិនិត្យក្រោមស្លឹក និងតាមមែកថ្មី៖ បើឃើញចៃ (Toxoptera, Coccus viridis ឬ Planococcus citri) ត្រូវបាញ់ទឹកស្បូជាមួយសាប៊ូស្រាល ឬប្រើថ្នាំប៉ារ៉ាហ្វីនអូយល៍។ ដង្កូវនេះធ្វើឲ្យស្លឹករួញ និងជំងឺ Tristeza អាចចូលក្រូច។",
    source_page: 31,
  },
  // --- DAY 540: SUPPLEMENTAL MINERALS (1.5 YEARS) ---
  {
    asset_type: "lemon",
    day_offset: 540,
    category: "fertilizer",
    severity: "important",
    title_kh: "ការបំប៉នធាតុរ៉ែ (Ca, K, Mg, Zn, B)",
    instructions_kh: "ក្រូចឆ្មារត្រូវការ ១៦ ធាតុចិញ្ចឹម។ ដី កម្ពុជាច្រើនខ្វះកាល់ស្យូម (Ca), ប៉ូតាស្យូម (K), ម៉ាញ៉េស្យូម (Mg), ស័ង្កសី (Zn) និងបូរ៉ុង (B)។ ដាក់ជីសមាសធាតុរ៉ែ ឬជី foliar spray រៀងរាល់ ៣ខែ ដើម្បីត្រៀមដំណាក់កាលផ្កា។",
    source_page: 17,
  },
  // --- DAY 720: YEAR 2 — IRRIGATION UPGRADE & PRE-FLOWERING ---
  {
    asset_type: "lemon",
    day_offset: 720,
    category: "irrigation",
    severity: "important",
    title_kh: "ប្តូរទៅប្រព័ន្ធស្រោចទឹកបាញ់ (Mist/Sprinkler) ឆ្នាំទី២",
    instructions_kh: "ដល់ឆ្នាំទី២ ក្រូចចាប់ផ្តើមត្រៀមផ្កា។ ប្តូរពីការស្រោចដោយដៃ ទៅប្រព័ន្ធបាញ់សំណើម (Mist) ឬស្រោចតាមទង (Drip)។ វាជួយរក្សាសំណើមស្មើ ហើយសន្សំទឹក និងពេលវេលា។",
    source_page: 14,
  },
  // --- DAY 730: YEAR 2 — HEAVY FERTILIZER ---
  {
    asset_type: "lemon",
    day_offset: 730,
    category: "fertilizer",
    severity: "critical",
    title_kh: "ដាក់ជីប៉ង់ឆ្នាំទី២ (NPK 15-15-15 + ជីសរីរាង្គ)",
    instructions_kh: "ក្រូចអាយុ ២ឆ្នាំ៖ ដាក់ NPK 15-15-15 ប្រមាណ ១គ.ក. ក្នុងមួយដើម + Urea 46-0-0 ប្រមាណ ០.៣គ.ក. + ជីកំប៉ុសរលួយ ១០គ.ក.។ លាយក្នុងដីជុំវិញគល់ (រង្វង់ Drip line)។ ស្រោចទឹកបន្ទាប់ ដើម្បីឲ្យជីរលាយចូលដី។",
    source_page: 18,
  },
  // --- DAY 800: PRE-FLOWER WATER RESTRICTION ---
  {
    asset_type: "lemon",
    day_offset: 800,
    category: "irrigation",
    severity: "important",
    title_kh: "កាត់បន្ថយការស្រោចទឹកមុនពេលចេញផ្កា",
    instructions_kh: "ប្រមាណ ២០ថ្ងៃមុនរដូវចេញផ្កា ត្រូវកាត់បន្ថយការស្រោចទឹក។ ការស្ងួតបន្តិចបន្តួចជំរុញឲ្យក្រូចចាប់ផ្តើមផ្តល់ផ្កា។ ត្រឡប់ស្រោចទឹកធម្មតាភ្លាមៗ ពេលមើលឃើញតុមផ្កាចេញ។",
    source_page: 14,
  },
  // --- DAY 1080: YEAR 3 — FIRST MAJOR HARVEST ---
  {
    asset_type: "lemon",
    day_offset: 1080,
    category: "harvest",
    severity: "info",
    title_kh: "ការប្រមូលផលដំបូងប្រចាំឆ្នាំទី៣",
    instructions_kh: "ឆ្នាំទី៣ ជារដូវផលដំបូងពិតប្រាកដ។ បេះផ្លែដែលគ្រប់អាយុ (សំបកលឿងបន្តិច ឬនៅខៀវចាស់ អាស្រ័យលើពូជ)។ ប្រើកន្ត្រៃកាត់ ទុកដងផ្ទៃខ្លី ដើម្បីកុំឲ្យសំបកប្រេះ។ បន្ទាប់ពីបេះ៖ ដាក់ជីឲ្យដើមដើម្បីត្រៀមរដូវផ្កាបន្ទាប់។",
    source_page: 32,
  },
  // --- DAY 1440: YEAR 4 — ANNUAL MAINTENANCE ---
  {
    asset_type: "lemon",
    day_offset: 1440,
    category: "fertilizer",
    severity: "important",
    title_kh: "ការថែទាំប្រចាំឆ្នាំទី៤ និងការគុលមែកក្រោយប្រមូលផល",
    instructions_kh: "ក្រោយប្រមូលផលធំ៖ កាត់មែកស្ងួត មែកជំងឺ និងមែកដែលខ្វែងគ្នា។ លាបថ្នាំការពារផ្សិតលើស្នាមកាត់។ ដាក់ជីសរីរាង្គ ១៥គ.ក. + NPK ១គ.ក. ដើម្បីស្តារដើម។ បើមានសញ្ញាដង្កូវ ឬចៃ ត្រូវដោះស្រាយភ្លាម។",
    source_page: 18,
  },
]
