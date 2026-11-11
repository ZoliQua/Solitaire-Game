import { ArcadeShell } from './arcade';
import { SolitaireGame } from './SolitaireGame';

export default function App() {
  return (
    <ArcadeShell gameId="solitaire">
      <SolitaireGame />
    </ArcadeShell>
  );
}
