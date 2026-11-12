import { useEffect, useState } from 'react';
import { useDental, type ArcadeDemoProps } from '../arcade';
import { Table } from '../components/Table';
import { dealFreeCell } from '../logic/freecell';
import { applyMove } from '../logic/moves';
import type { SolitaireState } from '../logic/types';
import { DEMO_DEAL, DEMO_SCRIPT, parseMove } from './script';
import styles from './SolitaireDemo.module.css';

export const DEMO_STEP_MS = 420;
export const DEMO_PAUSE_MS = 2500;

let positions: SolitaireState[] | null = null;
/** Every position of the replay, computed once on the real engine. */
function demoPositions(): SolitaireState[] {
  if (!positions) {
    const list: SolitaireState[] = [dealFreeCell(DEMO_DEAL)];
    for (const code of DEMO_SCRIPT) list.push(applyMove(list[list.length - 1]!, parseMove(code)));
    positions = list;
  }
  return positions;
}

/**
 * Attract mode for the portal landing page: replays the scripted solution of FreeCell deal #164,
 * one move every 420 ms, rests 2.5 s on the won table and starts over. No keyboard, no stats, no
 * saves; frozen while `active` is false.
 */
export function SolitaireDemo({ active = true }: ArcadeDemoProps) {
  const [step, setStep] = useState(0);
  const [dental] = useDental();
  const done = step >= DEMO_SCRIPT.length;

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setStep((s) => (s >= DEMO_SCRIPT.length ? 0 : s + 1)), done ? DEMO_PAUSE_MS : DEMO_STEP_MS);
    return () => window.clearTimeout(id);
  }, [active, step, done]);

  return (
    <div className="arc-demo" aria-hidden="true">
      <div className={styles.demo}>
        <Table state={demoPositions()[step]!} deck="color" dental={dental} interactive={false} />
      </div>
    </div>
  );
}

export default SolitaireDemo;
