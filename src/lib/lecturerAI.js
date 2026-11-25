export const LECTURER_NAME = "Lecturer TOEFL AI";

const ID_STRONG_WORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "adalah", "ini", "itu",
  "tidak", "tak", "nggak", "gak", "ga", "enggak", "bukan", "jika", "kalau", "kalo",
  "maka", "karena", "karna", "sehingga", "pada", "dalam", "atau", "oleh", "saat",
  "ketika", "seperti", "harus", "wajib", "jangan", "selalu", "bisa", "dapat",
  "sudah", "udah", "belum", "lagi", "masih", "saja", "aja", "juga", "tapi", "tetapi",
  "namun", "biar", "supaya", "agar", "buat", "pake", "pakai", "jadi", "mau", "ingin",
  "kenapa", "mengapa", "gimana", "bagaimana", "apa", "apakah", "siapa", "mana",
  "berapa", "kapan", "dimana", "bedanya", "beda", "sama", "mirip", "maksudnya",
  "artinya", "arti", "contoh", "contohnya", "jelasin", "jelaskan", "tolong", "coba",
  "kasih", "beri", "tanya", "soal", "opsi", "jawaban", "benar", "salah", "rumus",
  "jebakan", "materi", "kalimat", "kata", "subjek", "kerja", "benda", "tunggal",
  "jamak", "pasif", "aktif", "hitung", "bacaan", "teks", "suara", "skor", "nilai",
  "aku", "saya", "gue", "gw", "kamu", "kak", "min", "bang", "mas", "mbak", "bro",
  "dong", "sih", "nih", "deh", "ya", "yah", "yuk", "banget", "bingung", "susah",
  "gampang", "cepat", "cepet", "cara", "tipsnya", "triknya", "bagian", "tentang",
  "menurut", "paling", "sering", "muncul", "keluar", "ujian", "latihan", "naik"
]);

const EN_GENERAL_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "what", "why", "how", "when", "where", "which", "who", "whose", "whom",
  "do", "does", "did", "don't", "doesn't", "didn't", "can", "can't", "could",
  "would", "should", "will", "won't", "may", "might", "must",
  "have", "has", "had", "haven't", "hasn't", "isn't", "aren't", "wasn't", "weren't",
  "i", "i'm", "you", "you're", "we", "they", "he", "she", "it", "it's", "that's",
  "what's", "how's", "why's", "there's", "my", "your", "our", "their", "this",
  "that", "these", "those", "here", "there", "not", "no", "yes",
  "of", "to", "in", "on", "at", "for", "from", "with", "about", "into", "between",
  "after", "before", "because", "although", "though", "while", "if", "unless",
  "than", "more", "most", "less", "much", "many", "some", "any", "all", "each",
  "explain", "difference", "different", "example", "examples", "sentence", "sentences",
  "use", "used", "using", "mean", "means", "meaning", "correct", "wrong", "incorrect",
  "answer", "answers", "option", "options", "choice", "choices", "question", "questions",
  "help", "please", "tell", "show", "give", "another", "again", "understand",
  "confused", "confusing", "tricky", "trap", "traps", "rule", "rules", "tip", "tips",
  "trick", "tricks", "strategy", "strategies", "improve", "score", "study", "spot",
  "identify", "find", "choose", "pick", "avoid", "mistake", "mistakes", "thanks", "thank",
  "hi", "hello", "hey", "got", "sure", "quick", "short", "simple"
]);

const TOEFL_TECH_TERMS = new Set([
  "toefl", "itp", "grammar", "structure", "reading", "listening", "vocab", "vocabulary",
  "gerund", "infinitive", "passive", "active", "inversion", "clause", "clauses",
  "reduced", "appositive", "appositives", "preposition", "prepositional", "phrase",
  "countable", "uncountable", "singular", "plural", "article", "articles", "pronoun",
  "pronouns", "tense", "tenses", "participle", "participles", "parallelism", "parallel",
  "comparative", "superlative", "conditional", "subjunctive", "subject", "verb", "verbs",
  "auxiliary", "modal", "modifier", "object", "connector", "conjunction", "noun", "nouns",
  "adjective", "adverb", "idiom", "idioms", "inference", "main", "idea", "detail",
  "unstated", "referent", "tone", "purpose", "passage", "dialogue", "distractor", "word",
  "forms", "rise", "raise", "lie", "lay"
]);

/**
 * Detect user language mode for adaptive response & natural code-switching:
 * - "en": Full / predominantly English prompt
 * - "id-mixed": Bilingual Indonesian + English mix (typical Indonesian TOEFL learner)
 * - "id": Predominantly Indonesian prompt
 */
export function detectPromptLanguageStyle(text) {
  const clean = String(text || "").toLowerCase().trim();
  if (!clean) return "id-mixed";

  const tokens = clean.match(/[a-z']+/g) || [];
  if (tokens.length === 0) return "id-mixed";

  let idHits = 0;
  let enGeneralHits = 0;
  let toeflTermHits = 0;

  for (const tok of tokens) {
    if (ID_STRONG_WORDS.has(tok)) idHits += 1;
    if (EN_GENERAL_WORDS.has(tok)) enGeneralHits += 1;
    if (TOEFL_TECH_TERMS.has(tok)) toeflTermHits += 1;
  }

  // Clear full English: English function/general words present and no Indonesian markers
  if (idHits === 0 && enGeneralHits >= 1) {
    return "en";
  }

  // Indonesian mixed with English phrases or TOEFL terminology
  if (idHits > 0 && (enGeneralHits >= 1 || toeflTermHits >= 1)) {
    return "id-mixed";
  }

  // Pure Indonesian
  if (idHits > 0) {
    return "id";
  }

  // Single/short TOEFL keyword without Indonesian or English grammar words (e.g. "inversion", "gerund")
  if (toeflTermHits > 0 && tokens.length <= 3) {
    return "id-mixed";
  }

  // Longer text with no Indonesian markers defaults to English
  if (tokens.length >= 4 && idHits === 0) {
    return "en";
  }

  return "id-mixed";
}

/**
 * Strip heavy markdown formatting so replies look clean in chat bubbles
 * AND sound natural when spoken via Web Speech API.
 */
export function sanitizeLecturerOutput(rawText) {
  if (!rawText || typeof rawText !== "string") return "";
  return rawText
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim())
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Build the upgraded system prompt for Lecturer TOEFL AI.
 */
export function buildLecturerSystemPrompt({ languageStyle, currentTopic, activeQuestion }) {
  const languageDirective =
    languageStyle === "en"
      ? `LANGUAGE MODE: FULL ENGLISH.
The user asked in English. Reply completely in natural, fluent, conversational English like a friendly yet sharp TOEFL ITP coach. Do NOT switch to Indonesian unless the user asks for a translation.`
      : languageStyle === "id-mixed"
      ? `LANGUAGE MODE: NATURAL INDONESIAN-ENGLISH CODE-SWITCHING.
The user writes in Indonesian mixed with English (typical bilingual Indonesian TOEFL learner). Reply in smooth, natural Indonesian-English code-switching—luwes, santai tapi tetap akademis. Keep TOEFL technical terms (e.g., True Subject, Main Verb, Prepositional Phrase, Appositive, Reduced Clause, Inversion, Distractor, Inference) and all example sentences in accurate English.`
      : `LANGUAGE MODE: CONVERSATIONAL INDONESIAN (WITH ACCURATE ENGLISH TOEFL TERMS).
The user asked in Indonesian. Reply in natural, warm, conversational Indonesian (sapaan "kamu", tidak kaku seperti buku teks). Keep standard TOEFL technical terms and real example sentences in accurate English so the learner gets used to authentic test patterns.`;

  const topicBlock = currentTopic
    ? `CURRENT MODULE CONTEXT:
- Module: ${currentTopic.code ? `${currentTopic.code} — ` : ""}${currentTopic.title}
- Level / Section: ${currentTopic.level || "TOEFL ITP"} / ${currentTopic.section || "General"}`
    : `CURRENT MODULE CONTEXT: General TOEFL ITP 550+ Preparation.`;

  const questionBlock = activeQuestion
    ? `ACTIVE PRACTICE QUESTION:
- Skill: ${activeQuestion.skillTag || "TOEFL ITP"}
- Prompt: "${activeQuestion.prompt}"
${
  Array.isArray(activeQuestion.options)
    ? `- Options: ${activeQuestion.options.map((o) => `${o.key}. ${o.text}`).join(" | ")}`
    : ""
}
- Correct Key: ${activeQuestion.correctKey}
${activeQuestion.formula ? `- Core Rule: ${activeQuestion.formula}` : ""}`
    : "";

  return `You are "${LECTURER_NAME}", a supportive, sharp, and approachable virtual TOEFL ITP mentor specializing in helping learners break the 550+ score barrier.

CORE PERSONA & HUMANIZER STYLE:
1. Sound like a real human TOEFL mentor chatting with a student—warm, encouraging, clear, and genuinely helpful, never stiff, bureaucratic, or robotic.
2. Go straight to the core point. NEVER use repetitive robotic openers like "Pertanyaan yang sangat bagus!", "Halo! Tentu saja saya siap membantu...", "Great question!", or "Certainly!".
3. NEVER use repetitive template closings like "Semoga membantu! Jika ada pertanyaan lain jangan ragu bertanya ya!" or "I hope this helps! Feel free to ask more questions!". Only add a brief contextual follow-up prompt occasionally when it naturally fits the flow.
4. Keep explanations concise and scannable (2 to 3 short paragraphs max). Focus directly on the grammar/reading/listening trap, why it works, and how to spot it fast during the test.
5. Always include at least one concrete, realistic English example sentence (and a quick Wrong vs. Right contrast when explaining grammar traps).
6. Output clean plain text without heavy markdown symbols (no **, no ###, no code fences) so your reply reads cleanly in chat and sounds natural when read aloud by text-to-speech.

${languageDirective}

${topicBlock}
${questionBlock}`.trim();
}

function extractMentionedOptionKey(questionText) {
  const match = String(questionText || "").match(/\b(?:opsi|pilihan|jawaban|option|choice)\s*([a-d])\b/i);
  if (match) return match[1].toUpperCase();
  const shortMatch = String(questionText || "").match(/\b(?:bukan|not|kenapa|why)\s+([a-d])\b/i);
  return shortMatch ? shortMatch[1].toUpperCase() : null;
}

/**
 * Upgraded smart offline fallback engine with full English & Indonesian-English code-switching support.
 * Used when GEMINI_API_KEY is not configured or when offline/network fails.
 */
export function generateSmartFallbackReply(
  userQuestion,
  currentTopic = null,
  activeQuestion = null,
  forcedStyle = null
) {
  const raw = String(userQuestion || "").trim();
  const q = raw.toLowerCase();
  const style = forcedStyle || detectPromptLanguageStyle(raw);
  const isEn = style === "en";

  // 1. Active question option inquiry ("kenapa bukan opsi B?" / "why not B?")
  if (activeQuestion) {
    const optKey = extractMentionedOptionKey(raw);
    if (optKey && activeQuestion.optionAnalysis?.[optKey]) {
      const analysis = activeQuestion.optionAnalysis[optKey];
      if (isEn) {
        return `Look closely at option ${optKey} in this question: ${analysis} The correct key here is ${activeQuestion.correctKey}${
          activeQuestion.formula ? ` (${activeQuestion.formula})` : ""
        }.`;
      }
      return `Coba cek opsi ${optKey} di soal ini: ${analysis} Kunci yang tepat itu ${activeQuestion.correctKey}${
        activeQuestion.formula ? ` — intinya: ${activeQuestion.formula}` : ""
      }.`;
    }
  }

  // 2. Subject-Verb Agreement, Prepositional Phrase & Appositive
  if (
    q.includes("subject") ||
    q.includes("subjek") ||
    q.includes("preposition") ||
    q.includes("preposisi") ||
    q.includes("appositive") ||
    q.includes("agreement") ||
    q.includes("s-v")
  ) {
    if (isEn) {
      return `In TOEFL Structure, the favorite trap is hiding the True Subject behind a Prepositional Phrase (of, in, on, with, among) or an Appositive between commas. Cross those distractors out first, then match the Main Verb directly to the True Subject.\n\nExample: "The collection of rare manuscripts in the library is valuable." (Wrong: "are", because the True Subject is singular "The collection", not "manuscripts").`;
    }
    return `Di TOEFL Structure, jebakan paling klasik itu menyembunyikan True Subject pakai Prepositional Phrase (of, in, on, with) atau Appositive di antara dua koma. Trik cepatnya: coret dulu frasa penyela itu, baru cocokkan Main Verb dengan True Subject-nya.\n\nContoh: "The collection of rare manuscripts is valuable." (Salah kalau pakai "are", karena True Subject-nya "The collection" yang singular, bukan "manuscripts").`;
  }

  // 3. Gerund vs Infinitive
  if (q.includes("gerund") || q.includes("infinitive") || q.includes("v-ing") || q.includes("ving")) {
    if (isEn) {
      return `Two quick rules solve almost every Gerund vs. Infinitive question in TOEFL: any verb right after a preposition must be a Gerund (V-ing)—including tricky phrases ending in "to" like "look forward to", "be accustomed to", and "object to". Also memorize high-frequency Gerund verbs like enjoy, avoid, consider, suggest, and recommend.\n\nExample: "She is accustomed to working under tight deadlines." (Wrong: "to work").`;
    }
    return `Kunci cepat Gerund vs. Infinitive di TOEFL ada dua: pertama, setiap verb setelah preposition wajib pakai V-ing (termasuk frasa jebakan berakhiran "to" seperti look forward to, be accustomed to, dan contribute to). Kedua, kata kerja seperti enjoy, avoid, consider, suggest, dan recommend selalu diikuti V-ing.\n\nContoh: "The team is accustomed to analyzing complex data." (Salah: "to analyze").`;
  }

  // 4. Passive Voice
  if (q.includes("passive") || q.includes("pasif") || q.includes("v3") || q.includes("past participle")) {
    if (isEn) {
      return `Use Passive Voice ([be] + V3) when the subject receives the action—especially inanimate subjects or when "by + agent" appears after the verb. Watch out for missing "be" or active V-ing where a passive meaning is needed.\n\nExample: "The ancient bridge was constructed in 1890." (Wrong: "The ancient bridge constructed in 1890", because a bridge cannot build itself).`;
    }
    return `Pola Passive Voice itu wajib lengkap: [be: is/am/are/was/were/been/be] + V3. Ciri gampangnya, cek apakah subjeknya benda mati yang dikenai aksi atau ada petunjuk "by + pelaku" setelah verb.\n\nContoh: "The solar observatory was built in 1995." (Salah kalau cuma "built" tanpa "was", karena observatorium tidak membangun dirinya sendiri).`;
  }

  // 5. Countable vs Uncountable Nouns & Singular/Plural
  if (
    q.includes("countable") ||
    q.includes("uncountable") ||
    q.includes("information") ||
    q.includes("singular") ||
    q.includes("plural") ||
    q.includes("jamak") ||
    q.includes("tunggal")
  ) {
    if (isEn) {
      return `TOEFL loves testing Uncountable Nouns that look plural in meaning: information, equipment, research, advice, evidence, and furniture. They NEVER take "-s" or "a/an", pair with "much / little / amount of", and always take a singular verb.\n\nExample: "Much new research has been published this year." (Wrong: "Many new researches have...").`;
    }
    return `TOEFL sering banget menjebak pakai Uncountable Nouns seperti information, equipment, research, advice, evidence, dan furniture. Kata-kata ini pantang ditambah "-s" atau "a/an", pasangannya much / little / amount of, dan verb-nya wajib singular.\n\nContoh: "Little reliable information is available on the site." (Salah: "Few reliable informations are...").`;
  }

  // 6. Articles (a, an, the)
  if (q.includes("article") || /\b(a|an|the)\b/.test(q) && (q.includes("pakai") || q.includes("beda") || q.includes("use") || q.includes("difference"))) {
    if (isEn) {
      return `Pick "a" or "an" strictly by pronunciation sound, not spelling! Use "a" before a consonant sound (a university, a European city) and "an" before a vowel sound (an hour, an honest answer). Use "the" when the noun is specific or unique.\n\nExample: "It took an hour to reach a university near the coast."`;
    }
    return `Memilih "a" atau "an" itu patokannya bunyi saat diucapkan, bukan huruf depannya. Pakai "a" untuk bunyi konsonan (a university, a European country — bunyi "yu"), dan pakai "an" untuk bunyi vokal (an hour, an honest leader — huruf H tidak dibaca).\n\nContoh: "She waited for an hour at a university campus."`;
  }

  // 7. Inversion (550+ key skill)
  if (
    q.includes("inversi") ||
    q.includes("inversion") ||
    q.includes("not only") ||
    q.includes("seldom") ||
    q.includes("rarely") ||
    q.includes("never") ||
    q.includes("had ")
  ) {
    if (isEn) {
      return `Inversion is a classic 550+ separator! Whenever a sentence starts with a negative expression (Not only, Never, Rarely, Seldom, Little, Hardly) or an omitted-if conditional (Had, Were, Should), flip the Auxiliary BEFORE the Subject.\n\nExample: "Not only did the experiment fail, but it also delayed the project." (Wrong: "Not only the experiment failed...").`;
    }
    return `Inversion ini salah satu pembeda utama buat tembus 550+. Kalau kalimat diawali ekspresi negatif (Not only, Never, Rarely, Seldom, Little) atau conditional tanpa "If" (Had, Were, Should), susunannya wajib dibalik jadi Auxiliary + Subject + Verb.\n\nContoh: "Rarely have scientists observed such a rapid shift." (Salah: "Rarely scientists have observed...").`;
  }

  // 8. Reduced Clauses & Participles
  if (q.includes("reduced") || q.includes("participle") || q.includes("clause") || q.includes("klausa")) {
    if (isEn) {
      return `In a Reduced Adjective Clause, you drop the connector (who/which/that) and "be", leaving V-ing for active meaning or V3 for passive meaning. Always check if the sentence ALREADY has a Main Verb so you do not accidentally create a double verb.\n\nExample: "The artifacts discovered in the cave date back to 500 BC." (Passive meaning -> V3 "discovered", while "date" is the Main Verb).`;
    }
    return `Di Reduced Adjective Clause, connector (who/which/that) + "be" dihapus, lalu tinggal V-ing (makna aktif: melakukan) atau V3 (makna pasif: dikenai). Cek dulu apakah kalimatnya sudah punya Main Verb supaya tidak kejebak double verb.\n\nContoh: "The report written by the committee outlines three reforms." ("written" itu bentuk pasif yang diringkas, Main Verb-nya "outlines").`;
  }

  // 9. Parallelism & Double Comparative
  if (q.includes("parallel") || q.includes("paralel") || q.includes("comparative") || q.includes("than") || q.includes("both")) {
    if (isEn) {
      return `For Parallelism, items joined by "and / or / but" or paired conjunctions (both...and, either...or, not only...but also) must match in grammatical form (noun with noun, gerund with gerund). For Double Comparatives, mirror both halves: "The + comparative..., the + comparative...".\n\nExample: "The higher the altitude, the thinner the air becomes."`;
    }
    return `Prinsip Parallelism itu sederhana: semua elemen yang dihubungkan "and / or / but" atau pasangan (both...and, neither...nor, not only...but also) harus setara jenis katanya. Untuk Double Comparative, polanya wajib kembar: "The + comparative..., the + comparative...".\n\nContoh: "The study focuses on collecting, analyzing, and interpreting climate data." (Semua pakai V-ing, bukan campur "to interpret").`;
  }

  // 10. Word Forms & Confusing Verbs
  if (q.includes("word form") || q.includes("rise") || q.includes("raise") || q.includes("lie") || q.includes("lay") || q.includes("adjective") || q.includes("adverb")) {
    if (isEn) {
      return `For Word Forms, check what the slot needs: adjectives modify nouns ("rapid growth"), while adverbs modify verbs, adjectives, or other adverbs ("grew rapidly"). For confusing verbs, remember object vs. no object: "raise / lay" need an object, while "rise / lie" do not.\n\nExample: "The sun rises in the east, while farmers raise crops."`;
    }
    return `Buat Word Forms, lihat posisi katanya: adjective menjelaskan noun ("rapid growth"), sedangkan adverb menjelaskan verb atau adjective ("grew rapidly"). Untuk confusing verbs, cek ada objek atau nggak: "raise / lay" butuh objek, sedangkan "rise / lie" tidak butuh objek.\n\nContoh: "Temperatures rise quickly in summer" (tanpa objek) vs. "The bank raised interest rates" (ada objek "interest rates").`;
  }

  // 11. Reading Comprehension
  if (
    q.includes("reading") ||
    q.includes("bacaan") ||
    q.includes("passage") ||
    q.includes("main idea") ||
    q.includes("ide pokok") ||
    q.includes("gagasan") ||
    q.includes("inference") ||
    q.includes("vocab") ||
    q.includes("not") ||
    q.includes("except")
  ) {
    if (isEn) {
      return `Don't read the whole passage word-for-word first—skim the first sentence of each paragraph to map the Main Idea, then scan keywords from each question. For NOT/EXCEPT questions, verify three true details in the text to isolate the one false or unmentioned option.\n\nExample tip: If a question asks "Which of the following is implied?", avoid extreme answers with words like "always", "never", or "only" unless the passage explicitly backs them up.`;
    }
    return `Di Reading TOEFL, jangan baca seluruh teks kata per kata dari awal. Skim kalimat pertama tiap paragraf buat menangkap Main Idea, lalu pakai kata kunci soal buat scan baris bukti. Khusus soal NOT/EXCEPT, eliminasi 3 opsi yang sesuai teks supaya ketemu 1 opsi yang salah atau tidak disebutkan.\n\nContoh taktik: Untuk soal Inference ("It can be inferred that..."), waspadai opsi yang terlalu ekstrem (seperti "always", "never", atau "completely") kalau tidak didukung bukti di teks.`;
  }

  // 12. Listening Comprehension
  if (
    q.includes("listening") ||
    q.includes("audio") ||
    q.includes("dialog") ||
    q.includes("speaker") ||
    q.includes("idiom") ||
    q.includes("wish") ||
    q.includes("dengar")
  ) {
    if (isEn) {
      return `In Listening Part A, lock your focus on the second speaker's line—the answer almost always paraphrases it using synonyms, while options repeating the exact same words are usually sound-alike traps.\n\nExample: If the second speaker says "I'm afraid the lecture is completely full", the right answer won't repeat "full"—it will paraphrase it as "There are no seats left for the talk."`;
    }
    return `Di Listening Part A, fokus utama kamu ada di ucapan pembicara kedua (last line). Jawaban benarnya hampir selalu berupa parafrase/sinonim, sedangkan opsi yang mengulang bunyi kata persis sama justru biasanya distractor.\n\nContoh: Kalau pembicara kedua bilang "I couldn't agree more", jawabannya bukan tentang tidak setuju—melainkan "The speaker strongly agrees" (double negative = makna positif kuat).`;
  }

  // 13. Strategy / Target 550+
  if (q.includes("550") || q.includes("strategi") || q.includes("strategy") || q.includes("skor") || q.includes("score") || q.includes("tips") || q.includes("belajar")) {
    if (isEn) {
      return `To break 550+ in TOEFL ITP, aim for roughly 55+ scaled per section—Structure is usually the fastest section to boost because its grammar patterns repeat predictably. Drill Subject-Verb traps, Reduced Clauses, Parallelism, and Inversion until you spot them in under 15 seconds.\n\nPractical routine: do 10 targeted Structure questions daily, review every miss in your Error Log, then run a timed Reading or Listening set.`;
    }
    return `Biar tembus 550+ di TOEFL ITP, target amanmu sekitar 55+ di tiap section—dan Structure biasanya paling cepat dinaikkan karena pola jebakannya selalu berulang. Fokus kuasai S-V Agreement, Reduced Clauses, Parallelism, dan Inversion sampai bisa deteksi polanya di bawah 15 detik.\n\nPola latihan efektif: kerjakan 10 soal Structure per hari, bedah semua salahmu di Error Log, lalu selingi 1 set Lab Listening atau Split-Screen Reading.`;
  }

  // 14. Topic-aware default response (using real rule & example from currentTopic when available)
  const firstPara = currentTopic?.paragraphs?.[0];
  const firstEx = firstPara?.examples?.[0];
  const topicTitle = currentTopic?.title || "TOEFL ITP 550+";

  if (isEn) {
    if (firstPara && firstEx) {
      return `For ${topicTitle}, the core rule to keep in mind is: ${firstPara.englishRule}.\n\nTake a look at this example: "${firstEx.en}" (${firstEx.highlight}). Tell me which part of this pattern feels tricky, or paste a sentence you want to break down together.`;
    }
    return `Let's tackle ${topicTitle} step by step. Always identify the True Subject and Main Verb first (or scan for the key clue in Reading/Listening) before checking options A–D.\n\nExample check: "The results of the long-term study indicate a clear trend." Drop a specific sentence or question here if you want to dissect it together.`;
  }

  if (firstPara && firstEx) {
    return `Untuk topik ${topicTitle}, patokan paling pentingnya ini: ${firstPara.englishRule}.\n\nLihat contoh kalimatnya: "${firstEx.en}" (${firstEx.highlight}). Kalau ada bagian yang masih bikin ragu atau kamu punya kalimat/soal tertentu yang bikin bingung, tulis aja di sini biar kita bedah bareng.`;
  }

  return `Untuk topik ${topicTitle}, biasakan cek pola intinya dulu—di Structure petakan True Subject dan Main Verb sebelum tergoda pengecoh, sedangkan di Reading/Listening cari kata kunci dan sinonimnya.\n\nContoh cepat: "The results of the experiment confirm the hypothesis." (True Subject: "The results" -> Verb plural "confirm"). Kalau ada kalimat atau opsi soal yang bikin bingung, langsung tempel aja di sini!`;
}
