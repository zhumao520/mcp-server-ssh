import express from 'express';
import cors from 'cors';
import { NodeSSH } from 'node-ssh';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
    dest: path.join(os.tmpdir(), 'ssh-uploads'),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const port = Number(process.env.SSH_PORT) || 8889;

import { SSHManager } from './ssh-manager';
import { logger } from './logger';

const manager = new SSHManager();

app.post('/connect', async (req, res) => {
    try {
        const { id, host, port, username, password, privateKey, passphrase } = req.body;
        logger.info(`Connecting to ${host}:${port} as ${username} ${password ? 'with password' : 'with key'}`);
        
        const success = await manager.connect(id, {
            host,
            port,
            username,
            password,
            privateKey,
            passphrase
        });
        
        res.json({ success, message: 'Connected successfully' });
    } catch (error: any) {
        logger.error('Connect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ... rest of the server code stays the same ...
