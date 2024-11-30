import fs from 'fs';

interface ServerConfig {
  server: {
    host: string;
    port: number;
  };
  connections: {
    [key: string]: {
      host: string;
      username: string;
      password?: string;
      port?: number;
      keepaliveInterval?: number;
      readyTimeout?: number;
    };
  };
  logging: {
    level: string;
    file: string;
  };
}

export function loadConfig(): ServerConfig {
  const configPath = process.env.SSH_CONFIG_PATH || 'config.json';
  
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    return {
      server: {
        host: '0.0.0.0',
        port: 8080
      },
      connections: {},
      logging: {
        level: 'info',
        file: 'ssh-server.log'
      }
    };
  }
}