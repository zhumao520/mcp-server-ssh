import { NodeSSH } from 'node-ssh';
import { 
  SSHConfig, 
  CommandResult, 
  SSHConnection, 
  FileTransferResult,
  BulkTransferResult,
  DirectoryContents,
  FilePermissions,
  FileInfo
} from './types';
import { logger } from './logger';
import path from 'path';

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

  async createDirectory(id: string, remotePath: string): Promise<CommandResult> {
    return this.executeCommand(id, `mkdir -p ${remotePath}`);
  }

  async deleteDirectory(id: string, remotePath: string, recursive = false): Promise<CommandResult> {
    const command = recursive ? `rm -rf ${remotePath}` : `rmdir ${remotePath}`;
    return this.executeCommand(id, command);
  }

  async setPermissions(id: string, remotePath: string, mode: string): Promise<CommandResult> {
    return this.executeCommand(id, `chmod ${mode} ${remotePath}`);
  }

  async getPermissions(id: string, remotePath: string): Promise<FilePermissions | null> {
    try {
      const result = await this.executeCommand(id, `stat -c '%a %U %G' ${remotePath}`);
      if (result.code === 0) {
        const [mode, owner, group] = result.stdout.trim().split(' ');
        const modeNum = parseInt(mode, 8);
        
        return {
          read: !!(modeNum & 0b100),
          write: !!(modeNum & 0b010),
          execute: !!(modeNum & 0b001),
          owner,
          group,
          mode
        };
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get permissions: ${error}`);
      return null;
    }
  }

  async bulkUpload(id: string, files: { local: string; remote: string }[]): Promise<BulkTransferResult> {
    const ssh = this.connections.get(id);
    if (!ssh) {
      return {
        success: false,
        successful: [],
        failed: files.map(f => ({ path: f.remote, error: 'Not connected' })),
        totalBytes: 0,
        totalFiles: 0
      };
    }

    const result: BulkTransferResult = {
      success: true,
      successful: [],
      failed: [],
      totalBytes: 0,
      totalFiles: 0
    };

    for (const file of files) {
      try {
        await ssh.putFile(file.local, file.remote);
        result.successful.push(file.remote);
        const stats = await ssh.execCommand(`stat -f %z ${file.remote}`);
        result.totalBytes += parseInt(stats.stdout) || 0;
        result.totalFiles++;
      } catch (error: any) {
        result.failed.push({ path: file.remote, error: error.message });
      }
    }

    return result;
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

  async listDirectory(id: string, remotePath: string): Promise<DirectoryContents | null> {
    const ssh = this.connections.get(id);
    if (!ssh) return null;

    try {
      const result = await ssh.execCommand(
        `find ${remotePath} -maxdepth 1 -printf "%f\\t%s\\t%T@\\t%M\\t%u\\t%g\\n"`
      );

      if (result.code !== 0) {
        throw new Error(result.stderr);
      }

      const files: FileInfo[] = result.stdout.split('\n')
        .filter(line => line.trim() && line !== '.')
        .map(line => {
          const [name, size, mtime, mode, owner, group] = line.split('\t');
          return {
            name,
            size: parseInt(size),
            modifyTime: new Date(parseFloat(mtime) * 1000),
            isDirectory: mode.startsWith('d'),
            permissions: {
              read: mode.includes('r'),
              write: mode.includes('w'),
              execute: mode.includes('x'),
              owner,
              group,
              mode
            }
          };
        });

      return {
        path: remotePath,
        files
      };
    } catch (error) {
      logger.error(`List directory failed: ${error}`);
      return null;
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