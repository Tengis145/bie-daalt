================================================================
  БИЕ ДААЛТ — ЕБС СУРАГЧДЫН ДҮН БҮРТГЭЛИЙН ВЭБ СИСТЕМ
================================================================

Deployment URL  : https://bie-daalt-smoky.vercel.app
Backend (Render): https://bie-daalt.onrender.com
GitHub Repo     : https://github.com/Tengis145/bie-daalt

----------------------------------------------------------------
1. ТЕХНОЛОГИЙН СТЕК (TECH STACK)
----------------------------------------------------------------

  Frontend  — React 18, Vite, React Router v7, Axios, Recharts,
              SheetJS (xlsx)
  Backend   — Node.js, Express 4
  Database  — MongoDB Atlas (Mongoose ODM)
  Auth      — JWT (jsonwebtoken) + bcryptjs
  Upload    — Multer (local /uploads/ folder)
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
  │   │   ├── Student.js       ← Сурагчийн схем (grades, average)
  │   │   └── User.js          ← Хэрэглэгчийн схем (bcrypt нууц үг)
  │   ├── routes/
  │   │   ├── authRoutes.js    ← /api/auth — нэвтрэх, бүртгэх, нууц үг
  │   │   ├── studentRoutes.js ← /api/students — CRUD + role шүүлт
  │   │   └── uploadRoutes.js  ← /api/upload — зураг хадгалах
  │   └── server.js            ← Express app, MongoDB холболт
  │
  └── frontend/src/
      ├── App.jsx              ← Routing, global state, header
      ├── index.css            ← Бүх CSS (design tokens, layout)
      ├── utils/
      │   └── imageUrl.js      ← Backend URL-г зурагт нэмдэг helper
      ├── components/
      │   ├── Icons.jsx        ← SVG icon бүрэлдэхүүнүүд
      │   └── Toast.jsx        ← Notification (success/error/info)
      └── pages/
          ├── Login.jsx        ← Нэвтрэх
          ├── Register.jsx     ← Бүртгүүлэх
          ├── Dashboard.jsx    ← Хяналтын самбар (хайлт, Excel)
          ├── AddStudent.jsx   ← Сурагч нэмэх (зураг, дүн)
          ├── StudentDetail.jsx ← Сурагчийн дэлгэрэнгүй + хэвлэх
          ├── SubjectDashboard.jsx ← Хичээл тус бүрийн аналитик
          ├── Profile.jsx      ← Хэрэглэгчийн профайл зураг
          └── ChangePassword.jsx ← Нууц үг солих

----------------------------------------------------------------
3. BACKEND ТАЙЛБАР
----------------------------------------------------------------

--- server.js ---

  Express app-ийг үүсгэж, MongoDB-тэй холбож, route-уудыг
  бүртгэдэг файл.

  const app = express();
  app.use(cors({ origin: ['https://...vercel.app', 'localhost'] }));
  // CORS: зөвхөн энэ 2 домэйноос хүсэлт зөвшөөрнө

  app.use('/uploads', express.static(...));
  // /uploads хавтасны зурган файлуудыг шууд өгнө (статик)

  mongoose.connect(process.env.MONGODB_URI)
  // .env файлаас MongoDB холболтын URL уншина

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
  // Токеныг тайлж req.user дотор хэрэглэгчийн мэдээллийг тавина
  // (id, role, username) — дараагийн route-д ашиглана

--- models/User.js ---

  MongoDB-д хэрэглэгчийн мэдээллийг хадгалах схем.

  password: { type: String, minlength: 6 }
  // Нууц үгийг plain text-ээр хадгалдаггүй

  userSchema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, 12);
  });
  // Хадгалахын ӨМНӨ bcrypt-ээр шифрлэнэ (12 давтамж = хүчтэй)

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
    photo        — /uploads/... URL
    createdBy    — Бүртгэсэн хэрэглэгчийн ObjectId

  studentSchema.virtual('average').get(function () {
    const total = this.grades.reduce((sum, g) => sum + (g.score ?? 0), 0);
    return (total / this.grades.length).toFixed(1);
  });
  // "average" талбар MongoDB-д хадгалагддаггүй — унших үед тооцоолно
  // toJSON: { virtuals: true } тохиргоо байгаа учир API-д харагдана

--- routes/authRoutes.js ---

  POST /api/auth/register  — Шинэ хэрэглэгч бүртгэх
  POST /api/auth/login     — Нэвтрэх, JWT токен буцаана
  POST /api/auth/change-password — Нууц үг солих (токен шааргүй)
  PATCH /api/auth/profile  — Профайл зураг шинэчлэх (токен шаардлагатай)

  Нэвтрэх жишээ:
    Хүсэлт:  { email, password }
    Хариу:   { token, user: { id, username, email, role, profileImage } }

  JWT payload:
    { id: user._id, username, email, role }
    // Токен 7 хоногийн хугацаатай (expiresIn: '7d')

--- routes/studentRoutes.js ---

  Бүх route-д authMiddleware ажилладаг (router.use(authMiddleware)).

  GET    /api/students           — Жагсаалт (role-ийн дагуу шүүнэ)
  GET    /api/students/meta/classes — Байгаа ангиудын жагсаалт
  GET    /api/students/:id       — Нэг сурагч
  POST   /api/students           — Шинэ сурагч нэмэх
  PUT    /api/students/:id       — Сурагч засах
  DELETE /api/students/:id       — Сурагч устгах

  Role-based шүүлт (studentFilter):
    admin   → бүх сурагчийг харна
    teacher → зөвхөн өөрийн бүртгэсэн (createdBy === req.user.id)
              + бүртгэгч байхгүй legacy сурагчдыг харна

  validateAndCalcGrades():
    Дүн хадгалахын өмнө ажилладаг validator.
    - isNaN() шалгалт нэмсэн → "abc" гэх мэт утга орвол 400 алдаа буцаана
    - Мужаас хэтэрвэл 400 алдаа буцаана
    - score = exam1 + exam2 + attendance + independent автоматаар тооцоолно

--- routes/uploadRoutes.js ---

  POST /api/upload — Нэг зураг хадгалах

  Multer тохиргоо:
    storage: diskStorage → backend/uploads/ хавтас руу хадгална
    filename: img-{timestamp}-{random}.{ext} → нэр давхцахаас хамгаална
    fileFilter: .jpg/.jpeg/.png/.gif/.webp зөвшөөрнө
    limits: 5MB-аас их файлыг татгалзана

  Хариу: { url: '/uploads/img-xxx.jpg' }
  // Frontend энэ URL-г MongoDB-д хадгалж, зураг харуулахад ашиглана

----------------------------------------------------------------
4. FRONTEND ТАЙЛБАР
----------------------------------------------------------------

--- utils/imageUrl.js ---

  export function getImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;  // Аль хэдийн бүтэн URL
    return `${BACKEND_BASE}${url}`;          // /uploads/... → full URL болгоно
  }

  // Development: VITE_API_URL = 'http://localhost:5000/api'
  //   → BASE = 'http://localhost:5000'
  //   → '/uploads/img.jpg' → 'http://localhost:5000/uploads/img.jpg'
  // Production: BASE = '' (Vercel proxy /uploads → Render руу дамжуулна)

--- App.jsx ---

  Бүх дэд хуудасны эцэг бүрэлдэхүүн. Гол state-ууд:
    token       — localStorage-аас уншиж эхэлнэ
    currentUser — { username, email, role, profileImage }
    students    — API-аас татсан жагсаалт
    toasts      — Notification-ууд

  handleLogin(token, user):
    Token болон user-ийг state + localStorage-д хадгална
    axios.defaults.headers.common['Authorization'] тавина
    (Цаашид бүх хүсэлтэд автоматаар token орно)

  onUpdateUser(updatedUser):
    Profile зураг шинэчлэх үед Profile.jsx дуудна
    state + localStorage хоёуланг нь шинэчилнэ

  Global 401 interceptor:
    axios.interceptors.response.use(...)
    Хэрэв ямар нэг хүсэлт 401 буцаавал → автоматаар logout хийнэ
    (Token хугацаа дуусвал хэрэглэгч дахин нэвтрэх шаардлагатай болно)

  ProtectedRoute:
    Token байхгүй үед /login руу redirect хийдэг wrapper

--- pages/Login.jsx & Register.jsx ---

  Стандарт нэвтрэх/бүртгүүлэх маягт.
  Амжилттай бол App.jsx-ийн handleLogin-г дуудна.

--- pages/Dashboard.jsx ---

  Хяналтын самбар — гол хуудас.

  Шүүлтүүр (client-side, useMemo ашигладаг):
    search    — нэрээр хайлт (toLowerCase харьцуулалт)
    yearFilter — хичээлийн жилээр шүүнэ
    semFilter  — улирлаар шүүнэ

  exportExcel():
    SheetJS ашиглан 2 sheet-тэй .xlsx файл үүсгэнэ:
      Sheet 1 "Ерөнхий жагсаалт" — нэр, анги, жил, дундаж, үнэлгээ
      Sheet 2 "Дэлгэрэнгүй дүн"  — хичээл тус бүрийн 4 оноо

  EditModal:
    Dashboard дотор тодорхойлогдсон inline component.
    Сурагч бүрийн хичээлийн дүнг modal-аас шууд засах боломж.

  getComponentAvgs(student):
    Хичээл тус бүрийн Ш1/Ш2/Ирц/БД дунджийг тооцоолно.
    student card-д жижиг breakdown харагдуулна.

--- pages/AddStudent.jsx ---

  Шинэ сурагч бүртгэх маягт.

  Зураг upload урсгал:
    1. Файл сонгоно → preview-г нэн даруй харуулна (createObjectURL)
    2. POST /api/upload → { url: '/uploads/...' } авна
    3. Submit хийхэд photoUrl-г grades-тэй хамт илгээнэ

  Хичээл нэмэх/хасах:
    DEFAULT_SUBJECTS (10 хичээл) эхлэлд байна
    "Шинэ хичээл нэмэх" input + Enter/товч ашиглан нэмнэ
    ✕ товч дарж хасна
    Давхар нэр шалгадаг (toLowerCase харьцуулалт)

  calcScore = exam1 + exam2 + attendance + independent
    Оролт өөрчлөгдөх бүрт нийт оноог автоматаар дахин тооцоолно

--- pages/StudentDetail.jsx ---

  Нэг сурагчийн дэлгэрэнгүй хуудас.

  Дүн засах (inline edit):
    "Засах" товч дарахад editGrades state рүү хуулна
    Оролтуудад min/max хязгаар ажиллана
    "Хадгалах" → PUT /api/students/:id → setStudent(updated)

  Хэвлэх:
    window.print() дуудна
    @media print CSS-ийн тусламжтайгаар UI нуугдаж,
    .print-report div (тайлан хэлбэр) л харагдана

  BarChart:
    Recharts ашиглан хичээл тус бүрийн нийт оноог
    horizontal bar chart-аар харуулна.
    Cell-ийн өнгө оноогоор солигдоно (ногоон/цэнхэр/шар)

--- pages/SubjectDashboard.jsx ---

  Хичээл тус бүрийн аналитик самбар.

  buildSubjectStats(students):
    Бүх сурагчдын grades-ийг хичээлийн нэрээр бүлэглэнэ.
    Хичээл бүрт: avg, max, min, count, excellent/good/below тоог тооцоолно.

  SubjectCard:
    Хичээл бүрийн хураангуй карт.
    Dist bar: тэрлэлт (≥90) / сайн (≥75) / бага гэсэн харьцааг
    өнгөт зураасаар харуулна.

  SubjectDetail (сонгосон хичээл):
    Stacked BarChart — сурагч бүрийн Ш1/Ш2/Ирц/БД оноог
    давхарлан харуулна (ResponsiveContainer → fixed-height div-д)
    Сурагчдыг дундаж оноогоор эрэмбэлж хүснэгтэд харуулна.

--- pages/Profile.jsx ---

  Хэрэглэгчийн профайл зураг удирдах хуудас.

  Upload урсгал:
    1. fileRef.current.click() → file input нээнэ (нуусан input)
    2. Файл сонгоход preview-г createObjectURL-ээр харуулна
    3. "Зураг хадгалах" → POST /api/upload → url авна
    4. PATCH /api/auth/profile { profileImage: url }
    5. App.jsx-ийн onUpdateUser() дуудна → header avatar шинэчлэгдэнэ

--- pages/ChangePassword.jsx ---

  Нэвтрэлтгүйгээр нэвтрэх боломжтой (ProtectedRoute-д ороогүй).
  (Нууц үгээ мартсан хэрэглэгч token-гүйгээр солих боломжтой)

  timerRef + useEffect cleanup:
    setTimeout-ийг ref-д хадгалдаг учир компонент
    unmount болоход clearTimeout автоматаар ажиллана.
    (State update on unmounted component алдаанаас сэргийлнэ)

--- components/Toast.jsx ---

  showToast(message, type) дуудахад App.jsx-ийн toasts state-д
  нэмэгдэнэ. ToastItem бүр:
    0ms    → mount
    2600ms → .toast-show арилна (fade out эхэлнэ)
    3000ms → toasts state-аас устгана

  Төрөл:
    'success' → ногоон
    'error'   → улаан
    'info'    → цэнхэр

--- components/Icons.jsx ---

  SVG icon бүхэн React функциональ компонент болгон тодорхойлогдсон.
  { size = 20, color = 'currentColor' } пропс авдаг.
  Эх сурвалж: Heroicons / Material Design Icons

----------------------------------------------------------------
5. ДҮНГИЙН ТООЦООЛЛЫН СИСТЕМ
----------------------------------------------------------------

  Хичээл бүрийн нийт оноо:
    score = exam1 + exam2 + attendance + independent

    exam1       → max 30 (Шалгалт 1)
    exam2       → max 30 (Шалгалт 2)
    attendance  → max 20 (Ирц)
    independent → max 20 (Бие даалт)
    ─────────────────────────────
    score       → max 100 (Нийт)

  Сурагчийн дундаж:
    average = (score1 + score2 + ... + scoreN) / N

  Үнэлгээний ангилал:
    ≥ 90  → Тэрлэлт  (ногоон)
    ≥ 75  → Сайн     (цэнхэр)
    < 75  → Дунд     (шар)

  Тооцооллын дараалал:
    Frontend тооцоолно (харуулах зорилгоор)
    Backend ДАХИН тооцоолно (validateAndCalcGrades)
    → Frontend-ийн утгыг итгэж авдаггүй, backend давхар баталгаажуулна

----------------------------------------------------------------
6. АЮУЛГҮЙ БАЙДАЛ (SECURITY)
----------------------------------------------------------------

  JWT Token:
    - 7 хоногийн хугацаатай
    - Authorization: Bearer <token> header-ээр дамжина
    - Хугацаа дуусвал 401 → frontend автоматаар logout хийнэ

  Нууц үг:
    - bcrypt salt rounds = 12 (маш хүчтэй шифрлэлт)
    - Plain text нууц үг MongoDB-д хэзээ ч хадгалагдахгүй
    - comparePassword() метод ашиглан шалгана

  Input validation:
    - isNaN() шалгалт: тоон бус утга (e.g. "abc") → 400 алдаа
    - Мужийн шалгалт: 0-30, 0-20 хязгаараас хэтэрвэл → 400 алдаа
    - Semester зөвхөн 1 эсвэл 2 байна — бусад → 400 алдаа
    - name.trim() — хоосон зай бүхий нэрийг хассан

  Role-based access:
    - admin: бүх сурагчийг харж, засах боломжтой
    - teacher: зөвхөн өөрийн (createdBy) сурагчдыг харна
    - PUT /students/:id: өөр хэрэглэгчийн сурагчийг засах → 403

  File upload:
    - Зөвхөн зураг файл (.jpg/.jpeg/.png/.gif/.webp)
    - 5MB хязгаар
    - Файлын нэрийг timestamp+random болгон солино
      (original нэр ашиглагдахгүй — path traversal хамгаалалт)

----------------------------------------------------------------
7. LOCAL DEVELOPMENT (ДОТООД ОРЧИНД АЖИЛЛУУЛАХ)
----------------------------------------------------------------

  1. Backend:
       cd backend
       npm install
       # .env файл үүсгэж дараах утгуудыг тавина:
       #   MONGODB_URI=mongodb+srv://...
       #   JWT_SECRET=your_secret_key
       #   PORT=5000
       node server.js
       # → http://localhost:5000

  2. Frontend:
       cd frontend
       npm install
       # .env файл:
       #   VITE_API_URL=http://localhost:5000/api
       npm run dev
       # → http://localhost:5173

  Vite proxy тохиргоо (vite.config.js):
    /api     → http://localhost:5000   (API хүсэлтүүд)
    /uploads → http://localhost:5000   (Зурган файлууд)
    // CORS алдаагүйгээр local-д ажиллуулах боломж олгоно

----------------------------------------------------------------
8. API ENDPOINTS ХУРААНГУЙ
----------------------------------------------------------------

  AUTH
    POST /api/auth/register        — Бүртгүүлэх
    POST /api/auth/login           — Нэвтрэх
    POST /api/auth/change-password — Нууц үг солих
    PATCH /api/auth/profile        — Профайл зураг шинэчлэх

  STUDENTS  (бүгд JWT шаардлагатай)
    GET    /api/students                — Жагсаалт
    GET    /api/students/meta/classes   — Ангиудын жагсаалт
    GET    /api/students/:id            — Нэг сурагч
    POST   /api/students                — Шинэ сурагч нэмэх
    PUT    /api/students/:id            — Засах
    DELETE /api/students/:id            — Устгах

  UPLOAD  (JWT шаардлагатай)
    POST /api/upload                    — Зураг хадгалах

================================================================
