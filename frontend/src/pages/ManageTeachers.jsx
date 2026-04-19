import { useState, useEffect } from 'react';
import axios from 'axios';

const EMPTY = { username: '', email: '', password: '', role: 'teacher' };

export default function ManageTeachers({ showToast }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/users');
      setUsers(res.data);
    } catch {
      showToast('Хэрэглэгчид авахад алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.post('/api/auth/users', form);
      showToast(`${form.username} амжилттай нэмэгдлээ`);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`"${user.username}"-г устгах уу?`)) return;
    try {
      await axios.delete(`/api/auth/users/${user._id}`);
      showToast(`${user.username} устгагдлаа`, 'info');
      setUsers(u => u.filter(x => x._id !== user._id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Устгахад алдаа гарлаа', 'error');
    }
  };

  const roleLabel = r => r === 'admin' ? 'Админ' : 'Багш';
  const roleBg    = r => r === 'admin' ? '#fef3c7' : '#dbeafe';
  const roleColor = r => r === 'admin' ? '#92400e' : '#1e40af';

  return (
    <div>
      <div className="page-header">
        <h1>Хэрэглэгч удирдах</h1>
        <p>Багш болон админ бүртгэлийг удирдах (зөвхөн админ)</p>
      </div>

      {/* Add teacher form */}
      <div className="chart-section" style={{ marginBottom: 24 }}>
        <h3>Шинэ хэрэглэгч нэмэх</h3>
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Хэрэглэгчийн нэр</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="bagsh123"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Имэйл хаяг</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="bagsh@school.mn"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Нууц үг</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Эрх</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="teacher">Багш</option>
                <option value="admin">Админ</option>
              </select>
            </div>
          </div>
          <button className="btn btn-success" type="submit" disabled={saving}>
            {saving ? 'Нэмж байна...' : '+ Хэрэглэгч нэмэх'}
          </button>
        </form>
      </div>

      {/* User list */}
      <div className="chart-section">
        <h3>Хэрэглэгчдийн жагсаалт ({users.length})</h3>
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">👤</div>
            <p>Хэрэглэгч байхгүй байна</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="exam-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>#</th>
                  <th style={{ textAlign: 'left' }}>Нэр</th>
                  <th style={{ textAlign: 'left' }}>Имэйл</th>
                  <th>Эрх</th>
                  <th>Бүртгэгдсэн</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {u.profileImage
                          ? <img src={u.profileImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#4f46e5' }}>
                              {u.username.slice(0, 2).toUpperCase()}
                            </div>
                        }
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{u.username}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{u.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: roleBg(u.role), color: roleColor(u.role) }}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('mn-MN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleDelete(u)}
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
