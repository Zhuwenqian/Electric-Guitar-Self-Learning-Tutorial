var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = 'd:/ZhuWenqian/Documents/电吉他自学教程';
var PORT = 9999;

var MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'font/ttf',
    '.sf2': 'application/octet-stream',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    /* Guitar Pro 文件格式 */
    '.gp': 'application/octet-stream',
    '.gp3': 'application/octet-stream',
    '.gp4': 'application/octet-stream',
    '.gp5': 'application/octet-stream',
    '.gpx': 'application/octet-stream'
};

var server = http.createServer(function(req, res) {
    var url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';
    
    /* 解码URL中的中文字符 */
    url = decodeURIComponent(url);
    
    var filePath = path.join(ROOT, url);
    
    fs.readFile(filePath, function(err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found: ' + url);
            return;
        }
        
        var ext = path.extname(filePath).toLowerCase();
        var contentType = MIME[ext] || 'application/octet-stream';
        
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
});

server.listen(PORT, function() {
    console.log('Server running at http://localhost:' + PORT + '/');
    console.log('Press Ctrl+C to stop');
});
