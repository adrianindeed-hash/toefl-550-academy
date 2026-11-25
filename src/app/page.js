'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
BookOpen,
Headphones,
FileText,
CheckCircle2,
XCircle,
Sparkles,
Volume2,
VolumeX,
Play,
RotateCcw,
Clock,
Award,
AlertTriangle,
ChevronRight,
MessageSquare,
X,
Send,
Languages,
Target,
Trash2,
Lightbulb,
Eye,
EyeOff,
GraduationCap,
Check,
ArrowRight,
Layers,
Search,
Sliders,
Bookmark
} from 'lucide-react';

// ============================================================================
// DATA: 18 MODUL LENGKAP (8 BASIC + 6 INTERMEDIATE + 4 ADVANCE 550+)
// ============================================================================

const MODULES_DATA = [
// ===================== LEVEL 1: BASIC (8 MODUL) =====================
{
id: 'S-1.1',
level: 'basic',
section: 'Structure',
skill: 'Structure Skill 1–3',
title: 'Subject-Verb Agreement, Prepositional Phrases & Appositives',
shortTitle: 'S-V, Preposisi & Appositive',
summary:
'Kunci utama Structure TOEFL: setiap kalimat wajib punya 1 Subject asli dan 1 Main Verb yang selaras. Jangan tertipu kata benda di dalam Prepositional Phrase atau Appositive.',
formulas: [
{
title: '1. Hukum Utama S-V & Objek Preposisi',
explanation:
'Kata benda setelah preposisi (in, on, at, of, with, from, by, among, between) adalah Object of Preposition dan TIDAK PERNAH menjadi Subject. Coret seluruh frasa preposisi sebelum menentukan Verb!',
formula: '[True Subject] + (Prepositional Phrase = CORET) + [Main Verb]  ||  The number of → Singular | A number of → Plural',
interactiveSentence: {
translation: 'Pola migrasi kupu-kupu raja telah dipelajari secara luas oleh para peneliti.',
tip: 'Klik frasa "(of monarch butterflies)" untuk mencoretnya, lalu lihat kesesuaian Subject & Verb!',
tokens: [
{ text: 'The migration', role: 'normal' },
{ text: 'patterns', role: 'subject', label: 'True Subject (Jamak)' },
{ text: 'of monarch butterflies', role: 'trap', label: 'Prepositional Phrase (CORET!)' },
{ text: 'have been studied', role: 'verb', label: 'Main Verb (Jamak)' },
{ text: 'extensively.', role: 'normal' }
]
}
},
{
title: '2. Appositives (Penjelas Diapit Koma)',
explanation:
'Appositive adalah frasa kata benda yang menjelaskan Subject dan diapit dua koma. Appositive BUKAN Subject dan BUKAN Verb.',
formula: '[True Subject] , [Appositive Noun Phrase] , [Main Verb]',
interactiveSentence: {
translation: 'Sacramento, ibu kota California, terletak di Central Valley.',
tip: 'Klik bagian appositive di antara koma untuk mencoretnya agar struktur inti terlihat jelas.',
tokens: [
{ text: 'Sacramento,', role: 'subject', label: 'True Subject (Tunggal)' },
{ text: 'the capital of California,', role: 'trap', label: 'Appositive (CORET!)' },
{ text: 'lies', role: 'verb', label: 'Main Verb (Tunggal + s)' },
{ text: 'in the Central Valley.', role: 'normal' }
]
}
}
],
traps: [
{
wrong: 'The number of applicants for the scholarship have doubled.',
right: 'The number of applicants for the scholarship has doubled.',
reason: '"The number of" selalu dianggap tunggal (Singular), berbeda dengan "A number of" (Jamak).'
},
{
wrong: 'George, is attending the lecture, is my classmate.',
right: 'George, attending the lecture, is my classmate.',
reason: 'Appositive/penjelas di antara koma tidak boleh membawa Main Verb ("is") tanpa connector.'
}
],
questions: [
{
id: 'S-1.1-Q1',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Basic',
prompt: 'The discovery of several new species of deep-sea fish _____ marine biologists worldwide.',
options: ['have amazed', 'has amazed', 'were amazing', 'are amazed'],
correctIndex: 1,
explanation: 'Subject utamanya adalah "The discovery" (Tunggal). Frasa "of several new species of deep-sea fish" hanyalah rangkaian prepositional phrase yang harus dicoret.',
optionAnalysis: [
'Salah: "have amazed" untuk subjek jamak.',
'Benar: "has amazed" cocok untuk subjek tunggal "The discovery".',
'Salah: "were" jamak dan maknanya kurang tepat.',
'Salah: "are" jamak dan bentuk pasif tidak sesuai konteks.'
]
},
{
id: 'S-1.1-Q2',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Intermediate',
prompt: '_____, a renowned physicist from Germany, formulated the theory of general relativity.',
options: ['Albert Einstein was', 'It was Albert Einstein', 'Albert Einstein', 'Because Albert Einstein'],
correctIndex: 2,
explanation: 'Kalimat sudah memiliki appositive (", a renowned physicist...") dan Main Verb ("formulated"). Kita hanya butuh 1 True Subject tanpa verb tambahan.',
optionAnalysis: [
'Salah: Menambah verb "was" sehingga terjadi double verb.',
'Salah: "It was" membuat struktur double verb dengan "formulated".',
'Benar: "Albert Einstein" murni sebagai True Subject.',
'Salah: Menambah connector "Because" tanpa klausa kedua.'
]
},
{
id: 'S-1.1-Q3',
type: 'Part B (Error Recognition)',
difficulty: '550+ Trap',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'Each of the ' },
{ text: 'proposals', code: 'A' },
{ text: ' submitted by the committee ' },
{ text: 'members', code: 'B' },
{ text: ' ' },
{ text: 'were reviewed', code: 'C' },
{ text: ' carefully before the ' },
{ text: 'final vote', code: 'D' },
{ text: '.' }
],
options: ['(A) proposals', '(B) members', '(C) were reviewed', '(D) final vote'],
correctIndex: 2,
explanation: 'Subject utamanya adalah "Each" (selalu tunggal!). Coret "of the proposals submitted by the committee members". Maka verb harus tunggal: "was reviewed".',
optionAnalysis: [
'Benar secara grammar: Setelah "Each of the" diikuti kata benda jamak.',
'Benar secara grammar: "committee members" tepat.',
'SALAH (Jawaban): Seharusnya "was reviewed" karena subjeknya "Each" (tunggal).',
'Benar secara grammar: Frasa benda "final vote" tepat.'
]
}
]
},
{
id: 'S-1.2',
level: 'basic',
section: 'Structure',
skill: 'Structure Skill 39–42',
title: 'Singular/Plural & Countable/Uncountable Nouns',
shortTitle: 'Singular/Plural & Countable',
summary:
'TOEFL sangat sering menguji kecocokan penanda jumlah (many vs much, fewer vs less, amount vs number) serta kata benda yang tampak jamak tapi sebenarnya uncountable.',
formulas: [
{
title: '1. Penanda Countable vs. Uncountable',
explanation:
'Countable (bisa dihitung): many, number, few, fewer, several, both. Uncountable (tak bisa dihitung): much, amount, little, less. Kata jebakan uncountable di TOEFL: information, equipment, research, furniture, evidence, advice, news, luggage.',
formula: 'many / fewer / number + Plural Countable  ||  much / less / amount + Uncountable (TIDAK pakai -s)',
interactiveSentence: {
translation: 'Laboratorium tersebut membutuhkan sejumlah besar peralatan modern untuk penelitian baru.',
tip: 'Klik penanda jumlah dan kata bendanya untuk melihat pasangan yang sah.',
tokens: [
{ text: 'The laboratory', role: 'subject', label: 'Subject' },
{ text: 'requires', role: 'verb', label: 'Verb' },
{ text: 'a large amount of', role: 'connector', label: 'Penanda Uncountable' },
{ text: 'modern equipment', role: 'subject', label: 'Uncountable (Tanpa -s!)' },
{ text: 'for the new research.', role: 'trap', label: 'Prepositional Phrase' }
]
}
}
],
traps: [
{
wrong: 'We gathered many informations and several equipments.',
right: 'We gathered much information and several pieces of equipment.',
reason: 'Information dan equipment adalah Uncountable Noun: dilarang menambah akhiran -s dan dilarang memakai many/several secara langsung.'
},
{
wrong: 'There are less students in the hall today.',
right: 'There are fewer students in the hall today.',
reason: 'Students bisa dihitung (countable), jadi wajib memakai "fewer", bukan "less".'
}
],
questions: [
{
id: 'S-1.2-Q1',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Basic',
prompt: 'Because of the budget cuts, the department has _____ funding for field research this year.',
options: ['fewer', 'many', 'less', 'several'],
correctIndex: 2,
explanation: '"Funding" adalah uncountable noun (dana/pendanaan), sehingga penanda perbandingan yang tepat adalah "less".',
optionAnalysis: [
'Salah: "fewer" khusus countable jamak.',
'Salah: "many" khusus countable jamak.',
'Benar: "less" digunakan untuk uncountable noun ("funding").',
'Salah: "several" khusus countable jamak.'
]
},
{
id: 'S-1.2-Q2',
type: 'Part B (Error Recognition)',
difficulty: 'Intermediate',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'A large ' },
{ text: 'amount', code: 'A' },
{ text: ' of migratory ' },
{ text: 'birds', code: 'B' },
{ text: ' ' },
{ text: 'travel', code: 'C' },
{ text: ' southward every ' },
{ text: 'autumn', code: 'D' },
{ text: '.' }
],
options: ['(A) amount', '(B) birds', '(C) travel', '(D) autumn'],
correctIndex: 0,
explanation: '"Birds" adalah countable plural. Maka tidak boleh memakai "amount", melainkan harus "number" (A large number of migratory birds).',
optionAnalysis: [
'SALAH (Jawaban): Seharusnya "number", karena "birds" bisa dihitung.',
'Benar: Kata benda jamak sesuai konteks.',
'Benar: Verb jamak sesuai subjek "birds".',
'Benar: "every" diikuti kata benda tunggal "autumn".'
]
}
]
},
{
id: 'S-1.3',
level: 'basic',
section: 'Structure',
skill: 'Structure Skill 52–55',
title: 'Articles (A / An / The) & Pronouns',
shortTitle: 'Articles & Pronouns',
summary:
'Membedakan penggunaan a/an berdasarkan BUNYI (bukan huruf), penggunaan "the" untuk hal spesifik/superlative, serta konsistensi Pronoun (Subject, Object, Possessive).',
formulas: [
{
title: '1. Aturan Bunyi A vs. An & Spesifik The',
explanation:
'Gunakan "a" sebelum BUNYI konsonan (a university [yu-], a European, a one-way street). Gunakan "an" sebelum BUNYI vokal (an hour [au-], an honest man, an MBA [em-]). Singular countable noun TIDAK BOLEH berdiri sendirian tanpa article/determiner.',
formula: 'a + bunyi konsonan | an + bunyi vokal | the + spesifik / superlative / urutan (the first)',
interactiveSentence: {
translation: 'Dia lulus dari universitas ternama setelah wawancara selama satu jam.',
tip: 'Perhatikan mengapa "university" pakai "a" sedangkan "hour" pakai "an".',
tokens: [
{ text: 'She', role: 'subject', label: 'Subject Pronoun' },
{ text: 'graduated', role: 'verb', label: 'Main Verb' },
{ text: 'from a university', role: 'connector', label: 'Bunyi /ju:/ → pakai "a"' },
{ text: 'after an hour-long interview.', role: 'trap', label: 'Bunyi /aʊ/ (h bisu) → pakai "an"' }
]
}
}
],
traps: [
{
wrong: 'He gave me an useful advice about a honest leader.',
right: 'He gave me useful advice about an honest leader.',
reason: '"Advice" uncountable (tak pakai a/an), dan "honest" berbunyi vokal /ɒ/ sehingga pakai "an".'
},
{
wrong: 'Every student must submit their report before Friday.',
right: 'Every student must submit his or her report before Friday.',
reason: 'Di TOEFL ITP formal, "Every student" adalah tunggal, sehingga possessive pronoun-nya wajib tunggal (his/her, bukan their).'
}
],
questions: [
{
id: 'S-1.3-Q1',
type: 'Part B (Error Recognition)',
difficulty: 'Basic',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'The archaeologist discovered ' },
{ text: 'a ancient', code: 'A' },
{ text: ' manuscript ' },
{ text: 'inside', code: 'B' },
{ text: ' a sealed clay ' },
{ text: 'jar', code: 'C' },
{ text: ' near ' },
{ text: 'the river', code: 'D' },
{ text: '.' }
],
options: ['(A) a ancient', '(B) inside', '(C) jar', '(D) the river'],
correctIndex: 0,
explanation: 'Kata "ancient" diawali bunyi vokal /eɪ/, sehingga wajib menggunakan article "an" (an ancient manuscript).',
optionAnalysis: [
'SALAH (Jawaban): Seharusnya "an ancient".',
'Benar: Preposisi tempat tepat.',
'Benar: Singular countable noun dengan article "a".',
'Benar: Merujuk sungai spesifik.'
]
},
{
id: 'S-1.3-Q2',
type: 'Part B (Error Recognition)',
difficulty: 'Intermediate',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'Between ' },
{ text: 'you and I', code: 'A' },
{ text: ', the committee ' },
{ text: 'is unlikely', code: 'B' },
{ text: ' to approve ' },
{ text: 'its', code: 'C' },
{ text: ' own ' },
{ text: 'proposal', code: 'D' },
{ text: '.' }
],
options: ['(A) you and I', '(B) is unlikely', '(C) its', '(D) proposal'],
correctIndex: 0,
explanation: 'Setelah preposisi "Between", wajib menggunakan Object Pronoun ("me"), bukan Subject Pronoun ("I").',
optionAnalysis: [
'SALAH (Jawaban): Seharusnya "you and me" (Object of Preposition).',
'Benar: "committee" sebagai satu kesatuan pakai "is".',
'Benar: Possessive tunggal merujuk ke "committee".',
'Benar: Kata benda tunggal tepat.'
]
}
]
},
{
id: 'S-1.4',
level: 'basic',
section: 'Structure',
skill: 'Structure Skill 30–36',
title: 'Tenses, Time Markers & Participles',
shortTitle: 'Tenses & Participles',
summary:
'Memahami sinyal waktu (since, for, by the time, ago, in 1990) dan membedakan kata kerja utama (Main Verb) dengan Present/Past Participle (V-ing / V3 tanpa auxiliary).',
formulas: [
{
title: '1. Sinyal Waktu Kritis TOEFL',
explanation:
'In 1985 / ago → Past Simple (V2). Since + titik waktu / For + durasi → Present Perfect (has/have + V3). By + tahun lampau (By 1990) → Past Perfect (had + V3).',
formula: 'since/for → has/have + V3  ||  by [past time] → had + V3  ||  in [past year] → V2',
interactiveSentence: {
translation: 'Pada tahun 1920, teknologi radio telah mengubah komunikasi massa secara drastis.',
tip: 'Klik penanda waktu "By 1920" untuk melihat mengapa verb-nya wajib Past Perfect.',
tokens: [
{ text: 'By 1920,', role: 'connector', label: 'Time Marker (By + lampau → Past Perfect)' },
{ text: 'radio technology', role: 'subject', label: 'Subject' },
{ text: 'had transformed', role: 'verb', label: 'Past Perfect (had + V3)' },
{ text: 'mass communication drastically.', role: 'normal' }
]
}
}
],
traps: [
{
wrong: 'The woman sitting in the front row smiling at the speaker.',
right: 'The woman sitting in the front row is smiling at the speaker.',
reason: 'V-ing tanpa to be (am/is/are/was/were) hanyalah Participle (adjective), BUKAN Main Verb!'
},
{
wrong: 'Since 2010, the city built three new subway lines.',
right: 'Since 2010, the city has built three new subway lines.',
reason: 'Penanda "Since + tahun" wajib berpasangan dengan Present Perfect (has/have + V3).'
}
],
questions: [
{
id: 'S-1.4-Q1',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Basic',
prompt: 'The artifacts _____ in the Egyptian desert last month are now on display at the museum.',
options: ['were found', 'finding', 'found', 'they were found'],
correctIndex: 2,
explanation: 'Kalimat sudah memiliki Main Verb ("are"). Jadi bagian kosong hanya butuh Past Participle pasif ("found" = yang ditemukan) sebagai penjelas "The artifacts".',
optionAnalysis: [
'Salah: Menimbulkan double verb ("were found" dan "are").',
'Salah: "finding" bermakna aktif (artefak tidak bisa menemukan).',
'Benar: "found" adalah Past Participle pasif (adjective).',
'Salah: Membuat klausa baru tanpa connector.'
]
},
{
id: 'S-1.4-Q2',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Intermediate',
prompt: 'By the time the rescue team arrived at the summit, the climbers _____ their own shelter.',
options: ['have built', 'had already built', 'were building', 'build'],
correctIndex: 1,
explanation: 'Pola "By the time + Past Simple (arrived)" menuntut klausa utama menggunakan Past Perfect (had + V3) untuk kejadian yang selesai lebih dulu.',
optionAnalysis: [
'Salah: Present Perfect tidak cocok dengan lampau "arrived".',
'Benar: Past Perfect ("had already built") sesuai hukum "By the time + V2".',
'Salah: Menunjukkan sedang berlangsung, bukan sudah selesai sebelum tim datang.',
'Salah: Present Simple tidak sesuai konteks lampau.'
]
}
]
},
{
id: 'L-1.1',
level: 'basic',
section: 'Listening',
skill: 'Listening Skill 1–3',
title: 'Last Line, Synonyms & Avoid Similar Sounds',
shortTitle: 'Last Line & Synonyms',
summary:
'Tiga hukum emas Listening Part A: (1) Fokus pada pembicara KEDUA, (2) Cari SINONIM dari kata kunci pembicara kedua, (3) HINDARI opsi yang bunyinya mirip dengan rekaman!',
formulas: [
{
title: '1. Strategi 3 Detik Part A',
explanation:
'Jawaban Part A 85% berada di baris kedua (pembicara ke-2), namun selalu diparafrase dengan sinonim. Jika kamu mendengar kata "apartment", opsi yang berisi "department" atau "part" hampir pasti JEBAKAN!',
formula: 'Focus on Speaker 2 → Paraphrase / Synonym = BENAR  ||  Bunyi Mirip (Similar Sound) = JEBAKAN'
}
],
traps: [
{
wrong: 'Audio: "She is looking for a new apartment." → Memilih opsi: "She works in a new department."',
right: 'Memilih opsi: "She wants to find a different place to live."',
reason: '"apartment" vs "department" adalah jebakan Similar Sound; jawaban benar memakai sinonim ("place to live").'
}
],
questions: [
{
id: 'L-1.1-Q1',
type: 'Listening Part A (Simulasi)',
difficulty: 'Basic',
audioScript: 'Man: Did you manage to finish the chemistry lab report?\nWoman: Not yet, I ran out of time before the library closed.',
prompt: 'What does the woman mean?',
options: [
'She ran to the library before it closed.',
'She did not have enough time to complete the report.',
'She finished the chemistry report on time.',
'The library was out of chemistry books.'
],
correctIndex: 1,
explanation: '"Ran out of time" adalah sinonim/idiom untuk "did not have enough time". Opsi A menjebak dengan kata bunyi sama ("ran").',
optionAnalysis: [
'Salah (Jebakan Similar Sound): "ran out of time" bukan berarti berlari ("ran").',
'Benar: Parafrase akurat dari "Not yet, I ran out of time".',
'Salah: Bertentangan dengan "Not yet".',
'Salah: Mengubah konteks "out of time" menjadi "out of books".'
]
}
]
},
{
id: 'L-1.2',
level: 'basic',
section: 'Listening',
skill: 'Listening Skill 4',
title: 'Drawing Conclusions: Who, What & Where',
shortTitle: 'Kesimpulan Who, What & Where',
summary:
'Menebak profesi pembicara (Who), aktivitas selanjutnya (What), atau lokasi percakapan (Where) dari kata kunci konteks (vocabulary clues).',
formulas: [
{
title: '1. Peta Kata Kunci Lokasi & Profesi',
explanation:
'Simak kata benda petunjuk: "check out, overdue, stacks" → Library/Librarian; "account, deposit, teller" → Bank; "prescription, dosage" → Pharmacy; "register, credits, advisor" → Campus Registrar.',
formula: 'Vocabulary Clues (Kata Benda Khas) → Kesimpulan Profesi / Lokasi'
}
],
traps: [
{
wrong: 'Mendengar kata "check" langsung menebak "Hospital check-up".',
right: 'Perhatikan konteks pendampingnya: "check out a book" (Library) vs "cash a check" (Bank) vs "check in" (Hotel/Airport).',
reason: 'Satu kata kerja bisa memiliki lokasi berbeda tergantung objek di belakangnya.'
}
],
questions: [
{
id: 'L-1.2-Q1',
type: 'Listening Part A (Inference)',
difficulty: 'Basic',
audioScript: 'Woman: I would like to open a savings account and deposit this paycheck.\nMan: Certainly. Please fill out this form and show me a photo ID.',
prompt: 'Where does this conversation probably take place?',
options: ['In a library', 'At a bank', 'In a post office', 'At an airport'],
correctIndex: 1,
explanation: 'Kata kunci "savings account" dan "deposit this paycheck" secara langsung merujuk pada Bank.',
optionAnalysis: [
'Salah: Tidak ada kosakata perpustakaan.',
'Benar: "savings account" dan "deposit" adalah aktivitas perbankan.',
'Salah: Kantor pos berkaitan dengan stamps/packages.',
'Salah: Bandara berkaitan dengan boarding pass/gate.'
]
}
]
},
{
id: 'R-1.1',
level: 'basic',
section: 'Reading',
skill: 'Reading Skill 1–3',
title: 'Main Idea & Stated Details',
shortTitle: 'Main Idea & Stated Details',
summary:
'Teknik Skimming kalimat pertama tiap paragraf untuk Main Idea, dan Scanning kata kunci spesifik untuk soal Stated Details tanpa perlu menerjemahkan seluruh teks.',
formulas: [
{
title: '1. Rumus Cepat Reading',
explanation:
'Main Idea hampir selalu berada di kalimat pertama paragraf 1 (atau gabungan kalimat pertama tiap paragraf). Untuk Stated Detail, cari kata kunci soal di teks, lalu baca 1 kalimat di sekitarnya dan pilih parafrasenya.',
formula: 'Main Idea = Topic Sentence (Kalimat 1)  ||  Stated Detail = Scan Keyword → Baca Kalimat Bukti → Pilih Sinonim'
}
],
traps: [
{
wrong: 'Memilih opsi Main Idea yang terlalu sempit (hanya membahas 1 detail di paragraf 2) atau terlalu luas.',
right: 'Pilih opsi yang merangkum keseluruhan topik utama sejak paragraf 1.',
reason: 'Opsi pengecoh Main Idea biasanya benar secara fakta di teks, tetapi hanya mewakili sebagian kecil paragraf.'
}
],
readingPassage: {
title: 'Bioluminescence in Deep-Sea Organisms',
lines: [
'Bioluminescence, the production and emission of light by living organisms, is remarkably common in the deep ocean.',
'Because sunlight cannot penetrate below 1,000 meters, roughly 76 percent of deep-sea creatures generate their own light.',
'This chemical light is produced when a molecule called luciferin reacts with oxygen in the presence of an enzyme known as luciferase.',
'Unlike incandescent bulbs, which waste most of their energy as heat, bioluminescent reactions are nearly 100 percent efficient, producing what scientists call "cold light."',
'Deep-sea species use this adaptation for multiple survival strategies, including attracting mates, luring prey, and startling predators.'
]
},
questions: [
{
id: 'R-1.1-Q1',
type: 'Reading (Main Idea)',
difficulty: 'Basic',
evidenceLine: 0,
prompt: 'What is the main topic of the passage?',
options: [
'Why incandescent bulbs waste energy as heat',
'How sunlight penetrates the upper ocean layers',
'The mechanism and functions of bioluminescence in deep-sea life',
'The chemical structure of oxygen in underwater environments'
],
correctIndex: 2,
explanation: 'Kalimat pertama memperkenalkan bioluminescence di laut dalam, diikuti cara kerjanya (baris 3-4) dan fungsinya (baris 5).',
optionAnalysis: [
'Salah: Terlalu sempit, hanya perbandingan kecil di baris 4.',
'Salah: Hanya latar belakang singkat di baris 2.',
'Benar: Merangkum keseluruhan isi teks secara akurat.',
'Salah: Teks tidak fokus pada struktur kimia oksigen.'
]
},
{
id: 'R-1.1-Q2',
type: 'Reading (Stated Detail)',
difficulty: 'Basic',
evidenceLine: 3,
prompt: 'According to the passage, why is bioluminescence referred to as "cold light"?',
options: [
'Because it only occurs in freezing deep-sea water',
'Because the chemical reaction releases almost no heat',
'Because luciferin freezes when exposed to oxygen',
'Because deep-sea creatures have cold blood'
],
correctIndex: 1,
explanation: 'Baris 4 menyatakan bahwa berbeda dengan lampu pijar yang membuang energi sebagai panas, reaksi bioluminescence hampir 100% efisien menghasilkan "cold light".',
optionAnalysis: [
'Salah: Tidak disebut soal suhu air yang membekukan cahaya.',
'Benar: Parafrase langsung dari baris 4.',
'Salah: Tidak disebutkan di teks.',
'Salah: Tidak ada pembahasan soal darah dingin.'
]
}
]
},
{
id: 'R-1.2',
level: 'basic',
section: 'Reading',
skill: 'Reading Skill 5',
title: 'Pronoun Referents (It / They / Which / Those)',
shortTitle: 'Pronoun Referents',
summary:
'Menemukan kata benda yang dirujuk oleh pronoun (it, its, they, them, which, these). Kunci emas: kata benda rujukan SELALU berada SEBELUM pronoun tersebut dan harus cocok jumlahnya (tunggal/jamak).',
formulas: [
{
title: '1. Teknik Mundur & Substitusi',
explanation:
'Cari kata benda SEBELUM pronoun yang sesuai jumlahnya (it/its = tunggal; they/them/their = jamak). Masukkan kata benda pilihan ke posisi pronoun lalu baca ulang: apakah maknanya logis?',
formula: 'Lihat SEBELUM pronoun → Cocokkan Singular/Plural → Tes Substitusi Makna'
}
],
traps: [
{
wrong: 'Memilih kata benda yang berada SETELAH pronoun.',
right: '99% rujukan pronoun di TOEFL berada di bagian SEBELUM pronoun tersebut.',
reason: 'Pronoun menggantikan kata benda yang sudah disebut sebelumnya.'
}
],
readingPassage: {
title: 'Urban Heat Islands',
lines: [
'Metropolitan areas often experience significantly higher temperatures than surrounding rural regions, a phenomenon known as the urban heat island effect.',
'Dark surfaces such as asphalt roads and concrete rooftops absorb solar radiation throughout the day and release it slowly at night.',
'In addition, tall buildings can block natural wind corridors, preventing trapped heat from dispersing quickly.',
'To combat these elevated temperatures, urban planners increasingly install reflective roofs and expand green spaces, which help cool the air through shade and evaporation.'
]
},
questions: [
{
id: 'R-1.2-Q1',
type: 'Reading (Pronoun Referent)',
difficulty: 'Basic',
evidenceLine: 1,
prompt: 'The word "it" in line 2 refers to _____.',
options: ['asphalt roads', 'concrete rooftops', 'solar radiation', 'the day'],
correctIndex: 2,
explanation: '"It" bersifat tunggal. Permukaan gelap menyerap "solar radiation" dan melepaskannya ("release it") perlahan di malam hari.',
optionAnalysis: [
'Salah: Jamak (roads).',
'Salah: Jamak (rooftops).',
'Benar: Tunggal dan logis bila disubstitusikan ("release solar radiation").',
'Salah: Tidak logis melepaskan "the day".'
]
}
]
},

// ===================== LEVEL 2: INTERMEDIATE (6 MODUL) =====================
{
id: 'S-2.1',
level: 'intermediate',
section: 'Structure',
skill: 'Structure Skill 37–38',
title: 'Passive Voice vs. Active & Present/Past Participles',
shortTitle: 'Passive Voice & Participles',
summary:
'Membedakan kalimat aktif vs pasif di TOEFL: periksa apakah ada objek langsung setelah verb dan perhatikan sinyal "by + pelaku".',
formulas: [
{
title: '1. Detektor Pasif Cepat',
explanation:
'Rumus Pasif wajib: [be + V3]. Jika subjek adalah benda mati (misal: "The bridge", "The data") dan diikuti "by...", hampir pasti butuh Passive Voice.',
formula: 'Passive = [am/is/are/was/were/be/been + V3] + (by Agent)' ,
interactiveSentence: {
translation: 'Jembatan gantung itu dirancang oleh seorang insinyur terkenal pada tahun 1937.',
tip: 'Klik bagian pasif dan agen "by" untuk melihat struktur lengkapnya.',
tokens: [
{ text: 'The suspension bridge', role: 'subject', label: 'Subject (Benda/Penerima Aksi)' },
{ text: 'was designed', role: 'verb', label: 'Passive Verb (be + V3)' },
{ text: 'by a famous engineer', role: 'connector', label: 'Sinyal Pasif (by + pelaku)' },
{ text: 'in 1937.', role: 'trap', label: 'Time Marker Lampau' }
]
}
}
],
traps: [
{
wrong: 'The theorem was prove by the mathematician in 1890.',
right: 'The theorem was proven by the mathematician in 1890.',
reason: 'Setelah "be" (was) pada kalimat pasif, kata kerja wajib bentuk V3 (proven), bukan V1.'
}
],
questions: [
{
id: 'S-2.1-Q1',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Intermediate',
prompt: 'The ancient murals _____ during the restoration of the cathedral in 2018.',
options: ['discovered', 'were discovering', 'were discovered', 'have discovered'],
correctIndex: 2,
explanation: 'Mural (benda mati) tidak bisa menemukan dirinya sendiri, melainkan ditemukan (Pasif) pada 2018 (Lampau → were discovered).',
optionAnalysis: [
'Salah: Aktif (tanpa to be).',
'Salah: Past Continuous aktif.',
'Benar: Past Simple Passive ("were discovered").',
'Salah: Present Perfect aktif.'
]
},
{
id: 'S-2.1-Q2',
type: 'Part B (Error Recognition)',
difficulty: 'Intermediate',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'The Nobel Prize in Physics ' },
{ text: 'awarded', code: 'A' },
{ text: ' to Marie Curie ' },
{ text: 'in 1903', code: 'B' },
{ text: ' for her ' },
{ text: 'pioneering', code: 'C' },
{ text: ' research on ' },
{ text: 'radiation', code: 'D' },
{ text: '.' }
],
options: ['(A) awarded', '(B) in 1903', '(C) pioneering', '(D) radiation'],
correctIndex: 0,
explanation: 'Hadiah Nobel "diberikan" (pasif), bukan "memberikan". Jadi wajib menggunakan "was awarded".',
optionAnalysis: [
'SALAH (Jawaban): Seharusnya "was awarded" (Passive).',
'Benar: Penanda tahun lampau tepat.',
'Benar: Present participle sebagai adjective tepat.',
'Benar: Kata benda tepat.'
]
}
]
},
{
id: 'S-2.2',
level: 'intermediate',
section: 'Structure',
skill: 'Structure Skill 6–12',
title: 'Coordinate, Adverb, Adjective & Noun Clauses',
shortTitle: 'Clauses & Connectors',
summary:
'Hukum jumlah klausa: Jika ada 2 Subject & 2 Verb, WAJIB ada tepat 1 Connector (and, but, because, although, which, that, what).',
formulas: [
{
title: '1. Rumus Matematika Klausa TOEFL',
explanation:
'Hitung jumlah Verb utama! Jumlah Connector yang dibutuhkan = (Jumlah Verb) - 1. Ingat: "that/which/who" bisa merangkap sebagai Connector sekaligus Subject di Adjective Clause.',
formula: '2 Clauses = 2 Verbs + 1 Connector  ||  Noun Clause sebagai Subject → Verb selalu Tunggal!',
interactiveSentence: {
translation: 'Meskipun badai merusak jembatan, penduduk desa tetap berhasil mengungsi dengan selamat.',
tip: 'Klik connector "Although" untuk melihat bagaimana ia menghubungkan 2 pasang S-V.',
tokens: [
{ text: 'Although', role: 'connector', label: 'Adverb Connector (1)' },
{ text: 'the storm', role: 'subject', label: 'Subject 1' },
{ text: 'damaged', role: 'verb', label: 'Verb 1' },
{ text: 'the bridge,', role: 'normal' },
{ text: 'the villagers', role: 'subject', label: 'Subject 2' },
{ text: 'evacuated', role: 'verb', label: 'Verb 2' },
{ text: 'safely.', role: 'normal' }
]
}
}
],
traps: [
{
wrong: 'Although the experiment failed, but the scientists learned valuable lessons.',
right: 'Although the experiment failed, the scientists learned valuable lessons.',
reason: 'Jebakan klasik penutur Indonesia! Jangan pernah menggabungkan "Although" dan "but" dalam satu kalimat (double connector).'
}
],
questions: [
{
id: 'S-2.2-Q1',
type: 'Part A (Melengkapi Kalimat)',
difficulty: 'Intermediate',
prompt: '_____ caused the sudden collapse of the Mayan civilization remains a subject of intense debate.',
options: ['That', 'What', 'It', 'Which'],
correctIndex: 1,
explanation: 'Ada 2 verb ("caused" dan "remains"). Kita butuh Noun Clause Connector yang sekaligus bisa menjadi Subject bagi "caused" → "What".',
optionAnalysis: [
'Salah: "That" tidak bisa menggantikan subjek yang hilang dalam makna "apa yang".',
'Benar: "What" berfungsi sebagai Connector + Subject untuk "caused".',
'Salah: "It" bukan connector, sehingga ada 2 verb tanpa penghubung.',
'Salah: "Which" untuk adjective clause (butuh kata benda di depannya).'
]
}
]
},
{
id: 'S-2.3',
level: 'intermediate',
section: 'Structure',
skill: 'Structure Skill 24–26',
title: 'Parallel Structure & Paired Conjunctions',
shortTitle: 'Parallelism & Paired Conj.',
summary:
'Semua elemen yang dihubungkan oleh and/but/or atau pasangan (both...and, either...or, neither...nor, not only...but also) WAJIB memiliki kelas kata/struktur yang sejajar.',
formulas: [
{
title: '1. Pasangan Wajib (Paired Conjunctions)',
explanation:
'Hafalkan 4 pasangan mutlak ini — TOEFL sering menukarnya secara salah (misal: "both...or" atau "neither...or")!',
formula: 'both A and B  |  either A or B  |  neither A nor B  |  not only A but also B',
interactiveSentence: {
translation: 'Program baru itu tidak hanya efisien tetapi juga hemat biaya.',
tip: 'Perhatikan kesejajaran kelas kata setelah "not only" dan "but also".',
tokens: [
{ text: 'The new program', role: 'subject', label: 'Subject' },
{ text: 'is', role: 'verb', label: 'Verb' },
{ text: 'not only', role: 'connector', label: 'Pair 1' },
{ text: 'efficient', role: 'subject', label: 'Adjective 1' },
{ text: 'but also', role: 'connector', label: 'Pair 2' },
{ text: 'cost-effective.', role: 'subject', label: 'Adjective 2 (Parallel!)' }
]
}
}
],
traps: [
{
wrong: 'She enjoys hiking, swimming, and to read novels.',
right: 'She enjoys hiking, swimming, and reading novels.',
reason: 'Semua item dalam daftar harus sejajar: V-ing, V-ing, dan V-ing.'
}
],
questions: [
{
id: 'S-2.3-Q1',
type: 'Part B (Error Recognition)',
difficulty: 'Intermediate',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'The documentary ' },
{ text: 'explored', code: 'A' },
{ text: ' neither the economic ' },
{ text: 'causes', code: 'B' },
{ text: ' ' },
{ text: 'or', code: 'C' },
{ text: ' the social consequences of ' },
{ text: 'urbanization', code: 'D' },
{ text: '.' }
],
options: ['(A) explored', '(B) causes', '(C) or', '(D) urbanization'],
correctIndex: 2,
explanation: 'Pasangan wajib dari "neither" adalah "nor", bukan "or".',
optionAnalysis: [
'Benar: Past Simple tepat.',
'Benar: Sejajar dengan "consequences".',
'SALAH (Jawaban): Seharusnya "nor" (neither...nor).',
'Benar: Kata benda tepat.'
]
}
]
},
{
id: 'S-2.4',
level: 'intermediate',
section: 'Structure',
skill: 'Structure Skill 43–45',
title: 'Gerund vs. Infinitive & Word Forms',
shortTitle: 'Gerund, Infinitive & Word Form',
summary:
'Mengenali posisi Noun, Verb, Adjective, dan Adverb dari akhiran katanya (-tion, -ment, -ive, -ous, -ly) serta kata kerja yang wajib diikuti V-ing vs to-V1.',
formulas: [
{
title: '1. Rumus Posisi Word Form (Part B Favorit!)',
explanation:
'Adjective menjelaskan Noun (economic growth). Adverb (-ly) menjelaskan Verb, Adjective, atau Adverb lain (rapidly growing economy). Setelah Preposisi, kata kerja wajib berbentuk Gerund (V-ing).',
formula: 'Adv + Adj + Noun  ||  Preposition (in/of/by/for) + V-ing (Gerund)'
}
],
traps: [
{
wrong: 'The professor spoke very clear and gave an extreme detailed lecture.',
right: 'The professor spoke very clearly and gave an extremely detailed lecture.',
reason: 'Menjelaskan verb ("spoke") dan adjective ("detailed") wajib menggunakan Adverb (-ly).'
}
],
questions: [
{
id: 'S-2.4-Q1',
type: 'Part B (Error Recognition)',
difficulty: 'Intermediate',
prompt: 'Pilih bagian yang SALAH pada kalimat berikut:',
sentenceParts: [
{ text: 'Solar panels have become ' },
{ text: 'increasing', code: 'A' },
{ text: ' affordable due to ' },
{ text: 'advances', code: 'B' },
{ text: ' in ' },
{ text: 'manufacturing', code: 'C' },
{ text: ' ' },
{ text: 'technology', code: 'D' },
{ text: '.' }
],
options: ['(A) increasing', '(B) advances', '(C) manufacturing', '(D) technology'],
correctIndex: 0,
explanation: 'Kata "affordable" adalah Adjective. Untuk menjelaskan Adjective, kita butuh Adverb ("increasingly"), bukan Adjective ("increasing").',
optionAnalysis: [
'SALAH (Jawaban): Seharusnya "increasingly" (Adverb + Adjective).',
'Benar: Kata benda jamak tepat.',
'Benar: "manufacturing technology" adalah frasa benda baku.',
'Benar: Kata benda tepat.'
]
}
]
},
{
id: 'L-2.1',
level: 'intermediate',
section: 'Listening',
skill: 'Listening Skill 7–10',
title: 'Negative Expressions, Double Negatives & Suggestions',
shortTitle: 'Negatives & Suggestions',
summary:
'Memahami kalimat negatif (not sad = happy), double negatives (not impossible = possible), dan kalimat saran ("Why not...", "Let's...", "How about...").',
formulas: [
{
title: '1. Aljabar Negatif Listening',
explanation:
'Negatif + Kata Negatif = Positif! Contoh: "It's not unlikely" = It is likely. "Nobody didn't like it" = Everyone liked it. Untuk ungkapan seperti "hardly, barely, scarcely, rarely", maknanya HAMPIR TIDAK (Almost Negative).',
formula: 'Not + Un-/Im-/In- = POSITIF  ||  Hardly / Barely / Rarely = ALMOST NOT'
}
],
traps: [
{
wrong: 'Mendengar "She barely passed the exam" → Mengira dia TIDAK lulus.',
right: '"Barely passed" berarti dia LULUS, tetapi nilainya sangat pas-pasan.',
reason: '"Barely/hardly" mengurangi kadarnya, bukan membalikkan hasil lulus menjadi gagal.'
}
],
questions: [
{
id: 'L-2.1-Q1',
type: 'Listening Part A (Double Negative)',
difficulty: 'Intermediate',
audioScript: 'Man: Do you think Professor Lin will extend the essay deadline?\nWoman: Well, it is not impossible, considering how many students were sick.',
prompt: 'What does the woman mean?',
options: [
'The professor will definitely refuse to extend the deadline.',
'The professor might agree to extend the deadline.',
'It is impossible for sick students to submit the essay.',
'The deadline has already passed.'
],
correctIndex: 1,
explanation: '"Not impossible" adalah double negative yang bermakna "possible / might happen".',
optionAnalysis: [
'Salah: Terjebak kata "impossible" tanpa memperhatikan "not".',
'Benar: "not impossible" = mungkin saja terjadi.',
'Salah: Salah menangkap objek pembicaraan.',
'Salah: Tidak disebutkan tenggat sudah lewat.'
]
}
]
},
{
id: 'R-2.1',
level: 'intermediate',
section: 'Reading',
skill: 'Reading Skill 4, 8–10',
title: 'Unstated Details & Vocabulary in Context',
shortTitle: 'Unstated Details & Vocab',
summary:
'Menjawab soal NOT/EXCEPT dengan teknik eliminasi 3 fakta benar, serta menebak arti kosakata sulit menggunakan petunjuk konteks (definisi, kontras, contoh) di sekitarnya.',
formulas: [
{
title: '1. Kunci Vocabulary in Context',
explanation:
'Jangan panik jika tidak tahu arti kata sulit! Lihat tanda koma/kurung (definisi langsung), kata kontras (unlike, however, whereas), atau contoh (such as) di kalimat yang sama.',
formula: 'NOT / EXCEPT = Cari 3 opsi yang ADA di teks → Sisa 1 adalah jawaban!'
}
],
traps: [
{
wrong: 'Memilih arti kamus paling umum tanpa mengecek konteks kalimat di bacaan.',
right: 'Selalu uji substitusi opsi ke dalam kalimat di teks.',
reason: 'Kata bahasa Inggris sering punya banyak makna (misal: "harbor" bisa berarti pelabuhan atau "menyimpan perasaan/bakteri").'
}
],
readingPassage: {
title: 'The Resilience of Tardigrades',
lines: [
'Tardigrades, microscopic animals colloquially known as water bears, are renowned for their extraordinary ability to survive extreme environments.',
'When faced with severe dehydration or freezing temperatures, they enter a dormant state called cryptobiosis, during which their metabolic activity drops to an almost undetectable level.',
'In this resilient condition, tardigrades can withstand intense radiation, the vacuum of outer space, and boiling water.',
'However, despite their fame as indestructible organisms, they are actually quite vulnerable to prolonged high temperatures when they are in their active, hydrated state.'
]
},
questions: [
{
id: 'R-2.1-Q1',
type: 'Reading (Vocabulary in Context)',
difficulty: 'Intermediate',
evidenceLine: 1,
prompt: 'The word "dormant" in line 2 is closest in meaning to _____.',
options: ['active', 'inactive', 'rapid', 'toxic'],
correctIndex: 1,
explanation: 'Konteks baris 2 menjelaskan: "during which their metabolic activity drops to an almost undetectable level" → artinya tidak aktif (inactive).',
optionAnalysis: [
'Salah: Antonimnya (berlawanan dengan baris 4).',
'Benar: Didukung oleh petunjuk metabolisme yang turun hampir tak terdeteksi.',
'Salah: Tidak sesuai konteks.',
'Salah: Tidak ada konteks racun.'
]
},
{
id: 'R-2.1-Q2',
type: 'Reading (Unstated Detail)',
difficulty: 'Intermediate',
evidenceLine: 2,
prompt: 'Which of the following is NOT mentioned as something tardigrades can survive during cryptobiosis?',
options: ['Intense radiation', 'The vacuum of space', 'Boiling water', 'Predatory insects'],
correctIndex: 3,
explanation: 'Baris 3 menyebutkan radiation, vacuum of outer space, dan boiling water. "Predatory insects" tidak disebut sama sekali.',
optionAnalysis: [
'Ada di teks (baris 3).',
'Ada di teks (baris 3).',
'Ada di teks (baris 3).',
'Benar (Tidak disebutkan di teks).'
]
}
]
},

// ===================== LEVEL 3: ADVANCE 550+ (4 MODUL) =====================
{
id: 'S-3.1',
level: 'advance',
section: 'Structure',
skill: 'Structure Skill 15–19',
title: 'Inverted Subjects & Verbs (Negative, Place & Conditionals)',
shortTitle: 'Inversion (Target 550+)',
summary:
'Materi penentu skor 550+! Kapan posisi Verb/Auxiliary WAJIB dibalik ke depan Subject? Saat kalimat diawali Ekspresi Negatif, Keterangan Tempat, atau Conditional tanpa "if".',
formulas: [
{
title: '1. Tiga Pemicu Inversi Utama',
explanation:
'(1) Negative Expressions di awal kalimat: Never, Rarely, Seldom, Not only, Only after, Little, Nowhere → [Neg] + [Aux] + [S] + [V]. (2) Conditional tanpa "if": Had / Were / Should + [S]. (3) Keterangan Tempat (Place Expression) di awal + Verb intransitif.',
formula: 'Not only / Rarely / Never + [Auxiliary (do/did/has/can)] + [Subject] + [Main Verb]  ||  Had + S + V3',
interactiveSentence: {
translation: 'Jarang sekali para astronom menyaksikan ledakan supernova yang begitu terang.',
tip: 'Klik "Rarely" dan auxiliary "have" untuk melihat pola balik (Inversion)!',
tokens: [
{ text: 'Rarely', role: 'connector', label: 'Negative Trigger (Pemicu Inversi!)' },
{ text: 'have', role: 'verb', label: 'Auxiliary di DEPAN Subject' },
{ text: 'astronomers', role: 'subject', label: 'Subject' },
{ text: 'witnessed', role: 'verb', label: 'Main Verb (V3)' },
{ text: 'such a luminous supernova.', role: 'normal' }
]
}
}
],
traps: [
{
wrong: 'Never I have seen such a complex equation.',
right: 'Never have I seen such a complex equation.',
reason: 'Karena diawali kata negatif "Never", auxiliary "have" WAJIB pindah ke depan subject "I".'
},
{
wrong: 'If had he studied harder, he would have passed.',
right: 'Had he studied harder, he would have passed.',
reason: 'Inversi conditional (Had/Were/Should) HANYA terjadi jika kata "if" DIHAPUS.'
}
],
questions: [
{
id: 'S-3.1-Q1',
type: 'Part A (550+ Inversion)',
difficulty: '550+ Trap',
prompt: 'Not only _____ a new vaccine, but the laboratory also reduced its production cost.',
options: [
'the scientists developed',
'did the scientists develop',
'developed the scientists',
'were the scientists develop'
],
correctIndex: 1,
explanation: '"Not only" di awal kalimat memicu Inversi: [Auxiliary + Subject + V1] → "did the scientists develop".',
optionAnalysis: [
'Salah: Tidak mengalami inversi.',
'Benar: Pola inversi sempurna (did + S + V1).',
'Salah: Kata kerja aksi "develop" membutuhkan auxiliary "did" untuk inversi.',
'Salah: "were" tidak bisa diikuti V1 "develop".'
]
},
{
id: 'S-3.1-Q2',
type: 'Part A (Conditional Inversion)',
difficulty: '550+ Trap',
prompt: '_____ the warning signs earlier, the coastal town could have minimized the damage.',
options: [
'Had the officials noticed',
'If had the officials noticed',
'The officials had noticed',
'Did the officials notice'
],
correctIndex: 0,
explanation: 'Conditional Type 3 tanpa "if" diinversi menjadi: "Had + Subject + V3" (= If the officials had noticed).',
optionAnalysis: [
'Benar: Inversi Type 3 yang tepat.',
'Salah: Tidak boleh memakai "If" sekaligus inversi.',
'Salah: Tanpa connector, terjadi 2 klausa terpisah koma (comma splice).',
'Salah: "Did" tidak dipakai untuk inversi conditional.'
]
}
]
},
{
id: 'S-3.2',
level: 'advance',
section: 'Structure',
skill: 'Structure Skill 13–14',
title: 'Reduced Adjective & Adverb Clauses',
shortTitle: 'Reduced Clauses (550+)',
summary:
'Peringkasan klausa yang sering muncul di soal nomor 10–15 Structure Part A. Hapus connector + to be; sisakan V-ing (aktif) atau V3 (pasif).',
formulas: [
{
title: '1. Aturan Peringkasan Aktif vs. Pasif',
explanation:
'Adjective Clause: "The book that was written in 1950" → "The book written in 1950". Adverb Clause: "Although it was damaged by fire, the tower..." → "Although damaged by fire, the tower...". Syarat mutlak: Subjek kedua klausa harus SAMA!',
formula: 'Aktif → V-ing (tanpa connector/S)  ||  Pasif → V3 (tetap boleh simpan Adverb Connector seperti Although/When/If)',
interactiveSentence: {
translation: 'Ketika terpapar sinar matahari, sel fotovoltaik menghasilkan arus listrik.',
tip: 'Klik "When exposed to sunlight," untuk melihat bentuk ringkas dari "When they are exposed..."',
tokens: [
{ text: 'When exposed to sunlight,', role: 'connector', label: 'Reduced Adverb Clause (Pasif: When + V3)' },
{ text: 'photovoltaic cells', role: 'subject', label: 'Subject Utama' },
{ text: 'generate', role: 'verb', label: 'Main Verb' },
{ text: 'an electric current.', role: 'normal' }
]
}
}
],
traps: [
{
wrong: 'Walking through the forest, a rare orchid was seen by the botanist.',
right: 'Walking through the forest, the botanist saw a rare orchid.',
reason: 'Dangling Modifier! Yang "walking" adalah "the botanist", bukan "a rare orchid". Subjek setelah koma wajib pelaku aksi tersebut.'
}
],
questions: [
{
id: 'S-3.2-Q1',
type: 'Part A (Reduced Clause)',
difficulty: '550+ Trap',
prompt: '_____, the manuscript provided crucial insight into medieval trade routes.',
options: [
'Translating into modern English',
'Having translated into modern English',
'Once translated into modern English',
'It was translated into modern English'
],
correctIndex: 2,
explanation: 'Subjek utamanya adalah "the manuscript" (benda mati → diterjemahkan/pasif). Maka reduced adverb clause-nya wajib memakai V3 pasif: "Once translated...".',
optionAnalysis: [
'Salah: Aktif (manuskrip tidak menerjemahkan dirinya sendiri).',
'Salah: Aktif (Having + V3 adalah aktif).',
'Benar: Reduced passive adverb clause ("Once [it was] translated...").',
'Salah: Dua klausa tanpa connector (comma splice).'
]
}
]
},
{
id: 'L-3.1',
level: 'advance',
section: 'Listening',
skill: 'Listening Skill 14–17',
title: 'Contrary-to-Fact Conditionals, Idioms & Part B/C Talks',
shortTitle: 'Conditionals, Idioms & Part C',
summary:
'Kunci skor Listening 55+: memahami kalimat pengandaian (makna sebenarnya adalah KEBALIKAN dari yang diucapkan), idiom kampus Amerika, dan struktur kuliah Part C.',
formulas: [
{
title: '1. Hukum Kebalikan (Wish & If Conditional)',
explanation:
'Jika pembicara berkata: "I wish I had studied" (positif) → Fakta: He DID NOT study (negatif). Jika berkata: "If she hadn't missed the bus" (negatif) → Fakta: She MISSED the bus (positif).',
formula: 'Wish / Unreal If (Positif) → Fakta NEGATIF  ||  Wish / Unreal If (Negatif) → Fakta POSITIF'
}
],
traps: [
{
wrong: 'Mendengar "It's on the tip of my tongue" → Mengira ada masalah fisik di lidah.',
right: 'Idiom ini berarti "Hampir ingat / hampir bisa menyebutkannya, tapi lupa sesaat".',
reason: 'Jangan pernah menerjemahkan idiom TOEFL secara harfiah (literal).'
}
],
questions: [
{
id: 'L-3.1-Q1',
type: 'Listening Part A (Contrary-to-Fact)',
difficulty: '550+ Trap',
audioScript: 'Man: Did Sarah attend the geology symposium yesterday?\nWoman: If she had known about the schedule change, she would have been there.',
prompt: 'What does the woman imply about Sarah?',
options: [
'Sarah attended the symposium on time.',
'Sarah knew about the schedule change.',
'Sarah did not go to the symposium.',
'Sarah changed the schedule herself.'
],
correctIndex: 2,
explanation: 'Kalimat "If she had known..., she would have been there" adalah pengandaian lampau (positif) → Faktanya KEBALIKANNYA: Sarah tidak tahu dan tidak hadir.',
optionAnalysis: [
'Salah: Bertentangan dengan fakta pengandaian.',
'Salah: Faktanya ia tidak tahu.',
'Benar: Kebalikan dari "she would have been there".',
'Salah: Tidak disebutkan di dialog.'
]
}
]
},
{
id: 'R-3.1',
level: 'advance',
section: 'Reading',
skill: 'Reading Skill 6–7, 12–13',
title: 'Implied Details, Tone, Purpose & Academic Word List',
shortTitle: 'Inference, Tone & AWL (550+)',
summary:
'Menjawab soal tersirat (implied/inferred/most likely) dengan logika deduktif ketat, mengenali nada penulis (objective, skeptical, enthusiastic), dan menguasai kosakata akademik tinggi.',
formulas: [
{
title: '1. Strategi Soal Inference (Tersirat)',
explanation:
'Jawaban Inference TIDAK tertulis persis kata per kata, melainkan kesimpulan logis 1 langkah dari fakta di teks. Hindari opsi yang terlalu ekstrem (always, never, completely, impossible).',
formula: 'Fakta Eksplisit di Teks + Logika 1 Langkah = Jawaban Inference (Hindari kata ekstrem!)'
}
],
traps: [
{
wrong: 'Memilih jawaban yang masuk akal menurut pengetahuan umum di luar teks.',
right: 'Semua jawaban Inference tetap wajib memiliki pijakan bukti kalimat di dalam teks.',
reason: 'TOEFL menguji pemahaman bacaan, bukan pengetahuan luar.'
}
],
readingPassage: {
title: 'The Little Ice Age and European Agriculture',
lines: [
'Between roughly 1300 and 1850, much of Europe experienced a period of cooling known as the Little Ice Age, during which average temperatures dropped by only one to two degrees Celsius.',
'Although this decline appears modest on paper, it shortened the growing season by several weeks and devastated staple crops such as wheat and grapes in northern regions.',
'Faced with repeated harvests failing, farmers gradually abandoned vineyards in England and shifted toward hardier grains like oats and rye.',
'Historians now argue that these climatic pressures accelerated agricultural innovation and reshaped European trade networks for centuries.'
]
},
questions: [
{
id: 'R-3.1-Q1',
type: 'Reading (Implied Detail)',
difficulty: '550+ Trap',
evidenceLine: 2,
prompt: 'What can be inferred from the passage about oats and rye compared to grapes?',
options: [
'Oats and rye were more profitable to export than grapes.',
'Oats and rye could better tolerate colder, shorter growing seasons.',
'Grapes had never been grown in England before 1300.',
'Farmers preferred the taste of oats over wheat.'
],
correctIndex: 1,
explanation: 'Baris 3 menyebutkan petani meninggalkan kebun anggur dan beralih ke "hardier grains like oats and rye" karena iklim mendingin → artinya oats dan rye lebih tahan dingin.',
optionAnalysis: [
'Salah: Teks tidak membandingkan profitabilitas ekspor.',
'Benar: Inferensi langsung dari frasa "hardier grains" di tengah musim tanam yang memendek.',
'Salah: Justru petani "abandoned vineyards in England", artinya dulu ada.',
'Salah: Alasannya adalah ketahanan iklim, bukan selera rasa.'
]
}
]
}
];

// ============================================================================
// DATA: LAB LISTENING (PART A, B, C)
// ============================================================================

const LISTENING_LAB_ITEMS = [
{
id: 'LAB-1',
part: 'Part A • Negative Expression',
title: 'Double Negative Trap',
difficulty: 'Intermediate',
lines: [
{ speaker: 'Man', text: 'I heard the new chemistry professor gives really tough exams.' },
{ speaker: 'Woman', text: 'Well, it is not uncommon for half the class to retake the midterm.' }
],
question: 'What does the woman imply about the chemistry exams?',
options: [
'Very few students ever have to retake the midterm.',
'It is fairly common for many students to retake the midterm.',
'The chemistry professor rarely gives midterms.',
'Half the class dropped the chemistry course.'
],
correctIndex: 1,
explanation: '"Not uncommon" = Double Negative yang bermakna "common" (hal yang biasa/sering terjadi).'
},
{
id: 'LAB-2',
part: 'Part A • Idiomatic Expression',
title: 'Campus Idiom 550+',
difficulty: '550+ Trap',
lines: [
{ speaker: 'Woman', text: 'Are you ready for Dr. Miller's oral presentation this afternoon?' },
{ speaker: 'Man', text: 'Honestly, I have been burning the midnight oil all week, so I hope it pays off.' }
],
question: 'What does the man mean?',
options: [
'He accidentally spilled oil on his presentation notes.',
'He has been staying up very late studying and preparing.',
'He hopes to get paid for giving the presentation.',
'He postponed the presentation until next week.'
],
correctIndex: 1,
explanation: '"Burning the midnight oil" adalah idiom klasik TOEFL yang berarti belajar/bekerja keras hingga larut malam.'
},
{
id: 'LAB-3',
part: 'Part A • Contrary-to-Fact Conditional',
title: 'Unreal Past Wish',
difficulty: '550+ Trap',
lines: [
{ speaker: 'Man', text: 'Did you manage to reserve a study room on the third floor?' },
{ speaker: 'Woman', text: 'I wish I had booked it yesterday; every single room is occupied now.' }
],
question: 'What can be inferred about the woman?',
options: [
'She reserved a study room yesterday.',
'She found an empty room on the third floor.',
'She did not reserve a study room in advance.',
'She prefers studying at home.'
],
correctIndex: 2,
explanation: '"I wish I had booked it yesterday" (positif) → Faktanya kebalikannya: ia TIDAK memesan ruangan itu sebelumnya.'
},
{
id: 'LAB-4',
part: 'Part C • Mini Academic Talk',
title: 'Paleontology: Amber Preservation',
difficulty: '550+ Trap',
lines: [
{
speaker: 'Lecturer',
text: 'Today we will discuss why amber is so valuable to paleontologists. Unlike ordinary stone fossils, which usually preserve only bones or shells, amber—which is fossilized tree resin—can trap entire soft-bodied insects in three dimensions. Because the resin hardens rapidly and seals out oxygen, bacteria cannot decay the trapped organism. As a result, scientists can examine microscopic details such as wing veins and even pollen grains stuck to an insect's legs millions of years ago.'
}
],
question: 'According to the lecturer, why does amber preserve insects better than stone fossils?',
options: [
'Amber is much heavier and harder than stone.',
'Amber seals out oxygen, preventing bacterial decay of soft tissues.',
'Insects are naturally attracted to stone rather than trees.',
'Amber only forms in freezing temperatures.'
],
correctIndex: 1,
explanation: 'Dosen menjelaskan: "the resin hardens rapidly and seals out oxygen, bacteria cannot decay the trapped organism."'
}
];

// ============================================================================
// DATA: ACADEMIC WORD LIST (AWL) HIGH-FREQUENCY TOEFL 550+
// ============================================================================

const AWL_VOCAB = [
{ word: 'Ubiquitous', synonym: 'Found everywhere / Widespread', idMeaning: 'Ada di mana-mana', example: 'Smartphones have become ubiquitous in modern classrooms.' },
{ word: 'Ephemeral', synonym: 'Short-lived / Temporary', idMeaning: 'Sementara / singkat', example: 'Desert blooms are often ephemeral, lasting only a few days.' },
{ word: 'Mitigate', synonym: 'Reduce / Alleviate / Lessen', idMeaning: 'Mengurangi dampak', example: 'Coastal wetlands help mitigate the impact of storm surges.' },
{ word: 'Corroborate', synonym: 'Confirm / Support with evidence', idMeaning: 'Menguatkan bukti', example: 'New satellite data corroborate the geologists' earlier findings.' },
{ word: 'Proliferate', synonym: 'Multiply rapidly / Increase', idMeaning: 'Berkembang biak pesat', example: 'Algae can proliferate quickly in nutrient-rich waters.' },
{ word: 'Anomaly', synonym: 'Irregularity / Exception', idMeaning: 'Penyimpangan / kejanggalan', example: 'Astronomers noticed an anomaly in the planet's orbit.' },
{ word: 'Pragmatic', synonym: 'Practical / Realistic', idMeaning: 'Praktis / realistis', example: 'The committee adopted a pragmatic approach to the budget.' },
{ word: 'Scrutinize', synonym: 'Examine closely / Inspect', idMeaning: 'Memeriksa dengan teliti', example: 'Peer reviewers scrutinize every methodology before publication.' },
{ word: 'Plausible', synonym: 'Believable / Credible', idMeaning: 'Masuk akal', example: 'The historian proposed a plausible explanation for the migration.' },
{ word: 'Deteriorate', synonym: 'Worsen / Decline', idMeaning: 'Memburuk / merosot', example: 'Without proper humidity control, old manuscripts deteriorate.' }
];

// ============================================================================
// DATA: DIAGNOSTIC TEST (9 SOAL TERKURASI: 3 STRUCTURE, 3 LISTENING, 3 READING)
// ============================================================================

const DIAGNOSTIC_QUESTIONS = [
{
id: 'DIAG-1',
section: 'Structure',
recommendedModule: 'S-1.1',
prompt: 'The collection of rare botanical drawings _____ donated to the university library in 1995.',
options: ['were', 'was', 'have been', 'are'],
correctIndex: 1,
explanation: 'True Subject = "The collection" (Tunggal). Coret "of rare botanical drawings". Tahun 1995 → "was".'
},
{
id: 'DIAG-2',
section: 'Structure',
recommendedModule: 'S-2.3',
prompt: 'The new software is designed to be both user-friendly _____ highly secure.',
options: ['or', 'nor', 'and', 'but also'],
correctIndex: 2,
explanation: 'Paired conjunction mutlak: "both ... and".'
},
{
id: 'DIAG-3',
section: 'Structure',
recommendedModule: 'S-3.1',
prompt: 'Seldom _____ such rapid temperature fluctuations in a single afternoon.',
options: ['meteorologists have observed', 'have meteorologists observed', 'observed meteorologists', 'did meteorologists observed'],
correctIndex: 1,
explanation: 'Negative expression "Seldom" di awal kalimat memicu inversi: Auxiliary ("have") + Subject + V3.'
},
{
id: 'DIAG-4',
section: 'Listening',
recommendedModule: 'L-1.1',
audioScript: 'Man: Are you going to buy that used car we saw yesterday?\nWoman: I would rather save my money for a more reliable model.',
prompt: 'What does the woman mean?',
options: [
'She already bought the used car.',
'She prefers not to buy the used car.',
'She thinks the used car is very reliable.',
'She wants to borrow money from the man.'
],
correctIndex: 1,
explanation: '"Would rather save my money for a more reliable model" berarti ia memilih TIDAK membeli mobil bekas tersebut.'
},
{
id: 'DIAG-5',
section: 'Listening',
recommendedModule: 'L-2.1',
audioScript: 'Woman: Was the economics seminar crowded?\nMan: Hardly anyone showed up because of the heavy snowstorm.',
prompt: 'What does the man say about the seminar?',
options: [
'Almost nobody attended it.',
'Everyone worked hard during the seminar.',
'It was rescheduled due to snow.',
'The room was completely full.'
],
correctIndex: 0,
explanation: '"Hardly anyone" bermakna hampir tidak ada orang (almost nobody).'
},
{
id: 'DIAG-6',
section: 'Listening',
recommendedModule: 'L-3.1',
audioScript: 'Man: Why didn't Mark apply for the overseas fellowship?\nWoman: Had he met the language requirement, he certainly would have submitted an application.',
prompt: 'What does the woman imply about Mark?',
options: [
'Mark submitted his application early.',
'Mark passed the language requirement.',
'Mark did not fulfill the language requirement.',
'Mark was accepted into the fellowship.'
],
correctIndex: 2,
explanation: 'Contrary-to-fact conditional: "Had he met..." (positif) → Fakta: Mark TIDAK memenuhi syarat bahasa.'
},
{
id: 'DIAG-7',
section: 'Reading',
recommendedModule: 'R-1.1',
miniPassage: 'Coral reefs cover less than one percent of the ocean floor, yet they support approximately 25 percent of all marine species. Because they provide shelter and breeding grounds, ecologists often refer to them as the rainforests of the sea.',
prompt: 'Why do ecologists call coral reefs "the rainforests of the sea"?',
options: [
'They cover the majority of the ocean floor.',
'They receive heavy rainfall throughout the year.',
'They sustain an extraordinarily high diversity of marine life.',
'They grow taller than tropical trees.'
],
correctIndex: 2,
explanation: 'Meski luasnya <1%, terumbu karang menopang 25% spesies laut dan menyediakan habitat.'
},
{
id: 'DIAG-8',
section: 'Reading',
recommendedModule: 'R-2.1',
miniPassage: 'During the Industrial Revolution, the proliferation of mechanized looms dramatically lowered the cost of textiles, allowing ordinary households to afford fabrics that were previously reserved for the wealthy.',
prompt: 'The word "proliferation" in the passage is closest in meaning to _____.',
options: ['destruction', 'rapid increase', 'strict regulation', 'manual repair'],
correctIndex: 1,
explanation: 'Konteks penurunan harga drastis menunjukkan mesin tenun berkembang/meningkat dengan cepat ("rapid increase").'
},
{
id: 'DIAG-9',
section: 'Reading',
recommendedModule: 'R-3.1',
miniPassage: 'While early astronomers assumed that Venus rotated in the same direction as Earth, radar measurements in the 1960s revealed that Venus spins backward—a phenomenon known as retrograde rotation.',
prompt: 'What can be inferred about astronomers prior to the 1960s?',
options: [
'They had already mapped Venus using advanced radar.',
'They held an inaccurate belief regarding Venus's rotational direction.',
'They knew Venus was the hottest planet in the solar system.',
'They discovered retrograde rotation on Earth.'
],
correctIndex: 1,
explanation: 'Kata "While early astronomers assumed... radar measurements in the 1960s revealed..." menyiratkan asumsi sebelumnya keliru.'
}
];

// ============================================================================
// HELPER: WEB SPEECH API (TTS)
// ============================================================================

function speakText(text, lang = 'en-US', rate = 1.0, onEnd) {
if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
if (onEnd) setTimeout(onEnd, 1200);
return;
}
window.speechSynthesis.cancel();
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = lang;
utterance.rate = rate;
if (onEnd) {
utterance.onend = onEnd;
utterance.onerror = onEnd;
}
window.speechSynthesis.speak(utterance);
}

// ============================================================================
// SUBCOMPONENT: INTERACTIVE "CORET & SOROT" SENTENCE BREAKDOWN
// ============================================================================

function InteractiveSentenceBreakdown({ data, showTranslation }) {
const [clickedIndices, setClickedIndices] = useState([]);
const [revealAll, setRevealAll] = useState(false);

const toggleToken = (idx) => {
setClickedIndices((prev) =>
prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
);
};

const isRevealed = (idx) => revealAll || clickedIndices.includes(idx);

const getTokenStyle = (token, active) => {
if (!active) {
if (token.role === 'normal') return 'text-slate-800';
return 'text-slate-800 bg-slate-100 hover:bg-indigo-100 border-b-2 border-dashed border-indigo-400 cursor-pointer px-1.5 py-0.5 rounded transition-all';
}
switch (token.role) {
case 'trap':
return 'line-through decoration-2 decoration-rose-500 text-slate-400 bg-rose-50/70 px-1.5 py-0.5 rounded cursor-pointer';
case 'subject':
return 'bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-300 px-1.5 py-0.5 rounded cursor-pointer';
case 'verb':
return 'bg-emerald-100 text-emerald-900 font-bold ring-1 ring-emerald-300 px-1.5 py-0.5 rounded cursor-pointer';
case 'connector':
return 'bg-purple-100 text-purple-900 font-bold ring-1 ring-purple-300 px-1.5 py-0.5 rounded cursor-pointer';
default:
return 'text-slate-800';
}
};

return (



 Latihan Coret & Sorot Interaktif


<button
onClick={() => setRevealAll(!revealAll)}
className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
>
{revealAll ? 'Sembunyikan Analisis' : 'Tampilkan Semua Analisis'}

{(clickedIndices.length > 0 || revealAll) && (
<button
onClick={() => {
setClickedIndices([]);
setRevealAll(false);
}}
className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
>
Reset

)}



  <p className="text-xs text-slate-500 mb-3">{data.tip}</p>

  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-base md:text-lg leading-relaxed py-2">
    {data.tokens.map((token, idx) => {
      const active = isRevealed(idx);
      const clickable = token.role !== 'normal';
      return (
        <span
          key={idx}
          onClick={() => clickable && toggleToken(idx)}
          className={`relative group inline-flex flex-col items-center ${getTokenStyle(token, active)}`}
        >
          <span>{token.text}</span>
          {active && token.label && (
            <span className="text-[10px] font-semibold leading-tight mt-0.5 opacity-90 no-underline">
              {token.label}
            </span>
          )}
        </span>
      );
    })}
  </div>

  {showTranslation && (
    <p className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
      <span className="font-semibold text-slate-700">Arti ID:</span> {data.translation}
    </p>
  )}

  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-200 border border-blue-400"></span> Subject</span>
    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400"></span> Main Verb</span>
    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-400"></span> Coret (Jebakan)</span>
    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-200 border border-purple-400"></span> Connector / Trigger</span>
  </div>
</div>


);
}

// ============================================================================
// SUBCOMPONENT: QUESTION CARD (PART A, PART B ERROR RECOGNITION, LISTENING, READING)
// ============================================================================

function QuestionCard({
question,
selectedAnswer,
onSelectAnswer,
onHighlightEvidence,
showAudioButton = true
}) {
const isAnswered = selectedAnswer !== undefined;
const isCorrect = selectedAnswer === question.correctIndex;
const [isPlaying, setIsPlaying] = useState(false);

const handlePlayAudio = () => {
if (!question.audioScript) return;
setIsPlaying(true);
speakText(question.audioScript.replace(/\n/g, '. '), 'en-US', 0.95, () => setIsPlaying(false));
};

return (




{question.type}

{question.difficulty && (
<span
className={text-xs font-semibold px-2.5 py-0.5 rounded-full ${ question.difficulty.includes('550+') ? 'bg-amber-100 text-amber-800' : question.difficulty === 'Intermediate' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800' }}
>
{question.difficulty}

)}

{question.evidenceLine !== undefined && onHighlightEvidence && (
<button
onClick={() => onHighlightEvidence(question.evidenceLine)}
className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 transition"
>
 Sorot Bukti di Teks

)}


  {question.audioScript && showAudioButton && (
    <div className="mb-4 p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <button
          onClick={handlePlayAudio}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <Play className="w-3.5 h-3.5" /> {isPlaying ? 'Memutar Audio...' : 'Putar Audio Soal'}
        </button>
        <span className="text-xs text-slate-600">Dengarkan dialog sebelum memilih jawaban</span>
      </div>
      {isAnswered && (
        <div className="w-full mt-2 pt-2 border-t border-indigo-100 text-xs text-slate-700 whitespace-pre-line">
          <strong className="text-indigo-800">Transkrip:</strong>
          {'\n'}
          {question.audioScript}
        </div>
      )}
    </div>
  )}

  <p className="text-sm md:text-base font-medium text-slate-900 mb-3">{question.prompt}</p>

  {/* Part B Error Recognition Underlined Sentence */}
  {question.sentenceParts && (
    <div className="mb-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-base leading-loose text-slate-800">
      {question.sentenceParts.map((part, idx) =>
        part.code ? (
          <span key={idx} className="inline-flex flex-col items-center mx-0.5 align-bottom">
            <span className="underline decoration-2 decoration-indigo-600 underline-offset-4 font-semibold">
              {part.text}
            </span>
            <span className="text-[11px] font-bold text-indigo-700 leading-none mt-1">
              ({part.code})
            </span>
          </span>
        ) : (
          <span key={idx}>{part.text}</span>
        )
      )}
    </div>
  )}

  <div className="grid grid-cols-1 gap-2.5">
    {question.options.map((opt, idx) => {
      const isPicked = selectedAnswer === idx;
      const isRightOpt = idx === question.correctIndex;
      let btnClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800';
      if (isAnswered) {
        if (isRightOpt) {
          btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
        } else if (isPicked && !isRightOpt) {
          btnClass = 'border-rose-400 bg-rose-50 text-rose-900';
        } else {
          btnClass = 'border-slate-100 bg-slate-50/50 text-slate-500';
        }
      }

      return (
        <button
          key={idx}
          disabled={isAnswered}
          onClick={() => onSelectAnswer(idx)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-start justify-between gap-3 ${btnClass}`}
        >
          <div className="flex items-start gap-3">
            <span className="font-bold text-xs mt-0.5 w-5 h-5 rounded-full bg-white/80 border border-current flex items-center justify-center shrink-0">
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{opt}</span>
          </div>
          {isAnswered && isRightOpt && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {isAnswered && isPicked && !isRightOpt && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
        </button>
      );
    })}
  </div>

  {isAnswered && (
    <div
      className={`mt-4 rounded-xl p-4 border text-sm ${
        isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
      }`}
    >
      <div className="flex items-center gap-2 font-bold mb-1.5">
        {isCorrect ? (
          <span className="text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Tepat Sekali!
          </span>
        ) : (
          <span className="text-rose-800 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Belum Tepat — Soal ini otomatis disimpan ke Error Log!
          </span>
        )}
      </div>
      <p className="text-slate-700 leading-relaxed mb-3">{question.explanation}</p>

      {question.optionAnalysis && (
        <div className="pt-3 border-t border-slate-200/70">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Bedah Semua Opsi (Pengecoh vs. Benar):
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {question.optionAnalysis.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                    i === question.correctIndex
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )}
</div>


);
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function TOEFL550AcademyApp() {
// Navigation & UI State
const [activeTab, setActiveTab] = useState('syllabus'); // syllabus | diagnostic | listening | simulation | review
const [activeLevel, setActiveLevel] = useState('basic'); // basic | intermediate | advance
const [sectionFilter, setSectionFilter] = useState('All'); // All | Structure | Listening | Reading
const [selectedModuleId, setSelectedModuleId] = useState('S-1.1');
const [moduleSubTab, setModuleSubTab] = useState('materi'); // materi | latihan
const [showTranslation, setShowTranslation] = useState(true);
const [highlightedLine, setHighlightedLine] = useState(null);

// User Progress (Persisted to localStorage)
const [estimatedScore, setEstimatedScore] = useState(null);
const [completedModules, setCompletedModules] = useState([]);
const [answersMap, setAnswersMap] = useState({});
const [errorLog, setErrorLog] = useState([]);

// Diagnostic State
const [diagIndex, setDiagIndex] = useState(0);
const [diagAnswers, setDiagAnswers] = useState({});
const [diagFinished, setDiagFinished] = useState(false);

// Listening Lab State
const [labIndex, setLabIndex] = useState(0);
const [playbackRate, setPlaybackRate] = useState(1.0);
const [showTranscript, setShowTranscript] = useState(false);
const [labPlaying, setLabPlaying] = useState(false);
const [labAnswers, setLabAnswers] = useState({});

// Timed Simulation State
const [simStarted, setSimStarted] = useState(false);
const [simFinished, setSimFinished] = useState(false);
const [simSecondsLeft, setSimSecondsLeft] = useState(300); // 5 minutes mini-simulation
const [simAnswers, setSimAnswers] = useState({});

// Review / AWL State
const [reviewSubTab, setReviewSubTab] = useState('errorlog'); // errorlog | formulas | awl
const [awlSearch, setAwlSearch] = useState('');

// Floating AI Lecturer (Prof. Arya Pratama) State
const [isDosenOpen, setIsDosenOpen] = useState(false);
const [voiceEnabled, setVoiceEnabled] = useState(true);
const [dosenInput, setDosenInput] = useState('');
const [dosenMessages, setDosenMessages] = useState([
{
role: 'assistant',
text: 'Halo! Saya Prof. Arya Pratama, M.Ed. Silabus lengkap 18 Modul (Basic, Intermediate, Advance 550+) sudah siap kamu pelajari. Klik "Jelaskan Topik Aktif" atau tanyakan jebakan TOEFL apa pun!'
}
]);
const chatEndRef = useRef(null);

// Load persisted data from localStorage
useEffect(() => {
try {
const saved = localStorage.getItem('toefl_550_academy_v2');
if (saved) {
const parsed = JSON.parse(saved);
if (parsed.estimatedScore) setEstimatedScore(parsed.estimatedScore);
if (parsed.completedModules) setCompletedModules(parsed.completedModules);
if (parsed.errorLog) setErrorLog(parsed.errorLog);
}
} catch {
// ignore storage errors
}
}, []);

// Save to localStorage
useEffect(() => {
try {
localStorage.setItem(
'toefl_550_academy_v2',
JSON.stringify({ estimatedScore, completedModules, errorLog })
);
} catch {
// ignore storage errors
}
}, [estimatedScore, completedModules, errorLog]);

// Simulation countdown timer
useEffect(() => {
if (!simStarted || simFinished) return;
if (simSecondsLeft <= 0) {
setSimFinished(true);
return;
}
const timer = setInterval(() => {
setSimSecondsLeft((prev) => prev - 1);
}, 1000);
return () => clearInterval(timer);
}, [simStarted, simFinished, simSecondsLeft]);

// Auto-scroll AI Dosen chat
useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [dosenMessages, isDosenOpen]);

const currentModule = useMemo(
() => MODULES_DATA.find((m) => m.id === selectedModuleId) || MODULES_DATA[0],
[selectedModuleId]
);

const filteredModules = useMemo(() => {
return MODULES_DATA.filter((m) => {
const matchLevel = m.level === activeLevel;
const matchSection = sectionFilter === 'All' || m.section === sectionFilter;
return matchLevel && matchSection;
});
}, [activeLevel, sectionFilter]);

const allQuestionsPool = useMemo(() => {
return MODULES_DATA.flatMap((m) =>
m.questions.map((q) => ({
...q,
moduleId: m.id,
section: m.section,
moduleTitle: m.shortTitle
}))
);
}, []);

const addToErrorLog = (questionObj, userIdx) => {
setErrorLog((prev) => {
if (prev.some((item) => item.id === questionObj.id)) return prev;
return [
{
id: questionObj.id,
prompt: questionObj.prompt,
options: questionObj.options,
correctIndex: questionObj.correctIndex,
userWrongIndex: userIdx,
explanation: questionObj.explanation,
moduleId: questionObj.moduleId || currentModule.id,
section: questionObj.section || currentModule.section,
savedAt: new Date().toLocaleDateString('id-ID')
},
...prev
];
});
};

const removeFromErrorLog = (id) => {
setErrorLog((prev) => prev.filter((item) => item.id !== id));
};

const handleModuleQuestionAnswer = (q, optIdx) => {
setAnswersMap((prev) => ({ ...prev, [q.id]: optIdx }));
if (optIdx !== q.correctIndex) {
addToErrorLog({ ...q, moduleId: currentModule.id, section: currentModule.section }, optIdx);
} else {
// Check if all questions in this module are answered
const moduleQIds = currentModule.questions.map((item) => item.id);
const answeredCount = moduleQIds.filter((id) => id === q.id || answersMap[id] !== undefined).length;
if (answeredCount === moduleQIds.length && !completedModules.includes(currentModule.id)) {
setCompletedModules((prev) => [...prev, currentModule.id]);
}
}
if (q.evidenceLine !== undefined) {
setHighlightedLine(q.evidenceLine);
}
};

const jumpToModule = (moduleId) => {
const mod = MODULES_DATA.find((m) => m.id === moduleId);
if (!mod) return;
setActiveTab('syllabus');
setActiveLevel(mod.level);
setSectionFilter('All');
setSelectedModuleId(mod.id);
setModuleSubTab('materi');
setHighlightedLine(null);
};

// Diagnostic Helpers
const handleDiagAnswer = (q, idx) => {
setDiagAnswers((prev) => ({ ...prev, [q.id]: idx }));
if (idx !== q.correctIndex) {
addToErrorLog({ ...q, moduleId: q.recommendedModule }, idx);
}
};

const finishDiagnostic = () => {
const correctCount = DIAGNOSTIC_QUESTIONS.filter(
(q) => diagAnswers[q.id] === q.correctIndex
).length;
const calcScore = Math.round(360 + (correctCount / DIAGNOSTIC_QUESTIONS.length) * 260);
setEstimatedScore(calcScore);
setDiagFinished(true);
};

// Listening Lab Helpers
const currentLab = LISTENING_LAB_ITEMS[labIndex];
const playLabAudio = () => {
const fullText = currentLab.lines.map((l) => l.text).join('. ');
setLabPlaying(true);
speakText(fullText, 'en-US', playbackRate, () => setLabPlaying(false));
};

// AI Dosen Logic
const pushDosenReply = (userText, replyText, lang = 'id-ID') => {
setDosenMessages((prev) => [
...prev,
{ role: 'user', text: userText },
{ role: 'assistant', text: replyText }
]);
if (voiceEnabled) {
speakText(replyText, lang, 1.0);
}
};

const handleExplainCurrentModule = () => {
const f = currentModule.formulas[0];
const reply = Baik, mari kita bedah modul ${currentModule.id}: ${currentModule.title}. Intinya: ${currentModule.summary} Rumus cepatnya adalah: ${f.formula}. Jangan lupa perhatikan kotak Jebakan Umum di bawah materi agar tidak tertipu di ujian!;
pushDosenReply(Jelaskan topik ${currentModule.id}, reply, 'id-ID');
};

const handleDosenSend = (customPrompt) => {
const query = (customPrompt || dosenInput).trim();
if (!query) return;
setDosenInput('');
const lower = query.toLowerCase();

let reply = '';
let lang = 'id-ID';

if (lower.includes('inversion') || lower.includes('inversi') || lower.includes('550')) {
  reply =
    'Untuk menembus skor 550+, kuasai 3 senjata utama: (1) Inversion saat kalimat diawali kata negatif seperti Rarely/Never/Not only (Auxiliary pindah ke depan Subject), (2) Reduced Clauses (V-ing aktif vs V3 pasif), dan (3) Contrary-to-Fact Conditionals di Listening (fakta selalu kebalikan dari pengandaian).';
} else if (lower.includes('part b') || lower.includes('error')) {
  reply =
    'Strategi Structure Part B (Error Recognition): Jangan baca seperti novel! Cek 4 hal secara berurutan: (1) Subject-Verb agreement, (2) Word Form (Noun/Adj/Adv, misal "-ly" sebelum Adjective), (3) Parallelism (and/or/neither...nor), dan (4) Singular/Plural (a/an/much/many).';
} else if (lower.includes('reading') || lower.includes('baca')) {
  reply =
    'Di Reading TOEFL, jangan pernah menerjemahkan semua kata! Baca kalimat pertama tiap paragraf untuk Main Idea, lalu gunakan teknik Scanning kata kunci soal. Di aplikasi ini, klik tombol "Sorot Bukti di Teks" pada modul Reading untuk melatih matamu menemukan kalimat bukti dalam 5 detik.';
} else if (lower.includes('listening') || lower.includes('dengar')) {
  reply =
    'Trik emas Listening Part A: Fokus 80% konsentrasimu pada pembicara KEDUA. Hindari opsi yang bunyinya mirip dengan rekaman (Similar Sound Trap) dan selalu cari sinonim/parafrase. Coba latih telingamu di tab Lab Listening dengan kecepatan 1.15x!';
} else if (lower.includes('english') || lower.includes('tips')) {
  lang = 'en-US';
  reply =
    'To reach 550+ on the TOEFL ITP, accuracy in Structure is your fastest score booster! Always strip away prepositional phrases first to locate the true subject and main verb, and review your Error Log daily.';
} else {
  reply = `Pertanyaan bagus mengenai "${query}"! Saat ini kamu sedang berada di modul ${currentModule.id} (${currentModule.shortTitle}). Saran saya: pahami rumus utamanya, coba klik kalimat interaktif "Coret & Sorot", lalu kerjakan contoh soalnya. Jika ada jawaban salah, cek di tab Rumus & Error Log.`;
}

pushDosenReply(query, reply, lang);


};

const formatTime = (secs) => {
const m = Math.floor(secs / 60);
const s = secs % 60;
return ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')};
};

const filteredAwl = useMemo(() => {
if (!awlSearch.trim()) return AWL_VOCAB;
const q = awlSearch.toLowerCase();
return AWL_VOCAB.filter(
(item) =>
item.word.toLowerCase().includes(q) ||
item.synonym.toLowerCase().includes(q) ||
item.idMeaning.toLowerCase().includes(q)
);
}, [awlSearch]);

// ============================================================================
// RENDER
// ============================================================================

return (

{/* TOP HEADER */}









TOEFL 550 Academy


Target 550+



Silabus Lengkap 18 Modul • Coret & Sorot Interaktif • Lab Listening & Error Log




      <div className="flex flex-wrap items-center gap-2.5">
        {/* Score Badge */}
        <button
          onClick={() => setActiveTab('diagnostic')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-xs font-semibold text-slate-700 transition"
          title="Ambil Mini Diagnostic Test untuk mengukur skor"
        >
          <Target className="w-4 h-4 text-indigo-600" />
          {estimatedScore ? (
            <span>Est. Skor: <strong className="text-indigo-700">{estimatedScore}</strong>/550+</span>
          ) : (
            <span>Belum Tes • <strong className="text-indigo-700 underline">Cek Skor Awal</strong></span>
          )}
        </button>

        {/* Progress Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <Award className="w-4 h-4 text-emerald-600" />
          {completedModules.length}/18 Modul
        </div>

        {/* Translation Toggle */}
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            showTranslation
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          ID: {showTranslation ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>

    {/* MAIN NAVIGATION TABS */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
      <nav className="flex items-center gap-1 border-t border-slate-100 pt-1">
        {[
          { id: 'syllabus', label: 'Silabus 18 Modul', icon: BookOpen },
          { id: 'diagnostic', label: 'Diagnostic Test', icon: Target },
          { id: 'listening', label: 'Lab Listening', icon: Headphones },
          { id: 'simulation', label: 'Simulasi Timer', icon: Clock },
          {
            id: 'review',
            label: `Rumus, AWL & Error Log${errorLog.length > 0 ? ` (${errorLog.length})` : ''}`,
            icon: Layers
          }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                active
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  </header>

  {/* MAIN CONTENT AREA */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
    {/* DIAGNOSTIC BANNER IF NEW USER */}
    {!estimatedScore && activeTab === 'syllabus' && (
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Langkah Pertama
          </div>
          <h2 className="text-base sm:text-lg font-bold">
            Belum tahu mulai belajar dari modul mana?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-0.5">
            Ambil <strong>Mini Diagnostic Test (9 Soal Cepat)</strong> untuk mengetahui estimasi skor awalmu dan rekomendasi modul prioritas!
          </p>
        </div>
        <button
          onClick={() => setActiveTab('diagnostic')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition shadow-sm"
        >
          Mulai Tes 3 Menit <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )}

    {/* ==================================================================== */}
    {/* TAB 1: SILABUS 18 MODUL & MATERI INTERAKTIF */}
    {/* ==================================================================== */}
    {activeTab === 'syllabus' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: MODULE LIST */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Level Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
              Pilih Tingkat Kemahiran (Total 18 Modul)
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'basic', label: '1. Basic', count: '8 Modul' },
                { id: 'intermediate', label: '2. Interm.', count: '6 Modul' },
                { id: 'advance', label: '3. Adv 550+', count: '4 Modul' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setActiveLevel(lvl.id);
                    const firstInLvl = MODULES_DATA.find((m) => m.level === lvl.id);
                    if (firstInLvl) {
                      setSelectedModuleId(firstInLvl.id);
                      setHighlightedLine(null);
                    }
                  }}
                  className={`p-2 rounded-xl text-center transition border ${
                    activeLevel === lvl.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className={`text-[10px] ${activeLevel === lvl.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {lvl.count}
                  </div>
                </button>
              ))}
            </div>

            {/* Section Filter */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
              {['All', 'Structure', 'Listening', 'Reading'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    sectionFilter === sec
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sec === 'All' ? 'Semua' : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards */}
          <div className="space-y-2">
            {filteredModules.map((mod) => {
              const isSelected = mod.id === selectedModuleId;
              const isDone = completedModules.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setModuleSubTab('materi');
                    setHighlightedLine(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          mod.section === 'Structure'
                            ? 'bg-blue-100 text-blue-800'
                            : mod.section === 'Listening'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {mod.section} • {mod.id}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {mod.questions.length} Soal
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {mod.shortTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{mod.skill}</p>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  ) : (
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT MAIN LEARNING WORKSPACE */}
        <section className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            {/* Module Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {currentModule.skill}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {currentModule.section}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Topik {currentModule.id}: {currentModule.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {currentModule.summary}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsDosenOpen(true);
                  handleExplainCurrentModule();
                }}
                className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition border border-indigo-200"
              >
                <Volume2 className="w-4 h-4" /> Jelaskan via Prof. Arya
              </button>
            </div>

            {/* Sub-tabs: Materi & Rumus vs Latihan Soal */}
            <div className="flex items-center gap-2 mt-4 mb-5">
              <button
                onClick={() => setModuleSubTab('materi')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  moduleSubTab === 'materi'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                1. Materi, Rumus & Jebakan
              </button>
              <button
                onClick={() => setModuleSubTab('latihan')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  moduleSubTab === 'latihan'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                2. Latihan Contoh Soal ({currentModule.questions.length})
              </button>
            </div>

            {/* SUB-TAB 1: MATERI, RUMUS & JEBAKAN */}
            {moduleSubTab === 'materi' && (
              <div className="space-y-6">
                {currentModule.formulas.map((f, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
                    <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">{f.explanation}</p>
                    <div className="rounded-lg bg-slate-900 text-amber-300 font-mono text-xs sm:text-sm px-4 py-3 overflow-x-auto">
                      {f.formula}
                    </div>

                    {f.interactiveSentence && (
                      <InteractiveSentenceBreakdown
                        data={f.interactiveSentence}
                        showTranslation={showTranslation}
                      />
                    )}
                  </div>
                ))}

                {/* KOTAK JEBAKAN UMUM (SALAH VS BENAR) */}
                {currentModule.traps && currentModule.traps.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Jebakan Umum TOEFL (❌ Salah vs. ✅ Benar)
                    </div>
                    <div className="space-y-3">
                      {currentModule.traps.map((trap, i) => (
                        <div key={i} className="rounded-xl bg-white border border-amber-100 p-3.5 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs sm:text-sm text-rose-900">
                              <span className="font-bold block text-[11px] uppercase text-rose-600 mb-0.5">
                                ❌ Salah (Jebakan)
                              </span>
                              {trap.wrong}
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs sm:text-sm text-emerald-900">
                              <span className="font-bold block text-[11px] uppercase text-emerald-600 mb-0.5">
                                ✅ Benar
                              </span>
                              {trap.right}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">
                            <strong className="text-slate-800">Kenapa?</strong> {trap.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setModuleSubTab('latihan')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                  >
                    Lanjut Latihan Soal Topik Ini <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: LATIHAN SOAL (SPLIT SCREEN FOR READING!) */}
            {moduleSubTab === 'latihan' && (
              <div>
                {currentModule.readingPassage ? (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                    {/* LEFT PANE: READING PASSAGE WITH LINE NUMBERS */}
                    <div className="xl:col-span-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 xl:sticky xl:top-28">
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" /> Teks Bacaan (Split-Screen)
                        </span>
                        {highlightedLine !== null && (
                          <button
                            onClick={() => setHighlightedLine(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                          >
                            Hapus Sorotan
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 mb-3 text-base">
                        {currentModule.readingPassage.title}
                      </h4>
                      <div className="space-y-2.5 text-sm leading-relaxed text-slate-800">
                        {currentModule.readingPassage.lines.map((line, lIdx) => {
                          const isHighlighted = highlightedLine === lIdx;
                          return (
                            <div
                              key={lIdx}
                              className={`flex gap-3 p-2 rounded-lg transition-all ${
                                isHighlighted
                                  ? 'bg-amber-200/80 ring-2 ring-amber-400 font-medium text-slate-900'
                                  : ''
                              }`}
                            >
                              <span className="text-[11px] font-mono font-bold text-slate-400 select-none pt-0.5">
                                {String(lIdx + 1).padStart(2, '0')}
                              </span>
                              <p>{line}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* RIGHT PANE: READING QUESTIONS */}
                    <div className="xl:col-span-6 space-y-4">
                      {currentModule.questions.map((q) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          selectedAnswer={answersMap[q.id]}
                          onSelectAnswer={(optIdx) => handleModuleQuestionAnswer(q, optIdx)}
                          onHighlightEvidence={(lineIdx) => setHighlightedLine(lineIdx)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentModule.questions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        selectedAnswer={answersMap[q.id]}
                        onSelectAnswer={(optIdx) => handleModuleQuestionAnswer(q, optIdx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    )}

    {/* ==================================================================== */}
    {/* TAB 2: MINI DIAGNOSTIC TEST */}
    {/* ==================================================================== */}
    {activeTab === 'diagnostic' && (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Mini Diagnostic Test
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Pemetaan Skor Awal & Rekomendasi Modul
              </h2>
            </div>
            {diagFinished && (
              <button
                onClick={() => {
                  setDiagIndex(0);
                  setDiagAnswers({});
                  setDiagFinished(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ulangi Tes
              </button>
            )}
          </div>

          {!diagFinished ? (
            <div>
              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Soal {diagIndex + 1} dari {DIAGNOSTIC_QUESTIONS.length}</span>
                  <span>Section: {DIAGNOSTIC_QUESTIONS[diagIndex].section}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{
                      width: `${((diagIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {DIAGNOSTIC_QUESTIONS[diagIndex].miniPassage && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-sm text-slate-800 leading-relaxed">
                  <span className="block text-[11px] font-bold uppercase text-emerald-700 mb-1">
                    Bacaan Singkat:
                  </span>
                  {DIAGNOSTIC_QUESTIONS[diagIndex].miniPassage}
                </div>
              )}

              <QuestionCard
                question={{
                  ...DIAGNOSTIC_QUESTIONS[diagIndex],
                  type: `Diagnostic • ${DIAGNOSTIC_QUESTIONS[diagIndex].section}`
                }}
                selectedAnswer={diagAnswers[DIAGNOSTIC_QUESTIONS[diagIndex].id]}
                onSelectAnswer={(idx) =>
                  handleDiagAnswer(DIAGNOSTIC_QUESTIONS[diagIndex], idx)
                }
              />

              <div className="mt-5 flex justify-between items-center">
                <button
                  disabled={diagIndex === 0}
                  onClick={() => setDiagIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                {diagIndex < DIAGNOSTIC_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setDiagIndex((i) => i + 1)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-1.5"
                  >
                    Soal Berikutnya <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishDiagnostic}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5"
                  >
                    Lihat Hasil & Rekomendasi <Award className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                  Estimasi Skor TOEFL ITP Kamu
                </p>
                <div className="text-5xl font-black my-2">{estimatedScore}</div>
                <p className="text-sm text-indigo-100">
                  {estimatedScore >= 550
                    ? 'Luar biasa! Kamu sudah berada di zona 550+. Pertahankan dengan latihan Advance & Simulasi Timer.'
                    : estimatedScore >= 470
                    ? 'Fondasi bagus! Fokus perbaiki kelemahan di modul Intermediate & Advance untuk menembus 550+.'
                    : 'Jangan khawatir! Ikuti rekomendasi modul Basic di bawah ini secara bertahap.'}
                </p>
              </div>

              {/* Breakdown per Section */}
              <div className="grid grid-cols-3 gap-3">
                {['Structure', 'Listening', 'Reading'].map((sec) => {
                  const secQs = DIAGNOSTIC_QUESTIONS.filter((q) => q.section === sec);
                  const right = secQs.filter((q) => diagAnswers[q.id] === q.correctIndex).length;
                  return (
                    <div key={sec} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">{sec}</div>
                      <div className="text-2xl font-extrabold text-slate-900 mt-1">
                        {right}/{secQs.length}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Weak Modules */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Rekomendasi Modul Prioritas Untukmu:
                </h3>
                <div className="space-y-2">
                  {DIAGNOSTIC_QUESTIONS.filter((q) => diagAnswers[q.id] !== q.correctIndex).length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium">
                      Semua soal Diagnostic benar! Langsung tantang dirimu di Modul Level 3 (Advance 550+).
                    </div>
                  ) : (
                    DIAGNOSTIC_QUESTIONS.filter((q) => diagAnswers[q.id] !== q.correctIndex).map((q) => {
                      const mod = MODULES_DATA.find((m) => m.id === q.recommendedModule);
                      return (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-bold text-rose-700">
                              Perlu Diperkuat • {mod?.section} ({mod?.id})
                            </span>
                            <p className="text-sm font-bold text-slate-900">{mod?.title}</p>
                          </div>
                          <button
                            onClick={() => jumpToModule(q.recommendedModule)}
                            className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                          >
                            Pelajari Modul Ini →
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* TAB 3: LAB LISTENING (SPEED CONTROLS + TRANSCRIPT TOGGLE) */}
    {/* ==================================================================== */}
    {activeTab === 'listening' && (
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-2">
          <h2 className="text-sm font-bold text-slate-700 px-1 mb-2">
            Pilih Sesi Lab Listening
          </h2>
          {LISTENING_LAB_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setLabIndex(idx);
                setShowTranscript(false);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition ${
                labIndex === idx
                  ? 'bg-purple-50 border-purple-400 ring-1 ring-purple-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-purple-700">{item.part}</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</div>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {item.difficulty}
              </span>
            </button>
          ))}
        </div>

        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-purple-700">{currentLab.part}</span>
              <h3 className="text-lg font-extrabold text-slate-900">{currentLab.title}</h3>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <Sliders className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
              {[0.85, 1.0, 1.15].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    playbackRate === speed
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Audio Player Box */}
          <div className="rounded-xl bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={playLabAudio}
                className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center transition shadow-lg shrink-0"
              >
                <Play className="w-5 h-5 ml-0.5" />
              </button>
              <div>
                <div className="text-sm font-bold">
                  {labPlaying ? 'Sedang Memutar Audio...' : 'Klik Play untuk Mendengarkan'}
                </div>
                <div className="text-xs text-slate-400">
                  Kecepatan aktif: {playbackRate}x • Bahasa Inggris (Native TTS)
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
            >
              {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showTranscript ? 'Sembunyikan Transkrip' : 'Lihat Transkrip'}
            </button>
          </div>

          {showTranscript && (
            <div className="rounded-xl bg-purple-50/70 border border-purple-200 p-4 space-y-2 text-sm text-slate-800">
              {currentLab.lines.map((line, i) => (
                <p key={i}>
                  <strong className="text-purple-900">{line.speaker}:</strong> {line.text}
                </p>
              ))}
            </div>
          )}

          <QuestionCard
            question={{
              id: currentLab.id,
              type: currentLab.part,
              difficulty: currentLab.difficulty,
              prompt: currentLab.question,
              options: currentLab.options,
              correctIndex: currentLab.correctIndex,
              explanation: currentLab.explanation
            }}
            showAudioButton={false}
            selectedAnswer={labAnswers[currentLab.id]}
            onSelectAnswer={(optIdx) => {
              setLabAnswers((prev) => ({ ...prev, [currentLab.id]: optIdx }));
              if (optIdx !== currentLab.correctIndex) {
                addToErrorLog(
                  {
                    id: currentLab.id,
                    prompt: currentLab.question,
                    options: currentLab.options,
                    correctIndex: currentLab.correctIndex,
                    explanation: currentLab.explanation,
                    moduleId: 'L-3.1',
                    section: 'Listening'
                  },
                  optIdx
                );
              }
            }}
          />
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* TAB 4: SIMULASI TIMER */}
    {/* ==================================================================== */}
    {activeTab === 'simulation' && (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {!simStarted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Simulasi Cepat Berbatas Waktu (5 Menit)
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Uji ketahanan fokus dan kecepatanmu dengan 8 soal campuran Structure (Part A & B) dan Reading level 550+. Setiap jawaban salah otomatis masuk ke <strong>Error Log</strong>.
              </p>
              <button
                onClick={() => {
                  setSimStarted(true);
                  setSimFinished(false);
                  setSimSecondsLeft(300);
                  setSimAnswers({});
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
              >
                Mulai Simulasi Sekarang
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5 sticky top-28 bg-white py-2 z-10">
                <div>
                  <h3 className="font-bold text-slate-900">Mini Simulasi TOEFL 550+</h3>
                  <p className="text-xs text-slate-500">
                    Terjawab: {Object.keys(simAnswers).length} / 8 Soal
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-sm px-3 py-1.5 rounded-xl border ${
                      simSecondsLeft < 60
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    ⏱ {formatTime(simSecondsLeft)}
                  </span>
                  {!simFinished && (
                    <button
                      onClick={() => setSimFinished(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      Selesai & Nilai
                    </button>
                  )}
                </div>
              </div>

              {simFinished && (
                <div className="mb-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-indigo-700">Hasil Simulasi</span>
                    <h4 className="text-2xl font-black text-slate-900">
                      Benar:{' '}
                      {
                        allQuestionsPool
                          .slice(0, 8)
                          .filter((q) => simAnswers[q.id] === q.correctIndex).length
                      }{' '}
                      / 8
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Soal yang salah sudah dicatat otomatis di tab Rumus & Error Log.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSimStarted(false);
                      setSimFinished(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100"
                  >
                    Ulangi Simulasi
                  </button>
                </div>
              )}

              <div className="space-y-5">
                {allQuestionsPool.slice(0, 8).map((q, idx) => (
                  <div key={q.id}>
                    <div className="text-xs font-bold text-slate-500 mb-1.5">
                      Nomor {idx + 1} • {q.section} ({q.moduleId})
                    </div>
                    <QuestionCard
                      question={q}
                      selectedAnswer={simAnswers[q.id]}
                      onSelectAnswer={(optIdx) => {
                        setSimAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                        if (optIdx !== q.correctIndex) {
                          addToErrorLog(q, optIdx);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* TAB 5: RUMUS CEPAT, ACADEMIC WORD LIST & ERROR LOG */}
    {/* ==================================================================== */}
    {activeTab === 'review' && (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'errorlog', label: `Error Log Pribadi (${errorLog.length})` },
            { id: 'formulas', label: 'Bank Rumus Cepat 18 Modul' },
            { id: 'awl', label: 'Academic Word List (AWL 550+)' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setReviewSubTab(st.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                reviewSubTab === st.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* SUBTAB: ERROR LOG */}
        {reviewSubTab === 'errorlog' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Error Log (Bank Kesalahan Pribadi)
                </h2>
                <p className="text-xs text-slate-500">
                  Tersimpan otomatis di browser kamu. Pelajari ulang kesalahanmu sebelum hari H ujian!
                </p>
              </div>
              {errorLog.length > 0 && (
                <button
                  onClick={() => setErrorLog([])}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bersihkan Semua
                </button>
              )}
            </div>

            {errorLog.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Belum ada catatan kesalahan!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Kerjakan soal di Silabus, Diagnostic Test, atau Simulasi. Jika ada yang salah, otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {errorLog.map((item) => (
                  <div key={item.id} className="rounded-xl border border-rose-200 bg-rose-50/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {item.section} • Modul {item.moduleId}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => jumpToModule(item.moduleId)}
                          className="text-xs font-bold text-indigo-700 hover:underline"
                        >
                          Buka Modul {item.moduleId}
                        </button>
                        <button
                          onClick={() => removeFromErrorLog(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        >
                          <Check className="w-3.5 h-3.5" /> Sudah Paham
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">{item.prompt}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                      <div className="p-2 rounded-lg bg-rose-100/70 text-rose-900">
                        <strong>Jawabanmu dulu:</strong> {item.options[item.userWrongIndex]}
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-900">
                        <strong>Jawaban Benar:</strong> {item.options[item.correctIndex]}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>Pembahasan:</strong> {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB: BANK RUMUS CEPAT */}
        {reviewSubTab === 'formulas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES_DATA.map((mod) => (
              <div key={mod.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700">
                    {mod.id} • {mod.section}
                  </span>
                  <button
                    onClick={() => jumpToModule(mod.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-700"
                  >
                    Buka →
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{mod.shortTitle}</h3>
                {mod.formulas.map((f, i) => (
                  <div key={i} className="rounded-lg bg-slate-900 text-amber-300 font-mono text-xs p-2.5 mt-1.5">
                    {f.formula}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB: ACADEMIC WORD LIST */}
        {reviewSubTab === 'awl' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Academic Word List (AWL) — Wajib Hafal 550+
                </h2>
                <p className="text-xs text-slate-500">
                  Kosakata akademik paling sering keluar di soal Vocabulary in Context Reading TOEFL.
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={awlSearch}
                  onChange={(e) => setAwlSearch(e.target.value)}
                  placeholder="Cari kosakata / sinonim..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAwl.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-extrabold text-indigo-800">{item.word}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {item.idMeaning}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1.5">
                    Sinonim TOEFL: {item.synonym}
                  </p>
                  <p className="text-xs text-slate-600 italic">"{item.example}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </main>

  {/* ==================================================================== */}
  {/* FLOATING AI DOSEN PEMBIMBING (PROF. ARYA PRATAMA, M.ED.) */}
  {/* ==================================================================== */}
  <div className="fixed bottom-5 right-5 z-40">
    {!isDosenOpen ? (
      <button
        onClick={() => setIsDosenOpen(true)}
        className="flex items-center gap-3 bg-slate-900 hover:bg-indigo-700 text-white pl-3.5 pr-4 py-3 rounded-full shadow-xl transition-all group"
      >
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center relative">
          <MessageSquare className="w-5 h-5" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-900"></span>
        </div>
        <div className="text-left">
          <div className="text-xs font-bold leading-tight">Prof. Arya Pratama</div>
          <div className="text-[10px] text-slate-300">AI Dosen • Tanya / Jelaskan</div>
        </div>
      </button>
    ) : (
      <div className="w-[340px] sm:w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[540px]">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
              AP
            </div>
            <div>
              <h4 className="text-sm font-bold leading-tight">Prof. Arya Pratama, M.Ed.</h4>
              <p className="text-[11px] text-emerald-400">AI Dosen Bilingual (ID / EN)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setVoiceEnabled(!voiceEnabled);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
              title={voiceEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={() => setIsDosenOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
          <button
            onClick={handleExplainCurrentModule}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
          >
            Jelaskan {currentModule.id}
          </button>
          <button
            onClick={() => handleDosenSend('Trik cepat 550+ dan Inversion')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Trik 550+
          </button>
          <button
            onClick={() => handleDosenSend('Strategi Part B Error Recognition')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Part B
          </button>
          <button
            onClick={() => handleDosenSend('Tips English')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Tips EN
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50 min-h-[220px]">
          {dosenMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDosenSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={dosenInput}
            onChange={(e) => setDosenInput(e.target.value)}
            placeholder="Tanya rumus, Part B, Reading, Listening..."
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    )}
  </div>
</div>


);
}
