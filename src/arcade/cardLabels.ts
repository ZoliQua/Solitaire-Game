import type { Lang } from './i18n';

export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardFace = { suit: Suit; rank: Rank };

const SUIT_NAME: Record<Lang, Record<Suit, string>> = {
  en: { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' },
  hu: { S: 'pikk', H: 'kőr', D: 'káró', C: 'treff' },
  de: { S: 'Pik', H: 'Herz', D: 'Karo', C: 'Kreuz' },
};
const RANK_NAME: Record<Lang, Record<Rank, string>> = {
  en: { A: 'Ace', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', '10': 'Ten', J: 'Jack', Q: 'Queen', K: 'King' },
  hu: { A: 'ász', '2': 'kettes', '3': 'hármas', '4': 'négyes', '5': 'ötös', '6': 'hatos', '7': 'hetes', '8': 'nyolcas', '9': 'kilences', '10': 'tizes', J: 'bubi', Q: 'dáma', K: 'király' },
  de: { A: 'Ass', '2': 'Zwei', '3': 'Drei', '4': 'Vier', '5': 'Fünf', '6': 'Sechs', '7': 'Sieben', '8': 'Acht', '9': 'Neun', '10': 'Zehn', J: 'Bube', Q: 'Dame', K: 'König' },
};

/** Spoken name, e.g. "Ace of spades", „Pikk ász”, „Pik-Ass”. */
export function cardLabel(card: CardFace, lang: Lang): string {
  const rank = RANK_NAME[lang][card.rank];
  const suit = SUIT_NAME[lang][card.suit];
  if (lang === 'en') return `${rank} of ${suit}`;
  if (lang === 'hu') return `${suit[0]!.toUpperCase()}${suit.slice(1)} ${rank}`;
  return `${suit}-${rank}`;
}

const BACK: Record<Lang, string> = { en: 'Card face down', hu: 'Lefordított kártya', de: 'Verdeckte Karte' };
export const cardBackLabel = (lang: Lang): string => BACK[lang];
