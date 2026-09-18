// Frontend Client: Menghubungkan UI dengan Serverless Backend Proxy (/api/gemini)
// Tanpa membocorkan API Key apa pun ke browser / inspect element.

function getEmergencyKey() {
  const key = localStorage.getItem('MEDISIFT_API_KEY');
  if (!key || key.includes('PASTE_API_KEY') || key.includes('ISI_DENGAN_API_KEY')) {
    return undefined;
  }
  return key.trim();
}

async function dispatchApi(action, payload) {
  const customApiKey = getEmergencyKey();

  let response;
  try {
    response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        payload,
        customApiKey
      })
    });
  } catch {
    throw new Error('Gagal terhubung ke server internal. Periksa koneksi internet Anda.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Respon server tidak valid.');
  }

  if (!response.ok || !result.success) {
    if (result.code === 'API_KEY_MISSING') {
      throw new Error('API_KEY_MISSING');
    }
    if (result.code === 'API_KEY_INVALID') {
      throw new Error('API_KEY_INVALID');
    }
    if (response.status === 429 || result.code === 'QUOTA_EXCEEDED' || (result.error && result.error.includes('429'))) {
      throw new Error('[QUOTA_EXCEEDED]: Batas penggunaan API gratis telah tercapai (429).');
    }
    throw new Error(result.error || 'Terjadi kesalahan pada analisis obat.');
  }

  return result.data;
}

export async function analyzeDrug(text, base64Image) {
  return await dispatchApi('ANALYZE', { text, base64Image });
}

export async function suggestDrugs(symptoms) {
  return await dispatchApi('SUGGEST', { symptoms });
}

export async function analyzePolypharmacy(drugListString) {
  return await dispatchApi('POLYPHARMACY', { drugListString });
}

export async function reverifyDrug(text) {
  return await dispatchApi('REVERIFY', { text });
}

export async function determineIntent(text) {
  // Free-Tier Optimization: Rule-based Intent Router (Zero API Cost)
  if (!text) return { intent: "IDENTIFY" };

  const lowerText = text.toLowerCase().trim();
  
  // 1. Keyword Keluhan (Symptom Keywords)
  const symptomKeywords = [
    'sakit', 'pusing', 'batuk', 'nyeri', 'demam', 'mual', 'gatal', 
    'bengkak', 'luka', 'keluhan', 'gejala', 'susah', 'meriang', 
    'pilek', 'berdahak', 'berdarah', 'perih', 'sesak', 'muntah', 'kram'
  ];
  
  const hasSymptomKeyword = symptomKeywords.some(keyword => lowerText.includes(keyword));

  // 2. Deteksi panjang kata (Jika panjang lebar, biasanya keluhan)
  const wordCount = lowerText.split(/\s+/).length;
  
  // Logika: Jika mengandung kata penyakit ATAU lebih dari 4 kata
  if (hasSymptomKeyword || wordCount > 4) {
    return { intent: "SUGGEST" };
  }

  // Jika input pendek dan tidak ada kata-kata keluhan, asumsikan itu Nama Obat
  return { intent: "IDENTIFY" };
}
