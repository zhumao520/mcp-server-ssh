import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/connect', (req, res) => {
    console.log('Received:', req.body);
    res.json({ success: true });
});

const port = 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Test server running on ${port}`);
});