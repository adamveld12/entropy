import type { ShareableReading } from "../types";

export interface ReadingStore {
  save(reading: ShareableReading): Promise<void>;
  getAll(): Promise<ShareableReading[]>;
  delete(timestamp: number): Promise<void>;
}
