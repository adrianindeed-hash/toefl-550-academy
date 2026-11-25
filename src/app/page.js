"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Globe,
  ListChecks,
  AlertTriangle,
  Search,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";

import {
  CURRICULUM,
  DIAGNOSTIC_QUESTIONS,
  SPEED_TRAP_CHALLENGES,
  VOCAB_DUEL_ITEMS,
  MINI_TEST_QUESTIONS,
  LISTENING_LAB_ITEMS,
  GRAMMAR_FLASHCARDS,
  AWL_VOCAB,
  READING_PASSAGES_BANK,
  buildFullQuestionBank,
  getTopicPracticeQuestions,
  buildRealToeflItpExam,
  convertToeflItpScore
} from "./toeflData";

// ============================================================================
// 1. SAFE RUNTIME, STORAGE & NATURAL BILINGUAL VOICE HELPERS
// ============================================================================
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
const STORAGE_KEY = "toefl_550_complete_syllabus_v6";

function getSafeGeminiApiKey() {
  try {
    if (typeof process !== "undefined" && process.env) {
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
  return "";
}

function getSpeechSynthesisSafe() {
  if (!isBrowser || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function getSpeechRecognitionConstructor() {
  if (!isBrowser) return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function sanitizeSpeechText(rawText) {
  if (!rawText) return "";
  return String(rawText)
    .replace(/\*\*/g, "")
    .replace(/[`#]/g, "")
    .replace(/->/g, " menjadi ")
    .replace(/!=/g, " tidak sama dengan ")
    .replace(/\|\|/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguageSmart(text) {
  const clean = String(text || "").toLowerCase();
  if (!clean.trim()) return "id-ID";

  const idWords = [
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "adalah", "ini", "itu",
    "tidak", "bukan", "jika", "maka", "karena", "sehingga", "pada", "dalam",
    "kata", "kalimat", "subjek", "kerja", "jawaban", "benar", "salah", "selalu",
    "wajib", "jangan", "harus", "seperti", "atau", "oleh", "saat", "ketika",
    "soal", "opsi", "rumus", "jebakan", "strategi", "menurut", "materi", "contoh",
    "tunggal", "jamak", "benda", "pasif", "aktif", "hitung"
  ];

  const enWords = [
    "the", "of", "and", "to", "in", "is", "are", "was", "were", "that", "for",
    "with", "as", "by", "on", "at", "from", "which", "who", "whose", "although",
    "because", "while", "when", "where", "have", "has", "had", "been", "being",
    "would", "could", "should", "their", "they", "there", "than", "most", "more"
  ];

  const tokens = clean.match(/[a-z]+/g) || [];
  if (tokens.length === 0) return "id-ID";

  let idScore = 0;
  let enScore = 0;
  for (const tok of tokens) {
    if (idWords.includes(tok)) idScore += 1.35;
    if (enWords.includes(tok)) enScore += 1.05;
  }
  return enScore > idScore ? "en-US" : "id-ID";
}

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
      if (inner) segments.push({ text: inner, lang: detectLanguageSmart(inner) });
      continue;
    }
    const lang = detectLanguageSmart(trimmed);
    const prev = segments[segments.length - 1];
    if (prev && prev.lang === lang && prev.text.length < 130) {
      prev.text = `${prev.text} ${trimmed}`;
    } else {
      segments.push({ text: trimmed, lang });
    }
  }
  return segments;
}

function pickMostNaturalVoice(voices, targetLang) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const isEn = String(targetLang).toLowerCase().startsWith("en");
  const langFiltered = voices.filter((v) => {
    const l = String(v.lang || "").toLowerCase();
    return isEn ? l.startsWith("en") : l.startsWith("id");
  });
  const pool = langFiltered.length > 0 ? langFiltered : voices;

  const scoreVoice = (v) => {
    const name = String(v.name || "").toLowerCase();
    const lang = String(v.lang || "").toLowerCase();
    let s = 0;
    if (name.includes("natural")) s += 45;
    if (name.includes("neural")) s += 40;
    if (name.includes("google")) s += 28;
    if (name.includes("gadis") || name.includes("ardi")) s += 30;
    if (name.includes("aria") || name.includes("jenny") || name.includes("guy")) s += 30;
    if (isEn && lang === "en-us") s += 16;
    if (!isEn && lang === "id-id") s += 16;
    return s;
  };
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

// ============================================================================
// 2. SMART OFFLINE + GEMINI AI LECTURER ENGINE
// ============================================================================
function generateSmartFallbackReply(userQuestion, currentTopic) {
  const q = String(userQuestion || "").toLowerCase();
  const topicTitle = currentTopic?.title || "TOEFL Structure & Reading";

  if (q.includes("gerund") || q.includes("ing") || q.includes("infinitive")) {
    return "Aturan emas Gerund vs. Infinitive di TOEFL: Setiap kata kerja setelah preposisi wajib berbentuk V-ing (Gerund), termasuk frasa seperti look forward to, be accustomed to, dan contribute to. Kata kerja seperti enjoy, avoid, consider, recommend, dan suggest juga wajib diikuti V-ing!";
  }
  if (q.includes("passive") || q.includes("pasif") || q.includes("v3")) {
    return "Rumus kalimat pasif adalah [be: is/am/are/was/were/been/be] + [V3]. Gunakan bentuk pasif jika subjek kalimat adalah benda mati yang menerima aksi atau terdapat kata by + pelaku setelah kata kerja.";
  }
  if (q.includes("countable") || q.includes("uncountable") || q.includes("information")) {
    return "Kata benda Uncountable seperti information, equipment, advice, furniture, evidence, dan research tidak pernah boleh ditambah akhiran -s dan selalu memakai quantifier much / little / less serta Verb tunggal!";
  }
  if (q.includes("article") || q.includes("a ") || q.includes("an ")) {
    return "Pilih a atau an berdasarkan bunyi pengucapannya: a university dan a European memakai a karena berbunyi konsonan Y, sedangkan an hour dan an honest man memakai an karena huruf H tidak dibaca.";
  }
  if (q.includes("inversi") || q.includes("inversion") || q.includes("not only") || q.includes("550")) {
    return "Inversion adalah kunci menembus skor 550+! Jika kalimat diawali kata negatif (Not only, Rarely, Seldom, Never) atau pengandaian tanpa If (Had, Were, Should), susunan Auxiliary dan Subject wajib dibalik!";
  }
  return `Pertanyaan bagus terkait topik ${topicTitle}! Pastikan kamu selalu memetakan True Subject dan Main Verb terlebih dahulu, lalu cek kotak Jebakan Umum dan coba latihan Coret & Sorot di materi.`;
}

async function askGeminiLecturer(userPrompt, currentTopic, activeQuestion) {
  const apiKey = getSafeGeminiApiKey();
  if (!apiKey) return generateSmartFallbackReply(userPrompt, currentTopic);

  const systemPrompt = `Kamu adalah "AI Dosen" (Prof. Arya Pratama, M.Ed.), dosen pembimbing TOEFL ITP spesialis strategi menuju skor 550+.
Aturan:
1. Jawab sesuai bahasa mahasiswa (ID atau EN).
2. Ringkas, ramah, terstruktur (maksimal 3 paragraf pendek) tanpa simbol markdown agar nyaman dibacakan suara.
3. Topik saat ini: "${currentTopic?.title || "TOEFL Prep"}".
${activeQuestion ? `Soal aktif: "${activeQuestion.prompt}" dengan kunci "${activeQuestion.correctKey}".` : ""}`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && typeof text === "string") return text;
  } catch {
    // Fallback below
  }
  return generateSmartFallbackReply(userPrompt, currentTopic);
}

// ============================================================================
// 3. INTERACTIVE "CORET & SOROT" SENTENCE COMPONENT
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
      if (token.role === "normal") return "text-slate-800";
      return "text-slate-800 bg-slate-100 hover:bg-blue-100 border-b-2 border-dashed border-blue-400 cursor-pointer px-1.5 py-0.5 rounded transition-all";
    }
    switch (token.role) {
      case "trap":
        return "line-through decoration-2 decoration-rose-500 text-slate-400 bg-rose-50 px-1.5 py-0.5 rounded cursor-pointer";
      case "subject":
        return "bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-300 px-1.5 py-0.5 rounded cursor-pointer";
      case "verb":
        return "bg-emerald-100 text-emerald-900 font-bold ring-1 ring-emerald-300 px-1.5 py-0.5 rounded cursor-pointer";
      case "connector":
        return "bg-purple-100 text-purple-900 font-bold ring-1 ring-purple-300 px-1.5 py-0.5 rounded cursor-pointer";
      default:
        return "text-slate-800";
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1E3A8A]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Latihan Coret &amp; Sorot Interaktif
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRevealAll((r) => !r)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#1E3A8A] text-white hover:bg-blue-900 transition"
          >
            {revealAll ? "Sembunyikan" : "Tampilkan Semua"}
          </button>
          {(clickedIndices.length > 0 || revealAll) && (
            <button
              type="button"
              onClick={() => {
                setClickedIndices([]);
                setRevealAll(false);
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500">{data.tip}</p>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm sm:text-base leading-relaxed py-1">
        {data.tokens.map((token, idx) => {
          const active = isRevealed(idx);
          const clickable = token.role !== "normal";
          return (
            <span
              key={idx}
              onClick={() => clickable && toggleToken(idx)}
              className={`inline-flex flex-col items-center ${getTokenStyle(token, active)}`}
            >
              <span>{token.text}</span>
              {active && token.label && (
                <span className="text-[10px] font-semibold leading-tight mt-0.5 no-underline">
                  {token.label}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {showTranslation && (
        <p className="pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-bold text-slate-700">Arti ID: </span>
          {data.translation}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-blue-200 border border-blue-400" /> Subject
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400" /> Main Verb
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-400" /> Coret (Jebakan)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-purple-200 border border-purple-400" /> Connector / Trigger
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// 4. ANIMATED 2D/SVG AI DOSEN AVATAR COMPONENT
// ============================================================================
function LecturerAvatar({ state = "idle", isMuted = false, activeLang = "id-ID" }) {
  const statusLabel =
    state === "speaking"
      ? `Berbicara (${activeLang.startsWith("en") ? "EN" : "ID"})...`
      : state === "encouraging"
      ? "Hebat! Benar"
      : state === "thinking"
      ? "Menganalisis..."
      : "Siap Mengajar";

  const badgeColor =
    state === "speaking"
      ? "bg-blue-600 text-white border-blue-700"
      : state === "encouraging"
      ? "bg-emerald-600 text-white border-emerald-700"
      : state === "thinking"
      ? "bg-amber-500 text-white border-amber-600"
      : "bg-white text-slate-700 border-slate-200";

  const frameColor =
    state === "speaking"
      ? "border-blue-500 bg-gradient-to-b from-blue-50 to-indigo-100"
      : state === "encouraging"
      ? "border-emerald-500 bg-gradient-to-b from-emerald-50 to-teal-100"
      : state === "thinking"
      ? "border-amber-400 bg-gradient-to-b from-amber-50 to-orange-100"
      : "border-slate-200 bg-gradient-to-b from-slate-100 to-blue-50";

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      <style>{`
        @keyframes lecturerBreathe { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-2.5px); } }
        @keyframes lecturerBlink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        @keyframes lecturerTalk { 0%, 100% { transform: scaleY(0.25); } 25% { transform: scaleY(1); } 50% { transform: scaleY(0.55); } 75% { transform: scaleY(0.9); } }
        @keyframes lecturerNod { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 50% { transform: rotate(2deg); } }
        @keyframes pulseRing { 0% { transform: scale(0.92); opacity: 0.7; } 100% { transform: scale(1.22); opacity: 0; } }
        .avatar-breathe { animation: lecturerBreathe 3.2s ease-in-out infinite; transform-origin: center bottom; }
        .avatar-nod { animation: lecturerNod 0.9s ease-in-out infinite; transform-origin: 60px 85px; }
        .avatar-eye { animation: lecturerBlink 4.2s infinite; transform-origin: center; }
        .avatar-mouth-speaking { animation: lecturerTalk 0.34s ease-in-out infinite; transform-origin: 60px 67px; }
        .soundwave-ring { animation: pulseRing 1.5s cubic-bezier(0.2, 0.8, 0.4, 1) infinite; transform-origin: center; }
      `}</style>

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        {state === "speaking" && !isMuted && (
          <span className="absolute inset-0 rounded-full border-2 border-blue-400/60 soundwave-ring" />
        )}
        {state === "encouraging" && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400/70 soundwave-ring" />
        )}

        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md border-[3px] transition-colors duration-300 ${frameColor}`}
        >
          <svg
            viewBox="0 0 120 120"
            className={`w-full h-full ${state === "encouraging" ? "avatar-nod" : "avatar-breathe"}`}
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
            {state === "speaking" ? (
              <ellipse cx="60" cy="67" rx="5" ry="3.8" fill="#991B1B" className="avatar-mouth-speaking" />
            ) : state === "encouraging" ? (
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
// 5. PWA INSTALL & CERTIFICATE MODALS
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
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-[#1E3A8A] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-300" />
            <h3 className="text-sm sm:text-base font-extrabold">Install Aplikasi (PWA)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700">
          {deferredPrompt && (
            <button
              type="button"
              onClick={onTriggerNativeInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Pasang TOEFL 550 Academy ke Layar Utama</span>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Smartphone className="w-4 h-4 text-[#1E3A8A]" />
                <span>Android</span>
              </div>
              <p className="text-[11px] text-slate-600">Ketuk ⋮ di Chrome lalu pilih <strong>Install App</strong>.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Tablet className="w-4 h-4 text-[#1E3A8A]" />
                <span>iPhone / iPad</span>
              </div>
              <p className="text-[11px] text-slate-600">Di Safari ketuk <strong>Share</strong> lalu <strong>Add to Home Screen</strong>.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Monitor className="w-4 h-4 text-[#1E3A8A]" />
                <span>Laptop / PC</span>
              </div>
              <p className="text-[11px] text-slate-600">Klik menu ⋮ lalu pilih <strong>Instal halaman sebagai aplikasi</strong>.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">Progres, Error Log &amp; skor tersimpan otomatis di perangkat ini.</span>
            <button type="button" onClick={handleCopyUrl} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Tersalin!" : "Salin Link"}</span>
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-extrabold">Sertifikat Kesiapan TOEFL ITP 550+</span>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-500 bg-gradient-to-br from-slate-50 via-white to-amber-50/60 text-center space-y-3 shadow-inner">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3A8A] text-white text-[10px] font-black uppercase tracking-widest">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>TOEFL 550 Academy • Academic Program</span>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold pt-1">Certificate of Achievement</div>
            <p className="text-xs text-slate-600">Diberikan dengan bangga kepada:</p>
            <div className="text-xl sm:text-2xl font-black text-[#1E3A8A] border-b-2 border-slate-300 pb-1.5 max-w-sm mx-auto">
              {studentName || "Calon Peraih 550+"}
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Telah menuntaskan kurikulum intensif 18 Modul Listening, Structure, dan Reading TOEFL ITP dengan Estimasi Skor Kesiapan:
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
                <div className="font-bold text-emerald-700">{score >= 550 ? "STATUS: LULUS TARGET 550+" : "STATUS: IN PROGRESS"}</div>
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
// 6. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const totalModulesCount = CURRICULUM.length;

  // Hydration-safe flag
  const [isHydrated, setIsHydrated] = useState(false);

  // Navigation Modes: curriculum | diagnostic | arena | exam | listening | vault
  const [appMode, setAppMode] = useState("curriculum");

  // Curriculum State
  const [selectedLevel, setSelectedLevel] = useState("Basic");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedTopicId, setSelectedTopicId] = useState("basic-struct-sv");
  const [activeTab, setActiveTab] = useState("materi"); // materi | contoh
  const [topicPracticeLimit, setTopicPracticeLimit] = useState(5); // 5 or 10 soal per topik
  const [topicExampleIndex, setTopicExampleIndex] = useState(0);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [playedAudioIds, setPlayedAudioIds] = useState({});

  // Persistent Progress State
  const [userAnswers, setUserAnswers] = useState({});
  const [completedTopics, setCompletedTopics] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [diagnosticScore, setDiagnosticScore] = useState(null);
  const [streakCount, setStreakCount] = useState(1);
  const [gameHighScore, setGameHighScore] = useState(0);
  const [vocabHighScore, setVocabHighScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [studentName, setStudentName] = useState("Calon Peraih 550+");

  // Diagnostic State
  const [diagIndex, setDiagIndex] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState({});
  const [diagFinished, setDiagFinished] = useState(false);

  // Modals & UI Toggles
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showDosenPanel, setShowDosenPanel] = useState(true);

  // AI Voice & Avatar State
  const [avatarState, setAvatarState] = useState("idle");
  const [activeVoiceLang, setActiveVoiceLang] = useState("id-ID");
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.98);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceMode, setVoiceMode] = useState("auto");
  const [liveSubtitle, setLiveSubtitle] = useState(
    `Selamat datang! Saya AI Dosen pembimbingmu. Silabus lengkap ${totalModulesCount} modul terstruktur siap kamu pelajari!`
  );

  // Chat & Mic State (with proper Ref for clean stop)
  const [chatMessages, setChatMessages] = useState([
    {
      id: "welcome-1",
      sender: "dosen",
      text: `Halo! Silabus lengkap ${totalModulesCount} Modul sudah tersedia (Basic, Intermediate, Advance 550+), lengkap dengan Diagnostic Test, latihan Coret & Sorot, Split-Screen Reading, Lab Listening, dan AWL 550+.`
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Mini-Game 1: Speed Trap Hunter
  const [trapGameActive, setTrapGameActive] = useState(false);
  const [trapTimeLeft, setTrapTimeLeft] = useState(60);
  const [trapIndex, setTrapIndex] = useState(0);
  const [trapScore, setTrapScore] = useState(0);
  const [trapFeedback, setTrapFeedback] = useState(null);

  // Mini-Game 2: Vocab Duel
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabCombo, setVocabCombo] = useState(0);
  const [vocabCurrentScore, setVocabCurrentScore] = useState(0);
  const [vocabFeedback, setVocabFeedback] = useState(null);

  // Real TOEFL ITP Level 1 Simulation State (Full 140 Soal / 115 Menit or Mini 35 Soal / 30 Menit)
  const [itpMode, setItpMode] = useState("full"); // 'full' | 'mini'
  const [itpExam, setItpExam] = useState(null);
  const [itpSectionIdx, setItpSectionIdx] = useState(0); // 0: Listening, 1: Structure, 2: Reading
  const [itpShowDirections, setItpShowDirections] = useState(true);
  const [itpQIndex, setItpQIndex] = useState(0);
  const [itpSecondsLeft, setItpSecondsLeft] = useState(35 * 60);
  const [itpAnswers, setItpAnswers] = useState({});
  const [itpFinished, setItpFinished] = useState(false);

  // Lab Listening (with Speed Control + Practice vs Exam Mode)
  const [listenIndex, setListenIndex] = useState(0);
  const [listenAnswers, setListenAnswers] = useState({});
  const [showListenScript, setShowListenScript] = useState(false);
  const [listenSpeed, setListenSpeed] = useState(1.0);
  const [listenPracticeMode, setListenPracticeMode] = useState(true);

  // Vault Sub-Tabs: errorlog | flashcards | awl
  const [vaultSubTab, setVaultSubTab] = useState("errorlog");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [awlSearch, setAwlSearch] = useState("");

  const chatEndRef = useRef(null);
  const speakSessionRef = useRef(0);
  const recognitionRef = useRef(null);

  // ==========================================================================
  // HYDRATION-SAFE LOAD & AUTO-SAVE TO LOCALSTORAGE
  // ==========================================================================
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
          if (parsed.completedTopics) setCompletedTopics(parsed.completedTopics);
          if (Array.isArray(parsed.bookmarkedIds)) setBookmarkedIds(parsed.bookmarkedIds);
          if (typeof parsed.diagnosticScore === "number") setDiagnosticScore(parsed.diagnosticScore);
          if (typeof parsed.streakCount === "number") setStreakCount(parsed.streakCount);
          if (typeof parsed.gameHighScore === "number") setGameHighScore(parsed.gameHighScore);
          if (typeof parsed.vocabHighScore === "number") setVocabHighScore(parsed.vocabHighScore);
          if (typeof parsed.listeningScore === "number") setListeningScore(parsed.listeningScore);
          if (typeof parsed.studentName === "string") setStudentName(parsed.studentName);
          if (typeof parsed.selectedLevel === "string") setSelectedLevel(parsed.selectedLevel);
          if (typeof parsed.selectedTopicId === "string") setSelectedTopicId(parsed.selectedTopicId);
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isBrowser || !isHydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userAnswers,
          completedTopics,
          bookmarkedIds,
          diagnosticScore,
          streakCount,
          gameHighScore,
          vocabHighScore,
          listeningScore,
          studentName,
          selectedLevel,
          selectedTopicId
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    isHydrated,
    userAnswers,
    completedTopics,
    bookmarkedIds,
    diagnosticScore,
    streakCount,
    gameHighScore,
    vocabHighScore,
    listeningScore,
    studentName,
    selectedLevel,
    selectedTopicId
  ]);

  // Derived Curriculum & 300+ Bank Soal
  const levels = ["Basic", "Intermediate", "Advance"];
  const sections = ["All", "Structure", "Listening", "Reading"];

  const fullQuestionBank = useMemo(() => buildFullQuestionBank(), []);

  const currentTopic = useMemo(
    () => CURRICULUM.find((t) => t.id === selectedTopicId) || CURRICULUM[0],
    [selectedTopicId]
  );

  const topicsInCurrentLevel = useMemo(() => {
    return CURRICULUM.filter((t) => {
      const matchLevel = t.level === selectedLevel;
      const matchSection = selectedSection === "All" || t.section === selectedSection;
      return matchLevel && matchSection;
    });
  }, [selectedLevel, selectedSection]);

  // 5 or 10 Focused Questions per Module Topic (Reading stays locked to its full passage!)
  const activeTopicQuestions = useMemo(() => {
    return getTopicPracticeQuestions(currentTopic, fullQuestionBank, topicPracticeLimit);
  }, [currentTopic, fullQuestionBank, topicPracticeLimit]);

  const activePassageForSplitScreen =
    activeTab === "contoh" && currentTopic.passage?.lines ? currentTopic.passage : null;

  const allQuestionsMap = useMemo(() => {
    const map = {};
    for (const q of fullQuestionBank) {
      map[q.id] = {
        ...q,
        topicTitle: q.sourceTag,
        topicCode: `${q.level} • ${q.section}`
      };
    }
    for (const dq of DIAGNOSTIC_QUESTIONS) {
      map[dq.id] = {
        ...dq,
        skillTag: `Diagnostic • ${dq.recommendedCode}`,
        topicCode: `Diagnostic • ${dq.section}`,
        formula: dq.explanation
      };
    }
    return map;
  }, [fullQuestionBank]);

  const activeQuestion =
    activeTopicQuestions[topicExampleIndex] || activeTopicQuestions[0];

  const totalQuestionsCount = fullQuestionBank.length;
  const correctAnswersCount = useMemo(
    () => Object.values(userAnswers).filter((ans) => ans.isCorrect).length,
    [userAnswers]
  );

  const estimatedScore = useMemo(() => {
    const base = diagnosticScore || 420;
    const curriculumBonus = Math.min(110, correctAnswersCount * 3);
    const activityBonus = Math.min(
      25,
      Math.round((gameHighScore + vocabHighScore + listeningScore * 10) / 10)
    );
    return Math.min(600, base + curriculumBonus + activityBonus);
  }, [diagnosticScore, correctAnswersCount, gameHighScore, vocabHighScore, listeningScore]);

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

  // PWA Install Listener
  useEffect(() => {
    if (!isBrowser) return;
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (!deferredInstallPrompt) return;
    try {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      setShowPwaModal(false);
    } catch {
      // Ignore
    }
  };

  // Load Voices
  useEffect(() => {
    const synth = getSpeechSynthesisSafe();
    if (!synth) return;
    const loadVoices = () => {
      const voices = synth.getVoices();
      if (Array.isArray(voices) && voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => synth.cancel();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

  // Real TOEFL ITP Per-Section Timer (Auto-advances section when time runs out)
  useEffect(() => {
    if (!itpExam || itpFinished || itpShowDirections) return;
    if (itpSecondsLeft <= 0) {
      if (itpSectionIdx < itpExam.sections.length - 1) {
        const nextIdx = itpSectionIdx + 1;
        setItpSectionIdx(nextIdx);
        setItpQIndex(0);
        setItpShowDirections(true);
        setItpSecondsLeft(itpExam.sections[nextIdx].durationSeconds);
      } else {
        setItpFinished(true);
      }
      return;
    }
    const id = setInterval(() => setItpSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [itpExam, itpFinished, itpShowDirections, itpSecondsLeft, itpSectionIdx]);

  // ==========================================================================
  // VOICE ENGINE
  // ==========================================================================
  const stopSpeaking = useCallback(() => {
    speakSessionRef.current += 1;
    const synth = getSpeechSynthesisSafe();
    if (synth) synth.cancel();
    setAvatarState("idle");
  }, []);

  const speakText = useCallback(
    (rawText, overrideLang = null, customRate = null) => {
      const cleanText = sanitizeSpeechText(rawText);
      if (!cleanText) return;

      const segments =
        overrideLang || voiceMode !== "auto"
          ? [{ text: cleanText, lang: overrideLang || voiceMode }]
          : splitMixedLanguageSegments(cleanText);
      if (segments.length === 0) return;

      setLiveSubtitle(cleanText);
      setActiveVoiceLang(segments[0].lang);

      if (isMuted) {
        setAvatarState("idle");
        return;
      }

      const synth = getSpeechSynthesisSafe();
      if (!synth) return;

      synth.cancel();
      const sessionId = ++speakSessionRef.current;
      const baseRate = customRate || speechRate;
      setAvatarState("speaking");

      const speakSegmentAt = (idx) => {
        if (speakSessionRef.current !== sessionId) return;
        if (idx >= segments.length) {
          setAvatarState("idle");
          return;
        }
        const seg = segments[idx];
        const segVoice = pickMostNaturalVoice(availableVoices, seg.lang);
        setActiveVoiceLang(seg.lang);

        const utterance = new SpeechSynthesisUtterance(seg.text);
        utterance.lang = seg.lang;
        if (segVoice) utterance.voice = segVoice;
        utterance.rate = customRate ? customRate : seg.lang.startsWith("en") ? Math.max(0.86, baseRate * 0.95) : baseRate;
        utterance.onend = () => {
          if (speakSessionRef.current !== sessionId) return;
          setTimeout(() => speakSegmentAt(idx + 1), 180);
        };
        utterance.onerror = () => {
          if (speakSessionRef.current === sessionId) setAvatarState("idle");
        };
        synth.speak(utterance);
      };

      speakSegmentAt(0);
    },
    [availableVoices, isMuted, speechRate, voiceMode]
  );

  // ==========================================================================
  // CURRICULUM, DIAGNOSTIC & CHAT HANDLERS
  // ==========================================================================
  const handleSelectLevel = (levelName) => {
    stopSpeaking();
    setSelectedLevel(levelName);
    const firstTopic = CURRICULUM.find(
      (t) => t.level === levelName && (selectedSection === "All" || t.section === selectedSection)
    );
    if (firstTopic) {
      setSelectedTopicId(firstTopic.id);
      setActiveTab("materi");
      setTopicExampleIndex(0);
      setHighlightedLine(null);
      setShowHint(false);
    }
    setMobileMenuOpen(false);
  };

  const handleSelectSection = (sectionName) => {
    stopSpeaking();
    setSelectedSection(sectionName);
    const matching = CURRICULUM.find(
      (t) => t.level === selectedLevel && (sectionName === "All" || t.section === sectionName)
    );
    if (matching) {
      setSelectedTopicId(matching.id);
      setActiveTab("materi");
      setTopicExampleIndex(0);
      setHighlightedLine(null);
      setShowHint(false);
    }
  };

  const handleSelectTopic = (topicId, targetTab = "materi") => {
    stopSpeaking();
    const found = CURRICULUM.find((t) => t.id === topicId);
    if (found) {
      setAppMode("curriculum");
      setSelectedLevel(found.level);
      setSelectedSection("All");
      setSelectedTopicId(found.id);
      setActiveTab(targetTab);
      setTopicExampleIndex(0);
      setHighlightedLine(null);
      setShowHint(false);
    }
    setMobileMenuOpen(false);
  };

  const handleStartItpExam = (chosenMode) => {
    stopSpeaking();
    const built = buildRealToeflItpExam(fullQuestionBank, chosenMode);
    setItpMode(chosenMode);
    setItpExam(built);
    setItpSectionIdx(0);
    setItpQIndex(0);
    setItpShowDirections(true);
    setItpAnswers({});
    setItpFinished(false);
    setItpSecondsLeft(built.sections[0].durationSeconds);
  };

  const handleAdvanceItpSection = () => {
    stopSpeaking();
    if (!itpExam) return;
    if (itpSectionIdx < itpExam.sections.length - 1) {
      const nextIdx = itpSectionIdx + 1;
      setItpSectionIdx(nextIdx);
      setItpQIndex(0);
      setItpShowDirections(true);
      setItpSecondsLeft(itpExam.sections[nextIdx].durationSeconds);
    } else {
      // Save wrong answers to Error Log automatically
      const wrongIds = [];
      for (const sec of itpExam.sections) {
        for (const q of sec.questions) {
          if (itpAnswers[q.id] && itpAnswers[q.id] !== q.correctKey) {
            wrongIds.push(q.id);
          }
        }
      }
      if (wrongIds.length > 0) {
        setBookmarkedIds((prev) => Array.from(new Set([...prev, ...wrongIds])));
      }
      setItpFinished(true);
    }
  };

  const handlePlayAudio = (audioKey, scriptText, oneTimeOnly = true, rate = 0.94) => {
    if (oneTimeOnly && playedAudioIds[audioKey]) return;
    if (oneTimeOnly) setPlayedAudioIds((prev) => ({ ...prev, [audioKey]: true }));
    speakText(scriptText, "en-US", rate);
  };

  const toggleBookmark = (qId) => {
    setBookmarkedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleAnswerSelect = (optionKey) => {
    if (!activeQuestion || userAnswers[activeQuestion.id]) return;
    const isCorrect = optionKey === activeQuestion.correctKey;
    const updatedAnswers = {
      ...userAnswers,
      [activeQuestion.id]: { selectedKey: optionKey, isCorrect }
    };
    setUserAnswers(updatedAnswers);

    if (activeQuestion.evidenceLine !== undefined) {
      setHighlightedLine(activeQuestion.evidenceLine);
    }

    if (!isCorrect && !bookmarkedIds.includes(activeQuestion.id)) {
      setBookmarkedIds((prev) => [...prev, activeQuestion.id]);
    }

    const allTopicQsDone = currentTopic.questions.every((q) => Boolean(updatedAnswers[q.id]));
    if (allTopicQsDone) {
      setCompletedTopics((prev) => ({ ...prev, [currentTopic.id]: true }));
    }

    if (isCorrect) {
      setAvatarState("encouraging");
      setStreakCount((s) => s + 1);
      speakText(`Tepat sekali! Jawaban ${optionKey} benar. ${activeQuestion.voiceWalkthrough}`);
    } else {
      setAvatarState("thinking");
      speakText(`Belum tepat, opsi ${optionKey} adalah jebakan soal. Soal ini otomatis saya simpan ke Error Log. ${activeQuestion.voiceWalkthrough}`);
    }
  };

  const handleChallengeLecturer = (wrongKey) => {
    if (!activeQuestion) return;
    const specificReason =
      activeQuestion.optionAnalysis?.[wrongKey] ||
      `Opsi ${wrongKey} tidak sesuai dengan struktur tata bahasa kalimat tersebut.`;
    const promptMsg = `Tantang Dosen: Kenapa bukan opsi ${wrongKey}?`;
    setShowDosenPanel(true);
    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: "user", text: promptMsg },
      { id: `d-${Date.now() + 1}`, sender: "dosen", text: specificReason }
    ]);
    speakText(specificReason);
  };

  const handleSendChat = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const trimmed = (overrideText !== null ? overrideText : chatInput).trim();
    if (!trimmed || isSendingChat) return;

    setChatMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: "user", text: trimmed }]);
    if (overrideText === null) setChatInput("");
    setIsSendingChat(true);
    setAvatarState("thinking");

    const reply = await askGeminiLecturer(trimmed, currentTopic, activeTab !== "materi" ? activeQuestion : null);
    setChatMessages((prev) => [...prev, { id: `d-${Date.now() + 1}`, sender: "dosen", text: reply }]);
    setIsSendingChat(false);
    speakText(reply);
  };

  // Fixed Mic toggle with real stop()
  const handleToggleMic = () => {
    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) return;
    if (isListeningMic) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListeningMic(false);
      return;
    }
    try {
      const recognition = new RecognitionCtor();
      recognitionRef.current = recognition;
      recognition.lang = "id-ID";
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

  // Diagnostic Handlers
  const handleDiagnosticAnswer = (q, optKey) => {
    if (diagAnswers[q.id]) return;
    const isCorrect = optKey === q.correctKey;
    setDiagAnswers((prev) => ({ ...prev, [q.id]: { selectedKey: optKey, isCorrect } }));
    if (!isCorrect && !bookmarkedIds.includes(q.id)) {
      setBookmarkedIds((prev) => [...prev, q.id]);
    }
  };

  const handleFinishDiagnostic = () => {
    const rightCount = DIAGNOSTIC_QUESTIONS.filter((q) => diagAnswers[q.id]?.isCorrect).length;
    const calc = Math.round(370 + (rightCount / DIAGNOSTIC_QUESTIONS.length) * 230);
    setDiagnosticScore(calc);
    setDiagFinished(true);
    speakText(`Tes diagnostik selesai! Estimasi skor awalmu adalah ${calc}. Silakan pelajari modul prioritas yang saya rekomendasikan.`);
  };

  // Mini-Games & Lab Handlers
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

  const itpScoreReport = useMemo(() => {
    if (!itpExam || !itpFinished) return null;
    const s1 = itpExam.sections[0].questions;
    const s2 = itpExam.sections[1].questions;
    const s3 = itpExam.sections[2].questions;
    const r1 = s1.filter((q) => itpAnswers[q.id] === q.correctKey).length;
    const r2 = s2.filter((q) => itpAnswers[q.id] === q.correctKey).length;
    const r3 = s3.filter((q) => itpAnswers[q.id] === q.correctKey).length;
    const converted = convertToeflItpScore(r1, s1.length, r2, s2.length, r3, s3.length);
    return {
      rawS1: r1,
      totalS1: s1.length,
      rawS2: r2,
      totalS2: s2.length,
      rawS3: r3,
      totalS3: s3.length,
      ...converted
    };
  }, [itpExam, itpFinished, itpAnswers]);

  const badges = [
    { id: "b-rookie", title: "Grammar Rookie", desc: "Menjawab benar >= 3 soal", unlocked: correctAnswersCount >= 3 },
    { id: "b-trap", title: "Trap Master", desc: "Skor Speed Trap >= 60 pts", unlocked: gameHighScore >= 60 },
    { id: "b-listen", title: "Sharp Listener", desc: "Benar >= 2 soal Lab Listening", unlocked: listeningScore >= 2 },
    { id: "b-550", title: "550 Club Elite", desc: "Estimasi skor >= 550+", unlocked: estimatedScore >= 550 }
  ];

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ==========================================================================
  // 7. RENDER
  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden">
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

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0"
              aria-label="Buka Daftar Silabus"
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
                Silabus Lengkap {totalModulesCount} Modul • Real TOEFL ITP (140 Soal) • {totalQuestionsCount}+ Bank Soal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDosenPanel((p) => !p)}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold"
              title={showDosenPanel ? "Mode Fokus Baca (Tutup Panel Dosen)" : "Tampilkan Panel AI Dosen"}
            >
              {showDosenPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
              <span>{showDosenPanel ? "Fokus Baca" : "Panel Dosen"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPwaModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 text-xs font-extrabold"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>

            <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-extrabold">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{streakCount}d</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                estimatedScore >= 550
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                  : "bg-amber-50 text-slate-900 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Award className={`w-4 h-4 ${estimatedScore >= 550 ? "text-amber-300" : "text-amber-600"}`} />
              <span>Est: {estimatedScore}/550+</span>
            </button>
          </div>
        </div>

        {/* PRIMARY FEATURE NAVIGATION BAR */}
        <div className="bg-slate-100/95 border-t border-slate-200 px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 w-full sm:w-auto">
              {[
                { id: "curriculum", label: `Silabus ${totalModulesCount} Modul`, icon: BookOpen },
                { id: "diagnostic", label: "Diagnostic Test", icon: Target },
                { id: "exam", label: "Simulasi TOEFL ITP (Real)", icon: Timer },
                { id: "listening", label: "Lab Listening", icon: Headphones },
                { id: "arena", label: "Arena Game", icon: Gamepad2 },
                { id: "vault", label: "Error Log, Rumus & AWL", icon: Bookmark }
              ].map((nav) => {
                const IconComp = nav.icon;
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
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-blue-50"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{nav.label}</span>
                    {nav.id === "vault" && bookmarkedIds.length > 0 && (
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
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                showTranslations
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {showTranslations ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>Terjemahan ID: {showTranslations ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE CURRICULUM DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-80 max-w-[85vw] h-full bg-white p-4 overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="font-extrabold text-slate-900">Semua Modul Silabus ({totalModulesCount})</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {levels.map((lvl) => (
              <div key={lvl} className="mb-4">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Level {lvl}</div>
                <div className="space-y-1.5">
                  {CURRICULUM.filter((t) => t.level === lvl).map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic.id, "materi")}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border ${
                        selectedTopicId === topic.id
                          ? "bg-blue-50 border-blue-300 text-[#1E3A8A]"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{topic.code} {topic.shortTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold">{topic.section}</span>
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

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT WORKSPACE (8 COLS or 12 COLS IN FOCUS MODE) */}
          <div className={`${showDosenPanel ? "lg:col-span-8" : "lg:col-span-12"} space-y-4 sm:space-y-5 min-w-0`}>
            {/* DIAGNOSTIC BANNER FOR NEW USERS */}
            {!diagnosticScore && appMode === "curriculum" && (
              <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-blue-700 p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Langkah Pertama Disarankan
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold">Ukur Skor Awalmu dengan Mini Diagnostic Test (9 Soal)</h2>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Dapatkan estimasi skor awal yang akurat dan rekomendasi modul prioritas sesuai kelemahanmu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAppMode("diagnostic")}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs"
                >
                  <span>Mulai Tes Cepat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ================================================================
                MODE 1: SILABUS 18 MODUL LENGKAP & LATIHAN 5 / 10 SOAL PER TOPIK
               ================================================================ */}
            {appMode === "curriculum" && (
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
                              ? "bg-[#1E3A8A] text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {lvl === "Basic"
                            ? "1. Basic (8 Modul)"
                            : lvl === "Intermediate"
                            ? "2. Intermediate (6 Modul)"
                            : "3. Advance 550+ (4 Modul)"}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] font-bold text-slate-500">
                      {correctAnswersCount}/{totalQuestionsCount}+ Total Bank Soal
                    </span>
                  </div>

                  {/* Section Filter */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase mr-1">
                      Filter Section:
                    </span>
                    {sections.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleSelectSection(sec)}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all ${
                          selectedSection === sec
                            ? "bg-amber-400 text-slate-950 border-amber-500 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {sec === "All"
                          ? `Semua (${CURRICULUM.filter((t) => t.level === selectedLevel).length} Modul)`
                          : sec}
                      </button>
                    ))}
                  </div>

                  {/* Module Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {topicsInCurrentLevel.map((topic) => {
                      const isActive = topic.id === selectedTopicId;
                      const isDone = Boolean(completedTopics[topic.id]);
                      const secBadgeColor =
                        topic.section === "Listening"
                          ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                          : topic.section === "Structure"
                          ? "bg-blue-100 text-[#1E3A8A] border-blue-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200";
                      return (
                        <div
                          key={topic.id}
                          onClick={() => handleSelectTopic(topic.id, "materi")}
                          className={`cursor-pointer text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                            isActive
                              ? "bg-blue-50/90 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/15"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${secBadgeColor}`}>
                              {topic.section} • {topic.code}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectTopic(topic.id, "contoh");
                                }}
                                className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-extrabold"
                              >
                                Latihan Topik
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs font-extrabold leading-snug ${isActive ? "text-[#1E3A8A]" : "text-slate-900"}`}>
                              {topic.shortTitle}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{topic.moduleRef}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Topic Header & 2 Clean Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      {currentTopic.moduleRef}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{currentTopic.category}</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                    Topik {currentTopic.code}: {currentTopic.title}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setActiveTab("materi");
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-extrabold transition-all ${
                        activeTab === "materi" ? "bg-white text-[#1E3A8A] shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>1. Materi, Rumus &amp; Jebakan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setActiveTab("contoh");
                        setTopicExampleIndex(0);
                        setHighlightedLine(null);
                        setShowHint(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-extrabold transition-all ${
                        activeTab === "contoh" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ListChecks className="w-3.5 h-3.5 shrink-0" />
                      <span>2. Latihan Soal Topik ({activeTopicQuestions.length})</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: MATERI, RUMUS, CORET & SOROT, JEBAKAN UMUM */}
                {activeTab === "materi" && (
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
                            onClick={() => speakText(currentTopic.passage.text, "en-US", 0.92)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 border border-blue-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Baca Teks Inggris</span>
                          </button>
                        </div>

                        <div className="text-sm leading-relaxed text-slate-800 space-y-2.5 font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                          {currentTopic.passage.lines
                            ? currentTopic.passage.lines.map((line, i) => (
                                <div key={i} className="flex gap-2.5">
                                  <span className="font-mono text-[11px] font-bold text-slate-400 pt-0.5 select-none">
                                    {String(i + 1).padStart(2, "0")}
                                  </span>
                                  <p>{line}</p>
                                </div>
                              ))
                            : currentTopic.passage.text.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
                        </div>

                        {showTranslations && currentTopic.passage.translationId && (
                          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-700 space-y-1">
                            <div className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                              Terjemahan Pendamping (ID):
                            </div>
                            <p className="leading-relaxed">{currentTopic.passage.translationId}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {currentTopic.paragraphs.map((para) => (
                      <div key={para.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{para.heading}</h3>
                          <button
                            type="button"
                            onClick={() => speakText(para.voiceText)}
                            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 border border-blue-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Jelaskan</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{para.bodyId}</p>

                        <div className="bg-slate-900 text-amber-300 font-mono text-xs px-3.5 py-2.5 rounded-xl overflow-x-auto">
                          {para.englishRule}
                        </div>

                        {para.interactiveSentence && (
                          <InteractiveSentenceBreakdown
                            data={para.interactiveSentence}
                            showTranslation={showTranslations}
                          />
                        )}

                        <div className="space-y-2 pt-1">
                          {para.examples.map((ex, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">“{ex.en}”</p>
                                <button
                                  type="button"
                                  onClick={() => speakText(ex.en, "en-US", 0.9)}
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

                    {currentTopic.traps && currentTopic.traps.length > 0 && (
                      <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Jebakan Umum TOEFL (Salah vs. Benar)</span>
                        </div>
                        <div className="space-y-2.5">
                          {currentTopic.traps.map((trap, i) => (
                            <div key={i} className="bg-white rounded-xl border border-amber-100 p-3.5 space-y-2 shadow-2xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-950">
                                  <span className="block text-[10px] font-black uppercase text-rose-600 mb-0.5">
                                    ❌ Salah (Jebakan)
                                  </span>
                                  {trap.wrong}
                                </div>
                                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-950">
                                  <span className="block text-[10px] font-black uppercase text-emerald-600 mb-0.5">
                                    ✅ Benar
                                  </span>
                                  {trap.right}
                                </div>
                              </div>
                              <p className="text-xs text-slate-600">
                                <strong className="text-slate-800">Alasan: </strong>
                                {trap.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeaking();
                          setActiveTab("contoh");
                          setTopicExampleIndex(0);
                          setHighlightedLine(null);
                          setShowHint(false);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm"
                      >
                        <ListChecks className="w-4 h-4" />
                        <span>Mulai Latihan Soal Topik Ini ({activeTopicQuestions.length} Soal)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: LATIHAN SOAL TOPIK (5 / 10 SOAL + SPLIT-SCREEN READING) */}
                {activeTab === "contoh" && activeQuestion && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300">
                          Latihan {currentTopic.code}: {topicExampleIndex + 1} / {activeTopicQuestions.length}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {activeQuestion.skillTag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentTopic.section !== "Reading" && (
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            {[5, 10].map((lim) => (
                              <button
                                key={lim}
                                type="button"
                                onClick={() => {
                                  setTopicPracticeLimit(lim);
                                  setTopicExampleIndex(0);
                                }}
                                className={`px-2 py-1 rounded-md text-[11px] font-extrabold ${
                                  topicPracticeLimit === lim ? "bg-[#1E3A8A] text-white" : "text-slate-600"
                                }`}
                              >
                                {lim} Soal
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleBookmark(activeQuestion.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            bookmarkedIds.includes(activeQuestion.id)
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {bookmarkedIds.includes(activeQuestion.id) ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                          <span>{bookmarkedIds.includes(activeQuestion.id) ? "Tersimpan" : "Simpan"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Number Strip */}
                    <div className="flex flex-wrap gap-1.5">
                      {activeTopicQuestions.map((q, idx) => {
                        const ans = userAnswers[q.id];
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              stopSpeaking();
                              setTopicExampleIndex(idx);
                              setHighlightedLine(null);
                              setShowHint(false);
                            }}
                            className={`w-8 h-8 rounded-lg text-xs font-extrabold border transition-all ${
                              idx === topicExampleIndex
                                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                                : ans
                                ? ans.isCorrect
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Split-Screen for Reading, Full Width for Structure/Listening */}
                    <div className={activePassageForSplitScreen ? "grid grid-cols-1 xl:grid-cols-12 gap-5 items-start" : ""}>
                      {activePassageForSplitScreen && (
                        <div className="xl:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 xl:sticky xl:top-28">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[11px] font-extrabold uppercase text-emerald-700">
                              Teks Bacaan (Split-Screen)
                            </span>
                            {activeQuestion.evidenceLine !== undefined && (
                              <button
                                type="button"
                                onClick={() => setHighlightedLine(activeQuestion.evidenceLine)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200"
                              >
                                <Lightbulb className="w-3 h-3" />
                                <span>Sorot Bukti di Teks</span>
                              </button>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900">{activePassageForSplitScreen.title}</h4>
                          <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800 font-serif">
                            {activePassageForSplitScreen.lines.map((line, lIdx) => (
                              <div
                                key={lIdx}
                                className={`flex gap-2 p-1.5 rounded-lg transition-all ${
                                  highlightedLine === lIdx
                                    ? "bg-amber-200/80 ring-2 ring-amber-400 font-semibold text-slate-950"
                                    : ""
                                }`}
                              >
                                <span className="font-mono text-[10px] font-bold text-slate-400 pt-0.5 select-none">
                                  {String(lIdx + 1).padStart(2, "0")}
                                </span>
                                <p>{line}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`${activePassageForSplitScreen ? "xl:col-span-6" : ""} space-y-4`}>
                        {activeQuestion.section === "Listening" && (
                          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-amber-300">Audio Listening Latihan</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handlePlayAudio(
                                    activeQuestion.id,
                                    activeQuestion.audioScript || activeQuestion.prompt,
                                    false,
                                    0.94
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold"
                              >
                                <Headphones className="w-4 h-4" />
                                <span>Putar Audio Dialog</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                              {activeQuestion.prompt}
                            </p>
                            {activeQuestion.section !== "Listening" && (
                              <button
                                type="button"
                                onClick={() => speakText(activeQuestion.prompt, "en-US", 0.92)}
                                className="shrink-0 p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 border border-slate-200"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {showTranslations && activeQuestion.translationId && (
                            <p className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/80 px-3 py-2 rounded-xl">
                              <span className="font-bold text-amber-900">Terjemahan: </span>
                              {activeQuestion.translationId}
                            </p>
                          )}

                          {!userAnswers[activeQuestion.id] && activeQuestion.hintId && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setShowHint((h) => !h)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                              >
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>{showHint ? "Sembunyikan Petunjuk" : "Butuh Petunjuk Dosen?"}</span>
                              </button>
                              {showHint && (
                                <div className="mt-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                                  {activeQuestion.hintId}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {activeQuestion.options.map((opt) => {
                            const userAns = userAnswers[activeQuestion.id];
                            const isAnswered = Boolean(userAns);
                            const isSelected = userAns?.selectedKey === opt.key;
                            const isCorrectOpt = opt.key === activeQuestion.correctKey;

                            let cardClass = "bg-white border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/40 text-slate-800";
                            if (isAnswered) {
                              if (isCorrectOpt) cardClass = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20";
                              else if (isSelected) cardClass = "bg-rose-50 border-rose-400 text-rose-950";
                              else cardClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-75";
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
                                        ? "bg-emerald-600 text-white"
                                        : isAnswered && isSelected
                                        ? "bg-rose-600 text-white"
                                        : "bg-slate-100 text-slate-700 border border-slate-300"
                                    }`}
                                  >
                                    {opt.key}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold">{opt.text}</span>
                                </div>
                                {isAnswered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                                {isAnswered && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {userAnswers[activeQuestion.id] && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                              {userAnswers[activeQuestion.id].isCorrect ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
                                  <CheckCircle2 className="w-4 h-4" /> Jawaban Benar!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-extrabold">
                                  <XCircle className="w-4 h-4" /> Kunci: {activeQuestion.correctKey} (Tersimpan ke Error Log)
                                </span>
                              )}

                              <div className="flex items-center gap-2">
                                {!userAnswers[activeQuestion.id].isCorrect && (
                                  <button
                                    type="button"
                                    onClick={() => handleChallengeLecturer(userAnswers[activeQuestion.id].selectedKey)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>Kenapa bukan {userAnswers[activeQuestion.id].selectedKey}?</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => speakText(activeQuestion.voiceWalkthrough)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Suara</span>
                                </button>
                              </div>
                            </div>

                            {activeQuestion.optionAnalysis && (
                              <div className="space-y-1.5 text-xs">
                                {activeQuestion.options.map((opt) => (
                                  <div
                                    key={opt.key}
                                    className={`p-2 rounded-xl border ${
                                      opt.key === activeQuestion.correctKey
                                        ? "bg-emerald-950/60 border-emerald-700/70 text-emerald-100"
                                        : "bg-slate-800/50 border-slate-700/70 text-slate-300"
                                    }`}
                                  >
                                    <span className="font-extrabold mr-1.5">{opt.key}.</span>
                                    {activeQuestion.optionAnalysis[opt.key]}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Prev / Next */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={topicExampleIndex === 0}
                            onClick={() => {
                              stopSpeaking();
                              setTopicExampleIndex((i) => Math.max(0, i - 1));
                              setHighlightedLine(null);
                              setShowHint(false);
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 disabled:opacity-40"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Sebelumnya</span>
                          </button>
                          <button
                            type="button"
                            disabled={topicExampleIndex >= activeTopicQuestions.length - 1}
                            onClick={() => {
                              stopSpeaking();
                              setTopicExampleIndex((i) => Math.min(activeTopicQuestions.length - 1, i + 1));
                              setHighlightedLine(null);
                              setShowHint(false);
                            }}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#1E3A8A] text-white disabled:opacity-40"
                          >
                            <span>Soal Berikutnya</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ================================================================
                MODE 2: MINI DIAGNOSTIC TEST (9 SOAL -> REKOMENDASI MODUL)
               ================================================================ */}
            {appMode === "diagnostic" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1E3A8A]">
                      Mini Diagnostic Test • 9 Soal
                    </span>
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                      Pemetaan Skor Awal &amp; Rekomendasi Modul Prioritas
                    </h2>
                  </div>
                  {diagFinished && (
                    <button
                      type="button"
                      onClick={() => {
                        setDiagIndex(0);
                        setDiagAnswers({});
                        setDiagFinished(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ulangi Tes</span>
                    </button>
                  )}
                </div>

                {!diagFinished ? (
                  (() => {
                    const dq = DIAGNOSTIC_QUESTIONS[diagIndex];
                    const dAns = diagAnswers[dq.id];
                    return (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Soal {diagIndex + 1} dari {DIAGNOSTIC_QUESTIONS.length}</span>
                            <span>Section: {dq.section}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#1E3A8A] transition-all"
                              style={{ width: `${((diagIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {dq.miniPassage && (
                          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                            <span className="block text-[10px] font-extrabold uppercase text-emerald-700 mb-1">
                              Bacaan Singkat:
                            </span>
                            {dq.miniPassage}
                          </div>
                        )}

                        {dq.audioScript && (
                          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-300">Audio Diagnostic ({dq.section})</span>
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(`diag-audio-${dq.id}`, dq.audioScript, false, 0.94)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold"
                            >
                              <Headphones className="w-4 h-4" />
                              <span>Putar Audio</span>
                            </button>
                          </div>
                        )}

                        <p className="text-sm sm:text-base font-bold text-slate-900">{dq.prompt}</p>

                        <div className="space-y-2">
                          {dq.options.map((opt) => {
                            const isPicked = dAns?.selectedKey === opt.key;
                            const isRight = opt.key === dq.correctKey;
                            let cls = "bg-white border-slate-200 hover:border-[#1E3A8A] text-slate-800";
                            if (dAns) {
                              if (isRight) cls = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                              else if (isPicked) cls = "bg-rose-50 border-rose-400 text-rose-950";
                              else cls = "bg-slate-50 border-slate-200 text-slate-400";
                            }
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                disabled={Boolean(dAns)}
                                onClick={() => handleDiagnosticAnswer(dq, opt.key)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 ${cls}`}
                              >
                                <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {dAns && (
                          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-1">
                            <div className="font-extrabold text-amber-300">
                              {dAns.isCorrect ? "Tepat Sekali!" : `Belum Tepat (Kunci: ${dq.correctKey})`}
                            </div>
                            <p>{dq.explanation}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={diagIndex === 0}
                            onClick={() => setDiagIndex((i) => Math.max(0, i - 1))}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40"
                          >
                            ← Sebelumnya
                          </button>
                          {diagIndex < DIAGNOSTIC_QUESTIONS.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setDiagIndex((i) => i + 1)}
                              className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-extrabold"
                            >
                              Soal Berikutnya →
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleFinishDiagnostic}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                            >
                              Lihat Skor &amp; Rekomendasi →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-5">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-blue-800 text-white text-center space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                        Estimasi Skor Awal TOEFL ITP
                      </span>
                      <div className="text-5xl font-black">{diagnosticScore}</div>
                      <p className="text-xs text-blue-100 max-w-md mx-auto">
                        {diagnosticScore >= 550
                          ? "Luar biasa! Kamu sudah berada di zona 550+. Langsung tantang dirimu di Simulasi Real TOEFL ITP!"
                          : "Fokus pelajari modul prioritas di bawah ini untuk menaikkan skormu menembus 550+."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-extrabold text-slate-900">Rekomendasi Modul Prioritas:</h3>
                      {DIAGNOSTIC_QUESTIONS.filter((q) => !diagAnswers[q.id]?.isCorrect).length === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                          Sempurna! Semua soal Diagnostic benar. Lanjut ke Modul Advance 550+ atau Simulasi Real ITP.
                        </div>
                      ) : (
                        DIAGNOSTIC_QUESTIONS.filter((q) => !diagAnswers[q.id]?.isCorrect).map((q) => (
                          <div
                            key={q.id}
                            className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <span className="text-[11px] font-extrabold text-rose-700">
                                {q.section} • Modul {q.recommendedCode}
                              </span>
                              <p className="text-xs text-slate-700 mt-0.5">{q.explanation}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectTopic(q.recommendedTopicId, "materi")}
                              className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold"
                            >
                              Pelajari {q.recommendedCode} →
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================
                MODE 4: SIMULASI REAL TOEFL ITP LEVEL 1 (140 SOAL • 115 MENIT)
               ================================================================ */}
            {appMode === "exam" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                {!itpExam ? (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                        Simulasi Resmi TOEFL ITP Level 1
                      </span>
                      <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1">
                        Ujian Simulasi TOEFL ITP Lengkap (Skor Resmi 310–677)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        Format, urutan seksi, batas waktu, aturan audio 1x putar, hingga konversi skor (Section 1: 31–68, Section 2: 31–68, Section 3: 31–67) dibuat menyerupai tes <strong>TOEFL ITP Level 1 asli</strong>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-700">Section 1</span>
                        <h3 className="text-sm font-extrabold text-slate-900">Listening Comprehension</h3>
                        <p className="text-xs text-slate-600">50 Soal • 35 Menit</p>
                        <p className="text-[11px] text-slate-500">Part A (30 Short), Part B (8 Long), Part C (12 Talks) — Audio 1x Putar.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-[#1E3A8A]">Section 2</span>
                        <h3 className="text-sm font-extrabold text-slate-900">Structure &amp; Written Expression</h3>
                        <p className="text-xs text-slate-600">40 Soal • 25 Menit</p>
                        <p className="text-[11px] text-slate-500">Part A (No. 1–15 Melengkapi Kalimat) &amp; Part B (No. 16–40 Error Recognition).</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-emerald-700">Section 3</span>
                        <h3 className="text-sm font-extrabold text-slate-900">Reading Comprehension</h3>
                        <p className="text-xs text-slate-600">50 Soal • 55 Menit</p>
                        <p className="text-[11px] text-slate-500">5 Teks Akademik Utuh (10 Soal per Teks) dalam tampilan Split-Screen.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleStartItpExam("full")}
                        className="p-4 rounded-2xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-left space-y-1 shadow-sm transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold">Mulai Full Real TOEFL ITP</span>
                          <Play className="w-4 h-4 text-amber-300" />
                        </div>
                        <p className="text-xs text-blue-200">140 Soal Lengkap • 115 Menit (35m + 25m + 55m)</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartItpExam("mini")}
                        className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left space-y-1 shadow-sm transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold">Mulai Mini ITP (Versi Cepat)</span>
                          <Zap className="w-4 h-4 text-amber-300" />
                        </div>
                        <p className="text-xs text-slate-300">35 Soal (12 Listen + 11 Struct + 12 Read) • 30 Menit</p>
                      </button>
                    </div>
                  </div>
                ) : itpFinished && itpScoreReport ? (
                  <div className="space-y-5">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-blue-900 to-slate-900 text-white text-center space-y-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase">
                        Official-Style TOEFL ITP Score Report • {itpScoreReport.awardTier}
                      </span>
                      <div className="text-5xl sm:text-6xl font-black text-amber-300 pt-1">
                        {itpScoreReport.totalScore}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-blue-100">
                        CEFR Level: {itpScoreReport.cefr}
                      </div>
                      <p className="text-xs text-blue-200 max-w-md mx-auto">
                        {itpScoreReport.totalScore >= 550
                          ? "SELAMAT! Kamu telah menembus target skor 550+!"
                          : "Terus berlatih! Semua soal yang salah dari simulasi ini telah otomatis disimpan ke Error Log."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-500">Section 1: Listening</div>
                        <div className="text-2xl font-black text-[#1E3A8A] mt-1">{itpScoreReport.scaledS1}</div>
                        <div className="text-[11px] text-slate-500">Benar: {itpScoreReport.rawS1}/{itpScoreReport.totalS1} (Skala 31–68)</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-500">Section 2: Structure</div>
                        <div className="text-2xl font-black text-[#1E3A8A] mt-1">{itpScoreReport.scaledS2}</div>
                        <div className="text-[11px] text-slate-500">Benar: {itpScoreReport.rawS2}/{itpScoreReport.totalS2} (Skala 31–68)</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-500">Section 3: Reading</div>
                        <div className="text-2xl font-black text-[#1E3A8A] mt-1">{itpScoreReport.scaledS3}</div>
                        <div className="text-[11px] text-slate-500">Benar: {itpScoreReport.rawS3}/{itpScoreReport.totalS3} (Skala 31–67)</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setItpExam(null)}
                        className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold"
                      >
                        Kembali ke Menu Simulasi ITP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAppMode("vault");
                          setVaultSubTab("errorlog");
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold"
                      >
                        Review Kesalahan di Error Log →
                      </button>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const sec = itpExam.sections[itpSectionIdx];
                    const currentQ = sec.questions[itpQIndex];
                    const answeredInSec = sec.questions.filter((q) => Boolean(itpAnswers[q.id])).length;

                    if (itpShowDirections) {
                      return (
                        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                              {sec.name}
                            </span>
                            <span className="font-mono text-sm font-bold text-amber-300">
                              Waktu: {Math.round(sec.durationSeconds / 60)} Menit • {sec.questions.length} Soal
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-extrabold">Official Section Directions</h3>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{sec.directions}</p>
                          <div className="p-3 rounded-xl bg-white/10 text-xs text-amber-200">
                            Perhatian: Seperti tes TOEFL ITP asli, setelah kamu lanjut ke seksi berikutnya, kamu tidak dapat kembali ke seksi sebelumnya. Tidak ada pengurangan nilai untuk jawaban salah.
                          </div>
                          <button
                            type="button"
                            onClick={() => setItpShowDirections(false)}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm"
                          >
                            <span>Mulai {sec.name}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* TOP EXAM BAR */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                          <div>
                            <span className="text-[11px] font-black uppercase text-[#1E3A8A]">{sec.name}</span>
                            <div className="text-xs text-slate-500">
                              Soal {itpQIndex + 1} / {sec.questions.length} • Terjawab: {answeredInSec}/{sec.questions.length}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-xl font-mono text-sm font-black border ${
                                itpSecondsLeft < 120
                                  ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                  : "bg-slate-900 text-amber-300 border-slate-800"
                              }`}
                            >
                              {formatTimer(itpSecondsLeft)}
                            </span>
                            <button
                              type="button"
                              onClick={handleAdvanceItpSection}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                            >
                              {itpSectionIdx < 2 ? "Selesai Seksi →" : "Kumpulkan Ujian"}
                            </button>
                          </div>
                        </div>

                        {/* READING SPLIT-SCREEN OR STANDARD LAYOUT */}
                        <div className={sec.id === 3 ? "grid grid-cols-1 xl:grid-cols-12 gap-4 items-start" : ""}>
                          {sec.id === 3 && currentQ.passageLines && (
                            <div className="xl:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 max-h-[420px] overflow-y-auto">
                              <div className="text-[11px] font-extrabold uppercase text-emerald-700">
                                Passage {(currentQ.passageIndex || 0) + 1}: {currentQ.passageTitle}
                              </div>
                              <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800 font-serif">
                                {currentQ.passageLines.map((line, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="font-mono text-[10px] font-bold text-slate-400 pt-0.5">
                                      {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <p>{line}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={`${sec.id === 3 ? "xl:col-span-6" : ""} space-y-4`}>
                            {sec.id === 1 && (
                              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-extrabold text-amber-300">
                                    {currentQ.part} {currentQ.groupTitle ? `• ${currentQ.groupTitle}` : ""}
                                  </span>
                                  <span className="text-[10px] text-slate-400">Real ITP: Audio 1x Putar</span>
                                </div>
                                <button
                                  type="button"
                                  disabled={Boolean(playedAudioIds[`itp-${currentQ.groupTitle || currentQ.id}`])}
                                  onClick={() =>
                                    handlePlayAudio(
                                      `itp-${currentQ.groupTitle || currentQ.id}`,
                                      currentQ.audioScript || currentQ.prompt,
                                      true,
                                      0.94
                                    )
                                  }
                                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold ${
                                    playedAudioIds[`itp-${currentQ.groupTitle || currentQ.id}`]
                                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-500 text-white"
                                  }`}
                                >
                                  <Headphones className="w-4 h-4" />
                                  <span>
                                    {playedAudioIds[`itp-${currentQ.groupTitle || currentQ.id}`]
                                      ? "Audio Sudah Diputar (1/1)"
                                      : "Putar Audio Rekaman (1x)"}
                                  </span>
                                </button>
                              </div>
                            )}

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-[#1E3A8A]">
                                  No. {itpQIndex + 1} {currentQ.part ? `• ${currentQ.part}` : ""}
                                </span>
                              </div>
                              <p className="text-sm sm:text-base font-bold text-slate-900">{currentQ.prompt}</p>
                              <div className="space-y-2">
                                {currentQ.options.map((opt) => {
                                  const picked = itpAnswers[currentQ.id] === opt.key;
                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() =>
                                        setItpAnswers((prev) => ({ ...prev, [currentQ.id]: opt.key }))
                                      }
                                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition ${
                                        picked
                                          ? "bg-blue-50 border-[#1E3A8A] text-[#1E3A8A] font-bold ring-1 ring-[#1E3A8A]"
                                          : "bg-white border-slate-200 hover:border-blue-300 text-slate-800"
                                      }`}
                                    >
                                      <span
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                          picked ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700 border border-slate-300"
                                        }`}
                                      >
                                        {opt.key}
                                      </span>
                                      <span>{opt.text}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                disabled={itpQIndex === 0}
                                onClick={() => setItpQIndex((i) => Math.max(0, i - 1))}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40"
                              >
                                ← Sebelumnya
                              </button>
                              {itpQIndex < sec.questions.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={() => setItpQIndex((i) => i + 1)}
                                  className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-extrabold"
                                >
                                  Berikutnya →
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleAdvanceItpSection}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
                                >
                                  {itpSectionIdx < 2 ? "Lanjut ke Seksi Berikutnya →" : "Selesai & Lihat Skor ITP"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* COMPACT QUESTION NAVIGATOR */}
                        <div className="pt-3 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-500 mb-2">Navigasi Nomor Seksi Ini:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {sec.questions.map((q, idx) => (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => setItpQIndex(idx)}
                                className={`w-7 h-7 rounded-lg text-[11px] font-extrabold border ${
                                  idx === itpQIndex
                                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                                    : itpAnswers[q.id]
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* ================================================================
                MODE 3: ARENA MINI-GAMES & BADGES
               ================================================================ */}
            {appMode === "arena" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Lencana Pencapaian</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{badges.filter((b) => b.unlocked).length}/{badges.length} Terbuka</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {badges.map((b) => (
                      <div key={b.id} className={`p-3 rounded-xl border text-center space-y-1 ${b.unlocked ? "bg-amber-50 border-amber-300 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-400 opacity-70"}`}>
                        <Award className={`w-6 h-6 mx-auto ${b.unlocked ? "text-amber-500" : "text-slate-300"}`} />
                        <div className="text-xs font-extrabold">{b.title}</div>
                        <div className="text-[10px]">{b.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Speed Trap Hunter */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1E3A8A]">Mini-Game 1 • 60 Detik</span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">Speed Trap Hunter</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-extrabold text-slate-700">Rekor: {gameHighScore} pts</span>
                      {trapGameActive && <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black">{trapTimeLeft}s</span>}
                    </div>
                  </div>

                  {!trapGameActive ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                        Identifikasi True Subject, Irregular Plural, Gerund, dan Inversion dalam 60 detik!
                      </p>
                      {trapScore > 0 && <div className="text-sm font-extrabold text-emerald-700">Skor Sesi Terakhir: {trapScore} Poin!</div>}
                      <button type="button" onClick={startTrapGame} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-extrabold">
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Mulai Speed Trap Hunter</span>
                      </button>
                    </div>
                  ) : (
                    (() => {
                      const item = SPEED_TRAP_CHALLENGES[trapIndex % SPEED_TRAP_CHALLENGES.length];
                      return (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                            <p className="text-sm sm:text-base font-serif italic text-amber-200">“{item.sentence}”</p>
                            <p className="text-xs sm:text-sm font-bold">{item.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {item.choices.map((ch) => (
                                <button key={ch} type="button" onClick={() => answerTrapChallenge(ch)} className="p-3 rounded-xl bg-white/10 hover:bg-blue-600 border border-white/20 text-xs font-bold text-left">
                                  {ch}
                                </button>
                              ))}
                            </div>
                          </div>
                          {trapFeedback && (
                            <div className={`p-3 rounded-xl text-xs font-bold border ${trapFeedback.ok ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"}`}>
                              {trapFeedback.ok ? "Tepat (+20 pts)! " : "Kurang Tepat! "}
                              {trapFeedback.rule}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Vocab Duel */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">Mini-Game 2 • Combo Streak</span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">Context Vocab Duel</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900">Combo: {vocabCombo}x</span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">Rekor: {vocabHighScore}</span>
                    </div>
                  </div>
                  {(() => {
                    const item = VOCAB_DUEL_ITEMS[vocabIndex % VOCAB_DUEL_ITEMS.length];
                    return (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-base sm:text-lg font-black text-[#1E3A8A]">{item.word}</span>
                            <button type="button" onClick={() => speakText(item.context, "en-US", 0.92)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm italic text-slate-700">“{item.context}”</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((opt) => (
                            <button key={opt} type="button" onClick={() => answerVocabDuel(opt)} className="p-3 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50 text-left text-xs sm:text-sm font-semibold">
                              {opt}
                            </button>
                          ))}
                        </div>
                        {vocabFeedback && (
                          <div className={`p-3 rounded-xl text-xs font-bold border ${vocabFeedback.ok ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"}`}>
                            {vocabFeedback.ok ? "Mantap! " : `Jawaban: ${vocabFeedback.correct}. `}
                            Arti: <em>{vocabFeedback.meaningId}</em>.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ================================================================
                MODE 5: LAB LISTENING (UPGRADED WITH SPEED & PRACTICE/EXAM MODE)
               ================================================================ */}
            {appMode === "listening" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                      Section 1 • Lab Listening Interaktif
                    </span>
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                      Lab Listening Short Dialogues &amp; Idioms
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {[0.85, 1.0, 1.15].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setListenSpeed(spd)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-extrabold ${
                            listenSpeed === spd ? "bg-[#1E3A8A] text-white" : "text-slate-600"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setListenPracticeMode((m) => !m)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border ${
                        listenPracticeMode
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}
                    >
                      {listenPracticeMode ? "Mode Latihan (Bisa Ulang)" : "Mode Ujian (1x Putar)"}
                    </button>
                  </div>
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
                        idx === listenIndex ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {(() => {
                  const item = LISTENING_LAB_ITEMS[listenIndex];
                  const ans = listenAnswers[item.id];
                  const locked = !listenPracticeMode && Boolean(playedAudioIds[item.id]);
                  return (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-amber-300">{item.skill}</span>
                          <button
                            type="button"
                            onClick={() => setShowListenScript((s) => !s)}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
                          >
                            {showListenScript ? "Sembunyikan Transkrip" : "Lihat Transkrip"}
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button
                            type="button"
                            disabled={locked}
                            onClick={() =>
                              handlePlayAudio(
                                item.id,
                                `Man: ${item.manLine}. Woman: ${item.womanLine}. Question: ${item.narratorQuestion}`,
                                !listenPracticeMode,
                                listenSpeed
                              )
                            }
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold ${
                              locked ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
                            }`}
                          >
                            <Headphones className="w-4 h-4" />
                            <span>
                              {locked
                                ? "Audio Telah Diputar (Mode Ujian 1x)"
                                : `Putar Audio (${listenSpeed}x)`}
                            </span>
                          </button>
                          <span className="text-xs text-slate-400">
                            {listenPracticeMode
                              ? "Mode Latihan aktif: kamu bebas mengulang audio dan mengatur kecepatan."
                              : "Mode Ujian Asli aktif: audio hanya diputar 1 kali."}
                          </span>
                        </div>

                        {showListenScript && (
                          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1 text-slate-200">
                            <div><strong className="text-sky-300">Man:</strong> {item.manLine}</div>
                            <div><strong className="text-amber-300">Woman:</strong> {item.womanLine}</div>
                            <div className="pt-1 text-emerald-300 font-bold">Narrator: {item.narratorQuestion}</div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {item.options.map((opt) => {
                          const isPicked = ans?.key === opt.key;
                          const isRight = opt.key === item.correctKey;
                          let cls = "bg-white border-slate-200 hover:border-[#1E3A8A] text-slate-800";
                          if (ans) {
                            if (isRight) cls = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                            else if (isPicked) cls = "bg-rose-50 border-rose-400 text-rose-950";
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
                          <div className="font-extrabold">{ans.ok ? "Tepat Sekali!" : `Kunci Jawaban: ${item.correctKey}`}</div>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ================================================================
                MODE 6: ERROR LOG, FLASHCARDS & ACADEMIC WORD LIST (AWL 550+)
               ================================================================ */}
            {appMode === "vault" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "errorlog", label: `Error Log & Review (${bookmarkedIds.length})` },
                    { id: "flashcards", label: "Flashcards Rumus Cepat" },
                    { id: "awl", label: "Academic Word List (AWL 550+)" }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setVaultSubTab(st.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                        vaultSubTab === st.id
                          ? "bg-[#1E3A8A] text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {vaultSubTab === "errorlog" && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BookmarkCheck className="w-5 h-5 text-amber-600" />
                        <h3 className="text-base font-extrabold text-slate-900">Error Log &amp; Soal Tersimpan ({bookmarkedIds.length})</h3>
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
                        Belum ada soal di Error Log. Soal yang kamu jawab salah di Silabus atau Diagnostic Test akan otomatis muncul di sini untuk diulang!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {bookmarkedIds.map((bId) => {
                          const q = allQuestionsMap[bId];
                          if (!q) return null;
                          return (
                            <div key={bId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-extrabold text-[#1E3A8A]">
                                  {q.topicCode} • {q.skillTag}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleBookmark(bId)}
                                  className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg hover:bg-emerald-200"
                                >
                                  Sudah Paham ✓
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900">{q.prompt}</p>
                              <div className="text-xs text-emerald-800 font-bold">
                                Kunci: {q.correctKey} — {q.formula}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {vaultSubTab === "flashcards" && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-slate-900">Flashcards Rumus Wajib TOEFL ITP</h2>
                      <span className="text-xs font-bold text-slate-500">
                        Kartu {flashcardIndex + 1} / {GRAMMAR_FLASHCARDS.length}
                      </span>
                    </div>
                    {(() => {
                      const card = GRAMMAR_FLASHCARDS[flashcardIndex];
                      return (
                        <div
                          onClick={() => setFlashcardFlipped((f) => !f)}
                          className="cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-[#1E3A8A]/20 bg-gradient-to-br from-slate-900 to-[#1E3A8A] text-white min-h-[180px] flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                            <span>{card.category}</span>
                            <span>{flashcardFlipped ? "SISI JAWABAN" : "KLIK UNTUK BALIK"}</span>
                          </div>
                          <div className="py-4 text-center text-sm sm:text-lg font-extrabold whitespace-pre-line leading-relaxed">
                            {flashcardFlipped ? card.back : card.front}
                          </div>
                          <div className="text-center text-[11px] text-blue-200">
                            Ketuk kartu untuk melihat {flashcardFlipped ? "pertanyaan" : "rumusnya"}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setFlashcardFlipped(false);
                          setFlashcardIndex((i) => (i === 0 ? GRAMMAR_FLASHCARDS.length - 1 : i - 1));
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlashcardFlipped(false);
                          setFlashcardIndex((i) => (i + 1) % GRAMMAR_FLASHCARDS.length);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900"
                      >
                        Berikutnya →
                      </button>
                    </div>
                  </div>
                )}

                {vaultSubTab === "awl" && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Academic Word List (AWL 550+)</h2>
                        <p className="text-xs text-slate-500">Kosakata akademik favorit soal Vocabulary in Context Reading TOEFL.</p>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={awlSearch}
                          onChange={(e) => setAwlSearch(e.target.value)}
                          placeholder="Cari kosakata / sinonim..."
                          className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1E3A8A] w-56"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredAwl.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-[#1E3A8A]">{item.word}</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
                              {item.idMeaning}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-emerald-700">Sinonim TOEFL: {item.synonym}</p>
                          <p className="text-xs text-slate-600 italic">“{item.example}”</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT WORKSPACE: AI DOSEN PROF. ARYA (COLLAPSIBLE ON DESKTOP) */}
          {showDosenPanel && (
            <aside className="lg:col-span-4 space-y-4 sm:space-y-5 lg:sticky lg:top-32">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">AI Dosen Pembimbing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowVoiceSettings((prev) => !prev)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
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
                        isMuted ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#1E3A8A]" />}
                      <span>{isMuted ? "Muted" : "ON"}</span>
                    </button>
                  </div>
                </div>

                {showVoiceSettings && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>Bahasa:</span>
                      </span>
                      <select
                        value={voiceMode}
                        onChange={(e) => setVoiceMode(e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                      >
                        <option value="auto">Otomatis (ID ↔ EN)</option>
                        <option value="id-ID">Bahasa Indonesia</option>
                        <option value="en-US">English (US)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Kecepatan Bicara</span>
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

                <div className="flex flex-col items-center text-center pt-1">
                  <LecturerAvatar state={avatarState} isMuted={isMuted} activeLang={activeVoiceLang} />
                  <div className="mt-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Prof. Arya Pratama, M.Ed.</h3>
                    <p className="text-[11px] text-slate-500">Penutur Bilingual Otomatis (ID &amp; EN)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Live Subtitle ({activeVoiceLang})
                    </span>
                    {avatarState === "speaking" && (
                      <button type="button" onClick={stopSpeaking} className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300">
                        <Square className="w-2.5 h-2.5 fill-current" /> Stop
                      </button>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">{liveSubtitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const summary = `${currentTopic.title}. ${currentTopic.paragraphs.map((p) => p.voiceText).join(" ")}`;
                      speakText(summary);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Jelaskan Topik</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      speakText("Remember the golden rule of TOEFL structure: always identify the true subject and main verb first, and ignore distracting prepositional phrases.")
                    }
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Tips English</span>
                  </button>
                </div>
              </div>

              {/* INTERACTIVE Q&A CHAT */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="text-xs font-extrabold text-slate-800">Tanya Dosen (ID / EN Otomatis)</span>
                </div>

                <div className="p-3.5 h-48 overflow-y-auto space-y-2.5 bg-white">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[88%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-[#1E3A8A] text-white rounded-br-sm"
                            : "bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isSendingChat && <div className="text-[11px] text-slate-400 italic">Prof. Arya sedang menyusun penjelasan...</div>}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={(e) => handleSendChat(e)} className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-2 rounded-xl border shrink-0 ${
                      isListeningMic ? "bg-rose-600 text-white border-rose-700 animate-pulse" : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanya Gerund, Passive, Inversion..."
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                  <button type="submit" disabled={!chatInput.trim() || isSendingChat} className="p-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-40 text-white shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
