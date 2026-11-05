import type { VirtualHardware } from './hardware';

export type DiskPartition = { id:string; name:string; fs:'FAT32'|'NTFS'|'EXT4'|'SWAP'; sizeGb:number; usedGb:number; mountPoint:string; bootable:boolean };
export type VirtualDisk = { id:string; label:string; capacityGb:number; gpt:boolean; partitions:DiskPartition[]; mounted:boolean };
export type VirtualProcess = { pid:number; name:string; serviceId:string|null; cpuPercent:number; memoryMb:number; state:'running'|'sleeping'|'stopped' };
export type FileAcl = { path:string; subject:string; subjectType:'user'|'group'; allow:string[] };
export type AdvancedOSState = { version:1; disks:VirtualDisk[]; processes:VirtualProcess[]; acl:FileAcl[]; recoveryMode:boolean; bootTarget:'normal'|'recovery'|'diagnostics'; nextPid:number };

export const ADVANCED_OS_KEY='bh-rabbitos-advanced-v1';
export const createAdvancedOSState=(capacityGb=256):AdvancedOSState=>{
 const safeCapacity=Math.max(32,Math.floor(Number.isFinite(capacityGb)?capacityGb:256));
 const efiGb=1, recoveryGb=Math.max(4,Math.floor(safeCapacity*.12)), swapGb=Math.max(2,Math.floor(safeCapacity*.05));
 const rootGb=safeCapacity-efiGb-recoveryGb-swapGb;
 return {
 version:1, disks:[{id:'disk0',label:'RabbitOS NVMe',capacityGb:safeCapacity,gpt:true,mounted:true,partitions:[
 {id:'p1',name:'EFI System',fs:'FAT32',sizeGb:efiGb,usedGb:.2,mountPoint:'/boot/efi',bootable:true},
 {id:'p2',name:'RabbitOS',fs:'EXT4',sizeGb:rootGb,usedGb:Math.min(18,rootGb),mountPoint:'/',bootable:true},
 {id:'p3',name:'Recovery',fs:'NTFS',sizeGb:recoveryGb,usedGb:1,mountPoint:'/recovery',bootable:false},
 {id:'p4',name:'Swap',fs:'SWAP',sizeGb:swapGb,usedGb:0,mountPoint:'[swap]',bootable:false}
 ]}],processes:[{pid:1,name:'rabbit-init',serviceId:'systemd',cpuPercent:1.2,memoryMb:42,state:'running'},{pid:2,name:'networkd',serviceId:'network',cpuPercent:.4,memoryMb:68,state:'running'},{pid:3,name:'auditd',serviceId:'auditd',cpuPercent:.2,memoryMb:31,state:'running'}],acl:[],recoveryMode:false,bootTarget:'normal',nextPid:4
 };
};
export function parseAdvancedOSState(raw:string|null,capacityGb=256):AdvancedOSState {
 try { const v=raw?JSON.parse(raw):null; if(v?.version===1&&Array.isArray(v.disks)&&Array.isArray(v.processes)&&Array.isArray(v.acl)&&['normal','recovery','diagnostics'].includes(v.bootTarget)) return v as AdvancedOSState; } catch {}
 return createAdvancedOSState(capacityGb);
}
export function partitionDisk(disk:VirtualDisk,parts:DiskPartition[]):VirtualDisk {
 if(!disk.gpt||parts.length<1||parts.length>16) throw new Error('Disk musí používat GPT a obsahovat 1–16 oddílů.');
 const ids=new Set<string>(); let total=0;
 for(const p of parts){if(!p.id||ids.has(p.id)||!Number.isFinite(p.sizeGb)||p.sizeGb<=0||p.usedGb<0||p.usedGb>p.sizeGb||p.sizeGb< p.usedGb) throw new Error('Neplatný nebo duplicitní oddíl.');ids.add(p.id);total+=p.sizeGb;}
 if(total>disk.capacityGb) throw new Error('Součet oddílů překračuje kapacitu disku.');
 return {...disk,partitions:parts};
}
export function setDiskMounted(disk:VirtualDisk,mounted:boolean):VirtualDisk {
 if(!mounted&&disk.partitions.some(p=>p.mountPoint==='/')) throw new Error('Systémový oddíl / nelze odpojit za běhu.');
 return {...disk,mounted};
}
export function canAccessPath(path:string,identity:string,groups:string[],acl:FileAcl[]):boolean {
 const normalized='/'+path.split('/').filter(Boolean).join('/');
 const matching=acl.filter(entry=>normalized===entry.path||normalized.startsWith(entry.path.replace(/\/$/,'')+'/'));
 const applicable=matching.filter(entry=>entry.subjectType==='user'?entry.subject===identity:groups.includes(entry.subject));
 if(!applicable.length)return true;
 return applicable.some(entry=>entry.allow.includes('read')||entry.allow.includes('write')||entry.allow.includes('execute'));
}
export function startVirtualProcess(state:AdvancedOSState,name:string,memoryMb:number,serviceId:string|null=null):AdvancedOSState {
 if(!name.trim()||!Number.isFinite(memoryMb)||memoryMb<=0||memoryMb>4096)throw new Error('Neplatný proces nebo limit paměti.');
 return {...state,processes:[...state.processes,{pid:state.nextPid,name:name.trim().slice(0,48),serviceId,cpuPercent:0,memoryMb,state:'running'}],nextPid:state.nextPid+1};
}
export function stopVirtualProcess(state:AdvancedOSState,pid:number):AdvancedOSState {
 if(pid===1)throw new Error('Proces init nelze ukončit.');
 return {...state,processes:state.processes.map(p=>p.pid===pid?{...p,state:'stopped'}:p)};
}
export function applyStoreHardware(hardware:VirtualHardware,productId:string):VirtualHardware {
 const next=structuredClone(hardware);
 if(productId==='gpu-rtx'){next.gpu={model:'GeForce RTX 5070 · 12 GB',vramGb:12,requiredPsuW:650};}
 else if(productId==='gpu-rx'){next.gpu={model:'Radeon RX 7800 XT · 16 GB',vramGb:16,requiredPsuW:700};}
 else if(productId==='ram-ddr4'&&next.motherboard.memoryType==='DDR4'){next.memory={...next.memory,installedGb:32,type:'DDR4',speedMhz:3200};}
 else if(productId==='ram-ddr5'&&next.motherboard.memoryType==='DDR5'){next.memory={...next.memory,installedGb:64,type:'DDR5',speedMhz:6000};}
 else if(productId==='cpu-am4'&&next.motherboard.socket==='AM4'){next.cpu={model:'Ryzen 7 5700X',cores:8,threads:16,socket:'AM4',baseClockGhz:3.4};}
 else if(productId==='cpu-am5'&&next.motherboard.socket==='AM5'){next.cpu={model:'Ryzen 7 9700X',cores:8,threads:16,socket:'AM5',baseClockGhz:3.8};}
 else if(productId==='board-ddr4'){next.motherboard={model:'Mainboard B550',socket:'AM4',memoryType:'DDR4',maxMemoryGb:128,pcieGeneration:4};next.cpu={model:'Ryzen 7 5700X',cores:8,threads:16,socket:'AM4',baseClockGhz:3.4};next.memory={installedGb:16,type:'DDR4',speedMhz:3200};}
 else if(productId==='board-ddr5'){next.motherboard={model:'Mainboard B650',socket:'AM5',memoryType:'DDR5',maxMemoryGb:192,pcieGeneration:5};next.cpu={model:'Ryzen 7 9700X',cores:8,threads:16,socket:'AM5',baseClockGhz:3.8};next.memory={installedGb:32,type:'DDR5',speedMhz:5600};}
 else if(productId==='nvme-2tb'){next.storage={...next.storage,capacityGb:2048,systemDiskPresent:true};}
 else throw new Error('Tento produkt není kompatibilní s instalací RabbitOS.');
 return next;
}
