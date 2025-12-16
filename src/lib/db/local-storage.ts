import type { ShareableReading } from "../types";
import type { ReadingStore } from "./types";

const STORAGE_KEY = "entropy-readings";

export class LocalStorageReadingStore implements ReadingStore {
  async save(reading: ShareableReading): Promise<void> {
    const readings = await this.getAll();
    readings.unshift(reading);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  }

  async getAll(): Promise<ShareableReading[]> {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async delete(timestamp: number): Promise<void> {
    const readings = await this.getAll();
    const filtered = readings.filter((r) => r.d !== timestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}
