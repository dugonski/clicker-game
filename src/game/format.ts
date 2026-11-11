const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];

/** 1234 -> "1.23K", 15 -> "15", 0.1 -> "0.1" */
export function formatNumber(value: number): string {
  if (value < 1_000) {
    if (value < 10 && value % 1 !== 0) return (Math.floor(value * 10) / 10).toFixed(1);
    return Math.floor(value).toFixed(0);
  }
  const tier = Math.min(SUFFIXES.length - 1, Math.floor(Math.log10(value) / 3));
  const scaled = Math.floor((value / Math.pow(1000, tier)) * 100) / 100;
  return `${scaled.toFixed(2)}${SUFFIXES[tier]}`;
}
