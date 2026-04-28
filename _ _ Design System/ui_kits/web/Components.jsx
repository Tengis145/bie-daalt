// БИЕ ДААЛТ — Shared Components
// Exports to window for use by other scripts

const { useState, useEffect, useRef } = React;

// ─── Design Tokens ───────────────────────────────────────────
const C = {
  primary: '#4f46e5', primaryDark: '#3730a3', primaryLight: '#e0e7ff', primaryBg: '#eef2ff',
  success: '#059669', successLight: '#d1fae5',
  warning: '#d97706', warningLight: '#fef3c7',
  danger: '#dc2626', dangerLight: '#fee2e2',
  info: '#3b82f6', infoLight: '#dbeafe',
  bg: '#f1f5f9', surface: '#ffffff',
  text: '#0f172a', textMuted: '#64748b', textFaint: '#94a3b8',
  border: '#e2e8f0',
};

// ─── Grade Utils ──────────────────────────────────────────────
function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
const LETTER_STYLE = {
  A: { color: '#065f46', bg: '#d1fae5', rowBg: '#f0fdf4' },
  B: { color: '#1e40af', bg: '#dbeafe', rowBg: '#eff6ff' },
  C: { color: '#92400e', bg: '#fef3c7', rowBg: '#fffbeb' },
  D: { color: '#7c2d12', bg: '#ffedd5', rowBg: '#fff7ed' },
  F: { color: '#7f1d1d', bg: '#fee2e2', rowBg: '#fff5f5' },
};

// ─── SVG Icons ────────────────────────────────────────────────
function Icon({ d, size = 18, color = C.primary, strokeWidth = 1.8, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
function SchoolIcon({ size = 22, color = 'currentColor' }) {
  return <Icon size={size} color={color}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>;
}
function UsersIcon({ size = 22, color = 'currentColor' }) {
  return <Icon size={size} color={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
}
function ChartIcon({ size = 22, color = 'currentColor' }) {
  return <Icon size={size} color={color}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Icon>;
}
function TrophyIcon({ size = 22, color = 'currentColor' }) {
  return <Icon size={size} color={color}><polyline points="14 9 14 3 10 3 10 9"/><path d="M4 3v4a8 8 0 0 0 16 0V3"/><line x1="12" y1="19" x2="12" y2="15"/><line x1="8" y1="22" x2="16" y2="22"/></Icon>;
}
function DashboardIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
}
function PlusIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color} strokeWidth={2.2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
}
function LogoutIcon({ size = 16, color = 'currentColor' }) {
  return <Icon size={size} color={color}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
}
function SearchIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color} strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
}
function BookIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Icon>;
}
function UserIcon({ size = 20, color = 'currentColor' }) {
  return <Icon size={size} color={color}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
}
function DownloadIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>;
}
function PrintIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></Icon>;
}
function ArrowLeftIcon({ size = 18, color = 'currentColor' }) {
  return <Icon size={size} color={color}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Icon>;
}

// ─── Button ───────────────────────────────────────────────────
function Btn({ variant = 'primary', size = 'md', children, onClick, full, style }) {
  const base = { display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontFamily:'inherit', transition:'all .15s' };
  const sizes = { sm:{padding:'6px 12px',fontSize:'0.8rem'}, md:{padding:'9px 16px',fontSize:'0.875rem'}, lg:{padding:'12px 24px',fontSize:'1rem'} };
  const variants = {
    primary: { background:C.primary, color:'#fff' },
    danger:  { background:'#fff', color:C.danger, border:'1px solid #fca5a5' },
    success: { background:C.success, color:'#fff' },
    secondary:{ background:C.bg, color:C.text, border:`1px solid ${C.border}` },
    ghost:   { background:'transparent', color:C.primary },
  };
  return (
    <button onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...(full ? {width:'100%'} : {}), ...style }}>
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────
function Badge({ children, color = C.primary, bg = C.primaryLight }) {
  return (
    <span style={{ padding:'4px 10px', borderRadius:9999, fontSize:'0.75rem', fontWeight:700, color, background:bg, whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}

function GradeBadge({ score }) {
  const g = getLetterGrade(score);
  const s = LETTER_STYLE[g];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:8, fontWeight:900, fontSize:'1rem', background:s.bg, color:s.color }}>
      {g}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────
function StatCard({ icon, iconBg, value, label }) {
  return (
    <div style={{ background:C.surface, borderRadius:12, padding:20, boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:8, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:'1.75rem', fontWeight:800, color:C.text, letterSpacing:'-0.03em', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'0.8rem', color:C.textMuted, marginTop:4, fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────
function Header({ currentPage, onNavigate, user }) {
  const navItems = [
    { id: 'dashboard', label: 'Хяналтын самбар', icon: <DashboardIcon size={15} color="currentColor"/> },
    { id: 'subjects',  label: 'Хичээлийн дүн',   icon: <BookIcon size={15} color="currentColor"/> },
    { id: 'add',       label: 'Сурагч нэмэх',     icon: <PlusIcon size={15} color="currentColor"/> },
  ];
  return (
    <div style={{ background:'linear-gradient(135deg,#3730a3 0%,#4f46e5 60%,#6366f1 100%)', boxShadow:'0 4px 20px rgba(79,70,229,.35)', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', justifyContent:'space-between', alignItems:'center', height:64 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, background:'rgba(255,255,255,.18)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <SchoolIcon size={20} color="white"/>
          </div>
          <div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>БИЕ ДААЛТ</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,.7)', marginTop:1 }}>ЕБС Дүн бүртгэл</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => onNavigate(n.id)}
              style={{ display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none', color: currentPage === n.id ? '#fff' : 'rgba(255,255,255,.8)', fontWeight:500, fontSize:'0.875rem', padding:'8px 14px', borderRadius:8, border:'none', cursor:'pointer', background: currentPage === n.id ? 'rgba(255,255,255,.22)' : 'transparent', fontFamily:'inherit', transition:'background .15s' }}>
              {n.icon} {n.label}
            </button>
          ))}
          <div style={{ width:1, height:24, background:'rgba(255,255,255,.25)', margin:'0 8px' }}></div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.15)', borderRadius:50, padding:'5px 14px 5px 6px' }}>
            <div style={{ width:28, height:28, background:'rgba(255,255,255,.9)', color:C.primary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem' }}>
              {user.charAt(0)}
            </div>
            <span style={{ color:'#fff', fontSize:'0.85rem', fontWeight:500 }}>{user}</span>
          </div>
          <button onClick={() => onNavigate('login')} style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.25)', color:'rgba(255,255,255,.9)', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:500, fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:6 }}>
            <LogoutIcon size={14} color="currentColor"/> Гарах
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Progress Bar ────────────────────────────────────────
function MiniBar({ value, max, color }) {
  return (
    <div style={{ height:4, background:C.border, borderRadius:2, overflow:'hidden', marginTop:3 }}>
      <div style={{ height:'100%', width:`${Math.min(100,(value/max)*100)}%`, background:color, borderRadius:2 }}></div>
    </div>
  );
}

// ─── SVG Bar Chart (grouped, 4 series) ───────────────────────
function BarChartSVG({ data, height = 240 }) {
  const W = 500, H = height, padL = 28, padB = 32, padT = 10, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const series = [
    { key:'e1',  name:'Шалгалт 1', color:'#4f46e5', max:30 },
    { key:'e2',  name:'Шалгалт 2', color:'#818cf8', max:30 },
    { key:'att', name:'Ирц',       color:'#06b6d4', max:20 },
    { key:'ind', name:'Бие даалт', color:'#059669', max:20 },
  ];
  const maxVal = 30;
  const groupW = chartW / (data.length || 1);
  const bw = Math.min(11, (groupW - 12) / series.length);
  const yTicks = [0, 10, 20, 30];

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} style={{ overflow:'visible', display:'block' }}>
        {yTicks.map(v => {
          const y = padT + chartH - (v / maxVal) * chartH * 0.9;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#e2e8f0" strokeWidth="1"/>
              <text x={padL-4} y={y+3} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
            </g>
          );
        })}
        <line x1={padL} y1={padT+chartH} x2={W-padR} y2={padT+chartH} stroke="#cbd5e1" strokeWidth="1.5"/>
        {data.map((d, i) => {
          const gx = padL + i * groupW;
          const cx = gx + groupW / 2;
          const maxH = Math.max(...series.map(s => (d[s.key] / s.max) * chartH * 0.9));
          return (
            <g key={i}>
              {series.map((s, si) => {
                const bh = (d[s.key] / s.max) * chartH * 0.9;
                const x  = gx + (groupW - series.length * (bw + 2)) / 2 + si * (bw + 2);
                return <rect key={s.key} x={x} y={padT+chartH-bh} width={bw} height={bh} fill={s.color} rx="2" opacity="0.9"/>;
              })}
              <text x={cx} y={padT+chartH-maxH-5} fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="600">{d.total}</text>
              <text x={cx} y={padT+chartH+16} fontSize="8.5" fill="#94a3b8" textAnchor="middle">{(d.short||'').slice(0,7)}</text>
            </g>
          );
        })}
        {series.map((s, i) => (
          <g key={s.key} transform={`translate(${padL + i * 116}, ${H + 8})`}>
            <rect width="8" height="8" rx="2" fill={s.color} y="2"/>
            <text x="11" y="10" fontSize="9.5" fill="#64748b">{s.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── SVG Single Bar Chart (student scores) ───────────────────
function SingleBarChartSVG({ data, height = 200 }) {
  const W = 460, H = height, padL = 24, padB = 22, padT = 8, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const bw = Math.min(28, chartW / (data.length || 1) - 6);
  function getColor(s) { return s>=90?'#059669':s>=75?'#3b82f6':s>=60?'#d97706':'#dc2626'; }
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
      {[0,25,50,75,100].map(v => {
        const y = padT + chartH - (v/100)*chartH*0.95;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#e2e8f0" strokeWidth="1"/>
            <text x={padL-4} y={y+3} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
          </g>
        );
      })}
      <line x1={padL} y1={padT+chartH} x2={W-padR} y2={padT+chartH} stroke="#cbd5e1" strokeWidth="1.5"/>
      {data.map((d, i) => {
        const bh = (d.score/100)*chartH*0.95;
        const x  = padL + i*(chartW/data.length) + (chartW/data.length - bw)/2;
        const y  = padT+chartH-bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={getColor(d.score)} rx="3" opacity="0.9"/>
            <text x={x+bw/2} y={y-4} fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="600">{d.score}</text>
            <text x={x+bw/2} y={padT+chartH+14} fontSize="9" fill="#94a3b8" textAnchor="middle">{(d.name||'').slice(0,5)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Export everything to window
Object.assign(window, {
  C, getLetterGrade, LETTER_STYLE,
  SchoolIcon, UsersIcon, ChartIcon, TrophyIcon, DashboardIcon, PlusIcon,
  LogoutIcon, SearchIcon, BookIcon, UserIcon, DownloadIcon, PrintIcon, ArrowLeftIcon,
  Btn, Badge, GradeBadge, StatCard, Header, MiniBar, BarChartSVG, SingleBarChartSVG,
});
