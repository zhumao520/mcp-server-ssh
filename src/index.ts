import express from 'express';
import cors from 'cors';
import { SSHManager } from './ssh-manager';
import { loadConfig } from './config';
import { logger } from './logger';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const manager = new SSHManager();
const config = loadConfig();

app.post('/connect', async (req, res) => {
    try {
        logger.info('Connect request received');
        const { id, host, port, username, password } = req.body;
        
        if (!id || !host || !username) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const success = await manager.connect(id, {
            host,
            port: port || 22,
            username,
            password
        });

        res.json({ success });
    } catch (error: any) {
        logger.error('Connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/exec', async (req, res) => {
    try {
        const { id, command } = req.body;
        
        if (!id || !command) {
            return res.status(400).json({ error: 'Missing id or command' });
        }

        const result = await manager.executeCommand(id, command);
        res.json(result);
    } catch (error: any) {
        logger.error('Execution error:', error);
        res.status(500).json({ error: error.message });
    }
});

const serverPort = Number(process.env.PORT) || config.server.port || 8080;

app.listen(serverPort, '0.0.0.0', () => {
    logger.info(`SSH Server listening on port ${serverPort}`);
});