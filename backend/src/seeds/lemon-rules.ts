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
  // --- YEAR 1 ---
  {
    asset_type: "lemon",
    day_offset: 360,
    category: "harvest",
    severity: "info",
    title_kh: "ការដាក់ជីប្រចាំឆ្នាំ និងតាក់តែងមែកធំ",
    instructions_kh: "ក្រូចឆ្មារអាយុ១ឆ្នាំ ជាពេលត្រូវតាក់តែងមែកបង្កើតទម្រង់ដើមឲ្យស្អាត (រាងឆ័ត្រ)។ ដាក់ជីកំប៉ុស (១០-១៥គីឡូ) បូក NPK លាយគ្នាដើម្បីត្រៀមឲ្យវាចាប់ផ្តើមចេញផ្កានៅឆ្នាំទី២ ឬទី៣។",
    source_page: 8,
  },
]
