/**
 * Format a throw label for display in the HUD or summary. Uses specific
 * language for special cases. */
export function formatLastHit(label: string, points: number): string {
  if (label === "MISS") return "MISS (0)";
  if (label === "DBULL") return "DOUBLE BULL (50)";
  if (label === "SBULL") return "SINGLE BULL (25)";
  // For numerical labels like "20" include (points) even for singles
  if (/^\d+$/.test(label)) return `${label} (${points})`;
  return `${label} (${points})`;
}