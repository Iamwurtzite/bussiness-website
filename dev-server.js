/**
 * NAISHVI CELEBRATIONS - Lightweight Local Server (Zero Dependencies)
 * Runs directly with Node.js without needing any npm install!
 * 
 * Usage:
 *   node dev-server.js
 * Opens at:
 *   http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, reqPath);

  // Security check: ensure path is within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try appending .html
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath)) {
        filePath = htmlPath;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found: ' + reqPath);
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🎊 ══════════════════════════════════════════════════════ 🎊');
  console.log('  ║                                                          ║');
  console.log('  ║       NAISHVI CELEBRATIONS  —  Server is Running!        ║');
  console.log('  ║                                                          ║');
  console.log(`  ║       🌐  Website URL:       http://localhost:${PORT}        ║`);
  console.log(`  ║       🔐  Admin Dashboard:   http://localhost:${PORT}/admin.html ║`);
  console.log(`  ║       💳  Customer Portal:   http://localhost:${PORT}/customer-portal.html ║`);
  console.log(`  ║       🤝  Vendor Portal:     http://localhost:${PORT}/vendor-portal.html   ║`);
  console.log('  ║                                                          ║');
  console.log('  🎊 ══════════════════════════════════════════════════════ 🎊');
  console.log('');
  console.log('Press Ctrl + C to stop the server.');
});
