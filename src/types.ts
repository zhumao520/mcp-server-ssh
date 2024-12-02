export interface SSHConfig {
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;  // Added passphrase for encrypted keys
  port?: number;
  keepaliveInterval?: number;
  readyTimeout?: number;
}

export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface FileTransferResult {
  success: boolean;
  path: string;
  error?: string;
  bytesTransferred?: number;
  totalBytes?: number;
}

export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  owner: string;
  group: string;
  mode: string;
}

export interface DirectoryContents {
  path: string;
  files: FileInfo[];
}

export interface FileInfo {
  name: string;
  size: number;
  modifyTime: Date;
  isDirectory: boolean;
  permissions: FilePermissions;
}

export interface BulkTransferResult {
  success: boolean;
  successful: string[];
  failed: { path: string; error: string }[];
  totalBytes: number;
  totalFiles: number;
}

export interface SSHConnection {
  id: string;
  config: SSHConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastError?: string;
}

export interface ProgressCallback {
  (transferred: number, total: number): void;
}