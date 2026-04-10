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
  └── frontend/src/
      ├── App.jsx              ← Routing, global state, header, pagination
      ├── index.css            ← Бүх CSS (design tokens, layout)
      ├── index.jsx            ← GoogleOAuthProvider wrapper
      ├── utils/
      │   └── imageUrl.js      ← Cloudinary/Backend URL-г зурагт нэмдэг
      ├── components/
      │   ├── Icons.jsx        ← SVG icon компонентууд (EyeIcon нэмэгдсэн)
      │   └── Toast.jsx        ← Notification (success/error/info)
      └── pages/
          ├── Login.jsx            ← Нэвтрэх (Багш/Сурагч tab, Google OAuth,
          │                           нууц үг харах/нуух)
          ├── Register.jsx         ← Бүртгүүлэх (Google OAuth)
          ├── Dashboard.jsx        ← Хяналтын самбар (хайлт, Excel,
          │                           pagination, чанар% график,
          │                           сурлагын амжилт%, A/B/C/D/F тоо)
          ├── AddStudent.jsx       ← Сурагч нэмэх (зураг, дүн, gmail,
          │                           нэвтрэх нууц үг)
          ├── StudentDetail.jsx    ← Сурагчийн дэлгэрэнгүй + хэвлэх
          │                           (үсгэн дүн, A/B/C/D/F тоо)
          ├── SubjectDashboard.jsx ← Хичээл тус бүрийн аналитик
          │                           (үсгэн дүн, дүн эрэмбэлэлт)
          ├── Profile.jsx          ← Хэрэглэгчийн профайл зураг
          └── ChangePassword.jsx   ← Нууц үг солих (нууц үг харах/нуух)

----------------------------------------------------------------
3. BACKEND ТАЙЛБАР
----------------------------------------------------------------

--- server.js ---

  Express app-ийг үүсгэж, MongoDB-тэй холбож, route-уудыг
  бүртгэдэг файл.

  app.use(cors({ origin: ['https://...vercel.app', 'localhost'] }));
  // CORS: зөвхөн энэ 2 домэйноос хүсэлт зөвшөөрнө

  mongoose.connect(process.env.MONGODB_URI)
  // .env файлаас MongoDB Atlas холболтын URL уншина

  app.use('/api/auth',     authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/upload',   uploadRoutes);
  // Route бүр өөрийн файлд хуваарилагдсан

--- middleware/auth.js ---

  Хамгаалагдсан route бүрт хэрэглэгддэг JWT шалгагч.

  const token = req.headers.authorization.split(' ')[1];
  // "Bearer <token>" гэж ирсэн header-аас токеныг авна

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  // Токеныг тайлж req.user дотор { id, role, username } тавина
  // Дараагийн route handler-д req.user-г ашиглана

--- models/User.js ---

  MongoDB-д хэрэглэгчийн мэдээллийг хадгалах схем.

  password: { type: String }  // Google OAuth хэрэглэгчид нууц үггүй байж болно
  googleId: { type: String, default: '' }  // Google OAuth-д хэрэглэнэ

  userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
  });
  // Хадгалахын ӨМНӨ bcrypt-ээр шифрлэнэ (12 давтамж = хүчтэй)
  // Google OAuth хэрэглэгч нууц үггүй тул skip хийнэ

  userSchema.methods.comparePassword = async function (input) {
    return bcrypt.compare(input, this.password);
  };
  // Нэвтрэх үед оруулсан нууц үгийг хадгалагдсантай харьцуулна

  role: { enum: ['admin', 'teacher'], default: 'teacher' }
  // Шинэ хэрэглэгч автоматаар 'teacher' болно

--- models/Student.js ---

  Сурагчийн схем. Дүн нь 4 хэсгээс бүрдэнэ:

  gradeSchema:
    exam1       — Шалгалт 1  (max 30)
    exam2       — Шалгалт 2  (max 30)
    attendance  — Ирц        (max 20)
    independent — Бие даалт  (max 20)
    score       — Нийт = дөрвийн нийлбэр (max 100)

  studentSchema:
    name, className, grades: [gradeSchema]
    academicYear — "2024-2025" гэх хэлбэрээр
    semester     — 1 эсвэл 2 (enum)
    photo        — Cloudinary URL (https://res.cloudinary.com/...)
    email        — Gmail хаяг (сурагч дүнгээ харахад хэрэглэнэ)
    password     — Нэвтрэх нууц үг (заавал биш, bcrypt-ээр шифрлэгдэнэ)
    createdBy    — Бүртгэсэн хэрэглэгчийн ObjectId

  studentSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
  });
  // User.js-тэй адил bcrypt pre-save hook

  studentSchema.methods.comparePassword = async function (candidate) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
  };

  studentSchema.virtual('average').get(function () {
    const total = this.grades.reduce((sum, g) => sum + (g.score ?? 0), 0);
    return (total / this.grades.length).toFixed(1);
  });
  // "average" талбар MongoDB-д хадгалагддаггүй — унших үед тооцоолно
  // toJSON: { virtuals: true } тохиргоо байгаа учир API-д харагдана

--- routes/authRoutes.js ---

  Rate limiting (express-rate-limit ашиглана):
    /login          → 15 минутэд 10 оролдлого хязгаар
    /register       → 1 цагт 5 оролдлого хязгаар
    /change-password → 15 минутэд 5 оролдлого хязгаар
    /student-login  → 15 минутэд 10 оролдлого хязгаар
    Хязгаараас хэтэрвэл 429 Too Many Requests буцаана

  Input sanitization (validator.js):
    sanitizeText(str): HTML тэг, тусгай тэмдэгт цэвэрлэнэ
    → XSS халдлагаас хамгаалах зорилгоор бүх text input шалгана

  Refresh Token систем:
    generateAccessToken()  → expiresIn: '15m'  (богино хугацаа)
    generateRefreshToken() → expiresIn: '30d'  (урт хугацаа)
    Refresh token DB-д (User.refreshToken) хадгалагдана
    POST /api/auth/refresh → шинэ access + refresh token буцаана
                             (token rotation — хуучин refresh хүчингүй болно)
    POST /api/auth/logout  → DB-ийн refreshToken-г '' болгоно (session цуцлана)
    Нууц үг солих → refreshToken цэвэрлэгдэнэ (бүх session хаагдана)

  POST /api/auth/register        — Шинэ хэрэглэгч бүртгэх
  POST /api/auth/login           — Нэвтрэх, token + refreshToken буцаана
  POST /api/auth/google          — Google OAuth: багш нэвтрэх/бүртгэх
  POST /api/auth/student-login   — Сурагч email+нууц үгээр нэвтрэх
  POST /api/auth/refresh         — Шинэ access token авах (refresh ашиглан)
  POST /api/auth/logout          — Гарах, DB-ийн token устгана [JWT]
  POST /api/auth/change-password — Нууц үг солих [rate: 5/15m]
  PATCH /api/auth/profile        — Профайл зураг шинэчлэх [JWT]
  GET   /api/auth/me             — Одоогийн хэрэглэгч [JWT]

  POST /api/auth/google логик:
    google-auth-library-ийн OAuth2Client.verifyIdToken() ашиглана
    Google credential-аас { googleId, email, name, picture } авна
    Хэрэглэгч олдвол googleId + profileImage шинэчилнэ
    Олдохгүй бол шинэ User үүсгэнэ (нууц үггүй)
    JWT access + refresh token буцаана

  POST /api/auth/student-login логик:
    Student.findOne({ email: regex }) — мэйлээр хайна
    student.comparePassword(password) — bcrypt шалгалт
    Зөвхөн student мэдээллийг буцаана (JWT биш)

  Нэвтрэх хариу формат (багш):
    { token, refreshToken, user: { id, username, email, role, profileImage } }

  Нэвтрэх хариу формат (сурагч):
    { message, student: { name, className, grades, email, average, ... } }

--- routes/studentRoutes.js ---

  GET  /api/students/public/lookup — Нийтийн endpoint (auth шаардлагагүй)
    ?email=student@gmail.com → Google OAuth болон Gmail-ээр дүн харах
    Зөвхөн { name, className, academicYear, semester, grades, email } буцаана
    password талбар хэзээ ч буцаагддаггүй

  Бусад бүх route-д authMiddleware ажилладаг (router.use(authMiddleware)).

  GET    /api/students           — Хуудаслагдсан жагсаалт
  GET    /api/students/meta/classes — Байгаа ангиудын жагсаалт
  GET    /api/students/:id       — Нэг сурагч
  POST   /api/students           — Шинэ сурагч нэмэх (password заавал биш)
  PUT    /api/students/:id       — Сурагч засах
  DELETE /api/students/:id       — Сурагч устгах + Cloudinary зураг устгана

  GET /api/students query params:
    ?search=Болд     → MongoDB $regex нэрээр хайлт (case-insensitive)
    ?className=11А   → Тухайн ангийн сурагчид
    ?academicYear=2024-2025 → Хичээлийн жилээр шүүнэ
    ?semester=1      → Улирлаар шүүнэ
    ?page=1          → Хуудасны дугаар (default: 1)
    ?limit=12        → Нэг хуудсан дахь тоо (default: 12, max: 50)

  Хариу формат (GET жагсаалт):
    { students: [...], total: 45, page: 1, pages: 4 }

  Role-based шүүлт (studentFilter):
    admin   → бүх сурагчийг харна
    teacher → зөвхөн өөрийн бүртгэсэн (createdBy === req.user.id)
              + бүртгэгч байхгүй legacy сурагчдыг харна

  validateAndCalcGrades():
    Дүн хадгалахын өмнө ажилладаг validator.
    - isNaN() шалгалт: "abc" гэх утга → 400 алдаа
    - Мужийн шалгалт: 0-30, 0-20 хязгаараас хэтэрвэл → 400 алдаа
    - score = exam1 + exam2 + attendance + independent автоматаар тооцоолно
    - Frontend-ийн тооцоолол итгэгддэггүй — backend дахин шалгана

  Cloudinary зураг устгах (deleteCloudinaryImage):
    DELETE /:id  → сурагч устгахад зураг Cloudinary-аас устана
    PUT /:id     → шинэ зураг орвол хуучныг Cloudinary-аас устана

--- routes/uploadRoutes.js ---

  POST /api/upload — Зураг Cloudinary руу хадгалах

  CloudinaryStorage тохиргоо (multer-storage-cloudinary v4):
    folder: 'bie-daalt', transformation: 200×200 face-crop thumbnail
  fileFilter: .jpg/.jpeg/.png/.gif/.webp
  limits: 5MB хязгаар
  Хариу: { url: 'https://res.cloudinary.com/...' }

----------------------------------------------------------------
4. FRONTEND ТАЙЛБАР
----------------------------------------------------------------

--- index.jsx ---

  GoogleOAuthProvider бүх App-г бүрхэж байна:
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter><App /></BrowserRouter>
    </GoogleOAuthProvider>
  // VITE_GOOGLE_CLIENT_ID орчны хувьсагч Vercel-д тохируулагдсан байх ёстой

--- utils/imageUrl.js ---

  export function getImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;  // Cloudinary URL → шууд буцаана
    return `${BACKEND_BASE}${url}`;          // /uploads/... → full URL болгоно
  }

--- App.jsx ---

  Гол state-ууд:
    token       — localStorage-аас уншиж эхэлнэ
    currentUser — { username, email, role, profileImage }
    students    — API-аас татсан хуудасны жагсаалт
    pagination  — { total, page, pages } — хуудаслалтын мэдээлэл
    toasts      — Notification-ууд

  localStorage түлхүүрүүд:
    ebs_token   — Access token (15 минут)
    ebs_refresh — Refresh token (30 хоног)
    ebs_user    — Хэрэглэгчийн мэдээлэл JSON

  Global 401 interceptor (Refresh token auto-retry):
    1. Хүсэлт 401 буцаана → ebs_refresh авна
    2. POST /api/auth/refresh → шинэ token авна → retry
    3. Refresh дуусвал → logout

--- pages/Login.jsx ---

  Tab: Багш нэвтрэх / Сурагч дүн харах

  Багш tab:
    - Имэйл + нууц үг form (нууц үг харах/нуух товч)
    - "Нэвтрэх" товч
    - "эсвэл" хуваагч
    - Google OAuth товч (GoogleLogin component)
    - "Бүртгүүлэх" холбоос
    - "Нууц үг солих" холбоос

  Сурагч tab:
    - Имэйл + нууц үг form (нууц үг харах/нуух товч)
    - "Нэвтрэх" товч → POST /api/auth/student-login
    - "эсвэл" хуваагч
    - Google OAuth товч → Gmail-ийг decode → /api/students/public/lookup
    - Амжилттай нэвтэрсний дараа дүнгийн хүснэгт харагдана
      (нэр, анги, дундаж оноо + үсгэн дүн, хичээл бүрийн дэлгэрэнгүй)

  PasswordInput компонент (хоёр tab-д хуваалцана):
    - useState(show) → type="password" ↔ type="text"
    - EyeIcon / EyeOffIcon (Icons.jsx) → position: absolute, right: 10px
    - tabIndex={-1} → Tab товчоор алгасна

  handleGoogleSuccess → POST /api/auth/google → onLogin() → navigate('/')
  handleStudentGoogle → JWT decode → atob(credential.split('.')[1])
                      → email авна → /api/students/public/lookup

--- pages/Register.jsx ---

  Имэйл + нууц үг form + Google OAuth товч
  handleGoogleSuccess → POST /api/auth/google → onLogin() → navigate('/')

--- pages/Dashboard.jsx ---

  Хяналтын самбар — гол хуудас.

  Stat card-ууд:
    - Нийт сурагч
    - Дундаж оноо
    - Сурлагын амжилт %  (average ≥ 50 сурагч / нийт × 100)
    - At-risk тоо (average < 60)

  Хичээл тус бүрийн чанар% график (BarChart):
    - Хичээл тус бүрт score ≥ 75 сурагчдын хувийг тооцоолно
    - Чанар% = (≥75 сурагч / нийт) × 100
    - Өнгийг чанараар ялгана: ≥75% ногоон, ≥50% шар, бусад улаан (Cell)

  A/B/C/D/F тоо карт (Dashboard-д):
    A ≥90, B ≥80, C ≥70, D ≥60, F <60
    Сурагч бүрийн дундаж оноогоор тооцоолно

  Шүүлтүүр (server-side, debounce 400ms):
    search, classFilter, yearFilter, semFilter, page

  At-risk анхааруулга (average < 60):
    Улаан зураасан карт + "Дүн хангалтгүй" banner

  exportExcel(): SheetJS — 2 sheet (.xlsx)
  handleImport(): Excel файлаас олон сурагч нэгэн зэрэг оруулах

--- pages/AddStudent.jsx ---

  Шинэ сурагч бүртгэх маягт.

  Шинэ талбарууд:
    - Gmail хаяг (email) — сурагч дүнгээ харахад хэрэглэнэ
    - Нэвтрэх нууц үг (password) — заавал биш
      Оруулсан бол bcrypt-ээр шифрлэгдэнэ (pre-save hook)
      Оруулаагүй бол сурагч зөвхөн Google OAuth-ээр нэвтрэх боломжтой

  Зураг upload, хичээл нэмэх/хасах урсгал өмнөхтэй адил.

--- pages/StudentDetail.jsx ---

  Нэг сурагчийн дэлгэрэнгүй хуудас.

  Үсгэн дүн (Letter Grade):
    A ≥90, B ≥80, C ≥70, D ≥60, F <60
    Хүснэгтийн "Үсгэн" багана — нийт оноо бүрийн хажууд
    Хэвлэх тайланд мөн харагдана

  A/B/C/D/F тоо (дүнгийн хүснэгтийн дор):
    Хичээл бүрийн нийт оноогоор тооцоолсон ангилал
    Өнгөт карт байдлаар харагдана

  BarChart (Recharts):
    Хичээл тус бүрийн 4 оноог stacked bar-аар харуулна
    Дээрээс доош: Шалгалт 1, Шалгалт 2, Ирц, Бие даалт

--- pages/SubjectDashboard.jsx ---

  Хичээл тус бүрийн аналитик самбар.

  Сурагчдын эрэмбэлэлтийн хүснэгтэд "Үсгэн дүн" багана нэмэгдсэн.

  BarChart дахь давхар баарны дараалал (визуалаар дээрээс):
    Шалгалт 1 (indigo) → Шалгалт 2 (purple) → Ирц (cyan) → Бие даалт (green)

--- pages/ChangePassword.jsx ---

  Нэвтрэлтгүйгээр хандах боломжтой (token шаардлагагүй).
  Бүх нууц үгийн оруулах талбарт харах/нуух товч нэмэгдсэн:
    - Одоогийн нууц үг
    - Шинэ нууц үг
    - Шинэ нууц үг давтах

  timerRef + useEffect cleanup:
    timerRef.current = setTimeout(...)
    useEffect(() => () => clearTimeout(timerRef.current), [])
    // Unmount болоход timeout цэвэрлэнэ

--- components/Icons.jsx ---

  SVG icon компонентууд. Шинээр нэмэгдсэн:
    EyeIcon    — нууц үг харуулах
    EyeOffIcon — нууц үг нуух

--- components/Toast.jsx ---

  ToastItem бүр:
    0ms    → mount, харагдана
    2600ms → fade out эхэлнэ
    3000ms → state-аас устгана

  Төрөл: 'success'(ногоон) / 'error'(улаан) / 'info'(цэнхэр)

----------------------------------------------------------------
5. GOOGLE OAUTH ТОХИРУУЛГА
----------------------------------------------------------------

  1. Google Cloud Console → APIs & Services → Credentials
  2. "Create Credentials" → "OAuth 2.0 Client IDs" → Web application
  3. Authorized JavaScript origins:
       https://bie-daalt-smoky.vercel.app
       http://localhost:5173
  4. Client ID-г Vercel-ийн Environment Variables-д нэмнэ:
       VITE_GOOGLE_CLIENT_ID = your_client_id_here
  5. Vercel-д Redeploy хийнэ

  Backend тохируулга (.env):
    GOOGLE_CLIENT_ID = your_client_id_here
  // Client secret шаардлагагүй (ID token verification хийдэг)

  Багш нэвтрэх урсгал:
    GoogleLogin → onSuccess(credentialResponse) →
    POST /api/auth/google { credential } →
    verifyIdToken → findOrCreate User → JWT tokens буцаана →
    onLogin() → navigate('/')

  Сурагч дүн харах урсгал (Google):
    GoogleLogin → onSuccess → atob(credential.split('.')[1]) →
    JSON.parse → payload.email →
    GET /api/students/public/lookup?email=... →
    дүн харагдана (нэвтрэлтгүй)

----------------------------------------------------------------
6. ДҮНГИЙН ТООЦООЛЛЫН СИСТЕМ
----------------------------------------------------------------

  Хичээл бүрийн нийт оноо:
    score = exam1 + exam2 + attendance + independent

    exam1       → max 30  (Шалгалт 1)
    exam2       → max 30  (Шалгалт 2)
    attendance  → max 20  (Ирц)
    independent → max 20  (Бие даалт)
    ─────────────────────────────────
    score       → max 100 (Нийт)

  Сурагчийн дундаж:
    average = (score1 + score2 + ... + scoreN) / N

  Үсгэн дүн (Letter Grade):
    ≥ 90 → A  (тэрлэлт,  ногоон)
    ≥ 80 → B  (сайн,     цэнхэр)
    ≥ 70 → C  (дунд,     шар)
    ≥ 60 → D  (хангалттай, улбар шар)
    < 60 → F  (хангалтгүй, улаан)

  Үнэлгээний ангилал (Dashboard at-risk):
    ≥ 90  → Тэрлэлт    (ногоон)
    ≥ 75  → Сайн       (цэнхэр)
    ≥ 60  → Дунд       (шар)
    < 60  → Хангалтгүй (улаан — at-risk анхааруулга харагдана)

  Сурлагын амжилт %:
    average ≥ 50 сурагч / нийт сурагч × 100

  Хичээлийн чанар %:
    score ≥ 75 сурагч / тухайн хичээлд бүртгэлтэй нийт × 100

  Тооцооллын дараалал:
    Frontend тооцоолно (харуулах зорилгоор, UX)
    Backend ДАХИН тооцоолно (validateAndCalcGrades, isNaN шалгалттай)
    → Frontend-ийн утгыг итгэж авдаггүй, backend давхар баталгаажуулна

----------------------------------------------------------------
7. АЮУЛГҮЙ БАЙДАЛ (SECURITY)
----------------------------------------------------------------

  JWT Token (Refresh Token систем):
    - Access token: 15 минут (богино хугацаа → алдагдсан ч аюул бага)
    - Refresh token: 30 хоног → DB-д хадгалагдана
    - Authorization: Bearer <access_token> header-ээр дамжина
    - Token rotation: refresh ашиглах бүрт шинэ refresh token буцаана

  Нууц үг:
    - bcrypt salt rounds = 12 (маш хүчтэй шифрлэлт)
    - Plain text нууц үг MongoDB-д хэзээ ч хадгалагдахгүй
    - User болон Student хоёулаа pre-save hook + comparePassword() ашиглана
    - Google OAuth хэрэглэгч нууц үггүй байж болно

  Google OAuth аюулгүй байдал:
    - Frontend: @react-oauth/google → Google-ийн нэмэлт хуудсаас нэвтрэнэ
    - Backend: OAuth2Client.verifyIdToken() → Google-ийн public key-ээр шалгана
    - Credential client side-д шууд ашиглагддаггүй

  Rate Limiting (express-rate-limit):
    - /login, /student-login → 15 минутэд 10 оролдлого
    - /register              → 1 цагт 5 оролдлого
    - /change-password       → 15 минутэд 5 оролдлого

  Input sanitization (validator.js):
    - name, className → sanitize(): HTML тэг + control char цэвэрлэнэ
    - XSS-ийг MongoDB-д хадгалагдахаас урьдчилан сэргийлнэ

  Role-based access:
    - admin: бүх сурагчийг харж, засах боломжтой
    - teacher: зөвхөн өөрийн (createdBy) сурагчдыг харна
    - Public endpoint: /api/students/public/lookup → password талбар ирдэггүй

  File upload (Cloudinary):
    - Зөвхөн зураг файл (.jpg/.jpeg/.png/.gif/.webp)
    - 5MB хязгаар
    - transformation: 200×200, crop: fill, gravity: face

----------------------------------------------------------------
8. ОРЧНЫ ХУВЬСАГЧИД (.env)
----------------------------------------------------------------

  Backend (.env):
    MONGODB_URI         — MongoDB Atlas connection string
    JWT_SECRET          — Access token нууц түлхүүр
    JWT_REFRESH_SECRET  — Refresh token нууц түлхүүр (заавал биш)
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
    GOOGLE_CLIENT_ID    — Google OAuth Client ID

  Frontend (.env / Vercel):
    VITE_GOOGLE_CLIENT_ID  — Google OAuth Client ID
    VITE_API_URL           — Backend URL (заавал биш, proxy ашиглана)

================================================================