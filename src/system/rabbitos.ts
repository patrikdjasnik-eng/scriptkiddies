import { createInitialHardwareState, type VirtualHardware, type FirmwareSettings, DEFAULT_HARDWARE } from './hardware';

export const RABBITOS_STATE_KEY = 'bh-rabbitos-state';
export const RABBITOS_SCHEMA_VERSION = 1;

export type VirtualAccount = { id: string; username: string; role: 'administrator' | 'operator' | 'analyst'; groups: string[]; enabled: boolean; createdAt: string };
export type VirtualFile = { path: string; kind: 'file' | 'directory'; sizeKb: number; owner: string; group: string; permissions: string; content?: string; deleted?: boolean };
export type VirtualService = { id: string; name: string; description: string; status: 'running' | 'stopped'; enabledAtBoot: boolean; memoryMb: number };
export type SystemLog = { id: string; at: string; level: 'INFO' | 'WARN' | 'ERROR'; source: string; message: string };
export type RabbitOSState = {
  schemaVersion: typeof RABBITOS_SCHEMA_VERSION;
  hardware: VirtualHardware;
  accounts: VirtualAccount[];
  files: VirtualFile[];
  services: VirtualService[];
  logs: SystemLog[];
  bootCount: number;
  lastBootAt: string | null;
  updatedAt: string;
};

const initialFiles: VirtualFile[] = [
  { path: '/', kind: 'directory', sizeKb: 0, owner: 'root', group: 'root', permissions: 'rwxr-xr-x' },
  { path: '/home', kind: 'directory', sizeKb: 0, owner: 'root', group: 'root', permissions: 'rwxr-xr-x' },
  { path: '/home/operator', kind: 'directory', sizeKb: 0, owner: 'operator', group: 'users', permissions: 'rwx------' },
  { path: '/home/operator/notes.txt', kind: 'file', sizeKb: 2, owner: 'operator', group: 'users', permissions: 'rw-------', content: 'RabbitOS operator notes\n' },
  { path: '/etc', kind: 'directory', sizeKb: 0, owner: 'root', group: 'root', permissions: 'rwxr-xr-x' },
  { path: '/etc/rabbithollow.conf', kind: 'file', sizeKb: 4, owner: 'root', group: 'root', permissions: 'rw-r--r--', content: 'os=RabbitOS 1.0\nprofile=analyst\n' },
  { path: '/var', kind: 'directory', sizeKb: 0, owner: 'root', group: 'root', permissions: 'rwxr-xr-x' },
  { path: '/var/log', kind: 'directory', sizeKb: 0, owner: 'root', group: 'root', permissions: 'rwxr-x---' },
  { path: '/var/log/boot.log', kind: 'file', sizeKb: 8, owner: 'root', group: 'adm', permissions: 'rw-r-----', content: '[OK] RabbitOS initialized\n[OK] Virtual filesystem mounted\n' },
  { path: '/tmp', kind: 'directory', sizeKb: 0, owner: 'root', group: 'root', permissions: 'rwxrwxrwx' },
];

const defaultServices: VirtualService[] = [
  { id: 'systemd', name: 'RabbitOS Service Manager', description: 'Řídí start a závislosti systémových služeb.', status: 'running', enabledAtBoot: true, memoryMb: 42 },
  { id: 'network', name: 'Network Manager', description: 'Simulovaná konfigurace síťových rozhraní.', status: 'running', enabledAtBoot: true, memoryMb: 68 },
  { id: 'sshd', name: 'Secure Shell Service', description: 'Lokální tréninková služba vzdálené správy (bez síťového listeneru).', status: 'stopped', enabledAtBoot: false, memoryMb: 24 },
  { id: 'auditd', name: 'Audit Logger', description: 'Zaznamenává systémové změny do virtuálního logu.', status: 'running', enabledAtBoot: true, memoryMb: 31 },
  { id: 'vmhost', name: 'Virtual Machine Host', description: 'Podpora izolovaných virtuálních laboratoří.', status: 'stopped', enabledAtBoot: false, memoryMb: 180 },
  { id: 'update', name: 'Update Scheduler', description: 'Plánovač herních aktualizací a údržby.', status: 'running', enabledAtBoot: true, memoryMb: 16 },
];

export function createInitialRabbitOSState(username = 'operator', hardware: VirtualHardware = DEFAULT_HARDWARE): RabbitOSState {
  const now = new Date().toISOString();
  return {
    schemaVersion: RABBITOS_SCHEMA_VERSION,
    hardware: structuredClone(hardware),
    accounts: [{ id: 'user-1', username, role: 'administrator', groups: ['users', 'wheel', 'adm'], enabled: true, createdAt: now }],
    files: structuredClone(initialFiles),
    services: structuredClone(defaultServices),
    logs: [{ id: 'log-1', at: now, level: 'INFO', source: 'boot', message: 'RabbitOS state initialized.' }],
    bootCount: 0,
    lastBootAt: null,
    updatedAt: now,
  };
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export function parseRabbitOSState(raw: string | null, username = 'operator', hardware: VirtualHardware = DEFAULT_HARDWARE): RabbitOSState {
  if (!raw) return createInitialRabbitOSState(username, hardware);
  try {
    const data: unknown = JSON.parse(raw);
    if (!isObject(data) || data.schemaVersion !== RABBITOS_SCHEMA_VERSION ||
      !Array.isArray(data.accounts) || !Array.isArray(data.files) || !Array.isArray(data.services) || !Array.isArray(data.logs) ||
      !isObject(data.hardware) || typeof data.bootCount !== 'number') return createInitialRabbitOSState(username, hardware);
    return {
      schemaVersion: RABBITOS_SCHEMA_VERSION,
      hardware: data.hardware as unknown as VirtualHardware,
      accounts: data.accounts as VirtualAccount[],
      files: data.files as VirtualFile[],
      services: data.services as VirtualService[],
      logs: data.logs as SystemLog[],
      bootCount: Math.max(0, Math.floor(data.bootCount)),
      lastBootAt: typeof data.lastBootAt === 'string' ? data.lastBootAt : null,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createInitialRabbitOSState(username, hardware);
  }
}

export function appendSystemLog(state: RabbitOSState, level: SystemLog['level'], source: string, message: string): RabbitOSState {
  const entry: SystemLog = { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), level, source, message };
  return { ...state, logs: [...state.logs, entry].slice(-300), updatedAt: new Date().toISOString() };
}

export function bootRabbitOS(state: RabbitOSState): RabbitOSState {
  const diagnostics = [
    state.hardware.cpu.socket === state.hardware.motherboard.socket,
    state.hardware.memory.type === state.hardware.motherboard.memoryType,
    state.hardware.memory.installedGb <= state.hardware.motherboard.maxMemoryGb,
    state.hardware.gpu.requiredPsuW <= state.hardware.power.psuW,
    state.hardware.storage.systemDiskPresent,
    state.hardware.storage.usedGb <= state.hardware.storage.capacityGb,
  ];
  if (diagnostics.some(ok => !ok)) return appendSystemLog(state, 'ERROR', 'boot', 'POST failed: hardware compatibility check did not pass.');
  const next = { ...state, bootCount: state.bootCount + 1, lastBootAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  return appendSystemLog(next, 'INFO', 'boot', `RabbitOS boot completed (session ${next.bootCount}).`);
}

export function setServiceStatus(state: RabbitOSState, id: string, status: VirtualService['status']): RabbitOSState {
  const service = state.services.find(item => item.id === id);
  if (!service) return state;
  if (id === 'vmhost' && status === 'running' && !state.hardware.firmware.virtualization) return appendSystemLog(state, 'WARN', 'services', 'VM Host start rejected: CPU virtualization is disabled in firmware.');
  const services = state.services.map(item => item.id === id ? { ...item, status } : item);
  return appendSystemLog({ ...state, services, updatedAt: new Date().toISOString() }, 'INFO', 'services', `${service.name}: ${status}.`);
}

export function updateFirmware(state: RabbitOSState, firmware: FirmwareSettings): RabbitOSState {
  return appendSystemLog({ ...state, hardware: { ...state.hardware, firmware }, updatedAt: new Date().toISOString() }, 'WARN', 'firmware', 'Firmware configuration changed; restart required to apply.');
}

export function addVirtualAccount(state: RabbitOSState, username: string, role: VirtualAccount['role']): RabbitOSState {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/.test(username) || state.accounts.some(user => user.username.toLowerCase() === username.toLowerCase())) {
    return appendSystemLog(state, 'WARN', 'accounts', `Account creation rejected for "${username}".`);
  }
  const account: VirtualAccount = { id: `user-${Date.now()}`, username, role, groups: role === 'administrator' ? ['users', 'wheel', 'adm'] : role === 'analyst' ? ['users', 'analysts'] : ['users'], enabled: true, createdAt: new Date().toISOString() };
  return appendSystemLog({ ...state, accounts: [...state.accounts, account], updatedAt: new Date().toISOString() }, 'INFO', 'accounts', `Account "${username}" created as ${role}.`);
}

export function toggleVirtualAccount(state: RabbitOSState, id: string): RabbitOSState {
  const target = state.accounts.find(user => user.id === id);
  if (!target) return state;
  if (target.role === 'administrator' && target.enabled && state.accounts.filter(user => user.role === 'administrator' && user.enabled).length <= 1) {
    return appendSystemLog(state, 'WARN', 'accounts', 'Cannot disable the last enabled administrator.');
  }
  return appendSystemLog({ ...state, accounts: state.accounts.map(user => user.id === id ? { ...user, enabled: !user.enabled } : user) }, 'INFO', 'accounts', `Account "${target.username}" ${target.enabled ? 'disabled' : 'enabled'}.`);
}

export function addVirtualFile(state: RabbitOSState, path: string, content: string, owner: string): RabbitOSState {
  const normalized = '/' + path.split('/').filter(Boolean).join('/');
  if (normalized === '/' || state.files.some(file => file.path === normalized && !file.deleted)) return appendSystemLog(state, 'WARN', 'filesystem', `Create rejected: "${normalized}" already exists.`);
  const parent = normalized.slice(0, normalized.lastIndexOf('/')) || '/';
  if (!state.files.some(file => file.path === parent && file.kind === 'directory' && !file.deleted)) return appendSystemLog(state, 'WARN', 'filesystem', `Create rejected: parent "${parent}" does not exist.`);
  const sizeKb = Math.max(1, Math.ceil(new TextEncoder().encode(content).length / 1024));
  if (state.hardware.storage.usedGb + sizeKb / 1024 / 1024 > state.hardware.storage.capacityGb) return appendSystemLog(state, 'ERROR', 'filesystem', 'Disk is full; file creation failed.');
  const file: VirtualFile = { path: normalized, kind: 'file', sizeKb, owner, group: 'users', permissions: 'rw-r-----', content };
  const next = { ...state, files: [...state.files, file], hardware: { ...state.hardware, storage: { ...state.hardware.storage, usedGb: state.hardware.storage.usedGb + sizeKb / 1024 / 1024 } } };
  return appendSystemLog(next, 'INFO', 'filesystem', `Created ${normalized} (${sizeKb} KB).`);
}

export function deleteVirtualFile(state: RabbitOSState, path: string): RabbitOSState {
  const file = state.files.find(item => item.path === path && !item.deleted);
  if (!file || file.path === '/' || file.kind === 'directory') return appendSystemLog(state, 'WARN', 'filesystem', `Delete rejected for "${path}".`);
  const files = state.files.map(item => item.path === path ? { ...item, deleted: true } : item);
  return appendSystemLog({ ...state, files }, 'INFO', 'filesystem', `Moved ${path} to recovery area.`);
}

export function restoreVirtualFile(state: RabbitOSState, path: string): RabbitOSState {
  const file = state.files.find(item => item.path === path && item.deleted);
  if (!file) return state;
  return appendSystemLog({ ...state, files: state.files.map(item => item.path === path ? { ...item, deleted: false } : item) }, 'INFO', 'filesystem', `Restored ${path}.`);
}
