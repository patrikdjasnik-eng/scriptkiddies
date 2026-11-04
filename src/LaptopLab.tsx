import { useMemo, useState } from 'react';
import { Activity, BookOpen, Bug, CheckCircle2, Code2, FileText, Folder, Globe2, HardDrive, Monitor, Network, Play, Power, Search, ShieldCheck, Terminal, Wifi, X } from 'lucide-react';

type AppId = 'powershell' | 'editor' | 'browser' | 'files' | 'knowledge' | 'monitor';
type Mission = { id: string; title: string; brief: string; target: string; reward: number; objectives: string[] };
type Line = { text: string; tone?: 'good' | 'warn' | 'error' | 'muted' };
const missions: Mission[] = [
  { id: 'recon-01', title: 'První průzkum infrastruktury', brief: 'Zmapuj staging server logistické společnosti. Zjisti jeho adresu, dostupné porty a běžící služby. Nakonec ulož důkaz.', target: 'staging.noname-logistics.test', reward: 180, objectives: ['Zkontroluj identitu operátora (whoami).', 'Zjisti síťovou konfiguraci (ipconfig).', 'Vyřeš DNS záznam cíle (nslookup).', 'Proveď simulovaný scan portů a verzí (nmap).', 'Ulož důkaz do evidence.'] },
  { id: 'web-02', title: 'Odhalená API dokumentace', brief: 'Prověř webovou aplikaci. Najdi veřejně dostupnou dokumentaci API, vyhodnoť dopad a připrav bezpečnostní doporučení.', target: 'staging.noname-logistics.test', reward: 320, objectives: ['Otevři webový cíl v Browseru.', 'Prohlédni HTTP hlavičky (curl -I).', 'Najdi veřejnou dokumentaci (/api/docs).', 'Zaznamenej nález jako důkaz.', 'Odevzdej závěrečný report.'] },
  { id: 'ir-03', title: 'Noční incident', brief: 'Vyšetři podezřelou aktivitu na pracovním serveru. Projdi dostupné logy, sestav časovou osu a identifikuj podezřelý proces.', target: 'workstation-07.lab', reward: 420, objectives: ['Otevři složku s incidentními logy.', 'Prohledej authentication.log.', 'Identifikuj podezřelý proces.', 'Vytvoř forenzní důkaz.', 'Odevzdej incidentní report.'] }
];
const initialLines: Line[] = [
  { text: 'Windows PowerShell', tone: 'good' },
  { text: 'Copyright (C) Microsoft Corporation. Všechna práva vyhrazena.', tone: 'muted' },
  { text: 'BH-LAB PROFILE: isolated training workstation', tone: 'muted' },
  { text: 'Napiš help a zobraz dostupné příkazy.', tone: 'muted' },
  { text: '' }
];
const files = ['Desktop/', 'Documents/', 'Downloads/', 'evidence/', 'logs/', 'notes.txt', 'recon.ps1'];

export default function LaptopLab({ lang }: { lang: 'cs' | 'en' }) {
  const cs = lang === 'cs';
  const [missionId, setMissionId] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<AppId>('powershell');
  const [openApps, setOpenApps] = useState<AppId[]>(['powershell']);
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [completed, setCompleted] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [url, setUrl] = useState('http://staging.noname-logistics.test');
  const [script, setScript] = useState('Write-Host "Starting reconnaissance..."\n$target = "staging.noname-logistics.test"\nWrite-Host "Target: $target"\n# Try: Resolve-DnsName $target');
  const [scriptOutput, setScriptOutput] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const mission = missions.find(item => item.id === missionId) ?? null;
  const objectiveIndex = mission ? completed.filter(id => id.startsWith(mission.id + ':')).length : 0;
  const progress = mission ? Math.min(100, Math.round(objectiveIndex / mission.objectives.length * 100)) : 0;
  const prompt = useMemo(() => mission ? `PS C:\\Users\\operator> ` : 'PS C:\\Users\\operator> ', [missionId]);

  const mark = (index: number) => {
    if (!mission) return;
    const key = mission.id + ':' + index;
    setCompleted(old => old.includes(key) ? old : [...old, key]);
  };
  const add = (...items: Line[]) => setLines(old => [...old, ...items].slice(-100));
  const openApp = (app: AppId) => {
    setActiveApp(app);
    setOpenApps(old => old.includes(app) ? old : [...old, app]);
  };
  const runCommand = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    add({ text: prompt + command, tone: 'good' });
    const lower = command.toLowerCase();
    if (lower === 'help' || lower === 'get-help') {
      add({ text: 'ZÁKLADNÍ PŘÍKAZY', tone: 'good' }, { text: 'whoami · pwd · ls · cd · ipconfig · nslookup <host>' }, { text: 'nmap -sV <host> · curl -I <url> · evidence add <název> · submit' }, { text: 'Příkazy pracují pouze s daty této výukové laboratoře.', tone: 'muted' });
    } else if (lower === 'whoami') {
      add({ text: 'bh-lab\\operator' }); mark(0);
    } else if (lower === 'pwd') {
      add({ text: 'C:\\Users\\operator' });
    } else if (lower === 'ls' || lower === 'dir' || lower === 'get-childitem') {
      add(...files.map(name => ({ text: name })));
    } else if (lower === 'ipconfig' || lower === 'ipconfig /all') {
      add({ text: 'Ethernet adapter LabNet:' }, { text: '   IPv4 Address . . . . . . . . . : 10.20.0.15' }, { text: '   Subnet Mask  . . . . . . . . . : 255.255.255.0' }, { text: '   Default Gateway . . . . . . . : 10.20.0.1' }); mark(1);
    } else if (lower.startsWith('nslookup ')) {
      const host = command.slice(8).trim().toLowerCase();
      if (host === 'staging.noname-logistics.test' || host === 'noname-logistics.test') {
        add({ text: 'Server:  resolver.lab', tone: 'muted' }, { text: 'Name:    ' + host }, { text: 'Address: 10.20.0.24', tone: 'good' }); mark(2);
      } else add({ text: '*** resolver.lab: NXDOMAIN', tone: 'warn' });
    } else if (lower.startsWith('nmap ')) {
      if (!lower.includes('staging.noname-logistics.test') && !lower.includes('10.20.0.24')) add({ text: 'Cíl není v inventáři této mise. Nejprve ověř DNS a rozsah.', tone: 'error' });
      else {
        add({ text: 'Starting Nmap 7.94 ( SIMULATED LAB BUILD )' }, { text: 'Host is up (0.012s simulated latency).' }, { text: 'PORT     STATE SERVICE  VERSION' }, { text: '22/tcp   open  ssh      OpenSSH 9.2' }, { text: '80/tcp   open  http     nginx 1.24.0' }, { text: '443/tcp  open  https    nginx 1.24.0' }, { text: '3000/tcp open  http     Node.js API (simulated)' }, { text: 'Scan complete: 1 host, 4 open ports.', tone: 'good' }); mark(3);
      }
    } else if (lower.startsWith('curl ')) {
      if (lower.includes('/api/docs') || lower.includes('staging.noname-logistics.test')) {
        add({ text: 'HTTP/1.1 200 OK', tone: 'good' }, { text: 'server: nginx/1.24.0' }, { text: 'content-type: text/html; charset=utf-8' }, { text: 'x-lab-route: /api/docs' }, { text: 'Simulovaná odpověď: API documentation is publicly accessible.', tone: 'warn' });
        if (mission?.id === 'web-02') mark(2);
      } else add({ text: 'curl: URL není součástí lokálního labu.', tone: 'error' });
      if (lower.includes('-i')) mark(1);
    } else if (lower.startsWith('evidence add ')) {
      const name = command.slice(13).trim() || 'unnamed-evidence';
      setEvidence(old => old.includes(name) ? old : [...old, name]);
      add({ text: 'Evidence uložen: ' + name, tone: 'good' });
      if (mission?.id === 'recon-01') mark(4);
      if (mission?.id === 'web-02') mark(3);
      if (mission?.id === 'ir-03') mark(3);
    } else if (lower === 'submit') {
      if (!mission) add({ text: 'Nejdřív vyber aktivní misi.', tone: 'warn' });
      else if (completed.filter(id => id.startsWith(mission.id + ':')).length >= mission.objectives.length - 1) {
        add({ text: 'MISSION SUBMITTED — vyhodnocení dokončeno.', tone: 'good' });
        setNotice('Mise odevzdána. Získáváš ' + mission.reward + ' XP.');
      } else add({ text: 'Report zatím není kompletní. Zkontroluj checklist mise.', tone: 'warn' });
    } else if (lower === 'clear' || lower === 'cls') setLines([]);
    else if (lower.startsWith('resolve-dnsname ')) {
      add({ text: 'Name: ' + command.slice(16), tone: 'good' }, { text: 'IPAddress: 10.20.0.24' }); mark(2);
    } else if (lower.startsWith('get-netipconfiguration')) {
      add({ text: 'InterfaceAlias: LabNet · IPv4Address: 10.20.0.15/24 · Gateway: 10.20.0.1' }); mark(1);
    } else add({ text: `Příkaz '${command.split(' ')[0]}' nebyl nalezen. Zkus help.`, tone: 'error' });
  };
  const runScript = () => {
    const output: string[] = [];
    const target = mission?.target ?? 'staging.noname-logistics.test';
    script.split(/\\r?\\n/).forEach(raw => {
      const line = raw.trim();
      if (!line || line.startsWith('#')) return;
      const hostMatch = line.match(/^(?:\\$target|\\$host)\\s*=\\s*["']([^"']+)["']$/i);
      const printMatch = line.match(/^Write-Host\\s+["'](.*)["']$/i);
      const printVar = line.match(/^Write-Host\\s+\\$(target|host)$/i);
      if (hostMatch) output.push(`[proměnná nastavena] ${hostMatch[1]}`);
      else if (printMatch) output.push(printMatch[1]);
      else if (printVar) output.push(target);
      else if (/^Resolve-DnsName\\s+\\$target$/i.test(line)) output.push(`Name: ${target} · IPAddress: 10.20.0.24 (simulováno)`);
      else output.push(`Řádek přeskočen — příkaz není v podporované sadě: ${line}`);
    });
    setScriptOutput(output.length ? output : ['Skript proběhl, ale nevypsal žádný výstup.']);
  };
  const chooseMission = (id: string) => {
    setMissionId(id); setCompleted([]); setEvidence([]); setLines(initialLines); setActiveApp('powershell'); setOpenApps(['powershell']); setNotice('');
  };
  const appDefs: { id: AppId; label: string; icon: typeof Terminal; hint: string }[] = [
    { id: 'powershell', label: 'PowerShell', icon: Terminal, hint: 'Terminál a příkazová řádka' },
    { id: 'editor', label: 'Script Lab', icon: Code2, hint: 'Editor skriptů PowerShell' },
    { id: 'browser', label: 'Browser', icon: Globe2, hint: 'Webová aplikace v lokálním labu' },
    { id: 'files', label: 'File Explorer', icon: Folder, hint: 'Soubory a důkazy' },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, hint: 'Technická dokumentace' },
    { id: 'monitor', label: 'Network Monitor', icon: Activity, hint: 'Simulovaná síťová telemetrie' }
  ];
  return <section className="laptop-lab">
    <div className="lab-intro"><div><span className="lab-kicker">BOUNTY HUNTER // FIELD WORKSTATION</span><h2>{cs ? 'Vyber misi a připrav pracovní stanici' : 'Select a mission and prepare your workstation'}</h2><p>{cs ? 'Každá mise se řeší přímo v simulovaném notebooku. Otevírej aplikace, používej příkazy, piš skripty a sbírej důkazy.' : 'Every mission is completed inside a simulated laptop. Open apps, use commands, write scripts and collect evidence.'}</p></div><div className="lab-online"><i/> LOCAL VM ONLINE</div></div>
    {!mission ? <div className="lab-mission-select">{missions.map((item, index) => <button key={item.id} className="lab-mission-card" onClick={() => chooseMission(item.id)}><span className="lab-mission-number">0{index + 1} / CONTRACT</span><h3>{item.title}</h3><p>{item.brief}</p><div><span>{item.target}</span><b>+{item.reward} XP <Play size={13}/></b></div></button>)}</div> :
    <div className="laptop-shell">
      <div className="laptop-bezel"><div className="laptop-camera"/><div className="laptop-screen">
        <div className="desktop-topbar"><span><Monitor size={13}/> BH-LAB WORKSTATION</span><span><i/> VM CONNECTED · {mission.id.toUpperCase()}</span><button onClick={() => setMissionId(null)}><X size={13}/> {cs ? 'ZAVŘÍT MISI' : 'CLOSE MISSION'}</button></div>
        <div className="desktop-area">
          <div className="desktop-icons">{appDefs.map(app => <button key={app.id} onDoubleClick={() => openApp(app.id)} onClick={() => setActiveApp(app.id)} className={activeApp === app.id ? 'selected' : ''}><span><app.icon size={22}/></span><b>{app.label}</b></button>)}</div>
          <div className="desktop-mission-widget"><small>ACTIVE CONTRACT</small><b>{mission.title}</b><span>{mission.target}</span><div className="mission-progress"><i style={{ width: progress + '%' }}/></div><small>{objectiveIndex}/{mission.objectives.length} OBJECTIVES · {progress}%</small></div>
          {activeApp === 'powershell' && <div className="desktop-window terminal-window"><div className="desktop-window-title"><span><Terminal size={14}/> Windows PowerShell</span><div><button onClick={() => setLines(initialLines)}>↻</button><button onClick={() => setActiveApp('powershell')}>—</button><button onClick={() => setActiveApp('monitor')}>×</button></div></div><div className="powershell-output">{lines.map((line, i) => <div key={i} className={line.tone ?? ''}>{line.text || '\u00a0'}</div>)}</div><form className="powershell-input" onSubmit={e => { e.preventDefault(); runCommand(input); setInput(''); }}><span>{prompt}</span><input autoComplete="off" spellCheck={false} value={input} onChange={e => setInput(e.target.value)} placeholder="help"/><button><Play size={12}/></button></form></div>}
          {activeApp === 'editor' && <div className="desktop-window editor-window"><div className="desktop-window-title"><span><Code2 size={14}/> Script Lab — recon.ps1</span><button onClick={runScript}><Play size={12}/> RUN SCRIPT</button></div><div className="editor-help">PowerShell mini-runner · podporované konstrukce: Write-Host, proměnné $target a Resolve-DnsName.</div><textarea spellCheck={false} value={script} onChange={e => setScript(e.target.value)}/><div className="script-output">{scriptOutput.map((line, i) => <div key={i}>{line}</div>)}</div></div>}
          {activeApp === 'browser' && <div className="desktop-window browser-window"><div className="desktop-window-title"><span><Globe2 size={14}/> BH Browser</span><span>LOCAL LAB ONLY</span></div><div className="browser-address"><Search size={13}/><input value={url} onChange={e => setUrl(e.target.value)}/><button onClick={() => { setNotice('Stránka načtena z lokální simulace.'); if (mission.id === 'web-02') mark(0); }}>GO</button></div><div className="browser-page"><div className="browser-brand">NONAME <b>LOGISTICS</b></div><h3>{url.includes('/api/docs') ? 'API Documentation' : 'Shipment Portal'}</h3><p>{url.includes('/api/docs') ? 'OpenAPI 3.0 · Internal shipment and tracking endpoints' : 'Track shipments, manage delivery preferences and view service status.'}</p><div className="browser-endpoints"><code>GET /api/v1/shipments/:id</code><code>GET /api/v1/tracking/:code</code><code>POST /api/v1/session</code></div><small>SIMULATED RESPONSE · HTTP 200</small></div></div>}
          {activeApp === 'files' && <div className="desktop-window files-window"><div className="desktop-window-title"><span><Folder size={14}/> File Explorer</span><span> C:\Users\operator</span></div>{files.map(file => <button key={file} onClick={() => file === 'evidence/' ? setNotice(evidence.length ? evidence.join(', ') : 'Evidence folder je zatím prázdná.') : setNotice(file + ' — lokální ukázkový soubor.')}><Folder size={14}/>{file}</button>)}<div className="file-evidence"><b>COLLECTED EVIDENCE</b>{evidence.length ? evidence.map(item => <code key={item}>{item}</code>) : <small>Žádné důkazy. Použij evidence add &lt;název&gt; v PowerShellu.</small>}</div></div>}
          {activeApp === 'knowledge' && <div className="desktop-window knowledge-window"><div className="desktop-window-title"><span><BookOpen size={14}/> Knowledge Base</span><span>FIELD MANUAL / 01</span></div><h3>PowerShell pro bezpečnostní průzkum</h3><article><b>whoami</b><p>Vypíše aktuální účet. Před prací ověř, pod jakou identitou příkazy spouštíš.</p></article><article><b>ipconfig</b><p>Zobrazí síťová rozhraní, IP adresy, masku a výchozí bránu.</p></article><article><b>nslookup &lt;host&gt;</b><p>Dotáže DNS resolver a přeloží doménové jméno na IP adresu.</p></article><article><b>nmap -sV &lt;host&gt;</b><p>V laboratoři simuluje zjištění otevřených portů a identifikaci verzí služeb. -sV znamená detekci verzí.</p></article><article><b>curl -I &lt;url&gt;</b><p>Načte pouze hlavičky HTTP odpovědi. Učí číst status kód a metadata serveru.</p></article></div>}
          {activeApp === 'monitor' && <div className="desktop-window monitor-window"><div className="desktop-window-title"><span><Activity size={14}/> Network Monitor</span><span>CAPTURE: SIMULATED</span></div><div className="monitor-metric"><b>10.20.0.15</b><span>OPERATOR WORKSTATION</span></div><div className="monitor-metric"><b>10.20.0.24</b><span>{mission.target}</span></div><div className="monitor-packet"><span>21:04:12</span> DNS query → staging.noname-logistics.test</div><div className="monitor-packet"><span>21:04:13</span> TCP SYN → 10.20.0.24:443</div><div className="monitor-packet"><span>21:04:14</span> TLS handshake → nginx/1.24.0</div><div className="monitor-packet"><span>21:04:15</span> HTTP GET /api/docs → 200 OK</div></div>}
        </div>
        <div className="desktop-taskbar"><button className="task-start" onClick={() => setNotice('Start menu: aplikace jsou dostupné na ploše.')}>⊞</button>{openApps.map(app => { const item = appDefs.find(x => x.id === app)!; return <button key={app} className={activeApp === app ? 'active' : ''} onClick={() => openApp(app)}><item.icon size={14}/>{item.label}</button>; })}<span className="task-clock">BH-LAB · 21:14 · SECURE SESSION</span></div>
      </div></div>
      <div className="laptop-hinge"/><div className="laptop-base"><div className="laptop-trackpad"/></div>
      <div className="lab-below"><div className="lab-objectives"><div><b>MISSION OBJECTIVES</b><span>{objectiveIndex}/{mission.objectives.length} COMPLETE</span></div>{mission.objectives.map((item, index) => <div key={item} className={completed.includes(mission.id + ':' + index) ? 'done' : ''}><CheckCircle2 size={14}/><span>{item}</span></div>)}</div><div className="lab-coach"><div><BookOpen size={15}/> LEARN WHILE YOU PLAY</div><p>{mission.id === 'recon-01' ? 'Tip: Nejdřív si ověř vlastní síťové nastavení. Potom přelož DNS jméno a až následně zkoumej porty. Tento postup ti pomůže odlišit problém DNS od nedostupné služby.' : mission.id === 'web-02' ? 'Tip: HTTP hlavičky často prozradí server, typ obsahu nebo bezpečnostní konfiguraci. Samotná dostupnost dokumentace ještě automaticky neznamená kritickou zranitelnost — důležitý je její obsah a dopad.' : 'Tip: Při incident response zachovej původní důkazy. Zaznamenej čas, zdroj, integritu a kontext každého artefaktu.'}</p><small>CONCEPTS: DNS · TCP · PORTS · SERVICE FINGERPRINTING</small></div></div>
      {notice && <div className="lab-notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    </div>}
    <div className="lab-disclaimer"><ShieldCheck size={13}/> {cs ? 'Všechny příkazy, cíle a síťové výstupy jsou simulované. Notebook neprovádí skutečné síťové operace.' : 'All commands, targets and network outputs are simulated. The laptop performs no real network operations.'}</div>
  </section>;
}
