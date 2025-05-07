MCP SSH 服务器
这是一个为 Model Context Protocol (MCP) 实现的强大 SSH 服务器。这个服务器通过 SSH 协议实现安全远程命令执行和文件操作，支持密码和基于密钥的认证。

功能特性
✨ 安全的 SSH 连接管理
🔑 密码和基于密钥的认证
💻 远程命令执行
📁 文件操作（上传/下载）
📊 文件传输进度跟踪
🔐 权限管理
📂 目录操作
🚀 批量文件传输
📝 详细日志记录
安装
安装软件包：

Bash

npm install mcp-ssh
添加到您的 Claude Desktop 配置 (claude_desktop_config.json)：

JSON

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
(注意：%APPDATA%/npm/node_modules/mcp-ssh/dist/server.js 是 Windows 上的示例路径，其他操作系统路径可能不同。)

使用方法
密码认证
以下示例展示如何使用 PowerShell 通过密码认证连接到远程 SSH 服务器：

PowerShell

$body = @{
    id = "test" # 连接 ID
    host = "example.com" # 远程 SSH 服务器地址
    port = 22 # 远程 SSH 服务器端口
    username = "user" # SSH 用户名
    password = "pass123" # SSH 密码
} | ConvertTo-Json

# 向本地运行的 mcp-ssh 服务器的 /connect 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/connect" -Method Post -Body $body -ContentType "application/json"
密钥认证
以下示例展示如何使用 PowerShell 通过密钥认证连接到远程 SSH 服务器：

PowerShell

$body = @{
    id = "test" # 连接 ID
    host = "example.com" # 远程 SSH 服务器地址
    port = 22 # 远程 SSH 服务器端口
    username = "user" # SSH 用户名
    privateKey = Get-Content ~/.ssh/id_rsa | Out-String # 私钥内容
    passphrase = "optional-key-passphrase"  # 私钥的密码短语（如果私钥受保护）
} | ConvertTo-Json

# 向本地运行的 mcp-ssh 服务器的 /connect 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/connect" -Method Post -Body $body -ContentType "application/json"
执行命令
以下示例展示如何使用 PowerShell 在已建立的连接上执行远程命令：

PowerShell

$execBody = @{
    id = "test" # 连接 ID (与连接时使用的 ID 对应)
    command = "ls -la" # 要执行的命令
} | ConvertTo-Json

# 向本地运行的 mcp-ssh 服务器的 /exec 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/exec" -Method Post -Body $execBody -ContentType "application/json"
文件操作
以下示例展示如何使用 PowerShell 进行文件上传和下载：

PowerShell

# 上传文件
$uploadForm = @{
    file = Get-Item -Path "localfile.txt" # 本地文件路径
    remotePath = "/remote/path/file.txt" # 远程文件路径
}
# 向本地运行的 mcp-ssh 服务器的 /upload/{id} 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/upload/test" -Method Post -Form $uploadForm

# 下载文件
# 向本地运行的 mcp-ssh 服务器的 /download/{id} 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/download/test?remotePath=/remote/path/file.txt" -Method Get -OutFile "downloaded.txt" # 下载到本地的文件名
目录操作
以下示例展示如何使用 PowerShell 进行目录列表和获取连接状态：

PowerShell

# 列出目录
# 向本地运行的 mcp-ssh 服务器的 /ls/{id} 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/ls/test?path=/remote/path" -Method Get

# 获取连接状态
# 向本地运行的 mcp-ssh 服务器的 /status/{id} 接口发送请求
Invoke-RestMethod -Uri "http://localhost:8889/status/test" -Method Get
开发
克隆仓库：

Bash

git clone https://github.com/shaike1/mcp-server-ssh.git
cd mcp-server-ssh
安装依赖：

Bash

npm install
构建：

Bash

npm run build
启动服务器：

Bash

npm start
环境变量
SSH_PORT: 服务器监听的端口（默认：8889）
SSH_LOG_LEVEL: 日志级别（默认：info）
贡献
Fork 仓库
创建您的功能分支 (git checkout -b feature/amazing-feature)
提交您的更改 (git commit -m 'Add some amazing feature')
推送到分支 (git push origin feature/amazing-feature)
打开一个 Pull Request
许可证
MIT


Sources and related content
