const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ЕБС Дүн Бүртгэлийн API',
      version: '1.0.0',
      description: 'ЕБС (Ерөнхий боловсролын сургууль) сурагчдын дүн бүртгэх системийн REST API',
    },
    servers: [
      { url: 'https://bie-daalt.onrender.com', description: 'Production' },
      { url: 'http://localhost:5000', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token (15 минут)',
        },
      },
      schemas: {
        // ── Auth ────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', example: 'teacher01' },
            email:    { type: 'string', format: 'email', example: 'teacher@school.mn' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message:      { type: 'string' },
            token:        { type: 'string', description: 'JWT access token (15min)' },
            refreshToken: { type: 'string', description: 'Refresh token (30 days)' },
            user: {
              type: 'object',
              properties: {
                id:           { type: 'string' },
                username:     { type: 'string' },
                email:        { type: 'string' },
                role:         { type: 'string', enum: ['admin', 'teacher'] },
                profileImage: { type: 'string' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id:          { type: 'string' },
            username:     { type: 'string' },
            email:        { type: 'string' },
            role:         { type: 'string', enum: ['admin', 'teacher'] },
            profileImage: { type: 'string' },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        // ── Student ─────────────────────────────────────────
        Grade: {
          type: 'object',
          required: ['subject'],
          properties: {
            subject:     { type: 'string', example: 'Математик' },
            exam1:       { type: 'number', minimum: 0, maximum: 30,  example: 25 },
            exam2:       { type: 'number', minimum: 0, maximum: 30,  example: 22 },
            attendance:  { type: 'number', minimum: 0, maximum: 20,  example: 18 },
            independent: { type: 'number', minimum: 0, maximum: 20,  example: 15 },
            score:       { type: 'number', minimum: 0, maximum: 100, example: 80, description: 'exam1+exam2+attendance+independent (auto-computed)' },
          },
        },
        Student: {
          type: 'object',
          properties: {
            _id:          { type: 'string' },
            name:         { type: 'string', example: 'Болд Баяр' },
            className:    { type: 'string', example: '10А' },
            academicYear: { type: 'string', example: '2024-2025' },
            semester:     { type: 'integer', enum: [1, 2] },
            photo:        { type: 'string', description: 'Cloudinary URL' },
            email:        { type: 'string', description: 'Gmail for student login' },
            grades:       { type: 'array', items: { $ref: '#/components/schemas/Grade' } },
            average:      { type: 'number', description: 'Virtual: mean of all grade scores' },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        StudentListResponse: {
          type: 'object',
          properties: {
            students: { type: 'array', items: { $ref: '#/components/schemas/Student' } },
            total:    { type: 'integer' },
            page:     { type: 'integer' },
            pages:    { type: 'integer' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      // ── /api/auth ────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Шинэ багш бүртгэх',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'Амжилттай бүртгэгдлээ', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Email or username already taken' },
            429: { description: 'Rate limit: 5 per hour' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Багш нэвтрэх (email + нууц үг)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'Амжилттай нэвтэрлээ', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid credentials' },
            429: { description: 'Rate limit: 10 per 15min' },
          },
        },
      },
      '/api/auth/google': {
        post: {
          tags: ['Auth'],
          summary: 'Багш Google OAuth-ээр нэвтрэх/бүртгэх',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['credential'], properties: { credential: { type: 'string', description: 'Google ID token' } } } } } },
          responses: {
            200: { description: 'Google login success', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid Google token' },
          },
        },
      },
      '/api/auth/student-login': {
        post: {
          tags: ['Auth'],
          summary: 'Сурагч нэвтрэх (email + нууц үг)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: {
              description: 'Амжилттай нэвтэрлээ',
              content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, student: { $ref: '#/components/schemas/Student' } } } } },
            },
            401: { description: 'Invalid credentials' },
            429: { description: 'Rate limit: 10 per 15min' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh token → шинэ access token авах',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } } },
          responses: {
            200: { description: 'New tokens', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, refreshToken: { type: 'string' } } } } } },
            403: { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Гарах — refresh token цуцлах',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Амжилттай гарлаа' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/change-password': {
        post: {
          tags: ['Auth'],
          summary: 'Нууц үг солих',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'currentPassword', 'newPassword'], properties: { email: { type: 'string' }, currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 6 } } } } } },
          responses: {
            200: { description: 'Нууц үг солигдлоо' },
            401: { description: 'Wrong current password' },
            429: { description: 'Rate limit: 5 per 15min' },
          },
        },
      },
      '/api/auth/profile': {
        patch: {
          tags: ['Auth'],
          summary: 'Профайл зураг шинэчлэх',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { profileImage: { type: 'string', description: 'Cloudinary URL' } } } } } },
          responses: {
            200: { description: 'Профайл шинэчлэгдлээ' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Одоогийн нэвтэрсэн хэрэглэгчийн мэдээлэл',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/users': {
        get: {
          tags: ['Auth', 'Admin'],
          summary: 'Бүх багш жагсаах (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
            403: { description: 'Admin only' },
          },
        },
        post: {
          tags: ['Auth', 'Admin'],
          summary: 'Шинэ багш үүсгэх (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'User created' },
            403: { description: 'Admin only' },
            409: { description: 'Duplicate email/username' },
          },
        },
      },
      '/api/auth/users/{id}': {
        delete: {
          tags: ['Auth', 'Admin'],
          summary: 'Багш устгах (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ObjectId' }],
          responses: {
            200: { description: 'Deleted' },
            400: { description: 'Cannot delete yourself' },
            403: { description: 'Admin only' },
            404: { description: 'User not found' },
          },
        },
      },
      // ── /api/students ─────────────────────────────────────
      '/api/students/public/lookup': {
        get: {
          tags: ['Students'],
          summary: 'Сурагч дүнгээ Gmail-аар харах (auth шаардлагагүй)',
          parameters: [{ in: 'query', name: 'email', required: true, schema: { type: 'string' }, description: 'Student Gmail address' }],
          responses: {
            200: { description: 'Student grades', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
            404: { description: 'Student not found' },
            429: { description: 'Rate limit: 20 per 15min' },
          },
        },
      },
      '/api/students': {
        get: {
          tags: ['Students'],
          summary: 'Сурагчдын жагсаалт (pagination + filters)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page',         schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit',        schema: { type: 'integer', default: 12, maximum: 50 } },
            { in: 'query', name: 'search',       schema: { type: 'string' }, description: 'Name regex search' },
            { in: 'query', name: 'className',    schema: { type: 'string' } },
            { in: 'query', name: 'academicYear', schema: { type: 'string' } },
            { in: 'query', name: 'semester',     schema: { type: 'integer', enum: [1, 2] } },
          ],
          responses: {
            200: { description: 'Paginated list', content: { 'application/json': { schema: { $ref: '#/components/schemas/StudentListResponse' } } } },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Students'],
          summary: 'Шинэ сурагч нэмэх',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'className'],
                  properties: {
                    name:         { type: 'string' },
                    className:    { type: 'string' },
                    academicYear: { type: 'string', example: '2024-2025' },
                    semester:     { type: 'integer', enum: [1, 2] },
                    photo:        { type: 'string' },
                    email:        { type: 'string' },
                    password:     { type: 'string', minLength: 6 },
                    grades:       { type: 'array', items: { $ref: '#/components/schemas/Grade' } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/students/meta/classes': {
        get: {
          tags: ['Students'],
          summary: 'Ангиудын жагсаалт авах',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Sorted class names', content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } } },
          },
        },
      },
      '/api/students/{id}': {
        get: {
          tags: ['Students'],
          summary: 'Нэг сурагчийн дэлгэрэнгүй',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Student', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
            403: { description: 'Access denied' },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Students'],
          summary: 'Сурагч засах',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
          responses: {
            200: { description: 'Updated student' },
            400: { description: 'Validation error' },
            403: { description: 'Access denied' },
          },
        },
        delete: {
          tags: ['Students'],
          summary: 'Сурагч устгах (Cloudinary зураг мөн устгана)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Deleted' },
            403: { description: 'Access denied' },
            404: { description: 'Not found' },
          },
        },
      },
      // ── /api/upload ─────────────────────────────────────
      '/api/upload': {
        post: {
          tags: ['Upload'],
          summary: 'Зураг Cloudinary руу upload хийх',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'jpg/jpeg/png/gif/webp, max 5MB' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Upload success', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', description: 'Cloudinary URL' } } } } } },
            400: { description: 'Invalid file or missing image' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
