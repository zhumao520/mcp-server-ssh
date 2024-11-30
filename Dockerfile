FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV SSH_PORT=8889
ENV SSH_LOG_LEVEL=info

EXPOSE 8889

CMD ["npm", "start"]