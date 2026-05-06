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
]
