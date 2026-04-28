# БИЕ ДААЛТ — Design System

## Overview

**БИЕ ДААЛТ** (Bie Daalt) is a Mongolian web application for general education school (ЕБС — Ерөнхий боловсролын сургууль) student grade management. Teachers register and track student grades across multiple subjects; students can look up their own results. The system supports both teacher and student login flows, Google OAuth, and rich analytics dashboards.

- **Live App**: https://bie-daalt-smoky.vercel.app
- **Backend API**: https://bie-daalt.onrender.com
- **GitHub Repo**: https://github.com/Tengis145/bie-daalt

## Products / Surfaces

| Surface | Description |
|---|---|
| **Web App** | React SPA — teacher dashboard, student grade lookup, subject analytics |
| **Print Report Card** | `@media print` layout for student grade cards |

## Source Materials

- **GitHub Repository**: `Tengis145/bie-daalt` (React 19 + Vite frontend, Express 5 backend)
- **Primary CSS**: `frontend/src/index.css` — all design tokens, layout, components
- **Grade utilities**: `frontend/src/utils/grades.ts` — letter grade logic + color map
- **Icon components**: `frontend/src/components/Icons.jsx` — inline SVG icon set

---

## CONTENT FUNDAMENTALS

### Language
All UI copy is written in **Mongolian (Cyrillic)**. Examples:
- Navigation: `Хяналтын самбар` (Dashboard), `Сурагч нэмэх` (Add Student)
- Status labels: `Нийт сурагч` (Total Students), `Дундаж оноо` (Average Score)
- Actions: `Нэвтрэх` (Login), `Бүртгүүлэх` (Register), `Гарах` (Logout)
- Error copy: `Имэйл эсвэл нууц үг буруу байна` (Incorrect email or password)

### Tone & Voice
- **Functional and direct** — no marketing fluff; every label is a clear noun or action verb
- **No emoji** in UI copy — icons are always SVG components, never emoji
- **Sentence casing** for labels; **ALL CAPS** only for table headers and section labels (with `letter-spacing: 0.05em`)
- **Numbers** are formatted with no thousands separators; percentages use `%` suffix
- **Academic terminology** uses Mongolian equivalents: Шалгалт (Exam), Ирц (Attendance), Бие даалт (Independent work)

### Grade System Copy
| Field | Mongolian Label | Max |
|---|---|---|
| Шалгалт 1 | Exam 1 | 30 |
| Шалгалт 2 | Exam 2 | 30 |
| Ирц | Attendance | 20 |
| Бие даалт | Independent work | 20 |
| Нийт | Total | 100 |

### Letter Grade Labels
`A` ≥90 · `B` ≥80 · `C` ≥70 · `D` ≥60 · `F` <60

---

## VISUAL FOUNDATIONS

### Colors
Primary palette is **indigo** (Tailwind indigo-600 through indigo-900). Semantic colors use pure green/amber/red.

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#4f46e5` | Buttons, links, active states, focus rings |
| `--primary-dark` | `#3730a3` | Hover on primary, header gradient start |
| `--primary-light` | `#e0e7ff` | Badges, selected backgrounds |
| `--primary-bg` | `#eef2ff` | Subtle primary tints, stat card icons |
| `--success` | `#059669` | Grade A, success toasts, positive indicators |
| `--warning` | `#d97706` | Grade C, warning states, at-risk indicators |
| `--danger` | `#dc2626` | Grade F, error states, destructive actions |
| `--bg` | `#f1f5f9` | App background (slate-100) |
| `--surface` | `#ffffff` | Cards, panels, inputs |
| `--text` | `#0f172a` | Primary text |
| `--text-muted` | `#64748b` | Secondary labels, placeholders |
| `--border` | `#e2e8f0` | Dividers, input borders |

### Gradients
- **Header / Hero**: `linear-gradient(135deg, #3730a3 0%, #4f46e5 60%, #6366f1 100%)`
- **Auth page bg**: `linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)`
- **Card top accent bar**: `linear-gradient(90deg, #4f46e5, #818cf8)`

### Typography
- **Font family**: `'Inter', 'Segoe UI', system-ui, sans-serif`
- **Base size**: `15px`, line-height `1.5`
- **Font smoothing**: `-webkit-font-smoothing: antialiased`
- **Display numbers** (stat values, hero scores): `font-weight: 800–900`, `letter-spacing: -0.03em to -0.04em`
- **Section labels**: `font-size: 0.875rem`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.06em`
- **Note**: Inter is loaded via system stack — no webfont import in the codebase. Nearest Google Fonts match: `Inter` (exact match available on Google Fonts).

### Spacing & Layout
- Max content width: `1280px` centered with `padding: 0 24px`
- Main content top margin: `28px`
- Grid gaps: `16px` (tight), `18px` (standard), `20px–24px` (loose)
- Card padding: `20px` (stat cards), `22px–24px` (chart/detail boxes), `36px 40px` (forms)

### Corner Radii
| Token | Value | Usage |
|---|---|---|
| `--radius` | `8px` | Buttons, inputs, small chips |
| `--radius-lg` | `12px` | Cards, stat boxes |
| `--radius-xl` | `16px` | Form containers, modals |
| `--radius-2xl` | `24px` | Auth wrapper |
| `50px` | pill | Badges, pagination pills, nav tabs |

### Shadows
| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle lift |
| `--shadow-sm` | Default card shadow |
| `--shadow-md` | Hovered / elevated cards |
| `--shadow-lg` | Modals, toast notifications |
| `--shadow-xl` | Auth wrapper, profile cards |

### Cards
White surface (`--surface`), `--radius-lg` (12px), `--shadow-sm` default → `--shadow-lg` on hover with `transform: translateY(-2px)`. Top accent bar (5px, indigo→purple gradient). Border only on special states (at-risk: red border; active subject: primary border with glow).

### Animation & Transitions
- Most transitions: `all .15s` or `box-shadow .2s, transform .2s`
- Modal entrance: `slideUp` — `translateY(16px)` → `none`, `opacity 0` → `1`, `.2s ease`
- Toast entrance: `opacity 0, translateX(20px)` → visible, `.25s ease`
- Spinner: `spin .7s linear infinite`
- Hover: slight lift `translateY(-2px)` on cards
- No bounce, no spring — all easing is linear or CSS `ease`

### Hover / Press States
- Buttons: darker bg + box-shadow glow (primary color at 35% opacity)
- Cards: shadow upgrade + translateY(-2px)
- Nav links: `rgba(255,255,255,.15)` bg overlay on dark header
- Danger actions: bg shifts to `--danger-light`, border becomes `--danger`

### Imagery & Backgrounds
- No photography or illustrations in UI — purely typographic/icon-based
- Avatars: initials in colored circle (indigo bg) or Cloudinary-hosted photos (200×200 face-crop)
- Empty states: oversized icon + short text, no illustrations
- Print report card uses `Times New Roman` serif for formal output

### Iconography
Custom inline SVG components in `frontend/src/components/Icons.jsx`:
- Style: **stroke only**, no fill, `strokeWidth: 1.8`, `strokeLinecap: round`, `strokeLinejoin: round`
- Set: SchoolIcon, UsersIcon, ChartIcon, TrophyIcon, ClassIcon, LockIcon, UserIcon, DashboardIcon, PlusIcon, LogoutIcon, SearchIcon, DownloadIcon, PrintIcon, CameraIcon, BookIcon, ShieldIcon, UploadIcon, EyeIcon, EyeOffIcon
- No external icon library CDN — all icons are hand-coded SVG in the components file
- No emoji used anywhere in the UI

---

## VISUAL FOUNDATIONS — Grade Color System

```
A (≥90): color #065f46 · bg #d1fae5 · rowBg #f0fdf4   (emerald)
B (≥80): color #1e40af · bg #dbeafe · rowBg #eff6ff   (blue)
C (≥70): color #92400e · bg #fef3c7 · rowBg #fffbeb   (amber)
D (≥60): color #7c2d12 · bg #ffedd5 · rowBg #fff7ed   (orange)
F (<60): color #7f1d1d · bg #fee2e2 · rowBg #fff5f5   (red)
```

---

## File Index

```
/
├── README.md                    ← This file
├── SKILL.md                     ← Agent skill definition
├── colors_and_type.css          ← CSS custom properties (design tokens)
├── assets/
│   └── Icons.jsx                ← SVG icon components (copy into projects)
├── preview/                     ← Design System tab cards
│   ├── colors-base.html
│   ├── colors-semantic.html
│   ├── colors-grades.html
│   ├── type-scale.html
│   ├── spacing-tokens.html
│   ├── shadows-radii.html
│   ├── components-buttons.html
│   ├── components-badges.html
│   ├── components-cards.html
│   ├── components-forms.html
│   ├── components-toast.html
│   ├── brand-header.html
│   └── brand-icons.html
└── ui_kits/
    └── web/
        ├── README.md
        ├── index.html           ← Interactive web app prototype
        ├── Components.jsx       ← Shared UI primitives
        ├── Dashboard.jsx        ← Main dashboard screen
        ├── StudentDetail.jsx    ← Student grade detail screen
        └── Login.jsx            ← Login / auth screen
```
