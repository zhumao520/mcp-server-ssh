const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    res.write('Hello World');
    res.end();
});

server.listen(8889, '0.0.0.0', () => {
    console.log('Server running at http://localhost:8889/');
});
