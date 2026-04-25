'use strict';

// ── sanitizeText ─────────────────────────────────────────────
const validator = require('validator');

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return validator.stripLow(validator.trim(str)).replace(/<[^>]*>/g, '');
}

describe('sanitizeText', () => {
  test('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  test('strips HTML tags', () => {
    expect(sanitizeText('<script>alert(1)</script>')).toBe('alert(1)');
  });

  test('strips nested tags', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
  });

  test('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('');
  });

  test('passes safe strings through unchanged', () => {
    expect(sanitizeText('Болд Баяр')).toBe('Болд Баяр');
  });
});

// ── validateAndCalcGrades ────────────────────────────────────
function validateAndCalcGrades(grades) {
  if (!Array.isArray(grades)) return { error: 'grades массив байх ёстой' };
  for (const g of grades) {
    if (!g.subject || typeof g.subject !== 'string' || !g.subject.trim()) {
      return { error: 'Хичээлийн нэр шаардлагатай' };
    }
    const exam1       = Number(g.exam1       ?? 0);
    const exam2       = Number(g.exam2       ?? 0);
    const attendance  = Number(g.attendance  ?? 0);
    const independent = Number(g.independent ?? 0);
    if (isNaN(exam1) || exam1 < 0 || exam1 > 30)              return { error: `${g.subject}: Шалгалт 1 оноо 0-30 байх ёстой` };
    if (isNaN(exam2) || exam2 < 0 || exam2 > 30)              return { error: `${g.subject}: Шалгалт 2 оноо 0-30 байх ёстой` };
    if (isNaN(attendance) || attendance < 0 || attendance > 20)    return { error: `${g.subject}: Ирц оноо 0-20 байх ёстой` };
    if (isNaN(independent) || independent < 0 || independent > 20) return { error: `${g.subject}: Бие даалт оноо 0-20 байх ёстой` };
    g.exam1       = exam1;
    g.exam2       = exam2;
    g.attendance  = attendance;
    g.independent = independent;
    g.score       = exam1 + exam2 + attendance + independent;
  }
  return { grades };
}

describe('validateAndCalcGrades', () => {
  test('returns error when not an array', () => {
    expect(validateAndCalcGrades(null)).toEqual({ error: 'grades массив байх ёстой' });
    expect(validateAndCalcGrades('bad')).toEqual({ error: 'grades массив байх ёстой' });
  });

  test('returns error when subject is missing', () => {
    const result = validateAndCalcGrades([{ exam1: 20, exam2: 20, attendance: 10, independent: 10 }]);
    expect(result.error).toBeDefined();
  });

  test('returns error when exam1 exceeds 30', () => {
    const result = validateAndCalcGrades([{ subject: 'Математик', exam1: 31 }]);
    expect(result.error).toMatch('Шалгалт 1');
  });

  test('returns error when attendance exceeds 20', () => {
    const result = validateAndCalcGrades([{ subject: 'Физик', exam1: 20, exam2: 20, attendance: 21, independent: 10 }]);
    expect(result.error).toMatch('Ирц');
  });

  test('correctly computes score', () => {
    const grades = [{ subject: 'Математик', exam1: 25, exam2: 22, attendance: 18, independent: 15 }];
    const result = validateAndCalcGrades(grades);
    expect(result.error).toBeUndefined();
    expect(result.grades[0].score).toBe(80);
  });

  test('score is sum of all four components (max 100)', () => {
    const grades = [{ subject: 'Монгол хэл', exam1: 30, exam2: 30, attendance: 20, independent: 20 }];
    const { grades: out } = validateAndCalcGrades(grades);
    expect(out[0].score).toBe(100);
  });

  test('defaults missing fields to 0', () => {
    const grades = [{ subject: 'Биологи' }];
    const { grades: out } = validateAndCalcGrades(grades);
    expect(out[0].score).toBe(0);
  });

  test('accepts empty array', () => {
    expect(validateAndCalcGrades([])).toEqual({ grades: [] });
  });
});

// ── token helpers ────────────────────────────────────────────
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET         = 'test_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
}

describe('JWT helpers', () => {
  const fakeUser = { _id: 'abc123', username: 'teacher01', role: 'teacher' };

  test('access token contains user fields', () => {
    const token = generateAccessToken(fakeUser);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.username).toBe('teacher01');
    expect(decoded.role).toBe('teacher');
  });

  test('refresh token contains user id only', () => {
    const token = generateRefreshToken(fakeUser);
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.username).toBeUndefined();
  });

  test('access token expires in 15 minutes', () => {
    const token = generateAccessToken(fakeUser);
    const decoded = jwt.decode(token);
    const diffMin = (decoded.exp - decoded.iat) / 60;
    expect(diffMin).toBe(15);
  });

  test('refresh token expires in 30 days', () => {
    const token = generateRefreshToken(fakeUser);
    const decoded = jwt.decode(token);
    const diffDays = (decoded.exp - decoded.iat) / 86400;
    expect(diffDays).toBe(30);
  });
});
