# MCP SSH Server

SSH Server implementation for Model Context Protocol (MCP). This server enables secure remote command execution and file operations through SSH protocol.

## Features

- Secure SSH connection management
- Remote command execution
- Multiple simultaneous connections
- Password and key-based authentication
- Detailed logging and error handling
- REST API interface

## Installation

```bash
npm install @modelcontextprotocol/server-ssh
```

## Configuration

Add to your Claude desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ssh": {
      "command": "node",
      "args": ["path/to/@modelcontextprotocol/server-ssh/dist/server.js"],
      "env": {
        "SSH_PORT": "8889",
        "SSH_LOG_LEVEL": "info"
      }
    }
  }
}
```

## API Endpoints

### Connect to SSH Host
```http
POST /connect
Content-Type: application/json

{
    "id": "connection-id",
    "host": "hostname",
    "port": 22,
    "username": "user",
    "password": "pass"
}
```

### Execute Command
```http
POST /exec
Content-Type: application/json

{
    "id": "connection-id",
    "command": "ls -la"
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Start server
npm start
```

## Environment Variables

- `SSH_PORT`: Server port (default: 8889)
- `SSH_LOG_LEVEL`: Logging level (default: info)

## License

MIT