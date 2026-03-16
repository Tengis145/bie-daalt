import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UsersIcon, ChartIcon, TrophyIcon, ClassIcon } from '../components/Icons';

export default function Dashboard({ students, classes, loading, onFilter, onDelete }) {
  const totalStudents = students.length;
  const avgScore = totalStudents
    ? (students.reduce((sum, s) => sum + (parseFloat(s.average) || 0), 0) / totalStudents).toFixed(1)
    : '—';
  const topStudent = totalStudents
    ? students.reduce((a, b) => (parseFloat(a.average) || 0) >= (parseFloat(b.average) || 0) ? a : b)
    : null;
  const classCount = classes.length;

  const chartData = students
    .map(s => ({ name: s.name, average: parseFloat(s.average) || 0 }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 15);

  const getGradeClass = (avg) =>
    avg >= 90 ? 'grade-excellent' : avg >= 75 ? 'grade-good' : 'grade-average';

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        Мэдээлэл уншиж байна...
      </div>
    );
  }

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
          <div className="stat-info">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Нийт сурагч</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon indigo"><ChartIcon size={22} color="#4f46e5" /></div>
          <div className="stat-info">
            <div className="stat-value">{avgScore}</div>
            <div className="stat-label">Дундаж дүн</div>
          </div>
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
        <div className="stat-card">
          <div className="stat-icon orange"><ClassIcon size={22} color="#d97706" /></div>
          <div className="stat-info">
            <div className="stat-value">{classCount}</div>
            <div className="stat-label">Нийт анги</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="filter-group">
          <span className="filter-label">Анги сонгох:</span>
          <select
            className="filter-select"
            onChange={(e) => onFilter(e.target.value)}
            defaultValue=""
          >
            <option value="">Бүх анги</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="stats-pill">
          <span>Нийт:</span>
          <strong>{totalStudents} сурагч</strong>
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
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
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
          <div className="empty-state-icon">📋</div>
          <h3>Сурагч бүртгэгдээгүй байна</h3>
          <p>Шинэ сурагч нэмэхийн тулд дээд талын "Сурагч нэмэх" товч дарна уу.</p>
        </div>
      ) : (
        <div className="student-grid">
          {students.map(student => (
            <div key={student._id} className="student-card">
              <div className="card-top-bar" />
              <div className="card-header">
                <div>
                  <h3 className="card-name">{student.name}</h3>
                  <div className="card-class">{student.grades?.length || 0} хичээл</div>
                </div>
                <span className="badge">{student.className}</span>
              </div>
              <div className="card-body">
                <div className="score-row">
                  <span className="score-label">Дундаж дүн</span>
                  <span className={`score-val ${getGradeClass(student.average)}`}>
                    {student.average}
                  </span>
                </div>
                <span className="subject-count">
                  {student.average >= 90 ? 'Тэрлэлт' : student.average >= 75 ? 'Сайн' : 'Дунд'}
                </span>
              </div>
              <div className="card-actions">
                <Link to={`/student/${student._id}`} className="btn btn-primary">
                  Дэлгэрэнгүй
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm(`"${student.name}"-г устгах уу?`)) onDelete(student._id);
                  }}
                  className="btn btn-danger"
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
