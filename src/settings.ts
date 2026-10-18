/** Optional controls; each catalogue entry lists the controls its renderer supports. */
export interface EffectSettings {
  speed?: number;
  intensity?: number;
  colors?: string[];
}
export function boundedSetting(
  value: number | undefined,
  fallback = 1,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(2, value))
    : fallback;
}
export function paletteSettings(
  colors: string[] | undefined,
  defaults: string[],
): string[] {
  return defaults.map((color, index) => {
    const value = colors?.[index];
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
      ? value
      : color;
  });
}
