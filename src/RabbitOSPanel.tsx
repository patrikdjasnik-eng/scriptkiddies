import { useMemo, useState } from 'react';
import { Activity, Cpu, Database, HardDrive, Power, RefreshCw, Server, ShieldCheck, Users, Wrench, FilePlus2, Trash2, RotateCcw, Play, Square, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { diagnoseHardware, canBootRabbitOS, parseHardwareState, serializeHardwareState } from './system/hardware';
import {
  addVirtualAccount, addVirtualFile, bootRabbitOS, canAccessVirtualFile, deleteVirtualFile, parseRabbitOSState,
  restoreVirtualFile, setServiceStatus, toggleVirtualAccount, updateFirmware, updateVirtualFilePermissions,
  type RabbitOSState, type VirtualAccount
} from './system/rabbitos';

type Tab = 'overview' | 'bios' | 'hardware' | 'storage' | 'accounts' | 'services' | 'logs';
type Props = { username?: string };
const KEY = 'bh-rabbitos-state';

export default function RabbitOSPanel({ username = 'operator' }: Props) {
  const [state,setState] = useState<RabbitOSState>(() => {
    try { return parseRabbitOSState(localStorage.getItem(KEY), username); }
    catch { return parseRabbitOSState(null, username); }
  });
  const [tab,setTab] = useState<Tab>('overview');
  const [booting,setBooting] = useState(false);
  const [accountName,setAccountName] = useState('');
  const [accountRole,setAccountRole] = useState<VirtualAccount['role']>('operator');
  const [filePath,setFilePath] = useState('/home/operator/new-note.txt');
  const [fileContent,setFileContent] = useState('Nový soubor v RabbitOS.\n');
  const [message,setMessage] = useState('');
  const [selectedFile,setSelectedFile] = useState<string | null>(null);
  const [firmwareDraft,setFirmwareDraft] = useState(state.hardware.firmware);
  const [hardwareDraft,setHardwareDraft] = useState(state.hardware);
  const [sessionUser,setSessionUser] = useState<string | null>(() => state.isBooted ? username : null);
  const [loginName,setLoginName] = useState(username);

  const diagnostics = useMemo(() => diagnoseHardware(state.hardware),[state.hardware]);
  const usedFiles = state.files.filter(file=>file.kind==='file'&&!file.deleted);
  const recoveredFiles = state.files.filter(file=>file.kind==='file'&&file.deleted);
  const diskUsedMb = usedFiles.reduce((sum,file)=>sum+file.sizeKb,0)/1024;
  const runningServices = state.services.filter(service=>service.status==='running').length;

  const commit = (next: RabbitOSState) => {
    setState(next);
    setFirmwareDraft(next.hardware.firmware);
    setHardwareDraft(next.hardware);
    try { localStorage.setItem(KEY,JSON.stringify(next)); }
    catch { setMessage('Nepodařilo se uložit stav RabbitOS. Zkontroluj dostupné úložiště prohlížeče.'); }
  };
  const restart = () => {
    setBooting(true); setMessage('Probíhá POST a start RabbitOS…');
    window.setTimeout(()=>{
      const next = bootRabbitOS(state);
      commit(next);
      setBooting(false);
      const bootOk = next.isBooted;
      setSessionUser(bootOk ? null : null);
      setMessage(bootOk ? 'POST dokončen. Přihlas se do RabbitOS.' : 'POST selhal. RabbitOS zůstává vypnutý; zkontroluj diagnostiku.');
      setTab(bootOk ? 'accounts' : 'overview');
    },900);
  };
  const saveFirmware = () => {
    const next = updateFirmware(state,firmwareDraft);
    commit(next);
    setMessage('Firmware uložen. Změny se projeví po restartu.');
  };
  const saveHardware = () => {
    const next = { ...state, hardware: hardwareDraft, updatedAt:new Date().toISOString() };
    commit(next);
    setMessage('Konfigurace hardwaru uložena. Probíhá kontrola kompatibility.');
  };
  const tabs: {id:Tab;label:string;icon:typeof Activity}[] = [
    {id:'overview',label:'Přehled',icon:Activity},{id:'bios',label:'BIOS / UEFI',icon:Power},
    {id:'hardware',label:'Hardware',icon:Cpu},{id:'storage',label:'Filesystem',icon:Database},
    {id:'accounts',label:'Accounts',icon:Users},{id:'services',label:'Services',icon:Server},{id:'logs',label:'System Logs',icon:FilePlus2}
  ];

  return <div className="desktop-window rabbitos-window">
    <div className="desktop-window-title"><span><Wrench size={14}/> RabbitOS Control Center <b className="rabbitos-version">SYSTEM ADMINISTRATION</b></span><span>RABBITOS 1.0</span></div>
    <div className="rabbitos-shell">
      <aside className="rabbitos-sidebar">{tabs.map(({id,label,icon:Icon})=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={14}/>{label}</button>)}</aside>
      <div className="rabbitos-content">
        {message&&<div className="rabbitos-message"><span>{message}</span><button onClick={()=>setMessage('')}>×</button></div>}
        {!state.isBooted && <div className="rabbitos-offline-banner"><Power size={14}/> RabbitOS je vypnutý. Pro práci v systému spusť POST a boot sekvenci.</div>}
        {state.isBooted && !sessionUser && <section className="rabbitos-login">
          <div><small>RABBITOS LOGIN MANAGER</small><h3>Přihlášení do systému</h3><p>Vyber aktivní virtuální účet. Neplatné přihlášení nezmění systémový stav.</p></div>
          <label>Uživatelské jméno<input value={loginName} onChange={event=>setLoginName(event.target.value)} autoComplete="off"/></label>
          <button className="rabbitos-primary" onClick={()=>{
            const account=state.accounts.find(item=>item.username.toLowerCase()===loginName.trim().toLowerCase()&&item.enabled);
            if(!account){setMessage('Přihlášení odmítnuto: účet neexistuje nebo je deaktivovaný.');return;}
            setSessionUser(account.username);
            setMessage(`Přihlášen jako ${account.username} (${account.role}).`);
          }}>LOGIN</button>
        </section>}
        {state.isBooted && sessionUser && <div className="rabbitos-session-bar">
          <span><i/> SESSION: <b>{sessionUser}</b></span>
          <button onClick={()=>{setSessionUser(null);setMessage('Uživatel byl odhlášen.');}}>LOG OUT</button>
          <button onClick={restart} disabled={booting}><Power size={12}/> RESTART</button>
        </div>}
        {tab==='overview'&&<section><div className="rabbitos-heading"><div><small>RABBITOS SYSTEM OVERVIEW</small><h3>Stav systému</h3><p>Lokální administrace virtuálního notebooku a jeho herního operačního systému.</p></div><button className="rabbitos-primary" onClick={restart} disabled={booting}><RefreshCw size={14}/> {booting?'BOOTING…':'RESTART SYSTEM'}</button></div>
          <div className="rabbitos-metrics"><article><Cpu/><small>CPU</small><b>{state.hardware.cpu.model}</b><span>{state.hardware.cpu.cores} cores / {state.hardware.cpu.threads} threads</span></article><article><Database/><small>MEMORY</small><b>{state.hardware.memory.installedGb} GB {state.hardware.memory.type}</b><span>{state.hardware.memory.speedMhz} MHz</span></article><article><HardDrive/><small>SYSTEM DISK</small><b>{state.hardware.storage.capacityGb} GB</b><span>{diskUsedMb.toFixed(1)} MB used (virtual files)</span></article><article><Server/><small>SERVICES</small><b>{runningServices}/{state.services.length} running</b><span>Service manager active</span></article></div>
          <div className="rabbitos-status"><span><i className={canBootRabbitOS(state.hardware)?'ok':'bad'}/>{canBootRabbitOS(state.hardware)?'SYSTEM READY':'BOOT BLOCKED'}</span><span>BOOT COUNT: {state.bootCount}</span><span>LAST BOOT: {state.lastBootAt?new Date(state.lastBootAt).toLocaleString('cs-CZ'):'NOT RECORDED'}</span></div>
          <h4>Hardware diagnostics</h4><div className="rabbitos-diagnostics">{diagnostics.map(item=><div key={item.code} className={item.severity}><span>{item.severity==='error'?<AlertTriangle size={14}/>:item.severity==='warning'?<AlertTriangle size={14}/>:<CheckCircle2 size={14}/>}</span><b>{item.code}</b><p>{item.message}</p></div>)}</div>
        </section>}
        {tab==='bios'&&<section><div className="rabbitos-heading"><div><small>FIRMWARE CONFIGURATION</small><h3>BIOS / UEFI</h3><p>Nastavení se ukládá do virtuálního firmware. Pro aktivaci změn je nutný restart.</p></div><button className="rabbitos-primary" onClick={saveFirmware}>SAVE FIRMWARE</button></div>
          <div className="rabbitos-form-grid"><label>Boot order<select value={firmwareDraft.bootOrder} onChange={e=>setFirmwareDraft(v=>({...v,bootOrder:e.target.value as typeof v.bootOrder}))}><option value="ssd-first">NVMe SSD first</option><option value="usb-first">USB installer first</option></select></label>
          {([['secureBoot','Secure Boot'],['virtualization','CPU Virtualization'],['xmp','XMP / EXPO'],['tpm','TPM 2.0']] as const).map(([key,label])=><label className="rabbitos-toggle-row" key={key}><span>{label}</span><button className={firmwareDraft[key]?'enabled':''} onClick={()=>setFirmwareDraft(v=>({...v,[key]:!v[key]}))}>{firmwareDraft[key]?'ENABLED':'DISABLED'}</button></label>)}</div>
          <div className="rabbitos-callout"><ShieldCheck size={16}/> Secure Boot, TPM a virtualizace ovlivňují dostupné funkce RabbitOS. Vypnutí virtualizace zastaví VM Host.</div>
          <button className="rabbitos-primary" onClick={restart}><Power size={14}/> SAVE & REBOOT</button>
        </section>}
        {tab==='hardware'&&<section><div className="rabbitos-heading"><div><small>VIRTUAL COMPONENT CONFIGURATION</small><h3>Hardware manager</h3><p>Simuluj výměnu komponent. Nekompatibilní konfigurace může zablokovat POST.</p></div><button className="rabbitos-primary" onClick={saveHardware}>APPLY COMPONENTS</button></div>
          <div className="rabbitos-hardware-list"><label>CPU<select value={hardwareDraft.cpu.model} onChange={e=>setHardwareDraft(v=>({...v,cpu:e.target.value==='RabbitCore R7 5700X'?{model:'RabbitCore R7 5700X',cores:8,threads:16,socket:'AM4',baseClockGhz:3.4}:{model:'RabbitCore R9 9700X',cores:8,threads:16,socket:'AM5',baseClockGhz:3.8}}))}><option>RabbitCore R7 5700X</option><option>RabbitCore R9 9700X</option></select></label>
          <label>Motherboard<select value={hardwareDraft.motherboard.model} onChange={e=>setHardwareDraft(v=>({...v,motherboard:e.target.value==='RabbitBoard B550'?{model:'RabbitBoard B550',socket:'AM4',memoryType:'DDR4',maxMemoryGb:128,pcieGeneration:4}:{model:'RabbitBoard B650',socket:'AM5',memoryType:'DDR5',maxMemoryGb:192,pcieGeneration:5}}))}><option>RabbitBoard B550</option><option>RabbitBoard B650</option></select></label>
          <label>RAM capacity<select value={hardwareDraft.memory.installedGb} onChange={e=>setHardwareDraft(v=>({...v,memory:{...v.memory,installedGb:Number(e.target.value)}}))}><option value={16}>16 GB</option><option value={32}>32 GB</option><option value={64}>64 GB</option><option value={128}>128 GB</option></select></label>
          <label>RAM type<select value={hardwareDraft.memory.type} onChange={e=>setHardwareDraft(v=>({...v,memory:{...v.memory,type:e.target.value as 'DDR4'|'DDR5',speedMhz:e.target.value==='DDR4'?3200:5600}}))}><option>DDR4</option><option>DDR5</option></select></label>
          <label>GPU<select value={hardwareDraft.gpu.model} onChange={e=>setHardwareDraft(v=>({...v,gpu:e.target.value==='RabbitGraphics RTX 5070'?{model:'RabbitGraphics RTX 5070',vramGb:12,requiredPsuW:650}:{model:'RabbitGraphics RX 7800 XT',vramGb:16,requiredPsuW:700}}))}><option>RabbitGraphics RTX 5070</option><option>RabbitGraphics RX 7800 XT</option></select></label>
          <label>Power supply<select value={hardwareDraft.power.psuW} onChange={e=>setHardwareDraft(v=>({...v,power:{...v.power,psuW:Number(e.target.value)}}))}><option value={550}>550 W</option><option value={650}>650 W</option><option value={750}>750 W</option><option value={850}>850 W</option></select></label>
          <label>System disk<select value={hardwareDraft.storage.capacityGb} onChange={e=>setHardwareDraft(v=>({...v,storage:{...v.storage,capacityGb:Number(e.target.value)}}))}><option value={128}>128 GB NVMe</option><option value={256}>256 GB NVMe</option><option value={512}>512 GB NVMe</option><option value={1024}>1 TB NVMe</option></select></label>
          <label className="rabbitos-toggle-row"><span>System disk installed</span><button className={hardwareDraft.storage.systemDiskPresent?'enabled':''} onClick={()=>setHardwareDraft(v=>({...v,storage:{...v.storage,systemDiskPresent:!v.storage.systemDiskPresent}}))}>{hardwareDraft.storage.systemDiskPresent?'INSTALLED':'REMOVED'}</button></label></div>
          <div className="rabbitos-callout"><Cpu size={16}/> Current POST preview: {diagnoseHardware(hardwareDraft).filter(item=>item.severity==='error').length===0?'COMPATIBLE':'INCOMPATIBLE'} — save and reboot to apply.</div>
        </section>}
        {tab==='storage'&&<section><div className="rabbitos-heading"><div><small>VIRTUAL FILESYSTEM</small><h3>Filesystem & recovery</h3><p>Virtuální soubory mají vlastníka, skupinu, oprávnění a spotřebu místa.</p></div></div>
          <div className="rabbitos-diskbar"><span>NVMe · {state.hardware.storage.capacityGb} GB</span><b>{diskUsedMb.toFixed(1)} MB used</b></div>
          <div className="rabbitos-form-grid"><label>Absolute path<input value={filePath} onChange={e=>setFilePath(e.target.value)} placeholder="/home/operator/file.txt"/></label><label>File content<textarea value={fileContent} onChange={e=>setFileContent(e.target.value)}/></label></div><button className="rabbitos-primary" onClick={()=>{const next=addVirtualFile(state,filePath,fileContent,username);commit(next);setMessage('Požadavek na vytvoření souboru zpracován. Zkontroluj system log při odmítnutí.');}}><FilePlus2 size={14}/> CREATE FILE</button>
          <div className="rabbitos-file-list">{state.files.filter(file=>!file.deleted).map(file=><article key={file.path}><span><b>{file.path}</b><small>{file.kind} · {file.owner}:{file.group} · {file.permissions} · {file.sizeKb} KB</small></span>{file.kind==='file'&&<><button onClick={()=>setSelectedFile(selectedFile===file.path?null:file.path)}>VIEW</button><button onClick={()=>{commit(updateVirtualFilePermissions(state,file.path,file.permissions==='rw-r-----'?'rw-------':'rw-r-----'));setMessage('Oprávnění souboru změněno a zaznamenáno.');}}>CHMOD</button><button onClick={()=>{commit(deleteVirtualFile(state,file.path));setMessage('Soubor přesunut do recovery area.');}}><Trash2 size={13}/> DELETE</button></>}</article>)}</div>
          {selectedFile&&(()=>{const file=state.files.find(item=>item.path===selectedFile&&!item.deleted);if(!file)return null;const current=state.accounts.find(item=>item.username===username)??state.accounts[0];const allowed=current?canAccessVirtualFile(file,current,'read'):false;return <div className="rabbitos-file-preview"><b>{file.path}</b>{allowed?<pre>{file.content??'[Soubor neobsahuje textový obsah.]'}</pre>:<p>ACCESS DENIED — účet nemá oprávnění ke čtení tohoto souboru.</p>}</div>;})()}
          <h4>Recovery area</h4>{recoveredFiles.length?recoveredFiles.map(file=><article className="rabbitos-recovered" key={file.path}><span>{file.path}</span><button onClick={()=>{commit(restoreVirtualFile(state,file.path));setMessage('Soubor obnoven.');}}><RotateCcw size={13}/> RESTORE</button></article>):<p className="rabbitos-muted">Žádné odstraněné soubory.</p>}
        </section>}
        {tab==='accounts'&&<section><div className="rabbitos-heading"><div><small>LOCAL IDENTITY & ACCESS</small><h3>Users & groups</h3><p>Spravuj lokální účty a jejich herní role. Jde o simulaci oprávnění, ne o skutečné účty OS.</p></div></div>
          <div className="rabbitos-form-grid"><label>Username<input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="analyst01"/></label><label>Role<select value={accountRole} onChange={e=>setAccountRole(e.target.value as VirtualAccount['role'])}><option value="operator">Operator</option><option value="analyst">Analyst</option><option value="administrator">Administrator</option></select></label></div><button className="rabbitos-primary" onClick={()=>{const next=addVirtualAccount(state,accountName,accountRole);commit(next);setAccountName('');setMessage('Požadavek na vytvoření účtu zpracován.');}}><Users size={14}/> CREATE LOCAL ACCOUNT</button>
          <div className="rabbitos-account-list">{state.accounts.map(user=><article key={user.id}><div><b>{user.username}</b><small>{user.role.toUpperCase()} · GROUPS: {user.groups.join(', ')}</small></div><span className={user.enabled?'enabled-text':'disabled-text'}>{user.enabled?'ENABLED':'DISABLED'}</span><button onClick={()=>{commit(toggleVirtualAccount(state,user.id));setMessage('Stav účtu byl zpracován.');}}>{user.enabled?'DISABLE':'ENABLE'}</button></article>)}</div>
        </section>}
        {tab==='services'&&<section><div className="rabbitos-heading"><div><small>SERVICE CONTROL MANAGER</small><h3>System services</h3><p>Spouštěj a zastavuj virtuální služby. Některé závisí na nastavení BIOSu.</p></div></div>
          <div className="rabbitos-service-list">{state.services.map(service=><article key={service.id}><div><b>{service.name}</b><p>{service.description}</p><small>{service.memoryMb} MB · STARTUP: {service.enabledAtBoot?'AUTOMATIC':'MANUAL'}</small></div><span className={service.status==='running'?'enabled-text':'disabled-text'}>{service.status.toUpperCase()}</span><button onClick={()=>{const next=setServiceStatus(state,service.id,service.status==='running'?'stopped':'running');commit(next);setMessage('Změna služby zaznamenána v system log.');}}>{service.status==='running'?<><Square size={12}/> STOP</>:<><Play size={12}/> START</>}</button></article>)}</div>
        </section>}
        {tab==='logs'&&<section><div className="rabbitos-heading"><div><small>EVENT JOURNAL</small><h3>System logs</h3><p>Události bootování, služeb, účtů, úložiště a firmware.</p></div><button className="rabbitos-secondary" onClick={()=>setMessage('Logy jsou uchovávány pro herní diagnostiku.')}>LOG INFO</button></div><div className="rabbitos-log-list">{[...state.logs].reverse().map(log=><article key={log.id}><time>{new Date(log.at).toLocaleString('cs-CZ')}</time><b className={log.level.toLowerCase()}>{log.level}</b><span>{log.source}</span><p>{log.message}</p></article>)}</div></section>}
      </div>
    </div>
    <div className="rabbitos-foot"><span>RABBITOS VIRTUAL CONTROL PLANE</span><span>NO HOST OS ACCESS · NO EXTERNAL NETWORK</span></div>
  </div>;
}
