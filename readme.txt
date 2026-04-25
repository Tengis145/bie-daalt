================================================================
  БИЕ ДААЛТ — ЕБС СУРАГЧДЫН ДҮН БҮРТГЭЛИЙН ВЭБ СИСТЕМ
================================================================

Deployment URL  : https://bie-daalt-smoky.vercel.app
Backend (Render): https://bie-daalt.onrender.com
GitHub Repo     : https://github.com/Tengis145/bie-daalt

----------------------------------------------------------------
1. ТЕХНОЛОГИЙН СТЕК (TECH STACK)
----------------------------------------------------------------

  Frontend  — React 19 + Vite, React Router v7, Axios, Recharts,
              SheetJS (xlsx), @react-oauth/google
  Backend   — Node.js, Express 5
  Database  — MongoDB Atlas (Mongoose ODM)
  Auth      — JWT access (15min) + Refresh token (30 хоног), bcryptjs,
              Google OAuth 2.0 (багш болон сурагч)
  Upload    — Multer + Cloudinary (200×200, quality auto, face crop)
  Security  — express-rate-limit, validator.js (input sanitization)
  Logging   — Winston (structured JSON logs, console + file rotation)
  API Docs  — Swagger UI (/api-docs), OpenAPI 3.0 spec (/api-docs.json)
  Testing   — Jest (backend unit tests), Vitest + @testing-library/react
  TypeScript— tsconfig.json (backend checkJs, frontend strict),
              utils/grades.ts + utils/imageUrl.ts fully typed
  Deploy    — Vercel (frontend) + Render (backend)

----------------------------------------------------------------
2. FOLDER STRUCTURE (ФАЙЛЫН БҮТЭЦ)
----------------------------------------------------------------

  bie-daalt/
  ├── backend/
  │   ├── __tests__/
  │   │   └── utils.test.js    ← Jest: sanitizeText, validateAndCalcGrades, JWT
  │   ├── middleware/
  │   │   ├── auth.js          ← JWT шалгах middleware
  │   │   └── logger.js        ← Winston structured logging (JSON файл + console)
  │   ├── models/
  │   │   ├── Student.js       ← Сурагчийн схем + DB indexes (email, createdBy, ...)
  │   │   └── User.js          ← Хэрэглэгчийн схем + DB indexes (googleId, refreshToken)
  │   ├── routes/
  │   │   ├── authRoutes.js    ← /api/auth — нэвтрэх, бүртгэх, Google OAuth,
  │   │   │                       сурагч нэвтрэх, нууц үг солих
  │   │   ├── studentRoutes.js ← /api/students — CRUD + public lookup
  │   │   └── uploadRoutes.js  ← /api/upload — Cloudinary зураг хадгалах
  │   ├── seed/
  │   │   ├── seed_data.json   ← Жишээ өгөгдөл (3 хэрэглэгч, 10 сурагч,
  │   │   │                       8 хичээл: Математик, Монгол хэл, Физик,
  │   │   │                       Хими, Англи хэл, Биологи, Газарзүй, Түүх)
  │   │   └── seeder.js        ← DB seed/clear скрипт
  │   ├── logs/
  │   │   ├── app.log          ← JSON форматтай хүсэлтийн лог (max 5MB × 3)
  │   │   └── error.log        ← Зөвхөн error түвшний лог (max 2MB × 3)
  │   ├── .env.example         ← Шаардлагатай орчны хувьсагчдын жишээ
  │   ├── swagger.js           ← OpenAPI 3.0 spec (бүх route, schema)
  │   ├── tsconfig.json        ← TypeScript: allowJs + checkJs (JS-г шалгана)
  │   └── server.js            ← Express app, MongoDB холболт,
  │                               /api-docs Swagger UI, /api-docs.json spec
  │
  └── frontend/
      ├── vercel.json          ← Vercel: COOP header + API proxy + SPA rewrite
      ├── vite.config.js       ← Vite тохиргоо (proxy, chunk split, vitest)
      ├── tsconfig.json        ← TypeScript strict mode
      └── src/
          ├── App.jsx          ← Routing, global state, 401 interceptor
          ├── index.css        ← Бүх CSS (design tokens, layout)
          ├── index.jsx        ← GoogleOAuthProvider wrapper
          ├── __tests__/
          │   ├── setup.js          ← @testing-library/jest-dom setup
          │   ├── grades.test.js    ← Vitest: getLetterGrade, LETTER_STYLE
          │   └── imageUrl.test.js  ← Vitest: getImageUrl edge cases
          ├── utils/
          │   ├── grades.ts    ← getLetterGrade() + LETTER_STYLE (TypeScript)
          │   └── imageUrl.ts  ← Cloudinary/Backend URL helper (TypeScript)
          ├── components/
          │   ├── Icons.jsx         ← SVG icon компонентууд (EyeIcon/EyeOffIcon)
          │   ├── PasswordInput.jsx ← Нууц үг харах/нуух toggle (хуваалцсан)
          │   └── Toast.jsx         ← Notification (success/error/info)
          └── pages/
              ├── Login.jsx            ← Нэвтрэх: Багш/Сурагч tab,
              │                           Google OAuth, нууц үг харах/нуух,
              │                           сурагч email+нууц үгээр нэвтрэх
              ├── Register.jsx         ← Бүртгүүлэх (Google OAuth)
              ├── Dashboard.jsx        ← Хяналтын самбар: хайлт, Excel,
              │                           pagination, чанар% график,
              │                           сурлагын амжилт%, A/B/C/D/F тоо
              ├── AddStudent.jsx       ← Сурагч нэмэх: зураг, дүн,
              │                           gmail, нэвтрэх нууц үг
              ├── StudentDetail.jsx    ← Сурагчийн дэлгэрэнгүй + хэвлэх:
              │                           үсгэн дүн, mini progress bars,
              │                           мөрийн өнгөлгөө, A/B/C/D/F тоо,
              │                           sticky action bar
              ├── SubjectDashboard.jsx ← Хичээл тус бүрийн аналитик:
              │                           үсгэн дүн, дүн эрэмбэлэлт
              ├── Profile.jsx          ← Хэрэглэгчийн профайл зураг
              └── ChangePassword.jsx   ← Нууц үг солих (нууц үг харах/нуух)

----------------------------------------------------------------
3. BACKEND ТАЙЛБАР
----------------------------------------------------------------

--- server.js ---

  Express app-ийг үүсгэж, MongoDB-тэй холбож, route-уудыг бүртгэдэг.

  app.use(cors({ origin: ['https://...vercel.app', 'localhost'] }));
  mongoose.connect(process.env.MONGODB_URI)
  app.use('/api/auth',     authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/upload',   uploadRoutes);

--- middleware/auth.js ---

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;  // { id, role, username }

--- models/User.js ---

  password: { type: String }        // Google OAuth хэрэглэгч нууц үггүй байж болно
  googleId: { type: String, default: '' }

  pre('save'): bcrypt.hash(password, 12) — нууц үгийг шифрлэнэ
               isModified('password') && password байвал л ажиллана
  comparePassword(): bcrypt.compare(input, this.password)
  role: { enum: ['admin', 'teacher'], default: 'teacher' }

--- models/Student.js ---

  gradeSchema:
    exam1 (max 30), exam2 (max 30), attendance (max 20),
    independent (max 20), score (max 100)

  studentSchema:
    name, className, grades: [gradeSchema]
    academicYear  — "2024-2025"
    semester      — 1 эсвэл 2 (enum)
    photo         — Cloudinary URL
    email         — Gmail хаяг (сурагч дүнгээ харахад)
    password      — Нэвтрэх нууц үг (заавал биш, bcrypt)
    createdBy     — Бүртгэсэн хэрэглэгчийн ObjectId

  pre('save'): bcrypt.hash(password, 12) — User.js-тэй адил
  comparePassword(): bcrypt.compare(candidate, this.password)
  virtual 'average': grades-ийн score-уудын дундаж
  toJSON: { virtuals: true } → API-д average харагдана

--- routes/authRoutes.js ---

  Rate limiting:
    /login, /student-login  → 15 минутэд 10 оролдлого
    /register               → 1 цагт 5 оролдлого
    /change-password        → 15 минутэд 5 оролдлого

  POST /api/auth/register        — Шинэ хэрэглэгч бүртгэх
  POST /api/auth/login           — Имэйл+нууц үгээр нэвтрэх
  POST /api/auth/google          — Google OAuth: багш нэвтрэх/бүртгэх
  POST /api/auth/student-login   — Сурагч имэйл+нууц үгээр нэвтрэх
  POST /api/auth/refresh         — Refresh token → шинэ access token
  POST /api/auth/logout          — Session цуцлах [JWT]
  POST /api/auth/change-password — Нууц үг солих [rate: 5/15m]
  PATCH /api/auth/profile        — Профайл зураг шинэчлэх [JWT]
  GET   /api/auth/me             — Одоогийн хэрэглэгч [JWT]

  POST /api/auth/google логик:
    OAuth2Client.verifyIdToken() → { googleId, email, name, picture }
    findOne({ $or: [{ googleId }, { email }] })
    Олдохгүй бол шинэ User үүсгэнэ (нууц үггүй)
    JWT access + refresh token буцаана

  POST /api/auth/student-login логик:
    Student.findOne({ email }) → comparePassword()
    .select('name className academicYear semester grades email')
    Зөвхөн аюулгүй талбарууд буцаана (password хэзээ ч буцаагддаггүй)

  Refresh Token систем:
    Access token: 15 минут | Refresh token: 30 хоног
    Token rotation: refresh ашиглах бүрт шинэ refresh буцаана
    Logout: DB-ийн refreshToken-г '' болгоно

  Нэвтрэх хариу (багш):
    { token, refreshToken, user: { id, username, email, role, profileImage } }

  Нэвтрэх хариу (сурагч):
    { message, student: { name, className, grades, email, average, ... } }

--- routes/studentRoutes.js ---

  GET  /api/students/public/lookup  — Auth шаардлагагүй, rate: 20/15m
    ?email= → Student.findOne({ email })  (plain equality, lowercase)
    .select('name className academicYear semester grades email')
    password талбар хэзээ ч буцаагддаггүй

  router.use(authMiddleware)  ← Доорх бүх route хамгаалагдсан

  GET    /api/students           — Хуудаслагдсан жагсаалт
  GET    /api/students/meta/classes — Ангиудын жагсаалт
  GET    /api/students/:id       — Нэг сурагч
  POST   /api/students           — Шинэ сурагч (password заавал биш, min 6)
  PUT    /api/students/:id       — Сурагч засах
  DELETE /api/students/:id       — Устгах + Cloudinary зураг устгана

  GET query params:
    ?search=, ?className=, ?academicYear=, ?semester=, ?page=, ?limit=
  Хариу: { students: [...], total, page, pages }

  Role-based шүүлт:
    admin   → бүх сурагч
    teacher → зөвхөн createdBy === req.user.id (+ legacy)

  validateAndCalcGrades():
    isNaN шалгалт, мужийн шалгалт (0-30, 0-20),
    score = exam1+exam2+attendance+independent автоматаар

--- routes/uploadRoutes.js ---

  POST /api/upload [JWT] — Cloudinary руу зураг хадгалах
  folder: 'bie-daalt', transformation: 200×200 face-crop
  fileFilter: .jpg/.jpeg/.png/.gif/.webp | limits: 5MB
  Хариу: { url: 'https://res.cloudinary.com/...' }

----------------------------------------------------------------
4. FRONTEND ТАЙЛБАР
----------------------------------------------------------------

--- frontend/vercel.json ---

  headers: Cross-Origin-Opener-Policy: same-origin-allow-popups
    → Google OAuth popup-аас postMessage зөвшөөрнө

  rewrites:
    /api/:path* → https://bie-daalt.onrender.com/api/:path*
    /(.*)       → /index.html  (SPA fallback)

--- index.jsx ---

  GoogleOAuthProvider(VITE_GOOGLE_CLIENT_ID) → BrowserRouter → App
  // VITE_GOOGLE_CLIENT_ID Vercel-ийн Environment Variables-д байх ёстой

--- App.jsx ---

  State: token, currentUser, students, pagination, classes, toasts
  localStorage: ebs_token, ebs_refresh, ebs_user

  Global 401 interceptor:
    401 → POST /api/auth/refresh → шинэ token → retry
    Refresh дуусвал → handleLogout()

  currentUser localStorage: try/catch-тэй JSON.parse
    // Гэмтсэн JSON байвал crash болохгүй, null буцаана

--- utils/grades.js ---

  export function getLetterGrade(score):
    ≥90→A, ≥80→B, ≥70→C, ≥60→D, else F

  export const LETTER_STYLE:
    { color, bg, rowBg } — Login, StudentDetail, SubjectDashboard
    хуваалцан ашиглана (давхардал арилгасан)

--- utils/imageUrl.js ---

  BASE = VITE_API_URL?.replace('/api','') || ''
  getImageUrl(url): http → шууд буцаана | харин → BASE + url

--- components/PasswordInput.jsx ---

  useState(show) → type="password"/"text" toggle
  EyeIcon / EyeOffIcon → position:absolute right
  Login.jsx болон ChangePassword.jsx хоёулаа импортолдог

--- pages/Login.jsx ---

  Tab: Багш нэвтрэх / Сурагч дүн харах
  Conditional rendering: {tab === 'teacher' && <div>} / {tab === 'student' && <div>}
  → Идэвхтэй tab-ийн агуулга л render хийгдэнэ

  avg: useMemo([student]) — render бүр дахин тооцохгүй

  Багш tab:
    Имэйл + нууц үг → POST /api/auth/login → JWT → navigate('/')
    Google → POST /api/auth/google → JWT → navigate('/')
    "Бүртгүүлэх" + "Нууц үг солих" холбоос

  Сурагч tab:
    Имэйл + нууц үг → POST /api/auth/student-login → дүн харагдана
    Google → Gmail decode → GET /api/students/public/lookup → дүн харагдана
    Дүн хүснэгт: Ш1/Ш2/Ирц/БД/Нийт/Үсгэн баганатай
    "Бүртгүүлэх" + "Нууц үг солих" холбоос

--- pages/Register.jsx ---

  Имэйл + нууц үг form + Google OAuth
  → POST /api/auth/register эсвэл /api/auth/google

--- pages/Dashboard.jsx ---

  Stat card: Нийт сурагч, Дундаж оноо,
             Сурлагын амжилт% (avg≥50/нийт×100), At-risk тоо

  Хичээл чанар% BarChart:
    Хичээл тус бүрт score≥75 сурагч/нийт × 100
    ≥75% ногоон, ≥50% шар, бусад улаан (Cell өнгө)

  A/B/C/D/F тоо карт: сурагч бүрийн дундаж оноогоор

  Шүүлтүүр: search, classFilter, yearFilter, semFilter (debounce 400ms)
  Pagination: page state → API-д явна
  At-risk: average<60 → улаан зураасан карт
  exportExcel(): SheetJS — 2 sheet (.xlsx)
  handleImport(): Excel-аас олон сурагч оруулах

--- pages/AddStudent.jsx ---

  Талбарууд: овог, нэр, анги, жил, улирал, зураг, gmail, нууц үг
  Gmail + нууц үг хоёулаа заавал биш
  Нууц үг байвал bcrypt pre-save hook ажиллана
  Зураг: Cloudinary upload → URL → submit-тэй хамт илгээнэ

--- pages/StudentDetail.jsx ---

  Hero: зураг/initials, нэр, анги, жил, имэйл,
        дундаж оноо + 4 component mini progress bars

  Chart (ResponsiveContainer):
    Өндөр = max(280, хичээлийн тоо × 42px) — динамик
    Custom tooltip: Ш1/Ш2/Ирц/БД бүгдийг харуулна
    Өнгө: ≥90 ногоон, ≥75 цэнхэр, ≥60 шар, <60 улаан

  Дүн хүснэгт:
    Мөрийн өнгөлгөө: A→ногоон, B→цэнхэр, C→шар, D→улбар, F→улаан
    Mini progress bars: тоо бүрийн доор жижиг дүүргэлт
    Үсгэн дүн баганa: A/B/C/D/F badge

  gradeDist, totals, chartHeight: useMemo([student.grades])
    totals: нэг reduce pass-аар 4 талбар нэгэн зэрэг нийлнэ

  A/B/C/D/F карт: тоо + хувь (count / нийт × 100)

  Sticky action bar: position:sticky, bottom:0,
    backdrop-filter:blur → Буцах/Хэвлэх/Устгах үргэлж харагдана

  Устгах confirm: "Та '[нэр]'-ийг устгахдаа итгэлтэй байна уу?"

  Засах: editGrades state, шинэ хичээл нэмэх/хасах, PUT /api/students/:id
  Хэвлэх: window.print() → @media print → .print-report

--- pages/SubjectDashboard.jsx ---

  buildSubjectStats(): grades-ийг хичээлээр бүлэглэж
    avg, max, min, excellent/good/below тоог тооцоолно

  Сурагчдын эрэмбэлэлт хүснэгтэд Үсгэн дүн баганa

  BarChart давхар баарны визуал дараалал (дээрээс):
    Шалгалт 1 (indigo) → Шалгалт 2 (purple) →
    Ирц (cyan) → Бие даалт (green)

--- pages/ChangePassword.jsx ---

  Auth шаардлагагүй (нэвтрэлтгүй хандаж болно)
  3 нууц үгийн талбар бүгдэд PasswordInput (хуваалцсан компонент)
  Амжилтанд: 1.5 сек хүлээгээд navigate('/login') эсвэл ('/')
  timerRef + useEffect cleanup: unmount-д timeout цэвэрлэнэ

--- pages/Profile.jsx ---

  Camera товч → file input → Cloudinary upload →
  PATCH /api/auth/profile → onUpdateUser() → header avatar шинэчлэгдэнэ

--- components/Icons.jsx ---

  SVG icon компонентууд:
  SchoolIcon, UsersIcon, ChartIcon, TrophyIcon, ClassIcon,
  LockIcon, UserIcon, DashboardIcon, PlusIcon, LogoutIcon,
  SearchIcon, DownloadIcon, PrintIcon, CameraIcon, BookIcon,
  ShieldIcon, UploadIcon, EyeIcon, EyeOffIcon

--- components/Toast.jsx ---

  Notification: success(ногоон) / error(улаан) / info(цэнхэр)
  0ms mount → 2600ms fade → 3000ms remove

----------------------------------------------------------------
5. ДҮНГИЙН ТООЦООЛЛЫН СИСТЕМ
----------------------------------------------------------------

  Хичээл бүрийн нийт оноо:
    score = exam1 + exam2 + attendance + independent
    exam1, exam2 → max 30 | attendance, independent → max 20
    score → max 100

  Сурагчийн дундаж: average = sum(scores) / N

  Үсгэн дүн (Letter Grade):
    A ≥90 | B ≥80 | C ≥70 | D ≥60 | F <60

  Сурлагын амжилт%: average≥50 сурагч / нийт × 100
  Хичээлийн чанар%: score≥75 сурагч / тухайн хичээлд бүртгэлтэй × 100

  Тооцооллын дараалал:
    Frontend: UX зорилгоор харуулна
    Backend:  validateAndCalcGrades() дахин шалгана (isNaN + муж)
    → Frontend-ийн утгыг итгэдэггүй

----------------------------------------------------------------
6. АЮУЛГҮЙ БАЙДАЛ (SECURITY)
----------------------------------------------------------------

  JWT + Refresh Token:
    Access 15min | Refresh 30 хоног | DB-д хадгалагдана
    Token rotation: ашиглах бүрт шинэ refresh → хуучин хүчингүй
    401 interceptor: auto-retry → logout if expired

  Нууц үг:
    bcrypt salt=12 | plain text хэзээ ч хадгалагддаггүй
    User болон Student хоёулаа pre-save + comparePassword()

  Google OAuth:
    OAuth2Client.verifyIdToken() → Google public key-ээр шалгана
    COOP header: same-origin-allow-popups → popup postMessage зөвшөөрнө

  Rate Limiting:
    /login, /student-login → 15min/10 | /register → 1h/5
    /change-password → 15min/5 | /public/lookup → 15min/20

  Input sanitization: validator.js — XSS, HTML тэг цэвэрлэнэ
  Role-based access: admin/teacher | teacher → зөвхөн өөрийн сурагч
  Public endpoint: password талбар хэзээ ч буцаагддаггүй
  localStorage JSON.parse: try/catch — гэмтсэн data-д crash болохгүй

----------------------------------------------------------------
7. GOOGLE OAUTH ТОХИРУУЛГА
----------------------------------------------------------------

  1. Google Cloud Console → Credentials → OAuth 2.0 Client ID (Web)
  2. Authorized JavaScript origins:
       https://bie-daalt-smoky.vercel.app
       http://localhost:5173
  3. Vercel → Environment Variables:
       VITE_GOOGLE_CLIENT_ID = your_client_id
  4. Render → Environment Variables:
       GOOGLE_CLIENT_ID = your_client_id
  5. Redeploy хийнэ

  Багш нэвтрэх:
    GoogleLogin → POST /api/auth/google → JWT → navigate('/')

  Сурагч дүн харах (Google):
    GoogleLogin → atob(credential.split('.')[1]) → email →
    GET /api/students/public/lookup → дүн хүснэгт

----------------------------------------------------------------
8. ОРЧНЫ ХУВЬСАГЧИД (.env)
----------------------------------------------------------------

  Backend (.env):
    MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    GOOGLE_CLIENT_ID

  Frontend (Vercel Environment Variables):
    VITE_GOOGLE_CLIENT_ID
    VITE_API_URL = https://bie-daalt.onrender.com/api

  .gitignore: **/.env — .env файл git-д хэзээ ч оруулж болохгүй
              backend/package-lock.json — Render cache conflict-аас зайлсхийх

----------------------------------------------------------------
9. RENDER DEPLOYMENT ТОХИРГОО
----------------------------------------------------------------

  render.yaml (repo root):
    rootDir: backend          ← npm install болон node server.js-г
                                backend/ дотор ажиллуулна
    buildCommand: rm -rf node_modules package-lock.json && npm install
                              ← Cache болон хуучин lock file-г арилгаж
                                шинэхэн суулгана
    startCommand: node server.js

  Render Dashboard → Settings → Build & Deploy:
    Build Command: rm -rf node_modules package-lock.json && npm install
    Root Directory: backend

  ТАЙЛБАР: render.yaml-ийн buildCommand нь гараар үүсгэсэн сервист
  ажиллахгүй. Dashboard-аас Build Command-ийг зааж өгөх шаардлагатай.

  Render-т заавал байх Environment Variables:
    MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    GOOGLE_CLIENT_ID

----------------------------------------------------------------
10. WINSTON STRUCTURED LOGGING
----------------------------------------------------------------

  Winston нь Node.js-ийн өргөн ашиглагддаг logging сан.
  Энгийн console.log-оос давуу талууд:
    * JSON форматтай → log aggregator (Datadog, Logtail) руу шууд
    * Log level шүүлт: error | warn | info | debug
    * Файл эргэлт (rotation): max 5MB x 3 файл (хуучин автоматаар устана)
    * Тусдаа error.log — зөвхөн алдааг тусад нь хадгална

  Logger тохиргоо (backend/middleware/logger.js):
    createLogger({ level: process.env.LOG_LEVEL || 'info' })
    transports:
      Console  → colorize + printf format
      app.log  → JSON, maxsize 5MB, maxFiles 3
      error.log→ JSON, level:'error', maxsize 2MB, maxFiles 3

  HTTP хүсэлтийн лог формат (app.log):
    { "level":"info", "message":"http", "method":"GET",
      "url":"/api/students", "status":200, "ms":"12ms",
      "user":"teacher01", "timestamp":"2025-01-01 12:00:00" }

  Ашиглах:
    const { logger } = require('./middleware/logger');
    logger.info('message', { key: value });
    logger.error('error message', { error: err.message });

  LOG_LEVEL орчны хувьсагч .env-д нэмж болно (default: 'info'):
    LOG_LEVEL=debug  <- development-д бүх мэдээллийг харна

----------------------------------------------------------------
11. DB INDEXES (ӨГӨГДЛИЙН САНГИЙН ИНДЕКС)
----------------------------------------------------------------

  MongoDB-д `unique: true` талбар автоматаар индекстэй болдог.
  Гэвч байнга ашиглагддаг query талбаруудад нэмэлт индекс
  шаардлагатай — хурдыг 10–100x сайжруулж болно.

  User.js-д нэмэгдсэн индексүүд:
    googleId     → sparse index (Google OAuth findOne хурдлана)
    refreshToken → sparse index (token rotation шалгахад)

  Student.js-д нэмэгдсэн индексүүд:
    email                                        → student login + public lookup
    createdBy                                    → багшийн сурагчдын жагсаалт
    { className, academicYear, semester }        → шүүлт query
    { createdBy, className, academicYear, semester } → нийлмэл шүүлт

  sparse: true → утгагүй (null/'') document-ийг индексд оруулахгүй
               → зай хэмнэж, Google OAuth-гүй хэрэглэгчдэд нөлөөлөхгүй

----------------------------------------------------------------
12. SWAGGER / OPENAPI БАРИМТЖУУЛАЛТ
----------------------------------------------------------------

  Swagger UI хаяг: http://localhost:5000/api-docs
  JSON spec хаяг:  http://localhost:5000/api-docs.json
  Production:      https://bie-daalt.onrender.com/api-docs

  Бүртгэгдсэн tag-ууд: Auth | Students | Admin | Upload

  Ашиглалт:
    1. /api-docs хаягийг browser-т нээнэ
    2. "Authorize" товч → Bearer токен оруулна
    3. endpoint-ийг "Try it out" товчоор шууд туршиж болно

  swagger.js файл:
    swaggerJsdoc(options) → OpenAPI 3.0 spec object
    Бүх schema (User, Student, Grade, AuthResponse, ...) нэг газарт
    server.js-д: app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))

----------------------------------------------------------------
13. ТЕСТ (JEST + VITEST)
----------------------------------------------------------------

  Backend тест (Jest):
    Байрлал: backend/__tests__/utils.test.js
    Ажиллуулах: cd backend && npm test

    Тестийн бүлгүүд:
      sanitizeText          — XSS тэг хасах, whitespace, non-string input
      validateAndCalcGrades — массив шалгалт, мужийн алдаа, score тооцоо
      JWT helpers           — access/refresh token агуулга, хугацаа

  Frontend тест (Vitest):
    Байрлал: frontend/src/__tests__/
    Ажиллуулах: cd frontend && npm test

    grades.test.js   — getLetterGrade() boundary тест (90→A, 89→B, ...)
                        LETTER_STYLE бүтэц, өнгө утгууд
    imageUrl.test.js — null/empty → null, absolute URL → тэр чигт,
                        relative → BASE+url, BASE тооцоолол

  Нэмэлт тест бичих:
    Backend : backend/__tests__/*.test.js файл нэмнэ (Jest auto-detect)
    Frontend: frontend/src/__tests__/*.test.js файл нэмнэ (Vitest)

----------------------------------------------------------------
14. TYPESCRIPT ТОХИРГОО
----------------------------------------------------------------

  Backend (backend/tsconfig.json):
    allowJs: true   → .js файлуудыг TypeScript руу оруулна
    checkJs: true   → JS файлуудад type checking хийнэ
    strict: false   → одоогийн JS кодыг эвдэхгүйгээр шалгана
    IDE (VS Code) TypeScript алдааг шууд харуулна

  Frontend (frontend/tsconfig.json):
    strict: true    → бүрэн TypeScript strict mode
    checkJs: false  → .jsx файлуудыг шалгахгүй (тусдаа migrate хийнэ)
    noEmit: true    → Vite compile хийдэг тул tsc зөвхөн шалгана

  Converted файлууд (.js → .ts):
    frontend/src/utils/grades.ts
      export type LetterGrade = 'A'|'B'|'C'|'D'|'F'
      export interface LetterStyle { color, bg, rowBg }
      getLetterGrade(score: number): LetterGrade
      LETTER_STYLE: Record<LetterGrade, LetterStyle>

    frontend/src/utils/imageUrl.ts
      getImageUrl(url: string | null | undefined): string | null

  Цаашид migrate хийх дараалал:
    1. components/*.jsx → *.tsx
    2. pages/*.jsx → *.tsx
    3. App.jsx, index.jsx → App.tsx, index.tsx

================================================================