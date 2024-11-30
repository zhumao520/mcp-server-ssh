export interface SSHConfig {
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
  port?: number;
  keepaliveInterval?: number;
  readyTimeout?: number;
}

export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface SSHConnection {
  id: string;
  config: SSHConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastError?: string;
}