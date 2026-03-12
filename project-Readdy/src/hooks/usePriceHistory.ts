import { useState, useCallback } from 'react';

export interface PriceHistoryEntry {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changeType: 'single' | 'bulk_set' | 'bulk_percent' | 'bulk_fixed';
  changedBy?: string;
}

const STORAGE_KEY = 'whisper_price_history';
const MAX_ENTRIES = 200;

function loadHistory(): PriceHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PriceHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: PriceHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // ignore storage errors
  }
}

export function usePriceHistory() {
  const [history, setHistory] = useState<PriceHistoryEntry[]>(loadHistory);

  const addEntries = useCallback((newEntries: Omit<PriceHistoryEntry, 'id' | 'timestamp'>[]) => {
    const now = new Date().toISOString();
    const stamped: PriceHistoryEntry[] = newEntries.map((e, i) => ({
      ...e,
      id: `ph-${Date.now()}-${i}`,
      timestamp: now,
    }));
    setHistory((prev) => {
      const updated = [...stamped, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntries, clearHistory };
}
