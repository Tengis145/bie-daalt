// БИЕ ДААЛТ — Dashboard (v2: skeleton loader)
const { useState, useMemo, useEffect } = React;

function SkeletonCard() {
  const pulse = {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
  };
  return (
    <div style={{ background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
      <div style={{ height:5, background:'#e2e8f0' }}></div>
      <div style={{ padding:'18px 18px 12px' }}>
        <div style={{ ...pulse, height:16, width:'60%', marginBottom:8 }}></div>
        <div style={{ ...pulse, height:11, width:'40%' }}></div>
      </div>
      <div style={{ padding:'0 18px 14px' }}>
        <div style={{ ...pulse, height:32, width:'30%', marginBottom:8 }}></div>
        <div style={{ ...pulse, height:20, width:'50%', borderRadius:9999 }}></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'12px 18px 16px', borderTop:'1px solid #e2e8f0' }}>
        <div style={{ ...pulse, height:34, borderRadius:8 }}></div>
        <div style={{ ...pulse, height:34, borderRadius:8 }}></div>
      </div>
    </div>
  );
}

function Dashboard({ onNavigate, onSelectStudent }) {
  const [search, setSearch]       = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading]     = useState(true);

  // Simulate fetch
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Re-trigger skeleton on filter change
  function applyFilter(fn) {
    setLoading(true);
    fn();
    setTimeout(() => setLoading(false), 400);
  }

  const classes = useMemo(() => [...new Set(STUDENTS.map(s => s.className))].sort(), []);

  const filtered = useMemo(() => STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass  = classFilter ? s.className === classFilter : true;
    return matchSearch && matchClass;
  }), [search, classFilter]);

  const allAvgs  = STUDENTS.map(calcAvg);
  const totalAvg = Math.round(allAvgs.reduce((a,b)=>a+b,0)/allAvgs.length*10)/10;
  const passing  = allAvgs.filter(a => a >= 50).length;
  const atRisk   = allAvgs.filter(a => a < 60).length;

  const dist = useMemo(() => {
    const d = {A:0,B:0,C:0,D:0,F:0};
    STUDENTS.forEach(s => { d[getLetterGrade(calcAvg(s))]++; });
    return d;
  }, []);

  return (
    <div style={{ maxWidth:1280, margin:'28px auto', padding:'0 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.03em', color:C.text }}>Хяналтын самбар</h1>
        <p style={{ margin:0, color:C.textMuted, fontSize:'0.9rem' }}>2024-2025 оны 1-р улирал · {STUDENTS.length} сурагч</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }} className="stats-grid">
        <StatCard icon={<UsersIcon size={22} color={C.info}/>}    iconBg={C.infoLight}    value={STUDENTS.length} label="Нийт сурагч"/>
        <StatCard icon={<ChartIcon size={22} color={C.primary}/>} iconBg={C.primaryLight} value={totalAvg}        label="Дундаж оноо"/>
        <StatCard icon={<TrophyIcon size={22} color={C.success}/>} iconBg={C.successLight} value={`${Math.round(passing/STUDENTS.length*100)}%`} label="Сурлагын амжилт"/>
        <StatCard icon={<UsersIcon size={22} color={C.warning}/>} iconBg={C.warningLight} value={atRisk}          label="Анхаарал шаардлагатай"/>
      </div>

      {/* Grade Dist */}
      <div style={{ background:C.surface, borderRadius:12, padding:20, marginBottom:20, boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 style={{ margin:0, fontSize:'0.95rem', fontWeight:700, color:C.text }}>Үсгэн дүнгийн тархалт</h3>
          <span style={{ fontSize:'0.8rem', color:C.textMuted }}>{STUDENTS.length} сурагч</span>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {Object.entries(dist).map(([g, count]) => {
            const s = LETTER_STYLE[g];
            return (
              <div key={g} style={{ flex:1, minWidth:60, background:s.bg, borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontSize:'1.4rem', fontWeight:900, color:s.color }}>{count}</div>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:s.color }}>{g} ({Math.round(count/STUDENTS.length*100)}%)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{ background:C.surface, borderRadius:12, padding:'14px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, boxShadow:'0 1px 3px rgba(0,0,0,.08)', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', flex:1, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:180 }}>
            <div style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
              <SearchIcon size={16} color={C.textFaint}/>
            </div>
            <input value={search}
              onChange={e => { applyFilter(()=>setSearch(e.target.value)); }}
              placeholder="Сурагч хайх..."
              style={{ width:'100%', padding:'8px 32px 8px 34px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:'0.875rem', fontFamily:'inherit', color:C.text, background:C.surface, boxSizing:'border-box', outline:'none' }}/>
          </div>
          <select value={classFilter}
            onChange={e => { applyFilter(()=>setClassFilter(e.target.value)); }}
            style={{ padding:'9px 12px', border:`1px solid ${C.border}`, borderRadius:8, background:C.bg, fontSize:'0.875rem', fontFamily:'inherit', color:C.text, cursor:'pointer', outline:'none', minWidth:130 }}>
            <option value="">Бүх анги</option>
            {classes.map(c => <option key={c} value={c}>{c} анги</option>)}
          </select>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn variant="secondary" size="sm"><DownloadIcon size={15} color={C.textMuted}/> Excel</Btn>
          <Btn variant="primary" size="sm" onClick={()=>onNavigate('add')}><PlusIcon size={15} color="#fff"/> Сурагч нэмэх</Btn>
        </div>
      </div>

      {/* Student Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:18 }} className="student-grid">
        {loading ? (
          Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 20px', color:C.textMuted }}>
            <div style={{ marginBottom:16 }}><SearchIcon size={40} color={C.border}/></div>
            <h3 style={{ margin:'0 0 8px', color:C.text }}>Сурагч олдсонгүй</h3>
            <p style={{ margin:0, fontSize:'0.9rem' }}>Хайлтаа өөрчилж дахин оролдоно уу</p>
          </div>
        ) : filtered.map(student => {
          const avg = calcAvg(student);
          const g   = getLetterGrade(avg);
          const gs  = LETTER_STYLE[g];
          const isAtRisk = avg < 60;
          return (
            <div key={student.id}
              style={{ background: isAtRisk ? '#fff5f5' : C.surface, borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,.08)', overflow:'hidden', border: isAtRisk ? '1.5px solid #fca5a5' : '1.5px solid transparent', transition:'box-shadow .2s,transform .2s', cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 10px 15px -3px rgba(0,0,0,.08)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.08)';e.currentTarget.style.transform='none'}}>
              <div style={{ height:5, background:'linear-gradient(90deg,#4f46e5,#818cf8)' }}></div>
              <div style={{ padding:'18px 18px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'1.05rem', color:C.text }}>{student.name}</div>
                  <div style={{ fontSize:'0.78rem', color:C.textMuted, marginTop:2 }}>{student.className} анги · {student.year}</div>
                  {isAtRisk && <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.danger, background:C.dangerLight, borderRadius:6, padding:'3px 8px', marginTop:6, display:'inline-block' }}>⚠ Анхаарал шаардлагатай</div>}
                </div>
                <Badge color={gs.color} bg={gs.bg}>{g}</Badge>
              </div>
              <div style={{ padding:'0 18px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:'0.8rem', color:C.textMuted, fontWeight:500 }}>Дундаж оноо</span>
                  <span style={{ fontWeight:800, fontSize:'1.8rem', letterSpacing:'-0.04em', color: avg>=80?C.success:avg>=60?C.info:C.danger }}>{avg}</span>
                </div>
                <span style={{ fontSize:'0.78rem', color:C.textMuted, background:C.bg, display:'inline-block', padding:'3px 10px', borderRadius:9999 }}>{student.grades.length} хичээл</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'12px 18px 16px', borderTop:`1px solid ${C.border}` }}>
                <Btn variant="primary" size="sm" onClick={()=>onSelectStudent(student)}>Дэлгэрэнгүй</Btn>
                <Btn variant="secondary" size="sm">Засах</Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
