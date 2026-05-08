import type { Rule } from "~/types"

export const CUCUMBER_RULES: Omit<Rule, "_id">[] = [
  {
    asset_type: "cucumber",
    day_offset: 0,
    category: "planting",
    severity: "critical",
    title_kh: "រៀបចំរង និងដាំកូនត្រសក់",
    instructions_kh: "រៀបចំដីជាមួយជីទ្រាប់បាត\nដាំចន្លោះជួរ ៥០សង់ទីម៉ែត្រ\nស្រោចទឹកឲ្យជោក",
    source_page: 1,
  },
  {
    asset_type: "cucumber",
    day_offset: 7,
    category: "irrigation",
    severity: "important",
    title_kh: "ពិនិត្យការលូតលាស់ និងស្រោចទឹក",
    instructions_kh: "ស្រោចទឹក ២ដងក្នុងមួយថ្ងៃ (ព្រឹក/ល្ងាច)\nដកស្មៅជុំវិញគល់",
    source_page: 1,
  },
  {
    asset_type: "cucumber",
    day_offset: 15,
    category: "fertilizer",
    severity: "critical",
    title_kh: "ដាក់ជីបំប៉នលើកទី១",
    instructions_kh: "ប្រើជី NPK 15-15-15\nដាក់ជុំវិញគល់ ចម្ងាយ ១០សង់ទីម៉ែត្រ",
    source_page: 2,
  },
  {
    asset_type: "cucumber",
    day_offset: 30,
    category: "harvest",
    severity: "info",
    title_kh: "ចាប់ផ្តើមប្រមូលផល",
    instructions_kh: "បេះផ្លែដែលគ្រប់អាយុ\nកុំទុកឲ្យផ្លែចាស់ពេក",
    source_page: 3,
  },
  // ===== ADDITIONS TO COVER PEAK HARVEST WINDOW (days 31-45) =====
  // NOTE: source_page: 0 means "no MAFF source citation yet". These rules are
  // drafted from common smallholder practice and MUST be reviewed by an agronomist
  // before deploying to production. They fill the silent gap between day 30 and
  // the harvest horizon at day 45 (defaultHarvestDays in asset-config.ts).
  {
    asset_type: "cucumber",
    day_offset: 32,
    category: "harvest",
    severity: "important",
    title_kh: "បេះផ្លែតាមវដ្ត ២-៣ថ្ងៃម្តង (ដំណាក់កាលផលច្រើន)",
    instructions_kh: "ដំណាក់កាលផលច្រើន (peak): បេះផ្លែ ២-៣ថ្ងៃម្តង ពេលព្រឹក។ បេះពេលផ្លែនៅខ្ចី (មិនលើសពី ២០សង់ទីម៉ែត្រ) ដើម្បីឲ្យដើមបន្តផ្តល់ផ្លែថ្មី។ ការទុកផ្លែចាស់នឹងធ្វើឲ្យដើមឈប់ផ្តល់ផ្កា។",
    source_page: 0,
  },
  {
    asset_type: "cucumber",
    day_offset: 35,
    category: "pesticide",
    severity: "important",
    title_kh: "ត្រួតពិនិត្យរុយផ្លែ និងចៃត្រសក់",
    instructions_kh: "ដាក់ឬកំចាត់ដោយ៖ បាញ់ទឹកស្តៅ ឬដាក់អន្លោចមេជាមួយ Methyl Eugenol (សម្រាប់រុយផ្លែ)។ កុំប្រើថ្នាំសំលាប់សត្វល្អិតគីមីខ្លាំង ព្រោះកំពុងប្រមូលផល។ កាត់ផ្លែខូចចេញដុតចោលភ្លាម។",
    source_page: 0,
  },
  {
    asset_type: "cucumber",
    day_offset: 40,
    category: "pesticide",
    severity: "critical",
    title_kh: "ការព្រមានរយៈពេលមុនប្រមូលផល (Pre-Harvest Interval)",
    instructions_kh: "ហាមបាញ់ថ្នាំសម្លាប់សត្វល្អិតគីមី ៧ថ្ងៃមុនបេះផ្លែ! ផ្លែដែលនៅសល់សារធាតុថ្នាំអាចធ្វើឲ្យអ្នកប្រើផ្លែឈឺ ហើយខូចទីផ្សារ។ បើចាំបាច់ ត្រូវប្រើតែសារធាតុជីវសាស្ត្រ (ទឹកស្តៅ ទឹកសាប៊ូ)។",
    source_page: 0,
  },
  {
    asset_type: "cucumber",
    day_offset: 42,
    category: "harvest",
    severity: "info",
    title_kh: "បន្តប្រមូលផល និងសម្អាតរង",
    instructions_kh: "បន្តបេះផ្លែ ២-៣ថ្ងៃម្តង។ ដកស្លឹកស្ងួត ឬមានជំងឺចេញពីដើម។ ប្រមូលផ្លែខូច ដុតចោល កុំទុកក្នុងស្រែ ព្រោះវាជាប្រភពមេរោគនិងសត្វល្អិត។",
    source_page: 0,
  },
  {
    asset_type: "cucumber",
    day_offset: 45,
    category: "planting",
    severity: "info",
    title_kh: "បញ្ចប់វដ្ត និងរៀបចំដីសម្រាប់រដូវបន្ទាប់",
    instructions_kh: "បញ្ចប់ការប្រមូលផល។ ដកដើមក្រពិច និងជី coverage ចេញ។ ភ្ជួរដី ទុកឲ្យហាល ៧-១៤ថ្ងៃ មុនដាំវដ្តថ្មី (ដំណាំផ្សេងគ្នាបាននឹងល្អ - ឧ. សណ្តែក) ដើម្បីកាត់បន្ថយជំងឺបន្ទាត់។",
    source_page: 0,
  },
]
