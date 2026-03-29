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
  Backend   — Node.js, Express 5
  Database  — MongoDB Atlas (Mongoose ODM)
  Auth      — JWT (jsonwebtoken) + bcryptjs
  Upload    — Multer + Cloudinary (үүлэн зураг хадгалалт)
  Security  — express-rate-limit (brute force хамгаалалт)
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
  │   │   ├── studentRoutes.js ← /api/students — CRUD + role + pagination
  │   │   └── uploadRoutes.js  ← /api/upload — Cloudinary зураг хадгалах
  │   ├── .env.example         ← Шаардлагатай орчны хувьсагчдын жишээ
  │   └── server.js            ← Express app, MongoDB холболт
  │
  └── frontend/src/
      ├── App.jsx              ← Routing, global state, header, pagination
      ├── index.css            ← Бүх CSS (design tokens, layout)
      ├── utils/
      │   └── imageUrl.js      ← Cloudinary/Backend URL-г зурагт нэмдэг
      ├── components/
      │   ├── Icons.jsx        ← SVG icon бүрэлдэхүүнүүд
      │   └── Toast.jsx        ← Notification (success/error/info)
      └── pages/
          ├── Login.jsx            ← Нэвтрэх
          ├── Register.jsx         ← Бүртгүүлэх
          ├── Dashboard.jsx        ← Хяналтын самбар (хайлт, Excel,
          │                           pagination, at-risk анхааруулга)
          ├── AddStudent.jsx       ← Сурагч нэмэх (зураг, дүн)
          ├── StudentDetail.jsx    ← Сурагчийн дэлгэрэнгүй + хэвлэх
          ├── SubjectDashboard.jsx ← Хичээл тус бүрийн аналитик
          ├── Profile.jsx          ← Хэрэглэгчийн профайл зураг
          └── ChangePassword.jsx   ← Нууц үг солих

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
    photo        — Cloudinary URL (https://res.cloudinary.com/...)
    createdBy    — Бүртгэсэн хэрэглэгчийн ObjectId

  studentSchema.virtual('average').get(function () {
    const total = this.grades.reduce((sum, g) => sum + (g.score ?? 0), 0);
    return (total / this.grades.length).toFixed(1);
  });
  // "average" талбар MongoDB-д хадгалагддаггүй — унших үед тооцоолно
  // toJSON: { virtuals: true } тохиргоо байгаа учир API-д харагдана
  // g.score ?? 0 — score байхгүй үед 0 авна (null-safe)

--- routes/authRoutes.js ---

  Rate limiting (express-rate-limit ашиглана):
    /login          → 15 минутэд 10 оролдлого хязгаар
    /register       → 1 цагт 5 оролдлого хязгаар
    /change-password → 15 минутэд 5 оролдлого хязгаар
    Хязгаараас хэтэрвэл 429 Too Many Requests буцаана

  POST /api/auth/register  — Шинэ хэрэглэгч бүртгэх
  POST /api/auth/login     — Нэвтрэх, JWT токен буцаана
  POST /api/auth/change-password — Нууц үг солих (токен шаардлагагүй)
  PATCH /api/auth/profile  — Профайл зураг шинэчлэх (токен шаардлагатай)

  Нэвтрэх жишээ:
    Хүсэлт:  { email, password }
    Хариу:   { token, user: { id, username, email, role, profileImage } }

  JWT payload:
    { id: user._id, username, email, role }
    // Токен 7 хоногийн хугацаатай (expiresIn: '7d')

--- routes/studentRoutes.js ---

  Бүх route-д authMiddleware ажилладаг (router.use(authMiddleware)).

  GET    /api/students           — Хуудаслагдсан жагсаалт
  GET    /api/students/meta/classes — Байгаа ангиудын жагсаалт
  GET    /api/students/:id       — Нэг сурагч
  POST   /api/students           — Шинэ сурагч нэмэх
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
    getPublicId(url): Cloudinary URL-аас public_id гаргана
      жишээ: ".../upload/v123/bie-daalt/img-abc.jpg" → "bie-daalt/img-abc"
    DELETE /:id  → сурагч устгахад зураг Cloudinary-аас устана
    PUT /:id     → шинэ зураг орвол хуучныг Cloudinary-аас устана
    Алдаа гарвал silent ignore (зураг устгагдаагүй ч сурагч устгагдана)

--- routes/uploadRoutes.js ---

  POST /api/upload — Зураг Cloudinary руу хадгалах

  CloudinaryStorage тохиргоо (multer-storage-cloudinary v4):
    params: async (_req, _file) => ({...})
    // v4-д params заавал async function байна, object биш

    folder: 'bie-daalt'          → Cloudinary дахь хавтас
    allowed_formats: [...]        → зөвшөөрөгдсөн форматууд
    transformation: [{width:400, height:400, crop:'limit'}]
    // Upload хийхэд зургийг автоматаар max 400x400-д resize хийнэ

  fileFilter: mimetype шалгана (.jpg/.jpeg/.png/.gif/.webp)
  limits: 5MB хязгаар

  Хариу: { url: 'https://res.cloudinary.com/...' }
  // Cloudinary URL шууд буцаана — getImageUrl() өөрчлөхгүй ашиглана

----------------------------------------------------------------
4. FRONTEND ТАЙЛБАР
----------------------------------------------------------------

--- utils/imageUrl.js ---

  export function getImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;  // Cloudinary URL → шууд буцаана
    return `${BACKEND_BASE}${url}`;          // /uploads/... → full URL болгоно
  }

  // Cloudinary ашиглах болсноор URL нь https://res.cloudinary.com/...
  // байдаг тул startsWith('http') нөхцөл шууд буцаана

--- App.jsx ---

  Гол state-ууд:
    token       — localStorage-аас уншиж эхэлнэ
    currentUser — { username, email, role, profileImage }
    students    — API-аас татсан хуудасны жагсаалт
    pagination  — { total, page, pages } — хуудаслалтын мэдээлэл
    toasts      — Notification-ууд

  fetchStudents(params):
    URLSearchParams ашиглан query string бүрдүүлнэ
    { search, className, academicYear, semester, page }
    Хариуд students масив болон pagination объект байна

  onUpdateUser(updatedUser):
    Profile зураг шинэчлэх үед Profile.jsx дуудна
    state + localStorage хоёуланг нь шинэчилнэ

  Global 401 interceptor:
    Хэрэв ямар нэг хүсэлт 401 буцаавал → автоматаар logout хийнэ

--- pages/Dashboard.jsx ---

  Хяналтын самбар — гол хуудас.

  Шүүлтүүр (server-side, debounce 400ms):
    search      — нэрээр хайлт → backend MongoDB $regex
    classFilter — ангиар шүүнэ → API ?className=
    yearFilter  — жилээр шүүнэ → API ?academicYear=
    semFilter   — улирлаар шүүнэ → API ?semester=
    // Filter өөрчлөгдөх бүрт 400ms хүлээгээд API дуудна (debounce)
    // Filter өөрчлөгдөхөд page автоматаар 1 болно

  Pagination:
    page state → filter-тэй хамт API-д явна
    totalPages > 1 үед ← Өмнөх / 1 2 3 / Дараах → харагдана
    Идэвхтэй хуудас тод харагдана, хязгаараас гарвал disabled болно

  At-risk анхааруулга (average < 60):
    Улаан зураасан карт + "Дүн хангалтгүй" banner харагдана
    Stat card-д тухайн хуудас дахь at-risk сурагчдын тоо харагдана
    Үнэлгээ: Тэрлэлт(≥90) / Сайн(≥75) / Дунд(≥60) / Хангалтгүй(<60)

  exportExcel():
    SheetJS ашиглан 2 sheet-тэй .xlsx файл үүсгэнэ:
      Sheet 1 "Ерөнхий жагсаалт" — нэр, анги, жил, дундаж, үнэлгээ
      Sheet 2 "Дэлгэрэнгүй дүн"  — хичээл тус бүрийн 4 оноо

  EditModal:
    Сурагч бүрийн хичээлийн дүнг modal-аас шууд засах боломж.

--- pages/AddStudent.jsx ---

  Шинэ сурагч бүртгэх маягт.

  Зураг upload урсгал:
    1. Файл сонгоно → preview-г нэн даруй харуулна (createObjectURL)
    2. POST /api/upload → Cloudinary URL авна
    3. Submit хийхэд photoUrl-г grades-тэй хамт илгээнэ

  Хичээл нэмэх/хасах:
    DEFAULT_SUBJECTS (10 хичээл) эхлэлд байна
    "Шинэ хичээл нэмэх" input + Enter/товч — нэмнэ
    ✕ товч — хасна
    Давхар нэр шалгадаг (toLowerCase)

--- pages/StudentDetail.jsx ---

  Нэг сурагчийн дэлгэрэнгүй хуудас.

  BarChart:
    fixed-height div (320px) → ResponsiveContainer height="100%"
    // Recharts-д тогтмол өндөр өгснөөр negative dimensions алдаа гарахгүй

  Дүн засах (inline edit):
    editGrades state-д хуулж засна
    "Хадгалах" → PUT /api/students/:id

  Хэвлэх:
    window.print() → @media print → .print-report л харагдана
    Тайланд: нэр, анги, жил, улирал, хичээл бүрийн 4 оноо + нийт

--- pages/SubjectDashboard.jsx ---

  Хичээл тус бүрийн аналитик самбар.

  buildSubjectStats(students):
    grades-ийг хичээлийн нэрээр бүлэглэж avg, max, min,
    excellent/good/below тоог тооцоолно.

  SubjectDetail BarChart:
    fixed-height div (300px) дотор ResponsiveContainer
    // SubjectDashboard-д мөн Recharts dimensions засах хийсэн

--- pages/Profile.jsx ---

  Upload урсгал:
    1. Camera товч → нуусан file input нээнэ
    2. Preview createObjectURL-ээр харагдана
    3. POST /api/upload → Cloudinary URL
    4. PATCH /api/auth/profile → DB-д хадгална
    5. onUpdateUser() → header avatar шинэчлэгдэнэ

--- pages/ChangePassword.jsx ---

  Нэвтрэлтгүйгээр хандах боломжтой (token шаардлагагүй).

  timerRef + useEffect cleanup:
    timerRef.current = setTimeout(...)
    useEffect(() => () => clearTimeout(timerRef.current), [])
    // Unmount болоход timeout цэвэрлэнэ

--- components/Toast.jsx ---

  ToastItem бүр:
    0ms    → mount, харагдана
    2600ms → fade out эхэлнэ
    3000ms → state-аас устгана

  Төрөл: 'success'(ногоон) / 'error'(улаан) / 'info'(цэнхэр)

----------------------------------------------------------------
5. ДҮНГИЙН ТООЦООЛЛЫН СИСТЕМ
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

  Үнэлгээний ангилал:
    ≥ 90  → Тэрлэлт    (ногоон)
    ≥ 75  → Сайн       (цэнхэр)
    ≥ 60  → Дунд       (шар)
    < 60  → Хангалтгүй (улаан — at-risk анхааруулга харагдана)

  Тооцооллын дараалал:
    Frontend тооцоолно (харуулах зорилгоор, UX)
    Backend ДАХИН тооцоолно (validateAndCalcGrades, isNaN шалгалттай)
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

  Rate Limiting (express-rate-limit):
    - /login          → 15 минутэд 10 оролдлого → brute force хамгаалалт
    - /register       → 1 цагт 5 оролдлого → spam хамгаалалт
    - /change-password → 15 минутэд 5 оролдлого
    - Хязгаараас хэтрэвэл 429 + Монгол мессеж буцаана

  Input validation:
    - isNaN() шалгалт: "abc" гэх утга → 400 алдаа
    - Мужийн шалгалт: 0-30, 0-20 хязгаараас хэтэрвэл → 400 алдаа
    - Semester зөвхөн 1 эсвэл 2 — бусад → 400 алдаа
    - name.trim() — хоосон зай бүхий нэрийг хассан

  Role-based access:
    - admin: бүх сурагчийг харж, засах боломжтой
    - teacher: зөвхөн өөрийн (createdBy) сурагчдыг харна
    - PUT /students/:id: өөр хэрэглэгчийн сурагчийг засах → 403

  File upload (Cloudinary):
    - Зөвхөн зураг файл (.jpg/.jpeg/.png/.gif/.webp)
    - 5MB хязгаар
    - Cloudinary автоматаар хадгалах — Render restart-д устахгүй
    - Upload-д автоматаар 400x400-д resize хийнэ (bandwidth хэмнэнэ)
    - Сурагч устгах үед Cloudinary-аас зураг автоматаар устана

----------------------------------------------------------------
7. LOCAL DEVELOPMENT (ДОТООД ОРЧИНД АЖИЛЛУУЛАХ)
----------------------------------------------------------------

  1. Backend:
       cd backend
       npm install
       # .env файл үүсгэж дараах утгуудыг тавина (.env.example харна уу):
       #   PORT=5000
       #   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ebs_grades
       #   JWT_SECRET=your_secret_key
       #   JWT_EXPIRES_IN=7d
       #   CLOUDINARY_CLOUD_NAME=your_cloud_name
       #   CLOUDINARY_API_KEY=your_api_key
       #   CLOUDINARY_API_SECRET=your_api_secret
       node server.js   # эсвэл: npm run dev (nodemon)
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
    /uploads → http://localhost:5000   (Зурган файлууд — local fallback)
    // CORS алдаагүйгээр local-д ажиллуулах боломж олгоно

  Cloudinary тохиргоо:
    1. https://cloudinary.com дээр үнэгүй бүртгэл үүсгэнэ
    2. Dashboard → Cloud Name, API Key, API Secret авна
    3. .env файл болон Render Environment-д тавина

----------------------------------------------------------------
8. API ENDPOINTS ХУРААНГУЙ
----------------------------------------------------------------

  AUTH
    POST  /api/auth/register        — Бүртгүүлэх         [rate: 5/hr]
    POST  /api/auth/login           — Нэвтрэх             [rate: 10/15m]
    POST  /api/auth/change-password — Нууц үг солих       [rate: 5/15m]
    PATCH /api/auth/profile         — Профайл зураг       [JWT]
    GET   /api/auth/me              — Одоогийн хэрэглэгч  [JWT]

  STUDENTS  (бүгд JWT шаардлагатай)
    GET    /api/students                — Хуудаслагдсан жагсаалт
      query: ?search= ?className= ?academicYear= ?semester= ?page= ?limit=
      return: { students: [...], total, page, pages }
    GET    /api/students/meta/classes   — Ангиудын жагсаалт
    GET    /api/students/:id            — Нэг сурагч
    POST   /api/students                — Шинэ сурагч нэмэх
    PUT    /api/students/:id            — Засах (+ зураг солиход хуучныг устгана)
    DELETE /api/students/:id            — Устгах (+ Cloudinary зураг устгана)

  UPLOAD  (JWT шаардлагатай)
    POST /api/upload                    — Cloudinary руу зураг хадгалах
      return: { url: 'https://res.cloudinary.com/...' }

================================================================
  ХИЙГДСЭН САЙЖРУУЛАЛТУУД (CHANGELOG)
================================================================

  v2.0 — Сүүлийн шинэчлэлт:
  ─────────────────────────────────────────────────────────────
  [1] Cloudinary upload
      Render free tier дээр файл системийн reset болдог асуудлыг
      шийдсэн. Зураг одоо Cloudinary үүлэнд хадгалагдана.
      multer-storage-cloudinary v4 → params async function байна.

  [2] Rate Limiting
      express-rate-limit нэмж login/register/change-password
      endpoint-уудыг brute force халдлагаас хамгаалсан.

  [3] Server-side хайлт/шүүлт
      MongoDB $regex ашиглан backend-д хайлт хийнэ.
      Бүх сурагчийг татаад client-д шүүхгүй болсон.
      Dashboard-д 400ms debounce нэмсэн.

  [4] Cloudinary зураг цэвэрлэлт
      Сурагч устгах / зураг солих үед Cloudinary-аас
      хуучин зургийг автоматаар устгана.

  [5] At-risk анхааруулга
      Дундаж < 60 сурагчид улаан хүрээтэй карт харагдана.
      "Дүн хангалтгүй — анхааруулга" banner нэмсэн.
      Stat card-д at-risk тоо харагдана.

  [6] Pagination
      Backend: нэг хүсэлтэд 12 сурагч (тохируулж болно).
      Frontend: ← Өмнөх / 1 2 3 / Дараах → UI нэмсэн.
      Filter өөрчлөгдөхөд page 1-д автоматаар буцна.

  v1.0 — Анхны хувилбар:
  ─────────────────────────────────────────────────────────────
  - 4-бүрэлдэхүүнт дүнгийн систем (Ш1+Ш2+Ирц+БД=100)
  - JWT нэвтрэлт, role-based access (admin/teacher)
  - Excel export (2 sheet), сурагч хайлт
  - Профайл зураг, сурагчийн зураг upload
  - Хэвлэх тайлан (@media print)
  - Хичээлүүд аналитик хуудас (SubjectDashboard)
  - Mobile hamburger цэс
  - Toast notification систем

================================================================
