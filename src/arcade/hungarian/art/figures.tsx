/* eslint-disable react-refresh/only-export-components -- static card art: components and their lookup tables live together; no fast refresh needed. */
import type { ReactElement } from 'react';
import type { HFigure } from '../cards';
import { Hand, Head, Limb, O, P, Torso } from './parts';

/*
 * The eight Tell characters of the Alsó and Felső cards, each drawn as a half figure in the top half
 * (7..93 × 7..80) and turned for the bottom half by the card. Every figure has its own silhouette
 * (headwear, beard, attribute), so they never rely on colour. Felső: the suit sign sits in the top-left
 * corner, so hats and feathers lean right; Alsó: the sign sits lower on the left (as on the real deck).
 */

const HX = 50;
const HY = 32;
const HR = 8.5;

function Neck() {
  return <path d="M46 38 L46 50 L54 50 L54 38 Z" fill={P.skin} {...O} />;
}

/** Kuoni the herdsman (piros alsó): wide felt hat, sheepskin vest, the shepherd's crook. */
function Kuoni() {
  return (
    <g>
      <Limb d="M72 82 L72 22" color={P.brown} w={2.2} />
      <Limb d="M72 22 Q72 12 65 13 Q60 15 62 20" color={P.brown} w={2.2} />
      <Neck />
      <Torso fill={P.brick}>
        <path d="M23 82 Q23 58 37 51.5 L44 56 L42 82 Z" fill={P.linen} {...O} />
        <path d="M77 82 Q77 58 63 51.5 L56 56 L58 82 Z" fill={P.linen} {...O} />
        {[
          [30, 62], [36, 70], [30, 76], [70, 62], [64, 70], [70, 76], [38, 60], [62, 60],
        ].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 2} ${y} q2 -2.4 4 0`} fill="none" stroke={P.ink} strokeWidth="0.6" />
        ))}
        <path d="M50 52 L50 80 M47 58 L53 61 M47 64 L53 67 M47 70 L53 73" stroke={P.ink} strokeWidth="0.6" />
      </Torso>
      <Limb d="M64 55 Q71 60 71 66" color={P.linen} w={6} />
      <Hand x={72} y={66} />
      <Head x={HX} y={HY} r={HR} hair={P.brownLight} />
      <path d="M41 25 Q41 13 50 13 Q59 13 59 25 Z" fill={P.brown} {...O} />
      <path d="M41.4 22 H58.6" stroke={P.ochre} strokeWidth="2" />
      <ellipse cx="50" cy="25.5" rx="17" ry="3.6" fill={P.brown} {...O} />
    </g>
  );
}

/** Hermann Gessler (piros felső): tall plumed hat, pointed beard, fur collar, chain of office, baton. */
function Gessler() {
  return (
    <g>
      <Neck />
      <Torso fill={P.brickDark}>
        <path d="M50 50 L50 82" stroke={P.ochreLight} strokeWidth="2.4" />
        <path d="M24 64 Q24 54 37 50 Q50 58 63 50 Q76 54 76 64 Q63 60 50 66 Q37 60 24 64 Z" fill={P.brownLight} {...O} />
        {[30, 36, 42, 58, 64, 70].map((x) => (
          <path key={x} d={`M${x} ${x < 50 ? 57 + (x - 30) / 4 : 61 - (x - 58) / 4} l0.6 2`} stroke={P.ink} strokeWidth="0.7" />
        ))}
        <path d="M36 58 Q50 76 64 58" fill="none" stroke={P.ochre} strokeWidth="1.8" strokeDasharray="2 1.2" />
        <circle cx="50" cy="69.5" r="3" fill={P.ochre} {...O} />
      </Torso>
      <Limb d="M80 18 L63 70" color={P.oliveDark} w={2.4} />
      <circle cx="80.6" cy="16" r="3" fill={P.ochre} {...O} />
      <Limb d="M64 55 Q70 62 68 61" color={P.brickDark} w={6} />
      <Hand x={67.5} y={58} r={2.8} />
      <Head x={HX} y={HY} r={HR} beard="pointed" beardColor={P.brown} />
      <path d="M57 16 C65 10 75 9 85 13 C76 13 68 17 59 23 Z" fill={P.linen} {...O} />
      <path d="M58 18 C66 13 74 12 81 12.6" fill="none" stroke={P.ink} strokeWidth="0.5" />
      <path d="M41.5 26 L43 11 Q50 8 57 11 L58.5 26 Z" fill={P.oliveDark} {...O} />
      <rect x="40" y="22.5" width="20" height="4.6" rx="1.2" fill={P.ochre} {...O} />
    </g>
  );
}

/** Itel Reding the judge (tök alsó): tall fur cap, long white beard, robe with fur collar, the scroll of law. */
function Reding() {
  return (
    <g>
      <Neck />
      <Torso fill={P.plum}>
        <path d="M37 51.5 Q50 60 63 51.5 L66 58 Q50 68 34 58 Z" fill={P.brownLight} {...O} />
        <path d="M45 66 L45 82 M55 66 L55 82" stroke={P.ochreLight} strokeWidth="1.6" />
      </Torso>
      <Head x={HX} y={HY} r={HR} beard="long" beardColor={P.linen} hair={P.linen} />
      <path d="M50 46 L50 52 M47 44 L48 50 M53 44 L52 50" stroke={P.steel} strokeWidth="0.6" />
      <Limb d="M64 56 Q70 62 66 66" color={P.plum} w={6} />
      <g transform="rotate(-18 66 62)">
        <rect x="58" y="58" width="18" height="8" fill={P.linen} {...O} />
        <ellipse cx="58" cy="62" rx="2" ry="4" fill={P.stockShade} {...O} />
        <ellipse cx="76" cy="62" rx="2" ry="4" fill={P.stockShade} {...O} />
        <path d="M61 60.5 H73 M61 63.5 H71" stroke={P.ink} strokeWidth="0.5" />
      </g>
      <Hand x={65} y={66} />
      <path d="M41.5 26 Q40 9 50 8.5 Q60 9 58.5 26 Z" fill={P.brown} {...O} />
      <path d="M44.5 25 L44 13 M48 25 L48 10 M52 25 L52 10 M55.5 25 L56 13" stroke={P.ink} strokeWidth="0.5" />
      <rect x="40" y="23" width="20" height="4.6" rx="2.2" fill={P.brownLight} {...O} />
    </g>
  );
}

/** Stüssi the ranger (tök felső): pointed hunting hat with a standing feather, crossbelt, horn and boar spear. */
function Stussi() {
  return (
    <g>
      <Limb d="M76 82 L76 21" color={P.brown} w={2} />
      <path d="M76 9 Q80.5 15 76 23 Q71.5 15 76 9 Z" fill={P.steel} {...O} />
      <path d="M72 24 H80" stroke={P.ink} strokeWidth="1.6" strokeLinecap="round" />
      <Neck />
      <Torso fill={P.brownLight}>
        <path d="M36 52 L66 82 L60 82 L33 55 Z" fill={P.brown} {...O} />
        <path d="M24 70 Q31 63 38 70 L37 74 Q31 68 26 74 Z" fill={P.ochreLight} {...O} />
        <circle cx="25.5" cy="73" r="2.2" fill={P.ochre} {...O} />
        <path d="M40 50.5 Q50 55 60 50.5 L60 54 Q50 58 40 54 Z" fill={P.linen} {...O} />
      </Torso>
      <Limb d="M64 55 Q73 58 75 58" color={P.brownLight} w={6} />
      <Hand x={76} y={58} r={2.8} />
      <Head x={HX} y={HY} r={HR} beard="mustache" beardColor={P.brown} />
      <path d="M58 22 Q62 13 68 9 Q66 15 61 24 Z" fill={P.linen} {...O} />
      <path d="M40 26 Q43 11 53 10 Q60 12 60.5 26 Z" fill={P.olive} {...O} />
      <ellipse cx="50" cy="26" rx="14" ry="3" fill={P.olive} {...O} />
      <path d="M41.6 23 Q50 21 59.6 23" fill="none" stroke={P.brickDark} strokeWidth="1.6" />
    </g>
  );
}

/** Walter Fürst (zöld alsó): the old man, bald with white locks and beard, hooded cloak, walking staff. */
function Furst() {
  return (
    <g>
      <Limb d="M71 82 L67 14" color={P.brown} w={2.6} />
      <circle cx="66.8" cy="12" r="2.6" fill={P.brownLight} {...O} />
      <Neck />
      <Torso fill={P.olive}>
        <path d="M33 52 Q50 46 67 52 Q66 60 50 62 Q34 60 33 52 Z" fill={P.oliveDark} {...O} />
        <path d="M50 62 L50 82" stroke={P.oliveDark} strokeWidth="1.2" />
      </Torso>
      <Limb d="M63 56 Q69 60 68 60" color={P.olive} w={6} />
      <Hand x={68.4} y={58} r={2.8} />
      <Head x={HX} y={HY} r={HR} beard="long" beardColor={P.linen} hair={P.linen} />
      <path d="M43 24.5 Q46 22.5 50 24 Q54 22.5 57 24.5" fill="none" stroke={P.brownLight} strokeWidth="0.5" />
      <path d="M44 27.5 Q46 26.3 48 27" fill="none" stroke={P.brownLight} strokeWidth="0.5" />
    </g>
  );
}

/** Ulrich von Rudenz (zöld felső): the young knight in helmet and breastplate, sword held upright. */
function Rudenz() {
  return (
    <g>
      <Neck />
      <Torso fill={P.steel}>
        <path d="M50 52 L50 82" stroke={P.ink} strokeWidth="0.8" />
        <path d="M36 66 Q50 72 64 66" fill="none" stroke={P.ink} strokeWidth="0.7" />
        <ellipse cx="29" cy="60" rx="7" ry="5" fill={P.steelLight} {...O} />
        <ellipse cx="71" cy="60" rx="7" ry="5" fill={P.steelLight} {...O} />
        <path d="M30 56 L70 82 L63 82 L28 61 Z" fill={P.brick} {...O} />
      </Torso>
      <path d="M71.5 57 L71.5 12 L73.5 7 L75.5 12 L75.5 57 Z" fill={P.steelLight} {...O} />
      <path d="M73.5 12 V55" stroke={P.ink} strokeWidth="0.4" />
      <path d="M66 58 H81" stroke={P.ink} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M66 58 H81" stroke={P.ochre} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="73.5" cy="68" r="2.4" fill={P.ochre} {...O} />
      <Hand x={73.5} y={62.5} r={3} />
      <Head x={HX} y={HY} r={HR} />
      <path d="M57 18 Q68 9 82 12 Q73 14 60 24 Z" fill={P.brick} {...O} />
      <path d="M58 20 Q67 13 77 12.5" fill="none" stroke={P.ochreLight} strokeWidth="0.8" />
      <path d="M40 30 Q39 14 50 13 Q61 14 60 30 L57.5 26 Q50 23 42.5 26 Z" fill={P.steel} {...O} />
      <path d="M50 13 V24" stroke={P.ink} strokeWidth="0.8" />
      <path d="M38 27 Q50 22 62 27" fill="none" stroke={P.ink} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M38 27 Q50 22 62 27" fill="none" stroke={P.steelLight} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/** Rudolf der Harras, the stablemaster (makk alsó): slanted beret, curled mustache, slashed doublet, halberd. */
function Harras() {
  return (
    <g>
      <Limb d="M75 82 L75 22" color={P.brown} w={1.8} />
      <path d="M75 9 L77.4 22 L72.6 22 Z" fill={P.steel} {...O} />
      <path d="M76 23 C84 21 88 27 87 35 C83 31 79 31 76 32 Z" fill={P.steel} {...O} />
      <path d="M74 24 L67 26.5 L74 30 Z" fill={P.steel} {...O} />
      <Neck />
      <Torso fill={P.ochre}>
        <path d="M38 54 L36 82 M44 50 L43 82 M56 50 L57 82 M62 54 L64 82" stroke={P.brickDark} strokeWidth="1.8" />
        <path d="M39 50.5 Q50 55 61 50.5 L61 54 Q50 58 39 54 Z" fill={P.linen} {...O} />
      </Torso>
      <Limb d="M36 55 Q30 64 33 76" color={P.ochreLight} w={7} />
      <path d="M31.5 60 l3 1 M30.5 66 l3.4 0.4 M31 72 l3.4 -0.4" stroke={P.brickDark} strokeWidth="1.2" />
      <Limb d="M64 55 Q72 60 74 59" color={P.ochreLight} w={6} />
      <Hand x={75} y={58.5} r={2.8} />
      <Head x={HX} y={HY} r={HR} beard="mustache" beardColor={P.brownLight} />
      <path d="M45.5 37 q-4 1 -6 -2 M54.5 37 q4 1 6 -2" fill="none" stroke={P.brownLight} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M38 27 Q37 16 51 15 Q66 15 64 25 Q51 21.5 38 27 Z" fill={P.brick} {...O} />
      <path d="M43 24.5 l1.5 -6 M49 23 l0.5 -6.5 M55 22.5 l-0.5 -6 M60 23 l-1.5 -5" stroke={P.linen} strokeWidth="1" />
      <path d="M62 20 Q72 16 78 22 Q70 20 63 24 Z" fill={P.ochreLight} {...O} />
    </g>
  );
}

/** William Tell (makk felső): bearded, peaked cap with feather, laced jerkin, the crossbow on his shoulder. */
function Tell() {
  return (
    <g>
      <Neck />
      <Torso fill={P.olive}>
        <path d="M50 52 L50 82" stroke={P.oliveDark} strokeWidth="1" />
        <path d="M47 58 L53 61 M47 64 L53 67 M47 70 L53 73 M53 58 L47 61 M53 64 L47 67 M53 70 L47 73" stroke={P.linen} strokeWidth="0.7" />
        <path d="M23.4 76 Q50 81 76.6 76 L76.8 82 L23.2 82 Z" fill={P.brown} {...O} />
        <path d="M36 52 Q50 57 64 52" fill="none" stroke={P.linen} strokeWidth="1.6" />
      </Torso>
      <Limb d="M58 70 L79 28" color={P.brown} w={3} />
      <path d="M78.5 29 L81 23.5 M78 24 L83 26.4" stroke={P.ink} strokeWidth="1" strokeLinecap="round" />
      <path d="M67 23.6 L89 34.6" stroke={P.ink} strokeWidth="0.6" />
      <path d="M67 23.6 Q81 19 89 34.6" fill="none" stroke={P.ink} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M67 23.6 Q81 19 89 34.6" fill="none" stroke={P.steel} strokeWidth="1.6" strokeLinecap="round" />
      <Limb d="M63 55 Q66 62 64 60" color={P.olive} w={6} />
      <Hand x={64} y={60} r={2.8} />
      <Head x={HX} y={HY} r={HR} beard="short" beardColor={P.brown} hair={P.brown} />
      <path d="M58 19 Q66 10 74 9 Q68 14 60 23 Z" fill={P.brick} {...O} />
      <path d="M41 26 Q41 13 52 11 L62 13 Q57 18 59 26 Z" fill={P.brownLight} {...O} />
      <path d="M41.2 23.5 Q50 21.5 58.8 23.5" fill="none" stroke={P.oliveDark} strokeWidth="1.6" />
    </g>
  );
}

export const TELL_FIGURES: Record<Exclude<HFigure, 'kiraly'>, () => ReactElement> = {
  kuoni: Kuoni,
  gessler: Gessler,
  reding: Reding,
  stussi: Stussi,
  furst: Furst,
  rudenz: Rudenz,
  harras: Harras,
  tell: Tell,
};
