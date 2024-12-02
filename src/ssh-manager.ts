import { NodeSSH } from 'node-ssh';
import { 
  SSHConfig, 
  CommandResult, 
  SSHConnection,
  FileTransferResult, 
  BulkTransferResult 
} from './types';
import { logger } from './logger';
import fs from 'fs';

export class SSHManager {
  private connections: Map<string, NodeSSH> = new Map();
  private configs: Map<string, SSHConnection> = new Map();

  async connect(id: string, config: SSHConfig): Promise<boolean> {
    try {
      const ssh = new NodeSSH();
      await ssh.connect({
        host: config.host,
        username: config.username,
        password: config.password,
        privateKey: config.privateKey,
        passphrase: config.passphrase,
        port: config.port || 22,
        keepaliveInterval: config.keepaliveInterval || 60000,
        readyTimeout: config.readyTimeout || 30000,
      });

      this.connections.set(id, ssh);
      this.configs.set(id, {
        id,
        config,
        status: 'connected'
      });

      logger.info(`SSH connection established: ${id}`);
      return true;
    } catch (err) {
      const error = err as Error;
      logger.error(`Failed to establish SSH connection ${id}: ${error.message}`);
      this.configs.set(id, {
        id,
        config,
        status: 'error',
        lastError: error.message
      });
      return false;
    }
  }

  async executeCommand(id: string, command: string): Promise<CommandResult> {
    const ssh = this.connections.get(id);
    if (!ssh) {
      return {
        code: -1,
        stdout: '',
        stderr: `No connection found for ${id}`
      };
    }

    try {
      const result = await ssh.execCommand(command);
      return {
        code: result.code ?? -1,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (err) {
      const error = err as Error;
      logger.error(`Command execution failed on ${id}: ${error.message}`);
      return {
        code: -1,
        stdout: '',
        stderr: error.message
      };
    }
  }

  async uploadFile(id: string, localPath: string, remotePath: string): Promise<FileTransferResult> {
    const ssh = this.connections.get(id);
    if (!ssh) {
      return {
        success: false,
        path: remotePath,
        error: `No connection found for ${id}`
      };
    }

    try {
      await ssh.putFile(localPath, remotePath);
      return {
        success: true,
        path: remotePath
      };
    } catch (err) {
      const error = err as Error;
      logger.error(`File upload failed on ${id}: ${error.message}`);
      return {
        success: false,
        path: remotePath,
        error: error.message
      };
    }
  }

  async downloadFile(id: string, remotePath: string, localPath: string): Promise<FileTransferResult> {
    const ssh = this.connections.get(id);
    if (!ssh) {
      return {
        success: false,
        path: localPath,
        error: `No connection found for ${id}`
      };
    }

    try {
      await ssh.getFile(localPath, remotePath);
      return {
        success: true,
        path: localPath
      };
    } catch (err) {
      const error = err as Error;
      logger.error(`File download failed on ${id}: ${error.message}`);
      return {
        success: false,
        path: localPath,
        error: error.message
      };
    }
  }

  async disconnect(id: string): Promise<void> {
    const ssh = this.connections.get(id);
    if (ssh) {
      await ssh.dispose();
      this.connections.delete(id);
      const currentConfig = this.configs.get(id);
      if (currentConfig) {
        this.configs.set(id, {
          ...currentConfig,
          status: 'disconnected'
        });
      }
      logger.info(`SSH connection closed: ${id}`);
    }
  }

  async disconnectAll(): Promise<void> {
    const ids = Array.from(this.connections.keys());
    await Promise.all(ids.map(id => this.disconnect(id)));
  }

  getStatus(id: string): SSHConnection | null {
    return this.configs.get(id) || null;
  }

  getAllConnections(): SSHConnection[] {
    return Array.from(this.configs.values());
  }
}