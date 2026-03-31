import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UsersIcon, ChartIcon, TrophyIcon, ClassIcon, SearchIcon, DownloadIcon, UploadIcon } from '../components/Icons';

const CY = new Date().getFullYear();
const YEARS = [`${CY - 2}-${CY - 1}`, `${CY - 1}-${CY}`, `${CY}-${CY + 1}`];

function clamp(val, min, max) { const n = Number(val); return isNaN(n) ? min : Math.min(max, Math.max(min, n)); }
function calcScore(g) { return clamp(Number(g.exam1)+Number(g.exam2)+Number(g.attendance)+Number(g.independent),0,100); }

// ── Inline Edit Modal ────────────────────────────────────────
const EMPTY_NEW = { subject: '', exam1: 0, exam2: 0, attendance: 0, independent: 0 };

function EditModal({ student, onSave, onClose }) {
  const [grades, setGrades] = useState(
    student.grades.map(g => ({
      subject: g.subject, exam1: g.exam1??0, exam2: g.exam2??0,
      attendance: g.attendance??0, independent: g.independent??0, score: g.score??0,
    }))
  );
  const [newRow, setNewRow]   = useState(EMPTY_NEW);
  const [saving, setSaving]   = useState(false);
  const maxMap = { exam1: 30, exam2: 30, attendance: 20, independent: 20 };

  const handleChange = (idx, field, value) => {
    const updated = [...grades];
    updated[idx] = { ...updated[idx], [field]: clamp(value, 0, maxMap[field]) };
    updated[idx].score = calcScore(updated[idx]);
    setGrades(updated);
  };

  const handleNewChange = (field, value) => {
    const updated = { ...newRow, [field]: field === 'subject' ? value : clamp(value, 0, maxMap[field]) };
    setNewRow(updated);
  };

  const handleAddRow = () => {
    const name = newRow.subject.trim();
    if (!name) return;
    if (grades.some(g => g.subject.toLowerCase() === name.toLowerCase())) return;
    const score = calcScore(newRow);
    setGrades([...grades, { ...newRow, subject: name, score }]);
    setNewRow(EMPTY_NEW);
  };

  const handleRemove = (idx) => setGrades(grades.filter((_, i) => i !== idx));

  const handleSave = async () => { setSaving(true); try { await onSave(grades); } finally { setSaving(false); } };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2 className="modal-title">{student.name}</h2><span className="badge">{student.className}</span></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <table className="exam-table">
            <thead>
              <tr>
                <th style={{ textAlign:'left' }}>Хичээл</th>
                <th>Ш1<span className="th-max">/30</span></th>
                <th>Ш2<span className="th-max">/30</span></th>
                <th>Ирц<span className="th-max">/20</span></th>
                <th>БД<span className="th-max">/20</span></th>
                <th>Нийт</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="subject-name">{g.subject}</td>
                  {['exam1','exam2','attendance','independent'].map(f => (
                    <td key={f}><input className="exam-input" type="number" min="0" max={maxMap[f]} value={g[f]} onChange={e=>handleChange(i,f,e.target.value)} /></td>
                  ))}
                  <td><span className="score-pill" style={{ float:'none', display:'inline-block', color:g.score>=90?'#065f46':g.score>=75?'#1e40af':'#92400e', backgroundColor:g.score>=90?'#d1fae5':g.score>=75?'#dbeafe':'#fef3c7' }}>{g.score}</span></td>
                  <td><button style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:'1rem', lineHeight:1 }} onClick={()=>handleRemove(i)}>✕</button></td>
                </tr>
              ))}
              {/* Шинэ хичээл нэмэх мөр */}
              <tr style={{ background: '#f8fafc' }}>
                <td><input className="exam-input" style={{ width:'100%', minWidth:90 }} type="text" placeholder="Хичээлийн нэр" value={newRow.subject} onChange={e=>handleNewChange('subject',e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAddRow()} /></td>
                {['exam1','exam2','attendance','independent'].map(f => (
                  <td key={f}><input className="exam-input" type="number" min="0" max={maxMap[f]} value={newRow[f]} onChange={e=>handleNewChange(f,e.target.value)} /></td>
                ))}
                <td />
                <td><button className="btn btn-success" style={{ padding:'4px 10px', fontSize:'1rem', lineHeight:1 }} onClick={handleAddRow}>+</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Болих</button>
          <button className="btn btn-success" onClick={handleSave} disabled={saving}>{saving?'Хадгалж байна...':'Хадгалах'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
export default function Dashboard({ students, pagination, classes, loading, onFilter, onDelete, onUpdate, showToast }) {
  const [editingStudent, setEditingStudent] = useState(null);
  const [search,         setSearch]         = useState('');
  const [classFilter,    setClassFilter]    = useState('');
  const [yearFilter,     setYearFilter]     = useState('');
  const [semFilter,      setSemFilter]      = useState('');
  const [page,           setPage]           = useState(1);
  const debounceRef = useRef(null);
  const importRef   = useRef(null);

  // Filter өөрчлөгдөх үед page-г 1 болгоно
  useEffect(() => { setPage(1); }, [search, classFilter, yearFilter, semFilter]);

  // Server-side filtering + pagination — debounce 400ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilter({ search, className: classFilter, academicYear: yearFilter, semester: semFilter, page });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, classFilter, yearFilter, semFilter, page]);

  const filtered    = students;
  const totalPages  = pagination?.pages || 1;
  const currentPage = pagination?.page  || 1;
  const totalCount  = pagination?.total || filtered.length;

  const totalStudents = filtered.length;
  const avgScore = totalStudents
    ? (filtered.reduce((sum, s) => sum + (parseFloat(s.average)||0), 0) / totalStudents).toFixed(1) : '—';
  const topStudent = totalStudents
    ? filtered.reduce((a,b) => (parseFloat(a.average)||0) >= (parseFloat(b.average)||0) ? a : b) : null;
  const atRiskCount = filtered.filter(s => parseFloat(s.average) < 60).length;

  const chartData = filtered
    .map(s => ({ name: s.name.split(' ')[0], average: parseFloat(s.average)||0 }))
    .sort((a,b) => b.average - a.average).slice(0, 15);

  const getGradeClass = (avg) => parseFloat(avg) >= 90 ? 'grade-excellent' : parseFloat(avg) >= 75 ? 'grade-good' : 'grade-average';

  // ── Excel import template ────────────────────────────────
  const downloadTemplate = () => {
    const rows = [
      { 'Нэр': 'Жишээ Сурагч', 'Анги': '10А', 'Хичээлийн жил': '2024-2025', 'Улирал': 1,
        'Хичээл': 'Математик', 'Шалгалт 1 (/30)': 25, 'Шалгалт 2 (/30)': 27, 'Ирц (/20)': 18, 'Бие даалт (/20)': 16 },
      { 'Нэр': 'Жишээ Сурагч', 'Анги': '10А', 'Хичээлийн жил': '2024-2025', 'Улирал': 1,
        'Хичээл': 'Физик', 'Шалгалт 1 (/30)': 20, 'Шалгалт 2 (/30)': 22, 'Ирц (/20)': 15, 'Бие даалт (/20)': 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Загвар');
    XLSX.writeFile(wb, 'suraguud_template.xlsx');
    showToast('Загвар файл татаж авлаа');
  };

  // ── Excel import ─────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!importRef.current) return;
    importRef.current.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb   = XLSX.read(ev.target.result, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        // Group rows by "Нэр + Анги + Хичээлийн жил + Улирал"
        const map = new Map();
        for (const row of rows) {
          const name  = String(row['Нэр'] || '').trim();
          const cls   = String(row['Анги'] || '').trim();
          const year  = String(row['Хичээлийн жил'] || '').trim();
          const sem   = Number(row['Улирал'] || 1);
          if (!name || !cls) continue;
          const key = `${name}||${cls}||${year}||${sem}`;
          if (!map.has(key)) map.set(key, { name, className: cls, academicYear: year, semester: sem, grades: [] });
          const subj = String(row['Хичээл'] || '').trim();
          if (subj) {
            map.get(key).grades.push({
              subject:     subj,
              exam1:       Number(row['Шалгалт 1 (/30)'] || 0),
              exam2:       Number(row['Шалгалт 2 (/30)'] || 0),
              attendance:  Number(row['Ирц (/20)']       || 0),
              independent: Number(row['Бие даалт (/20)'] || 0),
            });
          }
        }

        if (map.size === 0) { showToast('Файлд өгөгдөл олдсонгүй', 'error'); return; }

        let ok = 0, fail = 0;
        for (const student of map.values()) {
          try {
            await axios.post('/api/students', student);
            ok++;
          } catch { fail++; }
        }
        showToast(`${ok} сурагч нэмэгдлаа${fail ? `, ${fail} алдаа гарлаа` : ''}`, fail ? 'error' : 'success');
        // Refresh list
        onFilter({ search, className: classFilter, academicYear: yearFilter, semester: semFilter, page: 1 });
        setPage(1);
      } catch { showToast('Файл уншихад алдаа гарлаа', 'error'); }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Excel export ─────────────────────────────────────────
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ерөнхий жагсаалт
    const summary = filtered.map((s, i) => ({
      '#': i + 1,
      'Нэр': s.name,
      'Анги': s.className,
      'Хичээлийн жил': s.academicYear || '—',
      'Улирал': s.semester || '—',
      'Дундаж дүн': parseFloat(s.average) || 0,
      'Үнэлгээ': parseFloat(s.average) >= 90 ? 'Тэрлэлт' : parseFloat(s.average) >= 75 ? 'Сайн' : 'Дунд',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Ерөнхий жагсаалт');

    // Sheet 2: Дэлгэрэнгүй дүн
    const detail = [];
    filtered.forEach(s => {
      (s.grades || []).forEach(g => {
        detail.push({
          'Нэр': s.name, 'Анги': s.className,
          'Хичээл': g.subject,
          'Шалгалт 1 (/30)': g.exam1 ?? 0,
          'Шалгалт 2 (/30)': g.exam2 ?? 0,
          'Ирц (/20)': g.attendance ?? 0,
          'Бие даалт (/20)': g.independent ?? 0,
          'Нийт (/100)': g.score ?? 0,
        });
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detail), 'Дэлгэрэнгүй дүн');

    const label = yearFilter ? `_${yearFilter}` : '';
    XLSX.writeFile(wb, `suraguud_dun${label}.xlsx`);
    showToast('Excel файл татаж авлаа');
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleDelete = (student) => {
    if (window.confirm(`"${student.name}"-г устгах уу?`)) {
      onDelete(student._id);
      showToast(`${student.name} устгагдлаа`, 'info');
    }
  };

  const handleSaveEdit = async (grades) => {
    try {
      await onUpdate(editingStudent._id, { grades });
      showToast('Дүн амжилттай хадгалагдлаа');
      setEditingStudent(null);
    } catch { showToast('Хадгалахад алдаа гарлаа', 'error'); }
  };

  const getComponentAvgs = (student) => {
    const g = student.grades;
    if (!g?.length) return null;
    const avg = (key, max) => ({ val: (g.reduce((s, x) => s + (x[key]??0), 0) / g.length).toFixed(1), max });
    return { exam1: avg('exam1',30), exam2: avg('exam2',30), attendance: avg('attendance',20), independent: avg('independent',20) };
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" />Мэдээлэл уншиж байна...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Хяналтын самбар</h1>
        <p>Сурагчдын дүн, статистик мэдээллийг харах</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><UsersIcon size={22} color="#2563eb" /></div>
          <div className="stat-info"><div className="stat-value">{totalCount}</div><div className="stat-label">Нийт сурагч</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon indigo"><ChartIcon size={22} color="#4f46e5" /></div>
          <div className="stat-info"><div className="stat-value">{avgScore}</div><div className="stat-label">Дундаж дүн</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrophyIcon size={22} color="#059669" /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: topStudent ? '1.1rem' : '1.75rem' }}>
              {topStudent ? topStudent.name.split(' ')[0] : '—'}
            </div>
            <div className="stat-label">Тэргүүлэгч сурагч</div>
          </div>
        </div>
        <div className="stat-card" style={atRiskCount > 0 ? { borderLeft: '3px solid #dc2626' } : {}}>
          <div className="stat-icon" style={{ background: atRiskCount > 0 ? '#fee2e2' : undefined }}>
            <ClassIcon size={22} color={atRiskCount > 0 ? '#dc2626' : '#d97706'} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: atRiskCount > 0 ? '#dc2626' : undefined }}>{atRiskCount}</div>
            <div className="stat-label">Анхааруулга (60-аас доош)</div>
          </div>
        </div>
      </div>

      {/* Controls — search + filters + export */}
      <div className="controls" style={{ flexWrap: 'wrap', gap: 12 }}>
        {/* Search */}
        <div className="search-wrap">
          <SearchIcon size={16} color="#94a3b8" />
          <input
            className="search-input"
            placeholder="Нэрээр хайх..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Class filter */}
        <div className="filter-group">
          <span className="filter-label">Анги:</span>
          <select className="filter-select" value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">Бүгд</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Academic year filter */}
        <div className="filter-group">
          <span className="filter-label">Жил:</span>
          <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ minWidth: 130 }}>
            <option value="">Бүгд</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Semester filter */}
        <div className="filter-group">
          <span className="filter-label">Улирал:</span>
          <select className="filter-select" value={semFilter} onChange={e => setSemFilter(e.target.value)} style={{ minWidth: 110 }}>
            <option value="">Бүгд</option>
            <option value="1">1-р улирал</option>
            <option value="2">2-р улирал</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="stats-pill"><span>Нийт:</span><strong>{totalStudents} сурагч</strong></div>
          <button className="btn btn-secondary" style={{ padding:'8px 14px', fontSize:'0.82rem' }} onClick={downloadTemplate}>
            <DownloadIcon size={15} color="currentColor" />Загвар
          </button>
          <button className="btn btn-secondary" style={{ padding:'8px 14px', fontSize:'0.82rem' }} onClick={() => importRef.current?.click()}>
            <UploadIcon size={15} color="currentColor" />Excel оруулах
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleImport} />
          {filtered.length > 0 && (
            <button className="btn btn-secondary" style={{ padding:'8px 14px', fontSize:'0.82rem' }} onClick={exportExcel}>
              <DownloadIcon size={15} color="currentColor" />Excel
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="chart-section">
          <h3>Сурагчдын дундаж дүнгийн харьцуулалт</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }} cursor={{ fill: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="average" fill="#4f46e5" name="Дундаж дүн" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Student Grid */}
      {totalStudents === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{search ? '🔍' : '📋'}</div>
          <h3>{search ? `"${search}" нэртэй сурагч олдсонгүй` : 'Сурагч бүртгэгдээгүй байна'}</h3>
          <p>{search ? 'Өөр нэрийг хайж үзнэ үү.' : 'Шинэ сурагч нэмэхийн тулд дээд талын "Сурагч нэмэх" товч дарна уу.'}</p>
        </div>
      ) : (
        <div className="student-grid">
          {filtered.map(student => {
            const avgs     = getComponentAvgs(student);
            const isAtRisk = parseFloat(student.average) < 60;
            return (
              <div key={student._id} className={`student-card${isAtRisk ? ' at-risk' : ''}`}>
                <div className="card-top-bar" style={isAtRisk ? { background: '#dc2626' } : {}} />
                <div className="card-header">
                  <div>
                    <h3 className="card-name">{student.name}</h3>
                    <div className="card-class">{student.grades?.length||0} хичээл
                      {student.academicYear && <span className="card-year-badge">{student.academicYear} · {student.semester}-р улирал</span>}
                    </div>
                  </div>
                  <span className="badge">{student.className}</span>
                </div>
                <div className="card-body">
                  <div className="score-row">
                    <span className="score-label">Дундаж дүн</span>
                    <span className={`score-val ${getGradeClass(student.average)}`}>{student.average}</span>
                  </div>
                  {isAtRisk && (
                    <div className="at-risk-banner">Дүн хангалтгүй — анхааруулга</div>
                  )}
                  {avgs && (
                    <div className="score-breakdown">
                      <span className="breakdown-item"><span className="breakdown-label">Ш1</span><span className="breakdown-val">{avgs.exam1.val}<em>/{avgs.exam1.max}</em></span></span>
                      <span className="breakdown-item"><span className="breakdown-label">Ш2</span><span className="breakdown-val">{avgs.exam2.val}<em>/{avgs.exam2.max}</em></span></span>
                      <span className="breakdown-item"><span className="breakdown-label">Ирц</span><span className="breakdown-val">{avgs.attendance.val}<em>/{avgs.attendance.max}</em></span></span>
                      <span className="breakdown-item"><span className="breakdown-label">БД</span><span className="breakdown-val">{avgs.independent.val}<em>/{avgs.independent.max}</em></span></span>
                    </div>
                  )}
                  <span className="subject-count">
                    {parseFloat(student.average) >= 90 ? 'Тэрлэлт' : parseFloat(student.average) >= 75 ? 'Сайн' : parseFloat(student.average) >= 60 ? 'Дунд' : 'Хангалтгүй'}
                  </span>
                </div>
                <div className="card-actions" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <Link to={`/student/${student._id}`} className="btn btn-primary">Дэлгэрэнгүй</Link>
                  <button className="btn btn-secondary" onClick={() => setEditingStudent(student)}>Засах</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(student)}>Устгах</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={currentPage <= 1}>
            ← Өмнөх
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn${p === currentPage ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={currentPage >= totalPages}>
            Дараах →
          </button>
        </div>
      )}

      {editingStudent && (
        <EditModal student={editingStudent} onSave={handleSaveEdit} onClose={() => setEditingStudent(null)} />
      )}
    </div>
  );
}
