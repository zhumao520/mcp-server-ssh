# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果存在)
COPY package*.json ./

# 安装项目依赖
# 使用 --ignore-scripts 来阻止执行项目自身的 prepare 脚本，因为它会在源代码复制前尝试构建
# 如果您使用 package-lock.json 并希望进行更严格的安装，可以使用 npm ci
RUN npm install --ignore-scripts
# 或者，如果您更倾向于使用 npm ci (推荐做法，因为它会遵循 package-lock.json):
# RUN npm ci --ignore-scripts

# 复制项目的所有剩余源代码到工作目录
COPY . .

# 现在所有文件都已就位，执行构建命令
RUN npm run build

# 设置运行时环境变量
ENV SSH_PORT=8889
ENV SSH_LOG_LEVEL=info

# 暴露应用程序将监听的端口
EXPOSE 8889

# 定义容器启动时运行的命令
CMD ["npm", "start"]
