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
    limits: { fileSize: 50 * 1024 * 1024 }
});

const port = Number(process.env.SSH_PORT) || 8889;

import { SSHManager } from './ssh-manager';
import { logger } from './logger';

const manager = new SSHManager();

// Test route
app.get('/', (req, res) => {
    res.json({ status: 'SSH Server running' });
});

// Connect to SSH server
app.post('/connect', async (req, res) => {
    try {
        const { id, host, port, username, password, privateKey, passphrase } = req.body;
        logger.info(`Connecting to ${host}:${port} as ${username}`);
        
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

// Execute command
app.post('/exec', async (req, res) => {
    try {
        const { id, command } = req.body;
        logger.info(`Executing command on ${id}: ${command}`);
        
        const result = await manager.executeCommand(id, command);
        res.json({ ...result, success: true });
    } catch (error: any) {
        logger.error('Exec error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload file
app.post('/upload/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { remotePath } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file provided' 
            });
        }

        const result = await manager.uploadFile(id, file.path, remotePath);
        
        // Clean up temporary file
        fs.unlinkSync(file.path);
        
        res.json(result);
    } catch (error: any) {
        logger.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download file
app.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { remotePath } = req.query;

        if (typeof remotePath !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'remotePath parameter is required' 
            });
        }

        const localPath = path.join(os.tmpdir(), 'ssh-downloads', path.basename(remotePath));
        
        // Ensure download directory exists
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        
        const result = await manager.downloadFile(id, remotePath, localPath);
        
        if (result.success) {
            res.download(localPath, path.basename(remotePath), (err) => {
                if (err) {
                    logger.error('Download send error:', err);
                }
                // Clean up temporary file
                fs.unlinkSync(localPath);
            });
        } else {
            res.status(500).json(result);
        }
    } catch (error: any) {
        logger.error('Download error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// List directory
app.get('/ls/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dirPath = req.query.path as string;

        if (!dirPath) {
            return res.status(400).json({ error: 'Path parameter is required' });
        }

        const result = await manager.executeCommand(id, `ls -la ${dirPath}`);
        if (result.code === 0) {
            res.json({ success: true, output: result.stdout });
        } else {
            res.status(400).json({ success: false, error: result.stderr });
        }
    } catch (error: any) {
        logger.error('List directory error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get connection status
app.get('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const status = manager.getStatus(id);
        
        if (status) {
            res.json(status);
        } else {
            res.status(404).json({ error: 'Connection not found' });
        }
    } catch (error: any) {
        logger.error('Status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Disconnect
app.post('/disconnect/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await manager.disconnect(id);
        res.json({ success: true, message: 'Disconnected successfully' });
    } catch (error: any) {
        logger.error('Disconnect error:', error);
        res.status(500).json({ error: error.message });
    }
});

process.on('SIGINT', async () => {
    try {
        await manager.disconnectAll();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    logger.info(`SSH Server running at http://localhost:${port}`);
});