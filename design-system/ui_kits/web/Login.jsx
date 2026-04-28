// БИЕ ДААЛТ — Login Screen
const { useState } = React;

function Login({ onLogin }) {
  const [tab, setTab] = useState('teacher');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPass, setStudentPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTeacherLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      if (email && pass) { onLogin(email.split('@')[0] || 'Багш'); }
      else { setError('Имэйл болон нууц үгийг оруулна уу'); setLoading(false); }
    }, 700);
  }

  function handleGoogleLogin() {
    setLoading(true);
    setTimeout(() => onLogin('Google Багш'), 800);
  }

  const inputStyle = { width:'100%', padding:'10px 14px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:'0.95rem', fontFamily:'inherit', color:C.text, background:C.surface, boxSizing:'border-box', outline:'none', transition:'border-color .15s' };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ display:'flex', background:C.surface, borderRadius:24, overflow:'hidden', width:'100%', maxWidth:840, minHeight:560, boxShadow:'0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.04)' }}>
        {/* Left Panel */}
        <div style={{ width:'42%', background:'linear-gradient(160deg,#312e81 0%,#4f46e5 60%,#6366f1 100%)', padding:'48px 36px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, background:'rgba(255,255,255,.18)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <SchoolIcon size={22} color="white"/>
            </div>
            <div>
              <div style={{ color:'white', fontSize:'1rem', fontWeight:700 }}>БИЕ ДААЛТ</div>
              <div style={{ color:'rgba(255,255,255,.65)', fontSize:'0.72rem', marginTop:2 }}>ЕБС Дүн бүртгэл</div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'white', margin:'0 0 12px', letterSpacing:'-0.03em' }}>Сурагчдын дүнг хялбархан бүртгэ</h2>
            <p style={{ color:'rgba(255,255,255,.7)', fontSize:'0.9rem', lineHeight:1.6, margin:'0 0 20px' }}>
              Анги, хичээлээр ангилж, графикаар харах боломжтой дүн бүртгэлийн систем.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Дүн бүртгэл','График дүн шинжилгээ','Excel экспорт','Google нэвтрэлт'].map(p => (
                <span key={p} style={{ background:'rgba(255,255,255,.15)', color:'rgba(255,255,255,.9)', borderRadius:50, padding:'5px 12px', fontSize:'0.78rem', fontWeight:500 }}>{p}</span>
              ))}
            </div>
          </div>
          <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,.5)' }}>© 2025 БИЕ ДААЛТ · ЕБС</div>
        </div>

        {/* Right Panel */}
        <div style={{ flex:1, padding:'48px 44px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          {/* Tabs */}
          <div style={{ display:'flex', background:C.bg, borderRadius:10, padding:4, marginBottom:28 }}>
            {[['teacher','Багш нэвтрэх'],['student','Сурагч дүн харах']].map(([t, label]) => (
              <button key={t} onClick={()=>{setTab(t);setError('');}}
                style={{ flex:1, padding:'8px 12px', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.875rem', fontFamily:'inherit', cursor:'pointer', transition:'all .15s', background: tab===t ? C.surface : 'transparent', color: tab===t ? C.text : C.textMuted, boxShadow: tab===t ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>
                {label}
              </button>
            ))}
          </div>

          {error && <div style={{ background:C.dangerLight, color:C.danger, border:`1px solid #fca5a5`, padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:'0.875rem', fontWeight:500 }}>{error}</div>}

          {tab === 'teacher' ? (
            <form onSubmit={handleTeacherLogin}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:C.text, margin:'0 0 6px', letterSpacing:'-0.03em' }}>Нэвтрэх</h2>
              <p style={{ color:C.textMuted, fontSize:'0.875rem', margin:'0 0 24px' }}>Имэйл болон нууц үгээрээ нэвтэрнэ үү</p>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', marginBottom:6, fontWeight:600, fontSize:'0.875rem', color:C.text }}>Имэйл хаяг</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="bagsh@school.mn" style={inputStyle}/>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', marginBottom:6, fontWeight:600, fontSize:'0.875rem', color:C.text }}>Нууц үг</label>
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="••••••••" style={inputStyle}/>
              </div>
              <Btn variant="primary" size="lg" full style={{ marginBottom:16, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </Btn>
              <div style={{ position:'relative', textAlign:'center', marginBottom:16 }}>
                <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:C.border }}></div>
                <span style={{ position:'relative', background:C.surface, padding:'0 12px', fontSize:'0.8rem', color:C.textMuted }}>эсвэл</span>
              </div>
              <button type="button" onClick={handleGoogleLogin}
                style={{ width:'100%', padding:'10px', border:`1.5px solid ${C.border}`, borderRadius:8, background:C.surface, fontFamily:'inherit', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:C.text }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google-ээр нэвтрэх
              </button>
            </form>
          ) : (
            <div>
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:C.text, margin:'0 0 6px', letterSpacing:'-0.03em' }}>Дүнгээ харах</h2>
              <p style={{ color:C.textMuted, fontSize:'0.875rem', margin:'0 0 24px' }}>Gmail хаягаараа нэвтэрч дүнгээ үзнэ үү</p>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', marginBottom:6, fontWeight:600, fontSize:'0.875rem', color:C.text }}>Gmail хаяг</label>
                <input value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} type="email" placeholder="suraguud@gmail.com" style={inputStyle}/>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', marginBottom:6, fontWeight:600, fontSize:'0.875rem', color:C.text }}>Нууц үг</label>
                <input value={studentPass} onChange={e=>setStudentPass(e.target.value)} type="password" placeholder="••••••••" style={inputStyle}/>
              </div>
              <Btn variant="primary" size="lg" full style={{ marginBottom:16 }}>Дүнгээ харах</Btn>
              <button type="button" onClick={handleGoogleLogin}
                style={{ width:'100%', padding:'10px', border:`1.5px solid ${C.border}`, borderRadius:8, background:C.surface, fontFamily:'inherit', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:C.text }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Gmail-ээр дүнгээ харах
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
