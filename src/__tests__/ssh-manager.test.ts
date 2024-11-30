import { SSHManager } from '../ssh-manager';

describe('SSHManager', () => {
  let manager: SSHManager;

  beforeEach(() => {
    manager = new SSHManager();
  });

  it('should initialize without connections', () => {
    expect(manager.getAllConnections()).toEqual([]);
  });

  it('should return null for non-existent connection', () => {
    expect(manager.getStatus('non-existent')).toBeNull();
  });
});