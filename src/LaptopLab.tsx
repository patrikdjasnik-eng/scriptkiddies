import { useMemo, useState } from 'react';
import { Activity, BookOpen, Bug, CheckCircle2, Code2, FileText, Folder, Globe2, HardDrive, Monitor, Network, Play, Power, Search, ShieldCheck, Terminal, Wifi, X } from 'lucide-react';

type AppId = 'powershell' | 'editor' | 'browser' | 'files' | 'knowledge' | 'monitor' | 'toolkit' | 'help' | 'search' | 'bounty';
type Mission = { id: string; title: string; brief: string; target: string; reward: number; objectives: string[] };
type Line = { text: string; tone?: 'good' | 'warn' | 'error' | 'muted' };
const missions: Mission[] = [
  { id: 'recon-01', title: 'První průzkum infrastruktury', brief: 'Zmapuj staging server logistické společnosti. Zjisti jeho adresu, dostupné porty a běžící služby. Nakonec ulož důkaz.', target: 'staging.noname-logistics.test', reward: 180, objectives: ['Zkontroluj identitu operátora (whoami).', 'Zjisti síťovou konfiguraci (ipconfig).', 'Vyřeš DNS záznam cíle (nslookup).', 'Proveď simulovaný scan portů a verzí (nmap).', 'Ulož důkaz do evidence.'] },
  { id: 'web-02', title: 'Odhalená API dokumentace', brief: 'Prověř webovou aplikaci. Najdi veřejně dostupnou dokumentaci API, vyhodnoť dopad a připrav bezpečnostní doporučení.', target: 'staging.noname-logistics.test', reward: 320, objectives: ['Otevři webový cíl v Browseru.', 'Prohlédni HTTP hlavičky (curl -I).', 'Najdi veřejnou dokumentaci (/api/docs).', 'Zaznamenej nález jako důkaz.', 'Odevzdej závěrečný report.'] },
  { id: 'ir-03', title: 'Noční incident', brief: 'Vyšetři podezřelou aktivitu na pracovním serveru. Projdi dostupné logy, sestav časovou osu a identifikuj podezřelý proces.', target: 'workstation-07.lab', reward: 420, objectives: ['Otevři složku s incidentními logy.', 'Prohledej authentication.log.', 'Identifikuj podezřelý proces.', 'Vytvoř forenzní důkaz.', 'Odevzdej incidentní report.'] },
  { id: 'idor-04', title: 'Cizí zásilka', brief: 'Ověř autorizaci API v izolovaném e-shopu. Porovnej dva testovací účty a zjisti, zda lze zobrazit cizí objednávku.', target: 'api.greencart.test', reward: 360, objectives: ['Otevři API klienta a načti testovací profil.', 'Proveď požadavek na vlastní objednávku.', 'Porovnej autorizaci druhého testovacího účtu.', 'Ulož minimální důkaz bez citlivých dat.', 'Odevzdej report s opravou.'] },
  { id: 'sqli-05', title: 'Podezřelý parametr', brief: 'Analyzuj chování parametru v lokální demonstrační aplikaci. Rozliš chybu validace od skutečného bezpečnostního dopadu.', target: 'catalog.greencart.test', reward: 440, objectives: ['Prohlédni endpoint katalogu.', 'Zkontroluj běžnou odpověď aplikace.', 'Spusť bezpečnou laboratorní kontrolu SQL indikátoru.', 'Vysvětli dopad a ulož důkaz.', 'Odevzdej report.'] },
  { id: 'cloud-06', title: 'Veřejný sklad souborů', brief: 'Prověř fiktivní cloudové úložiště. Najdi veřejný bucket, zkontroluj metadata a navrhni bezpečnou konfiguraci.', target: 'files.cloudnote.test', reward: 520, objectives: ['Vyhledej informace o cloud storage v BH Search.', 'Proveď simulovanou kontrolu bucketu.', 'Zkontroluj veřejná oprávnění.', 'Ulož konfigurační důkaz.', 'Odevzdej doporučení.'] },
  { id: 'wifi-07', title: 'Rádiové ticho', brief: 'Analyzuj připravený Wi-Fi capture a vysvětli, co lze a nelze z metadat handshake vyvodit.', target: 'wireless-lab.local', reward: 280, objectives: ['Otevři katalog wireless nástrojů.', 'Analyzuj syntetický handshake capture.', 'Prohlédni související pakety.', 'Ulož analytický záznam.', 'Odevzdej závěry.'] },
  { id: 'api-08', title: 'Zapomenutý token', brief: 'Prozkoumej bezpečnost API tokenů v sandboxu. Identifikuj nadměrná oprávnění a doporuč rotaci a omezení scope.', target: 'auth.cloudnote.test', reward: 480, objectives: ['Otevři dokumentaci autentizace.', 'Zkontroluj metadata demonstračního tokenu.', 'Vyhodnoť jeho oprávnění.', 'Zaznamenej bezpečný důkaz.', 'Odevzdej report.'] }
];

const internetArticles = [
  { title: 'Bug bounty: jak začít bezpečně a legálně', category: 'START HERE', tags: 'bug bounty scope authorization beginner', excerpt: 'Rozdíl mezi vulnerability research a neautorizovaným testováním. Jak číst scope, pravidla programu a safe harbor.', body: 'Než začneš testovat, přečti celý scope. Ověř povolené domény, IP rozsahy, zakázané techniky, časová omezení a pravidla pro práci s daty. Testuj pouze aktiva výslovně uvedená v programu. Pokud je něco nejasné, zeptej se provozovatele.' },
  { title: 'HTTP status codes a bezpečnostní hlavičky', category: 'WEB SECURITY', tags: 'http headers status code csp hsts x-frame-options', excerpt: 'Praktický přehled HTTP odpovědí, CSP, HSTS a dalších hlaviček.', body: 'HTTP 200 znamená úspěšnou odpověď, 401 chybějící autentizaci, 403 zákaz přístupu a 404 nenalezený zdroj. Bezpečnostní hlavičky jako Content-Security-Policy a Strict-Transport-Security pomáhají omezit některé třídy útoků. Chybějící hlavička sama o sobě nemusí být reportovatelná zranitelnost.' },
  { title: 'IDOR a Broken Access Control', category: 'WEB VULNERABILITIES', tags: 'idor b access control authorization api object reference', excerpt: 'Jak chápat chyby autorizace a bezpečně ověřit oddělení uživatelských dat.', body: 'IDOR vzniká, když aplikace zpřístupní objekt podle identifikátoru bez kontroly oprávnění. V autorizovaném labu porovnej přístup dvou syntetických účtů. Nikdy nezkoušej cizí reálná data. Důkaz má ukazovat chybu autorizace, nikoliv obsah citlivých záznamů.' },
  { title: 'Subdomain enumeration – metodika', category: 'RECON', tags: 'recon dns subdomain enumeration nmap scope', excerpt: 'Pasivní a aktivní průzkum, DNS záznamy a kontrola rozsahu programu.', body: 'Začni rozsahem programu a pasivními zdroji. Každý nalezený hostname ověř proti scope. DNS záznam není automaticky povolením k testování. Eviduj zdroj objevu, čas a stav ověření.' },
  { title: 'Jak napsat kvalitní vulnerability report', category: 'REPORTING', tags: 'report cvss impact reproduction steps remediation', excerpt: 'Struktura reportu: shrnutí, dopad, reprodukce, důkaz a doporučená oprava.', body: 'Dobrý report obsahuje jasný titulek, stručné shrnutí, dotčené aktivum, předpoklady, kroky reprodukce v povoleném prostředí, očekávané a skutečné chování, bezpečný důkaz dopadu, závažnost s odůvodněním a návrh nápravy.' },
  { title: 'Wi-Fi security: WPA2 handshake v PCAP', category: 'WIRELESS', tags: 'wifi wireless aircrack handshake pcap wpa2', excerpt: 'Co lze vyčíst z metadat zachyceného handshake a jak funguje laboratorní analýza.', body: 'Handshake je součást procesu navázání zabezpečeného spojení. V této výukové laboratoři analyzujeme pouze syntetický PCAP a metadata rámců. Skutečné zachytávání provozu a testování bez výslovného oprávnění není součástí cvičení.' }
];
const bountyPrograms = [
  { name: 'NoName Logistics', domain: '*.noname-logistics.test', level: 'BEGINNER', reward: '100–800 XP', scope: 'Web portal, staging API, test accounts', description: 'Fiktivní logistická platforma. Nauč se hledat chyby v API, přístupových právech a konfiguraci.' },
  { name: 'GreenCart', domain: 'shop.greencart.test', level: 'BEGINNER', reward: '150–1 000 XP', scope: 'E-shop, katalog a uživatelský profil', description: 'Trénink autorizace, validace vstupů a bezpečnostních hlaviček.' },
  { name: 'CloudNote', domain: '*.cloudnote.test', level: 'INTERMEDIATE', reward: '300–2 000 XP', scope: 'Poznámková aplikace a sdílení dokumentů', description: 'Pokročilejší scénáře IDOR, session managementu a ukládání souborů.' }
];

const initialLines: Line[] = [
  { text: 'Windows PowerShell', tone: 'good' },
  { text: 'Copyright (C) Microsoft Corporation. Všechna práva vyhrazena.', tone: 'muted' },
  { text: 'BH-LAB PROFILE: isolated training workstation', tone: 'muted' },
  { text: 'Napiš help a zobraz dostupné příkazy.', tone: 'muted' },
  { text: '' }
];
const files = ['Desktop/', 'Documents/', 'Downloads/', 'evidence/', 'logs/', 'captures/', 'notes.txt', 'recon.ps1'];
const toolGroups = [
  { title: 'RECON & NETWORK', tools: [
    { name: 'nmap', summary: 'Porty a detekce služeb', example: 'nmap -sV staging.noname-logistics.test' },
    { name: 'dig', summary: 'DNS dotazy a záznamy', example: 'dig staging.noname-logistics.test' },
    { name: 'whois', summary: 'Registrační metadata domény', example: 'whois noname-logistics.test' },
    { name: 'traceroute', summary: 'Simulace síťové cesty', example: 'traceroute staging.noname-logistics.test' }
  ]},
  { title: 'WEB APPLICATION SECURITY', tools: [
    { name: 'gobuster', summary: 'Hledání známých cest v lab webu', example: 'gobuster dir -u http://staging.noname-logistics.test' },
    { name: 'nikto', summary: 'Kontrola běžných webových chyb', example: 'nikto -h staging.noname-logistics.test' },
    { name: 'sqlmap', summary: 'Výuková analýza SQL injection indikátoru', example: 'sqlmap -u http://staging.noname-logistics.test/item?id=1' },
    { name: 'burpsuite', summary: 'Prohlížení zachyceného HTTP požadavku', example: 'burpsuite --open lab-request' }
  ]},
  { title: 'WIRELESS & FORENSICS', tools: [
    { name: 'aircrack-ng', summary: 'Analýza metadat syntetického Wi-Fi capture', example: 'aircrack-ng --analyze lab-handshake.cap' },
    { name: 'wireshark', summary: 'Otevření připraveného PCAP z laboratoře', example: 'wireshark lab-traffic.pcap' },
    { name: 'tshark', summary: 'Textový přehled paketů z lab PCAP', example: 'tshark -r lab-traffic.pcap' },
    { name: 'yara', summary: 'Vyhledání výukových indikátorů v artefaktech', example: 'yara lab-rules.yar logs/' }
  ]},
  { title: 'PASSWORD AUDITING & ANALYSIS', tools: [
    { name: 'john', summary: 'Audit ukázkových hashů – pouze syntetická sada', example: 'john --show lab-demo-hashes.txt' },
    { name: 'hashcat', summary: 'Kontrola stavu demonstrační hash sady', example: 'hashcat --show lab-demo-hashes.txt' },
    { name: 'strings', summary: 'Čitelné řetězce ve výukovém souboru', example: 'strings evidence/sample.bin' },
    { name: 'sha256sum', summary: 'Kontrolní otisk důkazního souboru', example: 'sha256sum evidence/sample.bin' }
  ]}
];

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
  const [earnedXp, setEarnedXp] = useState(0);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [showBeginnerTips, setShowBeginnerTips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<(typeof internetArticles)[number] | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [registeredProfile, setRegisteredProfile] = useState<{name:string; email:string; handle:string} | null>(() => {
    try { const saved = localStorage.getItem('bh-lab-bounty-profile'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [joinedPrograms, setJoinedPrograms] = useState<string[]>([]);
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
      add({ text: 'ZÁKLADNÍ PŘÍKAZY', tone: 'good' }, { text: 'whoami · pwd · ls · cd · ipconfig · nslookup <host>' }, { text: 'nmap · dig · whois · gobuster · nikto · sqlmap · burpsuite' }, { text: 'aircrack-ng --analyze · wireshark · tshark · john --show · hashcat --show' }, { text: 'help <nástroj> zobrazí vysvětlení · toolkit otevře katalog nástrojů · guide otevře průvodce' }, { text: 'Příkazy pracují pouze se syntetickými daty této výukové laboratoře.', tone: 'muted' });
    } else if (lower === 'toolkit') {
      setActiveApp('toolkit');
      add({ text: 'Otevírám katalog výukových nástrojů.', tone: 'good' });
    } else if (lower === 'google' || lower === 'search') {
      setActiveApp('search');
      add({ text: 'Otevírám BH Search — lokální znalostní index.', tone: 'good' });
    } else if (lower === 'bounty' || lower === 'hackerone') {
      setActiveApp('bounty');
      add({ text: 'Otevírám BH Bounty Hub — simulované programy.', tone: 'good' });
    } else if (lower === 'guide' || lower === 'beginner') {
      setActiveApp('help');
      add({ text: 'Otevírám průvodce pro začátečníky.', tone: 'good' });
    } else if (lower.startsWith('help ')) {
      const name = lower.slice(5).trim();
      const descriptions: Record<string, string> = {
        nmap: 'Nmap mapuje dostupné porty a služby. V tomto labu: nmap -sV staging.noname-logistics.test',
        dig: 'dig se ptá DNS a zobrazuje záznamy. V tomto labu: dig staging.noname-logistics.test',
        gobuster: 'Gobuster hledá běžné cesty webu ve schváleném cíli. V tomto labu: gobuster dir -u http://staging.noname-logistics.test',
        aircrack: 'Aircrack-ng zde pouze analyzuje syntetický capture a vysvětlí metadata handshake. Neprovádí zachytávání provozu ani lámání hesel.',
        'aircrack-ng': 'Aircrack-ng zde pouze analyzuje syntetický capture a vysvětlí metadata handshake. Neprovádí zachytávání provozu ani lámání hesel.',
        wireshark: 'Wireshark je analyzátor paketů. V labu otevři připravený soubor: wireshark lab-traffic.pcap',
        sqlmap: 'sqlmap automatizuje testování SQL injection. Tato mise pouze vysvětluje indikátory na syntetické odpovědi.',
        john: 'John the Ripper umí auditovat heslové hashe. Zde pracuje jen s demonstrační sadou: john --show lab-demo-hashes.txt'
      };
      add({ text: descriptions[name] ?? 'Nástroj není v rychlé nápovědě. Otevři toolkit a vyber kategorii.', tone: descriptions[name] ? 'good' : 'warn' });
    } else if (lower === 'whoami') {
      add({ text: 'bh-lab\\operator' }); if (mission?.id === 'recon-01') mark(0);
    } else if (lower === 'pwd') {
      add({ text: 'C:\\Users\\operator' });
    } else if (lower === 'ls' || lower === 'dir' || lower === 'get-childitem') {
      add(...files.map(name => ({ text: name }))); if (mission?.id === 'ir-03') mark(0);
    } else if (lower === 'ipconfig' || lower === 'ipconfig /all') {
      add({ text: 'Ethernet adapter LabNet:' }, { text: '   IPv4 Address . . . . . . . . . : 10.20.0.15' }, { text: '   Subnet Mask  . . . . . . . . . : 255.255.255.0' }, { text: '   Default Gateway . . . . . . . : 10.20.0.1' }); if (mission?.id === 'recon-01') mark(1);
    } else if (lower.startsWith('nslookup ')) {
      const host = command.slice(8).trim().toLowerCase();
      if (host === 'staging.noname-logistics.test' || host === 'noname-logistics.test') {
        add({ text: 'Server:  resolver.lab', tone: 'muted' }, { text: 'Name:    ' + host }, { text: 'Address: 10.20.0.24', tone: 'good' }); if (mission?.id === 'recon-01') mark(2);
      } else add({ text: '*** resolver.lab: NXDOMAIN', tone: 'warn' });
    } else if (lower.startsWith('nmap ')) {
      if (!lower.includes('staging.noname-logistics.test') && !lower.includes('10.20.0.24')) add({ text: 'Cíl není v inventáři této mise. Nejprve ověř DNS a rozsah.', tone: 'error' });
      else {
        add({ text: 'Starting Nmap 7.94 ( SIMULATED LAB BUILD )' }, { text: 'Host is up (0.012s simulated latency).' }, { text: 'PORT     STATE SERVICE  VERSION' }, { text: '22/tcp   open  ssh      OpenSSH 9.2' }, { text: '80/tcp   open  http     nginx 1.24.0' }, { text: '443/tcp  open  https    nginx 1.24.0' }, { text: '3000/tcp open  http     Node.js API (simulated)' }, { text: 'Scan complete: 1 host, 4 open ports.', tone: 'good' }); if (mission?.id === 'recon-01') mark(3);
      }
    } else if (lower.startsWith('curl ')) {
      if (lower.includes('/api/docs') || lower.includes('staging.noname-logistics.test')) {
        add({ text: 'HTTP/1.1 200 OK', tone: 'good' }, { text: 'server: nginx/1.24.0' }, { text: 'content-type: text/html; charset=utf-8' }, { text: 'x-lab-route: /api/docs' }, { text: 'Simulovaná odpověď: API documentation is publicly accessible.', tone: 'warn' });
        if (mission?.id === 'web-02') mark(2);
      } else add({ text: 'curl: URL není součástí lokálního labu.', tone: 'error' });
      if (lower.includes('-i')) mark(1);
    } else if (lower.startsWith('api get /me') || lower.startsWith('curl /api/me')) {
      add({ text: 'HTTP/1.1 200 OK · account=researcher-a · role=customer', tone: 'good' }, { text: 'order_ids: [GC-1042] · owner: researcher-a' });
      if (mission?.id === 'idor-04') mark(0);
    } else if (lower.startsWith('api get /orders/')) {
      const id = lower.split('/').pop();
      if (id === 'gc-1042') {
        add({ text: 'HTTP/1.1 200 OK · order=GC-1042 · owner=researcher-a', tone: 'good' });
        if (mission?.id === 'idor-04') mark(1);
      } else if (id === 'gc-2044') {
        add({ text: 'HTTP/1.1 200 OK · order=GC-2044 · owner=researcher-b', tone: 'warn' }, { text: 'LAB FINDING: account A can read account B order. Synthetic record contains no real personal data.' });
        if (mission?.id === 'idor-04') mark(2);
      } else add({ text: 'HTTP/1.1 404 Not Found' });
    } else if (lower === 'cloud-audit files.cloudnote.test') {
      add({ text: 'CLOUD STORAGE CONFIG AUDIT · SIMULATED', tone: 'good' }, { text: 'Bucket: cloudnote-public-demo' }, { text: 'Public listing: ENABLED', tone: 'warn' }, { text: 'Write access: DISABLED' }, { text: 'Object metadata: sample-report.pdf · no user data' });
      if (mission?.id === 'cloud-06') mark(1);
    } else if (lower === 'cloud-acl cloudnote-public-demo') {
      add({ text: 'ACL: READ=ANONYMOUS · WRITE=DENIED · LIST=ANONYMOUS', tone: 'warn' }, { text: 'Recommendation: disable public listing; grant least-privilege access.' });
      if (mission?.id === 'cloud-06') mark(2);
    } else if (lower === 'token inspect demo-token') {
      add({ text: 'TOKEN: demo-token · issuer=cloudnote-lab · expires=never (fixture)', tone: 'warn' }, { text: 'Scopes: files:read · files:write · users:read · admin:settings', tone: 'warn' }, { text: 'Finding: excessive privileges and missing expiry in synthetic token.' });
      if (mission?.id === 'api-08') mark(1);
    } else if (lower === 'token explain') {
      add({ text: 'Least privilege: issue only required scopes, set short expiry, rotate credentials and audit usage.' });
      if (mission?.id === 'api-08') mark(2);
    } else if (lower === 'sql-lab check catalog?id=1') {
      add({ text: 'HTTP 200 · item=1 · query parameter accepted', tone: 'good' }, { text: 'Baseline response captured.' });
      if (mission?.id === 'sqli-05') mark(1);
    } else if (lower === 'sql-lab analyze') {
      add({ text: 'SQLi LAB ANALYSIS · synthetic boolean differential detected', tone: 'warn' }, { text: 'True fixture: 200 / 1 result · False fixture: 200 / 0 results' }, { text: 'No payload sent to a real database. Confirm impact only in authorized environments.' });
      if (mission?.id === 'sqli-05') mark(2);
    } else if (lower === 'report draft') {
      add({ text: 'REPORT DRAFT CREATED', tone: 'good' }, { text: 'Summary · affected asset · reproduction · impact · remediation' });
      if (mission) mark(mission.objectives.length - 2);
    } else if (lower === 'wireless summary') {
      add({ text: 'Capture: lab-handshake.cap · WPA2 · handshake frames present · synthetic AP only', tone: 'good' }, { text: 'Limitations: metadata does not reveal a password or prove exploitability.' });
      if (mission?.id === 'wifi-07') mark(2);
    } else if (lower.startsWith('dig ') || lower.startsWith('whois ') || lower.startsWith('traceroute ')) {
      const host = command.split(/\s+/).pop() ?? 'staging.noname-logistics.test';
      if (!host.endsWith('.test') && !host.endsWith('.lab')) add({ text: 'Rozsah blokován: povoleny jsou pouze fiktivní lab domény.', tone: 'error' });
      else if (lower.startsWith('dig ')) add({ text: '; <<>> DiG SIMULATED <<>> ' + host }, { text: host + ' 60 IN A 10.20.0.24', tone: 'good' }, { text: 'DNSSEC: lab fixture · TTL: 60' });
      else if (lower.startsWith('whois ')) add({ text: 'Domain: ' + host }, { text: 'Registrant: NoName Logistics (fictional training data)' }, { text: 'Status: LAB-ONLY · No public registration lookup' });
      else add({ text: '10.20.0.1  gateway.lab  1.2 ms' }, { text: '10.20.0.24 staging.lab  4.8 ms', tone: 'good' }, { text: 'Route generated from the isolated lab topology.' });
    } else if (lower.startsWith('gobuster ')) {
      add({ text: 'Gobuster SIMULATED directory enumeration', tone: 'good' }, { text: '/api/docs          (Status: 200)' }, { text: '/api/v1            (Status: 200)' }, { text: '/admin             (Status: 403)' }, { text: '/uploads           (Status: 301)' }, { text: 'Found 4 paths in local fixture.' });
      if (mission?.id === 'web-02') mark(2);
    } else if (lower.startsWith('nikto ')) {
      add({ text: 'Nikto SIMULATED web configuration review', tone: 'good' }, { text: '+ Server: nginx/1.24.0' }, { text: '+ X-Content-Type-Options header missing (training finding)', tone: 'warn' }, { text: '+ /api/docs is publicly reachable (verify business impact)', tone: 'warn' });
    } else if (lower.startsWith('sqlmap ')) {
      add({ text: 'sqlmap SIMULATED educational check', tone: 'good' }, { text: 'Parameter: id' }, { text: 'Technique: boolean-based indicator in synthetic response' }, { text: 'No exploit payloads executed. Review the lesson and evidence before reporting.', tone: 'warn' });
    } else if (lower.startsWith('burpsuite')) {
      add({ text: 'Burp Suite training proxy opened: lab-request', tone: 'good' }, { text: 'GET /api/docs HTTP/1.1' }, { text: 'Host: staging.noname-logistics.test' }, { text: 'Response fixture: HTTP/1.1 200 OK' });
    } else if (lower.startsWith('aircrack-ng')) {
      if (!lower.includes('--analyze') || !lower.includes('lab-handshake.cap')) add({ text: 'Použij pouze připravený soubor: aircrack-ng --analyze lab-handshake.cap', tone: 'warn' });
      else add({ text: 'Aircrack-ng LAB ANALYZER · SYNTHETIC CAPTURE', tone: 'good' }, { text: 'File: lab-handshake.cap · 184 packets · 1 fictional access point' }, { text: 'SSID: BH-TRAINING · BSSID: 02:00:00:00:00:01' }, { text: 'WPA2 handshake metadata: PRESENT · frame sequence: CONSISTENT', tone: 'good' }, { text: 'Educational note: this exercise inspects capture metadata only. No real Wi-Fi capture, deauthentication or password cracking is performed.', tone: 'muted' });
    } else if (lower.startsWith('wireshark ') || lower.startsWith('tshark ')) {
      add({ text: 'PCAP ANALYSIS · lab-traffic.pcap', tone: 'good' }, { text: '21:04:12 DNS query staging.noname-logistics.test' }, { text: '21:04:13 TCP SYN 10.20.0.15 → 10.20.0.24:443' }, { text: '21:04:14 TLS handshake completed' }, { text: '21:04:15 HTTP GET /api/docs → 200 OK' });
    } else if (lower.startsWith('john ') || lower.startsWith('hashcat ')) {
      if (!lower.includes('lab-demo-hashes.txt') || !lower.includes('--show')) add({ text: 'Použij pouze syntetickou sadu: john --show lab-demo-hashes.txt nebo hashcat --show lab-demo-hashes.txt', tone: 'warn' });
      else add({ text: 'DEMO HASH AUDIT · SYNTHETIC TRAINING SET', tone: 'good' }, { text: '2 demo records · 1 marked as weak training example' }, { text: 'Výsledek je předpřipravený pro výuku. Neprobíhá útok na skutečné účty ani hash databázi.', tone: 'muted' });
    } else if (lower.startsWith('yara ')) {
      add({ text: 'YARA SIMULATED SCAN', tone: 'good' }, { text: 'Rule: Suspicious_Persistence_Artifact' }, { text: 'Match: logs/updater_tmp.log · training indicator only', tone: 'warn' });
    } else if (lower.startsWith('strings ') || lower.startsWith('sha256sum ')) {
      add({ text: lower.startsWith('strings ') ? 'BH-LAB SAMPLE · benign marker · training artifact' : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  evidence/sample.bin', tone: 'good' });
    } else if (lower === 'cat authentication.log' || lower === 'get-content logs/authentication.log') {
      add({ text: '21:04:12 AUTH_FAIL user=svc_backup src=10.20.0.44' }, { text: '21:04:18 AUTH_FAIL user=svc_backup src=10.20.0.44' }, { text: '21:05:02 AUTH_SUCCESS user=svc_backup src=10.20.0.44', tone: 'warn' });
      if (mission?.id === 'ir-03') mark(1);
    } else if (lower === 'get-process' || lower === 'ps') {
      add({ text: 'ProcessName       Id     CPU' }, { text: 'explorer          1840   00:01' }, { text: 'powershell        2912   00:02' }, { text: 'updater_tmp       4088   18:42', tone: 'warn' });
      if (mission?.id === 'ir-03') mark(2);
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
        if (submitted.includes(mission.id)) { add({ text: 'Tato mise už byla odevzdána.', tone: 'warn' }); return; }
        mark(mission.objectives.length - 1);
        setSubmitted(old => [...old, mission.id]);
        setEarnedXp(old => old + mission.reward);
        add({ text: 'MISSION SUBMITTED — vyhodnocení dokončeno. +' + mission.reward + ' XP', tone: 'good' });
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
    script.split(/\r?\n/).forEach(raw => {
      const line = raw.trim();
      if (!line || line.startsWith('#')) return;
      const hostMatch = line.match(/^(?:\$target|\$host)\s*=\s*["']([^"']+)["']$/i);
      const printMatch = line.match(/^Write-Host\s+["'](.*)["']$/i);
      const printVar = line.match(/^Write-Host\s+\$(target|host)$/i);
      if (hostMatch) output.push('[proměnná nastavena] ' + hostMatch[1]);
      else if (printMatch) output.push(printMatch[1]);
      else if (printVar) output.push(target);
      else if (/^Resolve-DnsName\s+\$target$/i.test(line)) output.push('Name: ' + target + ' · IPAddress: 10.20.0.24 (simulováno)');
      else output.push('Řádek přeskočen — příkaz není v podporované sadě: ' + line);
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
    { id: 'monitor', label: 'Network Monitor', icon: Activity, hint: 'Simulovaná síťová telemetrie' },
    { id: 'toolkit', label: 'Kali Toolkit', icon: HardDrive, hint: 'Katalog bezpečnostních nástrojů' },
    { id: 'help', label: 'Beginner Guide', icon: BookOpen, hint: 'Průvodce krok za krokem' },
    { id: 'search', label: 'BH Search', icon: Search, hint: 'Vyhledávač bezpečnostních znalostí' },
    { id: 'bounty', label: 'BH Bounty Hub', icon: Bug, hint: 'Simulovaná platforma bug bounty' }
  ];
  return <section className="laptop-lab">
    <div className="lab-intro"><div><span className="lab-kicker">BOUNTY HUNTER // FIELD WORKSTATION</span><h2>{cs ? 'Vyber misi a připrav pracovní stanici' : 'Select a mission and prepare your workstation'}</h2><p>{cs ? 'Každá mise se řeší přímo v simulovaném notebooku. Otevírej aplikace, používej příkazy, piš skripty a sbírej důkazy.' : 'Every mission is completed inside a simulated laptop. Open apps, use commands, write scripts and collect evidence.'}</p></div><div className="lab-online"><i/> LOCAL VM ONLINE<br/><span>SKILL XP: {earnedXp}</span></div></div>
    {!mission ? <div className="lab-mission-select">{missions.map((item, index) => <button key={item.id} className="lab-mission-card" onClick={() => chooseMission(item.id)}><span className="lab-mission-number">0{index + 1} / CONTRACT</span><h3>{item.title}</h3><p>{item.brief}</p><div><span>{item.target}</span><b>+{item.reward} XP <Play size={13}/></b></div></button>)}</div> :
    <div className="laptop-shell">
      <div className="laptop-bezel"><div className="laptop-camera"/><div className="laptop-screen">
        <div className="desktop-topbar"><span><Monitor size={13}/> BH-LAB WORKSTATION</span><span><i/> VM CONNECTED · {mission.id.toUpperCase()}</span><button onClick={() => setMissionId(null)}><X size={13}/> {cs ? 'ZAVŘÍT MISI' : 'CLOSE MISSION'}</button></div>
        <div className="desktop-area">
          <div className="desktop-icons">{appDefs.map(app => <button key={app.id} onClick={() => openApp(app.id)} className={activeApp === app.id ? 'selected' : ''}><span><app.icon size={22}/></span><b>{app.label}</b></button>)}</div>
          <div className="desktop-mission-widget"><small>ACTIVE CONTRACT</small><b>{mission.title}</b><span>{mission.target}</span><div className="mission-progress"><i style={{ width: progress + '%' }}/></div><small>{objectiveIndex}/{mission.objectives.length} OBJECTIVES · {progress}%</small></div>
          {activeApp === 'powershell' && <div className="desktop-window terminal-window"><div className="desktop-window-title"><span><Terminal size={14}/> Windows PowerShell</span><div><button onClick={() => setLines(initialLines)}>↻</button><button onClick={() => setActiveApp('powershell')}>—</button><button onClick={() => setActiveApp('monitor')}>×</button></div></div><div className="powershell-output">{lines.map((line, i) => <div key={i} className={line.tone ?? ''}>{line.text || '\u00a0'}</div>)}</div><form className="powershell-input" onSubmit={e => { e.preventDefault(); runCommand(input); setInput(''); }}><span>{prompt}</span><input autoComplete="off" spellCheck={false} value={input} onChange={e => setInput(e.target.value)} placeholder="help"/><button><Play size={12}/></button></form></div>}
          {activeApp === 'editor' && <div className="desktop-window editor-window"><div className="desktop-window-title"><span><Code2 size={14}/> Script Lab — recon.ps1</span><button onClick={runScript}><Play size={12}/> RUN SCRIPT</button></div><div className="editor-help">PowerShell mini-runner · podporované konstrukce: Write-Host, proměnné $target a Resolve-DnsName.</div><textarea spellCheck={false} value={script} onChange={e => setScript(e.target.value)}/><div className="script-output">{scriptOutput.map((line, i) => <div key={i}>{line}</div>)}</div></div>}
          {activeApp === 'browser' && <div className="desktop-window browser-window"><div className="desktop-window-title"><span><Globe2 size={14}/> BH Browser</span><span>LOCAL LAB ONLY</span></div><div className="browser-address"><Search size={13}/><input value={url} onChange={e => setUrl(e.target.value)}/><button onClick={() => { setNotice('Stránka načtena z lokální simulace.'); if (mission.id === 'web-02') mark(0); }}>GO</button></div><div className="browser-page"><div className="browser-brand">NONAME <b>LOGISTICS</b></div><h3>{url.includes('/api/docs') ? 'API Documentation' : 'Shipment Portal'}</h3><p>{url.includes('/api/docs') ? 'OpenAPI 3.0 · Internal shipment and tracking endpoints' : 'Track shipments, manage delivery preferences and view service status.'}</p><div className="browser-endpoints"><code>GET /api/v1/shipments/:id</code><code>GET /api/v1/tracking/:code</code><code>POST /api/v1/session</code></div><small>SIMULATED RESPONSE · HTTP 200</small></div></div>}

          {activeApp === 'search' && <div className="desktop-window internet-window"><div className="desktop-window-title"><span><Search size={14}/> BH Search <b className="fake-google">G</b></span><span>INDEX: LOCAL KNOWLEDGE WEB</span></div><div className="search-home"><div className="search-logo"><span>B</span>H Search</div><p>Vyhledávač znalostí pro bezpečnostní výzkumníky</p><form onSubmit={e => { e.preventDefault(); setSelectedArticle(null); }}><Search size={15}/><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Hledej třeba IDOR, Nmap, HTTP headers…"/><button>HLEDAT</button></form><div className="search-chips">{['bug bounty scope','IDOR','HTTP headers','Wi-Fi handshake','report'].map(q => <button key={q} onClick={() => {setSearchQuery(q);setSelectedArticle(null);}}>{q}</button>)}</div></div><div className="search-results">{selectedArticle ? <article className="search-article"><button className="back-results" onClick={() => setSelectedArticle(null)}>← ZPĚT NA VÝSLEDKY</button><small>{selectedArticle.category} · BH KNOWLEDGE BASE</small><h3>{selectedArticle.title}</h3><p>{selectedArticle.body}</p><div className="article-tags">{selectedArticle.tags}</div></article> : <>{(searchQuery.trim() ? internetArticles.filter(a => (a.title+' '+a.category+' '+a.tags+' '+a.excerpt).toLowerCase().includes(searchQuery.toLowerCase())) : internetArticles).map(a => <button className="search-result" key={a.title} onClick={() => setSelectedArticle(a)}><small>bh-search.local › knowledge › {a.category.toLowerCase().replaceAll(' ','-')}</small><b>{a.title}</b><span>{a.excerpt}</span></button>)}{searchQuery.trim() && !internetArticles.some(a => (a.title+' '+a.category+' '+a.tags+' '+a.excerpt).toLowerCase().includes(searchQuery.toLowerCase())) && <p className="empty-search">Nic jsme nenašli. Zkus obecnější výraz, například „recon“ nebo „report“.</p>}</>}</div><div className="internet-footer">BH SEARCH · FIKTIVNÍ INTERNET · {internetArticles.length} INDEXOVANÝCH ČLÁNKŮ</div></div>}
          {activeApp === 'bounty' && <div className="desktop-window bounty-window"><div className="desktop-window-title"><span><Bug size={14}/> BH Bounty Hub</span><span>COMMUNITY PLATFORM · SIMULATED</span></div><div className="bounty-scroll"><div className="bounty-hero"><div><small>BUG BOUNTY ECOSYSTEM</small><h3>Find bugs. Learn skills. Earn reputation.</h3><p>Fiktivní platforma inspirovaná bug bounty ekosystémy. Registrace i programy zůstávají pouze v tomto herním profilu.</p></div><div className="bounty-stat"><b>{joinedPrograms.length}</b><span>JOINED PROGRAMS</span></div></div>{registeredProfile ? <div className="bounty-profile"><div><small>RESEARCHER ACCOUNT</small><b>{registeredProfile.handle}</b><span>{registeredProfile.name} · {registeredProfile.email}</span></div><strong>ROOKIE RESEARCHER</strong></div> : <form className="bounty-register" onSubmit={e => {e.preventDefault(); const name=applicantName.trim(); const email=applicantEmail.trim(); if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {setNotice('Vyplň jméno a platnou demonstrační e-mailovou adresu.');return;} const profile={name,email,handle:'@'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}; setRegisteredProfile(profile); try{localStorage.setItem('bh-lab-bounty-profile',JSON.stringify(profile));}catch{} setNotice('Simulovaný výzkumnický účet byl vytvořen.');}}><div><b>Vytvořit výzkumnický účet</b><small>Registrace je lokální. Nic se neposílá na server.</small></div><label>DISPLAY NAME<input required maxLength={32} value={applicantName} onChange={e=>setApplicantName(e.target.value)} placeholder="např. packet_rabbit"/></label><label>EMAIL (DEMO)<input required type="email" maxLength={100} value={applicantEmail} onChange={e=>setApplicantEmail(e.target.value)} placeholder="researcher@example.test"/></label><button>CREATE ACCOUNT ↗</button></form>}<div className="bounty-program-heading"><b>AVAILABLE PROGRAMS</b><span>{bountyPrograms.length} FICTIONAL PROGRAMS</span></div><div className="bounty-programs">{bountyPrograms.map(p => <article key={p.name}><div className="program-top"><span>{p.level}</span><b>{p.reward}</b></div><h4>{p.name}</h4><code>{p.domain}</code><p>{p.description}</p><small>SCOPE: {p.scope}</small><button disabled={!registeredProfile || joinedPrograms.includes(p.name)} onClick={()=>{setJoinedPrograms(old=>[...old,p.name]);setNotice('Připojil ses k programu '+p.name+'. Před testováním si prostuduj scope.')}}>{joinedPrograms.includes(p.name)?'JOINED ✓':registeredProfile?'JOIN PROGRAM':'REGISTER TO JOIN'}</button></article>)}</div><div className="bounty-rules"><b>PROGRAM RULES</b><p>Všechny programy, domény, odměny i účty jsou smyšlené. Scope je součástí mise. V reálném bug bounty vždy dodržuj pravidla programu a testuj jen výslovně povolené cíle.</p></div></div></div>}
          {activeApp === 'files' && <div className="desktop-window files-window"><div className="desktop-window-title"><span><Folder size={14}/> File Explorer</span><span> C:\Users\operator</span></div>{files.map(file => <button key={file} onClick={() => file === 'evidence/' ? setNotice(evidence.length ? evidence.join(', ') : 'Evidence folder je zatím prázdná.') : setNotice(file + ' — lokální ukázkový soubor.')}><Folder size={14}/>{file}</button>)}<div className="file-evidence"><b>COLLECTED EVIDENCE</b>{evidence.length ? evidence.map(item => <code key={item}>{item}</code>) : <small>Žádné důkazy. Použij evidence add &lt;název&gt; v PowerShellu.</small>}</div></div>}
          {activeApp === 'knowledge' && <div className="desktop-window knowledge-window"><div className="desktop-window-title"><span><BookOpen size={14}/> Knowledge Base</span><span>FIELD MANUAL / 01</span></div><h3>PowerShell pro bezpečnostní průzkum</h3><article><b>whoami</b><p>Vypíše aktuální účet. Před prací ověř, pod jakou identitou příkazy spouštíš.</p></article><article><b>ipconfig</b><p>Zobrazí síťová rozhraní, IP adresy, masku a výchozí bránu.</p></article><article><b>nslookup &lt;host&gt;</b><p>Dotáže DNS resolver a přeloží doménové jméno na IP adresu.</p></article><article><b>nmap -sV &lt;host&gt;</b><p>V laboratoři simuluje zjištění otevřených portů a identifikaci verzí služeb. -sV znamená detekci verzí.</p></article><article><b>curl -I &lt;url&gt;</b><p>Načte pouze hlavičky HTTP odpovědi. Učí číst status kód a metadata serveru.</p></article></div>}
          {activeApp === 'toolkit' && <div className="desktop-window toolkit-window"><div className="desktop-window-title"><span><HardDrive size={14}/> Kali Toolkit // Lab Edition</span><span>TOOLS: SIMULATED</span></div><div className="toolkit-scroll">{toolGroups.map(group => <section key={group.title}><h4>{group.title}</h4><div className="toolkit-cards">{group.tools.map(tool => <article key={tool.name}><b>{tool.name}</b><p>{tool.summary}</p><code>{tool.example}</code><button onClick={() => { setInput(tool.example); setActiveApp('powershell'); setNotice(tool.name + ' — příkaz vložen do PowerShellu. Zkontroluj ho a spusť.'); }}>VLOŽIT DO TERMINÁLU ↗</button></article>)}</div></section>)}</div><div className="toolkit-safety">Nástroje jsou simulované a pracují pouze s předpřipravenými daty této laboratoře.</div></div>}
          {activeApp === 'help' && <div className="desktop-window help-window"><div className="desktop-window-title"><span><BookOpen size={14}/> Beginner Guide</span><span>START HERE</span></div><div className="help-scroll"><h3>První den v hackerské laboratoři</h3><p>Nemusíš znát příkazy nazpaměť. Postupuj pomalu: přečti zadání, otevři nápovědu, spusť jeden příkaz a zkus vysvětlit jeho výsledek.</p><label><input type="checkbox" checked={showBeginnerTips} onChange={e => setShowBeginnerTips(e.target.checked)}/> Zobrazovat tipy pro začátečníky</label>{showBeginnerTips && <div className="help-steps"><article><b>01 · Zorientuj se</b><p>whoami zjistí, pod jakým účtem pracuješ. pwd ukáže aktuální složku. ls vypíše její obsah.</p><button onClick={() => { setInput('whoami'); setActiveApp('powershell'); }}>Zkusit whoami</button></article><article><b>02 · Poznej síť</b><p>ipconfig ukáže síťové rozhraní. nslookup překládá doménu na IP adresu. DNS je jako adresář internetu.</p><button onClick={() => { setInput('ipconfig'); setActiveApp('powershell'); }}>Zkusit ipconfig</button></article><article><b>03 · Prozkoumej služby</b><p>Nmap v tomto labu ukáže otevřené porty a názvy služeb. Port si představ jako konkrétní vstupní dveře do služby.</p><button onClick={() => { setInput('nmap -sV staging.noname-logistics.test'); setActiveApp('powershell'); }}>Zkusit Nmap</button></article><article><b>04 · Sbírej důkazy</b><p>Nález není hotový report. Zaznamenej, co jsi pozoroval, na jakém cíli a jaký to může mít dopad.</p><button onClick={() => { setInput('evidence add recon-observation'); setActiveApp('powershell'); }}>Přidat ukázkový důkaz</button></article></div>}<div className="help-callout"><b>Pravidlo bezpečné laboratoře</b><p>Všechny cíle končící .test a .lab jsou fiktivní. Nástroje nekomunikují s internetem ani s okolní sítí. Skutečné testování prováděj pouze s výslovným oprávněním.</p></div></div></div>}
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
