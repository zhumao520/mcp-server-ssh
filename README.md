# MCP SSH Server

SSH Server for Model Context Protocol. Enables secure remote command execution and file operations through SSH.

## Features
- SSH connection management
- Remote command execution
- Multiple simultaneous connections
- Secure password and key-based authentication

## Installation
```bash
npm install @modelcontextprotocol/server-ssh
```

## Configuration
Add to your Claude desktop config:
```json
{
  "mcpServers": {
    "ssh": {
      "command": "node",
      "args": ["path/to/server-ssh/dist/server.js"],
      "env": {
        "SSH_PORT": "8889",
        "SSH_LOG_LEVEL": "info"
      }
    }
  }
}
```

## Usage
The server provides REST endpoints:
- POST /connect - Establish SSH connection
- POST /exec - Execute remote command
