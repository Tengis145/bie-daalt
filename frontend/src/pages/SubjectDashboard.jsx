import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { BookIcon, ChartIcon, TrophyIcon, UsersIcon } from '../components/Icons';

// ── helpers ────────────────────────────────────────────────────
const SCORE_COLOR = (s) => s >= 90 ? '#059669' : s >= 75 ? '#3b82f6' : '#d97706';

function pct(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

// Aggregate data by subject from filtered students
function buildSubjectStats(students) {
  const map = {};
  students.forEach(student => {
    (student.grades || []).forEach(g => {
      if (!map[g.subject]) map[g.subject] = [];
      map[g.subject].push({
        studentId:   student._id,
        studentName: student.name,
        className:   student.className,
        exam1:       g.exam1       ?? 0,
        exam2:       g.exam2       ?? 0,
        attendance:  g.attendance  ?? 0,
        independent: g.independent ?? 0,
        score:       g.score       ?? 0,
      });
    });
  });

  return Object.entries(map)
    .map(([subject, entries]) => {
      const scores = entries.map(e => e.score);
      const sum    = scores.reduce((a, b) => a + b, 0);
      const avg    = scores.length ? sum / scores.length : 0;
      return {
        subject,
        entries: entries.sort((a, b) => b.score - a.score),
        count:     entries.length,
        avg:       parseFloat(avg.toFixed(1)),
        max:       Math.max(...scores),
        min:       Math.min(...scores),
        excellent: entries.filter(e => e.score >= 90).length,
        good:      entries.filter(e => e.score >= 75 && e.score < 90).length,
        below:     entries.filter(e => e.score < 75).length,
        avgExam1:  parseFloat((entries.reduce((s, e) => s + e.exam1, 0) / entries.length).toFixed(1)),
        avgExam2:  parseFloat((entries.reduce((s, e) => s + e.exam2, 0) / entries.length).toFixed(1)),
        avgAtt:    parseFloat((entries.reduce((s, e) => s + e.attendance, 0) / entries.length).toFixed(1)),
        avgInd:    parseFloat((entries.reduce((s, e) => s + e.independent, 0) / entries.length).toFixed(1)),
      };
    })
    .sort((a, b) => b.avg - a.avg);
}

// ── Custom tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Subject card ────────────────────────────────────────────────
function SubjectCard({ stat, selected, onClick }) {
  const exPct   = pct(stat.excellent, stat.count);
  const goodPct = pct(stat.good,      stat.count);
  const lowPct  = pct(stat.below,     stat.count);

  return (
    <div
      className={`subject-card ${selected ? 'subject-card-active' : ''}`}
      onClick={onClick}
    >
      <div className="subject-card-header">
        <h3 className="subject-card-name">{stat.subject}</h3>
        <span
          className="subject-card-avg"
          style={{ color: SCORE_COLOR(stat.avg), background: stat.avg >= 90 ? '#d1fae5' : stat.avg >= 75 ? '#dbeafe' : '#fef3c7' }}
        >
          {stat.avg}
        </span>
      </div>

      {/* Distribution bar */}
      <div className="dist-bar">
        {exPct   > 0 && <div className="dist-seg dist-excellent" style={{ width: `${exPct}%` }}   title={`Тэрлэлт: ${stat.excellent}`} />}
        {goodPct > 0 && <div className="dist-seg dist-good"      style={{ width: `${goodPct}%` }} title={`Сайн: ${stat.good}`} />}
        {lowPct  > 0 && <div className="dist-seg dist-below"     style={{ width: `${lowPct}%` }}  title={`Дунд: ${stat.below}`} />}
      </div>
      <div className="dist-legend">
        <span style={{ color: '#059669' }}>●&nbsp;{stat.excellent} тэрлэлт</span>
        <span style={{ color: '#3b82f6' }}>●&nbsp;{stat.good} сайн</span>
        <span style={{ color: '#d97706' }}>●&nbsp;{stat.below} дунд</span>
      </div>

      <div className="subject-card-meta">
        <div className="subject-meta-item"><span>Сурагч</span><strong>{stat.count}</strong></div>
        <div className="subject-meta-item"><span>Хамгийн өндөр</span><strong style={{ color: '#059669' }}>{stat.max}</strong></div>
        <div className="subject-meta-item"><span>Хамгийн бага</span><strong style={{ color: '#d97706' }}>{stat.min}</strong></div>
      </div>

      <div className="subject-card-components">
        <span>Ш1 <em>{stat.avgExam1}/30</em></span>
        <span>Ш2 <em>{stat.avgExam2}/30</em></span>
        <span>Ирц <em>{stat.avgAtt}/20</em></span>
        <span>БД <em>{stat.avgInd}/20</em></span>
      </div>

      {selected && <div className="subject-card-arrow">▼ Дэлгэрэнгүй</div>}
    </div>
  );
}

// ── Detail section ──────────────────────────────────────────────
function SubjectDetail({ stat }) {
  const chartData = stat.entries.map(e => ({
    name:        e.studentName.split(' ')[0],
    fullName:    e.studentName,
    className:   e.className,
    exam1:       e.exam1,
    exam2:       e.exam2,
    attendance:  e.attendance,
    independent: e.independent,
    score:       e.score,
  }));

  return (
    <div className="subject-detail">
      {/* Header */}
      <div className="subject-detail-hero">
        <div>
          <h2 className="subject-detail-title">{stat.subject}</h2>
          <p className="subject-detail-sub">{stat.count} сурагчийн дүнгийн дэлгэрэнгүй мэдээлэл</p>
        </div>
        <div className="subject-hero-stats">
          <div className="subject-hero-stat">
            <span>Дундаж</span>
            <strong style={{ color: SCORE_COLOR(stat.avg) }}>{stat.avg}</strong>
          </div>
          <div className="subject-hero-stat">
            <span>Өндөр</span>
            <strong style={{ color: '#059669' }}>{stat.max}</strong>
          </div>
          <div className="subject-hero-stat">
            <span>Бага</span>
            <strong style={{ color: '#d97706' }}>{stat.min}</strong>
          </div>
          <div className="subject-hero-stat">
            <span>Тэрлэлт</span>
            <strong style={{ color: '#059669' }}>{stat.excellent}</strong>
          </div>
        </div>
      </div>

      <div className="subject-detail-body">
        {/* Stacked bar chart */}
        <div className="subject-chart-box">
          <h3>Сурагч бүрийн оноо (бүрэлдэхүүнээр)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="exam1"       name="Шалгалт 1"  stackId="a" fill="#6366f1" />
              <Bar dataKey="exam2"       name="Шалгалт 2"  stackId="a" fill="#8b5cf6" />
              <Bar dataKey="attendance"  name="Ирц"        stackId="a" fill="#06b6d4" />
              <Bar dataKey="independent" name="Бие даалт"  stackId="a" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student ranking table */}
        <div className="subject-rank-box">
          <h3>Сурагчдын жагсаалт (өндрөөс бага)</h3>
          <div style={{ overflowY: 'auto', maxHeight: 320 }}>
            <table className="subject-rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'left' }}>Нэр</th>
                  <th>Анги</th>
                  <th>Ш1</th>
                  <th>Ш2</th>
                  <th>Ирц</th>
                  <th>БД</th>
                  <th>Нийт</th>
                </tr>
              </thead>
              <tbody>
                {stat.entries.map((e, i) => (
                  <tr key={e.studentId}>
                    <td className="rank-num">
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '50%', fontSize: '0.75rem', fontWeight: 800,
                        background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : 'transparent',
                        color: i < 3 ? 'white' : '#64748b',
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.studentName}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{e.className}</span>
                    </td>
                    <td className="rank-score">{e.exam1 || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td className="rank-score">{e.exam2 || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td className="rank-score">{e.attendance || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td className="rank-score">{e.independent || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ textAlign: 'center', padding: '8px 6px' }}>
                      <span className="score-pill" style={{
                        float: 'none', display: 'inline-block',
                        color: e.score >= 90 ? '#065f46' : e.score >= 75 ? '#1e40af' : '#92400e',
                        backgroundColor: e.score >= 90 ? '#d1fae5' : e.score >= 75 ? '#dbeafe' : '#fef3c7',
                      }}>{e.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function SubjectDashboard({ students = [], classes = [], loading }) {
  const [filterClass,      setFilterClass]      = useState('');
  const [selectedSubject,  setSelectedSubject]  = useState(null);
  const [sortBy,           setSortBy]           = useState('avg'); // avg | name | count

  const filtered = useMemo(
    () => filterClass ? students.filter(s => s.className === filterClass) : students,
    [students, filterClass]
  );

  const stats = useMemo(() => {
    const list = buildSubjectStats(filtered);
    if (sortBy === 'name')  return [...list].sort((a, b) => a.subject.localeCompare(b.subject));
    if (sortBy === 'count') return [...list].sort((a, b) => b.count - a.count);
    return list; // default: avg desc
  }, [filtered, sortBy]);

  const selected = stats.find(s => s.subject === selectedSubject) ?? null;

  const handleCardClick = (subjectName) => {
    setSelectedSubject(prev => prev === subjectName ? null : subjectName);
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        Мэдээлэл уншиж байна...
      </div>
    );
  }

  // Overall subject summary totals
  const totalSubjects = stats.length;
  const bestSubject   = stats[0] ?? null;
  const worstSubject  = stats.length ? stats[stats.length - 1] : null;
  const totalEntries  = stats.reduce((s, x) => s + x.count, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Хичээлүүд</h1>
        <p>Хичээл тус бүрийн дүнгийн статистик, график харьцуулалт</p>
      </div>

      {/* Summary stat cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon indigo"><BookIcon size={22} color="#4f46e5" /></div>
          <div className="stat-info">
            <div className="stat-value">{totalSubjects}</div>
            <div className="stat-label">Нийт хичээл</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><UsersIcon size={22} color="#2563eb" /></div>
          <div className="stat-info">
            <div className="stat-value">{totalEntries}</div>
            <div className="stat-label">Нийт дүн оруулалт</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrophyIcon size={22} color="#059669" /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: bestSubject ? '1.05rem' : '1.75rem', fontWeight: 800 }}>
              {bestSubject ? bestSubject.subject : '—'}
            </div>
            <div className="stat-label">Хамгийн өндөр дундаж ({bestSubject?.avg ?? '—'})</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><ChartIcon size={22} color="#d97706" /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: worstSubject ? '1.05rem' : '1.75rem', fontWeight: 800 }}>
              {worstSubject && worstSubject !== bestSubject ? worstSubject.subject : '—'}
            </div>
            <div className="stat-label">Хамгийн бага дундаж ({worstSubject && worstSubject !== bestSubject ? worstSubject.avg : '—'})</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="filter-group">
          <span className="filter-label">Анги:</span>
          <select
            className="filter-select"
            value={filterClass}
            onChange={e => { setFilterClass(e.target.value); setSelectedSubject(null); }}
          >
            <option value="">Бүх анги</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Эрэмбэлэх:</span>
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ minWidth: 140 }}>
            <option value="avg">Дундажаар</option>
            <option value="name">Нэрээр</option>
            <option value="count">Сурагчийн тоогоор</option>
          </select>
        </div>
        <div className="stats-pill">
          <span>Нийт:</span>
          <strong>{totalSubjects} хичээл</strong>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BookIcon size={48} color="#94a3b8" /></div>
          <h3>Хичээлийн мэдээлэл байхгүй байна</h3>
          <p>Эхлээд сурагч болон дүнгийн мэдээлэл оруулна уу.</p>
        </div>
      ) : (
        <>
          {/* Subject cards grid */}
          <div className="subject-grid">
            {stats.map(stat => (
              <SubjectCard
                key={stat.subject}
                stat={stat}
                selected={selectedSubject === stat.subject}
                onClick={() => handleCardClick(stat.subject)}
              />
            ))}
          </div>

          {/* Detail section */}
          {selected && <SubjectDetail stat={selected} />}
        </>
      )}
    </div>
  );
}
