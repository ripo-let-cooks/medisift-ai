# 💊 MediSift AI — Clinical Intelligence & Explainable AI Platform

<div align="center">

![MediSift AI Banner](https://img.shields.io/badge/MediSift%20AI-Clinical%20Intelligence-0D9488?style=for-the-badge)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash%203.x-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Security](https://img.shields.io/badge/API%20Security-Zero--Trust%20Proxy-success?style=flat-square)](./docs/superpowers/specs/2026-09-18-api-key-security-design.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Platform Explainable AI (XAI) untuk Analisis Risiko Farmasi, Keamanan Dosis, Legalitas BPOM, dan Deteksi Benturan Polifarmasi.**

[Fitur Utama](#-fitur-utama) • [Arsitektur Sistem](#-arsitektur--keamanan) • [Panduan Instalasi](#-cara-menjalankan-lokal) • [Panduan Deploy Vercel](#-panduan-deploy-ke-vercel) • [Dokumentasi](#-dokumentasi-proyek)

</div>

---

## 📌 Sekilas Masalah & Solusi

Lebih dari **70% masyarakat Indonesia melakukan swamedikasi (pengobatan mandiri)** tanpa pemahaman risiko dosis dan bahaya benturan zat aktif (*polypharmacy*). Chatbot AI biasa sering kali bersifat *"Black-Box"* dan rentan berhalusinasi.

**MediSift AI** hadir dengan pendekatan **Explainable AI (XAI)** medis terpadu:
- **Transparan & Akurat:** Menampilkan skor keyakinan (*confidence score*), logika klasifikasi medis, dan spektrum dosis aman secara visual.
- **Bahasa Ramah Awam:** Menerjemahkan istilah medis rumit ke bahasa sehari-hari (contoh: *"Diminum"* bukan *"Oral"*, *"Obat Bebas"* bukan *"OTC"*).
- **Anti-Plagiasi & Beretika:** Prompt anti-recitation ketat untuk mencegah kebocoran hak cipta teks mentah dari internet.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| 🔍 **Pencarian Cerdas & Intent Router** | Mendeteksi nama obat atau keluhan gejala. Jika pengguna mengeluhkan sakit (misal: "pusing dan demam"), sistem merekomendasikan obat yang aman secara instan. |
| 📷 **Pemindai Kemasan Visual (OCR)** | Pindai teks kemasan obat langsung dari kamera ponsel atau unggah foto dengan kompresi kanvas otomatis (*browser compression* < 250 KB). |
| 🛡️ **Tingkat Risiko Klinis (Risk Gauge)** | Speedometer visual Recharts 4-zona: *Rendah (Teal)*, *Sedang (Kuning)*, *Tinggi (Oranye)*, dan *Bahaya (Crimson)*. |
| 📊 **Spektrum Dosis Toleransi (DoseBarChart)** | Diagram batang interaktif: *Dosis Minimal* $\rightarrow$ *Anjuran Standar* $\rightarrow$ *Batas Maksimal* $\rightarrow$ *Ambang Toksisitas*. |
| 🏷️ **Kategori Legalitas BPOM** | Penanda legalitas medis resmi: *Obat Bebas (Hijau)*, *Obat Bebas Terbatas (Biru)*, *Obat Keras (Merah)*, dan *Suplemen (Kuning)*. |
| 💊 **Deteksi Polifarmasi (Multi-Drug Clash)** | Menganalisis konsumsi banyak obat sekaligus dan memetakan matriks interaksi silang (*[SAFE]*, *[MEDIUM]*, *[CRITICAL CLASH]*). |
| ⚡ **Respon Kilat 0ms (In-Memory Cache)** | Kueri yang pernah dicari disimpan di server cache RAM dan disajikan dalam **0 milidetik** tanpa membakar kuota API. |
| 🖨️ **Ekspor Laporan PDF Klinis** | Format cetak khusus (`@media print`) yang menghilangkan navigasi dan merapikan hasil diagnosa ke lembar PDF siap pakai. |
| 🕒 **Audit Log & Riwayat Lokal** | Riwayat tersimpan privat di browser pengguna (localStorage) dengan penanggalan lokal Indonesia (`id-ID`). |

---

## 🔒 Arsitektur & Keamanan API

MediSift AI menerapkan arsitektur **Zero-Trust Backend Proxy** untuk memastikan kunci API tidak pernah bocor ke tangan publik.

```mermaid
flowchart LR
    Browser[🌐 Browser Client] -->|POST /api/gemini\n(Tanpa API Key)| Proxy[🛡️ Serverless Proxy\napi/gemini.js]
    
    subgraph Proxy_Security [Keamanan Server & Anti-Limit]
        Proxy --> Cache{Server Cache?\n0ms}
        Cache -->|Hit| ResponInstan[⚡ Respon 0ms / 0 Kuota]
        Cache -->|Miss| KeyPool[🔄 Round-Robin Key Cursor]
        KeyPool --> ModelPool[🔁 5-Tier Resilient Engine\n3.5-flash ➔ 3.5-lite ➔ 3.7 ➔ 3.8 ➔ 3.6]
        ModelPool --> Cooldown[⏱️ Smart 60s Cooldown pada 429]
    end

    ModelPool -->|Kunci Rahasia di Server\nprocess.env.GEMINI_API_KEYS| GeminiAPI[☁️ Google Gemini API]
    GeminiAPI --> Proxy
    Proxy -->|JSON Terstruktur Valid| Browser
```

### Keunggulan Sistem Ketahanan Kuota:
1. **Kunci 100% Rahasia di Server:** Menggunakan variabel `GEMINI_API_KEYS` di `.env` (bebas dari injeksi bundle frontend `VITE_`).
2. **Rotasi 5 Lapis Model:** `gemini-3.5-flash` $\rightarrow$ `gemini-3.5-flash-lite` $\rightarrow$ `gemini-3.7-flash` $\rightarrow$ `gemini-3.8-flash` $\rightarrow$ `gemini-3.6-flash`.
3. **Jeda Otomatis Pintar (*Smart Cooldown*):** Jika satu model terkena batas kuota (429), model tersebut otomatis diistirahatkan selama 60 detik tanpa menggagalkan permintaan, dan sistem langsung mencoba model cadangan lainnya.
4. **Distribusi Beban Bergilir (*Round-Robin*):** Panggilan AI digilir seimbang ke semua kunci API yang didaftarkan.
5. **Opsi Kunci Darurat:** Jika kuota server habis saat live demo, pengguna/juri tetap dapat memasukkan kunci cadangan melalui kotak darurat di web.

---

## 💻 Tech Stack

- **Frontend Core:** React 19, JavaScript (ES Modules)
- **Tooling & Bundler:** Vite 8, PostCSS, Autoprefixer
- **Styling:** Tailwind CSS v4, Radix UI Primitives, Lucide React
- **Data Visualization:** Recharts v3
- **Motion & Physics:** Framer Motion v13
- **Serverless Backend:** Node.js HTTP & Vercel Serverless Function (`api/gemini.js`)
- **AI Engine:** Google Generative AI SDK (`@google/generative-ai`)
- **Code Linter:** Oxlint (Zero Lint Errors)

---

## 🚀 Cara Menjalankan Lokal

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/username/medisift-ai.git
cd "medisift-ai"
npm install
```

### 2. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka `.env` dan masukkan kunci API Gemini Anda (bisa memasukkan beberapa kunci sekaligus dipisahkan tanda koma untuk rotasi otomatis):
```env
GEMINI_API_KEYS="KUNCI_API_GEMINI_1,KUNCI_API_GEMINI_2,KUNCI_API_GEMINI_3"
```

> **Catatan:** Anda bisa mendapatkan kunci API gratis di [Google AI Studio](https://aistudio.google.com/).

### 3. Jalankan Aplikasi
```bash
npm run dev
```
Buka peramban di `http://localhost:5173`. Endpoint backend `/api/gemini` langsung aktif secara otomatis via middleware internal Vite.

### 4. Build untuk Produksi
```bash
npm run build
```

---

## ☁️ Panduan Deploy ke Vercel

Aplikasi ini sudah dirancang **100% Vercel Ready** (Serverless Function di folder `/api`).

1. Unggah kode ke repository GitHub Anda.
2. Masuk ke [Vercel Dashboard](https://vercel.com/) dan pilih **Add New Project** $\rightarrow$ Import repository Anda.
3. Pada bagian **Environment Variables**, tambahkan:
   - **Key:** `GEMINI_API_KEYS`
   - **Value:** *(Tempelkan daftar kunci API Anda yang dipisah koma)*
4. Klik **Deploy**. Selesai! Web Anda langsung aktif dengan perlindungan API Key penuh.

---

## 📂 Struktur Direktori Proyek

```text
├── api/
│   └── gemini.js                 # Serverless Backend Proxy (AI Engine, Cache, & Model Fallback)
├── docs/
│   └── superpowers/              # Dokumentasi Spesifikasi & Implementation Plan
├── src/
│   ├── components/
│   │   ├── classification/       # InputForm & Mode Selector
│   │   ├── governance/           # LegalModal, ReasonBreakdown, InteractionMatrix
│   │   ├── layout/               # Header, Footer, FloatingBackground
│   │   ├── ui/                   # Komponen Primitif (Button, Badge, Sonner Toast)
│   │   └── visualization/        # RiskGauge, DoseBarChart, MultiDrugMatrix, ScannerLoading
│   ├── hooks/
│   │   └── useHistoryManager.js  # Pengelola Audit Log Lokal
│   ├── lib/
│   │   └── gemini-client.js      # Frontend Client Penghubung ke /api/gemini
│   ├── App.jsx                   # Komponen Utama & Pengatur Alur Aplikasi
│   └── main.jsx                  # Entry Point React
├── .env                          # Konfigurasi Rahasia Server (diabaikan oleh git)
├── .env.example                  # Contoh Konfigurasi Lingkungan
├── DESIGN.md                     # Spesifikasi Lengkap Sistem Desain & Visual
├── prd.md                        # Product Requirement Document (PRD) Lengkap
├── vite.config.js                # Konfigurasi Vite & Dev Middleware Serverless
└── package.json                  # Konfigurasi Dependensi & Skrip Proyek
```

---

## 📑 Dokumentasi Proyek

- 🎨 **[DESIGN.md](./DESIGN.md)** — Panduan Sistem Desain, Palet Warna Klinis, dan Tata Kelola Komponen.
- 📋 **[prd.md](./prd.md)** — Product Requirement Document (PRD) Lengkap, Alur Pengguna, dan Metrik Keberhasilan.
- 🛡️ **[Spesifikasi Keamanan API](./docs/superpowers/specs/2026-09-18-api-key-security-design.md)** — Rincian Arsitektur Pengamanan API Key dan Proxy Serverless.

---

## ⚖️ Disclaimer Medis (Medical Disclaimer)

> **PERINGATAN KESEHATAN:**  
> MediSift AI merupakan alat bantu peraga berbasis *Explainable AI* yang menyajikan analitik data farmakologis prediktif. **Platform ini BUKAN pengganti saran, diagnosis, pemeriksaan, atau resep dari dokter maupun apoteker profesional.** Segala keputusan medis mandiri tetap menjadi tanggung jawab pengguna. Konsultasikan selalu dengan tenaga medis sebelum mengonsumsi obat-obatan.

---

<div align="center">
  <sub>Dibuat dengan ❤️ untuk Inovasi Kesehatan & AI Governance yang Lebih Baik.</sub>
</div>
