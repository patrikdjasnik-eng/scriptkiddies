import { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, Bug, Database, FileSearch, HardDrive, Network, ShieldAlert, Terminal, Wallet, X, Play, CheckCircle2 } from 'lucide-react';

type Locale = 'cs' | 'en';
type Props = { lang: Locale; programId: string };
type Progress = { xp: number; credits: number; reputation: number; completed: string[]; logs: string[] };
const missions = [
  { id: 'map', title: 'Mapa perimetru', titleEn: 'Perimeter map', xp: 80, credits: 120, rep: 8, app: 'network' },
  { id: 'web', title: 'Ztracená dokumentace', titleEn: 'Lost documentation', xp: 140, credits: 260, rep: 14, app: 'web' },
  { id: 'ir', title: 'Noční incident', titleEn: 'Night shift incident', xp: 180, credits: 320, rep: 18, app: 'ir' },
  { id: 'forensics', title: 'Stopy v logu', titleEn: 'Traces in the logs', xp: 220, credits: 400, rep: 22, app: 'forensics' }
];
const apps = [
  { id: 'network', icon: Network, name: 'NetMap', sub: 'Topology & simulated nodes' },
  { id: 'recon', icon: Activity, name: 'Recon Desk', sub: 'Discovery & enumeration' },
  { id: 'web', icon: Bug, name: 'Web Lab', sub: 'Vulnerability scenarios' },
  { id: 'ir', icon: ShieldAlert, name: 'Incident Center', sub: 'Response playbooks' },
  { id: 'forensics', icon: FileSearch, name: 'Forensic Studio', sub: 'Evidence & timeline' },
  { id: 'career', icon: Wallet, name: 'Career & Finance', sub: 'XP, reputation & rewards' }
];
const initial: Progress = { xp: 0, credits: 0, reputation: 0, completed: [], logs: ['BH-OS user session created.', 'Local simulation kernel ready.'] };
export default function GameOS({ lang, programId }: Props) {
  const cs = lang === 'cs';
  const key = 'bh-os-progress-v1-' + programId;
  const [progress, setProgress] = useState<Progress>(() => {
    try { const raw = localStorage.getItem(key); return raw ? { ...initial, ...JSON.parse(raw) } : initial; } catch { return initial; }
  });
  const [activeApp, setActiveApp] = useState('network');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLog, setTerminalLog] = useState<string[]>(['BH-OS // LOCAL SHELL', 'Type help to see available game commands.']);
  const [toast, setToast] = useState('');
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* storage may be disabled */ } }, [key, progress]);
  const level = Math.floor(progress.xp / 250) + 1;
  const rank = level >= 5 ? 'FIELD SPECIALIST' : level >= 3 ? 'SECURITY ANALYST' : level >= 2 ? 'JUNIOR RESEARCHER' : 'ROOKIE';
  const selected = useMemo(() => apps.find(a => a.id === activeApp) ?? apps[0], [activeApp]);
  const finishMission = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission || progress.completed.includes(id)) return;
    setProgress(p => ({ ...p, xp: p.xp + mission.xp, credits: p.credits + mission.credits, reputation: p.reputation + mission.rep, completed: [...p.completed, id], logs: [...p.logs, 'MISSION COMPLETE: ' + (cs ? mission.title : mission.titleEn)] }));
    setToast(cs ? 'Mise dokončena. Odměna připsána.' : 'Mission complete. Reward credited.');
  };
  const runCommand = (event: React.FormEvent) => {
    event.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    if (!command) return;
    const response: Record<string, string> = {
      help: 'help · status · map · missions · clear',
      status: 'LEVEL ' + level + ' · ' + progress.xp + ' XP · €' + progress.credits + ' · REP ' + progress.reputation,
      map: 'LAB-NET → EDGE-GW → WEB-PORTAL / API-GATEWAY / LOG-VAULT (SIMULATED)',
      missions: missions.map(m => (progress.completed.includes(m.id) ? '[DONE] ' : '[OPEN] ') + (cs ? m.title : m.titleEn)).join(' | ')
    };
    setTerminalLog(old => command === 'clear' ? [] : [...old, 'operator@bh-os:~$ ' + command, response[command] ?? 'Unknown game command. Type help.']);
    setTerminalInput('');
  };
  const description = activeApp === 'network' ? (cs ? 'Topologie izolované firemní laboratoře. Vyber uzel a prohlédni si jeho herní roli.' : 'Topology of an isolated enterprise lab. Inspect nodes and their simulated roles.')
    : activeApp === 'recon' ? (cs ? 'Průzkum je rozdělený do bezpečných fází: inventář, DNS mapa, služby a technologické otisky.' : 'Recon is split into safe stages: inventory, DNS map, services and technology fingerprints.')
    : activeApp === 'web' ? (cs ? 'Tréninkové scénáře se zaměřují na dopad, důkazy a opravu. Žádné payloady se neposílají.' : 'Training scenarios focus on impact, evidence and remediation. No payloads are sent.')
    : activeApp === 'ir' ? (cs ? 'Postup incident response: triage, containment, eradikace a obnova.' : 'Incident response workflow: triage, containment, eradication and recovery.')
    : activeApp === 'forensics' ? (cs ? 'Lokální důkazní balíček obsahuje časovou osu, systémové události a řetězec úschovy.' : 'Local evidence package includes a timeline, system events and chain of custody.')
    : (cs ? 'Postup kariérou, reputace a virtuální finance operátora.' : 'Operator career progression, reputation and virtual finances.');
  const nodes = [{name:'EDGE-GW-01',role:cs?'Hraniční brána':'Edge gateway',state:'ONLINE'},{name:'WEB-PORTAL-02',role:cs?'Webová aplikace':'Web application',state:'ONLINE'},{name:'API-GW-01',role:cs?'API brána':'API gateway',state:'ONLINE'},{name:'LOG-VAULT-01',role:cs?'Logovací úložiště':'Log vault',state:'ISOLATED'}];
  return <section className="game-os">
    <div className="game-os-head"><div><div className="eyebrow"><i/> BOUNTY HUNTER OPERATING SYSTEM</div><h2>BH-OS <span>v0.2.0 // DESKTOP</span></h2><p>{cs?'Virtuální operační systém operátora. Aplikace běží nad lokálním herním stavem.':'Operator virtual operating system. Apps run on local game state.'}</p></div><div className="os-clock"><i/> SESSION ACTIVE<br/><b>LOCAL SANDBOX</b></div></div>
    <div className="os-status"><div><small>RANK</small><b>{rank}</b></div><div><small>LEVEL</small><b>{String(level).padStart(2,'0')}</b></div><div><small>EXPERIENCE</small><b>{progress.xp} XP</b></div><div><small>REPUTATION</small><b>{progress.reputation}</b></div><div><small>WALLET</small><b>€{progress.credits}</b></div></div>
    <div className="os-desktop"><aside className="os-launcher"><div className="os-launcher-title"><HardDrive size={14}/> {cs?'APLIKACE':'APPLICATIONS'}</div>{apps.map(app=><button key={app.id} className={activeApp===app.id?'active':''} onClick={()=>setActiveApp(app.id)}><app.icon size={16}/><span>{app.name}</span></button>)}<div className="os-launcher-foot">BH-OS / LOCAL USER</div></aside>
      <div className="os-window"><div className="os-window-bar"><span><selected.icon size={14}/>{selected.name}</span><button onClick={()=>setActiveApp('network')} aria-label="Close app"><X size={14}/></button></div><div className="os-window-body"><h3>{selected.name}</h3><p>{description}</p>
        {activeApp==='network' && <div className="os-node-grid">{nodes.map(n=><article key={n.name}><Network size={17}/><b>{n.name}</b><span>{n.role}</span><small>{n.state}</small></article>)}</div>}
        {activeApp==='recon' && <div className="os-detail-list">{['Asset inventory · 4 nodes','DNS relationship map · 3 records','Service catalogue · 6 simulated services','Technology fingerprint · nginx / PostgreSQL / Node.js'].map(x=><div key={x}><CheckCircle2 size={14}/>{x}</div>)}</div>}
        {activeApp==='web' && <div className="os-challenge"><span>LAB CASE // WEB-02</span><h4>{cs?'Nesprávně zveřejněná dokumentace':'Misconfigured documentation exposure'}</h4><p>{cs?'Veřejná testovací dokumentace odhaluje interní názvy endpointů. Vyhodnoť dopad a navrhni nápravu omezením přístupu a odstraněním citlivých metadat.':'Public test documentation reveals internal endpoint names. Assess impact and recommend access restriction and removal of sensitive metadata.'}</p><small>SEVERITY: LOW · STATUS: {progress.completed.includes('web')?'RESOLVED':'OPEN'}</small></div>}
        {activeApp==='ir' && <div className="os-detail-list">{['01 · Triage: unusual authentication failures','02 · Containment: isolate the affected lab node','03 · Eradication: remove simulated persistence','04 · Recovery: restore verified clean snapshot'].map(x=><div key={x}><ShieldAlert size={14}/>{x}</div>)}</div>}
        {activeApp==='forensics' && <div className="os-detail-list">{['21:04:12 · Authentication anomaly','21:06:48 · Privilege change recorded','21:08:03 · Unusual process tree observed','21:11:27 · Evidence snapshot sealed · SHA-256 (simulated)'].map(x=><div key={x}><FileSearch size={14}/>{x}</div>)}</div>}
        {activeApp==='career' && <div className="os-career"><div><small>CAREER TRACK</small><b>{rank}</b></div><div><small>XP TO NEXT LEVEL</small><b>{250-(progress.xp%250)} XP</b></div><div><small>REPUTATION TIER</small><b>{progress.reputation>=50?'TRUSTED':progress.reputation>=20?'RECOGNIZED':'NEWCOMER'}</b></div><div><small>VIRTUAL WALLET</small><b>€{progress.credits}</b></div></div>}
        <div className="os-action-row"><span>{cs?'Dostupné mise':'Available missions'}: {progress.completed.length}/{missions.length}</span>{missions.filter(m=>m.app===activeApp).map(m=><button key={m.id} disabled={progress.completed.includes(m.id)} onClick={()=>finishMission(m.id)}><Play size={12}/>{progress.completed.includes(m.id)?(cs?'HOTOVO':'COMPLETED'):(cs?'DOKONČIT MISI':'COMPLETE MISSION')}</button>)}</div>
      </div></div>
    </div>
    <div className="os-bottom-grid"><div className="os-terminal"><div><Terminal size={13}/> BH-OS SHELL <small>GAME COMMANDS ONLY</small></div><div className="os-terminal-log">{terminalLog.slice(-5).map((line,i)=><p key={i}>{line}</p>)}</div><form onSubmit={runCommand}><b>›</b><input value={terminalInput} onChange={e=>setTerminalInput(e.target.value)} placeholder="help / status / map / missions"/><button>RUN</button></form></div><div className="os-missions"><div><BookOpen size={14}/> {cs?'KAMPAŇ':'CAMPAIGN'} <small>CHAPTER 01 / 04</small></div>{missions.map((m,i)=><button key={m.id} onClick={()=>setActiveApp(m.app)}><span>{String(i+1).padStart(2,'0')}</span><b>{cs?m.title:m.titleEn}</b><small>{progress.completed.includes(m.id)?'✓ COMPLETE':'AVAILABLE'}</small></button>)}</div></div>
    {toast&&<button className="os-toast" onClick={()=>setToast('')}>{toast} ×</button>}
    <div className="os-safety"><ShieldAlert size={13}/>{cs?'Veškeré uzly, důkazy i výsledky jsou fiktivní a zpracovávané výhradně v prohlížeči.':'All nodes, evidence and results are fictional and processed entirely in the browser.'}</div>
  </section>;
}
