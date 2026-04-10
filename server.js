const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // 1. Live Monitor Endpoint
    if (req.url === '/api/logs' && req.method === 'GET') {
        const logPath = path.join(__dirname, 'acdp', 'events.log');
        fs.readFile(logPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Log not found' }));
            }
            // Parse JSONL correctly avoiding empty lines
            const logs = data.split('\n').filter(l => l.trim().length > 0).map(l => JSON.parse(l));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(logs));
        });
        return;
    }

    // 2. Static File Server Logic
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Quick security bypass for explicit static paths needed by vanilla JS
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

server.listen(PORT, () => {
    console.log(`[ACDP Monitor] Static server running on http://localhost:${PORT}`);
    console.log(`[ACDP Monitor] API Endpoint mapping /acdp/events.log at http://localhost:${PORT}/api/logs`);
});
