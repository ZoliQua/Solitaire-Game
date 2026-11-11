import { KIT_MESSAGES, LANG_LOCALES, translate, type Lang } from './i18n';

/** `mm:ss`, or `h:mm:ss` from one hour on. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Human-friendly age of a save, e.g. "3 min ago" (English unless `lang` is given). */
export function formatSavedAt(ts: number, now: number = Date.now(), lang: Lang = 'en'): string {
  const diff = Math.max(0, Math.round((now - ts) / 1000));
  const t = (key: 'savedJustNow' | 'savedSeconds' | 'savedMinutes' | 'savedHours', n?: number) =>
    translate(KIT_MESSAGES, lang, key, n === undefined ? undefined : { n });
  if (diff < 10) return t('savedJustNow');
  if (diff < 60) return t('savedSeconds', diff);
  if (diff < 3600) return t('savedMinutes', Math.floor(diff / 60));
  if (diff < 86400) return t('savedHours', Math.floor(diff / 3600));
  return new Date(ts).toLocaleDateString(LANG_LOCALES[lang]);
}

/** A number with the language's digit grouping (e.g. 1,234 · 1.234 · 12 345). */
export function formatNumber(n: number, lang: Lang): string {
  try {
    return new Intl.NumberFormat(LANG_LOCALES[lang]).format(n);
  } catch {
    return String(n);
  }
}
