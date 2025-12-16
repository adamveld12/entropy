export type { ReadingStore } from "./types";
export { LocalStorageReadingStore } from "./local-storage";

import { LocalStorageReadingStore } from "./local-storage";
export const readingStore = new LocalStorageReadingStore();
