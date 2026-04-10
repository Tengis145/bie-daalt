export function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export const LETTER_STYLE = {
  A: { color: '#065f46', bg: '#d1fae5', rowBg: '#f0fdf4' },
  B: { color: '#1e40af', bg: '#dbeafe', rowBg: '#eff6ff' },
  C: { color: '#92400e', bg: '#fef3c7', rowBg: '#fffbeb' },
  D: { color: '#7c2d12', bg: '#ffedd5', rowBg: '#fff7ed' },
  F: { color: '#7f1d1d', bg: '#fee2e2', rowBg: '#fff5f5' },
};
