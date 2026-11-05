/**
 * RabbitOS virtual hardware model.
 *
 * This module contains deterministic game-state logic only. It never reads
 * host hardware, executes commands, or performs network operations.
 */

export const HARDWARE_STATE_KEY = 'bh-hardware-state';
export const HARDWARE_SCHEMA_VERSION = 1;

export type FirmwareSettings = {
  bootOrder: 'usb-first' | 'ssd-first';
  secureBoot: boolean;
  virtualization: boolean;
  xmp: boolean;
  tpm: boolean;
};

export type VirtualHardware = {
  cpu: { model: string; cores: number; threads: number; socket: string; baseClockGhz: number };
  motherboard: { model: string; socket: string; memoryType: 'DDR4' | 'DDR5'; maxMemoryGb: number; pcieGeneration: number };
  memory: { installedGb: number; type: 'DDR4' | 'DDR5'; speedMhz: number };
  gpu: { model: string; vramGb: number; requiredPsuW: number };
  storage: { capacityGb: number; usedGb: number; systemDiskPresent: boolean };
  power: { psuW: number; batteryPercent: number; pluggedIn: boolean };
  firmware: FirmwareSettings;
};

export type HardwareState = {
  schemaVersion: typeof HARDWARE_SCHEMA_VERSION;
  hardware: VirtualHardware;
  updatedAt: string;
};

export type HardwareDiagnostic = {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
};

export const DEFAULT_HARDWARE: VirtualHardware = {
  cpu: { model: 'RabbitCore R7 5700X', cores: 8, threads: 16, socket: 'AM4', baseClockGhz: 3.4 },
  motherboard: { model: 'RabbitBoard B550', socket: 'AM4', memoryType: 'DDR4', maxMemoryGb: 128, pcieGeneration: 4 },
  memory: { installedGb: 16, type: 'DDR4', speedMhz: 3200 },
  gpu: { model: 'RabbitGraphics RTX 5070', vramGb: 12, requiredPsuW: 650 },
  storage: { capacityGb: 256, usedGb: 18, systemDiskPresent: true },
  power: { psuW: 750, batteryPercent: 96, pluggedIn: true },
  firmware: { bootOrder: 'usb-first', secureBoot: true, virtualization: false, xmp: false, tpm: true },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const boundedNumber = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

export function createInitialHardwareState(now = new Date().toISOString()): HardwareState {
  return { schemaVersion: HARDWARE_SCHEMA_VERSION, hardware: structuredClone(DEFAULT_HARDWARE), updatedAt: now };
}

/** Strictly validates persisted game data; malformed values fall back to defaults. */
export function parseHardwareState(raw: string | null): HardwareState {
  if (!raw) return createInitialHardwareState();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== HARDWARE_SCHEMA_VERSION || !isRecord(parsed.hardware)) {
      return createInitialHardwareState();
    }
    const h = parsed.hardware;
    const cpu = h.cpu, board = h.motherboard, memory = h.memory, gpu = h.gpu, storage = h.storage, power = h.power, firmware = h.firmware;
    if (![cpu, board, memory, gpu, storage, power, firmware].every(isRecord)) return createInitialHardwareState();
    if (typeof cpu.model !== 'string' || !boundedNumber(cpu.cores, 1, 128) || !boundedNumber(cpu.threads, 1, 256) || typeof cpu.socket !== 'string' || !boundedNumber(cpu.baseClockGhz, 0.1, 20)) return createInitialHardwareState();
    if (typeof board.model !== 'string' || typeof board.socket !== 'string' || !['DDR4', 'DDR5'].includes(String(board.memoryType)) || !boundedNumber(board.maxMemoryGb, 4, 4096) || !boundedNumber(board.pcieGeneration, 1, 8)) return createInitialHardwareState();
    if (!boundedNumber(memory.installedGb, 1, 4096) || !['DDR4', 'DDR5'].includes(String(memory.type)) || !boundedNumber(memory.speedMhz, 400, 20000)) return createInitialHardwareState();
    if (typeof gpu.model !== 'string' || !boundedNumber(gpu.vramGb, 0, 512) || !boundedNumber(gpu.requiredPsuW, 0, 5000)) return createInitialHardwareState();
    if (!boundedNumber(storage.capacityGb, 32, 100000) || !boundedNumber(storage.usedGb, 0, storage.capacityGb) || typeof storage.systemDiskPresent !== 'boolean') return createInitialHardwareState();
    if (!boundedNumber(power.psuW, 50, 10000) || !boundedNumber(power.batteryPercent, 0, 100) || typeof power.pluggedIn !== 'boolean') return createInitialHardwareState();
    if (!['usb-first', 'ssd-first'].includes(String(firmware.bootOrder)) || typeof firmware.secureBoot !== 'boolean' || typeof firmware.virtualization !== 'boolean' || typeof firmware.xmp !== 'boolean' || typeof firmware.tpm !== 'boolean') return createInitialHardwareState();
    return {
      schemaVersion: HARDWARE_SCHEMA_VERSION,
      hardware: {
        cpu: cpu as unknown as VirtualHardware['cpu'],
        motherboard: board as unknown as VirtualHardware['motherboard'],
        memory: memory as unknown as VirtualHardware['memory'],
        gpu: gpu as unknown as VirtualHardware['gpu'],
        storage: storage as unknown as VirtualHardware['storage'],
        power: power as unknown as VirtualHardware['power'],
        firmware: firmware as unknown as FirmwareSettings,
      },
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createInitialHardwareState();
  }
}

export function serializeHardwareState(hardware: VirtualHardware, now = new Date().toISOString()): string {
  return JSON.stringify({ schemaVersion: HARDWARE_SCHEMA_VERSION, hardware, updatedAt: now } satisfies HardwareState);
}

/** Reports compatibility and boot constraints without mutating the supplied state. */
export function diagnoseHardware(h: VirtualHardware): HardwareDiagnostic[] {
  const diagnostics: HardwareDiagnostic[] = [];
  if (h.cpu.socket !== h.motherboard.socket) diagnostics.push({ code: 'CPU_SOCKET_MISMATCH', severity: 'error', message: 'Procesor není kompatibilní se socketem základní desky.' });
  if (h.memory.type !== h.motherboard.memoryType) diagnostics.push({ code: 'RAM_TYPE_MISMATCH', severity: 'error', message: 'Typ paměti RAM neodpovídá základní desce.' });
  if (h.memory.installedGb > h.motherboard.maxMemoryGb) diagnostics.push({ code: 'RAM_CAPACITY_EXCEEDED', severity: 'error', message: 'Osazená RAM překračuje maximální kapacitu základní desky.' });
  if (h.gpu.requiredPsuW > h.power.psuW) diagnostics.push({ code: 'PSU_UNDERSIZED', severity: 'error', message: 'Napájecí zdroj nemá doporučený výkon pro instalovanou grafickou kartu.' });
  if (h.storage.usedGb > h.storage.capacityGb) diagnostics.push({ code: 'STORAGE_OVER_CAPACITY', severity: 'error', message: 'Obsazené místo překračuje kapacitu systémového disku.' });
  if (!h.storage.systemDiskPresent) diagnostics.push({ code: 'NO_SYSTEM_DISK', severity: 'error', message: 'Systémový disk není přítomen; RabbitOS nelze spustit.' });
  if (!h.firmware.virtualization) diagnostics.push({ code: 'VIRTUALIZATION_DISABLED', severity: 'warning', message: 'Virtualizace je vypnutá; VM laboratoře budou nedostupné.' });
  if (!h.firmware.secureBoot) diagnostics.push({ code: 'SECURE_BOOT_DISABLED', severity: 'warning', message: 'Secure Boot je vypnutý; ochrana integrity boot řetězce je snížená.' });
  if (!h.firmware.tpm) diagnostics.push({ code: 'TPM_DISABLED', severity: 'warning', message: 'TPM je vypnutý; některé bezpečnostní funkce OS nebudou dostupné.' });
  if (h.storage.capacityGb - h.storage.usedGb < 10) diagnostics.push({ code: 'LOW_STORAGE', severity: 'warning', message: 'Na systémovém disku zbývá méně než 10 GB.' });
  if (diagnostics.length === 0) diagnostics.push({ code: 'HARDWARE_HEALTHY', severity: 'info', message: 'Kontrola hardwarové kompatibility neodhalila problém.' });
  return diagnostics;
}

export function canBootRabbitOS(h: VirtualHardware): boolean {
  return diagnoseHardware(h).every(item => item.severity !== 'error');
}

export function canRunVirtualMachines(h: VirtualHardware): boolean {
  return canBootRabbitOS(h) && h.firmware.virtualization;
}
