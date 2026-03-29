import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { SchoolIcon, DashboardIcon, PlusIcon, LockIcon, LogoutIcon } from './components/Icons';
import Dashboard from './pages/Dashboard';
import StudentDetail from './pages/StudentDetail';
import AddStudent from './pages/AddStudent';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';

const API = '/api/students';

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('ebs_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ebs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => { setAuthHeader(token); }, [token]);

  const handleLogin = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('ebs_token', newToken);
    localStorage.setItem('ebs_user', JSON.stringify(user));
    setAuthHeader(newToken);
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setStudents([]);
    setClasses([]);
    localStorage.removeItem('ebs_token');
    localStorage.removeItem('ebs_user');
    setAuthHeader(null);
  };

  const fetchStudents = async (className = '') => {
    setLoading(true);
    try {
      const url = className ? `${API}?className=${encodeURIComponent(className)}` : API;
      const res = await axios.get(url);
      setStudents(res.data);
    } catch (e) {
      if (e.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/meta/classes`);
      setClasses(res.data);
    } catch (e) {
      console.error('Ангиуд авахад алдаа:', e);
    }
  };

  const addStudent = async (data) => {
    const res = await axios.post(API, data);
    await fetchStudents();
    await fetchClasses();
    return res.data;
  };

  const updateStudent = async (id, data) => {
    const res = await axios.put(`${API}/${id}`, data);
    await fetchStudents();
    return res.data;
  };

  const deleteStudent = async (id) => {
    await axios.delete(`${API}/${id}`);
    await fetchStudents();
    await fetchClasses();
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchClasses();
    }
  }, [token]);

  const navLinks = [
    { to: '/', label: 'Хяналтын самбар', icon: <DashboardIcon size={16} color="currentColor" /> },
    { to: '/add', label: 'Сурагч нэмэх',  icon: <PlusIcon size={16} color="currentColor" /> },
  ];

  // Get initials for avatar
  const initials = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="app">
      {token && (
        <header className="header">
          <div className="header-inner">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
              <div className="logo-icon-wrap">
                <SchoolIcon size={20} color="white" />
              </div>
              <div>
                <div className="logo-title">ЕБС Дүн Бүртгэл</div>
                <div className="logo-sub">Ерөнхий боловсролын сургууль</div>
              </div>
            </Link>

            <nav className="nav">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.icon}{link.label}
                </Link>
              ))}
              <Link
                to="/change-password"
                className={`nav-link ${location.pathname === '/change-password' ? 'active' : ''}`}
              >
                <LockIcon size={16} color="currentColor" />Нууц үг
              </Link>

              <div className="nav-divider" />

              <div className="nav-user">
                <div className="user-badge">
                  <div className="user-avatar">{initials}</div>
                  <span className="user-name">{currentUser?.username}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                  <LogoutIcon size={14} color="currentColor" />Гарах
                </button>
              </div>
            </nav>
          </div>
        </header>
      )}

      <main className={token ? 'main' : ''}>
        <Routes>
          <Route path="/login"    element={token ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />} />
          <Route path="/" element={
            <ProtectedRoute token={token}>
              <Dashboard students={students} classes={classes} loading={loading} onFilter={fetchStudents} onDelete={deleteStudent} />
            </ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute token={token}>
              <AddStudent onAdd={addStudent} classes={classes} />
            </ProtectedRoute>
          } />
          <Route path="/student/:id" element={
            <ProtectedRoute token={token}>
              <StudentDetail onUpdate={updateStudent} onDelete={deleteStudent} />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={<ChangePassword token={token} />} />
        </Routes>
      </main>

      {token && (
        <footer className="footer">
          © 2024 ЕБС Дүн Бүртгэлийн Систем · Бүх эрх хуулиар хамгаалагдсан
        </footer>
      )}
    </div>
  );
}
