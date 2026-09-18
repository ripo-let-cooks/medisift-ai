import { useState } from 'react';

const HISTORY_KEY = 'medisift_history';

export function useHistoryManager() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = (result) => {
    const newItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      result
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // Simpan maksimal 50 pencarian terakhir
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage quota exceeded", err);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return { history, addToHistory, clearHistory };
}
