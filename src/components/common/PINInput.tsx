import React from 'react';
import OTPInput from './OTPInput';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PINInputProps {
  /** Current digit values (array of single-char strings, empty string = unfilled) */
  digits: string[];
  /** Index of the next unfilled digit (-1 if all filled) */
  activeIndex: number;
  /** Whether to show error styling (red borders/digits) */
  isError?: boolean;
  /** Number of digit boxes (default: 6) */
  length?: number;
  /** Position to insert a dash separator (e.g. 3 = after 3rd box). Set to -1 for none. */
  dashAfter?: number;
}

// ─── PINInput ─────────────────────────────────────────────────────────────────
/**
 * Displays a row of PIN digit boxes with filled, active, and error states.
 * A dash separator is shown between the two halves by default (after index 2).
 */
export default function PINInput({
  digits,
  activeIndex,
  isError = false,
  dashAfter = 2,
}: PINInputProps): React.ReactElement {
  return (
    <OTPInput
      digits={digits}
      activeIndex={activeIndex}
      isError={isError}
      dashAfter={dashAfter}
      maskCharacter="*"
      filledTone="success"
    />
  );
}
