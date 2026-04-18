import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getLetterGrade, LETTER_STYLE } from '../utils/grades';
import { getImageUrl } from '../utils/imageUrl';
import { LogoutIcon, PrintIcon } from '../components/Icons';

function MiniBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginTop: 3, height: 4, borderRadius: 3, background: '#e2e8f0', width: '100%', minWidth: 32 }}>
      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: color, transition: 'width .3s' }} />
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const g = payload[0]?.payload;
  if (!g) return null;
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.13)', fontSize: '0.8rem', minWidth: 160 }}>
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{label}</div>
      {[
        { label: 'Шалгалт 1', key: 'exam1',       max: 30, color: '#6366f1' },
        { label: 'Шалгалт 2', key: 'exam2',       max: 30, color: '#8b5cf6' },
        { label: 'Ирц',       key: 'attendance',  max: 20, color: '#06b6d4' },
        { label: 'Бие даалт', key: 'independent', max: 20, color: '#10b981' },
      ].map(({ label: l, key, max, color }) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
          <span style={{ color: '#64748b' }}>{l}</span>
          <span style={{ fontWeight: 700, color }}>{g[key] ?? 0}<span style={{ color: '#94a3b8', fontWeight: 400 }}>/{max}</span></span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>Нийт</span>
        <span style={{ fontWeight: 900, color: '#4f46e5' }}>{g.score}</span>
      </div>
    </div>
  );
}

export default function StudentGrades({ student, onLogout }) {
  const navigate = useNavigate();

  const { average, gradeDist, totals, chartHeight } = useMemo(() => {
    const grades = student?.grades ?? [];
    const n = grades.length;
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const sums = { exam1: 0, exam2: 0, attendance: 0, independent: 0, score: 0 };
    for (const g of grades) {
      dist[getLetterGrade(g.score)]++;
      sums.exam1       += g.exam1       ?? 0;
      sums.exam2       += g.exam2       ?? 0;
      sums.attendance  += g.attendance  ?? 0;
      sums.independent += g.independent ?? 0;
      sums.score       += g.score       ?? 0;
    }
    return {
      average:     n > 0 ? (sums.score / n).toFixed(1) : '0.0',
      gradeDist:   ['A','B','C','D','F'].map(lg => ({ grade: lg, count: dist[lg] })),
      totals:      n > 0 ? {
        exam1:       (sums.exam1       / n).toFixed(1),
        exam2:       (sums.exam2       / n).toFixed(1),
        attendance:  (sums.attendance  / n).toFixed(1),
        independent: (sums.independent / n).toFixed(1),
      } : null,
      chartHeight: Math.max(280, n * 42),
    };
  }, [student?.grades]);

  if (!student) {
    return (
      <div className="loading-wrap">
        <p style={{ color: '#dc2626' }}>Мэдээлэл олдсонгүй.</p>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/login')}>
          ← Нэвтрэх хуудас руу буцах
        </button>
      </div>
    );
  }

  const avgNum    = parseFloat(average);
  const avgLetter = getLetterGrade(avgNum);
  const avgStyle  = LETTER_STYLE[avgLetter];
  const initials  = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const photoSrc  = getImageUrl(student.photo);
  const total     = student.grades.length || 1;
  const scoreColor = s => s >= 90 ? '#059669' : s >= 75 ? '#3b82f6' : s >= 60 ? '#d97706' : '#dc2626';
  const barColors  = { exam1: '#6366f1', exam2: '#8b5cf6', attendance: '#06b6d4', independent: '#10b981' };
  const maxMap     = { exam1: 30, exam2: 30, attendance: 20, independent: 20 };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>ЕБС Дүн Бүртгэл</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            onClick={() => window.print()}>
            <PrintIcon size={14} color="currentColor" /> Хэвлэх
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            onClick={onLogout}>
            <LogoutIcon size={14} color="currentColor" /> Гарах
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="detail-hero" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {photoSrc
            ? <img src={photoSrc} alt={student.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }} />
            : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{initials}</div>
          }
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e293b' }}>{student.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
              Анги: <strong>{student.className}</strong>
              {student.academicYear && <> · {student.academicYear} · {student.semester}-р улирал</>}
            </div>
            {student.email && <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>{student.email}</div>}
          </div>

          {/* Average score */}
          <div style={{ textAlign: 'center', padding: '12px 20px', borderRadius: 12, background: avgStyle.bg, border: `1.5px solid ${avgStyle.color}22` }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>ДУНДАЖ ОНОО</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{average}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: avgStyle.color, marginTop: 4 }}>{avgLetter}</div>
          </div>
        </div>

        {/* Component averages */}
        {totals && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Шалгалт 1', key: 'exam1', max: 30, color: '#6366f1' },
              { label: 'Шалгалт 2', key: 'exam2', max: 30, color: '#8b5cf6' },
              { label: 'Ирц',       key: 'attendance',  max: 20, color: '#06b6d4' },
              { label: 'Бие даалт', key: 'independent', max: 20, color: '#10b981' },
            ].map(({ label, key, max, color }) => (
              <div key={key} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{totals[key]}<span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>/{max}</span></div>
                <MiniBar value={parseFloat(totals[key])} max={max} color={color} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      {student.grades.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Хичээл тус бүрийн оноо</div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={student.grades} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="subject" width={100} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {student.grades.map((g, i) => (
                  <Cell key={i} fill={scoreColor(g.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Grade table */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 16 }}>Дүнгийн хүснэгт</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="exam-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Хичээл</th>
                <th>Ш1<span className="th-max">/30</span></th>
                <th>Ш2<span className="th-max">/30</span></th>
                <th>Ирц<span className="th-max">/20</span></th>
                <th>БД<span className="th-max">/20</span></th>
                <th>Нийт</th>
                <th>Үсгэн</th>
              </tr>
            </thead>
            <tbody>
              {student.grades.map((g, i) => {
                const lg = getLetterGrade(g.score);
                const ls = LETTER_STYLE[lg];
                return (
                  <tr key={i} style={{ background: ls.rowBg }}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>
                      {g.subject}
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {Object.entries(barColors).map(([key, color]) => (
                          <div key={key} style={{ flex: 1, minWidth: 28 }}>
                            <MiniBar value={g[key] ?? 0} max={maxMap[key]} color={color} />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{g.exam1 ?? 0}</td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{g.exam2 ?? 0}</td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{g.attendance ?? 0}</td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{g.independent ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 6, fontWeight: 700, color: ls.color, background: ls.bg }}>{g.score}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', minWidth: 28, padding: '2px 8px', borderRadius: 6, fontWeight: 900, color: ls.color, background: ls.bg }}>{lg}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 16 }}>Үсгэн дүнгийн тархалт</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {gradeDist.map(({ grade, count }) => {
            const ls = LETTER_STYLE[grade];
            return (
              <div key={grade} style={{ flex: 1, minWidth: 80, textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: ls.bg, border: `1.5px solid ${ls.color}33` }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: ls.color }}>{grade}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{count}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{Math.round(count / total * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
        Дүн буруу байвал багшдаа хандана уу.
      </p>
    </div>
  );
}
