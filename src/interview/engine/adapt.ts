/**
 * Adaptive difficulty controller (the flow's "adapt" node), now over numeric star levels.
 * Clean solve → step up a level. Shaky / needed hints → hold or ease down. Pure and deterministic.
 * `select` handles the case where the exact level has no unused questions (nearest level is used).
 */
import type { Difficulty, Outcome } from './types';
import { clampDifficulty } from './types';

/**
 * Decide the star level of the NEXT question from how the last one went.
 * Only meaningful in mock mode; practice holds the level the student is exploring.
 */
export function nextDifficulty(current: Difficulty, outcome: Outcome, hintsUsed: number): Difficulty {
  switch (outcome) {
    case 'correct_method':
      // Clean solve with no hints → climb a level. With hints → hold (consolidate).
      return hintsUsed === 0 ? clampDifficulty(current + 1) : current;
    case 'correct_no_method':
      return current; // right but couldn't explain → hold at the same level
    case 'incorrect':
    case 'stuck':
      return clampDifficulty(current - 1); // ease off — give them another at a gentler level
    case 'skipped':
    case 'incomplete':
    default:
      return current; // a skip / DNF tells us nothing about level
  }
}
