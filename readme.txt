================================================================
  БИЕ ДААЛТ — ЕБС СУРАГЧДЫН ДҮН БҮРТГЭЛИЙН ВЭБ СИСТЕМ
================================================================

Deployment URL  : https://bie-daalt-smoky.vercel.app
Backend (Render): https://bie-daalt.onrender.com
GitHub Repo     : https://github.com/Tengis145/bie-daalt

----------------------------------------------------------------
1. ТЕХНОЛОГИЙН СТЕК (TECH STACK)
----------------------------------------------------------------

  Frontend  — React 18 + Vite, React Router v7, Axios, Recharts,
              SheetJS (xlsx), @react-oauth/google,
              React.lazy + Suspense (lazy loading)
  Backend   — Node.js, Express 5
  Database  — MongoDB Atlas (Mongoose ODM)
  Auth      — JWT access (15min) + Refresh token (30 хоног), bcryptjs,
              Google OAuth 2.0 (багш болон сурагч)
  Upload    — Multer + Cloudinary (200×200, quality auto, face crop)
  Security  — express-rate-limit, validator.js (input sanitization)
  Deploy    — Vercel (frontend) + Render (backend)

----------------------------------------------------------------
2. FOLDER STRUCTURE (ФАЙЛЫН БҮТЭЦ)
----------------------------------------------------------------

  bie-daalt/
  ├── backend/
  │   ├── middleware/
  │   │   ├── auth.js          ← JWT шалгах middleware
  │   │   └── logger.js        ← Хүсэлт бүрийг console-д бичдэг
  │   ├── models/
  │   │   ├── Student.js       ← Сурагчийн схем (grades, email, password)
  │   │   └── User.js          ← Хэрэглэгчийн схем (bcrypt, googleId)
  │   ├── routes/
  │   │   ├── authRoutes.js    ← /api/auth — нэвтрэх, бүртгэх, Google OAuth,
  │   │   │                       сурагч нэвтрэх, нууц үг солих
  │   │   ├── studentRoutes.js ← /api/students — CRUD + public lookup
  │   │   └── uploadRoutes.js  ← /api/upload — Cloudinary зураг хадгалах
  │   ├── seed/
  │   │   ├── seed_data.json   ← Жишээ өгөгдөл (3 хэрэглэгч, 10 сурагч)
  │   │   └── seeder.js        ← DB seed/clear скрипт
  │   ├── .env.example         ← Шаардлагатай орчны хувьсагчдын жишээ
  │   └── server.js            ← Express app, MongoDB холболт
  │
  └── frontend/
      ├── vercel.json          ← Vercel: COOP header + API proxy + SPA rewrite
      ├── vite.config.js       ← Vite тохиргоо (proxy, chunk split)
      └── src/
          ├── App.jsx          ← Routing, global state, 401 interceptor
          ├── index.css        ← Бүх CSS (design tokens, layout)
          ├── index.jsx        ← GoogleOAuthProvider wrapper
          ├── utils/
          │   ├── grades.js    ← getLetterGrade() + LETTER_STYLE (хуваалцсан)
          │   └── imageUrl.js  ← Cloudinary/Backend URL-г зурагт нэмдэг
          ├── components/
          │   ├── Icons.jsx    ← SVG icon компонентууд (EyeIcon/EyeOffIcon)
          │   └── Toast.jsx    ← Notification (success/error/info)
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
    Student.findOne({ email: regex }) → comparePassword()
    Зөвхөн student объект буцаана (JWT биш)

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
    ?email= → Student.findOne({ email: regex })
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

--- pages/Login.jsx ---

  Tab: Багш нэвтрэх / Сурагч дүн харах
  Хоёр tab-ийн агуулга үргэлж DOM-д байна (display:none/block)
  → GoogleLogin нэг удаа initialize хийнэ, tab солих үед дахихгүй

  PasswordInput компонент:
    useState(show) → type="password"/"text" toggle
    EyeIcon / EyeOffIcon → position:absolute right

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
  3 нууц үгийн талбар бүгдэд EyeIcon toggle
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

================================================================