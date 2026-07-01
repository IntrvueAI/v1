import { describe, it, expect } from 'vitest';
import { selectQuestion, makeRng, listTopics, type SelectParams } from '../select';
import { getMathsBank } from '../index';
import type { BankQuestion, Difficulty } from '../../engine/types';

// difficulty is now a numeric star level (1 = easiest).
function q(id: string, topic: string, difficulty: Difficulty): BankQuestion {
  return { id, subject: 'maths', topic, difficulty, question: `Q ${id}`, answer: 'a' };
}

const BANK: BankQuestion[] = [
  q('a-1', 'arithmetic', 1),
  q('a-2', 'arithmetic', 2),
  q('a-3', 'arithmetic', 3),
  q('w-1', 'word-problems', 1),
  q('w-2', 'word-problems', 2),
  q('w-3', 'word-problems', 3),
];

const base = (over: Partial<SelectParams> = {}): SelectParams => ({
  bank: BANK,
  mode: 'mock',
  difficulty: 2,
  askedIds: [],
  questionIndex: 0,
  seed: 12345,
  ...over,
});

describe('makeRng', () => {
  it('is deterministic for a given seed and varies across seeds', () => {
    expect(makeRng(1)()).toBe(makeRng(1)());
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });
});

describe('selectQuestion', () => {
  it('never returns an already-asked question', () => {
    const askedIds: string[] = [];
    for (let i = 0; i < BANK.length; i++) {
      const chosen = selectQuestion(base({ askedIds: [...askedIds], questionIndex: i }));
      expect(chosen).not.toBeNull();
      expect(askedIds).not.toContain(chosen!.id);
      askedIds.push(chosen!.id);
    }
    expect(selectQuestion(base({ askedIds, questionIndex: BANK.length }))).toBeNull();
  });

  it('practice mode draws only from the chosen topic while it has questions', () => {
    const askedIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const chosen = selectQuestion(
        base({ mode: 'practice', topic: 'word-problems', askedIds: [...askedIds], questionIndex: i }),
      );
      expect(chosen!.topic).toBe('word-problems');
      askedIds.push(chosen!.id);
    }
  });

  it('serves the requested star level, falling back to the nearest available level', () => {
    const onlyHard = [q('a-3', 'arithmetic', 3)];
    const chosen = selectQuestion(base({ bank: onlyHard, difficulty: 1 }));
    expect(chosen!.id).toBe('a-3');
  });

  it('picks a question at the running star level', () => {
    const chosen = selectQuestion(base({ difficulty: 3 }))!;
    expect(chosen.difficulty).toBe(3);
  });

  it('mock prefers a category not yet covered (variety)', () => {
    const first = selectQuestion(base({ questionIndex: 0 }))!;
    const second = selectQuestion(
      base({ questionIndex: 1, askedIds: [first.id], recentTopics: [first.topic] }),
    )!;
    expect(second.topic).not.toBe(first.topic);
  });

  it('returns null on an empty bank', () => {
    expect(selectQuestion(base({ bank: [] }))).toBeNull();
  });
});

describe('real maths bank', () => {
  it('loads the authored maths questions with numeric star difficulty and question types', () => {
    const bank = getMathsBank();
    expect(bank.length).toBeGreaterThanOrEqual(20);
    expect(listTopics(bank).sort()).toEqual(
      ['estimation', 'numerical-reasoning', 'pattern-proof-explanation', 'structured-problem-solving'].sort(),
    );
    expect(bank.every((x) => typeof x.difficulty === 'number' && x.difficulty >= 1 && x.difficulty <= 5)).toBe(true);
    expect(bank.every((x) => x.questionType && x.rubric && x.hints && x.hints.length > 0)).toBe(true);
  });
});
