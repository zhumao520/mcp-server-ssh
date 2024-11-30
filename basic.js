const express = require('express');
const app = express();

app.use(express.json());

app.post('/test', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ message: 'Test response' }));
});

app.listen(8888, '0.0.0.0');
