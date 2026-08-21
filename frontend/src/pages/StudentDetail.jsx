import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PrintIcon } from '../components/Icons';
import { getImageUrl } from '../utils/imageUrl';
import { getLetterGrade, LETTER_STYLE } from '../utils/grades';
import { useLanguage } from '../utils/language.jsx';

function clamp(val, min, max) {
  const n = Number(val);
  return isNaN(n) ? min : Math.min(max, Math.max(min, n));
}
function calcScore(g) {
  return clamp(Number(g.exam1) + Number(g.exam2) + Number(g.attendance) + Number(g.independent), 0, 100);
}

// Mini horizontal progress bar
function MiniBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginTop: 3, height: 4, borderRadius: 3, background: '#e2e8f0', width: '100%', minWidth: 32 }}>
      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: color, transition: 'width .3s' }} />
    </div>
  );
}

// Custom chart tooltip showing all 4 components
function CustomTooltip({ active, payload, label }) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const g = payload[0]?.payload;
  if (!g) return null;
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.13)', fontSize: '0.8rem', minWidth: 160 }}>
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6, fontSize: '0.85rem' }}>{label}</div>
      {[
        { label: t('exam1Full'),       key: 'exam1',       max: 30, color: '#6366f1' },
        { label: t('exam2Full'),       key: 'exam2',       max: 30, color: '#8b5cf6' },
        { label: t('attendanceFull'),  key: 'attendance',  max: 20, color: '#06b6d4' },
        { label: t('independentFull'), key: 'independent', max: 20, color: '#10b981' },
      ].map(({ label: l, key, max, color }) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
          <span style={{ color: '#64748b' }}>{l}</span>
          <span style={{ fontWeight: 700, color }}>{g[key] ?? 0}<span style={{ color: '#94a3b8', fontWeight: 400 }}>/{max}</span></span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>{t('totalLabel')}</span>
        <span style={{ fontWeight: 900, color: '#4f46e5' }}>{g.score}</span>
      </div>
    </div>
  );
}

export default function StudentDetail({ onUpdate, onDelete, showToast }) {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editGrades, setEditGrades] = useState([]);
  const [newRow, setNewRow] = useState({ subject: '', exam1: 0, exam2: 0, attendance: 0, independent: 0 });
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    setFetchError('');
    axios.get(`/api/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(err => {
        console.error(err);
        setFetchError(err.response?.data?.message || t('detail_fetchError'));
      });
  }, [id]);

  // useMemo must be called before any early returns (Rules of Hooks)
  const { gradeDist, totals, chartHeight } = useMemo(() => {
    const gradeList = student?.grades ?? [];
    const n = gradeList.length;
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const sums = { exam1: 0, exam2: 0, attendance: 0, independent: 0 };
    for (const g of gradeList) {
      dist[getLetterGrade(g.score)]++;
      sums.exam1       += g.exam1       ?? 0;
      sums.exam2       += g.exam2       ?? 0;
      sums.attendance  += g.attendance  ?? 0;
      sums.independent += g.independent ?? 0;
    }
    return {
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

  if (fetchError) {
    return (
      <div className="loading-wrap">
        <p style={{ color: '#dc2626', fontWeight: 600 }}>{fetchError}</p>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>
          {t('backArrow')}
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        {t('detail_loading')}
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(t('detail_deleteConfirm', { name: student.name }))) {
      onDelete(id);
      navigate('/');
    }
  };

  const maxMap = { exam1: 30, exam2: 30, attendance: 20, independent: 20 };
  const barColors = { exam1: '#6366f1', exam2: '#8b5cf6', attendance: '#06b6d4', independent: '#10b981' };

  const handleEditStart = () => {
    setEditGrades(student.grades.map(g => ({
      subject:     g.subject,
      exam1:       g.exam1       ?? 0,
      exam2:       g.exam2       ?? 0,
      attendance:  g.attendance  ?? 0,
      independent: g.independent ?? 0,
      score:       g.score       ?? 0,
    })));
    setNewRow({ subject: '', exam1: 0, exam2: 0, attendance: 0, independent: 0 });
    setEditing(true);
  };

  const handleFieldChange = (idx, field, value) => {
    const updated = [...editGrades];
    updated[idx] = { ...updated[idx], [field]: clamp(value, 0, maxMap[field]) };
    updated[idx].score = calcScore(updated[idx]);
    setEditGrades(updated);
  };

  const handleNewRowChange = (field, value) => {
    setNewRow(prev => ({ ...prev, [field]: field === 'subject' ? value : clamp(value, 0, maxMap[field]) }));
  };

  const handleAddGrade = () => {
    const name = newRow.subject.trim();
    if (!name) { setAddError(t('modal_subjectNameRequired')); return; }
    if (editGrades.some(g => g.subject.toLowerCase() === name.toLowerCase())) {
      setAddError(t('modal_subjectExists', { name })); return;
    }
    const score = calcScore(newRow);
    setEditGrades(prev => [...prev, { ...newRow, subject: name, score }]);
    setNewRow({ subject: '', exam1: 0, exam2: 0, attendance: 0, independent: 0 });
    setAddError('');
  };

  const handleRemoveGrade = (idx) => setEditGrades(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    let finalGrades = editGrades;
    const pendingName = newRow.subject.trim();
    if (pendingName) {
      if (editGrades.some(g => g.subject.toLowerCase() === pendingName.toLowerCase())) {
        setAddError(t('modal_subjectExists', { name: pendingName })); return;
      }
      finalGrades = [...editGrades, { ...newRow, subject: pendingName, score: calcScore(newRow) }];
      setEditGrades(finalGrades);
      setNewRow({ subject: '', exam1: 0, exam2: 0, attendance: 0, independent: 0 });
      setAddError('');
    }
    setSaving(true);
    try {
      const updated = await onUpdate(id, { grades: finalGrades });
      setStudent(updated);
      setEditing(false);
      showToast(t('dash_gradeSaved'));
    } catch (err) {
      const msg = err.response?.data?.message || t('dash_saveError');
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) =>
    score >= 90 ? '#059669' : score >= 75 ? '#3b82f6' : score >= 60 ? '#d97706' : '#dc2626';

  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const grades   = editing ? editGrades : student.grades;
  const photoSrc = getImageUrl(student.photo);

  const total = student.grades.length || 1;

  return (
    <div className="detail-container">
      {/* Hero */}
      <div className="detail-hero">
        <div className="hero-left">
          {photoSrc ? (
            <img src={photoSrc} alt={student.name} className="hero-avatar-img" />
          ) : (
            <div className="hero-avatar">{initials}</div>
          )}
          <div>
            <h1 className="hero-name">{student.name}</h1>
            <span className="hero-class">{t('detail_classPrefix')} {student.className}</span>
            {student.academicYear && (
              <span className="hero-class" style={{ marginLeft: 8 }}>
                {student.academicYear} · {t('semesterOf', { semester: student.semester })}
              </span>
            )}
            {student.email && (
              <div style={{ fontSize: '0.78rem', color: '#6366f1', marginTop: 4, fontWeight: 500 }}>
                ✉ {student.email}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="hero-score">
            <div className="hero-score-label">{t('detail_avgTotal')}</div>
            <div className="hero-score-value">{student.average}</div>
          </div>
          {totals && (
            <div className="hero-breakdown">
              {[
                { label: t('exam1Full'),       val: totals.exam1,       max: 30, color: '#6366f1' },
                { label: t('exam2Full'),       val: totals.exam2,       max: 30, color: '#8b5cf6' },
                { label: t('attendanceFull'),  val: totals.attendance,  max: 20, color: '#06b6d4' },
                { label: t('independentFull'), val: totals.independent, max: 20, color: '#10b981' },
              ].map(({ label, val, max, color }) => (
                <div key={label} className="hero-breakdown-row">
                  <span>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong>{val}<em>/{max}</em></strong>
                    <div style={{ width: 40, height: 4, borderRadius: 3, background: '#e2e8f0' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: color, width: `${Math.round((val / max) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Chart */}
        <div className="chart-box">
          <h3>{t('detail_chartTitle')}</h3>
          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={student.grades}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="subject" type="category" width={75} tick={{ fontSize: 11, fill: '#374151' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,.06)' }} />
                <Bar dataKey="score" name={t('totalLabel')} radius={[0, 5, 5, 0]}>
                  {student.grades.map((entry, i) => (
                    <Cell key={i} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grades table */}
        <div className="grades-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>{t('detail_gradesDetailTitle')}</h3>
            {!editing ? (
              <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={handleEditStart}>
                {t('edit')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => setEditing(false)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-success" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={handleSave} disabled={saving}>
                  {saving ? t('detail_savingShort') : t('save')}
                </button>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="grades-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 0 8px', borderBottom: '1px solid #e2e8f0' }}>{t('subjectLabel')}</th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>{t('thExam1')}<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/30</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>{t('thExam2')}<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/30</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>{t('thAttendance')}<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/20</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>{t('thIndependent')}<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/20</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 0 8px', borderBottom: '1px solid #e2e8f0' }}>{t('totalLabel')}</th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 0 8px', borderBottom: '1px solid #e2e8f0' }}>{t('letterLabel')}</th>
                  {editing && <th style={{ borderBottom: '1px solid #e2e8f0' }} />}
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => {
                  const lg = getLetterGrade(g.score);
                  const ls = LETTER_STYLE[lg];
                  return (
                    <tr key={i} style={{ background: editing ? 'transparent' : ls.rowBg }}>
                      <td className="subject-name" style={{ fontSize: '0.82rem' }}>{g.subject}</td>
                      {editing ? (
                        ['exam1','exam2','attendance','independent'].map(field => (
                          <td key={field} style={{ padding: '5px 4px', textAlign: 'center' }}>
                            <input
                              className="exam-input"
                              type="number" min="0"
                              max={maxMap[field]}
                              value={g[field]}
                              onChange={e => handleFieldChange(i, field, e.target.value)}
                            />
                          </td>
                        ))
                      ) : (
                        ['exam1','exam2','attendance','independent'].map(field => (
                          <td key={field} style={{ textAlign: 'center', padding: '6px 4px' }}>
                            {(g[field] == null || g[field] === 0)
                              ? <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>—</span>
                              : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>{g[field]}</span>
                                  <MiniBar value={g[field]} max={maxMap[field]} color={barColors[field]} />
                                </div>
                              )
                            }
                          </td>
                        ))
                      )}
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>
                        <span className="score-pill" style={{
                          float: 'none', display: 'inline-block',
                          color: ls.color, backgroundColor: ls.bg,
                        }}>{g.score}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                        <span style={{ display: 'inline-block', minWidth: 28, padding: '2px 8px', borderRadius: 6, fontWeight: 800, fontSize: '0.85rem', color: ls.color, background: ls.bg }}>{lg}</span>
                      </td>
                      {editing && (
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          <button style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }} onClick={() => handleRemoveGrade(i)}>✕</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {editing && (
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '5px 0' }}>
                      <input className="exam-input" style={{ width: '100%', minWidth: 90, borderColor: addError ? '#dc2626' : '' }} type="text" placeholder={t('modal_newSubjectPlaceholder')} value={newRow.subject} onChange={e => { handleNewRowChange('subject', e.target.value); setAddError(''); }} onKeyDown={e => e.key === 'Enter' && handleAddGrade()} />
                      {addError && <div style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: 2 }}>{addError}</div>}
                    </td>
                    {['exam1','exam2','attendance','independent'].map(f => (
                      <td key={f} style={{ padding: '5px 4px', textAlign: 'center' }}>
                        <input className="exam-input" type="number" min="0" max={maxMap[f]} value={newRow[f]} onChange={e => handleNewRowChange(f, e.target.value)} />
                      </td>
                    ))}
                    <td />
                    <td />
                    <td style={{ textAlign: 'center', padding: '5px 4px' }}>
                      <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: '1rem' }} onClick={handleAddGrade}>+</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade distribution */}
        {student.grades.length > 0 && (
          <div style={{ display: 'flex', gap: 8, margin: '16px 0 0', flexWrap: 'wrap' }}>
            {gradeDist.map(({ grade, count }) => {
              const pct = Math.round((count / total) * 100);
              const ls  = LETTER_STYLE[grade];
              return (
                <div key={grade} style={{
                  flex: '1 1 60px', textAlign: 'center', borderRadius: 10,
                  padding: '10px 8px', background: ls.bg,
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: ls.color, lineHeight: 1 }}>{grade}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: ls.color, margin: '3px 0 1px' }}>{count}</div>
                  <div style={{ fontSize: '0.62rem', color: ls.color, opacity: 0.8 }}>{pct}%</div>
                  <div style={{ fontSize: '0.6rem', color: ls.color, opacity: 0.6 }}>{t('subjectsCountUnit')}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="detail-actions" style={{
        position: 'sticky', bottom: 0,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e2e8f0',
        zIndex: 10,
        padding: '12px 0',
        marginTop: 24,
      }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary">{t('backArrow')}</button>
        <button onClick={() => window.print()} className="btn btn-secondary">
          <PrintIcon size={15} color="currentColor" />{t('printLabel')}
        </button>
        <button onClick={handleDelete} className="btn btn-danger">{t('delete')}</button>
      </div>

      {/* Print report */}
      <div className="print-report">
        <div className="print-school">{t('detail_printSchoolName')}</div>
        <div className="print-title">{t('detail_printReportTitle')}</div>
        <div className="print-meta">
          <div><strong>{t('nameLabel')}:</strong> {student.name}</div>
          <div><strong>{t('classLabel')}:</strong> {student.className}</div>
          {student.academicYear && <div><strong>{t('detail_printYear')}</strong> {student.academicYear} · {t('semesterOf', { semester: student.semester })}</div>}
          <div><strong>{t('detail_printAvg')}</strong> {student.average} / 100</div>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>#</th><th>{t('subjectLabel')}</th>
              <th>{t('exam1Full')} (/30)</th><th>{t('exam2Full')} (/30)</th>
              <th>{t('attendanceFull')} (/20)</th><th>{t('independentFull')} (/20)</th><th>{t('totalLabel')} (/100)</th><th>{t('letterLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {student.grades.map((g, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{g.subject}</td>
                <td>{g.exam1 ?? 0}</td>
                <td>{g.exam2 ?? 0}</td>
                <td>{g.attendance ?? 0}</td>
                <td>{g.independent ?? 0}</td>
                <td><strong>{g.score}</strong></td>
                <td><strong>{getLetterGrade(g.score)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} style={{ textAlign: 'right' }}><strong>{t('detail_printAvgFooter')}</strong></td>
              <td><strong>{student.average}</strong></td>
              <td><strong>{getLetterGrade(parseFloat(student.average))}</strong></td>
            </tr>
          </tfoot>
        </table>
        <div className="print-footer">
          <div className="print-sign"><span>{t('detail_teacherSign')}</span></div>
          <div className="print-sign"><span>{t('detail_date')} {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'mn-MN')}</span></div>
        </div>
      </div>
    </div>
  );
}
