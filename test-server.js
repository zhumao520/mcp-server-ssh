const express = require('express');
const app = express();
app.use(express.json());

app.post('/connect', (req, res) => {
    console.log('Received connection request:', req.body);
    res.json({ status: 'connected' });
});

app.post('/exec', (req, res) => {
    console.log('Received exec request:', req.body);
    res.json({ status: 'executed', output: 'test output' });
});

app.listen(8888, '0.0.0.0', () => {
    console.log('Test server running on port 8888');
});