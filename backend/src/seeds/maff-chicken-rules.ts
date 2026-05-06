import type { Rule } from "~/types";

export const MAFF_CHICKEN_RULES: Omit<Rule, "_id">[] = [
	// --- COOP CONSTRUCTION (DAY -14) ---
	{
		asset_type: "chicken",
		day_offset: -14,
		category: "housing",
		severity: "info",
		title_kh: "សាងសង់ ឬរៀបចំរចនាសម្ព័ន្ធទ្រុង",
		instructions_kh:
			"ទ្រុងគួរធ្វើបែរមុខទៅទិសខាងកើត-លិច ដើម្បីជៀសវាងកម្តៅថ្ងៃខ្លាំងជះចូលផ្ទាល់។ ប្រើសំណាញ់ព័ទ្ធជុំវិញដើម្បីឲ្យមានខ្យល់ចេញចូលល្អ និងមានវាំងននសម្រាប់ទម្លាក់ពេលភ្លៀងឬរងា។ ត្រូវគិតគូរទំហំ៖ មាន់សាច់អាចចិញ្ចឹមបាន ១០ ទៅ ១២ក្បាល ក្នុងមួយម៉ែត្រការ៉េ។",
		source_page: 0,
	},
	// --- PREPARATION & DAY 0 ---
	{
		asset_type: "chicken",
		day_offset: 0,
		category: "housing",
		severity: "critical",
		title_kh: "រៀបចំទ្រុង កម្តៅ និងពន្លឺ (មុនពេលដាក់មាន់)",
		instructions_kh:
			"បោសសម្អាតទ្រុងនិងបាញ់ថ្នាំសម្លាប់មេរោគ។ កម្តៅត្រូវនៅ ៣៣°C។ បើកភ្លើងឲ្យភ្លឺ ២៤ម៉ោង សម្រាប់៣ថ្ងៃដំបូង។ សង្កេតមើល៖ បើមាន់ប្រមូលផ្តុំគ្នាគឺត្រជាក់ពេក បើហាមាត់ដកដង្ហើមគឺក្តៅពេក។",
		source_page: 1,
	},
	// --- DAY 1 ---
	{
		asset_type: "chicken",
		day_offset: 1,
		category: "feed",
		severity: "important",
		title_kh: "ចាប់ផ្តើមផ្តល់ចំណីកូនមាន់ និងវីតាមីន",
		instructions_kh:
			"ផ្តល់ចំណីចាប់ផ្តើម និងលាយវីតាមីន (ដូចជា វីតាមីន ADE, B-Complex ឬ Aminovit) ក្នុងទឹកផឹក។ អានសំបកកំប៉ុងដើម្បីដឹងកម្រិតលាយ (ជាទូទៅ ១ក្រាម/ទឹក១លីត្រ)។",
		source_page: 2,
	},
	// --- HYGIENE ROUTINE ---
	{
		asset_type: "chicken",
		day_offset: 3,
		category: "housing",
		severity: "important",
		title_kh: "ការគ្រប់គ្រងអនាម័យប្រចាំសប្តាហ៍",
		instructions_kh:
			"លាងសម្អាតស្នូកទឹកជារៀងរាល់ថ្ងៃ។ កើបអង្កាមសើមចេញដាក់ថ្មីជំនួស។ ដកមាន់ឈឺ ឬងាប់ចេញភ្លាមៗដើម្បីកុំឲ្យឆ្លង។",
		source_page: 3,
	},
	// --- DAY 5 (NEW: Temp & Light adjustments) ---
	{
		asset_type: "chicken",
		day_offset: 5,
		category: "health",
		severity: "important",
		title_kh: "ន្ថយកម្តៅ និងកាត់បន្ថយពន្លឺភ្លើង",
		instructions_kh:
			"បន្ថយកម្តៅមកត្រឹម ៣០°C។ ចាប់ផ្តើមបិទភ្លើងខ្លះនៅពេលយប់ (ទុកងងឹត ៤ម៉ោង) ដើម្បីឲ្យមាន់សម្រាក និងការពារជំងឺគាំងបេះដូងដោយសារវាលូតលាស់លឿនពេក។",
		source_page: 3,
	},
	// --- DAY 7 ---
	{
		asset_type: "chicken",
		day_offset: 7,
		category: "vaccine",
		severity: "critical",
		title_kh: "ចាក់វ៉ាក់សាំងការពារជំងឺញូវកាស និងរលាកទងសួត (ND-IB) លើកទី១",
		instructions_kh:
			"ប្រើ B1 strain ដក់ភ្នែក/ច្រមុះ។ បើលាយទឹក ត្រូវប្រើទឹកស្អាតគ្មានជាតិក្លរ (កុំប្រើទឹករ៉ូប៊ីណេផ្ទាល់) ហើយត្រូវឲ្យមាន់ផឹកឲ្យអស់ក្នុងរយៈពេល ១ ទៅ ២ម៉ោង។",
		source_page: 4,
	},
	// --- HYGIENE ROUTINE ---
	{
		asset_type: "chicken",
		day_offset: 10,
		category: "housing",
		severity: "important",
		title_kh: "ពង្រីកទីធ្លា និងបាញ់ថ្នាំសម្លាប់មេរោគជុំវិញទ្រុង",
		instructions_kh:
			"កូនមាន់ចាប់ផ្តើមធំ ត្រូវពង្រីកទីធ្លាទ្រុងឲ្យទូលាយបន្តិច។ បាញ់ថ្នាំសម្លាប់មេរោគនៅបរិវេណខាងក្រៅទ្រុង ដើម្បីទប់ស្កាត់ការឆ្លងមេរោគពីខាងក្រៅ។",
		source_page: 5,
	},
	// --- DAY 14 ---
	{
		asset_type: "chicken",
		day_offset: 14,
		category: "vaccine",
		severity: "critical",
		title_kh: "ចាក់វ៉ាក់សាំងការពារជំងឺគុំបូរ៉ូ (Gumboro) លើកទី១",
		instructions_kh:
			"បន្ថយកម្តៅមកត្រឹម ២៧°C។ ឲ្យមាន់ស្រេកទឹក ២ម៉ោងសិន ទើបលាយវ៉ាក់សាំងឲ្យផឹក ហើយត្រូវផឹកឲ្យអស់ក្នុងរយៈពេល ២ម៉ោង (ប្រើទឹកគ្មានក្លរ)។",
		source_page: 6,
	},
	// --- HYGIENE ROUTINE ---
	{
		asset_type: "chicken",
		day_offset: 18,
		category: "housing",
		severity: "critical",
		title_kh: "ការគ្រប់គ្រងខ្យល់ចេញចូល និងអនាម័យទ្រុង",
		instructions_kh:
			"បើកវាំងននទ្រុងឲ្យមានខ្យល់ចេញចូលល្អ។ បោសសម្អាតពីងពាងក្នុងទ្រុង និងកើបលាមកដែលសើមស្អុយចេញ។",
		source_page: 7,
	},
	// --- DAY 21 ---
	{
		asset_type: "chicken",
		day_offset: 21,
		category: "feed",
		severity: "important",
		title_kh: "ផ្លាស់ប្តូរចំណី Grower និងបញ្ឈប់ការផ្តល់កម្តៅ",
		instructions_kh:
			"បញ្ឈប់ការផ្តល់កម្តៅ (ទុកតាមសីតុណ្ហភាពបន្ទប់)។ លាយចំណីចាស់ និងថ្មី ៥០/៥០ រយៈពេល ៣ថ្ងៃ ដើម្បីកុំឲ្យមាន់រាករូស មុននឹងប្តូរទាំងស្រុង។",
		source_page: 8,
	},
	// --- DAY 28 ---
	{
		asset_type: "chicken",
		day_offset: 28,
		category: "vaccine",
		severity: "critical",
		title_kh: "ចាក់វ៉ាក់សាំងញូវកាស (ND Lasota) លើកទី២",
		instructions_kh:
			"លាយក្នុងទឹកផឹក ឬដក់ភ្នែកច្រមុះម្តងទៀតដើម្បីពង្រឹងភាពស៊ាំ។ កុំភ្លេចក្បួនលាយវ៉ាក់សាំង (ទឹកគ្មានក្លរ ត្រូវផឹកឲ្យអស់ក្នុង ២ម៉ោង)។",
		source_page: 9,
	},
	// --- HYGIENE ROUTINE ---
	{
		asset_type: "chicken",
		day_offset: 30,
		category: "housing",
		severity: "important",
		title_kh: "សម្អាតឧបករណ៍និងបាញ់ថ្នាំសម្លាប់មេរោគពាក់កណ្តាលវគ្គ",
		instructions_kh:
			"លាងសម្អាតស្នូកទឹកនិងស្នូកចំណីឲ្យបានស្អាតល្អ។ បាញ់ថ្នាំសម្លាប់មេរោគ (Bio-security) ជុំវិញទ្រុងនិងផ្លូវដើរ។",
		source_page: 10,
	},
	// --- DAY 35 ---
	{
		asset_type: "chicken",
		day_offset: 35,
		category: "health",
		severity: "info",
		title_kh: "ផ្តល់ថ្នាំទម្លាក់សត្វល្អិត (បើចាំបាច់)",
		instructions_kh:
			"លាយថ្នាំទម្លាក់សត្វល្អិតក្នុងទឹកផឹក ឬចំណី បើឃើញមាន់ស្គម ឬរាករូស។",
		source_page: 11,
	},
	// --- DAY 42 ---
	{
		asset_type: "chicken",
		day_offset: 42,
		category: "feed",
		severity: "important",
		title_kh: "ផ្លាស់ប្តូរទៅចំណីសម្រាប់បំប៉នសាច់ (Finisher Feed)",
		instructions_kh: "លាយចំណី Finisher ដើម្បីជំរុញការលូតលាស់សាច់មុនពេលចាប់លក់។",
		source_page: 12,
	},
	// --- HYGIENE ROUTINE ---
	{
		asset_type: "chicken",
		day_offset: 45,
		category: "housing",
		severity: "important",
		title_kh: "ការថែរក្សាអនាម័យចុងវគ្គ",
		instructions_kh:
			"ត្រួតពិនិត្យអង្កាមក្រាលកុំឲ្យសើមខ្លាំង ដែលអាចធ្វើឲ្យមាន់រលាកទ្រូង ឬមានក្លិនអាម៉ូញាក់ខ្លាំង។",
		source_page: 13,
	},
	// --- DAY 60 ---
	{
		asset_type: "chicken",
		day_offset: 60,
		category: "harvest",
		severity: "info",
		title_kh: "ប្រមូលផល ឬចាប់លក់",
		instructions_kh:
			"បញ្ឈប់ការផ្តល់ចំណី ៦-៨ ម៉ោង មុនពេលចាប់លក់ តែត្រូវបន្តឲ្យទឹកផឹកធម្មតា។",
		source_page: 14,
	},
	// --- POST-HARVEST HYGIENE ---
	{
		asset_type: "chicken",
		day_offset: 62,
		category: "housing",
		severity: "critical",
		title_kh: "ការសម្អាតទ្រុងក្រោយពេលលក់អស់",
		instructions_kh:
			"ប្រមូលលាមកនិងអង្កាមចេញឲ្យអស់ លាងសម្អាតទ្រុងនិងឧបករណ៍ដោយប្រើសាប៊ូ រួចបាញ់ថ្នាំសម្លាប់មេរោគ ទុកចោលពី ១០ ទៅ ១៤ថ្ងៃ មុននឹងដាក់មាន់វគ្គថ្មី។",
		source_page: 15,
	},
];
