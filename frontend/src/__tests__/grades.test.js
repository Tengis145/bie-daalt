import { describe, it, expect } from 'vitest';
import { getLetterGrade, LETTER_STYLE } from '../utils/grades';

describe('getLetterGrade', () => {
  it('returns A for score >= 90', () => {
    expect(getLetterGrade(90)).toBe('A');
    expect(getLetterGrade(95)).toBe('A');
    expect(getLetterGrade(100)).toBe('A');
  });

  it('returns B for score 80–89', () => {
    expect(getLetterGrade(80)).toBe('B');
    expect(getLetterGrade(85)).toBe('B');
    expect(getLetterGrade(89)).toBe('B');
  });

  it('returns C for score 70–79', () => {
    expect(getLetterGrade(70)).toBe('C');
    expect(getLetterGrade(75)).toBe('C');
    expect(getLetterGrade(79)).toBe('C');
  });

  it('returns D for score 60–69', () => {
    expect(getLetterGrade(60)).toBe('D');
    expect(getLetterGrade(65)).toBe('D');
    expect(getLetterGrade(69)).toBe('D');
  });

  it('returns F for score below 60', () => {
    expect(getLetterGrade(59)).toBe('F');
    expect(getLetterGrade(0)).toBe('F');
  });

  it('boundary: 89 is B not A', () => {
    expect(getLetterGrade(89)).toBe('B');
  });

  it('boundary: 90 is A not B', () => {
    expect(getLetterGrade(90)).toBe('A');
  });
});

describe('LETTER_STYLE', () => {
  const grades = ['A', 'B', 'C', 'D', 'F'];

  it('has an entry for every letter grade', () => {
    grades.forEach(g => expect(LETTER_STYLE[g]).toBeDefined());
  });

  it('each entry has color, bg, rowBg', () => {
    grades.forEach(g => {
      expect(LETTER_STYLE[g]).toHaveProperty('color');
      expect(LETTER_STYLE[g]).toHaveProperty('bg');
      expect(LETTER_STYLE[g]).toHaveProperty('rowBg');
    });
  });

  it('A style uses green tones', () => {
    expect(LETTER_STYLE.A.bg).toBe('#d1fae5');
  });

  it('F style uses red tones', () => {
    expect(LETTER_STYLE.F.bg).toBe('#fee2e2');
  });
});
