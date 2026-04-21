const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 8080;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Health check endpoint for monitoring
    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'BackfolioFrontend',
            environment: process.env.ENVIRONMENT || 'not-set'
        }));
        return;
    }

    // API endpoint to serve runtime config based on environment variable
    if (pathname === '/api/config') {
        const env = process.env.ENVIRONMENT || 'production';

        let config;
        if (env === 'staging') {
            config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.staging.json'), 'utf8'));
        } else {
            config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.production.json'), 'utf8'));
        }

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(JSON.stringify(config));
        return;
    }

    // Default to index.html for SPA routing
    if (pathname === '/') {
        pathname = '/index.html';
    }

    let filePath = path.join(__dirname, pathname);

    // Check if file exists, if not serve index.html for client-side routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(__dirname, 'index.html');
        pathname = '/index.html';
    }

    const ext = path.extname(pathname);
    const mimeType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('404 Not Found');
            return;
        }

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});