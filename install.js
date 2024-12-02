#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Determine user's home directory
const homeDir = os.homedir();
const configPath = path.join(homeDir, 'claude', 'claude_desktop_config.json');

function installServer() {
    try {
        // Install dependencies
        console.log('Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        // Build the project
        console.log('Building project...');
        execSync('npm run build', { stdio: 'inherit' });

        // Update Claude config
        if (fs.existsSync(configPath)) {
            console.log('Updating Claude config...');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            config.mcpServers = config.mcpServers || {};
            config.mcpServers.ssh = {
                command: 'node',
                args: [path.join(__dirname, 'dist', 'server.js')],
                env: {
                    SSH_PORT: '8889',
                    SSH_LOG_LEVEL: 'info'
                }
            };

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }

        console.log('Installation complete! Server ready to use.');
    } catch (error) {
        console.error('Installation failed:', error);
        process.exit(1);
    }
}

installServer();