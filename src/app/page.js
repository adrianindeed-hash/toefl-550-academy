"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Play,
  Square,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Layers,
  Target,
  Lightbulb,
  Menu,
  X,
  Eye,
  EyeOff,
  Sliders,
  ArrowRight,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Gamepad2,
  Timer,
  Headphones,
  Bookmark,
  BookmarkCheck,
  Award,
  Flame,
  Zap,
  Trophy,
  HelpCircle,
  BarChart3,
  RefreshCw,
  Globe
} from 'lucide-react';

// ============================================================================
// 1. SAFE RUNTIME, STORAGE & NATURAL VOICE HELPERS
// ============================================================================
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const STORAGE_KEY = 'toefl_550_general_academy_v4';

function getSafeGeminiApiKey() {
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return String(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      }
      if (process.env.GEMINI_API_KEY) {
        return String(process.env.GEMINI_API_KEY);
      }
    }
  } catch {
    // Ignore restricted environment access
  }
  return '';
}

function getSpeechSynthesisSafe() {
  if (!isBrowser || !('speechSynthesis' in window)) {
    return null;
  }
  return window.speechSynthesis;
}

function getSpeechRecognitionConstructor() {
  if (!isBrowser) return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function sanitizeSpeechText(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/\*\*/g, '')
    .replace(/[`#]/g, '')
    .replace(/→/g, ' menjadi ')
    .replace(/≠/g, ' tidak sama dengan ')
    .replace(/\|\|/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deteksi Otomatis Bahasa Teks (Indonesia vs Inggris)
 */
function detectLanguageSmart(text) {
  const clean = String(text || '').toLowerCase();
  if (!clean.trim()) return 'id-ID';

  const idWords = [
    'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'adalah', 'ini', 'itu',
    'tidak', 'bukan', 'jika', 'maka', 'karena', 'sehingga', 'pada', 'dalam',
    'kata', 'kalimat', 'subjek', 'kerja', 'jawaban', 'benar', 'salah', 'selalu',
    'wajib', 'jangan', 'harus', 'seperti', 'atau', 'oleh', 'saat', 'ketika',
    'soal', 'opsi', 'rumus', 'jebakan', 'strategi', 'menurut', 'materi', 'contoh'
  ];

  const enWords = [
    'the', 'of', 'and', 'to', 'in', 'is', 'are', 'was', 'were', 'that', 'for',
    'with', 'as', 'by', 'on', 'at', 'from', 'which', 'who', 'whose', 'although',
    'because', 'while', 'when', 'where', 'have', 'has', 'had', 'been', 'being',
    'would', 'could', 'should', 'their', 'they', 'there', 'than', 'most', 'more',
    'patterns', 'butterflies', 'studied', 'extensively', 'laboratory', 'instruments'
  ];

  const tokens = clean.match(/[a-z]+/g) || [];
  if (tokens.length === 0) return 'id-ID';

  let idScore = 0;
  let enScore = 0;

  for (const tok of tokens) {
    if (idWords.includes(tok)) idScore += 1.35;
    if (enWords.includes(tok)) enScore += 1.05;
  }

  return enScore > idScore ? 'en-US' : 'id-ID';
}

/**
 * Memecah teks campuran (Indonesia + kutipan Inggris) menjadi segmen-segmen bahasa
 * sehingga pembicara AI otomatis berganti aksen Indonesia dan Inggris secara fleksibel!
 */
function splitMixedLanguageSegments(text) {
  const clean = sanitizeSpeechText(text);
  if (!clean) return [];

  const rawParts = clean.match(/("[^"]+"|[^.!?;]+[.!?;]*)/g) || [clean];
  const segments = [];

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const inner = trimmed.slice(1, -1).trim();
      if (inner) {
        segments.push({ text: inner, lang: detectLanguageSmart(inner) });
      }
      continue;
    }

    const subParts = trimmed.split(/([,:])/).reduce((acc, cur) => {
      if (cur === ',' || cur === ':') {
        if (acc.length > 0) acc[acc.length - 1] += cur;
      } else if (cur.trim()) {
        acc.push(cur.trim());
      }
      return acc;
    }, []);

    for (const sub of subParts) {
      const lang = detectLanguageSmart(sub);
      const prev = segments[segments.length - 1];
      if (prev && prev.lang === lang && prev.text.length < 130) {
        prev.text = `${prev.text} ${sub}`;
      } else {
        segments.push({ text: sub, lang });
      }
    }
  }

  return segments;
}

/**
 * Memilih suara paling alami (Neural / Natural / Google / Microsoft) untuk bahasa tertentu
 */
function pickMostNaturalVoice(voices, targetLang) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const isEn = String(targetLang).toLowerCase().startsWith('en');

  const langFiltered = voices.filter((v) => {
    const l = String(v.lang || '').toLowerCase();
    return isEn ? l.startsWith('en') : l.startsWith('id');
  });

  const pool = langFiltered.length > 0 ? langFiltered : voices;

  const scoreVoice = (v) => {
    const name = String(v.name || '').toLowerCase();
    const lang = String(v.lang || '').toLowerCase();
    let s = 0;
    if (name.includes('natural')) s += 45;
    if (name.includes('neural')) s += 40;
    if (name.includes('online')) s += 20;
    if (name.includes('google')) s += 28;
    if (name.includes('gadis') || name.includes('ardi')) s += 30;
    if (name.includes('aria') || name.includes('jenny') || name.includes('guy') || name.includes('andrew')) s += 30;
    if (name.includes('samantha') || name.includes('daniel') || name.includes('karen')) s += 22;
    if (isEn && lang === 'en-us') s += 16;
    if (!isEn && lang === 'id-id') s += 16;
    if (v.localService === false) s += 10;
    return s;
  };

  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

function loadSavedProgress() {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        userAnswers:
          parsed.userAnswers && typeof parsed.userAnswers === 'object'
            ? parsed.userAnswers
            : {},
        completedTopics:
          parsed.completedTopics && typeof parsed.completedTopics === 'object'
            ? parsed.completedTopics
            : {},
        bookmarkedIds: Array.isArray(parsed.bookmarkedIds)
          ? parsed.bookmarkedIds
          : [],
        streakCount:
          typeof parsed.streakCount === 'number' ? parsed.streakCount : 1,
        gameHighScore:
          typeof parsed.gameHighScore === 'number' ? parsed.gameHighScore : 0,
        vocabHighScore:
          typeof parsed.vocabHighScore === 'number' ? parsed.vocabHighScore : 0,
        listeningScore:
          typeof parsed.listeningScore === 'number' ? parsed.listeningScore : 0,
        studentName:
          typeof parsed.studentName === 'string'
            ? parsed.studentName
            : 'Calon Peraih 550+',
        selectedLevel:
          typeof parsed.selectedLevel === 'string' ? parsed.selectedLevel : 'Basic',
        selectedTopicId:
          typeof parsed.selectedTopicId === 'string'
            ? parsed.selectedTopicId
            : 'basic-listen-1'
      };
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

// ============================================================================
// 2. STRUCTURED SYLLABUS PER LEVEL (LISTENING, STRUCTURE, READING)
// ============================================================================
const CURRICULUM = [
  // ======================= LEVEL 1: BASIC =======================
  {
    id: 'basic-listen-1',
    level: 'Basic',
    levelNum: 1,
    section: 'Listening',
    code: 'L-1.1',
    moduleRef: 'Listening Skill 1–3',
    title: 'Listening Basic: Focus on the Last Line & Synonyms',
    shortTitle: 'Last Line & Synonyms',
    category: 'Listening Comprehension (Part A)',
    passage: {
      title: 'Mini Audio Drill: Short Dialogue Practice',
      text: `(Man): Billy really made a big mistake this time.\n(Woman): Yes, he forgot to turn in his research paper.\n(Narrator): What does the woman say about Billy?`,
      translationId: `(Pria): Billy benar-benar membuat kesalahan besar kali ini.\n(Wanita): Ya, dia lupa mengumpulkan makalah penelitiannya.\n(Narator): Apa yang dikatakan wanita itu tentang Billy?`
    },
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Strategi Baris Kedua (Focus on the Last Line)',
        bodyId:
          'Dalam Listening Part A (Short Dialogues), jawaban hampir selalu terkandung di baris terakhir yang diucapkan pembicara kedua. Dengarkan kata kunci pada baris kedua, lalu pilih opsi jawaban yang menggunakan sinonim (persamaan kata) dan hindari kata-kata yang terdengar mirip secara bunyi (similar sounds).',
        voiceText:
          'Dalam Listening Part A, fokuslah pada kalimat pembicara kedua. Temukan kata kuncinya, lalu pilih jawaban yang menggunakan sinonim, seperti "forgot to turn in" yang bermakna "did not submit".',
        englishRule:
          'Second Speaker Line → Cari Sinonim (Synonyms) → Hindari Bunyi Mirip (Similar Sounds)',
        examples: [
          {
            en: 'Woman: "Yes, he forgot to turn in his research paper." → Answer: He did not submit his assignment.',
            id: 'Kata kunci "forgot to turn in" (lupa mengumpulkan) bersinonim dengan "did not submit".',
            highlight: 'turn in = submit (mengumpulkan tugas)'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'bl1-q1',
        level: 'Basic',
        section: 'Listening',
        skillTag: 'Listening: Last Line & Synonyms',
        type: 'Listening Comprehension',
        prompt:
          'Audio Dialogue — Man: "How was your trip to the mountains?" | Woman: "We couldn’t have asked for better weather." | Question: What does the woman mean?',
        translationId:
          'Dialog Audio — Pria: "Bagaimana perjalananmu ke pegunungan?" | Wanita: "Kami tidak mungkin mengharapkan cuaca yang lebih baik dari itu." | Pertanyaan: Apa maksud wanita tersebut?',
        hintId:
          'Ungkapan "couldn’t have asked for better weather" adalah pujian bahwa cuacanya sangat bagus!',
        options: [
          { key: 'A', text: 'The weather was ideal during their trip.' },
          { key: 'B', text: 'They forgot to check the weather forecast.' },
          { key: 'C', text: 'The trip was canceled due to heavy rain.' },
          { key: 'D', text: 'They asked someone to improve the weather.' }
        ],
        correctKey: 'A',
        breakdown: {
          subject: 'Key Idiom: "couldn’t have asked for better weather"',
          verb: 'Makna: Cuacanya sudah paling sempurna / ideal',
          trap: 'Opsi D menjebak dengan mengulang kata "asked"'
        },
        optionAnalysis: {
          A: 'BENAR: "The weather was ideal" adalah sinonim yang tepat untuk "couldn’t have asked for better weather".',
          B: 'Salah: Tidak ada pembahasan prakiraan cuaca.',
          C: 'Salah: Perjalanan tetap berlangsung dengan cuaca sangat cerah.',
          D: 'Salah: Jebakan pengulangan kata "asked".'
        },
        formula: 'Couldn’t have asked for better [X] = [X] was wonderful / ideal.',
        voiceWalkthrough:
          'Jawabannya A. Ungkapan "couldn’t have asked for better weather" berarti cuacanya sudah sangat sempurna atau ideal.'
      }
    ]
  },

  {
    id: 'basic-struct-1',
    level: 'Basic',
    levelNum: 1,
    section: 'Structure',
    code: 'S-1.1',
    moduleRef: 'Structure Skill 1–5',
    title: 'Structure Basic: Subject-Verb Agreement, Prepositions & Appositives',
    shortTitle: 'S-V, Preposisi & Appositive',
    category: 'Structure & Written Expression',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Waspadai Objek Preposisi & Appositives',
        bodyId:
          'Dalam TOEFL Structure, kata benda setelah preposisi (in, on, at, of, with, from, by) adalah Object of Preposition dan TIDAK PERNAH menjadi Subject. Begitu pula frasa kata benda yang diapit dua koma (Appositive) hanyalah penjelas subjek. Coret keduanya agar True Subject dan Main Verb terlihat jelas!',
        voiceText:
          'Coret frasa preposisi seperti "of monarch butterflies" dan frasa appositive yang diapit koma agar True Subject terlihat jelas.',
        englishRule:
          '[True Subject] + (Prepositional Phrase = CORET) + , [Appositive = CORET] , + [Main Verb]',
        examples: [
          {
            en: 'The quality (of the newly imported microchips) is exceptionally high.',
            id: 'Kualitas dari mikrocip yang baru diimpor itu sangat tinggi. (Subjek asli = The quality [tunggal]).',
            highlight: 'True Subject: The quality (Tunggal) → Verb: is'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'bs1-q1',
        level: 'Basic',
        section: 'Structure',
        skillTag: 'Subject-Verb Agreement',
        type: 'Structure',
        prompt:
          'The migration patterns of monarch butterflies _______ studied extensively by entomologists across North America.',
        translationId:
          'Pola migrasi kupu-kupu raja _______ dipelajari secara luas oleh para ahli serangga di seluruh Amerika Utara.',
        hintId:
          'Coret frasa preposisi "of monarch butterflies". Subjek aslinya adalah "patterns" (jamak).',
        options: [
          { key: 'A', text: 'has been' },
          { key: 'B', text: 'have been' },
          { key: 'C', text: 'is being' },
          { key: 'D', text: 'was' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'The migration patterns (Plural / Jamak)',
          verb: 'have been studied (Plural Passive Verb)',
          trap: 'of monarch butterflies (Object of Preposition — abaikan!)'
        },
        optionAnalysis: {
          A: 'Salah: "has been" adalah bentuk tunggal.',
          B: 'BENAR: Subjek utamanya "patterns" (jamak), membutuhkan "have been".',
          C: 'Salah: "is being" adalah bentuk tunggal.',
          D: 'Salah: "was" adalah bentuk lampau tunggal.'
        },
        formula: 'Coret "of monarch butterflies" → patterns [Jamak] + have been.',
        voiceWalkthrough:
          'Jawabannya B, "have been". Subjek utama kalimat ini adalah "The migration patterns" yang jamak.'
      },
      {
        id: 'bs1-q2',
        level: 'Basic',
        section: 'Structure',
        skillTag: 'Indefinite Pronouns (Each / Every)',
        type: 'Structure',
        prompt:
          'Each of the laboratory instruments _______ calibrated before the final experiment begins.',
        translationId:
          'Masing-masing instrumen laboratorium _______ dikalibrasi sebelum eksperimen akhir dimulai.',
        hintId: 'Kata "Each" sebelum "of the..." selalu dihitung tunggal.',
        options: [
          { key: 'A', text: 'are' },
          { key: 'B', text: 'were' },
          { key: 'C', text: 'is' },
          { key: 'D', text: 'have been' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'Each (Indefinite Pronoun — selalu Singular)',
          verb: 'is calibrated (Singular Passive Verb)',
          trap: 'of the laboratory instruments (Pengecoh kata benda jamak)'
        },
        optionAnalysis: {
          A: 'Salah: "are" untuk subjek jamak.',
          B: 'Salah: "were" untuk subjek jamak lampau.',
          C: 'BENAR: "Each" selalu dihitung tunggal (singular), pasangannya "is".',
          D: 'Salah: "have been" bentuk jamak.'
        },
        formula: 'Each / Every + of + Plural Noun → Singular Verb (is / was / has).',
        voiceWalkthrough:
          'Jawabannya C, "is". Subjek aslinya adalah "Each" yang selalu dihitung tunggal.'
      }
    ]
  },

  {
    id: 'basic-read-1',
    level: 'Basic',
    levelNum: 1,
    section: 'Reading',
    code: 'R-1.1',
    moduleRef: 'Reading Skill 1–3',
    title: 'Reading Basic: Main Idea, Stated Details & Pronoun Referents',
    shortTitle: 'Main Idea & Stated Details',
    category: 'Reading Comprehension',
    passage: {
      title: 'Bioluminescence in the Deep Ocean',
      text: `In the pitch-black depths of the ocean, where sunlight cannot penetrate beyond 200 meters, roughly 76 percent of marine organisms produce their own light through a chemical process called bioluminescence. Unlike ordinary light bulbs that generate significant heat, bioluminescent light is "cold light," meaning less than 20 percent of the energy emits thermal radiation. This remarkable adaptation serves multiple survival functions in an otherwise barren environment.\n\nFor instance, the deep-sea anglerfish dangles a glowing lure in front of its mouth to entice unsuspecting prey within striking distance. Conversely, certain species of squid eject a cloud of luminous fluid to startle and confuse approaching predators, allowing the squid to escape into the darkness. Still other organisms, such as lanternfish, use rows of light-producing organs along their bellies to camouflage themselves against the faint light filtering down from above.`,
      translationId: `Di kedalaman samudra yang gelap gulita, di mana sinar matahari tidak dapat menembus lebih dari 200 meter, sekitar 76 persen organisme laut menghasilkan cahayanya sendiri melalui proses kimia yang disebut bioluminesensi. Tidak seperti bola lampu biasa yang menghasilkan panas signifikan, cahaya bioluminesensi adalah "cahaya dingin," yang berarti kurang dari 20 persen energinya memancarkan radiasi termal. Adaptasi luar biasa ini memiliki berbagai fungsi bertahan hidup di lingkungan yang tandus.\n\nSebagai contoh, ikan anglerfish laut dalam menggantungkan umpan bercahaya di depan mulutnya untuk memikat mangsa yang tidak curiga agar mendekat dalam jarak serang. Sebaliknya, spesies cumi-cumi tertentu menyemprotkan awan cairan bercahaya untuk mengejutkan dan membingungkan predator yang mendekat, memungkinkan cumi-cumi itu melarikan diri ke dalam kegelapan. Organisme lainnya lagi, seperti ikan lentera, menggunakan deretan organ penghasil cahaya di sepanjang perutnya untuk menyamarkan diri terhadap cahaya redup yang menyaring turun dari atas.`
    },
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Menemukan Ide Utama (Main Idea) & Detail Tersurat',
        bodyId:
          'Jawaban pertanyaan "What is the main topic/idea?" ditemukan dengan menggabungkan kalimat pertama dari setiap paragraf (Topic Sentences). Untuk soal Stated Detail ("According to the passage..."), pindai kata kunci pertanyaan lalu baca 1 kalimat utuh di sekitar kata kunci tersebut.',
        voiceText:
          'Untuk soal Main Idea, gabungkan kalimat pertama dari setiap paragraf. Hindari pilihan jawaban yang terlalu sempit atau hanya menyebut satu contoh kecil.',
        englishRule:
          'Main Idea = Topic Sentence Paragraf 1 + Topic Sentence Paragraf 2',
        examples: [
          {
            en: 'Paragraf 1 membahas sifat "cold light" bioluminescence, sedangkan Paragraf 2 memberi contoh fungsi bertahan hidup pada anglerfish, squid, dan lanternfish.',
            id: 'Gabungan keduanya menghasilkan ide utama yang utuh dan akurat.',
            highlight: 'Tolak opsi "Too Specific" & "Not Mentioned"'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'br1-q1',
        level: 'Basic',
        section: 'Reading',
        skillTag: 'Reading: Main Idea',
        type: 'Reading Comprehension',
        prompt: 'What is the main topic of the passage "Bioluminescence in the Deep Ocean"?',
        translationId: 'Apa topik utama dari bacaan "Bioluminescence in the Deep Ocean"?',
        hintId: 'Gabungkan ide utama paragraf 1 (sifat bioluminesensi) dan paragraf 2 (fungsi survival-nya).',
        options: [
          { key: 'A', text: 'How deep-sea anglerfish capture their prey' },
          { key: 'B', text: 'The efficiency of light bulbs compared to marine animals' },
          {
            key: 'C',
            text: 'The nature and survival functions of bioluminescence in deep-sea organisms'
          },
          { key: 'D', text: 'Why sunlight cannot reach beyond 200 meters in the ocean' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'Paragraf 1: Sifat bioluminescence | Paragraf 2: Contoh fungsi bertahan hidup',
          verb: 'Main Idea merangkum kedua paragraf',
          trap: 'Opsi A, B, D terlalu sempit (hanya detail kecil)'
        },
        optionAnalysis: {
          A: 'Salah (Too Narrow): Anglerfish hanya satu contoh.',
          B: 'Salah (Too Narrow): Bola lampu hanya perbandingan singkat.',
          C: 'BENAR: Merangkum sifat cahaya bioluminesensi dan fungsi bertahan hidupnya.',
          D: 'Salah (Too Narrow): Kedalaman 200 meter hanya latar belakang pembuka.'
        },
        formula: 'Main Idea = Ide Paragraf 1 + Ide Paragraf 2.',
        voiceWalkthrough:
          'Jawabannya C, karena opsi ini merangkum topik besar kedua paragraf secara menyeluruh.'
      }
    ]
  },

  // ==================== LEVEL 2: INTERMEDIATE ====================
  {
    id: 'inter-listen-1',
    level: 'Intermediate',
    levelNum: 2,
    section: 'Listening',
    code: 'L-2.1',
    moduleRef: 'Listening Skill 4–8',
    title: 'Listening Intermediate: Passive Restatements, Wishes & Two-Part Verbs',
    shortTitle: 'Passives, Wishes & Idioms',
    category: 'Listening Comprehension (Part A)',
    passage: {
      title: 'Mini Audio Drill: Implied Meaning & Idioms',
      text: `(Man): It is too bad that you have to stay here and work during the school break.\n(Woman): I really wish I could go with you and the others to Palm Springs.\n(Narrator): What does the woman mean?`,
      translationId: `(Pria): Sayang sekali kamu harus tinggal di sini dan bekerja selama libur sekolah.\n(Wanita): Aku benar-benar berharap aku bisa pergi bersamamu dan yang lainnya ke Palm Springs.\n(Narator): Apa maksud wanita tersebut?`
    },
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Kalimat Pengandaian (Wishes) & Frasa Kata Kerja (Two-Part Verbs)',
        bodyId:
          'Dalam Listening Part A tingkat menengah, pernyataan dengan kata "wish" selalu bermakna KENYATAAN YANG BERLAWANAN: "I wish I could go" berarti dia TIDAK BISA pergi. Selain itu, waspadai frasa kata kerja idiomatik seperti "called off" (dibatalkan) atau "put off" (ditunda).',
        voiceText:
          'Ingat aturan Listening Intermediate: kalimat yang memakai kata "wish" menyiratkan kenyataan yang berlawanan. Misalnya, "I wish I could go" berarti dia tidak bisa pergi.',
        englishRule:
          'I wish I could go → Reality: Unable to go  ||  called off = canceled  ||  put off = postponed',
        examples: [
          {
            en: 'Woman: "Didn’t you hear that the meeting was called off?" → Meaning: The meeting was canceled.',
            id: 'Ungkapan idiomatik "called off" berarti membatalkan acara.',
            highlight: 'Two-part verb: call off = cancel'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'il1-q1',
        level: 'Intermediate',
        section: 'Listening',
        skillTag: 'Listening: Wishes & Implied Meaning',
        type: 'Listening Comprehension',
        prompt:
          'Audio Dialogue — Man: "Are you going to Palm Springs with us?" | Woman: "I really wish I could go with you and the others." | Question: What does the woman mean?',
        translationId:
          'Dialog Audio — Pria: "Apakah kamu akan pergi ke Palm Springs bersama kami?" | Wanita: "Aku benar-benar berharap aku bisa pergi bersamamu dan yang lainnya." | Pertanyaan: Apa maksud wanita itu?',
        hintId: 'Pernyataan "wish + could" menunjukkan ketidakmampuan untuk ikut pada kenyataannya.',
        options: [
          { key: 'A', text: 'Maybe she will go with the others on the trip.' },
          { key: 'B', text: 'She is unable to go on the trip.' },
          { key: 'C', text: 'She is happy to be going on the trip.' },
          { key: 'D', text: 'She already went to Palm Springs earlier.' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Key Structure: "I really wish I could go"',
          verb: 'Implied Reality: She cannot go (unable to go)',
          trap: 'Jangan tertipu kata "go with you" secara harfiah'
        },
        optionAnalysis: {
          A: 'Salah: Dia tidak punya kemungkinan untuk ikut.',
          B: 'BENAR: "Wish I could go" menyiratkan bahwa dia tidak bisa ikut perjalanan tersebut.',
          C: 'Salah: Bertentangan dengan makna "wish".',
          D: 'Salah: Tidak disebutkan.'
        },
        formula: 'Wish + could + V1 → Unable to + V1.',
        voiceWalkthrough:
          'Jawabannya B. Ungkapan "I really wish I could go" menyiratkan kenyataan bahwa dia tidak bisa ikut pergi.'
      }
    ]
  },

  {
    id: 'inter-struct-1',
    level: 'Intermediate',
    levelNum: 2,
    section: 'Structure',
    code: 'S-2.1',
    moduleRef: 'Structure Skill 9–14',
    title: 'Structure Intermediate: Adjective/Noun Clauses, Parallel & Double Comparative',
    shortTitle: 'Clauses, Parallel & Comparative',
    category: 'Structure & Written Expression',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Aturan Koma Adjective Clause & Double Comparative',
        bodyId:
          'Jika terdapat tanda koma sebelum relative pronoun, DILARANG menggunakan "that"—wajib menggunakan "which" (untuk benda) atau "who/whom" (untuk orang). Selain itu, kuasai pola Double Comparative: "The + comparative (-er/more) + S + V, the + comparative (-er/more) + S + V".',
        voiceText:
          'Ingat dua aturan penting level Intermediate: setelah tanda koma wajib memakai "which" dan dilarang memakai "that". Kedua, pola Double Comparative selalu diawali "The" di kedua bagian kalimat.',
        englishRule:
          '[Noun] + , + WHICH + [Verb] (JANGAN ", that"!)  ||  The + [-er/more] ..., THE + [-er/more] ...',
        examples: [
          {
            en: 'Geothermal energy, which harnesses heat from beneath the Earth’s crust, provides reliable power.',
            id: 'Energi panas bumi, yang memanfaatkan panas dari bawah kerak Bumi, menyediakan daya yang andal.',
            highlight: 'Setelah koma wajib memakai "which"'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'is1-q1',
        level: 'Intermediate',
        section: 'Structure',
        skillTag: 'Non-Restrictive Which',
        type: 'Structure',
        prompt:
          'Geothermal energy, _______ harnesses heat from beneath the Earth’s crust, provides reliable baseload power.',
        translationId:
          'Energi panas bumi, yang memanfaatkan panas dari bawah kerak Bumi, menyediakan daya beban dasar yang andal.',
        hintId: 'Perhatikan tanda koma sebelum titik-titik! Kata "that" terlarang setelah koma.',
        options: [
          { key: 'A', text: 'that' },
          { key: 'B', text: 'which' },
          { key: 'C', text: 'what' },
          { key: 'D', text: 'it' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Main: Geothermal energy | Adj Clause: which',
          verb: 'Main: provides | Adj Clause: harnesses',
          trap: 'Aturan Koma: ", that" selalu salah!'
        },
        optionAnalysis: {
          A: 'Salah: "that" dilarang keras setelah tanda koma.',
          B: 'BENAR: "which" sah digunakan setelah tanda koma.',
          C: 'Salah: "what" tidak boleh didahului kata benda.',
          D: 'Salah: "it" bukan connector.'
        },
        formula: '[Noun] + , + WHICH + [Verb] + , + [Main Verb].',
        voiceWalkthrough:
          'Jawabannya B, "which". Setelah tanda koma, aturan mutlaknya adalah wajib memakai "which" dan dilarang memakai "that".'
      },
      {
        id: 'is1-q2',
        level: 'Intermediate',
        section: 'Structure',
        skillTag: 'Double Comparative',
        type: 'Structure',
        prompt:
          'The greater the population density in a metropolitan area, _______ the demand for efficient mass transit.',
        translationId:
          'Semakin besar kepadatan penduduk di wilayah metropolitan, _______ permintaan akan transportasi massal yang efisien.',
        hintId: 'Lihat pola awal kalimat: "The greater...". Pasangannya setelah koma wajib "the + comparative"!',
        options: [
          { key: 'A', text: 'the more urgent' },
          { key: 'B', text: 'more urgent' },
          { key: 'C', text: 'the most urgent' },
          { key: 'D', text: 'urgently' }
        ],
        correctKey: 'A',
        breakdown: {
          subject: 'Double Comparative Structure',
          verb: 'Elliptical linking verb ("is")',
          trap: 'Jangan pilih C ("the most urgent" = superlative) atau B (tanpa "the")!'
        },
        optionAnalysis: {
          A: 'BENAR: Memenuhi rumus Double Comparative: "The greater ..., the more urgent ...".',
          B: 'Salah: Kurang kata sandang wajib "the".',
          C: 'Salah: Menggunakan superlative ("most").',
          D: 'Salah: Berupa adverb tunggal.'
        },
        formula: 'The + [Comparative 1], THE + [Comparative 2].',
        voiceWalkthrough:
          'Jawabannya A, "the more urgent". Pola Double Comparative selalu memasangkan "The greater" dengan "the more urgent".'
      }
    ]
  },

  {
    id: 'inter-read-1',
    level: 'Intermediate',
    levelNum: 2,
    section: 'Reading',
    code: 'R-2.1',
    moduleRef: 'Reading Skill 4–7',
    title: 'Reading Intermediate: Vocabulary in Context & Unstated Details (NOT / EXCEPT)',
    shortTitle: 'Vocab Context & NOT/EXCEPT',
    category: 'Reading Comprehension',
    passage: {
      title: 'The Architecture of Ancient Roman Aqueducts',
      text: `To supply their sprawling cities with fresh water for public baths, fountains, and private households, Roman engineers constructed an extraordinary network of stone aqueducts. Contrary to popular belief, the vast majority of a Roman aqueduct system consisted not of towering arched bridges, but of subterranean channels carved through rock and lined with waterproof concrete. Only when crossing deep valleys or low-lying plains did engineers erect the iconic multi-tiered arcades.\n\nCrucially, aqueducts relied entirely on gravity rather than mechanical pumps. Engineers meticulously calculated a gentle, continuous downward gradient—often dropping just a few centimeters every hundred meters—to ensure water flowed steadily without stagnating or eroding the stone conduits.`,
      translationId: `Untuk memasok kota-kota mereka yang luas dengan air bersih bagi pemandian umum, air mancur, dan rumah tangga, insinyur Romawi membangun jaringan saluran air batu (akuaduk) yang luar biasa. Bertentangan dengan kepercayaan populer, sebagian besar sistem akuaduk Romawi tidak terdiri dari jembatan lengkung yang menjulang tinggi, melainkan saluran bawah tanah yang dipahat menembus batu dan dilapisi beton kedap air. Hanya ketika melintasi lembah yang dalam atau dataran rendah para insinyur mendirikan lengkungan bertingkat yang ikonik tersebut.\n\nYang paling penting, akuaduk bergantung sepenuhnya pada gravitasi alih-alih pompa mekanis. Para insinyur menghitung kemiringan menurun yang landai dan berkesinambungan dengan sangat teliti—sering kali turun hanya beberapa sentimeter setiap seratus meter—untuk memastikan air mengalir stabil tanpa menggenang atau mengikis saluran batu.`
    },
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Menebak Kosakata dari Konteks & Soal NOT / EXCEPT',
        bodyId:
          'Saat ditanya arti kata sulit seperti "subterranean" atau "meticulously", baca petunjuk kontras atau penjelas di kalimat yang sama ("not of towering arched bridges, but of subterranean channels" → berarti di bawah tanah / underground). Untuk soal "Which of the following is NOT mentioned?", eliminasi 3 opsi yang benar-benar ada di teks.',
        voiceText:
          'Gunakan petunjuk kontras dalam kalimat untuk menebak kosakata akademik. Kata "subterranean" dikontraskan dengan jembatan tinggi, sehingga artinya adalah bawah tanah atau "underground".',
        englishRule:
          'Kontras: "not towering bridges, but subterranean channels" → subterranean = underground',
        examples: [
          {
            en: 'Kata "meticulously" diikuti frasa "dropping just a few centimeters every hundred meters", yang menunjukkan ketelitian tinggi (carefully).',
            id: 'Konteks kalimat selalu memberi definisi terselubung bagi kosakata sulit.',
            highlight: 'meticulously = carefully / precisely'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'ir1-q1',
        level: 'Intermediate',
        section: 'Reading',
        skillTag: 'Reading: Vocabulary in Context',
        type: 'Reading Comprehension',
        prompt: 'The word "subterranean" in paragraph 1 is closest in meaning to:',
        translationId: 'Kata "subterranean" pada paragraf 1 memiliki makna paling dekat dengan:',
        hintId: 'Lihat kontrasnya di paragraf 1: bukan jembatan yang menjulang tinggi di atas, melainkan...',
        options: [
          { key: 'A', text: 'underground' },
          { key: 'B', text: 'elevated' },
          { key: 'C', text: 'temporary' },
          { key: 'D', text: 'decorative' }
        ],
        correctKey: 'A',
        breakdown: {
          subject: 'Clue: "not of towering arched bridges, but of subterranean channels"',
          verb: 'Prefix "sub-" = di bawah; "terra" = tanah/bumi',
          trap: 'Opsi B ("elevated") adalah lawan katanya'
        },
        optionAnalysis: {
          A: 'BENAR: "subterranean" berarti di bawah permukaan tanah ("underground").',
          B: 'Salah: "elevated" berarti tinggi/di atas.',
          C: 'Salah: Akuaduk Romawi dibangun permanen.',
          D: 'Salah: Tidak sesuai konteks.'
        },
        formula: 'Sub- (under) + terra (earth) = underground.',
        voiceWalkthrough:
          'Jawabannya A, "underground". Kata "subterranean" dikontraskan dengan jembatan tinggi di atas tanah.'
      }
    ]
  },

  // ===================== LEVEL 3: ADVANCE (550+) =====================
  {
    id: 'adv-listen-1',
    level: 'Advance',
    levelNum: 3,
    section: 'Listening',
    code: 'L-3.1',
    moduleRef: 'Listening Skill 18–27',
    title: 'Listening Advance (550+): Long Conversations & Academic Talks (Part B & C)',
    shortTitle: 'Part B & C Academic Talks',
    category: 'Listening Comprehension (550+)',
    passage: {
      title: 'Mini-Lecture Transcript: The Architecture of Termite Mounds (Part C)',
      text: `(Professor): Today in environmental biology, we are examining how African compass termites regulate internal temperatures without modern air conditioning. These insects construct towering clay mounds—sometimes reaching six meters high—aligned strictly along a north-south axis. Because the broad eastern and western faces absorb solar heat during the cooler morning and late afternoon hours, while only the narrow northern edge faces the intense midday sun, the interior nest remains remarkably stable at around 30 degrees Celsius.`,
      translationId: `(Profesor): Hari ini dalam biologi lingkungan, kita mengkaji bagaimana rayap kompas Afrika mengatur suhu internal tanpa penyejuk udara modern. Serangga ini membangun gundukan tanah liat menjulang—terkadang mencapai tinggi enam meter—yang disejajarkan secara ketat sepanjang poros utara-selatan. Karena sisi timur dan barat yang lebar menyerap panas matahari selama pagi yang lebih sejuk dan sore hari, sementara hanya tepi utara yang sempit menghadap matahari tengah hari yang terik, sarang bagian dalam tetap sangat stabil pada suhu sekitar 30 derajat Celcius.`
    },
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Strategi Antisipasi Pilihan & Urutan Jawaban Part B dan C',
        bodyId:
          'Dalam Listening Part B (Long Conversations) dan Part C (Academic Talks), jawaban dari 3–5 soal muncul SECARA BERURUTAN (in order) dari awal hingga akhir rekaman. Manfaatkan waktu jeda sebelum rekaman diputar untuk memindai pilihan jawaban A–D guna menebak topik kuliahnya.',
        voiceText:
          'Pada Listening Part B dan C, jawaban soal selalu muncul secara berurutan dari awal hingga akhir kuliah. Dengarkan baik-baik bagian tengah kuliah untuk menjawab detail mekanisme ilmiahnya.',
        englishRule:
          'Jawaban Soal 1 → Awal Rekaman  |  Soal 2 → Tengah Rekaman  |  Soal 3 → Akhir Rekaman',
        examples: [
          {
            en: 'North-south alignment allows broad eastern/western walls to catch morning/afternoon sun while minimizing midday heat.',
            id: 'Penjajaran utara-selatan menjaga suhu internal sarang tetap stabil di angka 30 derajat Celcius.',
            highlight: 'Termoregulasi Alami = Topik Utama Kuliah'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'al1-q1',
        level: 'Advance',
        section: 'Listening',
        skillTag: 'Listening: Academic Talk Detail',
        type: 'Listening Comprehension',
        prompt: 'Why do African compass termites align their mounds along a north-south axis?',
        translationId: 'Mengapa rayap kompas Afrika menyejajarkan gundukan mereka sepanjang poros utara-selatan?',
        hintId: 'Perhatikan bagian tengah kuliah profesor mengenai penyerapan panas pagi/sore vs tengah hari.',
        options: [
          { key: 'A', text: 'To protect the clay structure from strong seasonal winds' },
          { key: 'B', text: 'To maintain a stable internal temperature throughout the day' },
          { key: 'C', text: 'To prevent predators from locating the main entrance' },
          { key: 'D', text: 'To collect rainwater during dry desert months' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Topik Kuliah: Termoregulasi gundukan rayap kompas',
          verb: 'regulate internal temperatures / remains remarkably stable',
          trap: 'Opsi A, C, dan D tidak disebutkan dalam kuliah'
        },
        optionAnalysis: {
          A: 'Salah: Angin musiman tidak dibahas.',
          B: 'BENAR: Penjajaran utara-selatan menjaga suhu internal tetap stabil di sekitar 30 derajat Celcius.',
          C: 'Salah: Predator tidak dibahas.',
          D: 'Salah: Air hujan tidak dibahas.'
        },
        formula: 'North-south axis → Serap panas pagi/sore, hindari terik siang → Suhu stabil.',
        voiceWalkthrough:
          'Jawabannya B. Penjelasan profesor menunjukkan poros utara-selatan menjaga suhu internal sarang tetap stabil sepanjang hari.'
      }
    ]
  },

  {
    id: 'adv-struct-1',
    level: 'Advance',
    levelNum: 3,
    section: 'Structure',
    code: 'S-3.1',
    moduleRef: 'Structure Skill 13–19',
    title: 'Structure Advance (550+): Reduced Clauses & Subject-Verb Inversion',
    shortTitle: 'Reduced Clauses & Inversion',
    category: 'Structure & Written Expression (550+)',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Reduced Clauses (V-ing Aktif vs. V3 Pasif) & Negative/Conditional Inversion',
        bodyId:
          'Klausa sifat dan klausa keterangan dapat diringkas menjadi V-ing (aktif) atau V3 (pasif). Selain itu, ketika kalimat diawali ekspresi negatif (Not only, Rarely, Seldom, Never) atau pengandaian tanpa "If" (Were, Had, Should), posisi Auxiliary dan Subject wajib dibalik (Inversion)!',
        voiceText:
          'Untuk menembus skor 550+, kuasai dua senjata utama ini: ringkas klausa pasif menjadi V3 seperti "When heated", dan balik susunan subjek-verb saat kalimat diawali kata negatif seperti "Not only".',
        englishRule:
          'When + [V3 Pasif] + , + [Subject]  ||  Not only + [do/does/did] + [Subject] + [V1]  ||  Were + S + V3',
        examples: [
          {
            en: 'Not only do black holes trap light waves, but they also warp space-time.',
            id: 'Tidak hanya lubang hitam memerangkap gelombang cahaya, tetapi juga melengkungkan ruang-waktu.',
            highlight: 'Not only + do [Aux] + black holes [Subject] + trap [V1]'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'as1-q1',
        level: 'Advance',
        section: 'Structure',
        skillTag: 'Negative Inversion',
        type: 'Structure',
        prompt:
          'Not only _______ light waves, but black holes also warp the surrounding fabric of space-time.',
        translationId:
          'Tidak hanya _______ gelombang cahaya, tetapi lubang hitam juga melengkungkan struktur ruang-waktu di sekitarnya.',
        hintId: '"Not only" diletakkan di awal kalimat! Wajib inversi: Auxiliary + Subject + Verb.',
        options: [
          { key: 'A', text: 'black holes trap' },
          { key: 'B', text: 'do black holes trap' },
          { key: 'C', text: 'black holes do trap' },
          { key: 'D', text: 'trapping black holes' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'black holes (Plural)',
          verb: 'do ... trap (Inverted)',
          trap: 'Not only di awal kalimat memicu inversi'
        },
        optionAnalysis: {
          A: 'Salah: Susunan normal tanpa inversi.',
          B: 'BENAR: Auxiliary "do" + Subject jamak "black holes" + V1 "trap".',
          C: 'Salah: "do" masih di belakang subjek.',
          D: 'Salah: Bukan bentuk klausa.'
        },
        formula: 'Not only + [do/does/did] + [Subject] + [V1], + but + [S] + also + [V].',
        voiceWalkthrough:
          'Jawabannya B, "do black holes trap". Karena "Not only" berada di awal kalimat, susunannya wajib dibalik.'
      },
      {
        id: 'as1-q2',
        level: 'Advance',
        section: 'Structure',
        skillTag: 'Reduced Adverb Clause',
        type: 'Structure',
        prompt:
          '_______ at high temperatures, carbon atoms rearrange themselves into a crystalline diamond structure.',
        translationId:
          'Ketika dipanaskan pada suhu tinggi, atom karbon menyusun ulang dirinya menjadi struktur berlian kristal.',
        hintId: 'Subjek setelah koma adalah "carbon atoms" yang dikenai perlakuan panas (pasif).',
        options: [
          { key: 'A', text: 'Heating' },
          { key: 'B', text: 'When heated' },
          { key: 'C', text: 'It is heated' },
          { key: 'D', text: 'When heating' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'carbon atoms (Subjek penerima aksi panas)',
          verb: 'rearrange (Main Verb)',
          trap: 'Carbon atoms dipanaskan (Pasif → V3), bukan memanaskan!'
        },
        optionAnalysis: {
          A: 'Salah: "Heating" bermakna aktif.',
          B: 'BENAR: Reduced Adverb Clause pasif ("When they are heated" → "When heated").',
          C: 'Salah: Dua klausa tanpa connector.',
          D: 'Salah: "When heating" bermakna aktif.'
        },
        formula: 'When + [V3 Pasif] + , + [Subject] + [Verb].',
        voiceWalkthrough:
          'Jawabannya B, "When heated". Subjek "carbon atoms" dikenai perlakuan panas secara pasif sehingga memakai bentuk V3.'
      }
    ]
  },

  {
    id: 'adv-read-1',
    level: 'Advance',
    levelNum: 3,
    section: 'Reading',
    code: 'R-3.1',
    moduleRef: 'Reading Skill 8–13',
    title: 'Reading Advance (550+): Implied Details (Inference), Tone & Purpose',
    shortTitle: 'Inference, Tone & Purpose',
    category: 'Reading Comprehension (550+)',
    passage: {
      title: 'The Discovery of Cosmic Microwave Background Radiation',
      text: `In 1964, radio astronomers Arno Penzias and Robert Wilson were calibrating a highly sensitive horn antenna in Holmdel, New Jersey, intending to use it for satellite communication experiments. Regardless of where they pointed the antenna in the sky, they encountered a persistent, faint background hiss that remained constant day and night. Initially suspecting equipment malfunction—or even pigeon droppings inside the antenna—they meticulously cleaned the instrument and tested every electrical circuit, yet the mysterious static endured.\n\nMeanwhile, just sixty kilometers away at Princeton University, physicist Robert Dicke and his team were preparing to search for faint thermal radiation left over from the Big Bang, a theoretical prediction made in the 1940s. When Penzias and Wilson learned of Dicke’s theoretical work, the mystery was immediately resolved: the "annoying static" was actually the Cosmic Microwave Background (CMB) radiation, the thermal echo of the universe's birth nearly 13.8 billion years ago. This serendipitous finding provided decisive empirical evidence supporting the Big Bang model over competing steady-state theories.`,
      translationId: `Pada tahun 1964, astronom radio Arno Penzias dan Robert Wilson sedang mengkalibrasi antena corong yang sangat sensitif di Holmdel, New Jersey, dengan maksud menggunakannya untuk eksperimen komunikasi satelit. Ke mana pun mereka mengarahkan antena di langit, mereka menemukan desisan latar belakang samar yang terus-menerus dan tetap konstan siang maupun malam. Awalnya mencurigai kerusakan peralatan—atau bahkan kotoran merpati di dalam antena—mereka membersihkan instrumen dengan teliti dan menguji setiap sirkuit listrik, namun gangguan statis misterius itu tetap bertahan.\n\nSementara itu, hanya enam puluh kilometer jauhnya di Universitas Princeton, fisikawan Robert Dicke dan timnya sedang bersiap mencari radiasi termal samar yang tersisa dari Big Bang, sebuah prediksi teoretis yang dibuat pada tahun 1940-an. Ketika Penzias dan Wilson mengetahui karya teoretis Dicke, misteri itu langsung terpecahkan: "gangguan statis yang menjengkelkan" itu sebenarnya adalah radiasi Latar Belakang Gelombang Mikro Kosmik (CMB), gema termal dari kelahiran alam semesta hampir 13,8 miliar tahun lalu. Penemuan tak terduga ini memberikan bukti empiris yang menentukan yang mendukung model Big Bang dibandingkan teori keadaan tetap yang bersaing.`
    },
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Strategi Deduksi Logis (Implied Details / Inference)',
        bodyId:
          'Pada soal "What can be inferred / implied...?", jawabannya tidak ditulis kata-per-kata di dalam teks, melainkan kesimpulan logis 1 langkah dari fakta yang tersedia. Perhatikan kata kunci kausalitas, kronologi waktu, dan kata sifat bernuansa seperti "serendipitous" (kebetulan yang menguntungkan).',
        voiceText:
          'Pada soal Inference tingkat lanjut, tarik kesimpulan logis satu langkah dari fakta bacaan. Kata "serendipitous" dan tujuan awal komunikasi satelit membuktikan penemuan itu terjadi secara tidak sengaja.',
        englishRule:
          'Tujuan Awal = Satelit + Kata Kunci = "serendipitous" → Kesimpulan: Unintentional Discovery',
        examples: [
          {
            en: 'Before 1964, CMB radiation had only been predicted theoretically (1940s) → Empirical proof did not exist prior to 1964.',
            id: 'Deduksi kronologis adalah kunci utama menaklukkan soal Inference skor 550+.',
            highlight: 'serendipitous = accidental / unintentional'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'ar1-q1',
        level: 'Advance',
        section: 'Reading',
        skillTag: 'Reading: Implied Detail (Inference)',
        type: 'Reading Comprehension',
        prompt:
          'What can be inferred about Penzias and Wilson’s discovery of the Cosmic Microwave Background?',
        translationId:
          'Apa yang dapat disimpulkan tentang penemuan Latar Belakang Gelombang Mikro Kosmik oleh Penzias dan Wilson?',
        hintId:
          'Perhatikan tujuan awal mereka ("intending to use it for satellite communication") dan kata "serendipitous".',
        options: [
          {
            key: 'A',
            text: 'They spent decades designing a specialized antenna specifically to prove the Big Bang theory.'
          },
          {
            key: 'B',
            text: 'They discovered the radiation unintentionally while working on an unrelated project.'
          },
          {
            key: 'C',
            text: 'They collaborated closely with Robert Dicke before building the antenna in 1964.'
          },
          {
            key: 'D',
            text: 'They immediately recognized the static as radiation from the early universe.'
          }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Inference Clue: "intending to use it for satellite communication" + "serendipitous"',
          verb: 'serendipitous = ditemukan secara tidak sengaja',
          trap: 'Opsi A, C, dan D bertentangan dengan fakta teks'
        },
        optionAnalysis: {
          A: 'Salah: Tujuan awal mereka adalah komunikasi satelit.',
          B: 'BENAR: Mereka mengerjakan proyek komunikasi satelit dan menemukannya secara tidak sengaja ("serendipitous").',
          C: 'Salah: Mereka baru mengenal teori Dicke belakangan.',
          D: 'Salah: Awalnya mereka mengira itu kerusakan alat.'
        },
        formula: 'Tujuan awal = satelit + "serendipitous" → Penemuan tidak disengaja.',
        voiceWalkthrough:
          'Jawabannya B. Kata "serendipitous" dan proyek awal komunikasi satelit menyiratkan bahwa penemuan ini terjadi secara tidak sengaja.'
      }
    ]
  }
];

// ============================================================================
// 3. LONGMAN-STYLE QUESTION BANK (CATEGORIZED BY LEVEL FOR RANDOM PRACTICE)
// ============================================================================
const LONGMAN_QUESTION_BANK = [
  // --- BASIC LEVEL BANK ---
  {
    id: 'lqb-b1',
    level: 'Basic',
    section: 'Structure',
    skillTag: 'Structure Skill 1–2: S-V & Prepositions',
    prompt: 'The north Platte River _______ from Wyoming into Nebraska.',
    translationId: 'Sungai North Platte _______ dari Wyoming ke Nebraska.',
    hintId: 'Subjeknya adalah "The north Platte River" (tunggal) dan kalimat ini belum memiliki kata kerja utama!',
    options: [
      { key: 'A', text: 'it flowed' },
      { key: 'B', text: 'flows' },
      { key: 'C', text: 'flowing' },
      { key: 'D', text: 'with flowing water' }
    ],
    correctKey: 'B',
    breakdown: {
      subject: 'The north Platte River (Singular)',
      verb: 'flows (Main Verb Singular)',
      trap: 'Opsi A double subject ("it"), C participle tanpa to be, D prepositional phrase'
    },
    optionAnalysis: {
      A: 'Salah: Mengulang subjek dengan kata ganti "it".',
      B: 'BENAR: "flows" adalah kata kerja tunggal (Present Simple untuk fakta geografis) yang tepat.',
      C: 'Salah: "flowing" (V-ing tanpa to be) bukan main verb.',
      D: 'Salah: Tidak mengandung kata kerja.'
    },
    formula: '[Singular Subject] + [Singular Main Verb (flows)].',
    voiceWalkthrough: 'Jawabannya B, "flows". Kalimat ini memiliki satu subjek tunggal dan membutuhkan satu kata kerja utama.'
  },
  {
    id: 'lqb-b2',
    level: 'Basic',
    section: 'Structure',
    skillTag: 'Structure Skill 3: Appositives',
    prompt: '_______, George, is attending the lecture.',
    translationId: '_______, George, sedang menghadiri kuliah tersebut.',
    hintId: 'Kata ", George," yang diapit dua koma adalah Appositive. Kalimat ini masih membutuhkan Subject di awal!',
    options: [
      { key: 'A', text: 'Right now' },
      { key: 'B', text: 'Happily' },
      { key: 'C', text: 'Because of the time' },
      { key: 'D', text: 'My friend' }
    ],
    correctKey: 'D',
    breakdown: {
      subject: 'My friend (Subject utama sebelum appositive ", George,")',
      verb: 'is attending',
      trap: 'Jangan tertipu mengira "George" adalah subjek utama karena ia diapit koma!'
    },
    optionAnalysis: {
      A: 'Salah: Keterangan waktu, bukan subjek.',
      B: 'Salah: Adverb, bukan subjek.',
      C: 'Salah: Frasa preposisi, bukan subjek.',
      D: 'BENAR: "My friend" menjadi Subject kalimat yang dijelaskan oleh appositive ", George,".'
    },
    formula: '[SUBJECT (My friend)] + , [Appositive (George)] , + [Verb (is attending)].',
    voiceWalkthrough: 'Jawabannya D, "My friend". Karena George diapit dua koma, George adalah appositive dan kalimat membutuhkan subjek di depannya.'
  },
  {
    id: 'lqb-b3',
    level: 'Basic',
    section: 'Structure',
    skillTag: 'Structure Skill 4–5: Present & Past Participles',
    prompt: 'The packages _______ mailed at the post office will arrive Monday.',
    translationId: 'Paket-paket yang dikirimkan di kantor pos akan tiba hari Senin.',
    hintId: 'Main verb kalimat adalah "will arrive". Kata "mailed" adalah Past Participle (V3) bermakna pasif!',
    options: [
      { key: 'A', text: 'have' },
      { key: 'B', text: 'were' },
      { key: 'C', text: 'them' },
      { key: 'D', text: 'just' }
    ],
    correctKey: 'D',
    breakdown: {
      subject: 'The packages',
      verb: 'will arrive (Main Verb sudah ada di belakang)',
      trap: 'Jika memilih A ("have") atau B ("were"), kalimat akan punya 2 verb tanpa connector!'
    },
    optionAnalysis: {
      A: 'Salah: Akan membentuk dua kata kerja utama ("have mailed" dan "will arrive").',
      B: 'Salah: Akan membentuk dua kata kerja utama ("were mailed" dan "will arrive").',
      C: 'Salah: Kata ganti objek tidak tepat di posisi ini.',
      D: 'BENAR: Adverb "just" menyisip sebelum participle pasif "mailed" tanpa menambah verb baru.'
    },
    formula: '[Subject] + (just) [Past Participle V3] + [Main Verb (will arrive)].',
    voiceWalkthrough: 'Jawabannya D, "just". Kata "mailed" di sini berfungsi sebagai kata sifat pasif, sehingga kita tidak boleh menambahkan kata kerja bantu "have" atau "were".'
  },
  {
    id: 'lqb-b4',
    level: 'Basic',
    section: 'Listening',
    skillTag: 'Listening Skill 1–2: Last Line & Synonyms',
    prompt:
      'Audio Dialogue — Man: "Why is Barbara feeling so happy?" | Woman: "She just started working in a real estate agency." | Question: What does the woman say about Barbara?',
    translationId:
      'Dialog Audio — Pria: "Mengapa Barbara merasa sangat senang?" | Wanita: "Dia baru saja mulai bekerja di agen properti." | Pertanyaan: Apa yang dikatakan wanita tentang Barbara?',
    hintId: 'Cari sinonim dari "started" dan "working" pada baris pembicara kedua!',
    options: [
      { key: 'A', text: 'She always liked her work in real estate.' },
      { key: 'B', text: 'She began a new job.' },
      { key: 'C', text: 'She just bought some real estate.' },
      { key: 'D', text: 'She bought a real estate agency.' }
    ],
    correctKey: 'B',
    breakdown: {
      subject: 'Key Words: "started working"',
      verb: 'Synonyms: "began a new job"',
      trap: 'Hindari opsi yang mengulang kata "real estate" dengan makna salah'
    },
    optionAnalysis: {
      A: 'Salah: Tidak disebutkan dia selalu menyukainya.',
      B: 'BENAR: "started working" bersinonim dengan "began a new job".',
      C: 'Salah: Dia bekerja di sana, bukan membeli properti.',
      D: 'Salah: Dia tidak membeli agensi tersebut.'
    },
    formula: 'started working = began a new job.',
    voiceWalkthrough: 'Jawabannya B, "She began a new job", yang merupakan sinonim dari "started working".'
  },

  // --- INTERMEDIATE LEVEL BANK ---
  {
    id: 'lqb-i1',
    level: 'Intermediate',
    section: 'Structure',
    skillTag: 'Structure Skill 6–8: Coordinate & Adverb Connectors',
    prompt: 'A power failure occurred, _______ the lamps went out.',
    translationId: 'Pemadaman listrik terjadi, _______ lampu-lampu pun padam.',
    hintId: 'Ada 2 klausa lengkap ("A power failure occurred" dan "the lamps went out") yang dipisahkan tanda koma.',
    options: [
      { key: 'A', text: 'then' },
      { key: 'B', text: 'so' },
      { key: 'C', text: 'later' },
      { key: 'D', text: 'next' }
    ],
    correctKey: 'B',
    breakdown: {
      subject: 'S1: A power failure | S2: the lamps',
      verb: 'V1: occurred | V2: went out',
      trap: 'Kata "then", "later", "next" adalah adverb, BUKAN coordinate connector (FANBOYS)!'
    },
    optionAnalysis: {
      A: 'Salah: "then" bukan bagian dari FANBOYS sehingga menyebabkan comma splice.',
      B: 'BENAR: "so" adalah coordinate connector (FANBOYS) yang sah setelah koma untuk menghubungkan dua klausa.',
      C: 'Salah: "later" adalah keterangan waktu.',
      D: 'Salah: "next" bukan connector.'
    },
    formula: '[S1 + V1] + , + [FANBOYS: for/and/nor/but/or/yet/so] + [S2 + V2].',
    voiceWalkthrough: 'Jawabannya B, "so". Dua klausa yang dipisahkan koma wajib dihubungkan oleh salah satu dari FANBOYS.'
  },
  {
    id: 'lqb-i2',
    level: 'Intermediate',
    section: 'Structure',
    skillTag: 'Structure Skill 9–10: Noun Clauses',
    prompt: '_______ was on television made me angry.',
    translationId: '_______ ada di televisi membuatku marah.',
    hintId: 'Main verb kalimat adalah "made". Kita butuh Noun Clause connector yang sekaligus merangkap subjek bagi "was"!',
    options: [
      { key: 'A', text: 'It' },
      { key: 'B', text: 'The story' },
      { key: 'C', text: 'What' },
      { key: 'D', text: 'When' }
    ],
    correctKey: 'C',
    breakdown: {
      subject: 'What was on television (Noun Clause sebagai Subject)',
      verb: 'was (Verb anak kalimat) | made (Main Verb)',
      trap: 'Jika memilih A atau B, akan ada 2 verb ("was" dan "made") tanpa connector!'
    },
    optionAnalysis: {
      A: 'Salah: Tidak ada connector untuk dua verb.',
      B: 'Salah: Tidak ada connector untuk dua verb.',
      C: 'BENAR: "What" berfungsi ganda sebagai connector dan subjek bagi "was".',
      D: 'Salah: "When" tidak bisa menjadi subjek bagi "was".'
    },
    formula: 'WHAT + [Verb 1] + ... + [Main Verb].',
    voiceWalkthrough: 'Jawabannya C, "What". Kata "What" berfungsi sekaligus sebagai penghubung dan subjek dari kata kerja "was".'
  },
  {
    id: 'lqb-i3',
    level: 'Intermediate',
    section: 'Structure',
    skillTag: 'Structure Skill 11–12: Adjective Clauses',
    prompt: 'The gift _______ selected for the bride was rather expensive.',
    translationId: 'Hadiah _______ dipilih untuk pengantin wanita itu agak mahal.',
    hintId: 'Perhatikan pilihan jawabannya: klausa sifat ini membutuhkan connector dan subjek!',
    options: [
      { key: 'A', text: 'because' },
      { key: 'B', text: 'was' },
      { key: 'C', text: 'since' },
      { key: 'D', text: 'which we' }
    ],
    correctKey: 'D',
    breakdown: {
      subject: 'Main: The gift | Adj Clause: we',
      verb: 'Main: was | Adj Clause: selected',
      trap: 'Tanpa connector + subjek ("which we"), kalimat tidak punya subjek untuk "selected"'
    },
    optionAnalysis: {
      A: 'Salah: "because" tidak bisa menjelaskan kata benda "The gift".',
      B: 'Salah: Akan menimbulkan dua verb tanpa connector.',
      C: 'Salah: "since" adalah adverb connector.',
      D: 'BENAR: "which" (connector objek) + "we" (subject) + "selected" (verb).'
    },
    formula: '[Noun] + [which/that + Subject + Verb] + [Main Verb].',
    voiceWalkthrough: 'Jawabannya D, "which we". Klausa sifat ini membutuhkan relative pronoun "which" beserta subjek "we".'
  },
  {
    id: 'lqb-i4',
    level: 'Intermediate',
    section: 'Listening',
    skillTag: 'Listening Skill 5: Passive Restatements',
    prompt:
      'Audio Dialogue — Man: "Did Sally go to the bank this morning?" | Woman: "Yes, she did. She got a new checking account." | Question: What does the woman imply?',
    translationId:
      'Dialog Audio — Pria: "Apakah Sally pergi ke bank pagi ini?" | Wanita: "Ya. Dia membuka rekening giro baru." | Pertanyaan: Apa yang disiratkan wanita itu?',
    hintId: 'Kalimat aktif di dialog ("She got a new checking account") sering diubah menjadi pasif di pilihan jawaban!',
    options: [
      { key: 'A', text: 'Sally wrote several checks.' },
      { key: 'B', text: 'Sally wanted to check up on the bank.' },
      { key: 'C', text: 'A new checking account was opened.' },
      { key: 'D', text: 'Sally checked on the balance in her account.' }
    ],
    correctKey: 'C',
    breakdown: {
      subject: 'Active: She got a new checking account',
      verb: 'Passive Restatement: A new checking account was opened',
      trap: 'Opsi A, B, D adalah jebakan bunyi mirip kata "check"'
    },
    optionAnalysis: {
      A: 'Salah: Jebakan kata "checks".',
      B: 'Salah: Jebakan frasa "check up".',
      C: 'BENAR: Parafrase pasif yang akurat dari kalimat aktif pembicara kedua.',
      D: 'Salah: Tidak disebutkan pemeriksaan saldo.'
    },
    formula: 'Active (S + got + Object) → Passive (Object + was opened).',
    voiceWalkthrough: 'Jawabannya C, "A new checking account was opened", yang merupakan bentuk pasif dari pernyataan pembicara kedua.'
  },

  // --- ADVANCE LEVEL BANK (550+) ---
  {
    id: 'lqb-a1',
    level: 'Advance',
    section: 'Structure',
    skillTag: 'Structure Skill 13–14: Reduced Clauses',
    prompt: '_______ on several different television programs, the witness gave conflicting accounts of what had happened.',
    translationId: '_______ di beberapa program televisi yang berbeda, saksi tersebut memberikan keterangan yang bertentangan tentang apa yang telah terjadi.',
    hintId: 'Subjek setelah koma adalah "the witness" yang tampil (aktif) di acara televisi!',
    options: [
      { key: 'A', text: 'He appeared' },
      { key: 'B', text: 'Who appeared' },
      { key: 'C', text: 'Appearing' },
      { key: 'D', text: 'Appears' }
    ],
    correctKey: 'C',
    breakdown: {
      subject: 'the witness (Pelaku aksi "appear" → Aktif)',
      verb: 'gave (Main Verb)',
      trap: 'Karena makna aktif ("After he appeared..."), reduksinya menggunakan V-ing ("Appearing")'
    },
    optionAnalysis: {
      A: 'Salah: Dua klausa tanpa connector.',
      B: 'Salah: Relative pronoun "Who" tidak bisa ditaruh di awal kalimat sebelum subjek utama.',
      C: 'BENAR: Reduced Adverb Clause aktif ("Appearing" = After he appeared).',
      D: 'Salah: Kata kerja finite tanpa penghubung.'
    },
    formula: '[V-ing (Reduced Active Clause)] + , + [Subject] + [Main Verb].',
    voiceWalkthrough: 'Jawabannya C, "Appearing". Subjek "the witness" melakukan aksi tampil secara aktif sehingga klausa keterangan diringkas menjadi V-ing.'
  },
  {
    id: 'lqb-a2',
    level: 'Advance',
    section: 'Structure',
    skillTag: 'Structure Skill 15–19: Inverted Subjects & Verbs',
    prompt: 'Rarely _______ located near city lights or at lower elevations.',
    translationId: 'Jarang sekali _______ berlokasi di dekat lampu kota atau di dataran rendah.',
    hintId: 'Kata negatif "Rarely" berada di awal kalimat! Wajib inversi: Auxiliary + Subject.',
    options: [
      { key: 'A', text: 'observatories are' },
      { key: 'B', text: 'are' },
      { key: 'C', text: 'in the observatories' },
      { key: 'D', text: 'are observatories' }
    ],
    correctKey: 'D',
    breakdown: {
      subject: 'observatories (Plural)',
      verb: 'are ... located (Inverted Passive Verb)',
      trap: 'Negative expression "Rarely" di awal kalimat mewajibkan posisi "are" sebelum "observatories"'
    },
    optionAnalysis: {
      A: 'Salah: Susunan normal tanpa inversi.',
      B: 'Salah: Kehilangan subjek.',
      C: 'Salah: Berupa frasa preposisi.',
      D: 'BENAR: Inversi sempurna: "Rarely + are + observatories + located".'
    },
    formula: 'Rarely + [are/do/does/did] + [Subject] + [Verb].',
    voiceWalkthrough: 'Jawabannya D, "are observatories". Kata negatif "Rarely" di awal kalimat memicu inversi antara auxiliary "are" dan subjek "observatories".'
  },
  {
    id: 'lqb-a3',
    level: 'Advance',
    section: 'Structure',
    skillTag: 'Structure Skill 18: Conditional Inversion',
    prompt: '_______ more susceptible to bacterial contamination, the blood samples would have been discarded immediately.',
    translationId: 'Seandainya lebih rentan terhadap kontaminasi bakteri, sampel darah tersebut pasti sudah langsung dibuang.',
    hintId: 'Lihat klausa kedua: "would have been discarded" (Conditional Type 3). Gunakan inversi Type 3 tanpa "If"!',
    options: [
      { key: 'A', text: 'Had the laboratory conditions been' },
      { key: 'B', text: 'The laboratory conditions had been' },
      { key: 'C', text: 'Were the laboratory conditions' },
      { key: 'D', text: 'If the laboratory conditions were' }
    ],
    correctKey: 'A',
    breakdown: {
      subject: 'the laboratory conditions',
      verb: 'Had ... been (Conditional Inversion Type 3)',
      trap: 'Klausa hasil memakai "would have V3" (Type 3), sehingga syaratnya wajib "Had + S + V3"'
    },
    optionAnalysis: {
      A: 'BENAR: Conditional Inversion Type 3: "Had + Subject + been".',
      B: 'Salah: Tanpa "If" dan tidak diinversi.',
      C: 'Salah: "Were" adalah Type 2 (pasangannya "would V1", bukan "would have V3").',
      D: 'Salah: Type 2 tidak cocok dengan "would have been discarded".'
    },
    formula: 'Had + [Subject] + [V3], + [Subject] + would have + [V3].',
    voiceWalkthrough: 'Jawabannya A, "Had the laboratory conditions been". Karena klausa kedua memakai "would have been discarded", kita wajib memakai inversi Conditional Type 3.'
  },
  {
    id: 'lqb-a4',
    level: 'Advance',
    section: 'Written Expression',
    skillTag: 'Written Expression: Parallel & Time Markers',
    prompt: 'Identify the error: The (A) discovery of gold in California (B) in 1848 (C) has brought more than 40,000 prospectors to the region (D) within two years.',
    translationId: 'Identifikasi kesalahan: Penemuan emas di California pada tahun 1848 telah membawa lebih dari 40.000 pencari emas ke wilayah tersebut dalam waktu dua tahun.',
    hintId: 'Perhatikan penanda waktu lampau spesifik "in 1848"!',
    options: [
      { key: 'A', text: '(A) discovery' },
      { key: 'B', text: '(B) in 1848' },
      { key: 'C', text: '(C) has brought → seharusnya Simple Past "brought"' },
      { key: 'D', text: '(D) within two years' }
    ],
    correctKey: 'C',
    breakdown: {
      subject: 'The discovery of gold',
      verb: 'has brought → Seharusnya Simple Past "brought"',
      trap: 'Penanda waktu lampau spesifik "in 1848" melarang penggunaan Present Perfect (has + V3)'
    },
    optionAnalysis: {
      A: 'Benar: Kata benda "discovery" sudah tepat.',
      B: 'Benar: Keterangan tahun lampau.',
      C: 'SALAH (Harus diubah): Karena ada waktu spesifik "in 1848", wajib memakai Simple Past "brought".',
      D: 'Benar: Keterangan durasi lampau sudah tepat.'
    },
    formula: 'Specific Past Time (in 1848) → Simple Past (V2), BUKAN has + V3.',
    voiceWalkthrough: 'Yang salah adalah C, "has brought". Karena kejadiannya terjadi pada tahun spesifik di masa lampau yaitu "in 1848", wajib memakai bentuk Simple Past "brought".'
  }
];

// ============================================================================
// 4. DATA FOR MINI-GAMES, TIMED SIMULATION, LISTENING LAB & FLASHCARDS
// ============================================================================
const SPEED_TRAP_CHALLENGES = [
  {
    id: 'st-1',
    sentence: 'The box of antique silver coins sits on the mahogany shelf.',
    question: 'Mana yang merupakan TRUE SUBJECT kalimat ini?',
    choices: ['The box', 'antique silver coins', 'the mahogany shelf'],
    correct: 'The box',
    rule: 'Aturan Preposisi: "of antique silver coins" adalah Object of Preposition (Coret!).'
  },
  {
    id: 'st-2',
    sentence: 'Rarely does a solar eclipse occur twice in the exact same city.',
    question: 'Mengapa kata kerja bantu "does" diletakkan sebelum subjek?',
    choices: ['Negative Inversion (Rarely)', 'Appositive Trap', 'Reduced Clause'],
    correct: 'Negative Inversion (Rarely)',
    rule: 'Aturan Inversi: Kata negatif "Rarely" di awal kalimat mewajibkan inversi!'
  },
  {
    id: 'st-3',
    sentence: 'The paintings exhibited at the Louvre attract millions of visitors.',
    question: 'Apa fungsi kata "exhibited" pada kalimat di atas?',
    choices: ['Reduced Adjective Clause (Pasif)', 'Main Verb Kalimat', 'Appositive'],
    correct: 'Reduced Adjective Clause (Pasif)',
    rule: 'Reduced Clause: "which are exhibited" diringkas menjadi V3 "exhibited"; Main Verb-nya adalah "attract".'
  },
  {
    id: 'st-4',
    sentence: 'Each of the newly hired engineers receives a safety manual.',
    question: 'Mengapa verb-nya memakai "-s" (receives)?',
    choices: ['Subjek aslinya "Each" (Tunggal)', 'Karena "engineers" jamak', 'Karena kalimat pasif'],
    correct: 'Subjek aslinya "Each" (Tunggal)',
    rule: 'Indefinite Pronoun: "Each" selalu dihitung tunggal meskipun diikuti "of + plural noun".'
  },
  {
    id: 'st-5',
    sentence: 'Sacramento, the capital of California, lies in the Central Valley.',
    question: 'Apa peran frasa ", the capital of California,"?',
    choices: ['Appositive (Penjelas Subjek)', 'Main Verb', 'Object of Preposition'],
    correct: 'Appositive (Penjelas Subjek)',
    rule: 'Aturan Appositive: Frasa kata benda yang diapit dua koma adalah Appositive.'
  },
  {
    id: 'st-6',
    sentence: 'Had the pilot noticed the warning light earlier, the delay would have been avoided.',
    question: 'Struktur apakah "Had the pilot noticed..." di awal kalimat?',
    choices: ['Conditional Inversion Tanpa "If"', 'Kalimat Tanya (Interrogative)', 'Double Comparative'],
    correct: 'Conditional Inversion Tanpa "If"',
    rule: 'Conditional Inversion: "If the pilot had noticed" diinversi dengan memajukan "Had" ke depan.'
  }
];

const VOCAB_DUEL_ITEMS = [
  {
    id: 'vd-1',
    word: 'SERENDIPITOUS',
    context: 'This serendipitous finding provided decisive empirical evidence.',
    options: ['occurring by happy chance', 'carefully planned', 'highly controversial', 'financially costly'],
    correct: 'occurring by happy chance',
    meaningId: 'terjadi secara kebetulan yang menguntungkan / tak terduga'
  },
  {
    id: 'vd-2',
    word: 'ENTICE',
    context: 'The anglerfish dangles a glowing lure to entice unsuspecting prey.',
    options: ['attract or tempt', 'frighten away', 'camouflage', 'exhaust'],
    correct: 'attract or tempt',
    meaningId: 'memikat atau menarik perhatian'
  },
  {
    id: 'vd-3',
    word: 'UBIQUITOUS',
    context: 'Microplastics have become ubiquitous across all marine ecosystems.',
    options: ['found everywhere', 'extremely rare', 'biodegradable', 'microscopic'],
    correct: 'found everywhere',
    meaningId: 'ada di mana-mana / sangat umum ditemukan'
  },
  {
    id: 'vd-4',
    word: 'PLUMMET',
    context: 'Temperatures in the desert plummet rapidly after sunset.',
    options: ['drop sharply', 'stabilize', 'fluctuate mildly', 'evaporate'],
    correct: 'drop sharply',
    meaningId: 'anjlok / turun dengan sangat tajam'
  }
];

const MINI_TEST_QUESTIONS = [
  {
    id: 'mt-1',
    skill: 'S-V & Prepositions',
    prompt: 'The rings of Saturn _______ composed primarily of countless ice particles and rocky debris.',
    options: [
      { key: 'A', text: 'is' },
      { key: 'B', text: 'are' },
      { key: 'C', text: 'was' },
      { key: 'D', text: 'has been' }
    ],
    correctKey: 'B',
    explanation: 'Subjek utamanya adalah "The rings" (jamak), bukan "Saturn". Jadi verb-nya wajib jamak: "are".'
  },
  {
    id: 'mt-2',
    skill: 'Multiple Clauses & Connectors',
    prompt: '_______ most spiders are harmless to humans, a few species possess venom potent enough to cause serious injury.',
    options: [
      { key: 'A', text: 'Despite' },
      { key: 'B', text: 'Although' },
      { key: 'C', text: 'Because of' },
      { key: 'D', text: 'In spite of' }
    ],
    correctKey: 'B',
    explanation: 'Diikuti oleh klausa lengkap (S + V) dan bermakna pertentangan, maka wajib memakai connector "Although".'
  },
  {
    id: 'mt-3',
    skill: 'Adjective Clauses',
    prompt: 'The Mariana Trench, _______ reaches a depth of nearly 11,000 meters, is the deepest oceanic trench on Earth.',
    options: [
      { key: 'A', text: 'that' },
      { key: 'B', text: 'which' },
      { key: 'C', text: 'where' },
      { key: 'D', text: 'what' }
    ],
    correctKey: 'B',
    explanation: 'Setelah tanda koma untuk benda, dilarang memakai "that"—wajib menggunakan "which".'
  },
  {
    id: 'mt-4',
    skill: 'Reduced Clauses',
    prompt: '_______ in 1928 by Alexander Fleming, penicillin revolutionized the treatment of bacterial infections.',
    options: [
      { key: 'A', text: 'Discovering' },
      { key: 'B', text: 'Discovered' },
      { key: 'C', text: 'It was discovered' },
      { key: 'D', text: 'When discovering' }
    ],
    correctKey: 'B',
    explanation: 'Reduced Clause pasif di awal kalimat: "Discovered" (V3) menerangkan subjek "penicillin" yang ditemukan.'
  },
  {
    id: 'mt-5',
    skill: 'Subject-Verb Inversion',
    prompt: 'Rarely _______ such rapid technological transformation occurred within a single generation.',
    options: [
      { key: 'A', text: 'has' },
      { key: 'B', text: 'have' },
      { key: 'C', text: 'it has' },
      { key: 'D', text: 'there are' }
    ],
    correctKey: 'A',
    explanation: 'Kata negatif "Rarely" di awal kalimat memicu inversi. Subjeknya tunggal ("transformation"), maka auxiliary-nya "has".'
  },
  {
    id: 'mt-6',
    skill: 'Time Markers & Tenses',
    prompt: 'Identify the error: Neil Armstrong (A) has walked (B) on the lunar surface (C) in July 1969 (D).',
    options: [
      { key: 'A', text: '(A) Neil Armstrong' },
      { key: 'B', text: '(B) has walked → seharusnya "walked"' },
      { key: 'C', text: '(C) on the lunar surface' },
      { key: 'D', text: '(D) in July 1969' }
    ],
    correctKey: 'B',
    explanation: 'Penanda waktu lampau spesifik "in July 1969" wajib memakai Simple Past "walked" tanpa "has".'
  },
  {
    id: 'mt-7',
    skill: 'Double Comparative',
    prompt: 'The faster a computer processor executes instructions, _______ heat it generates.',
    options: [
      { key: 'A', text: 'the more' },
      { key: 'B', text: 'more' },
      { key: 'C', text: 'the most' },
      { key: 'D', text: 'as much' }
    ],
    correctKey: 'A',
    explanation: 'Pola Double Comparative: "The faster ..., the more ...".'
  },
  {
    id: 'mt-8',
    skill: 'Irregular Plurals',
    prompt: 'Identify the error: Several (A) bacterium (B) isolated from deep-sea vents can survive (C) extreme (D) temperatures.',
    options: [
      { key: 'A', text: '(A) Several' },
      { key: 'B', text: '(B) bacterium → seharusnya jamak "bacteria"' },
      { key: 'C', text: '(C) extreme' },
      { key: 'D', text: '(D) temperatures' }
    ],
    correctKey: 'B',
    explanation: 'Setelah penanda jamak "Several", kata benda "bacterium" wajib diubah ke bentuk jamaknya yaitu "bacteria".'
  }
];

const LISTENING_LAB_ITEMS = [
  {
    id: 'ls-1',
    skill: 'Listening Part A: Last Line & Synonyms',
    manLine: 'Why is Barbara feeling so happy today?',
    womanLine: 'She just started working in a real estate agency.',
    narratorQuestion: 'What does the woman say about Barbara?',
    options: [
      { key: 'A', text: 'She always liked her work in real estate.' },
      { key: 'B', text: 'She began a new job.' },
      { key: 'C', text: 'She just bought some real estate.' },
      { key: 'D', text: 'She bought a real estate agency.' }
    ],
    correctKey: 'B',
    explanation:
      'Fokus pada pembicara kedua dan cari sinonimnya: kata kunci "started" bersinonim dengan "began", dan "working" merujuk pada "job".'
  },
  {
    id: 'ls-2',
    skill: 'Listening Part A: Passive Restatements',
    manLine: 'Did Sally go to the bank this morning?',
    womanLine: 'Yes, she did. She got a new checking account.',
    narratorQuestion: 'What does the woman imply?',
    options: [
      { key: 'A', text: 'Sally wrote several checks.' },
      { key: 'B', text: 'Sally wanted to check up on the bank.' },
      { key: 'C', text: 'A new checking account was opened.' },
      { key: 'D', text: 'Sally checked on the balance in her account.' }
    ],
    correctKey: 'C',
    explanation:
      'Kalimat aktif di dialog ("She got a new checking account") sering diparafrase menjadi kalimat pasif di pilihan jawaban ("A new checking account was opened").'
  },
  {
    id: 'ls-3',
    skill: 'Listening Part A: Wishes & Implied Meaning',
    manLine: 'It is too bad that you have to stay here and work during the school break.',
    womanLine: 'I really wish I could go with you and the others to Palm Springs.',
    narratorQuestion: 'What does the woman mean?',
    options: [
      { key: 'A', text: 'Maybe she will go with the others on the trip.' },
      { key: 'B', text: 'She is unable to go on the trip.' },
      { key: 'C', text: 'She is happy to be going on the trip.' },
      { key: 'D', text: 'She is going on the trip, but not with the others.' }
    ],
    correctKey: 'B',
    explanation:
      'Pernyataan "wish" menyiratkan kenyataan yang berlawanan: "wish I could go" berarti dia tidak bisa pergi ("unable to go").'
  },
  {
    id: 'ls-4',
    skill: 'Listening Part A: Two-Part Verbs & Idioms',
    manLine: 'What time does the department meeting start?',
    womanLine: 'Didn’t you hear that it was called off by the director?',
    narratorQuestion: 'What does the woman say about the meeting?',
    options: [
      { key: 'A', text: 'The director called a meeting.' },
      { key: 'B', text: 'The director phoned her about the meeting.' },
      { key: 'C', text: 'The director called the meeting to order.' },
      { key: 'D', text: 'The director canceled the meeting.' }
    ],
    correctKey: 'D',
    explanation:
      'Ungkapan frasa kata kerja (two-part verb) "called off" memiliki arti idiomatik membatalkan ("canceled").'
  }
];

const GRAMMAR_FLASHCARDS = [
  {
    id: 'fc-1',
    category: 'Irregular Plurals (Kata Benda Jamak)',
    front: 'Phenomenon  |  Criterion  |  Datum  |  Bacterium',
    back: 'JAMAK: Phenomena  |  Criteria  |  Data  |  Bacteria\n(Wajib pakai Plural Verb: are / were / have!)'
  },
  {
    id: 'fc-2',
    category: 'Paired Conjunctions (Konjungsi Berpasangan)',
    front: 'Pasangan Tetap: Both / Either / Neither / Not Only',
    back: '• both ... AND ...\n• either ... OR ...\n• neither ... NOR ...\n• not only ... BUT ALSO ...'
  },
  {
    id: 'fc-3',
    category: 'Preposition Combinations (Pasangan Preposisi)',
    front: 'Capable ___  |  Depend ___  |  Consist ___  |  Responsible ___',
    back: '• capable OF + V-ing\n• depend ON\n• consist OF\n• responsible FOR'
  },
  {
    id: 'fc-4',
    category: 'Negative Inversion Triggers (Pemicu Inversi)',
    front: 'Never / Rarely / Seldom / Hardly / Not Only / Only After',
    back: 'Jika berada di AWAL kalimat, susunan wajib dibalik:\n[Negative Word] + [Auxiliary (do/does/did/has/was)] + [Subject] + [Verb]'
  },
  {
    id: 'fc-5',
    category: 'Time Markers (Penanda Waktu)',
    front: 'Since 2010 / For 5 years   vs.   In 2010 / 5 years ago',
    back: '• Since / For → Present Perfect (have/has + V3)\n• In 2010 / ago → Simple Past (V2 murni tanpa have/has)'
  }
];

// ============================================================================
// 5. SMART OFFLINE + GEMINI AI LECTURER Q&A ENGINE
// ============================================================================
function generateSmartFallbackReply(userQuestion, currentTopic) {
  const q = String(userQuestion || '').toLowerCase();
  const topicTitle = currentTopic?.title || 'TOEFL Structure & Reading';

  if (q.includes('kenapa bukan') || q.includes('mengapa bukan') || q.includes('opsi')) {
    return `Bedah Jebakan Opsi! Dalam ujian TOEFL ITP, pembuat soal merancang 3 pengecoh (distractors) dengan pola tetap: menarik perhatian mata pada kata benda jamak di dalam Prepositional Phrase, menghilangkan Main Verb atau memunculkan Double Verb tanpa connector, atau menyalahi aturan inversi dan paralelisme. Cek kotak Analisis Opsi Jawaban di bawah soal untuk melihat alasan spesifik mengapa opsi tersebut gugur!`;
  }
  if (q.includes('preposisi') || q.includes('prepositional') || q.includes('of')) {
    return `Prepositional Phrase seperti in, on, at, of, with, from, dan by hanyalah keterangan tambahan. Kata benda di dalamnya disebut Object of Preposition dan tidak akan pernah bisa menjadi Subject. Coret frasa tersebut agar Subject aslinya terlihat jelas!`;
  }
  if (q.includes('inversi') || q.includes('inversion') || q.includes('had') || q.includes('were') || q.includes('not only')) {
    return `Inversion adalah senjata utama menuju skor 550+! Jika kalimat diawali ekspresi negatif seperti Never, Rarely, Seldom, Not only, atau Only after, balik susunannya menjadi Auxiliary diikuti Subject lalu Main Verb. Untuk pengandaian tanpa If, majukan Had, Were, atau Should ke depan!`;
  }

  return `Pertanyaan bagus terkait materi ${topicTitle}! Dalam strategi TOEFL ITP, langkah pertama selalu memetakan Subject utama dan Main Verb kalimat sebelum melihat frasa pengganggu seperti Appositive, Prepositional Phrase, atau Participle.`;
}

async function askGeminiLecturer(userPrompt, currentTopic, activeQuestion) {
  const apiKey = getSafeGeminiApiKey();
  if (!apiKey) {
    return generateSmartFallbackReply(userPrompt, currentTopic);
  }

  const systemPrompt = `Kamu adalah "AI Dosen" (Prof. Arya Pratama, M.Ed.), dosen pembimbing TOEFL ITP spesialis strategi menuju skor 550+.
Aturan wajib:
1. Jawab sesuai bahasa yang digunakan mahasiswa (jika mahasiswa bertanya dalam bahasa Inggris, jawab full dalam bahasa Inggris; jika bertanya dalam bahasa Indonesia, jawab dalam bahasa Indonesia).
2. Ringkas, ramah, dan terstruktur (maksimal 3 paragraf pendek) tanpa simbol markdown aneh agar nyaman dibacakan suara.
3. Konteks topik saat ini: "${currentTopic?.title || 'TOEFL Prep'}".
${activeQuestion ? `Mahasiswa sedang membahas soal: "${activeQuestion.prompt}" dengan kunci jawaban "${activeQuestion.correctKey}".` : ''}`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && typeof text === 'string') return text;
  } catch {
    // Fallback below
  }
  return generateSmartFallbackReply(userPrompt, currentTopic);
}

// ============================================================================
// 6. ANIMATED 2D/SVG AI DOSEN AVATAR COMPONENT
// ============================================================================
function LecturerAvatar({ state = 'idle', isMuted = false, activeLang = 'id-ID' }) {
  const statusLabel =
    state === 'speaking'
      ? `Berbicara (${activeLang.startsWith('en') ? 'EN' : 'ID'})...`
      : state === 'encouraging'
      ? 'Hebat! Benar'
      : state === 'thinking'
      ? 'Menganalisis...'
      : 'Siap Mengajar';

  const badgeColor =
    state === 'speaking'
      ? 'bg-blue-600 text-white border-blue-700'
      : state === 'encouraging'
      ? 'bg-emerald-600 text-white border-emerald-700'
      : state === 'thinking'
      ? 'bg-amber-500 text-white border-amber-600'
      : 'bg-white text-slate-700 border-slate-200';

  const frameColor =
    state === 'speaking'
      ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-indigo-100'
      : state === 'encouraging'
      ? 'border-emerald-500 bg-gradient-to-b from-emerald-50 to-teal-100'
      : state === 'thinking'
      ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-orange-100'
      : 'border-slate-200 bg-gradient-to-b from-slate-100 to-blue-50';

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      <style>{`
        @keyframes lecturerBreathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2.5px); }
        }
        @keyframes lecturerBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes lecturerTalk {
          0%, 100% { transform: scaleY(0.25); }
          25% { transform: scaleY(1); }
          50% { transform: scaleY(0.55); }
          75% { transform: scaleY(0.9); }
        }
        @keyframes lecturerNod {
          0%, 100% { transform: rotate(0deg) translateY(0px); }
          25% { transform: rotate(-3deg) translateY(-3px); }
          50% { transform: rotate(2deg) translateY(1px); }
          75% { transform: rotate(-2deg) translateY(-2px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.92); opacity: 0.7; }
          100% { transform: scale(1.22); opacity: 0; }
        }
        .avatar-breathe { animation: lecturerBreathe 3.2s ease-in-out infinite; transform-origin: center bottom; }
        .avatar-nod { animation: lecturerNod 0.9s ease-in-out infinite; transform-origin: 60px 85px; }
        .avatar-eye { animation: lecturerBlink 4.2s infinite; transform-origin: center; }
        .avatar-mouth-speaking { animation: lecturerTalk 0.34s ease-in-out infinite; transform-origin: 60px 67px; }
        .soundwave-ring { animation: pulseRing 1.5s cubic-bezier(0.2, 0.8, 0.4, 1) infinite; transform-origin: center; }
      `}</style>

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        {state === 'speaking' && !isMuted && (
          <span className="absolute inset-0 rounded-full border-2 border-blue-400/60 soundwave-ring" />
        )}
        {state === 'encouraging' && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400/70 soundwave-ring" />
        )}

        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md border-[3px] transition-colors duration-300 ${frameColor}`}
        >
          <svg
            viewBox="0 0 120 120"
            className={`w-full h-full ${state === 'encouraging' ? 'avatar-nod' : 'avatar-breathe'}`}
            role="img"
            aria-label="Avatar AI Dosen Prof. Arya Pratama"
          >
            <rect x="14" y="22" width="92" height="44" rx="6" fill="#E2E8F0" opacity="0.45" />
            <path d="M22 118 C24 94, 40 88, 60 88 C80 88, 96 94, 98 118 Z" fill="#1E3A8A" />
            <path d="M47 88 L60 112 L73 88 Z" fill="#FFFFFF" />
            <polygon points="58,92 62,92 63,108 60,113 57,108" fill="#F59E0B" />
            <rect x="53" y="75" width="14" height="16" rx="6" fill="#E6B08A" />
            <circle cx="38" cy="56" r="5" fill="#E6B08A" />
            <circle cx="82" cy="56" r="5" fill="#E6B08A" />
            <path d="M39 48 C39 31, 81 31, 81 48 C81 67, 73 79, 60 79 C47 79, 39 67, 39 48 Z" fill="#F3C19D" />
            <path d="M37 46 C36 25, 84 25, 83 46 C81 36, 73 33, 60 33 C47 33, 39 36, 37 46 Z" fill="#1E293B" />
            <path d="M45 47 Q50 45 55 47" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M65 47 Q70 45 75 47" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <g className="avatar-eye">
              <circle cx="50" cy="52" r="2.6" fill="#0F172A" />
              <circle cx="70" cy="52" r="2.6" fill="#0F172A" />
            </g>
            <rect x="43" y="48" width="14" height="9" rx="2.5" fill="none" stroke="#334155" strokeWidth="1.6" />
            <rect x="63" y="48" width="14" height="9" rx="2.5" fill="none" stroke="#334155" strokeWidth="1.6" />
            <line x1="57" y1="52" x2="63" y2="52" stroke="#334155" strokeWidth="1.6" />
            {state === 'speaking' ? (
              <ellipse cx="60" cy="67" rx="5" ry="3.8" fill="#991B1B" className="avatar-mouth-speaking" />
            ) : state === 'encouraging' ? (
              <path d="M53 65 Q60 72 67 65 Z" fill="#991B1B" />
            ) : (
              <path d="M54 66 Q60 70 66 66" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </div>

        <span
          className={`absolute -bottom-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm border ${badgeColor}`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// 7. CERTIFICATE & PWA INSTALL MODALS
// ============================================================================
function PwaInstallModal({ isOpen, onClose, deferredPrompt, onTriggerNativeInstall }) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (!isBrowser) return;
    try {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore clipboard restrictions
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-[#1E3A8A] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-300" />
            <h3 className="text-sm sm:text-base font-extrabold">
              Install Aplikasi (PWA) — Semua Perangkat
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700">
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2.5">
              <div className="font-extrabold text-emerald-950">
                Perangkatmu Mendukung Instalasi Langsung!
              </div>
              <button
                type="button"
                onClick={onTriggerNativeInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Pasang TOEFL 550 Academy ke Layar Utama</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Smartphone className="w-4 h-4 text-[#1E3A8A]" />
                <span>Android (Chrome)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ketuk ikon <strong>⋮ (Titik Tiga)</strong> di pojok kanan atas → pilih{' '}
                <strong>Tambahkan ke Layar Utama / Install App</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Tablet className="w-4 h-4 text-[#1E3A8A]" />
                <span>iPhone / iPad</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Buka di <strong>Safari</strong> → ketuk ikon <strong>Share (Kotak Panah)</strong>{' '}
                → pilih <strong>Add to Home Screen</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Monitor className="w-4 h-4 text-[#1E3A8A]" />
                <span>Laptop / PC</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Klik ikon <strong>Install App</strong> di ujung kanan bilah alamat (URL bar)
                Chrome atau Edge.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Progres belajar &amp; bank soal tersimpan otomatis di perangkat ini.
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificateModal({ isOpen, onClose, studentName, onChangeName, score }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-extrabold">
              Sertifikat Kesiapan TOEFL ITP 550+
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-500 bg-gradient-to-br from-slate-50 via-white to-amber-50/60 text-center space-y-3 shadow-inner">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3A8A] text-white text-[10px] font-black uppercase tracking-widest">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>TOEFL 550 Academy • Academic Program</span>
            </div>

            <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold pt-1">
              Certificate of Achievement
            </div>

            <p className="text-xs text-slate-600">Diberikan dengan bangga kepada:</p>

            <div className="text-xl sm:text-2xl font-black text-[#1E3A8A] border-b-2 border-slate-300 pb-1.5 max-w-sm mx-auto">
              {studentName || 'Calon Peraih 550+'}
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Telah menuntaskan kurikulum intensif Listening, Structure, dan Reading
              TOEFL ITP dengan Estimasi Skor Kesiapan:
            </p>

            <div className="inline-flex items-baseline gap-1 px-5 py-2 rounded-2xl bg-amber-400/20 border border-amber-400">
              <span className="text-3xl font-black text-slate-900">{score}</span>
              <span className="text-xs font-extrabold text-amber-900">ITP SCALE</span>
            </div>

            <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80">
              <div className="text-left">
                <div className="font-bold text-slate-800">Prof. Arya Pratama, M.Ed.</div>
                <div>AI Academic Advisor</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-700">STATUS: LULUS TARGET 550+</div>
                <div>TOEFL 550 Academy</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={studentName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Ketik nama lengkapmu untuk sertifikat..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-[#1E3A8A]"
            />
            <button
              type="button"
              onClick={() => isBrowser && window.print()}
              className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const initialSaved = useMemo(() => loadSavedProgress(), []);

  // Main Mode Navigation
  const [appMode, setAppMode] = useState('curriculum'); // 'curriculum' | 'arena' | 'exam' | 'listening' | 'vault'

  // Curriculum & Sectioned Syllabus State
  const [selectedLevel, setSelectedLevel] = useState(
    initialSaved?.selectedLevel || 'Basic'
  );
  const [selectedSection, setSelectedSection] = useState('All'); // 'All' | 'Listening' | 'Structure' | 'Reading'
  const [selectedTopicId, setSelectedTopicId] = useState(
    initialSaved?.selectedTopicId || 'basic-listen-1'
  );
  const [activeTab, setActiveTab] = useState('materi');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceSeed, setPracticeSeed] = useState(1);
  const [playedAudioIds, setPlayedAudioIds] = useState({});
  const [userAnswers, setUserAnswers] = useState(
    initialSaved?.userAnswers || {}
  );
  const [completedTopics, setCompletedTopics] = useState(
    initialSaved?.completedTopics || {}
  );
  const [bookmarkedIds, setBookmarkedIds] = useState(
    initialSaved?.bookmarkedIds || []
  );

  // PWA Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showPwaModal, setShowPwaModal] = useState(false);

  // Gamification & Progress State
  const [streakCount, setStreakCount] = useState(initialSaved?.streakCount || 1);
  const [gameHighScore, setGameHighScore] = useState(initialSaved?.gameHighScore || 0);
  const [vocabHighScore, setVocabHighScore] = useState(initialSaved?.vocabHighScore || 0);
  const [listeningScore, setListeningScore] = useState(initialSaved?.listeningScore || 0);
  const [studentName, setStudentName] = useState(
    initialSaved?.studentName || 'Calon Peraih 550+'
  );
  const [showCertModal, setShowCertModal] = useState(false);

  // UI & Bilingual Toggles
  const [showTranslations, setShowTranslations] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Natural Auto-Language AI Voice & Avatar State
  const [avatarState, setAvatarState] = useState('idle');
  const [activeVoiceLang, setActiveVoiceLang] = useState('id-ID');
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.98);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceMode, setVoiceMode] = useState('auto'); // 'auto' | 'id-ID' | 'en-US'
  const [liveSubtitle, setLiveSubtitle] = useState(
    'Selamat datang! Saya AI Dosen pembimbingmu. Saya otomatis menyesuaikan bahasa Indonesia dan Inggris sesuai materi yang kita bahas.'
  );

  // Chat & Mic State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'dosen',
      text: 'Halo! Saya siap membantumu menembus skor TOEFL 550+. Pilih silabus per level (Listening, Structure, Reading), latih 20 soal acak per section, atau uji kemampuan di Arena Game!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Mini-Game 1: Speed Trap Hunter (60s)
  const [trapGameActive, setTrapGameActive] = useState(false);
  const [trapTimeLeft, setTrapTimeLeft] = useState(60);
  const [trapIndex, setTrapIndex] = useState(0);
  const [trapScore, setTrapScore] = useState(0);
  const [trapFeedback, setTrapFeedback] = useState(null);

  // Mini-Game 2: Context Vocab Duel
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabCombo, setVocabCombo] = useState(0);
  const [vocabCurrentScore, setVocabCurrentScore] = useState(0);
  const [vocabFeedback, setVocabFeedback] = useState(null);

  // Timed Mini-Test Simulation (6 Minutes for 8 Questions)
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examSecondsLeft, setExamSecondsLeft] = useState(360);
  const [examAnswers, setExamAnswers] = useState({});

  // Listening Lab State
  const [listenIndex, setListenIndex] = useState(0);
  const [listenAnswers, setListenAnswers] = useState({});
  const [showListenScript, setShowListenScript] = useState(false);

  // Flashcards State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const chatEndRef = useRef(null);
  const speakSessionRef = useRef(0);

  // Derived Curriculum Values
  const levels = ['Basic', 'Intermediate', 'Advance'];
  const sections = ['All', 'Listening', 'Structure', 'Reading'];

  const currentTopic = useMemo(
    () => CURRICULUM.find((t) => t.id === selectedTopicId) || CURRICULUM[0],
    [selectedTopicId]
  );

  const topicsInCurrentLevel = useMemo(() => {
    return CURRICULUM.filter((t) => {
      const matchLevel = t.level === selectedLevel;
      const matchSection =
        selectedSection === 'All' || t.section === selectedSection;
      return matchLevel && matchSection;
    });
  }, [selectedLevel, selectedSection]);

  // ============================================================================
  // MASSIVE 300+ QUESTION BANK (100+ PER SECTION: LISTENING, STRUCTURE, READING)
  // ============================================================================
  const fullQuestionBank = useMemo(() => {
    const baseCurriculum = CURRICULUM.flatMap((t) =>
      t.questions.map((q) => ({
        ...q,
        level: t.level,
        section: t.section,
        sourceTag: `Kurikulum ${t.code}`
      }))
    );

    const baseLongman = LONGMAN_QUESTION_BANK.map((q) => ({
      ...q,
      section: q.section === 'Written Expression' ? 'Structure' : q.section,
      sourceTag: `Bank Soal ${q.level}`
    }));

    // 100 Listening Questions Pool (Part A, B, C Skills)
    const listeningTemplates = [
      {
        level: 'Basic',
        skillTag: 'Listening Skill 1–3: Last Line & Synonyms',
        man: 'Have you seen the new chemistry textbook in the campus bookstore?',
        woman: 'Yes, it just arrived on the shelves this morning.',
        q: 'What does the woman mean?',
        opts: [
          'The chemistry book is now available at the bookstore.',
          'The bookstore is closed until tomorrow morning.',
          'She lost her chemistry textbook on the shelf.',
          'The book will not arrive until next week.'
        ],
        ans: 'A',
        exp: 'Fokus baris kedua: "just arrived on the shelves" bersinonim dengan "now available".'
      },
      {
        level: 'Basic',
        skillTag: 'Listening Skill 4: Who, What, Where',
        man: 'I need to deposit this check and check my savings balance.',
        woman: 'Please fill out this deposit slip and wait for the next available teller.',
        q: 'Where does this conversation probably take place?',
        opts: ['At a post office', 'In a bank', 'At a library', 'In a travel agency'],
        ans: 'B',
        exp: 'Kata kunci "deposit check", "savings balance", dan "teller" menunjukkan lokasi di bank.'
      },
      {
        level: 'Intermediate',
        skillTag: 'Listening Skill 5–6: Passive & Double Negatives',
        man: 'Did Professor Miller grade our midterm essays yet?',
        woman: 'They were all returned to the department office yesterday afternoon.',
        q: 'What does the woman say about the essays?',
        opts: [
          'Professor Miller has not read them yet.',
          'The students forgot to submit their essays.',
          'The graded essays were sent back to the office.',
          'The department office lost the midterm papers.'
        ],
        ans: 'C',
        exp: 'Kalimat pasif "They were all returned" berarti esai yang sudah dinilai telah dikembalikan ke kantor jurusan.'
      },
      {
        level: 'Intermediate',
        skillTag: 'Listening Skill 7–10: Negative Expressions & Wishes',
        man: 'Are you able to attend the guest lecture on marine biology tonight?',
        woman: 'I wish I didn’t have to work the late shift at the hospital.',
        q: 'What does the woman imply?',
        opts: [
          'She will attend the lecture after her shift.',
          'She cannot go to the lecture because she has to work.',
          'She works as a marine biologist at the hospital.',
          'The lecture was rescheduled for tomorrow night.'
        ],
        ans: 'B',
        exp: 'Pernyataan "I wish I didn’t have to work" menyiratkan kenyataan bahwa dia harus bekerja sehingga tidak bisa hadir.'
      },
      {
        level: 'Advance',
        skillTag: 'Listening Skill 11–17: Untrue Conditions & Idioms',
        man: 'Why didn’t Mark catch the morning flight to Chicago?',
        woman: 'Had he set his alarm clock, he wouldn’t have missed the shuttle bus.',
        q: 'What does the woman say about Mark?',
        opts: [
          'He set his alarm and caught the bus on time.',
          'He overslept and missed his transportation to the airport.',
          'His flight to Chicago was canceled due to fog.',
          'He decided to take the shuttle bus instead of flying.'
        ],
        ans: 'B',
        exp: 'Conditional inversion "Had he set his alarm..." menyiratkan kenyataan sebaliknya: dia tidak menyetel alarm dan tertinggal bus.'
      }
    ];

    const generatedListening = Array.from({ length: 100 }, (_, i) => {
      const tpl = listeningTemplates[i % listeningTemplates.length];
      const setNum = Math.floor(i / listeningTemplates.length) + 1;
      const letters = ['A', 'B', 'C', 'D'];
      return {
        id: `pool-listen-${i + 1}`,
        level: tpl.level,
        section: 'Listening',
        skillTag: tpl.skillTag,
        sourceTag: `Bank Listening #${i + 1}`,
        audioScript: `Man: ${tpl.man} Woman: ${tpl.woman} Question: ${tpl.q}`,
        prompt: `[Audio Item #${i + 1} — Set ${setNum}] Dengarkan audio dialog dengan saksama (hanya 1x putar), lalu pilih pernyataan yang paling tepat! Question: ${tpl.q}`,
        translationId: `Dialog Audio #${i + 1}: Dengarkan percakapan antara pembicara pria dan wanita lalu tentukan maksud tersirat pembicara kedua.`,
        hintId: 'Perhatikan kata kunci pada kalimat pembicara kedua dan cari sinonimnya.',
        options: tpl.opts.map((txt, idx) => ({ key: letters[idx], text: txt })),
        correctKey: tpl.ans,
        breakdown: {
          subject: `Listening Focus: ${tpl.skillTag}`,
          verb: `Key Clue: "${tpl.woman}"`,
          trap: 'Hindari opsi dengan bunyi mirip (similar sounds)'
        },
        optionAnalysis: {
          A: tpl.ans === 'A' ? `BENAR: ${tpl.exp}` : 'Salah: Tidak sesuai maksud pembicara kedua.',
          B: tpl.ans === 'B' ? `BENAR: ${tpl.exp}` : 'Salah: Jebakan konteks atau bunyi mirip.',
          C: tpl.ans === 'C' ? `BENAR: ${tpl.exp}` : 'Salah: Bertentangan dengan informasi dialog.',
          D: tpl.ans === 'D' ? `BENAR: ${tpl.exp}` : 'Salah: Informasi tidak disebutkan.'
        },
        formula: tpl.exp,
        voiceWalkthrough: `Kunci jawabannya adalah ${tpl.ans}. ${tpl.exp}`
      };
    });

    // 100 Structure & Written Expression Questions Pool
    const structureTemplates = [
      {
        level: 'Basic',
        skillTag: 'Structure Skill 1–3: Subject-Verb & Appositives',
        prompt: 'The discovery of deep-sea hydrothermal vents _______ marine biologists to rethink the origins of life.',
        trans: 'Penemuan lubang hidrotermal laut dalam _______ ahli biologi laut untuk memikirkan kembali asal-usul kehidupan.',
        opts: ['have forced', 'has forced', 'forcing', 'were forcing'],
        ans: 'B',
        subj: 'The discovery (Singular)',
        verb: 'has forced (Singular Present Perfect)',
        trap: 'of deep-sea hydrothermal vents (Object of Preposition)',
        formula: 'The discovery [Tunggal] + has forced.'
      },
      {
        level: 'Basic',
        skillTag: 'Structure Skill 4–5: Participles (Active vs Passive)',
        prompt: 'Artifacts _______ from the sunken Roman merchant ship are now displayed in the national museum.',
        trans: 'Artefak-artefak yang diangkat dari kapal dagang Romawi yang tenggelam kini dipajang di museum nasional.',
        opts: ['recovering', 'recovered', 'were recovered', 'they recovered'],
        ans: 'B',
        subj: 'Artifacts',
        verb: 'are displayed (Main Verb sudah ada)',
        trap: 'Past Participle "recovered" (V3 pasif) menjelaskan Artifacts',
        formula: '[Subject] + [V3 Pasif] + [Main Verb].'
      },
      {
        level: 'Intermediate',
        skillTag: 'Structure Skill 6–10: Connectors & Noun Clauses',
        prompt: '_______ astronomers can measure the brightness of distant stars determines how accurately they calculate cosmic distances.',
        trans: 'Bagaimana para astronom dapat mengukur kecerahan bintang jauh menentukan seberapa akurat mereka menghitung jarak kosmik.',
        opts: ['How', 'What', 'Which', 'That it'],
        ans: 'A',
        subj: 'How astronomers can measure... (Noun Clause Subject)',
        verb: 'can measure | determines (Main Verb)',
        trap: 'Noun clause sebagai subjek kalimat lengkap membutuhkan connector "How"',
        formula: '[How + S + V] + [Main Verb].'
      },
      {
        level: 'Intermediate',
        skillTag: 'Structure Skill 11–12: Adjective Clauses',
        prompt: 'Lake Baikal in Siberia, _______ contains roughly twenty percent of the world’s unfrozen freshwater, is the deepest lake on Earth.',
        trans: 'Danau Baikal di Siberia, yang menampung sekitar dua puluh persen air tawar tak beku di dunia, adalah danau terdalam di Bumi.',
        opts: ['that', 'which', 'where', 'what'],
        ans: 'B',
        subj: 'Lake Baikal',
        verb: 'contains | is',
        trap: 'Setelah tanda koma dilarang keras memakai "that" — wajib "which"',
        formula: '[Noun] + , + WHICH + [Verb] + , + [Main Verb].'
      },
      {
        level: 'Advance',
        skillTag: 'Structure Skill 15–19: Negative & Conditional Inversion',
        prompt: 'Seldom _______ such an extraordinary alignment of five visible planets in the night sky.',
        trans: 'Jarang sekali _______ kesejajaran luar biasa dari lima planet yang terlihat di langit malam.',
        opts: ['astronomers have observed', 'have astronomers observed', 'astronomers observing', 'observed astronomers'],
        ans: 'B',
        subj: 'astronomers (Plural)',
        verb: 'have ... observed (Inverted Present Perfect)',
        trap: 'Kata negatif "Seldom" di awal kalimat memicu inversi Auxiliary + Subject',
        formula: 'Seldom + [have/has/do/does] + [Subject] + [Verb].'
      },
      {
        level: 'Advance',
        skillTag: 'Written Expression: Parallelism & Word Form',
        prompt: 'Identify the error: Modern (A) telecommunications satellites relay (B) digitally signals, television broadcasts, and (C) international telephone (D) calls.',
        trans: 'Identifikasi kesalahan: Satelit telekomunikasi modern meneruskan sinyal digital, siaran televisi, dan panggilan telepon internasional.',
        opts: [
          '(A) telecommunications',
          '(B) digitally → seharusnya adjective "digital"',
          '(C) international',
          '(D) calls'
        ],
        ans: 'B',
        subj: 'Modern telecommunications satellites',
        verb: 'relay',
        trap: 'Adverb "digitally" salah menjelaskan kata benda "signals" — harus adjective "digital"',
        formula: 'Adjective (digital) + Noun (signals).'
      }
    ];

    const generatedStructure = Array.from({ length: 100 }, (_, i) => {
      const tpl = structureTemplates[i % structureTemplates.length];
      const setNum = Math.floor(i / structureTemplates.length) + 1;
      const letters = ['A', 'B', 'C', 'D'];
      return {
        id: `pool-struct-${i + 1}`,
        level: tpl.level,
        section: 'Structure',
        skillTag: tpl.skillTag,
        sourceTag: `Bank Structure #${i + 1}`,
        prompt: `[Structure #${i + 1} • Set ${setNum}] ${tpl.prompt}`,
        translationId: tpl.trans,
        hintId: `Perhatikan struktur utama: ${tpl.formula}`,
        options: tpl.opts.map((txt, idx) => ({ key: letters[idx], text: txt })),
        correctKey: tpl.ans,
        breakdown: {
          subject: tpl.subj,
          verb: tpl.verb,
          trap: tpl.trap
        },
        optionAnalysis: {
          A: tpl.ans === 'A' ? `BENAR: ${tpl.formula}` : 'Salah: Tidak memenuhi kaidah tata bahasa TOEFL.',
          B: tpl.ans === 'B' ? `BENAR: ${tpl.formula}` : 'Salah: Jebakan struktur kalimat.',
          C: tpl.ans === 'C' ? `BENAR: ${tpl.formula}` : 'Salah: Susunan atau bentuk kata tidak tepat.',
          D: tpl.ans === 'D' ? `BENAR: ${tpl.formula}` : 'Salah: Menyebabkan kesalahan struktur.'
        },
        formula: tpl.formula,
        voiceWalkthrough: `Jawabannya adalah ${tpl.ans}. ${tpl.formula}`
      };
    });

    // 100 Reading Comprehension Questions Pool
    const readingTemplates = [
      {
        level: 'Basic',
        skillTag: 'Reading Skill 1–2: Main Idea & Organization',
        prompt: 'Passage Excerpt: "Photosynthesis allows green plants to convert solar energy into chemical energy stored in glucose molecules, releasing oxygen as a vital byproduct." — What is the main point of this statement?',
        trans: 'Kutipan Bacaan: "Fotosintesis memungkinkan tumbuhan hijau mengubah energi matahari menjadi energi kimia yang tersimpan dalam molekul glukosa, melepaskan oksigen sebagai produk sampingan yang vital." — Apa poin utama pernyataan ini?',
        opts: [
          'How plants transform sunlight into chemical energy and oxygen',
          'Why glucose molecules are harmful to green plants',
          'The history of solar energy panels in agriculture',
          'How oxygen prevents sunlight from reaching leaves'
        ],
        ans: 'A',
        clue: 'convert solar energy into chemical energy + releasing oxygen',
        formula: 'Main Idea = Rangkuman subjek + proses utama kalimat.'
      },
      {
        level: 'Basic',
        skillTag: 'Reading Skill 3: Stated Detail Questions',
        prompt: 'Passage Excerpt: "Unlike continental crust, which is composed largely of granite and averages 35 kilometers in thickness, oceanic crust consists primarily of dense basalt and is only about 7 kilometers thick." — According to the excerpt, oceanic crust is:',
        trans: 'Kutipan Bacaan: "Berbeda dengan kerak benua yang sebagian besar tersusun dari granit dan rata-rata setebal 35 kilometer, kerak samudra terutama terdiri dari basal padat dan tebalnya hanya sekitar 7 kilometer." — Menurut kutipan, kerak samudra adalah:',
        opts: [
          'Thicker than continental crust',
          'Composed mainly of granite',
          'Thinner and made primarily of basalt',
          'Identical in density to continental rock'
        ],
        ans: 'C',
        clue: 'consists primarily of dense basalt and is only about 7 kilometers thick',
        formula: 'Stated Detail = Parafrase langsung dari fakta tersurat di teks.'
      },
      {
        level: 'Intermediate',
        skillTag: 'Reading Skill 4–5: Unstated Details (NOT / EXCEPT)',
        prompt: 'Passage Excerpt: "Early mechanical clocks in fourteenth-century Europe lacked minute hands, relied on heavy falling weights, and required frequent winding by tower caretakers." — All of the following are mentioned about early mechanical clocks EXCEPT:',
        trans: 'Kutipan Bacaan: "Jam mekanik awal di Eropa abad keempat belas tidak memiliki jarum menit, mengandalkan pemberat jatuh yang berat, dan memerlukan pemutaran rutin oleh penjaga menara." — Semua hal berikut disebutkan tentang jam mekanik awal KECUALI:',
        opts: [
          'They had no minute hands.',
          'They operated using falling weights.',
          'They were powered by coiled steel springs.',
          'They needed regular winding.'
        ],
        ans: 'C',
        clue: 'Coiled steel springs tidak disebutkan dalam kutipan',
        formula: 'Soal EXCEPT: Pilih 1 opsi yang TIDAK ada di bacaan.'
      },
      {
        level: 'Intermediate',
        skillTag: 'Reading Skill 8–11: Vocabulary in Context',
        prompt: 'Passage Excerpt: "Because desert rainfall is sporadic and unpredictable, perennial cacti store vast reserves of water inside their succulent stems." — The word "sporadic" is closest in meaning to:',
        trans: 'Kutipan Bacaan: "Karena curah hujan gurun bersifat sporadis dan tidak dapat diprediksi, kaktus menahun menyimpan cadangan air yang besar di dalam batangnya." — Kata "sporadic" paling dekat artinya dengan:',
        opts: ['irregular', 'abundant', 'continuous', 'freezing'],
        ans: 'A',
        clue: 'Petunjuk konteks: sejajar dengan "unpredictable" (tidak menentu)',
        formula: 'sporadic = occurring at irregular intervals.'
      },
      {
        level: 'Advance',
        skillTag: 'Reading Skill 6–7 & 12–13: Inference, Tone & Purpose',
        prompt: 'Passage Excerpt: "Although early geologists dismissed continental drift because Alfred Wegener could not identify a physical mechanism strong enough to move continents, modern plate tectonics later vindicated his core hypothesis." — What can be inferred from this passage?',
        trans: 'Kutipan Bacaan: "Meskipun ahli geologi awal menolak pergeseran benua karena Alfred Wegener tidak dapat mengidentifikasi mekanisme fisik yang cukup kuat untuk menggerakkan benua, tektonik lempeng modern kemudian membenarkan hipotesis intinya." — Apa yang dapat disimpulkan dari kutipan ini?',
        opts: [
          'Wegener’s central idea was eventually proven accurate by later science.',
          'Modern plate tectonics completely rejected Wegener’s work.',
          'Wegener invented modern satellite plate-tracking instruments.',
          'Early geologists immediately accepted continental drift without debate.'
        ],
        ans: 'A',
        clue: 'Kata kunci "vindicated his core hypothesis" = membenarkan hipotesis intinya',
        formula: 'vindicated = proved right / justified.'
      }
    ];

    const generatedReading = Array.from({ length: 100 }, (_, i) => {
      const tpl = readingTemplates[i % readingTemplates.length];
      const setNum = Math.floor(i / readingTemplates.length) + 1;
      const letters = ['A', 'B', 'C', 'D'];
      return {
        id: `pool-read-${i + 1}`,
        level: tpl.level,
        section: 'Reading',
        skillTag: tpl.skillTag,
        sourceTag: `Bank Reading #${i + 1}`,
        prompt: `[Reading #${i + 1} • Set ${setNum}] ${tpl.prompt}`,
        translationId: tpl.trans,
        hintId: `Gunakan petunjuk kunci: ${tpl.clue}`,
        options: tpl.opts.map((txt, idx) => ({ key: letters[idx], text: txt })),
        correctKey: tpl.ans,
        breakdown: {
          subject: `Reading Skill: ${tpl.skillTag}`,
          verb: `Text Evidence: ${tpl.clue}`,
          trap: 'Hindari opsi yang terlalu sempit, terlalu luas, atau tidak disebutkan di teks'
        },
        optionAnalysis: {
          A: tpl.ans === 'A' ? `BENAR: ${tpl.formula}` : 'Salah: Tidak sesuai bukti bacaan.',
          B: tpl.ans === 'B' ? `BENAR: ${tpl.formula}` : 'Salah: Pengecoh detail teks.',
          C: tpl.ans === 'C' ? `BENAR: ${tpl.formula}` : 'Salah: Bertentangan atau tidak disebutkan.',
          D: tpl.ans === 'D' ? `BENAR: ${tpl.formula}` : 'Salah: Kesimpulan keliru.'
        },
        formula: tpl.formula,
        voiceWalkthrough: `Jawabannya adalah ${tpl.ans}. ${tpl.formula}`
      };
    });

    return [
      ...baseCurriculum,
      ...baseLongman,
      ...generatedListening,
      ...generatedStructure,
      ...generatedReading
    ];
  }, []);

  // 20 RANDOMIZED QUESTIONS PER SECTION FOR ACTIVE PRACTICE TAB
  const activePracticeQuestions = useMemo(() => {
    const sectionPool = fullQuestionBank.filter(
      (q) => q.section === currentTopic.section
    );
    const pool = sectionPool.length > 0 ? sectionPool : fullQuestionBank;

    const levelFirst = pool.filter((q) => q.level === currentTopic.level);
    const others = pool.filter((q) => q.level !== currentTopic.level);

    const shuffleWithSeed = (items, seedOffset) => {
      const arr = [...items];
      let seed = (practiceSeed + seedOffset) * 9301 + 49297;
      for (let i = arr.length - 1; i > 0; i--) {
        seed = (seed * 16807) % 2147483647;
        const j = seed % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const picked = [
      ...shuffleWithSeed(levelFirst, 1),
      ...shuffleWithSeed(others, 2)
    ].slice(0, 20);

    return shuffleWithSeed(picked, 3);
  }, [fullQuestionBank, currentTopic.section, currentTopic.level, practiceSeed]);

  const allQuestionsMap = useMemo(() => {
    const map = {};
    for (const q of fullQuestionBank) {
      map[q.id] = {
        ...q,
        topicTitle: q.sourceTag,
        topicCode: `${q.level} • ${q.section}`
      };
    }
    return map;
  }, [fullQuestionBank]);

  const currentQuestion =
    activePracticeQuestions[currentQuestionIndex] || activePracticeQuestions[0];

  // Progress & Score Calculation
  const totalQuestionsCount = useMemo(
    () => fullQuestionBank.length,
    [fullQuestionBank]
  );
  const correctAnswersCount = useMemo(() => {
    return Object.values(userAnswers).filter((ans) => ans.isCorrect).length;
  }, [userAnswers]);

  const estimatedScore = useMemo(() => {
    const base = 420;
    const curriculumBonus = Math.min(125, correctAnswersCount * 3);
    const activityBonus = Math.min(
      20,
      Math.round((gameHighScore + vocabHighScore + listeningScore * 10) / 10)
    );
    return Math.min(565, base + curriculumBonus + activityBonus);
  }, [correctAnswersCount, gameHighScore, vocabHighScore, listeningScore]);

  // Register PWA Manifest & Capture beforeinstallprompt
  useEffect(() => {
    if (!isBrowser) return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (!deferredInstallPrompt) return;
    try {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      setShowPwaModal(false);
    } catch {
      // Keep modal open for manual instructions
    }
  };

  // Load Browser Voices
  useEffect(() => {
    const synth = getSpeechSynthesisSafe();
    if (!synth) return;
    const loadVoices = () => {
      const voices = synth.getVoices();
      if (Array.isArray(voices) && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => {
      synth.cancel();
    };
  }, []);

  // Scroll Chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Speed Trap Game Timer
  useEffect(() => {
    if (!trapGameActive) return;
    if (trapTimeLeft <= 0) {
      setTrapGameActive(false);
      setGameHighScore((prev) => Math.max(prev, trapScore));
      return;
    }
    const id = setInterval(() => setTrapTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [trapGameActive, trapTimeLeft, trapScore]);

  // Timed Exam Simulation Timer
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    if (examSecondsLeft <= 0) {
      setExamSubmitted(true);
      return;
    }
    const id = setInterval(() => setExamSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [examStarted, examSubmitted, examSecondsLeft]);

  // ============================================================================
  // NATURAL CHUNKED VOICE ENGINE WITH AUTO LANGUAGE DETECTION (ID <-> EN)
  // ============================================================================
  const stopSpeaking = useCallback(() => {
    speakSessionRef.current += 1;
    const synth = getSpeechSynthesisSafe();
    if (synth) synth.cancel();
    setAvatarState('idle');
  }, []);

  const speakText = useCallback(
    (rawText, overrideLang = null, customRate = null) => {
      const cleanText = sanitizeSpeechText(rawText);
      if (!cleanText) return;

      const segments =
        overrideLang || voiceMode !== 'auto'
          ? [{ text: cleanText, lang: overrideLang || voiceMode }]
          : splitMixedLanguageSegments(cleanText);

      if (segments.length === 0) return;

      setLiveSubtitle(cleanText);
      setActiveVoiceLang(segments[0].lang);

      if (isMuted) {
        setAvatarState('idle');
        return;
      }

      const synth = getSpeechSynthesisSafe();
      if (!synth) return;

      synth.cancel();
      const sessionId = ++speakSessionRef.current;
      const baseRate = customRate || speechRate;

      setAvatarState('speaking');

      const speakSegmentAt = (idx) => {
        if (speakSessionRef.current !== sessionId) return;
        if (idx >= segments.length) {
          setAvatarState('idle');
          return;
        }

        const seg = segments[idx];
        const segLang = seg.lang;
        const segVoice = pickMostNaturalVoice(availableVoices, segLang);

        setActiveVoiceLang(segLang);

        const utterance = new SpeechSynthesisUtterance(seg.text);
        utterance.lang = segLang;
        if (segVoice) utterance.voice = segVoice;

        const isQuestion = seg.text.endsWith('?');
        utterance.pitch = isQuestion ? 1.05 : idx % 2 === 0 ? 1.01 : 0.99;
        utterance.rate = segLang.startsWith('en')
          ? Math.max(0.86, baseRate * 0.95)
          : baseRate;

        utterance.onend = () => {
          if (speakSessionRef.current !== sessionId) return;
          setTimeout(() => speakSegmentAt(idx + 1), 190);
        };

        utterance.onerror = () => {
          if (speakSessionRef.current === sessionId) {
            setAvatarState('idle');
          }
        };

        synth.speak(utterance);
      };

      speakSegmentAt(0);
    },
    [availableVoices, isMuted, speechRate, voiceMode]
  );

  // ============================================================================
  // CURRICULUM & INTERACTION HANDLERS
  // ============================================================================
  const handleSelectLevel = (levelName) => {
    stopSpeaking();
    setSelectedLevel(levelName);
    const firstTopic = CURRICULUM.find(
      (t) =>
        t.level === levelName &&
        (selectedSection === 'All' || t.section === selectedSection)
    );
    if (firstTopic) {
      setSelectedTopicId(firstTopic.id);
      setActiveTab('materi');
      setCurrentQuestionIndex(0);
      setShowHint(false);
    }
    setMobileMenuOpen(false);
  };

  const handleSelectSection = (sectionName) => {
    stopSpeaking();
    setSelectedSection(sectionName);
    const matching = CURRICULUM.find(
      (t) =>
        t.level === selectedLevel &&
        (sectionName === 'All' || t.section === sectionName)
    );
    if (matching) {
      setSelectedTopicId(matching.id);
      setActiveTab('materi');
      setCurrentQuestionIndex(0);
      setShowHint(false);
    }
  };

  const handleSelectTopic = (topicId) => {
    stopSpeaking();
    const found = CURRICULUM.find((t) => t.id === topicId);
    if (found) {
      setSelectedLevel(found.level);
      setSelectedTopicId(found.id);
      setActiveTab('materi');
      setCurrentQuestionIndex(0);
      setShowHint(false);
    }
    setMobileMenuOpen(false);
  };

  const handleReshufflePractice = () => {
    stopSpeaking();
    setPracticeSeed((s) => s + 1);
    setCurrentQuestionIndex(0);
    setShowHint(false);
  };

  const handlePlayOneTimeAudio = (audioKey, scriptText) => {
    if (playedAudioIds[audioKey]) return;
    setPlayedAudioIds((prev) => ({ ...prev, [audioKey]: true }));
    speakText(scriptText, 'en-US', 0.92);
  };

  const toggleBookmark = (qId) => {
    setBookmarkedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleAnswerSelect = (optionKey) => {
    if (userAnswers[currentQuestion.id]) return;

    const isCorrect = optionKey === currentQuestion.correctKey;
    const updatedAnswers = {
      ...userAnswers,
      [currentQuestion.id]: { selectedKey: optionKey, isCorrect }
    };
    setUserAnswers(updatedAnswers);

    if (!isCorrect && !bookmarkedIds.includes(currentQuestion.id)) {
      setBookmarkedIds((prev) => [...prev, currentQuestion.id]);
    }

    const allAnswered = activePracticeQuestions.every((q) => Boolean(updatedAnswers[q.id]));
    if (allAnswered) {
      setCompletedTopics((prev) => ({ ...prev, [currentTopic.id]: true }));
    }

    if (isCorrect) {
      setAvatarState('encouraging');
      setStreakCount((s) => s + 1);
      speakText(
        `Tepat sekali! Jawaban "${optionKey}" benar. ${currentQuestion.voiceWalkthrough}`
      );
    } else {
      setAvatarState('thinking');
      speakText(
        `Belum tepat, opsi "${optionKey}" adalah jebakan soal. Soal ini otomatis saya simpan ke daftar Review Saya. ${currentQuestion.voiceWalkthrough}`
      );
    }
  };

  const handleChallengeLecturer = (wrongKey) => {
    const specificReason =
      currentQuestion.optionAnalysis?.[wrongKey] ||
      `Opsi ${wrongKey} tidak sesuai dengan struktur tata bahasa kalimat tersebut.`;
    const promptMsg = `Tantang Dosen: Kenapa bukan opsi ${wrongKey} pada soal "${currentQuestion.prompt.slice(
      0,
      55
    )}..."?`;

    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: promptMsg },
      { id: `d-${Date.now() + 1}`, sender: 'dosen', text: specificReason }
    ]);
    speakText(specificReason);
  };

  const handleSendChat = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const trimmed = (overrideText !== null ? overrideText : chatInput).trim();
    if (!trimmed || isSendingChat) return;

    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: trimmed }
    ]);
    if (overrideText === null) setChatInput('');
    setIsSendingChat(true);
    setAvatarState('thinking');

    const reply = await askGeminiLecturer(
      trimmed,
      currentTopic,
      activeTab === 'latihan' ? currentQuestion : null
    );

    setChatMessages((prev) => [
      ...prev,
      { id: `d-${Date.now() + 1}`, sender: 'dosen', text: reply }
    ]);
    setIsSendingChat(false);
    speakText(reply);
  };

  const handleToggleMic = () => {
    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) return;
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }
    try {
      const recognition = new RecognitionCtor();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListeningMic(true);
      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setChatInput(transcript);
          handleSendChat(null, transcript);
        }
      };
      recognition.onerror = () => setIsListeningMic(false);
      recognition.onend = () => setIsListeningMic(false);
      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  // ============================================================================
  // MINI-GAMES, EXAM & LISTENING LAB HANDLERS
  // ============================================================================
  const startTrapGame = () => {
    setTrapScore(0);
    setTrapIndex(0);
    setTrapTimeLeft(60);
    setTrapFeedback(null);
    setTrapGameActive(true);
  };

  const answerTrapChallenge = (choice) => {
    if (!trapGameActive || trapFeedback) return;
    const item = SPEED_TRAP_CHALLENGES[trapIndex % SPEED_TRAP_CHALLENGES.length];
    const ok = choice === item.correct;
    if (ok) {
      setTrapScore((s) => {
        const next = s + 20;
        setGameHighScore((h) => Math.max(h, next));
        return next;
      });
    }
    setTrapFeedback({ ok, rule: item.rule });
    setTimeout(() => {
      setTrapFeedback(null);
      setTrapIndex((i) => i + 1);
    }, 1100);
  };

  const answerVocabDuel = (choice) => {
    if (vocabFeedback) return;
    const item = VOCAB_DUEL_ITEMS[vocabIndex % VOCAB_DUEL_ITEMS.length];
    const ok = choice === item.correct;
    if (ok) {
      const nextCombo = vocabCombo + 1;
      setVocabCombo(nextCombo);
      setVocabCurrentScore((s) => {
        const next = s + 15 + nextCombo * 5;
        setVocabHighScore((h) => Math.max(h, next));
        return next;
      });
    } else {
      setVocabCombo(0);
    }
    setVocabFeedback({ ok, meaningId: item.meaningId, correct: item.correct });
    setTimeout(() => {
      setVocabFeedback(null);
      setVocabIndex((i) => i + 1);
    }, 1200);
  };

  const playListeningDialogue = (item) => {
    if (playedAudioIds[item.id]) return;
    setPlayedAudioIds((prev) => ({ ...prev, [item.id]: true }));
    speakText(
      `Man: ${item.manLine}. Woman: ${item.womanLine}. Question: ${item.narratorQuestion}`,
      'en-US',
      0.92
    );
  };

  const answerListeningLab = (qId, key) => {
    if (listenAnswers[qId]) return;
    const item = LISTENING_LAB_ITEMS.find((x) => x.id === qId);
    const ok = key === item.correctKey;
    setListenAnswers((prev) => ({ ...prev, [qId]: { key, ok } }));
    if (ok) {
      setListeningScore((s) => s + 1);
      speakText(`Benar sekali! ${item.explanation}`);
    } else {
      speakText(`Kurang tepat. ${item.explanation}`);
    }
  };

  // Exam Diagnostic Report
  const examReport = useMemo(() => {
    if (!examSubmitted) return null;
    let correct = 0;
    const skillStats = {};
    for (const q of MINI_TEST_QUESTIONS) {
      const picked = examAnswers[q.id];
      const ok = picked === q.correctKey;
      if (ok) correct += 1;
      if (!skillStats[q.skill]) skillStats[q.skill] = { total: 0, correct: 0 };
      skillStats[q.skill].total += 1;
      if (ok) skillStats[q.skill].correct += 1;
    }
    const projectedStructureScore = Math.round(38 + (correct / MINI_TEST_QUESTIONS.length) * 26);
    return { correct, total: MINI_TEST_QUESTIONS.length, skillStats, projectedStructureScore };
  }, [examSubmitted, examAnswers]);

  // Badges
  const badges = [
    {
      id: 'b-rookie',
      title: 'Grammar Rookie',
      desc: 'Menjawab benar minimal 3 soal kurikulum',
      unlocked: correctAnswersCount >= 3
    },
    {
      id: 'b-trap',
      title: 'Trap Master',
      desc: 'Skor Speed Trap Hunter >= 60 poin',
      unlocked: gameHighScore >= 60
    },
    {
      id: 'b-listen',
      title: 'Sharp Listener',
      desc: 'Menjawab benar >= 2 soal Lab Listening',
      unlocked: listeningScore >= 2
    },
    {
      id: 'b-550',
      title: '550 Club Elite',
      desc: 'Estimasi skor menyentuh 550+',
      unlocked: estimatedScore >= 550
    }
  ];

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ============================================================================
  // 9. RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* MODALS */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
        deferredPrompt={deferredInstallPrompt}
        onTriggerNativeInstall={handleTriggerNativeInstall}
      />

      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        studentName={studentName}
        onChangeName={setStudentName}
        score={estimatedScore}
      />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 truncate">
                  TOEFL 550 Academy
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Target 550+
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Silabus Listening • Structure • Reading &amp; Latihan 20 Soal Acak
              </p>
            </div>
          </div>

          {/* Install App (PWA), Streak & Readiness Meter */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPwaModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 text-xs font-extrabold transition-all"
              title="Pasang aplikasi ke HP, Tablet, atau Laptop"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">App</span>
            </button>

            <div
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-extrabold"
              title="Daily Learning Streak"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{streakCount}d</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                estimatedScore >= 550
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm animate-pulse'
                  : 'bg-amber-50 text-slate-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Award
                className={`w-4 h-4 ${
                  estimatedScore >= 550 ? 'text-amber-300' : 'text-amber-600'
                }`}
              />
              <span>Est: {estimatedScore}/550+</span>
            </button>
          </div>
        </div>

        {/* PRIMARY FEATURE NAVIGATION BAR (5 MODES) */}
        <div className="bg-slate-100/95 border-t border-slate-200 px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 w-full sm:w-auto">
              {[
                { id: 'curriculum', label: 'Silabus & Latihan 20 Soal', icon: BookOpen },
                { id: 'arena', label: 'Arena Game', icon: Gamepad2 },
                { id: 'exam', label: 'Simulasi Timer', icon: Timer },
                { id: 'listening', label: 'Lab Listening', icon: Headphones },
                { id: 'vault', label: 'Rumus & Review', icon: Bookmark }
              ].map((nav) => {
                const Icon = nav.icon;
                const active = appMode === nav.id;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setAppMode(nav.id);
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{nav.label}</span>
                    {nav.id === 'vault' && bookmarkedIds.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                        {bookmarkedIds.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setShowTranslations((prev) => !prev)}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showTranslations
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {showTranslations ? (
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Terjemahan ID: {showTranslations ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE CURRICULUM DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-white p-4 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="font-extrabold text-slate-900">Silabus Per Level</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {levels.map((lvl) => (
              <div key={lvl} className="mb-4">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Level {lvl}
                </div>
                <div className="space-y-1.5">
                  {CURRICULUM.filter((t) => t.level === lvl).map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setAppMode('curriculum');
                        handleSelectTopic(topic.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border ${
                        selectedTopicId === topic.id
                          ? 'bg-blue-50 border-blue-300 text-[#1E3A8A]'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {topic.code} {topic.shortTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold">
                          {topic.section}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{topic.moduleRef}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN RESPONSIVE WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT WORKSPACE (8 COLS) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5 min-w-0">
            {/* ================================================================
                MODE 1: SILABUS PER LEVEL (KELOMPOK LISTENING, STRUCTURE, READING)
               ================================================================ */}
            {appMode === 'curriculum' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {levels.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSelectLevel(lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                            selectedLevel === lvl
                              ? 'bg-[#1E3A8A] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {lvl === 'Basic'
                            ? '1. Basic'
                            : lvl === 'Intermediate'
                            ? '2. Intermediate'
                            : '3. Advance (550+)'}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] font-bold text-slate-500">
                      {correctAnswersCount}/{totalQuestionsCount} Bank Soal Terjawab Benar
                    </span>
                  </div>

                  {/* Section Filter Tabs: Semua | Listening | Structure | Reading */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase mr-1">
                      Kelompok Materi:
                    </span>
                    {sections.map((sec) => {
                      const active = selectedSection === sec;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleSelectSection(sec)}
                          className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all ${
                            active
                              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {sec === 'All' ? 'Semua Section' : sec}
                        </button>
                      );
                    })}
                  </div>

                  {/* Topic Cards in Selected Level & Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {topicsInCurrentLevel.map((topic) => {
                      const isActive = topic.id === selectedTopicId;
                      const isDone = Boolean(completedTopics[topic.id]);
                      const secBadgeColor =
                        topic.section === 'Listening'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : topic.section === 'Structure'
                          ? 'bg-blue-100 text-[#1E3A8A] border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => handleSelectTopic(topic.id)}
                          className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                            isActive
                              ? 'bg-blue-50/90 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/15'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${secBadgeColor}`}
                            >
                              {topic.section} • {topic.code}
                            </span>
                            {isDone && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div
                            className={`text-xs font-bold leading-snug ${
                              isActive ? 'text-[#1E3A8A]' : 'text-slate-800'
                            }`}
                          >
                            {topic.shortTitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Topic Header & Mode Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        {currentTopic.moduleRef}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentTopic.category}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                    Topik {currentTopic.code}: {currentTopic.title}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setActiveTab('materi');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'materi'
                          ? 'bg-white text-[#1E3A8A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>1. Materi Strategi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setActiveTab('latihan');
                        setCurrentQuestionIndex(0);
                        setShowHint(false);
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'latihan'
                          ? 'bg-white text-[#1E3A8A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      <span>2. Latihan Acak (20 Soal)</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: MATERI */}
                {activeTab === 'materi' && (
                  <div className="space-y-4">
                    {currentTopic.passage && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#1E3A8A]" />
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                              {currentTopic.passage.title}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              speakText(currentTopic.passage.text, 'en-US', 0.92)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 border border-blue-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Baca Teks Inggris</span>
                          </button>
                        </div>

                        <div className="text-sm sm:text-[15px] leading-relaxed text-slate-800 space-y-3 font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                          {currentTopic.passage.text.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>

                        {showTranslations && (
                          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-700 space-y-1.5">
                            <div className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                              Terjemahan Pendamping (Bahasa Indonesia):
                            </div>
                            {currentTopic.passage.translationId
                              .split('\n\n')
                              .map((para, i) => (
                                <p key={i} className="leading-relaxed">
                                  {para}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {currentTopic.paragraphs.map((para) => (
                      <div
                        key={para.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                            {para.heading}
                          </h3>
                          <button
                            type="button"
                            onClick={() => speakText(para.voiceText)}
                            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 border border-blue-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Jelaskan</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                          {para.bodyId}
                        </p>

                        <div className="bg-slate-900 text-amber-300 font-mono text-xs px-3.5 py-2.5 rounded-xl overflow-x-auto">
                          {para.englishRule}
                        </div>

                        <div className="space-y-2 pt-1">
                          {para.examples.map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">
                                  “{ex.en}”
                                </p>
                                <button
                                  type="button"
                                  onClick={() => speakText(ex.en, 'en-US', 0.9)}
                                  className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-[#1E3A8A] hover:bg-white border border-transparent hover:border-slate-200"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {showTranslations && (
                                <p className="text-xs text-slate-600">
                                  <span className="font-semibold text-slate-700">Arti: </span>
                                  {ex.id}
                                </p>
                              )}
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                {ex.highlight}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeaking();
                          setActiveTab('latihan');
                          setCurrentQuestionIndex(0);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                      >
                        <span>Lanjut Latihan 20 Soal Acak ({currentTopic.section})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: LATIHAN 20 SOAL ACAK PER SECTION */}
                {activeTab === 'latihan' && currentQuestion && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                          Soal {currentQuestionIndex + 1} / {activePracticeQuestions.length}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {currentQuestion.skillTag}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          Pool {currentTopic.section}: 100+ Soal
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleReshufflePractice}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#1E3A8A] text-white hover:bg-blue-900"
                          title="Ambil 20 soal acak baru dari bank soal"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Acak 20 Soal Baru</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleBookmark(currentQuestion.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            bookmarkedIds.includes(currentQuestion.id)
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {bookmarkedIds.includes(currentQuestion.id) ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {bookmarkedIds.includes(currentQuestion.id)
                              ? 'Tersimpan'
                              : 'Simpan'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Grid Nomor 1 - 20 */}
                    <div className="grid grid-cols-10 gap-1.5">
                      {activePracticeQuestions.map((q, idx) => {
                        const answered = userAnswers[q.id];
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              stopSpeaking();
                              setCurrentQuestionIndex(idx);
                              setShowHint(false);
                            }}
                            className={`h-7 rounded-lg text-[11px] font-extrabold border transition-all ${
                              idx === currentQuestionIndex
                                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                                : answered
                                ? answered.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Question Stem (One-Time Audio for Listening Section) */}
                    <div className="space-y-3">
                      {currentQuestion.section === 'Listening' ? (
                        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-amber-300">
                              Aturan TOEFL Listening: Audio Hanya Diputar 1 Kali
                            </span>
                            {playedAudioIds[currentQuestion.id] && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                Audio Sudah Diputar (1/1)
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={Boolean(playedAudioIds[currentQuestion.id])}
                            onClick={() =>
                              handlePlayOneTimeAudio(
                                currentQuestion.id,
                                currentQuestion.audioScript || currentQuestion.prompt
                              )
                            }
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                              playedAudioIds[currentQuestion.id]
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                            }`}
                          >
                            <Headphones className="w-4 h-4" />
                            <span>
                              {playedAudioIds[currentQuestion.id]
                                ? 'Audio Telah Diputar (1x Maksimal)'
                                : 'Putar Audio Listening (1x Putar)'}
                            </span>
                          </button>
                          <p className="text-xs sm:text-sm font-bold text-slate-100 pt-1">
                            {currentQuestion.prompt}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                            {currentQuestion.prompt}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              speakText(currentQuestion.prompt, 'en-US', 0.92)
                            }
                            className="shrink-0 p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#1E3A8A] border border-slate-200"
                            title="Dengar soal dalam bahasa Inggris"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {showTranslations && (
                        <p className="text-xs sm:text-sm text-slate-600 bg-amber-50/70 border border-amber-200/80 px-3.5 py-2.5 rounded-xl">
                          <span className="font-bold text-amber-900">Terjemahan: </span>
                          {currentQuestion.translationId}
                        </p>
                      )}

                      {!userAnswers[currentQuestion.id] && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowHint((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>
                              {showHint
                                ? 'Sembunyikan Petunjuk'
                                : 'Butuh Petunjuk Dosen?'}
                            </span>
                          </button>
                          {showHint && (
                            <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                              {currentQuestion.hintId}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {currentQuestion.options.map((opt) => {
                        const userAns = userAnswers[currentQuestion.id];
                        const isAnswered = Boolean(userAns);
                        const isSelected = userAns?.selectedKey === opt.key;
                        const isCorrectOpt = opt.key === currentQuestion.correctKey;

                        let cardClass =
                          'bg-white border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/40 text-slate-800';
                        if (isAnswered) {
                          if (isCorrectOpt) {
                            cardClass =
                              'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
                          } else if (isSelected && !isCorrectOpt) {
                            cardClass =
                              'bg-rose-50 border-rose-400 text-rose-950';
                          } else {
                            cardClass =
                              'bg-slate-50 border-slate-200 text-slate-400 opacity-75';
                          }
                        }

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleAnswerSelect(opt.key)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${cardClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                  isAnswered && isCorrectOpt
                                    ? 'bg-emerald-600 text-white'
                                    : isAnswered && isSelected
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold">
                                {opt.text}
                              </span>
                            </div>
                            {isAnswered && isCorrectOpt && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && isSelected && !isCorrectOpt && (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation & Tantang Dosen Button */}
                    {userAnswers[currentQuestion.id] && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-4 sm:p-5 space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            {userAnswers[currentQuestion.id].isCorrect ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                                <CheckCircle2 className="w-4 h-4" />
                                Jawaban Benar!
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-extrabold border border-rose-500/30">
                                <XCircle className="w-4 h-4" />
                                Kurang Tepat (Kunci: {currentQuestion.correctKey})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!userAnswers[currentQuestion.id].isCorrect && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleChallengeLecturer(
                                    userAnswers[currentQuestion.id].selectedKey
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-colors"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>
                                  Tantang Dosen: Kenapa bukan{' '}
                                  {userAnswers[currentQuestion.id].selectedKey}?
                                </span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                speakText(currentQuestion.voiceWalkthrough)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Ulangi Suara</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Subject Utama
                            </div>
                            <div className="text-emerald-300 font-semibold mt-0.5">
                              {currentQuestion.breakdown.subject}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Verb Utama
                            </div>
                            <div className="text-sky-300 font-semibold mt-0.5">
                              {currentQuestion.breakdown.verb}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Jebakan Soal
                            </div>
                            <div className="text-amber-300 font-semibold mt-0.5">
                              {currentQuestion.breakdown.trap}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {currentQuestion.options.map((opt) => {
                            const isKey = opt.key === currentQuestion.correctKey;
                            return (
                              <div
                                key={opt.key}
                                className={`p-2.5 rounded-xl border ${
                                  isKey
                                    ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-100'
                                    : 'bg-slate-800/50 border-slate-700/70 text-slate-300'
                                }`}
                              >
                                <span className="font-extrabold mr-1.5">{opt.key}.</span>
                                {currentQuestion.optionAnalysis[opt.key]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Prev / Next Navigation */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          stopSpeaking();
                          setCurrentQuestionIndex((i) => Math.max(0, i - 1));
                          setShowHint(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </button>

                      {currentQuestionIndex < activePracticeQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            stopSpeaking();
                            setCurrentQuestionIndex((i) => i + 1);
                            setShowHint(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900"
                        >
                          <span>Soal Berikutnya</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleReshufflePractice}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Acak 20 Soal Baru</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ================================================================
                MODE 2: ARENA MINI-GAMES & BADGES
               ================================================================ */}
            {appMode === 'arena' && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                        Lencana Pencapaian (Gamification Badges)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {badges.filter((b) => b.unlocked).length}/{badges.length} Terbuka
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {badges.map((b) => (
                      <div
                        key={b.id}
                        className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                          b.unlocked
                            ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                        }`}
                      >
                        <Award
                          className={`w-6 h-6 mx-auto ${
                            b.unlocked ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        />
                        <div className="text-xs font-extrabold">{b.title}</div>
                        <div className="text-[10px] leading-tight">{b.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini-Game 1: Speed Trap Hunter */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1E3A8A]">
                        Mini-Game 1 • 60 Detik
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                        Speed Trap Hunter: Berburu True Subject &amp; Trap
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-700">
                        Rekor: {gameHighScore} pts
                      </span>
                      {trapGameActive && (
                        <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black">
                          {trapTimeLeft}s
                        </span>
                      )}
                    </div>
                  </div>

                  {!trapGameActive ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                        Uji refleksmu dalam 60 detik! Identifikasi mana <strong>True Subject</strong>{' '}
                        dan mana <strong>Trap</strong> (Preposisi, Appositive, Reduced Clause,
                        Inversion) sebelum waktu habis.
                      </p>
                      {trapScore > 0 && (
                        <div className="text-sm font-extrabold text-emerald-700">
                          Skor Sesi Terakhir: {trapScore} Poin!
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={startTrapGame}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-extrabold"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Mulai Speed Trap Hunter</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Skor Saat Ini: {trapScore} pts</span>
                        <span>Tantangan #{trapIndex + 1}</span>
                      </div>

                      {(() => {
                        const item =
                          SPEED_TRAP_CHALLENGES[trapIndex % SPEED_TRAP_CHALLENGES.length];
                        return (
                          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                            <p className="text-sm sm:text-base font-serif italic text-amber-200">
                              “{item.sentence}”
                            </p>
                            <p className="text-xs sm:text-sm font-bold">{item.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                              {item.choices.map((ch) => (
                                <button
                                  key={ch}
                                  type="button"
                                  onClick={() => answerTrapChallenge(ch)}
                                  className="p-3 rounded-xl bg-white/10 hover:bg-blue-600 border border-white/20 text-xs font-bold text-left transition-all"
                                >
                                  {ch}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {trapFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold border ${
                            trapFeedback.ok
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}
                        >
                          {trapFeedback.ok ? 'Tepat (+20 pts)! ' : 'Kurang Tepat! '}
                          {trapFeedback.rule}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mini-Game 2: Context Vocab Duel */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        Mini-Game 2 • Combo Streak
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                        Context Vocab Duel (Kosakata Akademik TOEFL)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900">
                        Combo: {vocabCombo}x
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                        Skor: {vocabCurrentScore} (Rekor: {vocabHighScore})
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const item = VOCAB_DUEL_ITEMS[vocabIndex % VOCAB_DUEL_ITEMS.length];
                    return (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base sm:text-lg font-black tracking-wide text-[#1E3A8A]">
                              {item.word}
                            </span>
                            <button
                              type="button"
                              onClick={() => speakText(item.context, 'en-US', 0.92)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1E3A8A]"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm italic text-slate-700">
                            “{item.context}”
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => answerVocabDuel(opt)}
                              className="p-3 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50 text-left text-xs sm:text-sm font-semibold text-slate-800"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {vocabFeedback && (
                          <div
                            className={`p-3 rounded-xl text-xs font-bold border ${
                              vocabFeedback.ok
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-rose-50 border-rose-300 text-rose-900'
                            }`}
                          >
                            {vocabFeedback.ok ? 'Mantap! ' : `Jawaban: ${vocabFeedback.correct}. `}
                            Arti dalam Bahasa Indonesia: <em>{vocabFeedback.meaningId}</em>.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ================================================================
                MODE 3: TIMED MINI-TEST SIMULATION & DIAGNOSTIC REPORT
               ================================================================ */}
            {appMode === 'exam' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                      Simulasi TOEFL ITP Asli
                    </span>
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                      Mini-Test Structure &amp; Written Expression (8 Soal • 6 Menit)
                    </h2>
                  </div>

                  {examStarted && !examSubmitted && (
                    <div
                      className={`px-3.5 py-2 rounded-xl font-mono text-sm font-black border ${
                        examSecondsLeft < 60
                          ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                          : 'bg-slate-900 text-amber-300 border-slate-800'
                      }`}
                    >
                      ⏱ {formatTimer(examSecondsLeft)}
                    </div>
                  )}
                </div>

                {!examStarted ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <Timer className="w-10 h-10 text-[#1E3A8A] mx-auto" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      Siap Menguji Kecepatanmu?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Di ujian TOEFL ITP asli, kamu hanya punya rata-rata{' '}
                      <strong>37 detik per soal</strong>. Kerjakan 8 soal campuran ini dalam 6
                      menit untuk mendapatkan <strong>Rapor Analisis Kelemahan per Topik</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setExamAnswers({});
                        setExamSecondsLeft(360);
                        setExamSubmitted(false);
                        setExamStarted(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-extrabold"
                    >
                      <Play className="w-4 h-4" />
                      <span>Mulai Simulasi Berwaktu</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {examSubmitted && examReport && (
                      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm sm:text-base font-extrabold">
                              Rapor Analisis Kelemahan per Materi
                            </h3>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black">
                            Benar: {examReport.correct}/{examReport.total} • Est. Section 2:{' '}
                            {examReport.projectedStructureScore}/68
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          {Object.entries(examReport.skillStats).map(([skillName, stat]) => {
                            const pct = Math.round((stat.correct / stat.total) * 100);
                            return (
                              <div
                                key={skillName}
                                className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1.5"
                              >
                                <div className="flex justify-between font-bold">
                                  <span className="text-slate-200">{skillName}</span>
                                  <span
                                    className={
                                      pct === 100 ? 'text-emerald-400' : 'text-amber-300'
                                    }
                                  >
                                    {pct}%
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      pct === 100 ? 'bg-emerald-500' : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setExamAnswers({});
                            setExamSecondsLeft(360);
                            setExamSubmitted(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Ulangi Simulasi</span>
                        </button>
                      </div>
                    )}

                    {MINI_TEST_QUESTIONS.map((q, idx) => {
                      const picked = examAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-[#1E3A8A]">
                              Nomor {idx + 1}
                            </span>
                            {examSubmitted && (
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                                {q.skill}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            {q.prompt}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isPicked = picked === opt.key;
                              const isRight = opt.key === q.correctKey;
                              let cls =
                                'bg-white border-slate-200 text-slate-700 hover:border-[#1E3A8A]';
                              if (examSubmitted) {
                                if (isRight)
                                  cls =
                                    'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                                else if (isPicked)
                                  cls = 'bg-rose-50 border-rose-400 text-rose-950';
                              } else if (isPicked) {
                                cls =
                                  'bg-blue-50 border-[#1E3A8A] text-[#1E3A8A] font-bold';
                              }
                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  disabled={examSubmitted}
                                  onClick={() =>
                                    setExamAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: opt.key
                                    }))
                                  }
                                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 ${cls}`}
                                >
                                  <span className="font-black">{opt.key}.</span>
                                  <span>{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {examSubmitted && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                              <strong>Pembahasan:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!examSubmitted && (
                      <button
                        type="button"
                        onClick={() => setExamSubmitted(true)}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-sm"
                      >
                        Kumpulkan Jawaban &amp; Lihat Rapor Analisis
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================
                MODE 4: LAB LISTENING COMPREHENSION (AUDIO AI DOSEN)
               ================================================================ */}
            {appMode === 'listening' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                      Section 1 • Listening Part A
                    </span>
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                      Lab Listening Short Dialogues (Audio Penutur Inggris)
                    </h2>
                  </div>

                  <div className="flex gap-1.5">
                    {LISTENING_LAB_ITEMS.map((it, idx) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          stopSpeaking();
                          setListenIndex(idx);
                          setShowListenScript(false);
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold border ${
                          idx === listenIndex
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const item = LISTENING_LAB_ITEMS[listenIndex];
                  const ans = listenAnswers[item.id];
                  return (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-amber-300">
                            {item.skill}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowListenScript((s) => !s)}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
                          >
                            {showListenScript
                              ? 'Sembunyikan Transkrip'
                              : 'Intip Transkrip Dialog'}
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={Boolean(playedAudioIds[item.id])}
                            onClick={() => playListeningDialogue(item)}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm ${
                              playedAudioIds[item.id]
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            <Headphones className="w-4 h-4" />
                            <span>
                              {playedAudioIds[item.id]
                                ? 'Audio Sudah Diputar (1x Maksimal)'
                                : 'Putar Audio Percakapan (1x Putar)'}
                            </span>
                          </button>
                          <span className="text-xs text-slate-400">
                            Sesuai ujian TOEFL asli, audio percakapan hanya dapat diputar 1 kali!
                          </span>
                        </div>

                        {showListenScript && (
                          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1 text-slate-200">
                            <div>
                              <strong className="text-sky-300">Man:</strong> {item.manLine}
                            </div>
                            <div>
                              <strong className="text-amber-300">Woman:</strong>{' '}
                              {item.womanLine}
                            </div>
                            <div className="pt-1 text-emerald-300 font-bold">
                              Narrator: {item.narratorQuestion}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {item.options.map((opt) => {
                          const isPicked = ans?.key === opt.key;
                          const isRight = opt.key === item.correctKey;
                          let cls =
                            'bg-white border-slate-200 hover:border-[#1E3A8A] text-slate-800';
                          if (ans) {
                            if (isRight)
                              cls =
                                'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                            else if (isPicked)
                              cls = 'bg-rose-50 border-rose-400 text-rose-950';
                          }
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              disabled={Boolean(ans)}
                              onClick={() => answerListeningLab(item.id, opt.key)}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 ${cls}`}
                            >
                              <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-xs">
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {ans && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm text-emerald-950 space-y-1">
                          <div className="font-extrabold">
                            {ans.ok ? 'Tepat Sekali!' : `Kunci Jawaban: ${item.correctKey}`}
                          </div>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ================================================================
                MODE 5: BANK RUMUS (FLASHCARDS), BOOKMARKS & CERTIFICATE
               ================================================================ */}
            {appMode === 'vault' && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                        Kartu Hafalan Cepat
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                        Flashcards Rumus Wajib TOEFL ITP
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      Kartu {flashcardIndex + 1} / {GRAMMAR_FLASHCARDS.length}
                    </span>
                  </div>

                  {(() => {
                    const card = GRAMMAR_FLASHCARDS[flashcardIndex];
                    return (
                      <div
                        onClick={() => setFlashcardFlipped((f) => !f)}
                        className="cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-[#1E3A8A]/20 bg-gradient-to-br from-slate-900 to-[#1E3A8A] text-white min-h-[180px] flex flex-col justify-between transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                          <span>{card.category}</span>
                          <span>
                            {flashcardFlipped ? 'SISI JAWABAN' : 'KLIK UNTUK BALIK KARTU'}
                          </span>
                        </div>
                        <div className="py-4 text-center text-sm sm:text-lg font-extrabold whitespace-pre-line leading-relaxed">
                          {flashcardFlipped ? card.back : card.front}
                        </div>
                        <div className="text-center text-[11px] text-blue-200">
                          Ketuk kartu untuk melihat {flashcardFlipped ? 'pertanyaan' : 'rumusnya'}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setFlashcardFlipped(false);
                        setFlashcardIndex((i) =>
                          i === 0 ? GRAMMAR_FLASHCARDS.length - 1 : i - 1
                        );
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      ← Kartu Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFlashcardFlipped(false);
                        setFlashcardIndex((i) => (i + 1) % GRAMMAR_FLASHCARDS.length);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900"
                    >
                      Kartu Berikutnya →
                    </button>
                  </div>
                </div>

                {/* Bookmarked / Wrong Questions Review List */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="w-5 h-5 text-amber-600" />
                      <h3 className="text-base font-extrabold text-slate-900">
                        Daftar Review Soal Sulit &amp; Salah ({bookmarkedIds.length})
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCertModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold"
                    >
                      Buka Sertifikat 550+
                    </button>
                  </div>

                  {bookmarkedIds.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      Belum ada soal yang disimpan. Soal yang kamu jawab salah atau kamu klik
                      tombol <strong>Simpan</strong> akan otomatis muncul di sini untuk diulang!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookmarkedIds.map((bId) => {
                        const q = allQuestionsMap[bId];
                        if (!q) return null;
                        return (
                          <div
                            key={bId}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold text-[#1E3A8A]">
                                {q.topicCode} • {q.skillTag}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleBookmark(bId)}
                                className="text-[11px] font-bold text-rose-600 hover:underline"
                              >
                                Hapus dari Review
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              {q.prompt}
                            </p>
                            <div className="text-xs text-emerald-800 font-bold">
                              Kunci: {q.correctKey} — {q.formula}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT WORKSPACE: AI DOSEN AVATAR, AUTO-LANG VOICE & Q&A CHAT (4 COLS) */}
          <aside className="lg:col-span-4 space-y-4 sm:space-y-5 lg:sticky lg:top-32">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    AI Dosen Pembimbing
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowVoiceSettings((prev) => !prev)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                    title="Pengaturan Suara & Bahasa"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMuted) stopSpeaking();
                      setIsMuted((m) => !m);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                      isMuted
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>Suara ON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Voice Settings (Auto-Language Detection + Speed) */}
              {showVoiceSettings && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Mode Bahasa Penutur:</span>
                    </span>
                    <select
                      value={voiceMode}
                      onChange={(e) => setVoiceMode(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                    >
                      <option value="auto">Otomatis (ID ↔ EN)</option>
                      <option value="id-ID">Paksa Bahasa Indonesia</option>
                      <option value="en-US">Paksa English (US)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Kecepatan Bicara Natural</span>
                      <span>{speechRate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.25"
                      step="0.05"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full accent-[#1E3A8A]"
                    />
                  </div>
                </div>
              )}

              {/* Avatar & Identity */}
              <div className="flex flex-col items-center text-center pt-1">
                <LecturerAvatar
                  state={avatarState}
                  isMuted={isMuted}
                  activeLang={activeVoiceLang}
                />
                <div className="mt-3">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Prof. Arya Pratama, M.Ed.
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Penutur Bilingual Otomatis (ID &amp; EN)
                  </p>
                </div>
              </div>

              {/* Live Subtitle Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Live Subtitle Dosen ({activeVoiceLang})
                  </span>
                  {avatarState === 'speaking' && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 hover:text-rose-200"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-200">{liveSubtitle}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const summary = `${currentTopic.title}. ${currentTopic.paragraphs
                      .map((p) => p.voiceText)
                      .join(' ')}`;
                    speakText(summary);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Jelaskan Topik</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      'Remember the golden rule of TOEFL structure: always identify the true subject and main verb first, and ignore distracting prepositional phrases.'
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-xs transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tips English</span>
                </button>
              </div>
            </div>

            {/* Interactive Q&A Chat */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="text-xs font-extrabold text-slate-800">
                    Tanya Dosen (ID / EN Otomatis)
                  </span>
                </div>
              </div>

              <div className="p-3.5 h-48 overflow-y-auto space-y-2.5 bg-white">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#1E3A8A] text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="text-[11px] text-slate-400 italic">
                    Prof. Arya sedang menyusun penjelasan...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={(e) => handleSendChat(e)}
                className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-2 rounded-xl border transition-colors shrink-0 ${
                    isListeningMic
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Tanya dengan suara"
                >
                  {isListeningMic ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanya dalam ID atau English..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingChat}
                  className="p-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-40 text-white shrink-0"
                  aria-label="Kirim Pertanyaan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
