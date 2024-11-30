# MCP SSH Server

A powerful SSH server implementation for Model Context Protocol (MCP). This server enables secure remote command execution and file operations through SSH protocol, supporting both password and key-based authentication.

## Features

- ✨ Secure SSH connection management
- 🔑 Password and key-based authentication
- 💻 Remote command execution
- 📁 File operations (upload/download)
- 📊 Progress tracking for file transfers
- 🔐 Permission management
- 📂 Directory operations
- 🚀 Bulk file transfers
- 📝 Detailed logging

## Installation

1. Install the package:
```bash
npm install mcp-ssh
```

2. Add to your Claude desktop config (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "ssh": {
      "command": "node",
      "args": ["%APPDATA%/npm/node_modules/mcp-ssh/dist/server.js"],
      "env": {
        "SSH_PORT": "8889",
        "SSH_LOG_LEVEL": "info"
      }
    }
  }
}

```

## Usage

### Password Authentication
```powershell
$body = @{
    id = "test"
    host = "example.com"
    port = 22
    username = "user"
    password = "pass123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8889/connect" -Method Post -Body $body -ContentType "application/json"
```

### Key Authentication
```powershell
$body = @{
    id = "test"
    host = "example.com"
    port = 22
    username = "user"
    privateKey = Get-Content ~/.ssh/id_rsa | Out-String
    passphrase = "optional-key-passphrase"  # if your key is protected
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8889/connect" -Method Post -Body $body -ContentType "application/json"
```

### Execute Commands
```powershell
$execBody = @{
    id = "test"
    command = "ls -la"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8889/exec" -Method Post -Body $execBody -ContentType "application/json"
```

### File Operations
```powershell
# Upload file
$uploadForm = @{
    file = Get-Item -Path "localfile.txt"
    remotePath = "/remote/path/file.txt"
}
Invoke-RestMethod -Uri "http://localhost:8889/upload/test" -Method Post -Form $uploadForm

# Download file
Invoke-RestMethod -Uri "http://localhost:8889/download/test?remotePath=/remote/path/file.txt" -Method Get -OutFile "downloaded.txt"
```

### Directory Operations
```powershell
# List directory
Invoke-RestMethod -Uri "http://localhost:8889/ls/test?path=/remote/path" -Method Get

# Get connection status
Invoke-RestMethod -Uri "http://localhost:8889/status/test" -Method Get
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/shaike1/mcp-server-ssh.git
cd mcp-server-ssh
```

2. Install dependencies:
```bash
npm install
```

3. Build:
```bash
npm run build
```

4. Start server:
```bash
npm start
```

## Environment Variables

- `SSH_PORT`: Server port (default: 8889)
- `SSH_LOG_LEVEL`: Logging level (default: info)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
