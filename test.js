const express = require('express');
const app = express();

app.get('/', function(req, res) {
    const response = {
        message: 'Hello World',
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(response))
    });
    
    console.log('Sending response:', response);
    res.end(JSON.stringify(response));
});

const server = app.listen(8888, '0.0.0.0', () => {
    console.log('Server is running on port 8888');
});

// Error handling
server.on('error', (error) => {
    console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
