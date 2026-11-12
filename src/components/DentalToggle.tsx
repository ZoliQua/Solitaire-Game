import { useDental, useKitMessages } from '../arcade';

/**
 * Settings row for the shared dental mode (`arcade.dental`). It is the same
 * preference as the arcade top-bar toggle, so flipping either updates both.
 * Presentation only: switching it never touches the round.
 */
export const DentalToggle = ({ className }: { className?: string }) => {
  const k = useKitMessages();
  const [dental, setDental] = useDental();
  return (
    <label className={className ? `arc-field ${className}` : 'arc-field'} title={k('dentalDesc')}>
      <input type="checkbox" checked={dental} onChange={(e) => setDental(e.currentTarget.checked)} />
      <span>
        {k('dental')}
        <small style={{ display: 'block', opacity: 0.7, fontSize: 11 }}>{k('dentalDesc')}</small>
      </span>
    </label>
  );
};

export default DentalToggle;
