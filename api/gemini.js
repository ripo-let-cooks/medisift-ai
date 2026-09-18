import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Helper untuk mengirim respon JSON yang kompatibel dengan Vercel maupun Node HTTP murni
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// 1. In-Memory Server Cache (Hemat Kuota hingga 80%+)
const SERVER_CACHE = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 jam

function getCacheKey(action, payload) {
  if (!payload) return `${action}`;
  if (action === 'ANALYZE') {
    const textPart = (payload.text || '').toLowerCase().trim();
    const imgPart = payload.base64Image ? payload.base64Image.length : 'noimg';
    return `ANALYZE:${textPart}:${imgPart}`;
  }
  if (action === 'SUGGEST') {
    return `SUGGEST:${(payload.symptoms || '').toLowerCase().trim()}`;
  }
  if (action === 'POLYPHARMACY') {
    return `POLYPHARMACY:${(payload.drugListString || '').toLowerCase().trim()}`;
  }
  return `${action}:${JSON.stringify(payload)}`;
}

// 2. Cooldown tracker untuk model/key yang sedang terkena limit (429) atau sibuk (503)
const COOLDOWNS = new Map();

function isModelCoolingDown(keyIndex, modelName) {
  const id = `${keyIndex}_${modelName}`;
  const expiry = COOLDOWNS.get(id);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    COOLDOWNS.delete(id);
    return false;
  }
  return true;
}

function setModelCooldown(keyIndex, modelName, durationMs) {
  const id = `${keyIndex}_${modelName}`;
  COOLDOWNS.set(id, Date.now() + durationMs);
}

// 3. Round-Robin Key Cursor untuk membagi beban merata ke semua API Key
let globalKeyCursor = 0;

// Helper untuk parsing API keys dari environment atau input darurat
function resolveApiKeys(customApiKey) {
  if (customApiKey && typeof customApiKey === 'string') {
    const cleaned = customApiKey.trim();
    if (cleaned && !cleaned.includes('PASTE_API_KEY') && !cleaned.includes('ISI_DENGAN_API_KEY')) {
      const keys = cleaned.split(',').map(k => k.trim()).filter(Boolean);
      if (keys.length > 0) return keys;
    }
  }

  const envKeys = process.env.GEMINI_API_KEYS || '';
  if (!envKeys || envKeys.includes('PASTE_API_KEY') || envKeys.includes('ISI_DENGAN_API_KEY')) {
    return [];
  }
  return envKeys.split(',').map(k => k.trim()).filter(Boolean);
}

// Model-model teruji & urutan prioritas stabilitas kuota
const MODELS_TO_TRY = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.6-flash'
];

const SCHEMAS = {
  ANALYZE: {
    type: SchemaType.OBJECT,
    properties: {
      drug_name: { type: SchemaType.STRING, description: "Nama obat atau komposisi yang dideteksi" },
      active_ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Daftar bahan aktif dalam obat" },
      primary_indication: { type: SchemaType.STRING, description: "Fungsi utama obat (contoh: Analgesik / Pereda Nyeri)" },
      dosage_form: { type: SchemaType.STRING, description: "Wujud fisik obat (contoh: Tablet, Sirup, Injeksi)" },
      route_of_administration: { type: SchemaType.STRING, description: "Cara konsumsi (contoh: Oral, Topikal, Sesudah Makan)" },
      pregnancy_category: { type: SchemaType.STRING, description: "Kategori keamanan kehamilan (contoh: Kategori B)" },
      activity_warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Peringatan aktivitas harian singkat (contoh: Menyebabkan Kantuk)" },
      classification: { type: SchemaType.STRING, description: "Klasifikasi legal medis. Pilih salah satu: Obat Bebas, Obat Bebas Terbatas, Obat Keras, Suplemen, atau Unknown" },
      risk_level: { type: SchemaType.STRING, description: "Pilih salah satu: Low, Moderate, High, Critical" },
      confidence_score: { type: SchemaType.NUMBER, description: "Tingkat keyakinan AI antara 0.0 hingga 1.0" },
      reasoning_breakdown: { type: SchemaType.STRING, description: "Penjelasan rasional dan medis tentang risiko serta efek samping" },
      interaction_warnings: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            substance: { type: SchemaType.STRING },
            effect: { type: SchemaType.STRING },
            severity: { type: SchemaType.STRING, description: "Low, Medium, atau High" }
          }
        }
      },
      dosage_spectrum: {
        type: SchemaType.ARRAY,
        description: "Spektrum dosis aman untuk divisualisasikan dalam chart",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            stage: { type: SchemaType.STRING, description: "Misal: Dosis Minimal, Anjuran Standar, Batas Maksimal, Ambang Toksisitas" },
            value: { type: SchemaType.NUMBER },
            unit: { type: SchemaType.STRING, description: "Misal: mg, ml" }
          }
        }
      },
      governance_disclaimer: {
        type: SchemaType.STRING,
        description: "Pernyataan etis bahwa ini adalah alat bantu AI dan bukan pengganti medis."
      }
    },
    required: [
      "drug_name", "active_ingredients", "primary_indication", "dosage_form", 
      "route_of_administration", "pregnancy_category", "activity_warnings",
      "classification", "risk_level", "confidence_score", "reasoning_breakdown", 
      "interaction_warnings", "dosage_spectrum", "governance_disclaimer"
    ]
  },
  SUGGEST: {
    type: SchemaType.OBJECT,
    properties: {
      suggestions: {
        type: SchemaType.ARRAY,
        description: "Daftar rekomendasi obat. Wajib MAKSIMAL 4 obat.",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            drug_name: { type: SchemaType.STRING, description: "Nama obat medis/generik atau merek umum" },
            reason: { type: SchemaType.STRING, description: "Alasan farmakologis singkat kenapa obat ini cocok (maks 2 kalimat)" }
          },
          required: ["drug_name", "reason"]
        }
      }
    },
    required: ["suggestions"]
  },
  POLYPHARMACY: {
    type: SchemaType.OBJECT,
    properties: {
      drugs_detected: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Daftar obat yang terdeteksi dari input pengguna"
      },
      interactions: {
        type: SchemaType.ARRAY,
        description: "Daftar interaksi silang antar obat. Pasangkan setiap obat satu sama lain.",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            drug_a: { type: SchemaType.STRING },
            drug_b: { type: SchemaType.STRING },
            severity: { type: SchemaType.STRING, description: "Safe, Low, Medium, High, Critical" },
            description: { type: SchemaType.STRING, description: "Penjelasan ringkas medis menggunakan bahasa awam (maksimal 2 kalimat)" }
          },
          required: ["drug_a", "drug_b", "severity", "description"]
        }
      },
      governance_disclaimer: {
        type: SchemaType.STRING,
        description: "Pernyataan etis medis singkat."
      }
    },
    required: ["drugs_detected", "interactions", "governance_disclaimer"]
  }
};

export default async function handler(req, res) {
  // CORS & Header Options
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { success: false, error: 'Invalid JSON body' });
    }
  }

  const { action, payload, customApiKey } = body || {};

  if (!action || !['ANALYZE', 'SUGGEST', 'POLYPHARMACY'].includes(action)) {
    return sendJson(res, 400, { success: false, error: 'Aksi tidak valid (harus ANALYZE, SUGGEST, atau POLYPHARMACY)' });
  }

  // 1. Cek Server Cache terlebih dahulu (Kueri yang sama tidak memakan kuota)
  const cacheKey = getCacheKey(action, payload);
  if (SERVER_CACHE.has(cacheKey)) {
    const cached = SERVER_CACHE.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[Server Cache HIT] Mengembalikan data instan untuk: ${cacheKey}`);
      return sendJson(res, 200, {
        success: true,
        data: cached.data,
        fromCache: true
      });
    } else {
      SERVER_CACHE.delete(cacheKey);
    }
  }

  const apiKeys = resolveApiKeys(customApiKey);
  if (apiKeys.length === 0) {
    return sendJson(res, 401, {
      success: false,
      error: 'API Key Gemini belum diatur di server dan tidak ada kunci cadangan.',
      code: 'API_KEY_MISSING'
    });
  }

  let lastError = null;
  const startKeyIndex = customApiKey ? 0 : globalKeyCursor;

  // 2. Loop bergantian (Round-Robin) ke setiap API Key
  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const keyIdx = (startKeyIndex + attempt) % apiKeys.length;
    const apiKey = apiKeys[keyIdx];
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Loop ke model-model yang tersedia
    for (const modelName of MODELS_TO_TRY) {
      // Lewati model yang sedang cooldown (limit/overload)
      if (isModelCoolingDown(keyIdx, modelName)) {
        continue;
      }

      try {
        const schema = SCHEMAS[action];
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
            responseSchema: schema
          }
        });

        let promptContent = [];

        if (action === 'ANALYZE') {
          const { text, base64Image } = payload || {};
          if (text) promptContent.push(text);
          if (base64Image) {
            const mimeType = base64Image.split(';')[0].split(':')[1];
            const data = base64Image.split(',')[1];
            promptContent.push({
              inlineData: { data, mimeType }
            });
          }
          promptContent.push(
            "Anda adalah pakar obat. Klasifikasikan obat/bahan ini. Jika ada gambar, baca teks pada kemasannya. Kembalikan HANYA JSON valid sesuai skema. ATURAN PENTING: 1. Berikan jawaban yang ringkas. 2. Pada interaction_warnings, 'substance' maks 3 kata, dan 'effect' maks 1 kalimat. 3. DILARANG KERAS menambahkan format log. 4. GUNAKAN BAHASA AWAM SEHARI-HARI yang mudah dipahami orang biasa (misal: tulis 'Diminum' jangan 'Oral', 'Dioles' jangan 'Topikal', 'Obat Bebas' jangan 'OTC'). HINDARI ISTILAH MEDIS/ILMIAH YANG RUMIT. 5. JANGAN PERNAH menyalin teks mentah secara persis dari internet/kemasan untuk menghindari filter Hak Cipta."
          );
        } else if (action === 'SUGGEST') {
          const { symptoms } = payload || {};
          promptContent = [
            `Anda adalah dokter yang ramah. Pasien awam memiliki keluhan berikut: "${symptoms || ''}". Berikan MAKSIMAL 4 rekomendasi obat yang umum, aman, dan relevan. ATURAN PENTING: 1. Gunakan bahasa awam sehari-hari. 2. JANGAN PERNAH menyalin teks mentah dari sumber mana pun (hindari plagiasi/recitation filter), gunakan kata-kata Anda sendiri. Kembalikan HANYA JSON valid sesuai skema tanpa markdown backticks atau log tambahan.`
          ];
        } else if (action === 'POLYPHARMACY') {
          const { drugListString, drugList } = payload || {};
          const listText = drugListString || (Array.isArray(drugList) ? drugList.join(', ') : '');
          promptContent = [
            `Anda adalah pakar farmakologi. Pengguna memasukkan daftar obat berikut: "${listText}". Buat matriks interaksi silang (setiap kombinasi pasangan). Tentukan tingkat keparahan interaksinya. ATURAN PENTING: 1. Gunakan bahasa awam sehari-hari. 2. Jika tidak ada interaksi negatif, beri severity "Safe" dan tulis "Aman digunakan bersamaan". 3. JANGAN PERNAH menyalin teks mentah dari referensi mana pun (hindari RECITATION), formulasikan dengan gaya bahasa Anda sendiri. Kembalikan HANYA JSON valid sesuai skema.`
          ];
        }

        const result = await model.generateContent(promptContent);
        const jsonStr = result.response.text();
        const parsedData = JSON.parse(jsonStr);

        // Berhasil! Majukan kursor kunci agar request berikutnya memakai kunci lain
        if (!customApiKey) {
          globalKeyCursor = (keyIdx + 1) % apiKeys.length;
        }

        // Simpan ke Cache Server
        SERVER_CACHE.set(cacheKey, {
          timestamp: Date.now(),
          data: parsedData
        });

        return sendJson(res, 200, {
          success: true,
          data: parsedData
        });

      } catch (error) {
        lastError = error;
        const msg = error.message || '';
        console.warn(`[Proxy Server] Key #${keyIdx + 1} Model ${modelName} gagal:`, msg.slice(0, 120));

        // Jika error autentikasi / key salah, pindah ke Key berikutnya
        if (msg.includes('API_KEY') || msg.includes('invalid authentication')) {
          break;
        }

        // Jika kuota habis (429), beri cooldown 60 detik pada model ini, lalu coba model lain di key ini
        if (msg.includes('429')) {
          console.warn(`[Proxy Server] Kuota habis di Key #${keyIdx + 1} model ${modelName} (429). Pasang cooldown 60s & coba model cadangan...`);
          setModelCooldown(keyIdx, modelName, 60000);
          continue; // Lanjut coba model berikutnya!
        }

        // Jika sibuk (503), pasang cooldown singkat 15s & coba model cadangan
        if (msg.includes('503')) {
          console.warn(`[Proxy Server] Model ${modelName} sibuk (503). Pasang cooldown 15s & coba model cadangan...`);
          setModelCooldown(keyIdx, modelName, 15000);
          continue;
        }
      }
    }
  }

  // Jika semua model dan key gagal
  console.error("[Proxy Server] Semua API Key & model gagal merespons:", lastError?.message);
  
  const isQuota = lastError?.message && lastError.message.includes('429');
  const isAuth = lastError?.message && (lastError.message.includes('API_KEY') || lastError.message.includes('invalid authentication'));

  return sendJson(res, isQuota ? 429 : isAuth ? 401 : 500, {
    success: false,
    error: isQuota 
      ? 'Batas kuota penggunaan Gemini sedang padat. Silakan coba 1 menit lagi atau gunakan kunci cadangan.'
      : isAuth
      ? 'Kunci API Gemini tidak valid.'
      : (lastError?.message || 'Terjadi gangguan koneksi ke server AI.'),
    code: isQuota ? 'QUOTA_EXCEEDED' : isAuth ? 'API_KEY_INVALID' : 'AI_ERROR'
  });
}
