import express from 'express';
import { NodeSSH } from 'node-ssh';

const app = express();
app.use(express.json());

const port = 8889;
const connections = new Map<string, NodeSSH>();

// Add CORS and response headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    next();
});

app.post('/connect', async (req, res) => {
    console.log('Connect request:', req.body);
    try {
        const { id, host, port, username, password } = req.body;
        const ssh = new NodeSSH();
        
        await ssh.connect({
            host,
            port,
            username,
            password,
            readyTimeout: 5000
        });
        
        connections.set(id, ssh);
        const response = { success: true, message: 'Connected successfully' };
        console.log('Connect response:', response);
        res.json(response);
    } catch (error: any) {
        console.error('Connect error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/exec', async (req, res) => {
    console.log('Exec request:', req.body);
    try {
        const { id, command } = req.body;
        const ssh = connections.get(id);
        
        if (!ssh) {
            const response = { success: false, error: 'Not connected' };
            console.log('Exec error:', response);
            return res.status(400).json(response);
        }
        
        const result = await ssh.execCommand(command);
        const response = {
            success: true,
            code: result.code,
            stdout: result.stdout,
            stderr: result.stderr
        };
        console.log('Exec response:', response);
        res.json(response);
    } catch (error: any) {
        console.error('Exec error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`SSH Server running at http://localhost:${port}`);
});