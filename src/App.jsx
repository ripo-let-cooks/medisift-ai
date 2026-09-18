import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Printer, RotateCcw, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from './components/classification/InputForm';
import CategoryBadge from './components/visualization/CategoryBadge';
import RiskGauge from './components/visualization/RiskGauge';
import DoseBarChart from './components/visualization/DoseBarChart';
import ScannerLoading from './components/visualization/ScannerLoading';
import ReasonBreakdown from './components/governance/ReasonBreakdown';
import InteractionMatrix from './components/governance/InteractionMatrix';
import LegalModal from './components/governance/LegalModal';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { analyzeDrug, suggestDrugs, determineIntent, analyzePolypharmacy, reverifyDrug } from './lib/gemini-client';
import MultiDrugMatrix from './components/visualization/MultiDrugMatrix';
import { useHistoryManager } from './hooks/useHistoryManager';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FloatingBackground from './components/layout/FloatingBackground';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scannedImage, setScannedImage] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [previousSuggestions, setPreviousSuggestions] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isReverifying, setIsReverifying] = useState(false);
  const { history, addToHistory, clearHistory } = useHistoryManager();

  // Force scroll to top and reset browser scroll restoration on refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleBackToSuggestions = () => {
    setSuggestions(previousSuggestions);
    setResult(null);
    setPreviousSuggestions(null);
  };

  const handleAnalyze = async (payload, isSuggestionClick = false) => {
    // Basic resets
    setShowHistory(false);
    setLoading(true);
    
    if (isSuggestionClick) {
      setPreviousSuggestions(suggestions);
    } else {
      setPreviousSuggestions(null);
    }
    
    setSuggestions(null);
    setResult(null);
    setError(null);
    setScannedImage(payload.type === 'image' ? payload.data : null);

    // Free-Tier Optimization: Local Caching (Only for text)
    const cacheKey = payload.type === 'text' ? `cache_${payload.data.toLowerCase().trim()}` : null;
    
    if (cacheKey) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Simulate slight delay for UI transition
          await new Promise(r => setTimeout(r, 400));
          
          if (parsed.intent === 'SUGGEST') {
            setSuggestions(parsed.data);
            setIsSuggesting(false);
            setLoading(false);
          } else {
            setResult(parsed.data);
            addToHistory(parsed.data);
            setLoading(false);
            toast.success("Analisis Selesai (Dari Cache)", { description: "Hasil diambil dari ingatan lokal. 0 API terpakai." });
          }
          return; // Exit early!
        } catch {
          console.warn("Cache rusak, mengabaikan cache.");
        }
      }
    }

    try {
      let activeIntent = 'IDENTIFY';

      // Jika input adalah teks dan bukan klik langsung dari kartu rekomendasi, cek intent
      if (payload.type === 'text' && !isSuggestionClick) {
        const route = await determineIntent(payload.data);
        activeIntent = route.intent;
      }

      if (activeIntent === 'SUGGEST') {
        setIsSuggesting(true);
        setLoading(false); // Matikan loading utama karena kita masuk mode suggesting
        const data = await suggestDrugs(payload.data);
        setSuggestions(data.suggestions);
        
        // Simpan ke Cache
        if (cacheKey) {
          sessionStorage.setItem(cacheKey, JSON.stringify({ intent: 'SUGGEST', data: data.suggestions }));
        }
        
        setIsSuggesting(false);
      } else if (payload.type === 'polypharmacy') {
        const data = await analyzePolypharmacy(payload.data);
        const polyResult = { ...data, isPolypharmacy: true };
        setResult(polyResult);
        addToHistory(polyResult);
        toast.success("Analisis Interaksi Ganda Selesai");
        setLoading(false);
      } else {
        // IDENTIFY
        const data = await analyzeDrug(
          payload.type === 'text' ? payload.data : null,
          payload.type === 'image' ? payload.data : null
        );
        setResult(data);
        addToHistory(data);
        
        // Simpan ke Cache
        if (cacheKey) {
          sessionStorage.setItem(cacheKey, JSON.stringify({ intent: 'IDENTIFY', data }));
        }

        toast.success("Analisis Selesai", { description: "Hasil klasifikasi obat berhasil dimuat." });
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setLoading(false);
      setIsSuggesting(false);
      if (err.message === 'API_KEY_MISSING' || err.message === 'API_KEY_INVALID') {
        setShowApiModal(true);
        toast.error("Autentikasi Gagal", { description: "API Key Gemini tidak valid atau belum diatur." });
      } else if (err.message && err.message.includes('429')) {
        setError("[QUOTA_EXCEEDED]: Batas penggunaan API gratis telah tercapai. Harap tunggu sekitar 1 menit sebelum mencoba lagi.");
      } else {
        setError(err.message || "Kegagalan ekstraksi antarmuka saraf. Modul analisis terhenti.");
      }
    }
  };

  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('MEDISIFT_API_KEY', tempApiKey.trim());
      setShowApiModal(false);
      setTempApiKey('');
      toast.success("API Key Disimpan", { description: "Silakan coba proses kembali." });
    }
  };

  const handleReverify = async () => {
    if (isReverifying || !result) return;
    const targetName = result.drug_name || 'Obat';
    setIsReverifying(true);
    toast.info("Memulai Audit Akurasi", {
      description: `Memverifikasi silang data ${targetName} dengan standar farmakope...`
    });

    try {
      const verified = await reverifyDrug(targetName);
      setResult({
        ...verified,
        is_reverified: true
      });
      toast.success("Verifikasi Berhasil", {
        description: `Data ${targetName} telah diverifikasi ulang dengan standar presisi tinggi.`
      });
    } catch (err) {
      toast.error("Verifikasi Gagal", {
        description: err.message || "Gagal melakukan verifikasi ulang data."
      });
    } finally {
      setIsReverifying(false);
    }
  };

  const isIdle = !loading && !isSuggesting && !result && !suggestions && !showHistory && !error;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans relative">
      <FloatingBackground />
      <Header 
        showHistory={showHistory} 
        setShowHistory={setShowHistory}
        onOpenApiSettings={() => setShowApiModal(true)}
        onOpenLegal={() => setShowLegalModal(true)}
        onHomeClick={() => { setResult(null); setSuggestions(null); setShowHistory(false); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col min-h-[calc(100dvh-4rem)] relative z-10 px-4 md:px-8 pt-12 md:pt-16 pb-8 md:pb-12">
        
        {/* Dynamic Top/Center Section */}
        <motion.div 
          layout
          className="flex flex-col w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            flex: isIdle ? 1 : 0,
            justifyContent: isIdle ? "center" : "flex-start",
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            layout
            className={`w-full ${isIdle ? 'max-w-4xl mx-auto' : 'grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 border-b border-border/40 pb-8 mb-8'}`}
          >
            {/* Context / Hero */}
            <motion.div 
              layout 
              className={isIdle ? 'text-center mb-10' : 'col-span-1 md:col-span-5 flex flex-col justify-center'}
            >
              <motion.h2 layout className={`${isIdle ? 'text-5xl md:text-6xl lg:text-7xl mb-6' : 'text-3xl lg:text-4xl mb-4'} font-bold tracking-tighter text-foreground leading-[1.1]`}>
                Klasifikasi <span className="text-primary">Klinis</span> & Analisis Risiko.
              </motion.h2>
              <motion.p layout className={`text-muted-foreground leading-relaxed ${isIdle ? 'text-lg md:text-xl lg:text-2xl max-w-[55ch] mx-auto' : 'text-sm max-w-[40ch]'}`}>
                Platform Explainable AI untuk analisis interaksi bahan kimia, tingkat keamanan dosis, dan kategori legalitas medis secara instan.
              </motion.p>
            </motion.div>

            {/* Input Form */}
            <motion.div 
              layout 
              className={isIdle ? 'w-full' : 'col-span-1 md:col-span-7 flex flex-col justify-center'}
            >
              <InputForm onSubmit={handleAnalyze} isLoading={loading} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Results / History / Loading Area */}
        <AnimatePresence mode="wait">
          {!isIdle && (
            <motion.div 
              key="content-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 w-full flex flex-col bg-card border border-border/40 p-6 md:p-10 lg:p-12 relative"
            >
              {showHistory ? (
                <section className="w-full h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">Audit Log & Riwayat</h3>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearHistory} className="text-sm text-destructive hover:underline font-mono uppercase tracking-widest">Hapus Semua</motion.button>
                  </div>
                  {history.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border-t border-border/40">
                      <p className="text-muted-foreground font-mono">NO_AUDIT_LOG_FOUND</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {history.map(item => (
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          key={item.id} 
                          className="p-4 border border-border/40 bg-background hover:bg-muted/10 transition-colors cursor-pointer flex justify-between items-center group" 
                          onClick={() => { setResult(item.result); setShowHistory(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.result?.isPolypharmacy
                                ? `Interaksi: ${(item.result.drugs_detected || []).join(' + ')}`
                                : (item.result?.drug_name || 'Analisis Obat')}
                            </h4>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                          {item.result?.isPolypharmacy ? (
                            <span className="px-2.5 py-1 text-[10px] font-mono uppercase bg-primary/15 text-primary border border-primary/30">
                              Multi-Obat
                            </span>
                          ) : (
                            <CategoryBadge classification={item.result?.classification} />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              ) : (loading || isSuggesting) ? (
                <div className="w-full">
                  <ScannerLoading />
                </div>
              ) : error ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 border border-destructive bg-destructive/10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
                  <ShieldAlert className="h-12 w-12 text-destructive mb-6" />
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-destructive uppercase mb-4">[SYSTEM_FAILURE]</h3>
                  <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm mb-8 max-w-[50ch] mx-auto">{error}</p>
                  <Button onClick={() => setError(null)} variant="outline" className="font-mono uppercase tracking-wider rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">Coba Lagi</Button>
                </div>
              ) : suggestions ? (
                <section className="w-full h-full">
                  <h3 className="text-xl font-bold tracking-tight mb-6 font-mono uppercase border-b border-border/40 pb-4">REKOMENDASI OBAT (AI)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((sug, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnalyze({ type: 'text', data: sug.drug_name }, true)}
                        className="p-5 border border-border/40 bg-background hover:bg-muted/10 transition-colors cursor-pointer flex flex-col justify-between"
                      >
                        <h4 className="font-bold text-lg text-primary mb-2 tracking-wide uppercase">{sug.drug_name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-sans">{sug.reason}</p>
                        <div className="mt-4 pt-4 border-t border-border/20 text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                          <span>Analisis Detail</span>
                          <span className="text-primary">&rarr;</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : result ? (
                <section className="w-full h-full flex flex-col gap-8">
                  {/* Back to Suggestions Button & Export PDF */}
                  <div className="w-full flex justify-between items-start mb-4">
                    {previousSuggestions ? (
                      <Button 
                        variant="ghost" 
                        onClick={handleBackToSuggestions}
                        className="text-muted-foreground hover:text-primary hover:bg-transparent -ml-4 p-4 h-auto"
                        title="Kembali ke Opsi"
                      >
                        <ArrowLeft className="w-10 h-10 md:w-14 md:h-14" strokeWidth={2} />
                      </Button>
                    ) : <div />}

                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => window.print()}
                      className="border-border/40 hover:bg-muted/50 transition-colors h-10 w-10 no-print"
                      title="Export PDF"
                    >
                      <Printer className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>

                  {result.isPolypharmacy ? (
                    <>
                      <MultiDrugMatrix data={result} />
                      {/* Governance */}
                      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-border/20">
                        <p className="text-[11px] text-muted-foreground max-w-[65ch] leading-relaxed">
                          <strong className="text-foreground uppercase font-mono tracking-widest block mb-2 text-xs">Disclaimer Medis</strong> 
                          {result.governance_disclaimer}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Header Result & Image Preview */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8">
                    <div className="flex gap-6 items-start">
                      {scannedImage && (
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 border border-border/40 bg-muted/20 relative overflow-hidden flex items-center justify-center filter grayscale contrast-125">
                          <img src={scannedImage} alt="Scanned drug" className="object-cover w-full h-full opacity-80" />
                          <div className="absolute inset-0 border-[4px] border-primary/20 pointer-events-none" />
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono text-primary bg-background/80 px-1">IMG_SRC</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]">{result.drug_name}</h3>
                          {result.is_reverified && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                              Audit Terverifikasi
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-mono tracking-widest uppercase text-muted-foreground">
                          KOMPOSISI: {result.active_ingredients?.join(', ') || 'TIDAK DIKETAHUI'}
                        </p>
                      </div>
                    </div>
                    <CategoryBadge classification={result.classification} />
                  </div>

                  {/* Clinical Spec Block - Brutalist Terminal Style */}
                  <div className="w-full mb-8 border-y border-border/40 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <div className="space-y-6">
                      <div>
                        <span className="block text-[11px] text-muted-foreground/70 mb-1">INDIKASI UTAMA</span>
                        <span className="text-foreground">{result.primary_indication || 'TIDAK TERSEDIA'}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted-foreground/70 mb-1">BENTUK SEDIAAN</span>
                        <span className="text-foreground">{result.dosage_form || 'TIDAK TERSEDIA'}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <span className="block text-[11px] text-muted-foreground/70 mb-1">CARA KONSUMSI</span>
                        <span className="text-foreground">{result.route_of_administration || 'TIDAK TERSEDIA'}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted-foreground/70 mb-1">KATEGORI HAMIL</span>
                        <span className="text-foreground">{result.pregnancy_category || 'TIDAK TERSEDIA'}</span>
                      </div>
                    </div>
                    
                    {/* Warning spans full width if exists */}
                    <div className="col-span-1 md:col-span-2 pt-4 border-t border-border/20">
                        <span className="block text-[11px] text-muted-foreground/70 mb-1">PERINGATAN AKTIVITAS</span>
                        <span className="text-foreground">
                          {result.activity_warnings?.length ? `[!] ${result.activity_warnings.join(' • ')}` : 'NIHIL'}
                        </span>
                    </div>
                  </div>

                  {/* Grid 2 Column for Data */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <RiskGauge riskLevel={result.risk_level} />
                    <DoseBarChart data={result.dosage_spectrum} />
                  </div>

                  {/* XAI Section */}
                  <div className="space-y-8 pt-4 border-t border-border/40">
                    <ReasonBreakdown reasoning={result.reasoning_breakdown} confidence={result.confidence_score} />
                    <InteractionMatrix warnings={result.interaction_warnings} />
                  </div>
                  
                  {/* Governance */}
                  <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-border/20">
                    <p className="text-[11px] text-muted-foreground max-w-[65ch] leading-relaxed">
                      <strong className="text-foreground uppercase font-mono tracking-widest block mb-2 text-xs">Disclaimer Medis</strong> 
                      {result.governance_disclaimer}
                    </p>
                    <motion.button 
                      whileHover={{ scale: isReverifying || result.is_reverified ? 1 : 1.05 }}
                      whileTap={{ scale: isReverifying || result.is_reverified ? 1 : 0.95 }}
                      onClick={handleReverify}
                      disabled={isReverifying || result.is_reverified}
                      className={`w-full sm:w-auto text-[10px] sm:text-xs font-mono uppercase tracking-widest px-6 py-3 transition-all shrink-0 no-print border ${
                        result.is_reverified 
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 cursor-default'
                          : 'bg-background border-border/40 hover:bg-muted hover:text-foreground text-muted-foreground'
                      }`}
                    >
                      {isReverifying ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          Memverifikasi...
                        </span>
                      ) : result.is_reverified ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" />
                          Verifikasi Ulang
                        </span>
                      )}
                    </motion.button>
                  </div>
                    </>
                  )}
                </section>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ x: '-100vw', opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: '-100vw', opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 250 }}
              className="bg-card border border-destructive/50 p-6 md:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">API Key Dibutuhkan</h3>
              </div>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 font-mono tracking-tight">
                Kunci API yang saat ini tersimpan tidak valid atau mengalami *limit*. 
                <br/><br/>
                <span className="text-[#00ff9d]">TIPS LOMBA:</span> Anda dapat memasukkan **beberapa API Key sekaligus** dengan memisahkannya menggunakan tanda koma (,). Sistem akan otomatis berotasi ke kunci berikutnya jika kunci pertama terkena limit.
              </p>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Paste API Key (Bisa lebih dari 1, pisahkan dengan koma)"
                  className="w-full bg-[#111111] border border-gray-800 text-gray-200 p-4 font-mono text-sm mb-6 focus:outline-none focus:border-[#00ff9d] transition-colors"
                />
                <div className="flex justify-end gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="rounded-none font-mono uppercase tracking-wider" onClick={() => setShowApiModal(false)}>
                      Batal
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="rounded-none font-mono uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveApiKey}>
                      Simpan & Lanjutkan
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="bottom-right" toastOptions={{
        className: 'rounded-none border-border/40 bg-background font-mono',
      }} />
      <LegalModal type={showLegalModal} onClose={() => setShowLegalModal(null)} />
      <Footer 
        onHomeClick={() => { setResult(null); setShowHistory(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onHistoryClick={() => { setShowHistory(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onApiSettingsClick={() => setShowApiModal(true)}
        onPrivacyClick={() => setShowLegalModal('privacy')}
        onTermsClick={() => setShowLegalModal('terms')}
      />
    </div>
  );
}
