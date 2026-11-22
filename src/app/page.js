use client
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
  RotateCcw,
  Eye,
  EyeOff,
  Sliders,
  ArrowRight,
  AlertTriangle,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  PlusSquare,
  Check
} from 'lucide-react';

// ============================================================================
// 1. SAFE RUNTIME, STORAGE & PWA HELPERS (SSR, HYDRATION & BROWSER GUARDS)
// ============================================================================
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const STORAGE_KEY = 'toefl_550_academy_progress_v1';

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
    .replace(/\s+/g, ' ')
    .trim();
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
        selectedLevel:
          typeof parsed.selectedLevel === 'string' ? parsed.selectedLevel : 'Basic',
        selectedTopicId:
          typeof parsed.selectedTopicId === 'string'
            ? parsed.selectedTopicId
            : 'basic-1'
      };
    }
  } catch {
    // Ignore storage quota or private mode errors
  }
  return null;
}

function saveProgressToStorage(data) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function createAppIconDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1E3A8A"/>
        <stop offset="100%" stop-color="#1D4ED8"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#bg)"/>
    <polygon points="256,112 424,188 256,264 88,188" fill="#FBBF24"/>
    <path d="M148 228 V314 C148 352 196 382 256 382 C316 382 364 352 364 314 V228 L256 278 Z" fill="#FFFFFF"/>
    <rect x="404" y="192" width="14" height="106" rx="7" fill="#FBBF24"/>
    <circle cx="411" cy="306" r="16" fill="#F59E0B"/>
    <text x="256" y="454" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="64" fill="#FFFFFF">TOEFL 550</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// 2. CURRICULUM & PRE-LOADED CONTENT DATABASE (9 COMPLETE TOPICS)
// ============================================================================
const CURRICULUM = [
  // --------------------------------------------------------------------------
  // LEVEL 1: BASIC
  // --------------------------------------------------------------------------
  {
    id: 'basic-1',
    level: 'Basic',
    levelNum: 1,
    code: '1.1',
    title: 'Subject-Verb Agreement Dasar & Prepositional Phrase Trap',
    shortTitle: 'S-V Agreement & Jebakan Preposisi',
    category: 'Structure & Written Expression',
    estimatedMinutes: 12,
    lecturerIntro:
      'Halo! Selamat datang di topik pertama menuju skor TOEFL 550. Di soal nomor 1 sampai 15 TOEFL Structure, jebakan paling sering muncul adalah Prepositional Phrase yang menyelip di antara Subject dan Verb. Yuk kita bedah trik mencoret jebakannya!',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Aturan Emas: Subject & Verb Harus Akur',
        bodyId:
          'Dalam kalimat bahasa Inggris standar TOEFL, Subject (subjek) dan Verb (kata kerja) wajib selaras dalam jumlah. Jika Subject tunggal (Singular), Verb harus tunggal. Jika Subject jamak (Plural), Verb harus jamak.',
        voiceText:
          'Aturan emas pertama: Subject dan Verb wajib akur jumlahnya. Jika subjeknya tunggal, kata kerjanya harus tunggal. Jika subjeknya jamak, kata kerjanya juga wajib jamak.',
        englishRule:
          'Singular Subject + Singular Verb (is / was / has / V-s/es)  |  Plural Subject + Plural Verb (are / were / have / V1)',
        examples: [
          {
            en: 'The researcher analyzes the chemical samples every morning.',
            id: 'Peneliti itu (tunggal) menganalisis (analyzes) sampel kimia setiap pagi.',
            highlight: 'The researcher [S-Tunggal] + analyzes [V-Tunggal]'
          },
          {
            en: 'The researchers analyze the chemical samples every morning.',
            id: 'Para peneliti itu (jamak) menganalisis (analyze) sampel kimia setiap pagi.',
            highlight: 'The researchers [S-Jamak] + analyze [V-Jamak]'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Jebakan Maut: Prepositional Phrase Trap',
        bodyId:
          'Pembuat soal TOEFL sangat suka menyisipkan frasa preposisi (seperti: in, on, at, of, with, from, by, among, between) tepat setelah Subject untuk mengecoh mata kita agar mengira kata benda di akhir frasa itulah Subject-nya. Ingat: Object of Preposition TIDAK PERNAH bisa menjadi Subject!',
        voiceText:
          'Hati-hati dengan jebakan maut Prepositional Phrase! Kata benda setelah preposisi seperti of, in, on, with, atau from tidak akan pernah bisa menjadi subjek kalimat. Coret saja frasa preposisinya agar subjek aslinya terlihat jelas.',
        englishRule:
          '[True Subject] + (Prepositional Phrase = CORET!) + [Verb mengikuti True Subject]',
        examples: [
          {
            en: 'The quality (of the newly imported microchips) is exceptionally high.',
            id: 'Kualitas dari mikrocip yang baru diimpor itu sangat tinggi. (Subjek asli = The quality [tunggal], bukan microchips!).',
            highlight: 'True Subject: The quality (Tunggal) → Verb: is'
          },
          {
            en: 'Several species (of rare tropical birds) inhabit this protected valley.',
            id: 'Beberapa spesies burung tropis langka mendiami lembah terlindungi ini. (Subjek asli = Several species [jamak]).',
            highlight: 'True Subject: Several species (Jamak) → Verb: inhabit'
          }
        ]
      },
      {
        id: 'p3',
        heading: '3. Rumus Kilat & Kata Benda Jebakan',
        bodyId:
          'Waspadai kata-kata seperti each, every, everyone, somebody, the number of (selalu TUNGGAL), berbeda dengan a number of, both, several, many (selalu JAMAK).',
        voiceText:
          'Terakhir, hafalkan rumus kilat ini: each, every, dan the number of selalu dianggap tunggal. Sebaliknya, a number of dan several selalu dianggap jamak.',
        englishRule:
          'The number of + Plural Noun → Singular Verb  ||  A number of + Plural Noun → Plural Verb',
        examples: [
          {
            en: 'The number of applicants for the scholarship has doubled this year.',
            id: 'Jumlah pelamar beasiswa itu telah berlipat ganda tahun ini.',
            highlight: 'The number of → Singular Verb (has)'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'b1-q1',
        type: 'Structure',
        prompt:
          'The migration patterns of monarch butterflies _______ studied extensively by entomologists across North America.',
        translationId:
          'Pola migrasi kupu-kupu raja _______ dipelajari secara luas oleh para ahli serangga di seluruh Amerika Utara.',
        hintId:
          'Cari True Subject sebelum kata "of". Apakah "patterns" tunggal atau jamak?',
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
          trap: 'of monarch butterflies (Prepositional Phrase — abaikan!)'
        },
        optionAnalysis: {
          A: 'Salah: "has been" adalah bentuk tunggal (singular), tidak cocok dengan subjek jamak "patterns".',
          B: 'BENAR: Subjek utamanya adalah "patterns" (jamak), sehingga membutuhkan kata kerja bantu jamak "have been".',
          C: 'Salah: "is being" adalah bentuk tunggal.',
          D: 'Salah: "was" adalah bentuk lampau tunggal.'
        },
        formula:
          'Coret "of monarch butterflies" → The migration patterns [Jamak] + have been [Jamak].',
        voiceWalkthrough:
          'Kunci jawabannya adalah B, have been. Perhatikan subjek utama kalimat ini adalah The migration patterns yang berbentuk jamak. Frasa of monarch butterflies hanyalah prepositional phrase pengecoh. Jadi kita butuh kata kerja jamak, yaitu have been.'
      },
      {
        id: 'b1-q2',
        type: 'Structure',
        prompt:
          'Each of the laboratory instruments _______ calibrated before the final experiment begins.',
        translationId:
          'Masing-masing instrumen laboratorium _______ dikalibrasi sebelum eksperimen akhir dimulai.',
        hintId:
          'Kata "Each" sebelum "of the..." selalu dianggap tunggal atau jamak?',
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
          trap: 'of the laboratory instruments (Prepositional Phrase dengan kata benda jamak sebagai pengecoh)'
        },
        optionAnalysis: {
          A: 'Salah: "are" digunakan untuk subjek jamak.',
          B: 'Salah: "were" digunakan untuk subjek jamak lampau.',
          C: 'BENAR: Kata "Each" (masing-masing) selalu dihitung tunggal (singular), sehingga pasangannya adalah "is".',
          D: 'Salah: "have been" adalah bentuk jamak.'
        },
        formula:
          'Each / Every + of + Plural Noun → SELALU diikuti Singular Verb (is / was / has).',
        voiceWalkthrough:
          'Jawabannya C, is. Banyak peserta terkecoh melihat kata instruments yang jamak tepat sebelum titik-titik. Padahal, itu bagian dari prepositional phrase of the laboratory instruments. Subjek aslinya adalah Each yang selalu tunggal.'
      },
      {
        id: 'b1-q3',
        type: 'Structure',
        prompt:
          'A high concentration of dissolved minerals in hot springs often _______ colorful bacterial mats.',
        translationId:
          'Konsentrasi tinggi mineral terlarut di mata air panas sering kali _______ lapisan bakteri berwarna-warni.',
        hintId:
          'Ada dua frasa preposisi beruntun ("of dissolved minerals" dan "in hot springs"). Subjek aslinya ada di paling depan!',
        options: [
          { key: 'A', text: 'produce' },
          { key: 'B', text: 'producing' },
          { key: 'C', text: 'produces' },
          { key: 'D', text: 'are producing' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'A high concentration (Singular)',
          verb: 'produces (Singular Simple Present Verb + -s)',
          trap: 'of dissolved minerals + in hot springs (Dua Prepositional Phrase bertumpuk)'
        },
        optionAnalysis: {
          A: 'Salah: "produce" tanpa -s adalah bentuk verb untuk subjek jamak.',
          B: 'Salah: "producing" (V-ing tanpa to be) tidak bisa menjadi main verb kalimat.',
          C: 'BENAR: Subjek tunggal "A high concentration" membutuhkan kata kerja tunggal berakhiran -s, yaitu "produces".',
          D: 'Salah: "are producing" untuk subjek jamak.'
        },
        formula: 'A [Singular Noun] + (of X) + (in Y) + Verb-s/es.',
        voiceWalkthrough:
          'Jawabannya C, produces. Di sini ada dua jebakan preposisi bertumpuk: of dissolved minerals dan in hot springs. Jika keduanya dicoret, tersisa subjek tunggal A high concentration, maka verb-nya wajib pakai akhiran s: produces.'
      },
      {
        id: 'b1-q4',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'The ', u: null },
          { text: 'discoveries', u: 'A' },
          { text: ' made by the archaeological team in ', u: null },
          { text: 'remote', u: 'B' },
          { text: ' caves ', u: null },
          { text: 'has', u: 'C' },
          { text: ' reshaped our ', u: null },
          { text: 'understanding', u: 'D' },
          { text: ' of early human trade.', u: null }
        ],
        translationId:
          'Penemuan-penemuan yang dibuat oleh tim arkeologi di gua-gua terpencil telah membentuk ulang pemahaman kita tentang perdagangan manusia purba.',
        hintId:
          'Perhatikan subjek "The discoveries" (jamak) dan kata kerja utama setelah kata "caves".',
        options: [
          { key: 'A', text: 'discoveries' },
          { key: 'B', text: 'remote' },
          { key: 'C', text: 'has' },
          { key: 'D', text: 'understanding' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'The discoveries (Plural)',
          verb: 'has reshaped → Seharusnya HAVE reshaped',
          trap: 'made by the archaeological team in remote caves (Participle + Prepositional modifier panjang)'
        },
        optionAnalysis: {
          A: 'Benar: "discoveries" adalah kata benda jamak yang valid sebagai subjek.',
          B: 'Benar: "remote" adalah adjective yang tepat untuk menerangkan "caves".',
          C: 'SALAH (Harus diubah): Karena subjek utamanya "The discoveries" (jamak), kata kerja "has" harus diganti menjadi "have".',
          D: 'Benar: "understanding" adalah noun yang tepat setelah possessive "our".'
        },
        formula:
          'Plural Subject (discoveries) ≠ Singular Auxiliary (has) → Ubah ke HAVE.',
        voiceWalkthrough:
          'Bagian yang salah adalah C, has. Subjek kalimat ini adalah The discoveries yang berbentuk jamak. Jadi kata kerja bantunya seharusnya have reshaped, bukan has reshaped.'
      },
      {
        id: 'b1-q5',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'The number of ', u: null },
          { text: 'students', u: 'A' },
          { text: ' enrolling in ', u: null },
          { text: 'environmental', u: 'B' },
          { text: ' science courses ', u: null },
          { text: 'have', u: 'C' },
          { text: ' increased ', u: null },
          { text: 'dramatically', u: 'D' },
          { text: ' since 2020.', u: null }
        ],
        translationId:
          'Jumlah mahasiswa yang mendaftar di mata kuliah ilmu lingkungan telah meningkat secara dramatis sejak 2020.',
        hintId: 'Ingat perbedaan antara "The number of" dan "A number of"!',
        options: [
          { key: 'A', text: 'students' },
          { key: 'B', text: 'environmental' },
          { key: 'C', text: 'have' },
          { key: 'D', text: 'dramatically' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'The number (Singular)',
          verb: 'have increased → Seharusnya HAS increased',
          trap: 'of students enrolling in environmental science courses (Modifier panjang)'
        },
        optionAnalysis: {
          A: 'Benar: Setelah "The number of", kata benda memang harus berbentuk jamak ("students").',
          B: 'Benar: "environmental" adalah adjective yang tepat menerangkan "science courses".',
          C: 'SALAH (Harus diubah): Frasa "The number of" selalu dianggap subjek tunggal, sehingga "have" wajib diganti menjadi "has".',
          D: 'Benar: "dramatically" adalah adverb yang menerangkan kata kerja "increased".'
        },
        formula: 'The number of + Plural Noun + SINGULAR Verb (has).',
        voiceWalkthrough:
          'Yang salah adalah C, have. Ingat rumus kilat kita: The number of selalu dianggap tunggal karena yang dimaksud adalah angkanya atau jumlahnya. Maka kata have harus diubah menjadi has.'
      }
    ]
  },

  {
    id: 'basic-2',
    level: 'Basic',
    levelNum: 1,
    code: '1.2',
    title: 'Sentence Structure: Simple vs. Compound & Connectors',
    shortTitle: 'Simple, Compound & FANBOYS',
    category: 'Structure & Written Expression',
    estimatedMinutes: 14,
    lecturerIntro:
      'Di topik kedua ini, kita akan membahas kerangka dasar kalimat bahasa Inggris. Banyak soal TOEFL menjebak kita dengan kalimat yang tidak punya Verb utama, atau justru punya dua Verb tanpa kata hubung!',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Syarat Mutlak Kalimat (Simple Sentence)',
        bodyId:
          'Setiap kalimat sederhana (Simple Sentence) dalam bahasa Inggris WAJIB memiliki minimal 1 Subject dan 1 Main Verb (kata kerja utama yang terkonjugasi). Hati-hati: Verb-ing (seperti running) atau To-Verb (to run) tanpa kata kerja bantu BUKAN Main Verb!',
        voiceText:
          'Syarat mutlak sebuah kalimat bahasa Inggris adalah memiliki minimal satu Subject dan satu Main Verb. Ingat, kata kerja berakhiran ing tanpa to be bukanlah kata kerja utama.',
        englishRule: '1 Clause = 1 Subject + 1 Finite (Main) Verb',
        examples: [
          {
            en: 'Volcanic ash enriches the surrounding soil over decades.',
            id: 'Abu vulkanik menyuburkan tanah di sekitarnya selama beberapa dekade.',
            highlight: 'Subject: Volcanic ash | Main Verb: enriches'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Menggabungkan Dua Klausa: FANBOYS',
        bodyId:
          'Jika dalam satu kalimat terdapat 2 Subject dan 2 Verb (dua klausa), kita WAJIB menyambungkannya dengan koma + Coordinate Connector (FANBOYS: For, And, Nor, But, Or, Yet, So). Tanpa connector, kalimat menjadi salah (Comma Splice).',
        voiceText:
          'Jika kamu melihat ada dua pasangan Subject dan Verb dalam satu kalimat, wajib ada satu kata hubung di tengahnya. Gunakan jembatan FANBOYS: For, And, Nor, But, Or, Yet, So.',
        englishRule:
          'Subject 1 + Verb 1  +  [ , FANBOYS ]  +  Subject 2 + Verb 2',
        examples: [
          {
            en: 'Solar panels generate clean electricity, but battery storage remains expensive.',
            id: 'Panel surya menghasilkan listrik bersih, tetapi penyimpanan baterai tetap mahal.',
            highlight: '[S1 + V1] + , but + [S2 + V2]'
          }
        ]
      },
      {
        id: 'p3',
        heading: '3. Menghindari Double Subject & Double Verb',
        bodyId:
          'Jebakan klasik TOEFL: memberikan Subjek, lalu menambahkan kata ganti (seperti it atau they) tepat sebelum Verb. Contoh salah: "The engineer he designed the bridge." Cukup satu subjek saja!',
        voiceText:
          'Waspadai jebakan double subject seperti The engineer he designed. Itu salah karena subjeknya ganda. Cukup satu subjek untuk satu kata kerja.',
        englishRule:
          'SALAH: [Noun Subject] + [Pronoun] + [Verb]  →  BENAR: [Noun Subject] + [Verb]',
        examples: [
          {
            en: 'Marie Curie discovered radium in 1898. (BUKAN: Marie Curie she discovered...)',
            id: 'Marie Curie menemukan radium pada tahun 1898.',
            highlight: '1 Subject (Marie Curie) + 1 Verb (discovered)'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'b2-q1',
        type: 'Structure',
        prompt:
          'In the late nineteenth century, _______ revolutionized urban transportation across major European cities.',
        translationId:
          'Pada akhir abad kesembilan belas, _______ merevolusi transportasi perkotaan di kota-kota besar Eropa.',
        hintId:
          'Kalimat ini sudah punya Verb ("revolutionized"), tetapi belum punya Subject!',
        options: [
          { key: 'A', text: 'electric streetcars' },
          { key: 'B', text: 'electric streetcars they' },
          { key: 'C', text: 'because electric streetcars' },
          { key: 'D', text: 'when electric streetcars' }
        ],
        correctKey: 'A',
        breakdown: {
          subject: 'electric streetcars (Diperlukan sebagai Subject tunggal klausa)',
          verb: 'revolutionized (Sudah ada di soal)',
          trap: 'In the late nineteenth century (Keterangan waktu di awal kalimat)'
        },
        optionAnalysis: {
          A: 'BENAR: Frasa kata benda "electric streetcars" mengisi posisi Subject yang kosong dengan sempurna.',
          B: 'Salah: Menyebabkan Double Subject ("electric streetcars" + "they").',
          C: 'Salah: Menambahkan connector "because" padahal hanya ada satu klausa/verb.',
          D: 'Salah: Menambahkan connector "when" tanpa klausa kedua.'
        },
        formula: '[Prepositional Time Phrase], + [SUBJECT] + [VERB] + [Object].',
        voiceWalkthrough:
          'Jawabannya adalah A, electric streetcars. Bagian awal kalimat hanyalah keterangan waktu, lalu langsung diikuti kata kerja revolutionized. Jadi kita hanya butuh satu subjek murni tanpa kata ganti tambahan dan tanpa kata hubung.'
      },
      {
        id: 'b2-q2',
        type: 'Structure',
        prompt:
          'Desert cacti store large amounts of water in their stems, _______ they can survive prolonged droughts.',
        translationId:
          'Kaktus gurun menyimpan air dalam jumlah besar di batangnya, _______ mereka dapat bertahan hidup dari kekeringan berkepanjangan.',
        hintId:
          'Ada dua klausa lengkap dipisahkan tanda koma. Pilih connector FANBOYS yang menunjukkan hubungan sebab-akibat!',
        options: [
          { key: 'A', text: 'so' },
          { key: 'B', text: 'nor' },
          { key: 'C', text: 'yet' },
          { key: 'D', text: 'despite' }
        ],
        correctKey: 'A',
        breakdown: {
          subject: 'S1: Desert cacti | S2: they',
          verb: 'V1: store | V2: can survive',
          trap: 'Koma sebelum titik-titik menuntut Coordinate Connector (FANBOYS)'
        },
        optionAnalysis: {
          A: 'BENAR: "so" adalah bagian dari FANBOYS yang menghubungkan dua klausa lengkap dengan makna akibat ("sehingga").',
          B: 'Salah: "nor" digunakan untuk kalimat negatif dan membutuhkan inversi.',
          C: 'Salah: "yet" bermakna pertentangan ("namun"), tidak cocok secara logika.',
          D: 'Salah: "despite" adalah preposisi, bukan connector untuk menghubungkan dua klausa.'
        },
        formula: 'Clause 1 (S1 + V1) + , + so (FANBOYS) + Clause 2 (S2 + V2).',
        voiceWalkthrough:
          'Kunci jawabannya adalah A, so. Perhatikan kita punya dua subjek dan dua kata kerja yang dipisahkan oleh koma. Kita wajib memakai salah satu anggota FANBOYS. Secara makna sebab-akibat, so adalah pilihan paling tepat.'
      },
      {
        id: 'b2-q3',
        type: 'Structure',
        prompt:
          'The newly discovered exoplanet _______ within the habitable zone of its parent star.',
        translationId:
          'Eksoplanet yang baru ditemukan tersebut _______ di dalam zona layak huni dari bintang induknya.',
        hintId:
          'Subjeknya "The newly discovered exoplanet". Apa yang hilang dari kalimat ini?',
        options: [
          { key: 'A', text: 'orbiting' },
          { key: 'B', text: 'orbits' },
          { key: 'C', text: 'which orbits' },
          { key: 'D', text: 'to orbit' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'The newly discovered exoplanet (Singular)',
          verb: 'orbits (Main Verb yang hilang)',
          trap: 'discovered di sini adalah Past Participle (adjective), bukan main verb!'
        },
        optionAnalysis: {
          A: 'Salah: "orbiting" (V-ing tanpa to be) tidak bisa menjadi kata kerja utama.',
          B: 'BENAR: "orbits" adalah Main Verb tunggal yang melengkapi subjek "exoplanet".',
          C: 'Salah: "which orbits" membentuk adjective clause sehingga kalimat utama kehilangan main verb.',
          D: 'Salah: "to orbit" (infinitive) bukan kata kerja utama.'
        },
        formula: '[Noun Phrase Subject] + [Main Verb (orbits)] + [Prepositional Phrase].',
        voiceWalkthrough:
          'Jawabannya B, orbits. Kata discovered di depan exoplanet hanyalah kata sifat penjelas. Kalimat ini belum punya kata kerja utama, sehingga kita wajib memilih bentuk kata kerja asli yaitu orbits.'
      },
      {
        id: 'b2-q4',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'Although ', u: null },
          { text: 'photosynthesis', u: 'A' },
          { text: ' occurs primarily in plant leaves, ', u: null },
          { text: 'but', u: 'B' },
          { text: ' green stems can also ', u: null },
          { text: 'perform', u: 'C' },
          { text: ' this vital ', u: null },
          { text: 'process', u: 'D' },
          { text: '.', u: null }
        ],
        translationId:
          'Meskipun fotosintesis terjadi terutama di daun tumbuhan, batang hijau juga dapat melakukan proses penting ini.',
        hintId:
          'Hitung jumlah connector dalam kalimat ini! Bolehkan "Although" dan "but" dipakai bersamaan?',
        options: [
          { key: 'A', text: 'photosynthesis' },
          { key: 'B', text: 'but' },
          { key: 'C', text: 'perform' },
          { key: 'D', text: 'process' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'S1: photosynthesis | S2: green stems',
          verb: 'V1: occurs | V2: can perform',
          trap: 'Double Connector: "Although" (Connector 1) + "but" (Connector 2) untuk 2 klausa!'
        },
        optionAnalysis: {
          A: 'Benar: "photosynthesis" adalah subjek yang tepat untuk klausa pertama.',
          B: 'SALAH (Harus dihapus): Karena sudah ada "Although" di awal kalimat untuk menghubungkan 2 klausa, kata "but" menjadi berlebihan (Double Connector).',
          C: 'Benar: "perform" (V1) tepat setelah modal "can".',
          D: 'Benar: "process" adalah kata benda tunggal yang cocok dengan "this".'
        },
        formula:
          'Jumlah Connector = Jumlah Klausa - 1. (2 Klausa → Cukup 1 Connector: Although ATAU but, jangan keduanya!).',
        voiceWalkthrough:
          'Yang salah adalah B, but. Di dalam bahasa Indonesia kita sering bilang meskipun titik-titik tetapi titik-titik. Namun dalam bahasa Inggris akademik TOEFL, memakai Although sekaligus but dalam kalimat dua klausa adalah pemborosan connector. Hapus kata but.'
      },
      {
        id: 'b2-q5',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'The ', u: null },
          { text: 'architect', u: 'A' },
          { text: ' who designed the ', u: null },
          { text: 'national', u: 'B' },
          { text: ' museum ', u: null },
          { text: 'he', u: 'C' },
          { text: ' won several ', u: null },
          { text: 'prestigious', u: 'D' },
          { text: ' international awards.', u: null }
        ],
        translationId:
          'Arsitek yang merancang museum nasional tersebut memenangkan beberapa penghargaan internasional bergengsi.',
        hintId:
          'Perhatikan kata ganti "he" sebelum kata kerja "won". Apakah subjeknya jadi ganda?',
        options: [
          { key: 'A', text: 'architect' },
          { key: 'B', text: 'national' },
          { key: 'C', text: 'he' },
          { key: 'D', text: 'prestigious' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'The architect (Subject utama) + he (Double Subject yang salah!)',
          verb: 'designed (Verb anak kalimat) | won (Verb induk kalimat)',
          trap: 'who designed the national museum (Adjective Clause di tengah)'
        },
        optionAnalysis: {
          A: 'Benar: "architect" adalah subjek utama kalimat.',
          B: 'Benar: "national" adalah adjective yang tepat.',
          C: 'SALAH (Harus dihapus): Kata ganti "he" mengulang subjek "The architect" sehingga menyebabkan Double Subject.',
          D: 'Benar: "prestigious" adalah adjective yang tepat.'
        },
        formula:
          'The architect [Subject] + (who designed...) + won [Verb] — Hapus pronoun pengulang!',
        voiceWalkthrough:
          'Bagian yang salah adalah C, he. Subjek utama kalimat ini sudah ada di awal yaitu The architect. Menambahkan he tepat sebelum won membuat subjeknya ganda. Jadi kata he harus dihilangkan.'
      }
    ]
  },

  {
    id: 'basic-3',
    level: 'Basic',
    levelNum: 1,
    code: '1.3',
    title: 'Reading Basic: Main Idea & Context Clues',
    shortTitle: 'Reading: Main Idea & Context Clues',
    category: 'Reading Comprehension',
    estimatedMinutes: 15,
    lecturerIntro:
      'Banyak peserta TOEFL panik saat melihat teks Reading yang panjang dan penuh kosakata sulit. Rahasia skor 550: kamu TIDAK perlu menerjemahkan semua kata! Mari kita pelajari teknik Topic Sentence dan Context Clues.',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Teknik Menemukan Main Idea (Gagasan Utama)',
        bodyId:
          'Dalam tulisan akademik Amerika yang dipakai TOEFL, penulis hampir selalu menaruh gagasan utama di kalimat pertama setiap paragraf (Topic Sentence). Baca kalimat pertama paragraf 1 dan kalimat pertama paragraf berikutnya untuk menyimpulkan topik besar bacaan.',
        voiceText:
          'Untuk menjawab soal Main Idea dengan cepat, fokuslah membaca kalimat pertama dari setiap paragraf. Penulis akademik TOEFL selalu meletakkan ide pokoknya di awal paragraf.',
        englishRule:
          'Main Idea = Topic (Apa yang dibahas?) + Controlling Idea (Aspek apa yang ditekankan?)',
        examples: [
          {
            en: 'Tip: Hindari opsi jawaban yang terlalu sempit (hanya detail kecil) atau terlalu luas (di luar pembahasan teks).',
            id: 'Pilih jawaban yang merangkum keseluruhan isi paragraf secara seimbang.',
            highlight: 'Strategi Eliminasi: Tolak opsi "Too Narrow" & "Too Broad"'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Menebak Arti Kata Sulit (Context Clues)',
        bodyId:
          'Saat ditanya "The word X in line Y is closest in meaning to...", jangan panik jika belum pernah melihat kata X! Baca satu kalimat penuh tempat kata itu berada, cari sinyal seperti "or", "such as", "unlike", atau hubungan sebab-akibat di sekitarnya.',
        voiceText:
          'Jika bertemu kosakata asing di soal vocabulary, gunakan petunjuk konteks di sekitarnya. Perhatikan tanda koma, kata seperti unlike, atau penjelasan setelahnya untuk menebak makna positif atau negatifnya.',
        englishRule:
          'Sinyal Sinonim: "or", "that is", tanda koma (appositive)  ||  Sinyal Antonim: "however", "unlike", "whereas"',
        examples: [
          {
            en: 'Unlike nocturnal owls, hawks are diurnal predators that hunt during daylight hours.',
            id: 'Tidak seperti burung hantu yang nokturnal, elang adalah predator diurnal yang berburu pada siang hari. (Diurnal = aktif di siang hari).',
            highlight: 'Clue: "Unlike nocturnal" + "during daylight hours"'
          }
        ]
      }
    ],
    passage: {
      title: 'Bioluminescence in the Deep Ocean',
      text: `In the pitch-black depths of the ocean, where sunlight cannot penetrate beyond 200 meters, roughly 76 percent of marine organisms produce their own light through a chemical process called bioluminescence. Unlike ordinary light bulbs that generate significant heat, bioluminescent light is "cold light," meaning less than 20 percent of the energy emits thermal radiation. This remarkable adaptation serves multiple survival functions in an otherwise barren environment.\n\nFor instance, the deep-sea anglerfish dangles a glowing lure in front of its mouth to entice unsuspecting prey within striking distance. Conversely, certain species of squid eject a cloud of luminous fluid to startle and confuse approaching predators, allowing the squid to escape into the darkness. Still other organisms, such as lanternfish, use rows of light-producing organs along their bellies to camouflage themselves against the faint light filtering down from above.`,
      translationId: `Di kedalaman samudra yang gelap gulita, di mana sinar matahari tidak dapat menembus lebih dari 200 meter, sekitar 76 persen organisme laut menghasilkan cahayanya sendiri melalui proses kimia yang disebut bioluminesensi. Tidak seperti bola lampu biasa yang menghasilkan panas signifikan, cahaya bioluminesensi adalah "cahaya dingin," yang berarti kurang dari 20 persen energinya memancarkan radiasi termal. Adaptasi luar biasa ini memiliki berbagai fungsi bertahan hidup di lingkungan yang tandus.\n\nSebagai contoh, ikan anglerfish laut dalam menggantungkan umpan bercahaya di depan mulutnya untuk memikat mangsa yang tidak curiga agar mendekat dalam jarak serang. Sebaliknya, spesies cumi-cumi tertentu menyemprotkan awan cairan bercahaya untuk mengejutkan dan membingungkan predator yang mendekat, memungkinkan cumi-cumi itu melarikan diri ke dalam kegelapan. Organisme lainnya lagi, seperti ikan lentera, menggunakan deretan organ penghasil cahaya di sepanjang perutnya untuk menyamarkan diri terhadap cahaya redup yang menyaring turun dari atas.`
    },
    questions: [
      {
        id: 'b3-q1',
        type: 'Reading Comprehension',
        prompt: 'What is the main topic of the passage?',
        translationId: 'Apa topik utama dari bacaan di atas?',
        hintId:
          'Gabungkan ide dari kalimat pertama paragraf 1 dan kalimat terakhir paragraf 1.',
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
          subject:
            'Paragraf 1: Definisi & sifat bioluminescence | Paragraf 2: Contoh fungsi bertahan hidup',
          verb: 'Main Idea mencakup kedua paragraf',
          trap: 'Opsi A dan D terlalu sempit (hanya detail kecil)'
        },
        optionAnalysis: {
          A: 'Salah (Too Narrow): Anglerfish hanya satu contoh kecil di paragraf kedua.',
          B: 'Salah (Too Narrow): Bola lampu hanya perbandingan singkat di paragraf pertama.',
          C: 'BENAR: Merangkum sifat cahaya bioluminesensi (paragraf 1) dan fungsi bertahan hidupnya bagi makhluk laut dalam (paragraf 2).',
          D: 'Salah (Too Narrow): Kedalaman 200 meter hanya informasi pembuka latar belakang.'
        },
        formula:
          'Main Idea = Ide Paragraf 1 (Apa itu Bioluminescence) + Ide Paragraf 2 (Fungsi Survival-nya).',
        voiceWalkthrough:
          'Jawabannya C. Paragraf pertama menjelaskan apa itu bioluminesensi dan diakhiri dengan kalimat bahwa adaptasi ini punya banyak fungsi bertahan hidup. Paragraf kedua lalu memberi tiga contoh fungsi tersebut. Jadi C merangkum keseluruhan bacaan.'
      },
      {
        id: 'b3-q2',
        type: 'Reading Comprehension',
        prompt: 'The word "entice" in paragraph 2 is closest in meaning to _______.',
        translationId: 'Kata "entice" pada paragraf 2 paling dekat maknanya dengan _______.',
        hintId:
          'Ikan anglerfish memakai umpan bercahaya (glowing lure) di depan mulutnya untuk membuat mangsa mendekat.',
        options: [
          { key: 'A', text: 'frighten' },
          { key: 'B', text: 'attract' },
          { key: 'C', text: 'blind' },
          { key: 'D', text: 'chase' }
        ],
        correctKey: 'B',
        breakdown: {
          subject:
            'Context Clue: "dangles a glowing lure... to entice unsuspecting prey within striking distance"',
          verb: 'lure (umpan) berfungsi menarik mangsa agar mendekat',
          trap: 'Jangan tertukar dengan fungsi cumi-cumi di kalimat berikutnya ("startle/frighten")'
        },
        optionAnalysis: {
          A: 'Salah: "frighten" (menakut-nakuti) adalah fungsi cairan cumi-cumi, bukan umpan anglerfish.',
          B: 'BENAR: Umpan bercahaya digunakan untuk memikat atau menarik ("attract") mangsa agar masuk ke jarak serang.',
          C: 'Salah: Tidak disebutkan membutakan mangsa.',
          D: 'Salah: Ikan itu menunggu mangsa mendekat, bukan mengejar ("chase").'
        },
        formula:
          'Context Clue: "lure" (umpan) + "within striking distance" → menarik/memikat = attract.',
        voiceWalkthrough:
          'Jawabannya B, attract. Petunjuk konteksnya ada pada kata glowing lure yang artinya umpan bercahaya. Fungsi umpan tentu untuk memikat atau menarik mangsa agar mendekat ke mulut predator.'
      },
      {
        id: 'b3-q3',
        type: 'Reading Comprehension',
        prompt:
          'According to the passage, why is bioluminescent light referred to as "cold light"?',
        translationId:
          'Menurut bacaan, mengapa cahaya bioluminesensi disebut sebagai "cahaya dingin"?',
        hintId: 'Lihat kalimat kedua di paragraf pertama setelah kata "meaning".',
        options: [
          { key: 'A', text: 'It only functions in freezing ocean temperatures.' },
          { key: 'B', text: 'It produces very little heat energy.' },
          { key: 'C', text: 'It reflects cold moonlight from the ocean surface.' },
          { key: 'D', text: 'It is emitted exclusively by cold-blooded fish.' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Factual Detail Question (Paragraf 1, Kalimat 2)',
          verb: '"less than 20 percent of the energy emits thermal radiation"',
          trap: 'Kata "cold" di sini merujuk pada minimnya radiasi panas (thermal radiation), bukan suhu air laut.'
        },
        optionAnalysis: {
          A: 'Salah: Teks tidak mengatakan cahaya itu hanya bekerja di air beku.',
          B: 'BENAR: Teks menyatakan "less than 20 percent of the energy emits thermal radiation" (sangat sedikit energi panas yang dihasilkan).',
          C: 'Salah: Cahaya dihasilkan secara kimiawi oleh tubuh organisme, bukan pantulan bulan.',
          D: 'Salah: Tidak ada klaim tersebut dalam teks.'
        },
        formula:
          'Paraphrase Detection: "less than 20% emits thermal radiation" = "produces very little heat energy".',
        voiceWalkthrough:
          'Jawabannya B. Di paragraf pertama tertulis bahwa kurang dari 20 persen energinya memancarkan radiasi termal atau panas. Dalam soal TOEFL, frasa emits thermal radiation diparafrase menjadi produces heat energy.'
      },
      {
        id: 'b3-q4',
        type: 'Reading Comprehension',
        prompt: 'How do lanternfish utilize their bioluminescence?',
        translationId: 'Bagaimana ikan lentera memanfaatkan bioluminesensi mereka?',
        hintId: 'Cari kata kunci "lanternfish" di kalimat terakhir paragraf 2.',
        options: [
          { key: 'A', text: 'To blind predators with a bright cloud of fluid' },
          { key: 'B', text: 'To lure small crustaceans toward their mouths' },
          { key: 'C', text: 'To blend in with dim light coming from above' },
          { key: 'D', text: 'To communicate with mates during migration' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'Keyword Scan: "lanternfish" → kalimat terakhir paragraf 2',
          verb: '"camouflage themselves against the faint light filtering down from above"',
          trap: 'Opsi A milik squid, Opsi B milik anglerfish'
        },
        optionAnalysis: {
          A: 'Salah: Ini adalah strategi cumi-cumi (squid).',
          B: 'Salah: Ini adalah strategi anglerfish.',
          C: 'BENAR: "camouflage themselves against the faint light" bermakna sama dengan "blend in with dim light".',
          D: 'Salah: Tidak disebutkan di dalam bacaan.'
        },
        formula: 'Keyword Match: camouflage = blend in | faint light = dim light.',
        voiceWalkthrough:
          'Jawabannya C. Jika kita memindai kata lanternfish di kalimat terakhir, disebutkan bahwa mereka menggunakannya untuk kamuflase terhadap cahaya redup dari atas. Kata camouflage diparafrase menjadi blend in.'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // LEVEL 2: INTERMEDIATE
  // --------------------------------------------------------------------------
  {
    id: 'inter-1',
    level: 'Intermediate',
    levelNum: 2,
    code: '2.1',
    title: 'Adjective Clauses & Relative Pronouns (who, whom, which, that, whose)',
    shortTitle: 'Adjective Clauses & Relative Pronouns',
    category: 'Structure & Written Expression',
    estimatedMinutes: 15,
    lecturerIntro:
      'Selamat naik ke Level Intermediate! Di level ini, kalimat TOEFL mulai panjang karena adanya anak kalimat penjelas atau Adjective Clause. Mari kuasai perbedaan who, whom, which, dan whose agar tidak terjebak.',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Memilih Relative Pronoun yang Tepat',
        bodyId:
          'Adjective Clause menerangkan kata benda (Noun) tepat di depannya. Gunakan WHO/THAT untuk orang, WHICH/THAT untuk benda/hewan, dan WHOSE untuk kepemilikan (diikuti kata benda tanpa artikel).',
        voiceText:
          'Gunakan who untuk orang yang berperan sebagai subjek, whom untuk orang sebagai objek, which untuk benda atau hewan, dan whose untuk menyatakan kepemilikan.',
        englishRule:
          'Person (Subject): who/that + Verb  |  Person (Object): whom + S + V  |  Thing: which/that  |  Possession: whose + Noun',
        examples: [
          {
            en: 'The physicist who won the Nobel Prize delivered a lecture today.',
            id: 'Fisikawan yang memenangkan Hadiah Nobel menyampaikan kuliah hari ini.',
            highlight: 'who + won [Verb] (who menggantikan subjek orang)'
          },
          {
            en: 'The scientist whose theory changed modern physics was Albert Einstein.',
            id: 'Ilmuwan yang teorinya mengubah fisika modern adalah Albert Einstein.',
            highlight: 'whose + theory [Noun kepemilikan]'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Jebakan Preposisi + Whom / Which',
        bodyId:
          'Dalam bahasa Inggris formal TOEFL, preposisi (in, on, at, for, with, of) sering diletakkan sebelum relative pronoun. Ingat aturan mutlak: setelah preposisi HANYA boleh pakai WHOM (orang) atau WHICH (benda). Tidak boleh "in that" atau "with who"!',
        voiceText:
          'Catat aturan emas level Intermediate: setelah preposisi seperti in, of, atau for, kita hanya boleh memakai whom untuk orang atau which untuk benda. Jangan pernah memilih preposisi diikuti that atau who.',
        englishRule:
          'Preposition + WHOM (orang) / WHICH (benda)  ||  SALAH: in that, of who',
        examples: [
          {
            en: 'The laboratory in which the vaccine was developed is located in Geneva.',
            id: 'Laboratorium tempat vaksin itu dikembangkan terletak di Jenewa.',
            highlight: 'in + which (merujuk pada "The laboratory")'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'i1-q1',
        type: 'Structure',
        prompt:
          'Botanists are studying a rare rainforest orchid _______ petals emit a scent only at midnight.',
        translationId:
          'Para ahli botani sedang mempelajari anggrek hutan hujan langka yang kelopaknya mengeluarkan aroma hanya pada tengah malam.',
        hintId:
          'Kelopak bunga ("petals") adalah milik anggrek tersebut. Kata hubung kepemilikan apa yang tepat?',
        options: [
          { key: 'A', text: 'which' },
          { key: 'B', text: 'whose' },
          { key: 'C', text: 'that it' },
          { key: 'D', text: 'whom' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Main: Botanists | Adj Clause: whose petals',
          verb: 'Main: are studying | Adj Clause: emit',
          trap: 'whose bisa dipakai untuk benda/tumbuhan dalam bahasa Inggris formal TOEFL!'
        },
        optionAnalysis: {
          A: 'Salah: Jika memakai "which", kalimat menjadi "which petals emit" tanpa hubungan kepemilikan.',
          B: 'BENAR: "whose" menunjukkan kepemilikan ("kelopaknya") dan langsung diikuti kata benda "petals".',
          C: 'Salah: "that it" menyebabkan subjek ganda dalam anak kalimat.',
          D: 'Salah: "whom" hanya untuk objek manusia.'
        },
        formula: '[Noun] + WHOSE + [Noun milik] + [Verb].',
        voiceWalkthrough:
          'Jawabannya B, whose. Perhatikan kata petals setelah titik-titik adalah milik dari anggrek tersebut. Dalam TOEFL, whose tidak hanya untuk manusia, tapi juga sangat umum dipakai untuk benda, hewan, maupun tumbuhan.'
      },
      {
        id: 'i1-q2',
        type: 'Structure',
        prompt:
          'The archaeological site _______ the ancient pottery was unearthed dates back to the Bronze Age.',
        translationId:
          'Situs arkeologi tempat tembikar kuno itu digali berasal dari Zaman Perunggu.',
        hintId:
          'Kita butuh preposisi + relative pronoun untuk menggantikan "at the site".',
        options: [
          { key: 'A', text: 'in that' },
          { key: 'B', text: 'at which' },
          { key: 'C', text: 'which' },
          { key: 'D', text: 'where it' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Main: The archaeological site | Adj Clause: the ancient pottery',
          verb: 'Main: dates back | Adj Clause: was unearthed',
          trap: '"in that" adalah jebakan klasik TOEFL yang selalu salah sebagai adjective clause!'
        },
        optionAnalysis: {
          A: 'Salah: "that" tidak pernah boleh didahului preposisi dalam adjective clause.',
          B: 'BENAR: "at which" (bermakna sama dengan "where") menghubungkan lokasi "site" dengan klausa lengkap di belakangnya.',
          C: 'Salah: Jika hanya "which", kalimat menjadi tidak lengkap karena "was unearthed" adalah pasif intransitif di sini (butuh keterangan tempat "at the site").',
          D: 'Salah: "where it" menambahkan subjek ganda "it".'
        },
        formula: '[Place Noun] + at/in WHICH + [Subject + Verb lengkap].',
        voiceWalkthrough:
          'Jawabannya B, at which. Karena klausa setelahnya sudah lengkap memiliki subjek the ancient pottery dan kata kerja was unearthed, kita butuh keterangan tempat, yaitu at which. Ingat, opsi A in that selalu salah.'
      },
      {
        id: 'i1-q3',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'Dr. Lin is the ', u: null },
          { text: 'marine', u: 'A' },
          { text: ' biologist ', u: null },
          { text: 'whom', u: 'B' },
          { text: ' discovered the ', u: null },
          { text: 'new', u: 'C' },
          { text: ' species of deep-sea ', u: null },
          { text: 'jellyfish', u: 'D' },
          { text: '.', u: null }
        ],
        translationId:
          'Dr. Lin adalah ahli biologi kelautan yang menemukan spesies baru ubur-ubur laut dalam tersebut.',
        hintId:
          'Setelah kata "whom", langsung muncul kata kerja "discovered". Apakah "whom" boleh menjadi subjek?',
        options: [
          { key: 'A', text: 'marine' },
          { key: 'B', text: 'whom' },
          { key: 'C', text: 'new' },
          { key: 'D', text: 'jellyfish' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Main: Dr. Lin | Adj Clause Subject: WHO (bukan whom)',
          verb: 'Main: is | Adj Clause: discovered',
          trap: 'whom dipakai jika diikuti Subject+Verb, sedangkan who diikuti langsung oleh Verb!'
        },
        optionAnalysis: {
          A: 'Benar: "marine" tepat menerangkan "biologist".',
          B: 'SALAH (Harus diubah): Karena langsung diikuti oleh Verb ("discovered"), posisi ini adalah Subject, sehingga wajib memakai "who", bukan "whom".',
          C: 'Benar: "new" adalah adjective yang tepat.',
          D: 'Benar: "jellyfish" bentuk tunggal dan jamaknya tetap "jellyfish".'
        },
        formula: 'Person + WHO + Verb  ||  Person + WHOM + Subject + Verb.',
        voiceWalkthrough:
          'Bagian yang salah adalah B, whom. Lihat kata setelahnya: discovered adalah kata kerja. Karena posisi yang diisi adalah subjek dari kata kerja discovered, kita wajib menggunakan who, bukan whom.'
      },
      {
        id: 'i1-q4',
        type: 'Structure',
        prompt:
          'Geothermal energy, _______ harnesses heat from beneath the Earth’s crust, provides reliable baseload power.',
        translationId:
          'Energi panas bumi, yang memanfaatkan panas dari bawah kerak Bumi, menyediakan daya beban dasar yang andal.',
        hintId:
          'Perhatikan tanda koma sebelum dan sesudah klausa penjelas (Non-restrictive Adjective Clause)!',
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
          trap: 'Aturan Koma: Kata "that" TIDAK PERNAH boleh dipakai setelah tanda koma!'
        },
        optionAnalysis: {
          A: 'Salah: Relative pronoun "that" dilarang keras digunakan dalam klausa non-restriktif (yang diapit tanda koma).',
          B: 'BENAR: "which" adalah satu-satunya relative pronoun benda yang sah digunakan setelah tanda koma.',
          C: 'Salah: "what" tidak boleh memiliki antecedent ("Geothermal energy") di depannya.',
          D: 'Salah: "it" bukan connector sehingga membuat dua verb tanpa penghubung.'
        },
        formula:
          '[Noun] + , + WHICH + [Verb] + , + [Main Verb]. (Jangan pernah pakai ", that"!).',
        voiceWalkthrough:
          'Jawabannya B, which. Ini aturan wajib TOEFL: jika ada tanda koma sebelum relative pronoun, kamu tidak boleh memilih that. Jadi which adalah satu-satunya jawaban benar.'
      }
    ]
  },

  {
    id: 'inter-2',
    level: 'Intermediate',
    levelNum: 2,
    code: '2.2',
    title: 'Parallel Structure & Paired Conjunctions',
    shortTitle: 'Parallel Structure & Paired Conjunctions',
    category: 'Structure & Written Expression',
    estimatedMinutes: 14,
    lecturerIntro:
      'Parallel Structure adalah salah satu topik favorit pembuat soal TOEFL karena polanya sangat visual dan matematis. Jika sebelum "and" berupa Noun, setelah "and" wajib Noun juga. Yuk kita lihat polanya!',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Prinsip Kesejajaran (Parallelism)',
        bodyId:
          'Kata hubung setara seperti AND, BUT, OR harus menghubungkan kelas kata atau struktur tata bahasa yang sama persis: Noun dengan Noun, Verb dengan Verb, Adjective dengan Adjective, atau Gerund (V-ing) dengan Gerund.',
        voiceText:
          'Prinsip Parallel Structure sangat sederhana: kata hubung seperti and, but, atau or wajib menghubungkan bentuk kata yang kembar. Jika di kiri berupa kata benda, di kanan juga harus kata benda.',
        englishRule:
          'A, B, and C  →  Semua elemen (A, B, C) wajib memiliki Part of Speech yang identik!',
        examples: [
          {
            en: 'Good scientific writing requires clarity, precision, and objectivity.',
            id: 'Penulisan ilmiah yang baik membutuhkan kejelasan, ketepatan, dan objektivitas. (Ketiganya Noun).',
            highlight: 'clarity [Noun], precision [Noun], and objectivity [Noun]'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Paired Conjunctions (Konjungsi Berpasangan)',
        bodyId:
          'Hafalkan 4 pasangan tetap ini dan jangan pernah menukar pasangannya: (1) both ... and ..., (2) either ... or ..., (3) neither ... nor ..., (4) not only ... but also ... . Struktur setelah kata pertama wajib sama dengan struktur setelah kata kedua!',
        voiceText:
          'Hafalkan empat pasangan konjungsi tetap: both berpasangan dengan and, either dengan or, neither dengan nor, dan not only dengan but also. Bentuk kata setelah keduanya harus sejajar.',
        englishRule:
          'both [X] and [X]  |  either [X] or [X]  |  neither [X] nor [X]  |  not only [X] but also [X]',
        examples: [
          {
            en: 'The new telescope can observe both distant galaxies and nearby asteroids.',
            id: 'Teleskop baru itu dapat mengamati baik galaksi jauh maupun asteroid dekat.',
            highlight: 'both + [Noun Phrase] + and + [Noun Phrase]'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'i2-q1',
        type: 'Structure',
        prompt:
          'Migratory birds navigate by using the position of the sun, the alignment of the stars, and _______.',
        translationId:
          'Burung-burung yang bermigrasi bernavigasi dengan menggunakan posisi matahari, susunan bintang, dan _______.',
        hintId:
          'Lihat dua elemen sebelumnya: "the position of...", "the alignment of...". Pilih bentuk Noun Phrase yang sejajar!',
        options: [
          { key: 'A', text: 'they sense the Earth’s magnetic field' },
          { key: 'B', text: 'sensing the Earth’s magnetic field' },
          { key: 'C', text: 'the Earth’s magnetic field' },
          { key: 'D', text: 'magnetically sensing the Earth' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'Parallel Series: [Noun Phrase 1], [Noun Phrase 2], and [Noun Phrase 3]',
          verb: 'navigate (Main Verb)',
          trap: 'Opsi A berupa klausa lengkap dan Opsi B berupa Gerund, tidak sejajar dengan Noun Phrase!'
        },
        optionAnalysis: {
          A: 'Salah: Berupa klausa lengkap (S + V), merusak kesejajaran Noun Phrase.',
          B: 'Salah: Berupa Gerund (V-ing), tidak sejajar dengan "the position" dan "the alignment".',
          C: 'BENAR: "the Earth’s magnetic field" adalah Noun Phrase murni yang sejajar dengan dua elemen sebelumnya.',
          D: 'Salah: Frasa adverb + gerund, tidak paralel.'
        },
        formula: 'using [Noun Phrase 1], [Noun Phrase 2], and [Noun Phrase 3].',
        voiceWalkthrough:
          'Jawabannya C, the Earth’s magnetic field. Perhatikan pola rinciannya: the position of the sun, the alignment of the stars, semuanya adalah frasa kata benda. Maka elemen ketiga setelah and juga wajib frasa kata benda.'
      },
      {
        id: 'i2-q2',
        type: 'Structure',
        prompt:
          'Wind turbines are valued because they are _______ environmentally sustainable and economically viable.',
        translationId:
          'Turbin angin dihargai karena mereka _______ berkelanjutan secara lingkungan dan layak secara ekonomi.',
        hintId:
          'Lihat kata hubung di tengah: "and". Pasangan dari "... and ..." adalah?',
        options: [
          { key: 'A', text: 'not only' },
          { key: 'B', text: 'either' },
          { key: 'C', text: 'both' },
          { key: 'D', text: 'neither' }
        ],
        correctKey: 'C',
        breakdown: {
          subject:
            'Paired Conjunction: BOTH [Adverb + Adjective] AND [Adverb + Adjective]',
          verb: 'are valued / are',
          trap: 'Pasangan tetap: both...and, bukan not only...and!'
        },
        optionAnalysis: {
          A: 'Salah: "not only" pasangannya harus "but also", bukan "and" saja.',
          B: 'Salah: "either" pasangannya adalah "or".',
          C: 'BENAR: "both" berpasangan tepat dengan "and" dan mengapit dua frasa adjective yang sejajar.',
          D: 'Salah: "neither" pasangannya adalah "nor".'
        },
        formula: 'BOTH + [Adv + Adj] + AND + [Adv + Adj].',
        voiceWalkthrough:
          'Jawabannya C, both. Cukup lihat kata and di antara environmentally sustainable dan economically viable. Pasangan resmi untuk kata and adalah both.'
      },
      {
        id: 'i2-q3',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'To ', u: null },
          { text: 'succeed', u: 'A' },
          { text: ' in competitive athletics, an athlete must train ', u: null },
          { text: 'rigorously', u: 'B' },
          { text: ', eat ', u: null },
          { text: 'nutritious', u: 'C' },
          { text: ', and sleep ', u: null },
          { text: 'adequately', u: 'D' },
          { text: '.', u: null }
        ],
        translationId:
          'Untuk berhasil dalam atletik kompetitif, seorang atlet harus berlatih dengan ketat, makan dengan bergizi, dan tidur dengan cukup.',
        hintId:
          'Bandingkan kata keterangan (Adverb) setelah train, eat, dan sleep!',
        options: [
          { key: 'A', text: 'succeed' },
          { key: 'B', text: 'rigorously' },
          { key: 'C', text: 'nutritious' },
          { key: 'D', text: 'adequately' }
        ],
        correctKey: 'C',
        breakdown: {
          subject:
            'Parallel Pattern: [Verb + Adverb], [Verb + Adverb], and [Verb + Adverb]',
          verb: 'train rigorously | eat nutritious(ly) | sleep adequately',
          trap: 'nutritious adalah Adjective, padahal dibutuhkan Adverb (-ly) untuk menerangkan verb "eat"!'
        },
        optionAnalysis: {
          A: 'Benar: "succeed" (V1) tepat setelah "To".',
          B: 'Benar: "rigorously" (Adverb) menerangkan cara "train".',
          C: 'SALAH (Harus diubah): Agar sejajar dengan "rigorously" dan "adequately", kata sifat "nutritious" harus diubah menjadi adverb "nutritiously".',
          D: 'Benar: "adequately" (Adverb) menerangkan cara "sleep".'
        },
        formula: 'Verb + Adverb (-ly), Verb + Adverb (-ly), and Verb + Adverb (-ly).',
        voiceWalkthrough:
          'Bagian yang salah adalah C, nutritious. Perhatikan kesejajaran tiga aktivitasnya: train rigorously, sleep adequately, keduanya memakai kata keterangan berakhiran ly. Maka kata nutritious harus diubah menjadi adverb nutritiously.'
      },
      {
        id: 'i2-q4',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'The ', u: null },
          { text: 'proposed', u: 'A' },
          { text: ' highway project will ', u: null },
          { text: 'not only', u: 'B' },
          { text: ' reduce traffic congestion ', u: null },
          { text: 'or', u: 'C' },
          { text: ' boost ', u: null },
          { text: 'regional', u: 'D' },
          { text: ' trade.', u: null }
        ],
        translationId:
          'Proyek jalan raya yang diusulkan tidak hanya akan mengurangi kemacetan lalu lintas tetapi juga meningkatkan perdagangan regional.',
        hintId: 'Cek pasangan dari "not only"!',
        options: [
          { key: 'A', text: 'proposed' },
          { key: 'B', text: 'not only' },
          { key: 'C', text: 'or' },
          { key: 'D', text: 'regional' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'Paired Conjunction Error: not only ... or (SALAH!)',
          verb: 'will reduce ... boost',
          trap: 'Pasangan not only adalah but also'
        },
        optionAnalysis: {
          A: 'Benar: "proposed" adalah participle adjective yang tepat.',
          B: 'Benar: "not only" diletakkan dengan tepat sebelum verb "reduce".',
          C: 'SALAH (Harus diubah): Pasangan dari "not only" adalah "but also", bukan "or".',
          D: 'Benar: "regional" adalah adjective yang tepat.'
        },
        formula: 'not only + [Verb 1] + BUT ALSO + [Verb 2].',
        voiceWalkthrough:
          'Yang salah adalah C, or. Di depan ada not only, maka pasangan wajibnya di tengah kalimat adalah but also, bukan or.'
      }
    ]
  },

  {
    id: 'inter-3',
    level: 'Intermediate',
    levelNum: 2,
    code: '2.3',
    title: 'Gerund vs. Infinitive & Passive Voice Patterns',
    shortTitle: 'Gerund, Infinitive & Passive Voice',
    category: 'Structure & Written Expression',
    estimatedMinutes: 15,
    lecturerIntro:
      'Di topik 2.3 ini, kita membedah dua pola yang sangat sering muncul di Written Expression: kapan kata kerja diikuti Gerund (V-ing) vs Infinitive (to V1), serta ciri mutlak kalimat Pasif dalam TOEFL.',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Kata Kerja Wajib Gerund vs. Wajib Infinitive',
        bodyId:
          'Beberapa kata kerja tertentu wajib diikuti Gerund (V-ing), seperti: avoid, consider, enjoy, finish, postpone, suggest, recommend. Sementara kata kerja lain wajib diikuti To-Infinitive (to V1), seperti: decide, expect, hope, manage, plan, refuse, tend.',
        voiceText:
          'Kata kerja seperti avoid, consider, enjoy, dan suggest wajib diikuti Gerund atau V-ing. Sebaliknya, decide, expect, plan, dan tend wajib diikuti to verb satu.',
        englishRule:
          'avoid / consider / suggest + V-ing  ||  decide / expect / tend / plan + to V1',
        examples: [
          {
            en: 'Urban planners recommend expanding public transit networks before building new highways.',
            id: 'Perencana kota merekomendasikan perluasan jaringan transit publik sebelum membangun jalan raya baru.',
            highlight:
              'recommend + expanding (Gerund) | before + building (Preposition + Gerund)'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Rumus Mutlak Passive Voice (Kalimat Pasif)',
        bodyId:
          'Dalam bahasa Inggris, kalimat pasif ("di-" atau "ter-") WAJIB mengandung unsur [BE + Past Participle (V3)]. Jika subjeknya adalah benda mati yang dikenai tindakan (misalnya: "The bridge was built"), jangan pernah memakai bentuk aktif ("The bridge built")!',
        voiceText:
          'Ingat rumus kalimat pasif: wajib ada kata kerja bantu BE diikuti Verb bentuk ketiga. Jika subjek kalimat adalah benda yang menerima aksi, pastikan bentuknya pasif.',
        englishRule:
          'Passive Voice = [is / am / are / was / were / be / been / being] + [V3 (Past Participle)]',
        examples: [
          {
            en: 'Penicillin was accidentally discovered by Alexander Fleming in 1928.',
            id: 'Penisilin ditemukan secara tidak sengaja oleh Alexander Fleming pada tahun 1928.',
            highlight: 'was [BE] + discovered [V3] + by [Agent]'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'i3-q1',
        type: 'Structure',
        prompt:
          'The Nobel committee decided _______ the physics prize to three researchers for their work on quantum entanglement.',
        translationId:
          'Komite Nobel memutuskan _______ hadiah fisika kepada tiga peneliti atas karya mereka tentang keterikatan kuantum.',
        hintId: 'Kata kerja "decide" diikuti Gerund atau To-Infinitive?',
        options: [
          { key: 'A', text: 'awarding' },
          { key: 'B', text: 'to award' },
          { key: 'C', text: 'award' },
          { key: 'D', text: 'awarded' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'The Nobel committee',
          verb: 'decided + to award (Verb + To-Infinitive)',
          trap: 'decide tidak boleh diikuti V-ing'
        },
        optionAnalysis: {
          A: 'Salah: "decide" tidak diikuti Gerund.',
          B: 'BENAR: Kata kerja "decide" selalu diikuti oleh To-Infinitive ("to award").',
          C: 'Salah: Kata kerja dasar "award" tidak bisa langsung mengikuti "decided".',
          D: 'Salah: Bentuk lampau ganda.'
        },
        formula: 'decide / plan / expect / tend + TO + V1.',
        voiceWalkthrough:
          'Jawabannya B, to award. Kata kerja decide termasuk kelompok kata kerja yang wajib diikuti oleh to infinitive.'
      },
      {
        id: 'i3-q2',
        type: 'Structure',
        prompt:
          'The ancient manuscript _______ in a sealed clay jar inside a desert cave in 1947.',
        translationId:
          'Naskah kuno tersebut _______ di dalam guci tanah liat tersegel di dalam gua gurun pada tahun 1947.',
        hintId:
          'Subjeknya "The ancient manuscript" (benda mati) dan ada tahun lampau "1947". Aktif atau Pasif?',
        options: [
          { key: 'A', text: 'discovered' },
          { key: 'B', text: 'was discovering' },
          { key: 'C', text: 'was discovered' },
          { key: 'D', text: 'has discovered' }
        ],
        correctKey: 'C',
        breakdown: {
          subject: 'The ancient manuscript (Benda mati penerima aksi)',
          verb: 'was discovered (Simple Past Passive)',
          trap: 'in 1947 menuntut Simple Past (was), bukan Present Perfect (has)'
        },
        optionAnalysis: {
          A: 'Salah: "discovered" saja adalah kalimat aktif (berarti naskah itu yang menemukan sesuatu).',
          B: 'Salah: "was discovering" adalah aktif progresif.',
          C: 'BENAR: Naskah kuno "ditemukan" di masa lampau (1947), maka wajib memakai Pasif Lampau "was discovered".',
          D: 'Salah: Aktif dan tidak cocok dengan keterangan waktu lampau spesifik "in 1947".'
        },
        formula: 'Benda Mati + was/were + V3 + in [Tahun Lampau].',
        voiceWalkthrough:
          'Jawabannya C, was discovered. Subjeknya adalah naskah kuno yang tentu saja ditemukan, bukan menemukan. Karena ada tahun 1947, kita gunakan pasif bentuk lampau yaitu was discovered.'
      },
      {
        id: 'i3-q3',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'Many marine ', u: null },
          { text: 'biologists', u: 'A' },
          { text: ' suggest ', u: null },
          { text: 'to establish', u: 'B' },
          { text: ' larger protected zones to ', u: null },
          { text: 'preserve', u: 'C' },
          { text: ' coral reef ', u: null },
          { text: 'ecosystems', u: 'D' },
          { text: '.', u: null }
        ],
        translationId:
          'Banyak ahli biologi kelautan menyarankan untuk mendirikan zona lindung yang lebih besar guna melestarikan ekosistem terumbu karang.',
        hintId: 'Ingat aturan kata kerja "suggest"!',
        options: [
          { key: 'A', text: 'biologists' },
          { key: 'B', text: 'to establish' },
          { key: 'C', text: 'preserve' },
          { key: 'D', text: 'ecosystems' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Many marine biologists',
          verb: 'suggest + establishing (Wajib Gerund, bukan To-Infinitive)',
          trap: 'Dalam bahasa Indonesia "menyarankan untuk", tapi di Inggris "suggest" haram pakai "to"!'
        },
        optionAnalysis: {
          A: 'Benar: Kata benda jamak setelah "Many".',
          B: 'SALAH (Harus diubah): Kata kerja "suggest" wajib diikuti Gerund ("establishing"), tidak boleh "to establish".',
          C: 'Benar: "preserve" (V1) tepat setelah "to" tujuan.',
          D: 'Benar: Kata benda jamak yang tepat.'
        },
        formula: 'suggest / recommend / avoid / enjoy + V-ING (Jangan pakai TO!).',
        voiceWalkthrough:
          'Yang salah adalah B, to establish. Kata kerja suggest dalam bahasa Inggris tidak boleh diikuti to infinitive, melainkan wajib diikuti gerund. Jadi harus diubah menjadi establishing.'
      },
      {
        id: 'i3-q4',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'Solar ', u: null },
          { text: 'radiation', u: 'A' },
          { text: ' is ', u: null },
          { text: 'absorb', u: 'B' },
          { text: ' by greenhouse gases ', u: null },
          { text: 'trapped', u: 'C' },
          { text: ' in the Earth’s ', u: null },
          { text: 'atmosphere', u: 'D' },
          { text: '.', u: null }
        ],
        translationId:
          'Radiasi matahari diserap oleh gas rumah kaca yang terperangkap di atmosfer Bumi.',
        hintId: 'Lihat setelah kata "is" dan sebelum kata "by"!',
        options: [
          { key: 'A', text: 'radiation' },
          { key: 'B', text: 'absorb' },
          { key: 'C', text: 'trapped' },
          { key: 'D', text: 'atmosphere' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Solar radiation',
          verb: 'is absorbed (Passive Voice: BE + V3)',
          trap: 'is absorb kurang akhiran -ed (V3)'
        },
        optionAnalysis: {
          A: 'Benar: "radiation" adalah uncountable noun tunggal yang cocok dengan "is".',
          B: 'SALAH (Harus diubah): Kalimat pasif (ada "is" dan "by") wajib memakai V3 ("absorbed"), bukan V1 ("absorb").',
          C: 'Benar: "trapped" adalah past participle yang menerangkan "greenhouse gases".',
          D: 'Benar: "atmosphere" adalah noun yang tepat.'
        },
        formula: 'is / are / was / were + V3 (Past Participle) + by.',
        voiceWalkthrough:
          'Bagian yang salah adalah B, absorb. Ada kata kerja bantu is dan preposisi pelaku by, yang menandakan kalimat pasif. Maka kata kerja absorb wajib diubah menjadi bentuk ketiga, yaitu absorbed.'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // LEVEL 3: ADVANCE (TARGET 550+)
  // --------------------------------------------------------------------------
  {
    id: 'adv-1',
    level: 'Advance',
    levelNum: 3,
    code: '3.1',
    title: 'Reduced Adjective & Adverb Clauses (Participle Phrases)',
    shortTitle: 'Reduced Clauses (V-ing vs. V3)',
    category: 'Structure & Written Expression (550+)',
    estimatedMinutes: 16,
    lecturerIntro:
      'Selamat datang di Level Advance — gerbang menuju skor 550 ke atas! Soal-soal di level ini menguji kemampuan kamu meringkas anak kalimat menjadi Participle Phrase (V-ing untuk makna aktif, V3 untuk makna pasif). Fokus ya!',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Mereduksi Adjective Clause (V-ing vs. V3)',
        bodyId:
          'Adjective Clause dapat dipangkas dengan membuang Relative Pronoun (who/which/that) dan To Be. Jika maknanya AKTIF (melakukan aksi), ubah kata kerja menjadi V-ing (Present Participle). Jika maknanya PASIF (dikenai aksi), gunakan V3 (Past Participle).',
        voiceText:
          'Untuk meringkas Adjective Clause, buang kata hubungnya. Jika kata benda di depannya melakukan aksi secara aktif, gunakan V-ing. Jika dikenai aksi secara pasif, gunakan V3.',
        englishRule:
          'Aktif: The man (who is) standing there → The man standing there  ||  Pasif: The book (which was) written by X → The book written by X',
        examples: [
          {
            en: 'The satellite orbiting Mars transmits high-resolution images daily.',
            id: 'Satelit yang mengorbit Mars mengirimkan gambar beresolusi tinggi setiap hari. (Satelit aktif mengorbit → orbiting).',
            highlight: 'orbiting = Reduced dari "which orbits" (Aktif)'
          },
          {
            en: 'The data collected during the expedition confirmed climate models.',
            id: 'Data yang dikumpulkan selama ekspedisi mengonfirmasi model iklim. (Data pasif dikumpulkan → collected).',
            highlight: 'collected = Reduced dari "which was collected" (Pasif)'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Reduced Adverb Clause di Awal Kalimat (Dangling Modifier Trap)',
        bodyId:
          'Jika kalimat diawali dengan [V-ing ...] atau [V3 ...] lalu koma, maka Subjek di belakang koma WAJIB menjadi pelaku (untuk V-ing) atau penerima aksi (untuk V3) dari frasa pembuka tersebut!',
        voiceText:
          'Hati-hati jika kalimat dibuka dengan frasa V-ing atau V3 di depan koma. Subjek utama tepat setelah koma harus logis melakukan atau menerima aksi tersebut.',
        englishRule: '[V-ing / V3 + Modifier], + [LOGICAL SUBJECT + Main Verb]',
        examples: [
          {
            en: 'Published in 1859, Darwin’s book sparked intense scientific debate.',
            id: 'Diterbitkan pada tahun 1859, buku Darwin memicu perdebatan ilmiah yang sengit.',
            highlight:
              'Published (V3 Pasif) + , + Darwin’s book (Subjek yang diterbitkan)'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'a1-q1',
        type: 'Structure',
        prompt:
          'The proteins _______ by ribosomes play crucial roles in cellular repair and metabolism.',
        translationId:
          'Protein yang disintesis oleh ribosom memainkan peran penting dalam perbaikan dan metabolisme sel.',
        hintId:
          'Ada kata "by ribosomes" di belakang titik-titik! Apakah protein menyintesis atau disintesis (pasif)?',
        options: [
          { key: 'A', text: 'synthesizing' },
          { key: 'B', text: 'synthesized' },
          { key: 'C', text: 'are synthesized' },
          { key: 'D', text: 'which synthesized' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'The proteins (Subjek utama)',
          verb: 'play (Main Verb sudah ada di belakang!)',
          trap: 'Jangan pilih C ("are synthesized") karena akan membuat 2 Main Verb tanpa connector!'
        },
        optionAnalysis: {
          A: 'Salah: "synthesizing" bermakna aktif, padahal ada "by ribosomes" (pasif).',
          B: 'BENAR: Reduced Adjective Clause pasif ("which are synthesized" → "synthesized" V3).',
          C: 'Salah: Sudah ada main verb "play" di belakang, sehingga tidak boleh memakai finite verb "are synthesized".',
          D: 'Salah: "which synthesized" bermakna aktif.'
        },
        formula: '[Noun] + [V3 (Reduced Passive)] + by [Agent] + [Main Verb].',
        voiceWalkthrough:
          'Jawabannya B, synthesized. Perhatikan kalimat ini sudah memiliki kata kerja utama yaitu play. Jadi bagian di antara The proteins dan play hanyalah penjelas. Karena ada kata by ribosomes yang bermakna pasif, kita gunakan past participle synthesized.'
      },
      {
        id: 'a1-q2',
        type: 'Structure',
        prompt:
          '_______ at high temperatures, carbon atoms rearrange themselves into a crystalline diamond structure.',
        translationId:
          'Ketika dipanaskan pada suhu tinggi, atom karbon menyusun ulang dirinya menjadi struktur berlian kristal.',
        hintId:
          'Subjek setelah koma adalah "carbon atoms". Atom karbon dipanaskan (pasif) atau memanaskan?',
        options: [
          { key: 'A', text: 'Heating' },
          { key: 'B', text: 'When heated' },
          { key: 'C', text: 'It is heated' },
          { key: 'D', text: 'When heating' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'carbon atoms (Subjek utama setelah koma)',
          verb: 'rearrange (Main Verb)',
          trap: 'Atom karbon dikenai perlakuan panas (Pasif), sehingga butuh V3 ("heated")!'
        },
        optionAnalysis: {
          A: 'Salah: "Heating" bermakna aktif (seolah atom karbon yang memanaskan sesuatu).',
          B: 'BENAR: Reduced Adverb Clause pasif ("When they are heated" → "When heated").',
          C: 'Salah: Menghasilkan dua klausa lengkap tanpa connector.',
          D: 'Salah: "When heating" bermakna aktif.'
        },
        formula: 'When + [V3 (Pasif)] + , + [Subject yang dikenai aksi] + [Verb].',
        voiceWalkthrough:
          'Jawabannya B, When heated. Subjek setelah koma adalah carbon atoms. Secara logika, atom karbon dipanaskan pada suhu tinggi, bermakna pasif. Maka bentuk reduksi adverb clause-nya adalah When heated.'
      },
      {
        id: 'a1-q3',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'The ', u: null },
          { text: 'meteorite', u: 'A' },
          { text: ' ', u: null },
          { text: 'striking', u: 'B' },
          { text: ' the Yucatan Peninsula 66 million years ago ', u: null },
          { text: 'triggered', u: 'C' },
          { text: ' global ', u: null },
          { text: 'climatic', u: 'D' },
          { text: ' changes.', u: null }
        ],
        translationId:
          'Meteorit yang menghantam Semenanjung Yucatan 66 juta tahun lalu memicu perubahan iklim global.',
        hintId:
          'Perhatikan keterangan waktu lampau spesifik "66 million years ago" untuk peristiwa tunggal.',
        options: [
          { key: 'A', text: 'meteorite' },
          { key: 'B', text: 'striking' },
          { key: 'C', text: 'triggered' },
          { key: 'D', text: 'climatic' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'The meteorite',
          verb: 'triggered (Main Verb lampau)',
          trap: 'Peristiwa lampau tunggal dengan waktu spesifik ("66 million years ago") lebih tepat memakai "that struck" daripada "striking".'
        },
        optionAnalysis: {
          A: 'Benar: "meteorite" adalah subjek tunggal yang valid.',
          B: 'SALAH (Harus diubah): Untuk peristiwa tunggal di masa lampau spesifik ("66 million years ago"), bentuk klausa relatif lampau "that struck" lebih tepat daripada present participle "striking".',
          C: 'Benar: "triggered" adalah main verb Simple Past yang tepat.',
          D: 'Benar: "climatic" adalah adjective yang tepat menerangkan "changes".'
        },
        formula:
          'Aksi lampau tunggal dengan keterangan waktu spesifik ("66 million years ago") → gunakan "that + V2 (that struck)".',
        voiceWalkthrough:
          'Bagian yang perlu diperbaiki adalah B, striking. Karena terdapat keterangan waktu lampau yang sangat spesifik yaitu 66 million years ago untuk peristiwa tunggal, bentuk klausa relatif lampau that struck jauh lebih akurat secara tata bahasa TOEFL.'
      },
      {
        id: 'a1-q4',
        type: 'Structure',
        prompt:
          '_______ through dense fog, modern radar systems rely on radio waves to detect distant obstacles.',
        translationId:
          'Mampu menembus kabut tebal, sistem radar modern mengandalkan gelombang radio untuk mendeteksi rintangan jauh.',
        hintId:
          'Subjek setelah koma adalah "modern radar systems". Sistem radar menembus kabut (aktif) atau ditembus?',
        options: [
          { key: 'A', text: 'Penetrated' },
          { key: 'B', text: 'Penetrating' },
          { key: 'C', text: 'It penetrates' },
          { key: 'D', text: 'To be penetrated' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'modern radar systems (Subjek pelaku aktif)',
          verb: 'rely (Main Verb)',
          trap: 'Radar systems melakukan aksi menembus (Aktif → V-ing)'
        },
        optionAnalysis: {
          A: 'Salah: "Penetrated" (V3) bermakna pasif (seolah radar yang ditembus).',
          B: 'BENAR: "Penetrating" (Present Participle aktif) menjelaskan kemampuan subjek "modern radar systems".',
          C: 'Salah: Menghasilkan dua klausa tanpa connector.',
          D: 'Salah: Pasif infinitive, tidak logis.'
        },
        formula:
          '[V-ing (Aktif)] + [Prepositional Phrase], + [Subject Pelaku] + [Main Verb].',
        voiceWalkthrough:
          'Jawabannya B, Penetrating. Subjek setelah koma adalah modern radar systems. Karena radar secara aktif menembus kabut tebal, maka bentuk participle pembukanya harus aktif yaitu Penetrating.'
      }
    ]
  },

  {
    id: 'adv-2',
    level: 'Advance',
    levelNum: 3,
    code: '3.2',
    title: 'Negative Inversion & Conditional Without "If"',
    shortTitle: 'Inversion & Conditional Tanpa "If"',
    category: 'Structure & Written Expression (550+)',
    estimatedMinutes: 16,
    lecturerIntro:
      'Inilah materi pembeda antara skor 490 dan skor 550+! Dalam bahasa Inggris akademik tingkat lanjut, posisi Subject dan Auxiliary Verb bisa dibalik seperti kalimat tanya (Inversion) jika kalimat diawali kata negatif atau pengandaian tanpa If.',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Negative Inversion (Pembalikan karena Ekspresi Negatif)',
        bodyId:
          'Jika kalimat dibuka dengan kata/frasa negatif atau pembatas seperti: Never, Rarely, Seldom, Hardly, Not only, Only after, Only by, Under no circumstances, maka susunan setelahnya WAJIB dibalik: [Auxiliary Verb + Subject + Main Verb].',
        voiceText:
          'Jika kalimat dimulai dengan ekspresi negatif seperti Never, Rarely, Seldom, atau Not only, susunannya wajib dibalik seperti kalimat tanya: kata kerja bantu dulu, baru subjek.',
        englishRule:
          '[Negative Expression] + [do/does/did / has/have/had / can/will / is/are] + [SUBJECT] + [Main Verb]',
        examples: [
          {
            en: 'Rarely does a volcanic eruption alter global temperatures for more than three years.',
            id: 'Jarang sekali letusan gunung berapi mengubah suhu global selama lebih dari tiga tahun.',
            highlight:
              'Rarely + does [Aux] + a volcanic eruption [Subject] + alter [Verb]'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Conditional Inversion (Pengandaian Tanpa "If")',
        bodyId:
          'Kata "If" dalam kalimat pengandaian (Conditional Type 1, 2, 3) dapat dihilangkan dengan cara memindahkan HAD, WERE, atau SHOULD ke posisi paling depan kalimat!',
        voiceText:
          'Kita bisa membuang kata If pada kalimat pengandaian dengan memajukan Had, Were, atau Should ke posisi paling depan kalimat.',
        englishRule:
          'Had + S + V3, S + would have V3  ||  Were + S + ..., S + would V1  ||  Should + S + V1, S + will V1',
        examples: [
          {
            en: 'Had the engineers detected the pressure drop earlier, the pipeline leak would have been prevented.',
            id: 'Seandainya para insinyur mendeteksi penurunan tekanan lebih awal, kebocoran pipa pasti dapat dicegah.',
            highlight:
              'Had + the engineers + detected (= If the engineers had detected)'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'a2-q1',
        type: 'Structure',
        prompt:
          'Not only _______ light waves, but black holes also warp the surrounding fabric of space-time.',
        translationId:
          'Tidak hanya _______ gelombang cahaya, tetapi lubang hitam juga melengkungkan struktur ruang-waktu di sekitarnya.',
        hintId:
          '"Not only" diletakkan di awal kalimat! Ingat rumus Negative Inversion: Auxiliary dulu baru Subject.',
        options: [
          { key: 'A', text: 'black holes trap' },
          { key: 'B', text: 'do black holes trap' },
          { key: 'C', text: 'black holes do trap' },
          { key: 'D', text: 'trapping black holes' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'black holes (Plural)',
          verb: 'do ... trap (Inverted Auxiliary + Base Verb)',
          trap: 'Karena "Not only" di awal kalimat, wajib terjadi inversi!'
        },
        optionAnalysis: {
          A: 'Salah: Susunan normal (S + V) tanpa inversi setelah "Not only" di awal kalimat.',
          B: 'BENAR: Susunan inversi yang tepat: Auxiliary "do" + Subject jamak "black holes" + V1 "trap".',
          C: 'Salah: "do" masih berada setelah subjek.',
          D: 'Salah: Bukan bentuk klausa.'
        },
        formula:
          'Not only + [do/does/did] + [Subject] + [V1], + but + [Subject] + also + [Verb].',
        voiceWalkthrough:
          'Jawabannya B, do black holes trap. Karena frasa negatif Not only ditaruh di posisi paling depan kalimat, kita wajib membalik posisi kata kerja bantu dan subjeknya menjadi do black holes trap.'
      },
      {
        id: 'a2-q2',
        type: 'Structure',
        prompt:
          '_______ the ozone layer depleted further, harmful ultraviolet radiation would increase dramatically.',
        translationId:
          'Seandainya lapisan ozon menipis lebih jauh, radiasi ultraviolet berbahaya akan meningkat secara dramatis.',
        hintId:
          'Lihat klausa kedua: "would increase" (Conditional Type 2). Kata apa yang menggantikan "If" di depan?',
        options: [
          { key: 'A', text: 'If' },
          { key: 'B', text: 'Were' },
          { key: 'C', text: 'Had' },
          { key: 'D', text: 'Should' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'the ozone layer',
          verb: 'Were ... depleted (= If the ozone layer were depleted)',
          trap: 'Jika memilih A ("If"), kalimat menjadi "If the ozone layer depleted" (kurang "were" untuk pasif)'
        },
        optionAnalysis: {
          A: 'Salah: Jika memakai "If", kalimat pasifnya menjadi tidak lengkap tanpa "were" ("If the ozone layer were depleted").',
          B: 'BENAR: Conditional Inversion Type 2: "Were + Subject + V3" bermakna "If the ozone layer were depleted".',
          C: 'Salah: "Had" dipakai untuk Conditional Type 3 (pasangannya "would have V3").',
          D: 'Salah: "Should" dipakai untuk Type 1 (pasangannya "will V1", bukan "would").'
        },
        formula:
          'Were + [Subject] + [V3 / Adjective / to V1], + [Subject] + would + V1.',
        voiceWalkthrough:
          'Jawabannya B, Were. Klausa kedua menggunakan would increase yang menandakan Conditional Type 2. Karena tidak ada kata If, kita memakai inversi dengan memajukan Were ke paling depan.'
      },
      {
        id: 'a2-q3',
        type: 'Structure',
        prompt:
          'Only after extensive clinical trials _______ approved for widespread public distribution.',
        translationId:
          'Hanya setelah uji klinis yang ekstensif _______ disetujui untuk distribusi publik secara luas.',
        hintId:
          '"Only after..." di awal kalimat memicu inversi pada klausa utama di belakangnya!',
        options: [
          { key: 'A', text: 'the new vaccine was' },
          { key: 'B', text: 'was the new vaccine' },
          { key: 'C', text: 'the new vaccine' },
          { key: 'D', text: 'did the new vaccine' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'the new vaccine',
          verb: 'was ... approved (Inverted Passive Verb)',
          trap: 'Jangan pilih D ("did") karena setelah titik-titik adalah V3 pasif ("approved"), bukan V1!'
        },
        optionAnalysis: {
          A: 'Salah: Susunan normal tanpa inversi setelah "Only after".',
          B: 'BENAR: Inversi kalimat pasif: Auxiliary "was" + Subject "the new vaccine" + V3 "approved".',
          C: 'Salah: Tidak ada auxiliary verb untuk kalimat pasif.',
          D: 'Salah: "did" tidak bisa dipasangkan dengan V3 pasif "approved".'
        },
        formula:
          'Only after + [Noun Phrase] + [was/were] + [Subject] + [V3 Passive].',
        voiceWalkthrough:
          'Jawabannya B, was the new vaccine. Frasa pembatas Only after di awal kalimat mewajibkan inversi. Karena maknanya pasif disetujui, kita memakai to be was di depan subjek.'
      },
      {
        id: 'a2-q4',
        type: 'Written Expression',
        prompt: 'Select the underlined word or phrase (A, B, C, or D) that must be changed:',
        sentenceParts: [
          { text: 'Seldom ', u: null },
          { text: 'astronomers have', u: 'A' },
          { text: ' observed a supernova ', u: null },
          { text: 'explosion', u: 'B' },
          { text: ' so ', u: null },
          { text: 'close', u: 'C' },
          { text: ' to our ', u: null },
          { text: 'galaxy', u: 'D' },
          { text: '.', u: null }
        ],
        translationId:
          'Jarang sekali para astronom mengamati ledakan supernova yang begitu dekat dengan galaksi kita.',
        hintId:
          'Lihat kata pertama kalimat ini: "Seldom" (Jarang sekali). Sudah dibalikkah posisi subjek dan have?',
        options: [
          { key: 'A', text: 'astronomers have' },
          { key: 'B', text: 'explosion' },
          { key: 'C', text: 'close' },
          { key: 'D', text: 'galaxy' }
        ],
        correctKey: 'A',
        breakdown: {
          subject: 'astronomers (Plural)',
          verb: 'have astronomers observed (Wajib dibalik!)',
          trap: 'Seldom adalah kata negatif/frekuensi rendah yang memicu inversi'
        },
        optionAnalysis: {
          A: 'SALAH (Harus diubah): Setelah "Seldom" di awal kalimat, susunan wajib dibalik menjadi "have astronomers".',
          B: 'Benar: "explosion" adalah noun yang tepat.',
          C: 'Benar: "close" adalah adverb/adjective yang tepat.',
          D: 'Benar: "galaxy" adalah noun tunggal setelah "our".'
        },
        formula: 'Seldom / Rarely / Never + HAVE + [Plural Subject] + [V3].',
        voiceWalkthrough:
          'Bagian yang salah adalah A, astronomers have. Karena kalimat dibuka dengan kata negatif Seldom, posisinya wajib dibalik menjadi have astronomers.'
      }
    ]
  },

  {
    id: 'adv-3',
    level: 'Advance',
    levelNum: 3,
    code: '3.3',
    title: 'Reading Inference & Author’s Tone (550+ Strategy)',
    shortTitle: 'Reading: Inference & Author’s Tone',
    category: 'Reading Comprehension (550+)',
    estimatedMinutes: 18,
    lecturerIntro:
      'Di topik terakhir level Advance ini, kita menaklukkan dua tipe soal Reading tersulit di TOEFL ITP: Inference Questions (kesimpulan tersirat) dan Author’s Tone/Purpose. Ingat: jawaban Inference harus 100% didukung logika teks tanpa asumsi liar!',
    paragraphs: [
      {
        id: 'p1',
        heading: '1. Menjawab Soal Inference (It can be inferred / implied that...)',
        bodyId:
          'Soal Inference menanyakan hal yang TIDAK tertulis secara harfiah, tetapi pasti benar berdasarkan fakta di teks. Gunakan logika deduksi ketat: jika teks menyebut "X mulai ada sejak tahun 1990", maka dapat disimpulkan "Sebelum 1990, X belum ada". Hindari opsi dengan kata ekstrem seperti always, never, impossible, atau only.',
        voiceText:
          'Pada soal Inference, carilah kesimpulan logis yang pasti benar berdasarkan bukti di bacaan. Hindari pilihan jawaban yang memakai kata-kata ekstrem seperti always, never, atau all.',
        englishRule:
          'Inference = Fakta Tertulis di Teks + Deduksi Logis 1 Langkah (Tanpa Lompatan Asumsi)',
        examples: [
          {
            en: 'Teks: "Unlike earlier copper tools, bronze implements held a sharper edge." → Inference: "Copper tools became dull more quickly than bronze ones."',
            id: 'Jika perunggu lebih tajam dari tembaga, maka tembaga lebih cepat tumpul.',
            highlight: 'Komparasi Terbalik = Kunci Utama Soal Inference TOEFL'
          }
        ]
      },
      {
        id: 'p2',
        heading: '2. Mengenali Author’s Tone & Attitude',
        bodyId:
          'Penulis artikel ilmiah TOEFL hampir selalu bersikap objektif, analitis, atau positif-kagum terhadap penemuan ilmiah. Mereka jarang bersikap marah (angry), sarkastik (sarcastic), atau acuh tak acuh (indifferent).',
        voiceText:
          'Untuk soal Author’s Tone, ingatlah bahwa teks TOEFL diambil dari jurnal akademik. Nada penulis biasanya objektif, informatif, atau mengapresiasi secara ilmiah, bukan emosional.',
        englishRule:
          'Tone Akademik Umum: objective, analytical, appreciative, cautiously optimistic, skeptical (jika ada bukti kegagalan)',
        examples: [
          {
            en: 'Perhatikan kata sifat bernuansa nilai seperti "pivotal", "groundbreaking", "flawed", atau "inconclusive".',
            id: 'Kata sifat tersebut mencerminkan sikap penulis terhadap topik.',
            highlight: 'Positive Adjectives → Appreciative | Neutral Facts → Objective'
          }
        ]
      }
    ],
    passage: {
      title: 'The Discovery of Cosmic Microwave Background Radiation',
      text: `In 1964, radio astronomers Arno Penzias and Robert Wilson were calibrating a highly sensitive horn antenna in Holmdel, New Jersey, intending to use it for satellite communication experiments. Regardless of where they pointed the antenna in the sky, they encountered a persistent, faint background hiss that remained constant day and night. Initially suspecting equipment malfunction—or even pigeon droppings inside the antenna—they meticulously cleaned the instrument and tested every electrical circuit, yet the mysterious static endured.\n\nMeanwhile, just sixty kilometers away at Princeton University, physicist Robert Dicke and his team were preparing to search for faint thermal radiation left over from the Big Bang, a theoretical prediction made in the 1940s. When Penzias and Wilson learned of Dicke’s theoretical work, the mystery was immediately resolved: the "annoying static" was actually the Cosmic Microwave Background (CMB) radiation, the thermal echo of the universe's birth nearly 13.8 billion years ago. This serendipitous finding provided decisive empirical evidence supporting the Big Bang model over competing steady-state theories.`,
      translationId: `Pada tahun 1964, astronom radio Arno Penzias dan Robert Wilson sedang mengkalibrasi antena corong yang sangat sensitif di Holmdel, New Jersey, dengan maksud menggunakannya untuk eksperimen komunikasi satelit. Ke mana pun mereka mengarahkan antena di langit, mereka menemukan desisan latar belakang samar yang terus-menerus dan tetap konstan siang maupun malam. Awalnya mencurigai kerusakan peralatan—atau bahkan kotoran merpati di dalam antena—mereka membersihkan instrumen dengan teliti dan menguji setiap sirkuit listrik, namun gangguan statis misterius itu tetap bertahan.\n\nSementara itu, hanya enam puluh kilometer jauhnya di Universitas Princeton, fisikawan Robert Dicke dan timnya sedang bersiap mencari radiasi termal samar yang tersisa dari Big Bang, sebuah prediksi teoretis yang dibuat pada tahun 1940-an. Ketika Penzias dan Wilson mengetahui karya teoretis Dicke, misteri itu langsung terpecahkan: "gangguan statis yang menjengkelkan" itu sebenarnya adalah radiasi Latar Belakang Gelombang Mikro Kosmik (CMB), gema termal dari kelahiran alam semesta hampir 13,8 miliar tahun lalu. Penemuan tak terduga ini memberikan bukti empiris yang menentukan yang mendukung model Big Bang dibandingkan teori keadaan tetap yang bersaing.`
    },
    questions: [
      {
        id: 'a3-q1',
        type: 'Reading Comprehension',
        prompt:
          'What can be inferred about Penzias and Wilson’s discovery of the Cosmic Microwave Background?',
        translationId:
          'Apa yang dapat disimpulkan tentang penemuan Latar Belakang Gelombang Mikro Kosmik oleh Penzias dan Wilson?',
        hintId:
          'Perhatikan tujuan awal mereka ("intending to use it for satellite communication") dan kata "serendipitous" di akhir paragraf 2!',
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
          subject:
            'Inference Clue: "intending to use it for satellite communication" + "serendipitous finding"',
          verb: 'serendipitous = ditemukan secara tidak sengaja / kebetulan yang menguntungkan',
          trap: 'Opsi A, C, dan D bertentangan langsung dengan kronologi di dalam teks'
        },
        optionAnalysis: {
          A: 'Salah: Mereka mengkalibrasi antena untuk komunikasi satelit, bukan untuk membuktikan Big Bang.',
          B: 'BENAR: Mereka awalnya mengerjakan proyek komunikasi satelit dan mengira sinyal itu gangguan teknis, sehingga penemuannya bersifat tidak sengaja ("unintentionally" / "serendipitous").',
          C: 'Salah: Mereka baru mengetahui teori Dicke setelah berjuang membersihkan antena.',
          D: 'Salah: Awalnya mereka mengira itu kerusakan alat atau kotoran merpati.'
        },
        formula:
          'Inference Deduction: Tujuan awal = komunikasi satelit + Kata kunci "serendipitous" → Penemuan tidak disengaja.',
        voiceWalkthrough:
          'Jawabannya B. Dari teks terlihat bahwa tujuan awal Penzias dan Wilson adalah eksperimen komunikasi satelit, bahkan mereka sempat mengira sinyal itu hanyalah kerusakan alat. Ditambah kata serendipitous di paragraf kedua, kita dapat menyimpulkan penemuan itu terjadi secara tidak sengaja.'
      },
      {
        id: 'a3-q2',
        type: 'Reading Comprehension',
        prompt:
          'Why did Penzias and Wilson clean the horn antenna and inspect its electrical circuits?',
        translationId:
          'Mengapa Penzias dan Wilson membersihkan antena corong dan memeriksa sirkuit listriknya?',
        hintId: 'Lihat kalimat ke-3 paragraf 1 setelah kata "Initially suspecting...".',
        options: [
          { key: 'A', text: 'To prepare the instrument for Robert Dicke’s team from Princeton' },
          {
            key: 'B',
            text: 'To eliminate what they assumed was technical interference causing the noise'
          },
          { key: 'C', text: 'To amplify the faint thermal echo of the Big Bang' },
          { key: 'D', text: 'To repair damage caused by severe weather in New Jersey' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Rhetorical Purpose / Cause-Effect Question (Paragraf 1)',
          verb: '"Initially suspecting equipment malfunction—or even pigeon droppings..."',
          trap: 'Mereka belum tahu tentang Big Bang saat membersihkan antena'
        },
        optionAnalysis: {
          A: 'Salah: Mereka belum mengenal tim Dicke pada tahap ini.',
          B: 'BENAR: Mereka mengira desisan itu berasal dari kerusakan teknis atau kotoran merpati, sehingga mereka membersihkannya untuk menghilangkan gangguan tersebut.',
          C: 'Salah: Mereka belum tahu sinyal itu berasal dari Big Bang.',
          D: 'Salah: Tidak ada penyebutan cuaca buruk.'
        },
        formula:
          'Suspecting equipment malfunction → Cleaned & tested circuits = Untuk menghilangkan gangguan teknis.',
        voiceWalkthrough:
          'Jawabannya B. Pada awalnya mereka mengira suara desisan itu disebabkan oleh kerusakan alat atau kotoran merpati, sehingga mereka membersihkan dan memeriksa sirkuit untuk menghilangkan gangguan teknis tersebut.'
      },
      {
        id: 'a3-q3',
        type: 'Reading Comprehension',
        prompt:
          'What can be inferred about the "steady-state theories" mentioned in the last sentence?',
        translationId:
          'Apa yang dapat disimpulkan tentang "teori keadaan tetap" yang disebutkan pada kalimat terakhir?',
        hintId:
          'Penemuan CMB memberikan "decisive empirical evidence supporting the Big Bang model over competing steady-state theories".',
        options: [
          {
            key: 'A',
            text: 'They were strengthened by Penzias and Wilson’s radio measurements.'
          },
          { key: 'B', text: 'They were proposed by Arno Penzias in the 1940s.' },
          {
            key: 'C',
            text: 'They lost scientific support because they could not easily explain the CMB radiation.'
          },
          {
            key: 'D',
            text: 'They predicted the exact temperature of the cosmic background hiss.'
          }
        ],
        correctKey: 'C',
        breakdown: {
          subject:
            'Inference from Contrast: "supporting the Big Bang model over competing steady-state theories"',
          verb: 'supporting X over Y → Y kehilangan dukungan dibanding X',
          trap: 'Kata "over" di sini berarti "mengungguli / dibandingkan"'
        },
        optionAnalysis: {
          A: 'Salah: Justru model Big Bang yang diperkuat, bukan steady-state.',
          B: 'Salah: Tidak disebutkan siapa pengusulnya.',
          C: 'BENAR: Karena bukti CMB secara menentukan mendukung Big Bang mengungguli teori steady-state yang bersaing, dapat disimpulkan teori steady-state melemah/kehilangan dukungan.',
          D: 'Salah: Prediksi tahun 1940-an adalah tentang radiasi Big Bang.'
        },
        formula: 'Evidence supports A over competing B → B loses ground / weakens.',
        voiceWalkthrough:
          'Jawabannya C. Kalimat terakhir menyatakan bahwa bukti empiris ini mendukung model Big Bang mengungguli teori steady-state yang bersaing. Secara logis, teori pesaing tersebut kehilangan dukungan ilmiah.'
      },
      {
        id: 'a3-q4',
        type: 'Reading Comprehension',
        prompt: 'Which of the following best describes the author’s tone in the passage?',
        translationId:
          'Manakah di antara berikut ini yang paling tepat menggambarkan nada penulis dalam bacaan ini?',
        hintId:
          'Perhatikan bagaimana penulis memaparkan kronologi sejarah sains dan menyebutnya "serendipitous" serta "decisive".',
        options: [
          { key: 'A', text: 'Skeptical and dismissive' },
          { key: 'B', text: 'Informative and appreciative' },
          { key: 'C', text: 'Sarcastic and humorous' },
          { key: 'D', text: 'Anxious and pessimistic' }
        ],
        correctKey: 'B',
        breakdown: {
          subject: 'Author’s Tone Analysis',
          verb: 'Pemaparan kronologis yang jelas + kata positif "serendipitous" & "decisive"',
          trap: 'Opsi A, C, dan D terlalu emosional/negatif untuk teks sejarah sains TOEFL'
        },
        optionAnalysis: {
          A: 'Salah: Penulis tidak meragukan validitas penemuan tersebut.',
          B: 'BENAR: Penulis menyajikan kronologi penemuan secara informatif serta menghargai ("appreciative") nilai pentingnya lewat kata "decisive empirical evidence".',
          C: 'Salah: Penyebutan kotoran merpati adalah fakta sejarah, bukan gaya penulisan sarkastik.',
          D: 'Salah: Tidak ada nada cemas atau pesimis.'
        },
        formula:
          'Teks Sejarah Sains TOEFL + Kata "decisive / serendipitous" = Informative & Appreciative.',
        voiceWalkthrough:
          'Jawabannya B, informative and appreciative. Penulis memaparkan fakta kronologis dengan jernih sekaligus mengapresiasi betapa pentingnya penemuan kebetulan ini bagi pembuktian model Big Bang.'
      }
    ]
  }
];

// ============================================================================
// 3. SMART OFFLINE + GEMINI AI LECTURER Q&A ENGINE
// ============================================================================
function generateSmartFallbackReply(userQuestion, currentTopic) {
  const q = String(userQuestion || '').toLowerCase();
  const topicTitle = currentTopic?.title || 'TOEFL Structure & Reading';
  const topicLevel = currentTopic?.level || 'Basic';

  if (q.includes('preposisi') || q.includes('prepositional') || q.includes('of')) {
    return `Pertanyaan bagus! Dalam TOEFL Structure, **Prepositional Phrase** (frasa yang diawali *in, on, at, of, with, from, by*) fungsinya hanya sebagai keterangan tambahan. Kata benda di dalamnya disebut *Object of Preposition* dan **tidak akan pernah bisa menjadi Subject**. Triknya: coret frasa tersebut agar Subject aslinya terlihat jelas!`;
  }
  if (
    q.includes('fanboys') ||
    q.includes('connector') ||
    q.includes('koma') ||
    q.includes('although')
  ) {
    return `Ingat rumus emas jumlah klausa: **Jumlah Connector = Jumlah Klausa dikurangi 1**. Kalau ada 2 klausa (2 pasang Subject + Verb), wajib ada tepat **1 connector** (misalnya koma + *FANBOYS*: *for, and, nor, but, or, yet, so*). Jangan pernah memakai *Although* sekaligus *but* dalam satu kalimat dua klausa ya!`;
  }
  if (
    q.includes('who') ||
    q.includes('whom') ||
    q.includes('which') ||
    q.includes('whose')
  ) {
    return `Cara cepat membedakan **who** dan **whom**: lihat kata tepat di sebelah kanannya! Jika langsung diikuti **Verb** (kata kerja), pakai **who**. Jika diikuti **Subject + Verb**, pakai **whom**. Sedangkan untuk benda/hewan, pakai **which** (wajib *which* jika ada tanda koma, jangan pakai *that* setelah koma!).`;
  }
  if (
    q.includes('inversi') ||
    q.includes('inversion') ||
    q.includes('had') ||
    q.includes('were') ||
    q.includes('seldom') ||
    q.includes('not only')
  ) {
    return `**Inversion** adalah senjata rahasia skor 550+! Jika kalimat diawali ekspresi negatif (*Never, Rarely, Seldom, Not only, Only after*), balik susunannya menjadi **[Auxiliary Verb + Subject + Main Verb]**. Sedangkan pada *Conditional tanpa If*, cukup majukan **Had**, **Were**, atau **Should** ke paling depan kalimat.`;
  }
  if (
    q.includes('gerund') ||
    q.includes('infinitive') ||
    q.includes('pasif') ||
    q.includes('passive')
  ) {
    return `Untuk **Gerund vs Infinitive**, hafalkan kelompok verb-nya: *suggest, avoid, enjoy, consider* wajib diikuti **V-ing**, sedangkan *decide, plan, expect, tend* wajib diikuti **to + V1**. Untuk kalimat **Pasif**, pastikan selalu ada **[BE + V3]**!`;
  }
  if (q.includes('550') || q.includes('skor') || q.includes('tips') || q.includes('strategi')) {
    return `Untuk menembus skor **550 TOEFL ITP**, targetkan minimal **54–56 di Structure** (karena polanya paling pasti dan bisa dilatih!), **54+ di Reading** (kuasai *Main Idea*, *Vocabulary in Context*, dan *Inference*), serta **53+ di Listening**. Latih terus bedah kalimat di setiap topik ya!`;
  }

  return `Pertanyaan yang sangat relevan dengan materi **${topicTitle}** (Level ${topicLevel})! Kuncinya adalah selalu memetakan mana **Subject utama** dan **Main Verb** terlebih dahulu sebelum melihat kata-kata pengecoh di sekitarnya. Coba kerjakan latihan soal pada tab **Latihan Soal & Pembahasan** dan klik *"Minta Dosen Jelaskan Soal Ini"* jika ingin saya bedah langkah demi langkah!`;
}

async function askGeminiLecturer(userPrompt, currentTopic, activeQuestion) {
  const apiKey = getSafeGeminiApiKey();
  if (!apiKey) {
    return generateSmartFallbackReply(userPrompt, currentTopic);
  }

  const systemPrompt = `Kamu adalah "AI Dosen" (Prof. Arya Pratama, M.Ed.), seorang dosen pembimbing TOEFL ITP asal Indonesia yang ramah, sabar, cerdas, dan suportif.
Target mahasiswa kamu adalah mencapai skor TOEFL ITP 550.
Aturan wajib:
1. Jawab dalam Bahasa Indonesia yang jelas, hangat, terstruktur, dan ringkas (maksimal 3-4 paragraf pendek).
2. Pertahankan istilah tata bahasa Inggris (seperti Subject, Verb, Prepositional Phrase, Reduced Clause, Inversion) dan contoh kalimat dalam Bahasa Inggris, lalu beri penjelasan bahasa Indonesia.
3. Konteks topik yang sedang dipelajari saat ini adalah: "${currentTopic?.title || 'TOEFL Prep'}" (Level ${currentTopic?.level || 'Basic'}).
${activeQuestion ? `Mahasiswa juga sedang melihat soal latihan: "${activeQuestion.prompt}" dengan kunci jawaban "${activeQuestion.correctKey}".` : ''}`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    }
  };

  let delay = 800;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === 'string') {
        return text;
      }
      throw new Error('Empty response');
    } catch {
      if (attempt === 1) {
        return generateSmartFallbackReply(userPrompt, currentTopic);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  return generateSmartFallbackReply(userPrompt, currentTopic);
}

// ============================================================================
// 4. ANIMATED 2D/SVG AI DOSEN AVATAR COMPONENT
// ============================================================================
function LecturerAvatar({ state = 'idle', isMuted = false, compact = false }) {
  const statusLabel =
    state === 'speaking'
      ? 'Berbicara...'
      : state === 'encouraging'
      ? 'Hebat! Benar'
      : state === 'thinking'
      ? 'Berpikir...'
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

  const wrapperSize = compact ? 'w-14 h-14' : 'w-24 h-24 sm:w-28 sm:h-28';
  const circleSize = compact ? 'w-12 h-12' : 'w-20 h-20 sm:w-24 sm:h-24';

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
        @keyframes floatSparkle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.95; }
          50% { transform: translateY(-5px) scale(1.15); opacity: 0.6; }
        }
        .avatar-breathe {
          animation: lecturerBreathe 3.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .avatar-nod {
          animation: lecturerNod 0.9s ease-in-out infinite;
          transform-origin: 60px 85px;
        }
        .avatar-eye {
          animation: lecturerBlink 4.2s infinite;
          transform-origin: center;
        }
        .avatar-mouth-speaking {
          animation: lecturerTalk 0.34s ease-in-out infinite;
          transform-origin: 60px 67px;
        }
        .soundwave-ring {
          animation: pulseRing 1.5s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
          transform-origin: center;
        }
        .soundwave-ring-delay {
          animation: pulseRing 1.5s cubic-bezier(0.2, 0.8, 0.4, 1) 0.5s infinite;
          transform-origin: center;
        }
        .sparkle-anim {
          animation: floatSparkle 1.4s ease-in-out infinite;
        }
      `}</style>

      <div className={`relative ${wrapperSize} flex items-center justify-center`}>
        {state === 'speaking' && !isMuted && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-blue-400/60 soundwave-ring" />
            <span className="absolute inset-0 rounded-full border-2 border-indigo-400/50 soundwave-ring-delay" />
          </>
        )}
        {state === 'encouraging' && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400/70 soundwave-ring" />
        )}
        {state === 'thinking' && (
          <span className="absolute inset-0 rounded-full border-2 border-amber-400/70 animate-pulse" />
        )}

        <div
          className={`relative ${circleSize} rounded-full overflow-hidden shadow-md border-[3px] transition-colors duration-300 ${frameColor}`}
        >
          <svg
            viewBox="0 0 120 120"
            className={`w-full h-full ${
              state === 'encouraging' ? 'avatar-nod' : 'avatar-breathe'
            }`}
            role="img"
            aria-label="Avatar AI Dosen Prof. Arya Pratama"
          >
            {/* Background Whiteboard Accent */}
            <rect
              x="14"
              y="22"
              width="92"
              height="44"
              rx="6"
              fill="#E2E8F0"
              opacity="0.45"
            />
            <line
              x1="22"
              y1="34"
              x2="54"
              y2="34"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
            <line
              x1="22"
              y1="41"
              x2="46"
              y2="41"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Suit & Tie */}
            <path
              d="M22 118 C24 94, 40 88, 60 88 C80 88, 96 94, 98 118 Z"
              fill="#1E3A8A"
            />
            <path d="M47 88 L60 112 L73 88 Z" fill="#FFFFFF" />
            <polygon points="58,92 62,92 63,108 60,113 57,108" fill="#F59E0B" />
            <circle cx="81" cy="100" r="2.5" fill="#FBBF24" />

            {/* Neck & Ears */}
            <rect x="53" y="75" width="14" height="16" rx="6" fill="#E6B08A" />
            <path
              d="M53 77 Q60 83 67 77 L67 82 Q60 87 53 82 Z"
              fill="#D19872"
              opacity="0.5"
            />
            <circle cx="38" cy="56" r="5" fill="#E6B08A" />
            <circle cx="82" cy="56" r="5" fill="#E6B08A" />

            {/* Head */}
            <path
              d="M39 48 C39 31, 81 31, 81 48 C81 67, 73 79, 60 79 C47 79, 39 67, 39 48 Z"
              fill="#F3C19D"
            />

            {/* Cheeks */}
            <ellipse
              cx="46"
              cy="61"
              rx="4.5"
              ry="2.5"
              fill="#F87171"
              opacity={state === 'encouraging' ? 0.38 : 0.2}
            />
            <ellipse
              cx="74"
              cy="61"
              rx="4.5"
              ry="2.5"
              fill="#F87171"
              opacity={state === 'encouraging' ? 0.38 : 0.2}
            />

            {/* Hair */}
            <path
              d="M37 46 C36 25, 84 25, 83 46 C81 36, 73 33, 60 33 C47 33, 39 36, 37 46 Z"
              fill="#1E293B"
            />

            {/* Eyebrows */}
            <path
              d={
                state === 'thinking'
                  ? 'M45 46 Q50 43 55 46'
                  : 'M45 47 Q50 45 55 47'
              }
              stroke="#1E293B"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={
                state === 'thinking'
                  ? 'M65 45 Q70 42 75 45'
                  : 'M65 47 Q70 45 75 47'
              }
              stroke="#1E293B"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Eyes */}
            <g className="avatar-eye">
              <circle cx="50" cy="52" r="2.6" fill="#0F172A" />
              <circle cx="70" cy="52" r="2.6" fill="#0F172A" />
              <circle cx="50.8" cy="51.2" r="0.8" fill="#FFFFFF" />
              <circle cx="70.8" cy="51.2" r="0.8" fill="#FFFFFF" />
            </g>

            {/* Glasses */}
            <rect
              x="43"
              y="48"
              width="14"
              height="9"
              rx="2.5"
              fill="none"
              stroke="#334155"
              strokeWidth="1.6"
            />
            <rect
              x="63"
              y="48"
              width="14"
              height="9"
              rx="2.5"
              fill="none"
              stroke="#334155"
              strokeWidth="1.6"
            />
            <line
              x1="57"
              y1="52"
              x2="63"
              y2="52"
              stroke="#334155"
              strokeWidth="1.6"
            />

            {/* Nose */}
            <path
              d="M60 54 L58.5 60 L61.5 60"
              stroke="#D19872"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Mouth States */}
            {state === 'speaking' ? (
              <ellipse
                cx="60"
                cy="67"
                rx="5"
                ry="3.8"
                fill="#991B1B"
                className="avatar-mouth-speaking"
              />
            ) : state === 'encouraging' ? (
              <path
                d="M53 65 Q60 72 67 65 Z"
                fill="#991B1B"
                stroke="#7F1D1D"
                strokeWidth="1"
              />
            ) : state === 'thinking' ? (
              <path
                d="M56 67 Q60 65.5 64 67"
                stroke="#7F1D1D"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M54 66 Q60 70 66 66"
                stroke="#7F1D1D"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {state === 'encouraging' && (
              <g className="sparkle-anim">
                <path
                  d="M24 30 L26 24 L28 30 L34 32 L28 34 L26 40 L24 34 L18 32 Z"
                  fill="#F59E0B"
                />
                <path
                  d="M94 26 L95.5 22 L97 26 L101 27.5 L97 29 L95.5 33 L94 29 L90 27.5 Z"
                  fill="#10B981"
                />
              </g>
            )}
          </svg>
        </div>

        {!compact && (
          <span
            className={`absolute -bottom-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm border ${badgeColor}`}
          >
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 5. PWA INSTALL GUIDE MODAL (ANDROID, IPAD/IPHONE, DESKTOP)
// ============================================================================
function InstallAppModal({
  isOpen,
  onClose,
  canPromptNativeInstall,
  onTriggerNativeInstall,
  isStandaloneApp
}) {
  const [selectedDeviceTab, setSelectedDeviceTab] = useState('android');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-800 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 id="install-modal-title" className="font-extrabold text-sm sm:text-base">
                Install Aplikasi ke HP / Tablet
              </h3>
              <p className="text-[11px] text-blue-200">
                Akses layar penuh layaknya aplikasi native tanpa Play Store / App Store
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Tutup Panduan Install"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {isStandaloneApp ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-emerald-900">
                  Aplikasi Sudah Terpasang!
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Kamu sedang membuka TOEFL 550 Academy dalam mode aplikasi layar penuh.
                </p>
              </div>
            </div>
          ) : (
            canPromptNativeInstall && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold text-[#1E3A8A]">
                    Install Instan 1-Klik Tersedia
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Browser kamu mendukung pemasangan langsung ke layar utama perangkat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTriggerNativeInstall}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Sekarang</span>
                </button>
              </div>
            )
          )}

          {/* Device Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {[
              { id: 'android', label: 'Android', icon: Smartphone },
              { id: 'ios', label: 'iPhone / iPad', icon: Tablet },
              { id: 'desktop', label: 'Laptop / PC', icon: Monitor }
            ].map((tab) => {
              const IconComp = tab.icon;
              const active = selectedDeviceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDeviceTab(tab.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    active
                      ? 'bg-white text-[#1E3A8A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {selectedDeviceTab === 'android' && (
            <ol className="space-y-2.5 text-xs text-slate-700">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Buka halaman ini menggunakan <strong>Google Chrome</strong> atau{' '}
                  <strong>Samsung Internet</strong> di HP/Tablet Android.
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Ketuk ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser.
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Pilih <strong>&ldquo;Install app&rdquo;</strong> atau{' '}
                  <strong>&ldquo;Add to Home screen&rdquo; (Tambahkan ke Layar Utama)</strong>,
                  lalu konfirmasi <strong>Install</strong>. Ikon <strong>TOEFL 550</strong> akan
                  muncul di menu aplikasi HP/Tablet kamu.
                </div>
              </li>
            </ol>
          )}

          {selectedDeviceTab === 'ios' && (
            <ol className="space-y-2.5 text-xs text-slate-700">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Buka aplikasi ini melalui browser <strong>Safari</strong> di iPhone atau iPad.
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span>Ketuk tombol</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A] font-bold">
                    <Share2 className="w-3 h-3" /> Share (Bagikan)
                  </span>
                  <span>di bilah bawah (iPhone) atau atas (iPad).</span>
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span>Gulir ke bawah dan pilih</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-900 font-bold">
                    <PlusSquare className="w-3 h-3" /> Add to Home Screen
                  </span>
                  <span>lalu ketuk <strong>Add</strong> di pojok kanan atas.</span>
                </div>
              </li>
            </ol>
          )}

          {selectedDeviceTab === 'desktop' && (
            <ol className="space-y-2.5 text-xs text-slate-700">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Buka aplikasi di <strong>Google Chrome</strong> atau{' '}
                  <strong>Microsoft Edge</strong> pada Laptop/PC.
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Klik ikon <strong>Install (komputer dengan panah bawah)</strong> di sisi kanan
                  kolom alamat URL, lalu klik <strong>Install</strong> untuk menjadikannya aplikasi
                  desktop mandiri.
                </div>
              </li>
            </ol>
          )}

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Mengerti, Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. ERROR BOUNDARY FOR RESILIENT RENDERING
// ============================================================================
// 5. ERROR BOUNDARY FOR RESILIENT RENDERING
// ============================================================================
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Terjadi kendala saat memuat antarmuka.'
    };
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900">
              Pemulihan Tampilan Otomatis
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900 transition-colors"
            >
              Muat Ulang Komponen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 7. MAIN APPLICATION COMPONENT (RESPONSIVE MOBILE, TABLET & PC + PWA)
// ============================================================================
function Toefl550AcademyApp() {
  const [selectedLevel, setSelectedLevel] = useState('Basic');
  const [selectedTopicId, setSelectedTopicId] = useState('basic-1');
  const [activeTab, setActiveTab] = useState('materi'); // 'materi' | 'latihan'

  // Mobile/Tablet responsive drawers & panels
  const [curriculumDrawerOpen, setCurriculumDrawerOpen] = useState(false);
  const [mobileDosenSheetOpen, setMobileDosenSheetOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // PWA Installation State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [installSuccessToast, setInstallSuccessToast] = useState(false);

  const [showHelperId, setShowHelperId] = useState(true);

  const [userAnswers, setUserAnswers] = useState({});
  const [completedTopics, setCompletedTopics] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  const [avatarState, setAvatarState] = useState('idle'); // 'idle' | 'speaking' | 'thinking' | 'encouraging'
  const [subtitleText, setSubtitleText] = useState(
    'Halo! Saya AI Dosen pembimbing TOEFL kamu. Pilih materi atau klik "Jelaskan Topik Ini" untuk mulai belajar menuju skor 550!'
  );
  const [activeParagraphId, setActiveParagraphId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [autoSpeakFeedback, setAutoSpeakFeedback] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isReadingLesson, setIsReadingLesson] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'dosen',
      text: 'Ada aturan grammar atau jebakan soal yang bikin bingung? Tanyakan langsung di sini atau tekan tombol mikrofon!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isAiReplying, setIsAiReplying] = useState(false);

  const chatEndRef = useRef(null);
  const speechSessionIdRef = useRef(0);
  const fallbackTimerRef = useRef(null);
  const encouragingTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);

  // Hydrate saved progress after mount (SSR-safe)
  useEffect(() => {
    const saved = loadSavedProgress();
    if (saved) {
      setUserAnswers(saved.userAnswers);
      setCompletedTopics(saved.completedTopics);
      if (CURRICULUM.some((t) => t.id === saved.selectedTopicId)) {
        setSelectedTopicId(saved.selectedTopicId);
        setSelectedLevel(saved.selectedLevel);
      }
    }
    setHasHydratedStorage(true);
  }, []);

  // Persist progress safely
  useEffect(() => {
    if (!hasHydratedStorage) return;
    saveProgressToStorage({
      userAnswers,
      completedTopics,
      selectedLevel,
      selectedTopicId
    });
  }, [userAnswers, completedTopics, selectedLevel, selectedTopicId, hasHydratedStorage]);

  // Setup PWA Manifest, Mobile Meta Tags, and Install Prompt Listener
  useEffect(() => {
    if (!isBrowser) return undefined;

    let manifestBlobUrl = null;
    let createdManifestLink = null;
    const createdMetaTags = [];

    try {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean(window.navigator.standalone);
      setIsStandaloneApp(standalone);

      const iconUri = createAppIconDataUri();
      const manifestObj = {
        name: 'TOEFL 550 Academy — AI Lecturer',
        short_name: 'TOEFL 550',
        description:
          'Aplikasi persiapan TOEFL ITP interaktif dengan AI Dosen berbahasa Indonesia menuju skor 550+.',
        start_url: window.location.pathname || '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#F8FAFC',
        theme_color: '#1E3A8A',
        icons: [
          {
            src: iconUri,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      };

      const blob = new Blob([JSON.stringify(manifestObj)], {
        type: 'application/manifest+json'
      });
      manifestBlobUrl = URL.createObjectURL(blob);

      let existingManifest = document.querySelector('link[rel="manifest"]');
      if (!existingManifest) {
        createdManifestLink = document.createElement('link');
        createdManifestLink.rel = 'manifest';
        createdManifestLink.href = manifestBlobUrl;
        document.head.appendChild(createdManifestLink);
      }

      const ensureMeta = (name, content) => {
        if (!document.querySelector(`meta[name="${name}"]`)) {
          const meta = document.createElement('meta');
          meta.name = name;
          meta.content = content;
          document.head.appendChild(meta);
          createdMetaTags.push(meta);
        }
      };

      ensureMeta('theme-color', '#1E3A8A');
      ensureMeta('apple-mobile-web-app-capable', 'yes');
      ensureMeta('apple-mobile-web-app-status-bar-style', 'default');
      ensureMeta('apple-mobile-web-app-title', 'TOEFL 550');
    } catch {
      // Ignore head/manifest injection restrictions in sandboxed frames
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      if (isMountedRef.current) {
        setDeferredInstallPrompt(e);
      }
    };

    const handleAppInstalled = () => {
      if (isMountedRef.current) {
        setDeferredInstallPrompt(null);
        setIsStandaloneApp(true);
        setInstallModalOpen(false);
        setInstallSuccessToast(true);
        setTimeout(() => {
          if (isMountedRef.current) setInstallSuccessToast(false);
        }, 4000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (createdManifestLink && createdManifestLink.parentNode) {
        createdManifestLink.parentNode.removeChild(createdManifestLink);
      }
      createdMetaTags.forEach((tag) => {
        if (tag.parentNode) tag.parentNode.removeChild(tag);
      });
      if (manifestBlobUrl) {
        try {
          URL.revokeObjectURL(manifestBlobUrl);
        } catch {
          // Ignore revoke error
        }
      }
    };
  }, []);

  const handleInstallAppClick = useCallback(async () => {
    if (deferredInstallPrompt) {
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice?.outcome === 'accepted' && isMountedRef.current) {
          setDeferredInstallPrompt(null);
        }
        return;
      } catch {
        // Fall back to instructions modal if prompt fails
      }
    }
    setInstallModalOpen(true);
  }, [deferredInstallPrompt]);

  const currentTopic = useMemo(
    () => CURRICULUM.find((t) => t.id === selectedTopicId) || CURRICULUM[0],
    [selectedTopicId]
  );

  const levelTopics = useMemo(
    () => CURRICULUM.filter((t) => t.level === selectedLevel),
    [selectedLevel]
  );

  const safeQuestionIdx = useMemo(() => {
    const maxIdx = Math.max(0, (currentTopic?.questions?.length || 1) - 1);
    return Math.min(Math.max(0, currentQuestionIdx), maxIdx);
  }, [currentQuestionIdx, currentTopic]);

  const currentQuestion =
    currentTopic.questions[safeQuestionIdx] || currentTopic.questions[0];

  const readinessStats = useMemo(() => {
    const totalQuestions = CURRICULUM.reduce(
      (acc, t) => acc + (t.questions?.length || 0),
      0
    );
    const answeredEntries = Object.values(userAnswers);
    const correctCount = answeredEntries.filter((a) => a && a.isCorrect).length;
    const completedTopicCount = Object.keys(completedTopics).filter(
      (k) => completedTopics[k]
    ).length;

    const questionBonus =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 110) : 0;
    const topicBonus =
      CURRICULUM.length > 0
        ? Math.round((completedTopicCount / CURRICULUM.length) * 30)
        : 0;
    const estimatedScore = Math.min(565, 420 + questionBonus + topicBonus);
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round(((estimatedScore - 420) / (550 - 420)) * 100))
    );

    return {
      estimatedScore,
      progressPercent,
      correctCount,
      totalQuestions,
      completedTopicCount
    };
  }, [userAnswers, completedTopics]);

  const clearTimers = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (encouragingTimerRef.current) {
      clearTimeout(encouragingTimerRef.current);
      encouragingTimerRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSessionIdRef.current += 1;
    clearTimers();
    if (isMountedRef.current) {
      setIsReadingLesson(false);
      setActiveParagraphId(null);
      setAvatarState('idle');
    }
    const synth = getSpeechSynthesisSafe();
    if (synth) {
      try {
        synth.cancel();
      } catch {
        // Ignore synthesis cancel issues across browsers
      }
    }
  }, [clearTimers]);

  // Load voices cleanly on client mount
  useEffect(() => {
    isMountedRef.current = true;
    const synth = getSpeechSynthesisSafe();
    if (!synth) return undefined;

    const populateVoices = () => {
      try {
        const list = synth.getVoices() || [];
        if (!isMountedRef.current) return;
        setVoices(list);
        if (list.length > 0) {
          setSelectedVoiceURI((prev) => {
            if (prev && list.some((v) => v.voiceURI === prev)) return prev;
            const preferred =
              list.find((v) => String(v.lang).toLowerCase().includes('id-id')) ||
              list.find((v) => String(v.lang).toLowerCase().startsWith('id')) ||
              list.find((v) => String(v.lang).toLowerCase().includes('en-us')) ||
              list[0];
            return preferred ? preferred.voiceURI : '';
          });
        }
      } catch {
        // Ignore voice enumeration error
      }
    };

    populateVoices();
    const prevHandler = synth.onvoiceschanged;
    synth.onvoiceschanged = populateVoices;

    return () => {
      isMountedRef.current = false;
      speechSessionIdRef.current += 1;
      clearTimers();
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch {
        // Ignore recognition cleanup error
      }
      try {
        if (synth.onvoiceschanged === populateVoices) {
          synth.onvoiceschanged = prevHandler || null;
        }
        synth.cancel();
      } catch {
        // Ignore cleanup cancel error
      }
    };
  }, [clearTimers]);

  // Keep chat scrolled to latest message
  useEffect(() => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {
      // Ignore scrollIntoView error in non-standard environments
    }
  }, [chatMessages]);

  const speakText = useCallback(
    (rawText, onEndCallback = null) => {
      const cleanText = sanitizeSpeechText(rawText);
      if (!cleanText) {
        if (onEndCallback) onEndCallback();
        return;
      }

      clearTimers();
      const sessionId = ++speechSessionIdRef.current;
      setSubtitleText(cleanText);

      const synth = getSpeechSynthesisSafe();
      if (isMuted || !synth || typeof SpeechSynthesisUtterance === 'undefined') {
        setAvatarState('speaking');
        const durationMs = Math.min(4500, Math.max(1600, cleanText.length * 38));
        fallbackTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current || speechSessionIdRef.current !== sessionId) return;
          setAvatarState('idle');
          if (onEndCallback) onEndCallback();
        }, durationMs);
        return;
      }

      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const matchedVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang || 'id-ID';
        } else {
          utterance.lang = 'id-ID';
        }
        utterance.rate = speechRate;
        utterance.pitch = 1.02;

        let completed = false;
        const finishOnce = () => {
          if (completed) return;
          completed = true;
          clearTimers();
          if (!isMountedRef.current || speechSessionIdRef.current !== sessionId) return;
          setAvatarState('idle');
          if (onEndCallback) onEndCallback();
        };

        utterance.onstart = () => {
          if (!isMountedRef.current || speechSessionIdRef.current !== sessionId) return;
          setAvatarState('speaking');
        };
        utterance.onend = finishOnce;
        utterance.onerror = finishOnce;

        setAvatarState('speaking');
        synth.speak(utterance);

        // Safety watchdog in case browser speech engine drops onend
        const safetyMs = Math.min(18000, Math.max(3000, cleanText.length * 85));
        fallbackTimerRef.current = setTimeout(finishOnce, safetyMs);
      } catch {
        setAvatarState('idle');
        if (onEndCallback) onEndCallback();
      }
    },
    [clearTimers, isMuted, selectedVoiceURI, speechRate, voices]
  );

  const handleExplainTopicAloud = useCallback(() => {
    if (isReadingLesson) {
      stopSpeaking();
      return;
    }

    const sessionId = ++speechSessionIdRef.current;
    clearTimers();
    setIsReadingLesson(true);
    setActiveTab('materi');

    const segments = [
      { id: null, text: currentTopic.lecturerIntro },
      ...(currentTopic.paragraphs || []).map((p) => ({
        id: p.id,
        text: `${p.heading}. ${p.voiceText}`
      })),
      {
        id: null,
        text: 'Sekian penjelasan ringkas topik ini. Sekarang silakan klik tab Latihan Soal untuk menguji pemahamanmu!'
      }
    ];

    let idx = 0;
    const runNext = () => {
      if (
        !isMountedRef.current ||
        speechSessionIdRef.current !== sessionId ||
        idx >= segments.length
      ) {
        if (isMountedRef.current) {
          setIsReadingLesson(false);
          setActiveParagraphId(null);
          setAvatarState('idle');
        }
        return;
      }

      const currentSeg = segments[idx];
      idx += 1;
      setActiveParagraphId(currentSeg.id);

      speakText(currentSeg.text, () => {
        if (!isMountedRef.current || speechSessionIdRef.current !== sessionId) return;
        fallbackTimerRef.current = setTimeout(runNext, 260);
      });
    };

    runNext();
  }, [clearTimers, currentTopic, isReadingLesson, speakText, stopSpeaking]);

  const handleSelectLevel = useCallback(
    (lvl) => {
      stopSpeaking();
      setSelectedLevel(lvl);
      const firstTopic = CURRICULUM.find((t) => t.level === lvl);
      if (firstTopic) {
        setSelectedTopicId(firstTopic.id);
        setCurrentQuestionIdx(0);
        setSubtitleText(firstTopic.lecturerIntro);
      }
    },
    [stopSpeaking]
  );

  const handleSelectTopic = useCallback(
    (topic) => {
      if (!topic) return;
      stopSpeaking();
      setSelectedLevel(topic.level);
      setSelectedTopicId(topic.id);
      setCurrentQuestionIdx(0);
      setCurriculumDrawerOpen(false);
      setSubtitleText(topic.lecturerIntro);
      if (topic.level === 'Basic') {
        setShowHelperId(true);
      }
    },
    [stopSpeaking]
  );

  const handleSelectAnswer = useCallback(
    (optionKey) => {
      const q = currentQuestion;
      if (!q || userAnswers[q.id]) return;

      const isCorrect = optionKey === q.correctKey;
      const updatedAnswers = {
        ...userAnswers,
        [q.id]: { selectedKey: optionKey, isCorrect }
      };
      setUserAnswers(updatedAnswers);

      const allAnswered = (currentTopic.questions || []).every(
        (item) => Boolean(updatedAnswers[item.id])
      );
      if (allAnswered) {
        setCompletedTopics((prev) => ({ ...prev, [currentTopic.id]: true }));
      }

      clearTimers();

      if (isCorrect) {
        setAvatarState('encouraging');
        setSubtitleText(`Tepat sekali! Jawaban ${optionKey} benar. ${q.formula}`);
        if (autoSpeakFeedback && !isMuted) {
          speakText(`Tepat sekali! Jawaban ${optionKey} benar.`);
        } else {
          encouragingTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setAvatarState('idle');
          }, 2600);
        }
      } else {
        setAvatarState('thinking');
        setSubtitleText(
          `Kurang tepat. Kamu memilih ${optionKey}, sedangkan kunci jawabannya adalah ${q.correctKey}. Yuk lihat Bedah Kalimat di bawah!`
        );
        if (autoSpeakFeedback && !isMuted) {
          speakText(
            `Kurang tepat. Kunci jawabannya adalah ${q.correctKey}. Mari kita lihat bedah kalimatnya.`
          );
        } else {
          encouragingTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setAvatarState('idle');
          }, 2600);
        }
      }
    },
    [autoSpeakFeedback, clearTimers, currentQuestion, currentTopic, isMuted, speakText, userAnswers]
  );

  const handleResetTopicQuiz = useCallback(() => {
    stopSpeaking();
    setUserAnswers((prev) => {
      const next = { ...prev };
      (currentTopic.questions || []).forEach((q) => {
        delete next[q.id];
      });
      return next;
    });
    setCompletedTopics((prev) => {
      const next = { ...prev };
      delete next[currentTopic.id];
      return next;
    });
    setCurrentQuestionIdx(0);
    setSubtitleText('Latihan soal di-reset. Silakan coba kerjakan kembali dengan teliti!');
  }, [currentTopic, stopSpeaking]);

  const handleSendChat = useCallback(
    async (overrideText = null) => {
      const rawQuery = typeof overrideText === 'string' ? overrideText : chatInput;
      const query = String(rawQuery || '').trim();
      if (!query || isAiReplying) return;

      stopSpeaking();
      const userMsg = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'user',
        text: query
      };

      setChatMessages((prev) => [...prev, userMsg]);
      if (typeof overrideText !== 'string') {
        setChatInput('');
      }

      setIsAiReplying(true);
      setAvatarState('thinking');
      setSubtitleText('Sebentar ya, saya analisis pertanyaanmu...');

      const activeQ = activeTab === 'latihan' ? currentQuestion : null;
      const replyText = await askGeminiLecturer(query, currentTopic, activeQ);

      if (!isMountedRef.current) return;

      const dosenMsg = {
        id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'dosen',
        text: replyText
      };

      setChatMessages((prev) => [...prev, dosenMsg]);
      setIsAiReplying(false);
      speakText(replyText);
    },
    [activeTab, chatInput, currentQuestion, currentTopic, isAiReplying, speakText, stopSpeaking]
  );

  const handleToggleMic = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      setSubtitleText(
        'Browser ini belum mendukung input suara mikrofon. Silakan ketik pertanyaanmu di kolom chat.'
      );
      return;
    }

    if (isListeningMic) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop error
      }
      setIsListeningMic(false);
      setAvatarState('idle');
      return;
    }

    try {
      stopSpeaking();
      const recognition = new RecognitionCtor();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        if (!isMountedRef.current) return;
        setIsListeningMic(true);
        setAvatarState('thinking');
        setSubtitleText('Silakan ucapkan pertanyaanmu dalam Bahasa Indonesia...');
      };

      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || '';
        if (!isMountedRef.current) return;
        setIsListeningMic(false);
        if (transcript.trim()) {
          handleSendChat(transcript.trim());
        } else {
          setAvatarState('idle');
        }
      };

      recognition.onerror = () => {
        if (!isMountedRef.current) return;
        setIsListeningMic(false);
        setAvatarState('idle');
        setSubtitleText(
          'Suara kurang terdengar jelas. Silakan coba lagi atau ketik pertanyaanmu.'
        );
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
      setAvatarState('idle');
    }
  }, [handleSendChat, isListeningMic, stopSpeaking]);

  const getLevelBadgeStyle = (lvl) => {
    if (lvl === 'Basic') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (lvl === 'Intermediate') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-purple-100 text-purple-800 border-purple-300';
  };

  const activeQuestionAnswer = currentQuestion ? userAnswers[currentQuestion.id] : null;

  // Reusable AI Dosen Panel Content (used in Desktop Right Column & Mobile/Tablet Drawer)
  const renderDosenPanelContent = (isDrawer = false) => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              AI Dosen Pembimbing
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (!isMuted) stopSpeaking();
                setIsMuted((prev) => !prev);
              }}
              title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isMuted
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowVoiceSettings((prev) => !prev)}
              title="Pengaturan Suara & Kecepatan"
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showVoiceSettings
                  ? 'bg-blue-50 text-[#1E3A8A] border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>
            {isDrawer && (
              <button
                type="button"
                onClick={() => setMobileDosenSheetOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                aria-label="Tutup Panel AI Dosen"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="py-1 flex flex-col items-center">
          <LecturerAvatar state={avatarState} isMuted={isMuted} />
          <div className="mt-2.5 text-center">
            <div className="text-sm font-extrabold text-slate-900">
              Prof. Arya Pratama, M.Ed.
            </div>
            <div className="text-[11px] text-slate-500">
              Spesialis Struktur &amp; Reading TOEFL 550+
            </div>
          </div>
        </div>

        {showVoiceSettings && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div>
              <span className="block font-bold text-slate-700 mb-1">
                Kecepatan Bicara:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.85, 1.0, 1.15].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSpeechRate(rate)}
                    className={`py-1.5 rounded-lg font-bold border ${
                      speechRate === rate
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {voices.length > 0 && (
              <div>
                <label
                  htmlFor={isDrawer ? 'voice-select-drawer' : 'voice-select-desktop'}
                  className="block font-bold text-slate-700 mb-1"
                >
                  Pilih Suara Browser:
                </label>
                <select
                  id={isDrawer ? 'voice-select-drawer' : 'voice-select-desktop'}
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center justify-between pt-1 cursor-pointer">
              <span className="font-semibold text-slate-700">
                Auto-Suara Saat Jawab Soal
              </span>
              <input
                type="checkbox"
                checked={autoSpeakFeedback}
                onChange={(e) => setAutoSpeakFeedback(e.target.checked)}
                className="rounded text-[#1E3A8A]"
              />
            </label>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900 text-slate-100 text-xs leading-relaxed border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Live Subtitle Dosen
            </span>
            {avatarState === 'speaking' && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
              >
                <Square className="w-2.5 h-2.5 fill-current" /> Stop
              </button>
            )}
          </div>
          <p className="text-slate-200 max-h-24 overflow-y-auto">{subtitleText}</p>
        </div>

        <button
          type="button"
          onClick={handleExplainTopicAloud}
          className={`w-full py-3 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs ${
            isReadingLesson
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
          }`}
        >
          {isReadingLesson ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Berhenti Membacakan Materi</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Jelaskan Topik Ini (Suara)</span>
            </>
          )}
        </button>
      </div>

      {/* Tanya Dosen Mini-Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
            <span className="text-xs font-extrabold text-slate-800">
              Tanya Dosen (Q&amp;A Interaktif)
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
            Suara &amp; Teks
          </span>
        </div>

        <div className="px-3 pt-2.5 pb-1 flex gap-1.5 overflow-x-auto">
          {[
            'Apa jebakan preposisi?',
            'Rumus FANBOYS?',
            'Tips tembus 550?'
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendChat(chip)}
              className="shrink-0 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#1E3A8A] text-[11px] font-semibold text-slate-600 border border-slate-200 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="p-3 h-44 sm:h-48 overflow-y-auto space-y-2.5 text-xs">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[88%] px-3 py-2 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isAiReplying && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                AI Dosen sedang menyusun penjelasan...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5"
        >
          <button
            type="button"
            onClick={handleToggleMic}
            title="Tanya dengan Suara (Mikrofon)"
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${
              isListeningMic
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-white text-slate-600 border-slate-300 hover:text-[#1E3A8A]'
            }`}
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
            placeholder="Ketik pertanyaan grammar..."
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
          />

          <button
            type="submit"
            disabled={!chatInput.trim() || isAiReplying}
            className="p-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-40 text-white shrink-0 transition-colors"
            aria-label="Kirim Pertanyaan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  // Reusable Curriculum & Readiness Sidebar Content
  const renderCurriculumContent = (isDrawer = false) => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#1E3A8A]" /> Target 550 Readiness
          </span>
          <span className="text-xs font-extrabold text-[#1E3A8A]">
            {readinessStats.progressPercent}%
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-black text-slate-900">
              {readinessStats.estimatedScore}
            </span>
            <span className="text-xs text-slate-500 ml-1">poin prediksi</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Target: 550+
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
          <div
            className="h-full bg-gradient-to-r from-[#1E3A8A] via-blue-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(8, readinessStats.progressPercent)}%` }}
          />
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Soal Benar:{' '}
            <strong className="text-slate-900">
              {readinessStats.correctCount}/{readinessStats.totalQuestions}
            </strong>
          </span>
          <span>
            Topik Tuntas:{' '}
            <strong className="text-slate-900">
              {readinessStats.completedTopicCount}/{CURRICULUM.length}
            </strong>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Kurikulum Bertahap
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300">9 Modul</span>
            {isDrawer && (
              <button
                type="button"
                onClick={() => setCurriculumDrawerOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                aria-label="Tutup Kurikulum"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1 gap-1">
          {['Basic', 'Intermediate', 'Advance'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleSelectLevel(lvl)}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                selectedLevel === lvl
                  ? 'bg-white text-[#1E3A8A] shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="p-2.5 space-y-1.5">
          {levelTopics.map((topic) => {
            const isSelected = topic.id === selectedTopicId;
            const topicCorrect = (topic.questions || []).filter(
              (q) => userAnswers[q.id]?.isCorrect
            ).length;
            const isDone = Boolean(completedTopics[topic.id]);

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#1E3A8A] shadow-xs'
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {topic.code}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-bold leading-snug ${
                      isSelected ? 'text-[#1E3A8A]' : 'text-slate-800'
                    }`}
                  >
                    {topic.shortTitle}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{(topic.questions || []).length} Soal</span>
                    <span
                      className={`font-semibold ${
                        topicCorrect > 0 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      Skor: {topicCorrect}/{(topic.questions || []).length}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Install Card inside Sidebar for easy mobile/tablet access */}
      {!isStandaloneApp && (
        <div className="bg-gradient-to-br from-blue-900 to-[#1E3A8A] text-white rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-extrabold">
              Pasang di HP / Tablet
            </span>
          </div>
          <p className="text-[11px] text-blue-100 leading-relaxed">
            Tambahkan TOEFL 550 Academy ke layar utama HP atau Tablet agar bisa dibuka cepat
            layaknya aplikasi.
          </p>
          <button
            type="button"
            onClick={handleInstallAppClick}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Install App</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans overflow-x-hidden pb-20 lg:pb-0">
      {/* Install Success Toast */}
      {installSuccessToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-extrabold">
          <Check className="w-4 h-4" />
          <span>Berhasil di-install ke layar utama perangkat!</span>
        </div>
      )}

      {/* =====================================================================
          TOP NAVIGATION HEADER (ADAPTIVE MOBILE / TABLET / DESKTOP)
      ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setCurriculumDrawerOpen((prev) => !prev)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80 shrink-0"
              aria-label="Buka Menu Kurikulum"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-sm shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 truncate">
                    TOEFL 550 Academy
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1E3A8A] border border-blue-200 shrink-0">
                    <Sparkles className="w-3 h-3" /> AI Lecturer
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden md:block">
                  Persiapan TOEFL ITP Terstruktur dari Basic hingga Target 550+
                </p>
              </div>
            </div>
          </div>

          {/* Center Level Switcher (Desktop & Large Tablet) */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: 'Basic', label: 'Level 1: BASIC' },
              { id: 'Intermediate', label: 'Level 2: INTERMEDIATE' },
              { id: 'Advance', label: 'Level 3: ADVANCE' }
            ].map((lvl) => {
              const isActive = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>

          {/* Right Actions: Install App Button + Target 550 Score Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {!isStandaloneApp && (
              <button
                type="button"
                onClick={handleInstallAppClick}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Install aplikasi ini ke HP, Tablet, atau Laptop"
              >
                <Download className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-[11px] sm:text-xs shadow-xs">
                550
              </div>
              <div className="leading-tight">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-800 hidden sm:block">
                  Estimasi Skor
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
                  <span>{readinessStats.estimatedScore}</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
                    /550+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Mobile/Tablet Level Strip (< 1024px) */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/90 px-3 py-1.5 flex items-center justify-between gap-2">
          <div className="grid grid-cols-3 gap-1 flex-1 max-w-md">
            {[
              { id: 'Basic', label: '1. Basic' },
              { id: 'Intermediate', label: '2. Inter' },
              { id: 'Advance', label: '3. Advance' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleSelectLevel(lvl.id)}
                className={`py-1 px-2 rounded-lg text-[11px] font-extrabold transition-all ${
                  selectedLevel === lvl.id
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileDosenSheetOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-blue-100 text-[#1E3A8A] text-[11px] font-extrabold flex items-center gap-1 shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>AI Dosen</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          COMPACT MOBILE & TABLET FLOATING LECTURER BAR (< 1024px)
      ===================================================================== */}
      <div className="lg:hidden max-w-4xl w-full mx-auto px-3 sm:px-6 pt-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileDosenSheetOpen(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
          >
            <LecturerAvatar state={avatarState} isMuted={isMuted} compact />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 truncate">
                  Prof. Arya (AI Dosen)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A]">
                  Tanya
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                {subtitleText}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleExplainTopicAloud}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                isReadingLesson
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#1E3A8A] text-white'
              }`}
            >
              {isReadingLesson ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Suara</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MAIN RESPONSIVE WORKSPACE (1-COL MOBILE, 2-COL TABLET, 3-COL PC)
      ===================================================================== */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT SIDEBAR: DESKTOP XL (1280px+) */}
        <aside className="hidden xl:block xl:col-span-3 sticky top-20">
          {renderCurriculumContent(false)}
        </aside>

        {/* CENTER STAGE: LESSON CONTENT & PRACTICE QUESTION ENGINE */}
        <main className="lg:col-span-8 xl:col-span-6 space-y-4 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelBadgeStyle(
                    currentTopic.level
                  )}`}
                >
                  Level {currentTopic.levelNum}: {currentTopic.level.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {currentTopic.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowHelperId((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  showHelperId
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                }`}
              >
                {showHelperId ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>Terjemahan: {showHelperId ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
              Topik {currentTopic.code}: {currentTopic.title}
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('materi')}
                className={`py-2.5 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  activeTab === 'materi'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>1. Materi Dosen</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setActiveTab('latihan');
                }}
                className={`py-2.5 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  activeTab === 'latihan'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>2. Latihan ({(currentTopic.questions || []).length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MATERI & PENJELASAN DOSEN */}
          {activeTab === 'materi' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-800 text-white rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Kuliah Interaktif AI Dosen
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/95">
                    Dengarkan penjelasan inti topik ini sambil menyimak sorotan materi di bawah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExplainTopicAloud}
                  className={`w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all ${
                    isReadingLesson
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  {isReadingLesson ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Hentikan Suara Dosen</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Jelaskan Topik Ini (Suara)</span>
                    </>
                  )}
                </button>
              </div>

              {(currentTopic.paragraphs || []).map((para) => {
                const isHighlighted = activeParagraphId === para.id;
                return (
                  <div
                    key={para.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                      isHighlighted
                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-md bg-blue-50/20'
                        : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {para.heading}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeaking();
                          setActiveParagraphId(para.id);
                          speakText(para.voiceText, () => {
                            if (isMountedRef.current) setActiveParagraphId(null);
                          });
                        }}
                        title="Bacakan bagian ini"
                        className="p-2 rounded-lg text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3.5">
                      {para.bodyId}
                    </p>

                    <div className="bg-slate-900 text-amber-300 font-mono text-xs sm:text-[13px] px-3.5 py-2.5 rounded-xl mb-3.5 overflow-x-auto">
                      {para.englishRule}
                    </div>

                    <div className="space-y-2.5">
                      {(para.examples || []).map((ex, i) => (
                        <div
                          key={`${para.id}-ex-${i}`}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">
                              &ldquo;{ex.en}&rdquo;
                            </p>
                            <button
                              type="button"
                              onClick={() => speakText(ex.en)}
                              className="text-xs text-[#1E3A8A] hover:underline font-semibold shrink-0 flex items-center gap-1 py-0.5"
                            >
                              <Play className="w-3 h-3" /> Dengarkan
                            </button>
                          </div>
                          {showHelperId && (
                            <p className="text-xs text-slate-600">
                              <span className="font-bold text-slate-700">Arti:</span> {ex.id}
                            </p>
                          )}
                          <div className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100/80 text-[#1E3A8A]">
                            {ex.highlight}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {currentTopic.passage && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                      Academic Reading Passage
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(currentTopic.passage.text)}
                      className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Dengarkan Bacaan
                    </button>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {currentTopic.passage.title}
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                    {currentTopic.passage.text}
                  </div>
                  {showHelperId && (
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/70">
                      <strong className="text-emerald-800 block mb-1">
                        Terjemahan Bahasa Indonesia (Mode Basic Helper):
                      </strong>
                      {currentTopic.passage.translationId}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setActiveTab('latihan');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Lanjut ke Latihan Soal &amp; Pembahasan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LATIHAN SOAL & PEMBAHASAN ENGINE */}
          {activeTab === 'latihan' && currentQuestion && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(currentTopic.questions || []).map((q, idx) => {
                    const ans = userAnswers[q.id];
                    const isCurrent = idx === safeQuestionIdx;
                    let pillStyle =
                      'bg-slate-100 text-slate-700 border-slate-200';
                    if (ans?.isCorrect) {
                      pillStyle = 'bg-emerald-600 text-white border-emerald-700';
                    } else if (ans && !ans.isCorrect) {
                      pillStyle = 'bg-rose-500 text-white border-rose-600';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold border transition-all ${pillStyle} ${
                          isCurrent
                            ? 'ring-2 ring-offset-1 ring-[#1E3A8A] scale-105'
                            : ''
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleResetTopicQuiz}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Latihan
                </button>
              </div>

              {currentTopic.passage && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                      Bacaan: {currentTopic.passage.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(currentTopic.passage.text)}
                      className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Audio Teks
                    </button>
                  </div>
                  <div className="max-h-52 sm:max-h-56 overflow-y-auto text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {currentTopic.passage.text}
                  </div>
                  {showHelperId && (
                    <details className="text-xs text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                      <summary className="font-bold text-emerald-800 cursor-pointer">
                        Lihat Terjemahan Bacaan (Bahasa Indonesia)
                      </summary>
                      <p className="mt-2 whitespace-pre-line leading-relaxed">
                        {currentTopic.passage.translationId}
                      </p>
                    </details>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                    Soal {safeQuestionIdx + 1} dari{' '}
                    {(currentTopic.questions || []).length} • {currentQuestion.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakText(currentQuestion.prompt)}
                    className="text-xs font-semibold text-slate-500 hover:text-[#1E3A8A] flex items-center gap-1 py-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Bacakan Soal
                  </button>
                </div>

                {currentQuestion.type === 'Written Expression' &&
                Array.isArray(currentQuestion.sentenceParts) ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {currentQuestion.prompt}
                    </p>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-lg font-medium text-slate-900 leading-loose">
                      {currentQuestion.sentenceParts.map((part, idx) =>
                        part.u ? (
                          <span
                            key={`${currentQuestion.id}-part-${idx}`}
                            className="inline-flex flex-col items-center mx-0.5 align-bottom"
                          >
                            <span className="underline decoration-2 decoration-[#1E3A8A] underline-offset-4 font-bold text-slate-950 px-0.5">
                              {part.text}
                            </span>
                            <span className="text-[10px] font-black text-[#1E3A8A] leading-none mt-1">
                              ({part.u})
                            </span>
                          </span>
                        ) : (
                          <span key={`${currentQuestion.id}-part-${idx}`}>
                            {part.text}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.prompt}
                  </p>
                )}

                {showHelperId && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-xs">
                    <p className="text-slate-700">
                      <strong className="text-amber-900">Terjemahan:</strong>{' '}
                      {currentQuestion.translationId}
                    </p>
                    <p className="text-amber-900 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Petunjuk Dosen:</strong> {currentQuestion.hintId}
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  {(currentQuestion.options || []).map((opt) => {
                    const isSelected = activeQuestionAnswer?.selectedKey === opt.key;
                    const isCorrectOpt = currentQuestion.correctKey === opt.key;

                    let cardClass =
                      'bg-white border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/40 text-slate-800';
                    let badgeClass =
                      'bg-slate-100 text-slate-700 border-slate-300';

                    if (activeQuestionAnswer) {
                      if (isCorrectOpt) {
                        cardClass =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500';
                        badgeClass =
                          'bg-emerald-600 text-white border-emerald-600';
                      } else if (isSelected && !isCorrectOpt) {
                        cardClass =
                          'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-400';
                        badgeClass = 'bg-rose-600 text-white border-rose-600';
                      } else {
                        cardClass =
                          'bg-slate-50/70 border-slate-200 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={Boolean(activeQuestionAnswer)}
                        onClick={() => handleSelectAnswer(opt.key)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 min-h-[48px] ${cardClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border shrink-0 ${badgeClass}`}
                          >
                            {opt.key}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold">{opt.text}</span>
                        </div>
                        {activeQuestionAnswer && isCorrectOpt && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {activeQuestionAnswer && isSelected && !isCorrectOpt && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={safeQuestionIdx === 0}
                    onClick={() =>
                      setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))
                    }
                    className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Sebelumnya
                  </button>

                  {safeQuestionIdx < (currentTopic.questions || []).length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentQuestionIdx((prev) =>
                          Math.min(
                            (currentTopic.questions || []).length - 1,
                            prev + 1
                          )
                        )
                      }
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1"
                    >
                      Soal Berikutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const currIdx = CURRICULUM.findIndex(
                          (t) => t.id === currentTopic.id
                        );
                        const nextTopic =
                          CURRICULUM[(currIdx + 1) % CURRICULUM.length];
                        handleSelectTopic(nextTopic);
                        setActiveTab('materi');
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                    >
                      Topik Berikutnya <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {activeQuestionAnswer && (
                <div className="bg-white rounded-2xl border-2 border-[#1E3A8A]/20 overflow-hidden shadow-md">
                  <div
                    className={`px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 ${
                      activeQuestionAnswer.isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {activeQuestionAnswer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      )}
                      <span className="font-extrabold text-xs sm:text-sm">
                        {activeQuestionAnswer.isCorrect
                          ? 'Jawabanmu Benar!'
                          : `Kurang Tepat (Pilih ${activeQuestionAnswer.selectedKey})`}{' '}
                        • Kunci: {currentQuestion.correctKey}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.voiceWalkthrough)}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-300 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Minta Dosen Jelaskan Soal Ini</span>
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        1. Bedah Kalimat (Sentence Breakdown)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                          <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white mb-1">
                            Subject
                          </span>
                          <p className="text-xs font-bold text-slate-900">
                            {currentQuestion.breakdown.subject}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white mb-1">
                            Verb / Kunci
                          </span>
                          <p className="text-xs font-bold text-slate-900">
                            {currentQuestion.breakdown.verb}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                          <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white mb-1">
                            Modifier / Trap
                          </span>
                          <p className="text-xs font-bold text-slate-900">
                            {currentQuestion.breakdown.trap}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        2. Analisis Opsi Jawaban &amp; Pengecoh
                      </h4>
                      <div className="space-y-1.5">
                        {['A', 'B', 'C', 'D'].map((key) => {
                          const isKeyCorrect = key === currentQuestion.correctKey;
                          return (
                            <div
                              key={key}
                              className={`p-2.5 rounded-xl text-xs leading-relaxed flex items-start gap-2 border ${
                                isKeyCorrect
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                                  : 'bg-slate-50 border-slate-200/80 text-slate-600'
                              }`}
                            >
                              <span
                                className={`px-1.5 py-0.5 rounded font-black text-[11px] shrink-0 ${
                                  isKeyCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {key}
                              </span>
                              <span>{currentQuestion.optionAnalysis[key]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 flex items-start gap-2.5">
                      <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                          Rumus Kilat TOEFL 550
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                          {currentQuestion.formula}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* RIGHT PANEL: TABLET & DESKTOP (1024px+) */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20">
          {renderDosenPanelContent(false)}
        </aside>
      </div>

      {/* =====================================================================
          SLIDE-OVER CURRICULUM DRAWER (MOBILE & TABLET < 1280px)
      ===================================================================== */}
      {curriculumDrawerOpen && (
        <div
          className="fixed inset-0 z-50 xl:hidden bg-slate-900/50 backdrop-blur-xs flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu Kurikulum TOEFL 550"
        >
          <div className="w-[86%] max-w-sm bg-slate-50 h-full overflow-y-auto p-4 shadow-2xl border-r border-slate-200">
            {renderCurriculumContent(true)}
          </div>
          <button
            type="button"
            className="flex-1 h-full cursor-default"
            onClick={() => setCurriculumDrawerOpen(false)}
            aria-label="Tutup Overlay Kurikulum"
          />
        </div>
      )}

      {/* =====================================================================
          BOTTOM SHEET DRAWER FOR AI DOSEN (MOBILE & SMALL TABLET < 1024px)
      ===================================================================== */}
      {mobileDosenSheetOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/55 backdrop-blur-xs flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Panel AI Dosen Interaktif"
        >
          <button
            type="button"
            className="flex-1 w-full cursor-default"
            onClick={() => setMobileDosenSheetOpen(false)}
            aria-label="Tutup Overlay AI Dosen"
          />
          <div className="bg-slate-50 rounded-t-3xl max-h-[88vh] overflow-y-auto p-4 shadow-2xl border-t border-slate-200">
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
            {renderDosenPanelContent(true)}
          </div>
        </div>
      )}

      {/* =====================================================================
          FIXED BOTTOM THUMB NAVIGATION BAR (MOBILE & SMALL TABLET < 1024px)
      ===================================================================== */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(15,23,42,0.05)]"
        aria-label="Navigasi Utama Mobile"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('materi');
              setMobileDosenSheetOpen(false);
              setCurriculumDrawerOpen(false);
            }}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition-colors ${
              activeTab === 'materi' && !mobileDosenSheetOpen && !curriculumDrawerOpen
                ? 'bg-blue-50 text-[#1E3A8A]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Materi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setActiveTab('latihan');
              setMobileDosenSheetOpen(false);
              setCurriculumDrawerOpen(false);
            }}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition-colors ${
              activeTab === 'latihan' && !mobileDosenSheetOpen && !curriculumDrawerOpen
                ? 'bg-blue-50 text-[#1E3A8A]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Latihan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurriculumDrawerOpen(false);
              setMobileDosenSheetOpen((prev) => !prev);
            }}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition-colors ${
              mobileDosenSheetOpen
                ? 'bg-blue-50 text-[#1E3A8A]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Dosen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileDosenSheetOpen(false);
              setCurriculumDrawerOpen((prev) => !prev);
            }}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition-colors ${
              curriculumDrawerOpen
                ? 'bg-blue-50 text-[#1E3A8A]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kurikulum</span>
          </button>
        </div>
      </nav>

      {/* =====================================================================
          PWA INSTALL GUIDE MODAL
      ===================================================================== */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        canPromptNativeInstall={Boolean(deferredInstallPrompt)}
        onTriggerNativeInstall={handleInstallAppClick}
        isStandaloneApp={isStandaloneApp}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Toefl550AcademyApp />
    </AppErrorBoundary>
  );
}