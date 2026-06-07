/** Parse "2h 30m", "90m", "1.5h" into total minutes */
export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const hm = trimmed.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m?)?$/i);
  if (hm) {
    const hours = parseFloat(hm[1]);
    const mins = hm[2] ? parseInt(hm[2], 10) : 0;
    return Math.round(hours * 60 + mins);
  }

  const mOnly = trimmed.match(/^(\d+)\s*m$/i);
  if (mOnly) return parseInt(mOnly[1], 10);

  const num = parseInt(trimmed, 10);
  if (!Number.isNaN(num)) return num;

  return null;
}

export function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0 && r > 0) return `${h}h ${r}m`;
  if (h > 0) return `${h}h`;
  return r > 0 ? `${r}m` : "—";
}

export function minutesToTimeInput(m: number | undefined | null): string {
  if (!m) return "";
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0 && r > 0) return `${h}h ${r}m`;
  if (h > 0) return `${h}h`;
  return `${r}m`;
}
