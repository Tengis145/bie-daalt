const fs = require('fs');
const path = require('path');

// Лог хадгалах хавтас
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'app.log');

const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const user = req.user ? `[${req.user.username}]` : '[Нэвтрээгүй]';
    const logLine = `[${timestamp}] ${user} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)\n`;

    // Console-д хэвлэх
    console.log(logLine.trim());

    // Файлд бичих
    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) console.error('Лог бичихэд алдаа:', err);
    });
  });

  next();
};

module.exports = logger;
