const memory = new Map<string, string | null>();
export function readStorage(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try { return localStorage.getItem(key); }
  catch { return null; }
}
export function writeStorage(key: string, value: string): boolean {
  memory.set(key, value);
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}
export function removeStorage(key: string) {
  memory.set(key, null);
  try { localStorage.removeItem(key); } catch { /* Session-only storage remains available. */ }
}
