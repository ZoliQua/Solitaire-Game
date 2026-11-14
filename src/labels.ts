import type { MessageKey } from './i18n';
import { variantOfMode, type ModeId } from './logic/game';
import type { Variant } from './logic/types';

export const VARIANT_KEY: Record<Variant, MessageKey> = { klondike: 'variantKlondike', spider: 'variantSpider', freecell: 'variantFreecell' };
export const RULES_KEY: Record<Variant, MessageKey> = { klondike: 'rulesKlondike', spider: 'rulesSpider', freecell: 'rulesFreecell' };
export const OPTION_KEY: Record<ModeId, MessageKey | null> = {
  klondike1: 'draw1',
  klondike3: 'draw3',
  spider1: 'suits1',
  spider2: 'suits2',
  spider4: 'suits4',
  freecell: null,
};

/** The touch rows shared by the Controls panel and the Rules → mobile section. */
export const TOUCH_ROWS: [MessageKey, MessageKey][] = [
  ['touchTap', 'touchTapAction'],
  ['touchTarget', 'touchTargetAction'],
  ['touchDouble', 'touchDoubleAction'],
  ['touchDrag', 'touchDragAction'],
  ['touchStock', 'touchStockAction'],
];

/** One mode's display name, e.g. "Klondike · Draw 1". */
export function modeLabel(mode: ModeId, t: (k: MessageKey) => string): string {
  const opt = OPTION_KEY[mode];
  const v = t(VARIANT_KEY[variantOfMode(mode)]);
  return opt ? `${v} · ${t(opt)}` : v;
}
