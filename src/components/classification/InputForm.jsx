import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputForm({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');
  const [isMultiMode, setIsMultiMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit({ type: isMultiMode ? 'polypharmacy' : 'text', data: query });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side image compression
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.7 quality to reduce upload payload
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        onSubmit({ type: 'image', data: compressedBase64 });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <Label htmlFor="search-input" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {isMultiMode ? 'Pemindai Interaksi Ganda' : 'Pencarian Cerdas (Nama Obat atau Keluhan)'}
            </Label>
            <div className="flex border border-border/40 font-mono text-[10px] uppercase tracking-widest bg-muted/5 p-1 w-fit">
              <button 
                type="button"
                onClick={() => setIsMultiMode(false)}
                className={`px-3 py-1.5 transition-colors ${!isMultiMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tunggal
              </button>
              <button 
                type="button"
                onClick={() => setIsMultiMode(true)}
                className={`px-3 py-1.5 transition-colors ${isMultiMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Multi-Obat
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-input"
                placeholder={isMultiMode ? "Contoh: Paracetamol, Amoxicillin, Antasida" : "Contoh: Paracetamol 500mg, ATAU 'Sakit kepala sebelah'..."} 
                className="pl-9 pr-10 h-12 rounded-none border-border/40 bg-background focus-visible:ring-primary focus-visible:ring-offset-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isLoading || !query.trim()} className="px-8 h-12 rounded-none font-mono uppercase tracking-wider">
                {isLoading ? '...' : 'Proses'}
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="relative flex items-center justify-center w-full py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <span className="relative bg-background px-4 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">
            Optical Character Recognition
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border border-border/40 bg-muted/5 transition-colors hover:bg-muted/10">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-none border-border/40 bg-transparent hover:bg-background font-mono uppercase tracking-wider"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Camera className="mr-3 h-4 w-4" />
              Pindai Kemasan Visual
            </Button>
          </motion.div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
          <p className="mt-4 text-xs text-muted-foreground text-center font-sans">
            AI akan membaca teks komposisi pada gambar kemasan secara otomatis.
          </p>
        </div>
      </form>
    </div>
  );
}
