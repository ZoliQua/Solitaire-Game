import { useId } from 'react';
import { Tooth } from '../../components/DentalIcons';
import { svgId } from './svgId';
import { P } from './parts';

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

/** Traditional back: diamond lattice on olive, a cream medallion with a rosette (dental: the kit tooth). */
export function Back({ dental }: { dental: boolean }) {
  const pat = svgId(useId(), 'hback');
  return (
    <>
      <defs>
        <pattern id={pat} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="translate(5 5)">
          <rect width="10" height="10" fill={P.oliveDark} />
          <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="none" stroke={P.ochre} strokeWidth="0.7" />
          <circle cx="5" cy="5" r="1.2" fill={P.brick} />
          <circle cx="0" cy="0" r="0.8" fill={P.ochreLight} />
          <circle cx="10" cy="0" r="0.8" fill={P.ochreLight} />
          <circle cx="0" cy="10" r="0.8" fill={P.ochreLight} />
          <circle cx="10" cy="10" r="0.8" fill={P.ochreLight} />
        </pattern>
      </defs>
      <rect x="1" y="1" width="98" height="158" rx="7" fill={P.stock} stroke={P.ink} strokeWidth="1.4" />
      <rect data-back-pattern="" x="6" y="6" width="88" height="148" rx="3" fill={`url(#${pat})`} stroke={P.ink} strokeWidth="1" />
      <rect x="9" y="9" width="82" height="142" rx="2" fill="none" stroke={P.ochre} strokeWidth="0.8" />
      <ellipse cx="50" cy="80" rx="23" ry="29" fill={P.stock} stroke={P.ink} strokeWidth="1.3" />
      <ellipse cx="50" cy="80" rx="19.5" ry="25.5" fill="none" stroke={P.brick} strokeWidth="1" />
      {dental ? (
        <g data-testid="hcard-back-tooth">
          <g transform="translate(32 62)">
            <Tooth size={36} fill={P.linen} stroke={P.ink} />
          </g>
        </g>
      ) : (
        <g data-testid="hcard-back-classic" transform="translate(50 80)">
          {PETALS.map((a) => (
            <ellipse key={a} cx="0" cy="-8" rx="3.4" ry="7" transform={`rotate(${a})`} fill={a % 90 ? P.ochre : P.brick} stroke={P.ink} strokeWidth="0.8" />
          ))}
          <circle r="3.6" fill={P.olive} stroke={P.ink} strokeWidth="0.8" />
        </g>
      )}
    </>
  );
}
