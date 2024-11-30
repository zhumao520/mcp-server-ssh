const http = require('http');

const server = http.createServer((req, res) => {
    const response = { message: 'Test response' };
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

server.listen(8888, '0.0.0.0', () => {
    console.log('Server running on port 8888');
});
