const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Server running');
});

app.listen(8080, '0.0.0.0', () => {
    console.log('Server started on port 8080');
});