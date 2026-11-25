# 🎓 TOEFL 550 Academy

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://toefl-550-academy.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**TOEFL 550 Academy** adalah aplikasi web persiapan **TOEFL ITP Level 1** interaktif yang dirancang untuk membantu pengguna menembus skor **550+**. Dilengkapi dengan **18 Modul Silabus Terstruktur**, **1.000+ Bank Soal**, **Simulasi Real TOEFL ITP (140 Soal • 115 Menit)**, **Lab Listening**, **Arena Mini-Games**, serta **Lecturer TOEFL AI (Auto Code-Switching ID ↔ EN)**.

🔗 **Coba langsung di sini:** [https://toefl-550-academy.vercel.app](https://toefl-550-academy.vercel.app)

---

## ✨ Fitur Utama

### 1. 📚 Silabus Lengkap 18 Modul + Materi Interaktif
Materi disusun bertahap dari dasar hingga jebakan skor 550+ dengan filter *Structure*, *Listening*, dan *Reading*:
* **Latihan "Coret & Sorot" Interaktif:** Pengguna dapat mengklik frasa jebakan (*Prepositional Phrase*, *Appositive*, *Negative Inversion Trigger*) agar langsung tercoret dan melihat warna *True Subject* serta *Main Verb*.
* **Kotak Jebakan Umum (❌ Salah vs. ✅ Benar):** Perbandingan langsung kesalahan klasik TOEFL beserta alasan singkatnya.
* **Latihan Soal Per Topik (5 atau 10 Soal):** Fokus pada skill modul terkait, lengkap dengan bedah semua opsi pengecoh (A–D) dan tombol tanya opsi salah ke *Lecturer TOEFL AI*.
* **Split-Screen Reading + Sorot Bukti:** Teks bacaan akademik bernomor baris tampil di sisi kiri dan soal di sisi kanan, dilengkapi tombol **Sorot Bukti di Teks**.

### 2. 🎯 Mini Diagnostic Test (9 Soal)
Tes cepat untuk memetakan estimasi skor awal pengguna secara objektif dan langsung menghasilkan **rekomendasi modul prioritas** sesuai kelemahan masing-masing.

### 3. ⏱️ Simulasi Real TOEFL ITP Level 1 (Skor Resmi 310–677)
Menyerupai format, urutan seksi, aturan, dan konversi skor TOEFL ITP asli:
* **Full Real ITP (140 Soal • 115 Menit):**
  * *Section 1 — Listening Comprehension:* 50 Soal • 35 Menit (Part A Short Dialogues, Part B Long Conversations, Part C Academic Talks, audio 1x putar).
  * *Section 2 — Structure & Written Expression:* 40 Soal • 25 Menit (Part A No. 1–15 & Part B *Error Recognition* No. 16–40).
  * *Section 3 — Reading Comprehension:* 50 Soal • 55 Menit (5 Teks Akademik Utuh dalam tampilan *Split-Screen*).
* **Mini ITP (35 Soal • 30 Menit):** Versi ringkas dengan alur 3 seksi yang sama.
* **Official-Style Score Report:** Konversi skor tiap seksi (31–68 / 31–67), total skor (310–677), serta pemetaan **CEFR Level (A2, B1, B2, C1)**.

### 4. 🎧 Lab Listening Interaktif
* Pengatur kecepatan audio (`0.85x`, `1.0x`, `1.15x`) berbasis Web Speech API.
* Pilihan **Mode Latihan (Bisa Ulang Audio)** vs **Mode Ujian Asli (1x Putar)** serta tombol buka-tutup transkrip.

### 5. 👨‍🏫 Lecturer TOEFL AI (Mentor Virtual Bilingual)
* **Avatar SVG Animasi** dengan status visual (*Siap Mengajar, Berbicara, Menganalisis, Hebat*).
* **Humanizer & Natural Code-Switching (ID ↔ EN):** Menyesuaikan bahasa secara otomatis — full English jika user bertanya dalam bahasa Inggris, atau campuran Indonesia–Inggris yang luwes dengan istilah TOEFL akurat jika user bertanya bilingual/Indonesia.
* **Penutur Bilingual Otomatis (ID ↔ EN)** dan *Live Subtitle*.
* **Tanya Lecturer TOEFL AI via Teks & Suara (Mic):** Didukung server API route (`/api/lecturer`) terintegrasi **Gemini API** (opsional) dengan *smart bilingual offline fallback* agar tetap responsif tanpa API Key.
* **Mode Fokus Baca:** Panel Lecturer TOEFL AI dapat dibuka-tutup di desktop agar ruang baca materi lebih lega.

### 6. 🎮 Arena Mini-Games, Error Log, Flashcards & AWL 550+
* **Speed Trap Hunter (60 Detik)** & **Context Vocab Duel (Combo Streak)** + Lencana Pencapaian (*Badges*).
* **Error Log Otomatis:** Setiap jawaban salah tersimpan otomatis di `localStorage` perangkat agar mudah diulang.
* **Flashcards Rumus Wajib** & **Academic Word List (AWL 550+)** dengan kotak pencarian.
* **PWA Ready & Sertifikat Kesiapan:** Dapat dipasang ke layar utama HP/Desktop dan mencetak/menyimpan Sertifikat Kesiapan 550+ dalam format PDF.

---

## 🗺️ Peta Kurikulum (18 Modul)

| Level | Jumlah Modul | Cakupan Materi Utama |
| :--- | :---: | :--- |
| **1. Basic** | 8 Modul | S-V Agreement, Prepositional Phrases, Appositives, Singular/Plural, Countable/Uncountable, Articles (A/An/The), Pronouns, Tenses, Participles, Listening Last Line & Who/What/Where, Reading Main Idea & Pronoun Referents |
| **2. Intermediate** | 6 Modul | Passive Voice, Gerund vs. Infinitive, Adjective/Noun Clauses, Parallelism, Double Comparative, Listening Passives/Negatives/Wishes/Agreement, Reading Unstated Details (NOT/EXCEPT) & Vocab in Context |
| **3. Advance 550+** | 4 Modul | Reduced Clauses, Negative & Conditional Inversion, Word Forms, Confusing Verbs (Rise/Raise, Lie/Lay), Listening Part B & C Academic Talks, Reading Inference, Tone & Purpose |

---

## 📂 Struktur Proyek

```text
toefl-550-academy/
├── public/                 # Aset statis & ikon PWA
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── lecturer/
│   │   │       └── route.js # API Route Lecturer TOEFL AI (Gemini + Fallback)
│   │   ├── layout.js       # Root layout & metadata Next.js
│   │   ├── globals.css     # Konfigurasi Tailwind CSS
│   │   ├── page.js         # UI utama, state, simulasi ITP, voice engine & Lecturer TOEFL AI
│   │   └── toeflData.js    # 18 Modul kurikulum, 1.000+ bank soal, AWL & konversi skor ITP
│   └── lib/
│       └── lecturerAI.js   # System prompt, deteksi bahasa/code-switching & fallback engine
├── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/adrianindeed-hash/toefl-550-academy.git
   cd toefl-550-academy
   ```

2. **Pasang dependensi:**
   ```bash
   npm install
   ```

3. **(Opsional) Aktifkan Lecturer TOEFL AI dengan Gemini API:**
   Buat file `.env.local` di root proyek lalu tambahkan API Key kamu. *(Jika dilewati, aplikasi tetap berjalan lancar menggunakan mesin jawaban bilingual offline bawaan).*
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Catatan: `NEXT_PUBLIC_GEMINI_API_KEY` juga tetap didukung untuk kompatibilitas backward).*

4. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## ☁️ Deployment

Proyek ini di-deploy otomatis menggunakan **Vercel** setiap kali ada *push* ke branch `main`. Jika ingin menambahkan `GEMINI_API_KEY`, cukup masukkan di menu **Project Settings → Environment Variables** di dashboard Vercel.

---

Dibuat untuk membantu para pejuang beasiswa dan karier meraih skor **TOEFL ITP 550+** 🚀
