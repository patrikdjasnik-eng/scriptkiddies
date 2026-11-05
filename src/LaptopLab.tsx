import { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, Bug, CheckCircle2, Code2, FileText, Folder, Globe2, HardDrive, Monitor, Network, Play, Power, Search, ShieldCheck, Terminal, Wifi, X, Volume2, BatteryFull, Grid3X3, Container, Save, FilePlus2, StickyNote, Trash2, ShoppingBag, ShoppingCart, Cpu, Laptop, Package, Plus, Minus, Wrench } from 'lucide-react';
import type { CareerPath } from './CareerSelect';
import RabbitOSPanel from './RabbitOSPanel';

type AppId = 'system' | 'powershell' | 'editor' | 'vscode' | 'docker' | 'notes' | 'browser' | 'files' | 'knowledge' | 'monitor' | 'toolkit' | 'help' | 'search' | 'bounty' | 'shop';
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
  { id: 'api-08', title: 'Zapomenutý token', brief: 'Prozkoumej bezpečnost API tokenů v sandboxu. Identifikuj nadměrná oprávnění a doporuč rotaci a omezení scope.', target: 'auth.cloudnote.test', reward: 480, objectives: ['Otevři dokumentaci autentizace.', 'Zkontroluj metadata demonstračního tokenu.', 'Vyhodnoť jeho oprávnění.', 'Zaznamenej bezpečný důkaz.', 'Odevzdej report.'] },
  { id: 'ssrf-09', title: 'Webhook mimo kontrolu', brief: 'Prověř validaci URL u demonstrační webhook služby. Rozpoznej nebezpečnou důvěru v uživatelský vstup a navrhni ochranu proti SSRF.', target: 'hooks.cloudnote.test', reward: 560, objectives: ['Otevři dokumentaci webhook služby.', 'Proveď bezpečnou kontrolu URL validátoru.', 'Prohlédni síťovou politiku sandboxu.', 'Ulož důkaz bez odesílání požadavku.', 'Odevzdej doporučení.'] },
  { id: 'tls-10', title: 'Slabé místo v TLS', brief: 'Zkontroluj TLS konfiguraci fiktivního portálu. Vyhodnoť protokoly, certifikát a bezpečnostní hlavičky.', target: 'portal.cloudnote.test', reward: 380, objectives: ['Spusť kontrolu TLS profilu.', 'Zkontroluj HTTP bezpečnostní hlavičky.', 'Vyhodnoť doporučenou konfiguraci.', 'Ulož konfigurační důkaz.', 'Odevzdej report.'] }
];

const internetArticles = [
  { title: 'Bug bounty: jak začít bezpečně a legálně', category: 'START HERE', tags: 'bug bounty scope authorization beginner', excerpt: 'Rozdíl mezi vulnerability research a neautorizovaným testováním. Jak číst scope, pravidla programu a safe harbor.', body: 'Než začneš testovat, přečti celý scope. Ověř povolené domény, IP rozsahy, zakázané techniky, časová omezení a pravidla pro práci s daty. Testuj pouze aktiva výslovně uvedená v programu. Pokud je něco nejasné, zeptej se provozovatele.' },
  { title: 'HTTP status codes a bezpečnostní hlavičky', category: 'WEB SECURITY', tags: 'http headers status code csp hsts x-frame-options', excerpt: 'Praktický přehled HTTP odpovědí, CSP, HSTS a dalších hlaviček.', body: 'HTTP 200 znamená úspěšnou odpověď, 401 chybějící autentizaci, 403 zákaz přístupu a 404 nenalezený zdroj. Bezpečnostní hlavičky jako Content-Security-Policy a Strict-Transport-Security pomáhají omezit některé třídy útoků. Chybějící hlavička sama o sobě nemusí být reportovatelná zranitelnost.' },
  { title: 'IDOR a Broken Access Control', category: 'WEB VULNERABILITIES', tags: 'idor b access control authorization api object reference', excerpt: 'Jak chápat chyby autorizace a bezpečně ověřit oddělení uživatelských dat.', body: 'IDOR vzniká, když aplikace zpřístupní objekt podle identifikátoru bez kontroly oprávnění. V autorizovaném labu porovnej přístup dvou syntetických účtů. Nikdy nezkoušej cizí reálná data. Důkaz má ukazovat chybu autorizace, nikoliv obsah citlivých záznamů.' },
  { title: 'Subdomain enumeration – metodika', category: 'RECON', tags: 'recon dns subdomain enumeration nmap scope', excerpt: 'Pasivní a aktivní průzkum, DNS záznamy a kontrola rozsahu programu.', body: 'Začni rozsahem programu a pasivními zdroji. Každý nalezený hostname ověř proti scope. DNS záznam není automaticky povolením k testování. Eviduj zdroj objevu, čas a stav ověření.' },
  { title: 'Jak napsat kvalitní vulnerability report', category: 'REPORTING', tags: 'report cvss impact reproduction steps remediation', excerpt: 'Struktura reportu: shrnutí, dopad, reprodukce, důkaz a doporučená oprava.', body: 'Dobrý report obsahuje jasný titulek, stručné shrnutí, dotčené aktivum, předpoklady, kroky reprodukce v povoleném prostředí, očekávané a skutečné chování, bezpečný důkaz dopadu, závažnost s odůvodněním a návrh nápravy.' },
  { title: 'Wi-Fi security: WPA2 handshake v PCAP', category: 'WIRELESS', tags: 'wifi wireless aircrack handshake pcap wpa2', excerpt: 'Co lze vyčíst z metadat zachyceného handshake a jak funguje laboratorní analýza.', body: 'Handshake je součást procesu navázání zabezpečeného spojení. V této výukové laboratoři analyzujeme pouze syntetický PCAP a metadata rámců. Skutečné zachytávání provozu a testování bez výslovného oprávnění není součástí cvičení.' },
  { title: 'SSRF: bezpečná validace webhook URL', category: 'WEB VULNERABILITIES', tags: 'ssrf webhook url validation redirect allowlist', excerpt: 'Proč je nutné ověřovat cílovou adresu, DNS odpovědi i každý redirect.', body: 'Server-Side Request Forgery (SSRF) může vzniknout, když server načítá URL dodanou uživatelem bez dostatečné kontroly. Obrana kombinuje allowlist důvěryhodných domén, blokování loopback/private/link-local rozsahů, kontrolu DNS po překladu, opakovanou validaci redirectů a omezení odchozí síťové komunikace. Samotná blokace textového řetězce nestačí.' },
  { title: 'TLS hardening a bezpečnostní hlavičky', category: 'INFRASTRUCTURE', tags: 'tls ssl certificate hsts csp http headers', excerpt: 'Jak vyhodnotit zastaralé protokoly, platnost certifikátu a HSTS.', body: 'Moderní služba by měla zakázat TLS 1.0 a 1.1, podporovat TLS 1.2 a 1.3, automaticky obnovovat certifikáty a správně obsluhovat HTTPS. HSTS vynucuje HTTPS v prohlížeči, ale zapínej ho až po ověření celé domény a všech relevantních subdomén. Nález vždy posuzuj v kontextu skutečného dopadu.' }
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
    { name: 'traceroute', summary: 'Simulace síťové cesty', example: 'traceroute staging.noname-logistics.test' },
    { name: 'httpie', summary: 'Čitelné HTTP požadavky', example: 'http GET https://staging.noname-logistics.test/api/docs' },
    { name: 'jq', summary: 'Filtrování JSON odpovědí', example: 'jq . findings.json' }
  ]},
  { title: 'WEB APPLICATION SECURITY', tools: [
    { name: 'gobuster', summary: 'Hledání známých cest v lab webu', example: 'gobuster dir -u http://staging.noname-logistics.test' },
    { name: 'nikto', summary: 'Kontrola běžných webových chyb', example: 'nikto -h staging.noname-logistics.test' },
    { name: 'sqlmap', summary: 'Výuková analýza SQL injection indikátoru', example: 'sqlmap -u http://staging.noname-logistics.test/item?id=1' },
    { name: 'burpsuite', summary: 'Prohlížení zachyceného HTTP požadavku', example: 'burpsuite --open lab-request' },
    { name: 'ffuf', summary: 'Fuzzing cest z bezpečného slovníku v labu', example: 'ffuf -w common.txt -u https://staging.noname-logistics.test/FUZZ' },
    { name: 'semgrep', summary: 'Statická analýza ukázkového zdrojového kódu', example: 'semgrep --config auto ./demo-app' }
  ]},
  { title: 'WEB & INFRASTRUCTURE HARDENING', tools: [
    { name: 'testssl', summary: 'Audit TLS profilu syntetického endpointu', example: 'testssl portal.cloudnote.test' },
    { name: 'httpx', summary: 'Kontrola HTTP metadat v inventáři labu', example: 'httpx -u https://portal.cloudnote.test -title -status-code' },
    { name: 'ssrf-lab', summary: 'Kontrola URL validace bez odeslání požadavků', example: 'ssrf-lab check webhook-target' }
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
    { name: 'sha256sum', summary: 'Kontrolní otisk důkazního souboru', example: 'sha256sum evidence/sample.bin' },
    { name: 'exiftool', summary: 'Metadata demonstračního souboru', example: 'exiftool evidence/sample.jpg' },
    { name: 'volatility', summary: 'Forenzní přehled syntetického memory image', example: 'volatility -f lab-memory.raw windows.pslist' }
  ]}
];

const starterWorkspace: Record<string,string> = { 'workspace/recon.ps1': '$target = "staging.noname-logistics.test"\nWrite-Host "Starting safe lab reconnaissance"\nWrite-Host "Target: $target"\nResolve-DnsName $target', 'workspace/README.md': '# Operator workspace\n\nFictional training environment. All commands are simulated.', 'workspace/notes.txt': 'Pracovní poznámky\n- Ověřit scope před každým testem.\n- Zachovat původní důkazy.\n' };
type LabContainer = { id:string; image:string; name:string; status:'running'|'stopped'; ports:string };
type ShopProduct = { id:string; name:string; category:string; price:number; specs:string; icon:'pi'|'laptop'|'desktop'|'gpu'|'ram'|'board'|'cpu'|'storage'|'monitor' };
type ShopOrder = { id:string; productId:string; name:string; price:number; quantity:number; date:string };
export default function LaptopLab({ lang, careerPath='red' }: { lang: 'cs' | 'en'; careerPath?: CareerPath }) {
  const cs = lang === 'cs';
  const [missionId, setMissionId] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<AppId>('powershell');
  const [openApps, setOpenApps] = useState<AppId[]>(['powershell']);
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [completed, setCompleted] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [reportDrafted, setReportDrafted] = useState(false);
  const [reportValidated, setReportValidated] = useState(false);
  const [url, setUrl] = useState('http://staging.noname-logistics.test');
  const [script, setScript] = useState('Write-Host "Starting reconnaissance..."\n$target = "staging.noname-logistics.test"\nWrite-Host "Target: $target"\n# Try: Resolve-DnsName $target');
  const [scriptOutput, setScriptOutput] = useState<string[]>([]);
  const [workspaceFiles,setWorkspaceFiles]=useState<Record<string,string>>(()=>{try{return {...starterWorkspace,...JSON.parse(localStorage.getItem('bh-workspace-files')??'{}')};}catch{return starterWorkspace;}});
  const [workspaceDirs,setWorkspaceDirs]=useState<string[]>(()=>{try{const value=JSON.parse(localStorage.getItem('bh-workspace-dirs')??'["workspace"]');return Array.isArray(value)?value.filter((x):x is string=>typeof x==='string'&&/^workspace(?:\/[a-zA-Z0-9._-]+)*$/.test(x)):['workspace'];}catch{return ['workspace'];}});
  const [notesDraft,setNotesDraft]=useState(()=>{try{return localStorage.getItem('bh-notes-draft')??starterWorkspace['workspace/notes.txt'];}catch{return starterWorkspace['workspace/notes.txt'];}});
  const [activeWorkspaceFile,setActiveWorkspaceFile]=useState('workspace/recon.ps1');
  const [workspaceDraft,setWorkspaceDraft]=useState(()=>workspaceFiles['workspace/recon.ps1']??'');
  const [newFileName,setNewFileName]=useState('workspace/new-script.ps1');
  const [containers,setContainers]=useState<LabContainer[]>(()=>{try{return JSON.parse(localStorage.getItem('bh-docker-containers')??'[]');}catch{return [];}});
  const [dockerImage,setDockerImage]=useState('bh-nginx:training');
  const [shopCategory,setShopCategory]=useState('VŠE');
  const [shopCart,setShopCart]=useState<Record<string,number>>(()=>{try{return JSON.parse(localStorage.getItem('bh-shop-cart')??'{}');}catch{return {};}});
  const [shopOrders,setShopOrders]=useState<ShopOrder[]>(()=>{try{return JSON.parse(localStorage.getItem('bh-shop-orders')??'[]');}catch{return [];}});
  const [shopBalance,setShopBalance]=useState(()=>{try{const saved=localStorage.getItem('bh-shop-balance');if(saved===null)return 250000;const value=Number(saved);return Number.isFinite(value)&&value>=0?value:250000;}catch{return 250000;}});
  const [notice, setNotice] = useState('');
  const shopProducts:ShopProduct[]=[
    {id:'pi5-8gb',name:'Raspberry Pi 5 · 8 GB',category:'MINI PC',price:3990,specs:'Quad-core ARM · 8 GB RAM · GPIO · lab automation',icon:'pi'},
    {id:'pi4-4gb',name:'Raspberry Pi 4 · 4 GB',category:'MINI PC',price:2290,specs:'ARM Cortex-A72 · 4 GB RAM · GPIO',icon:'pi'},
    {id:'field-laptop',name:'FieldBook Pro 16',category:'NOTEBOOKY',price:42990,specs:'Ryzen 7 · 32 GB DDR5 · 1 TB NVMe · 16”',icon:'laptop'},
    {id:'work-laptop',name:'Workstation 17 HX',category:'NOTEBOOKY',price:68990,specs:'Core i9 · 64 GB DDR5 · RTX class GPU · 2 TB NVMe',icon:'laptop'},
    {id:'desktop-mid',name:'Tower Workstation M',category:'DESKTOP PC',price:57990,specs:'Ryzen 7 · 32 GB DDR5 · 1 TB NVMe · RTX 4070 class',icon:'desktop'},
    {id:'desktop-pro',name:'Tower Workstation X',category:'DESKTOP PC',price:104990,specs:'Ryzen 9 · 64 GB DDR5 · RTX 4080 class · 2 TB NVMe',icon:'desktop'},
    {id:'gpu-rtx',name:'GeForce RTX 5070 · 12 GB',category:'GRAFICKÉ KARTY',price:18990,specs:'12 GB GDDR7 · PCIe · AI/compute acceleration',icon:'gpu'},
    {id:'gpu-rx',name:'Radeon RX 7800 XT · 16 GB',category:'GRAFICKÉ KARTY',price:13990,specs:'16 GB GDDR6 · PCIe · compute & graphics',icon:'gpu'},
    {id:'ram-ddr3',name:'DDR3 kit · 16 GB',category:'RAM',price:890,specs:'2×8 GB · 1600 MHz · legacy platform',icon:'ram'},
    {id:'ram-ddr4',name:'DDR4 kit · 32 GB',category:'RAM',price:1690,specs:'2×16 GB · 3200 MHz · desktop DIMM',icon:'ram'},
    {id:'ram-ddr5',name:'DDR5 kit · 64 GB',category:'RAM',price:4990,specs:'2×32 GB · 6000 MHz · desktop DIMM',icon:'ram'},
    {id:'board-ddr3',name:'Mainboard H81 Legacy',category:'ZÁKLADNÍ DESKY',price:1490,specs:'Socket LGA1150 · DDR3 · mATX',icon:'board'},
    {id:'board-ddr4',name:'Mainboard B550',category:'ZÁKLADNÍ DESKY',price:2790,specs:'Socket AM4 · DDR4 · PCIe 4.0',icon:'board'},
    {id:'board-ddr5',name:'Mainboard B650',category:'ZÁKLADNÍ DESKY',price:4290,specs:'Socket AM5 · DDR5 · PCIe 5.0',icon:'board'},
    {id:'cpu-am4',name:'Ryzen 7 5700X',category:'PROCESORY',price:3890,specs:'8 cores / 16 threads · Socket AM4 · DDR4 platform',icon:'cpu'},
    {id:'cpu-am5',name:'Ryzen 7 9700X',category:'PROCESORY',price:8990,specs:'8 cores / 16 threads · Socket AM5 · DDR5 platform',icon:'cpu'},
    {id:'nvme-2tb',name:'NVMe SSD · 2 TB',category:'ÚLOŽIŠTĚ',price:3290,specs:'M.2 2280 · PCIe 4.0 · high-speed storage',icon:'storage'},
    {id:'monitor-27',name:'Lab Monitor 27” QHD',category:'MONITORY',price:5990,specs:'27” · 2560×1440 · IPS · 165 Hz',icon:'monitor'}
  ];
  const shopCategories=['VŠE',...Array.from(new Set(shopProducts.map(p=>p.category)))];
  const shopCartCount=Object.values(shopCart).reduce((sum,n)=>sum+n,0);
  const shopCartTotal=shopProducts.reduce((sum,p)=>sum+p.price*(shopCart[p.id]??0),0);
  const formatMoney=(value:number)=>new Intl.NumberFormat('cs-CZ').format(value)+' Kč';
  const addShopItem=(id:string)=>setShopCart(old=>({...old,[id]:Math.min(9,(old[id]??0)+1)}));
  const changeShopQuantity=(id:string,delta:number)=>setShopCart(old=>{const next={...old};const quantity=(next[id]??0)+delta;if(quantity<=0)delete next[id];else next[id]=Math.min(9,quantity);return next;});
  const placeShopOrder=()=>{if(!shopCartCount){setNotice('Košík je prázdný.');return;}if(shopCartTotal>shopBalance){setNotice('Na virtuálním účtu není dostatek prostředků.');return;}const created=shopProducts.filter(p=>(shopCart[p.id]??0)>0).map(p=>({id:'ORD-'+String(Date.now()).slice(-7)+'-'+p.id,productId:p.id,name:p.name,price:p.price,quantity:shopCart[p.id],date:new Date().toISOString()}));setShopOrders(old=>[...created,...old]);try{const inventory=JSON.parse(localStorage.getItem('bh-shop-inventory')??'[]') as {productId:string;name:string;quantity:number}[];for(const item of created){const existing=inventory.find(x=>x.productId===item.productId);if(existing)existing.quantity+=item.quantity;else inventory.push({productId:item.productId,name:item.name,quantity:item.quantity});}localStorage.setItem('bh-shop-inventory',JSON.stringify(inventory));}catch{setNotice('Objednávka proběhla, ale inventář se nepodařilo uložit.');return;}setShopBalance(old=>old-shopCartTotal);setShopCart({});setNotice('Objednávka potvrzena. Komponenty jsou v inventáři RabbitOS.');};
  const [earnedXp, setEarnedXp] = useState<number>(() => {
    try { const saved = JSON.parse(localStorage.getItem('bh-lab-progress') ?? '{}'); return Number.isFinite(saved.earnedXp) && saved.earnedXp >= 0 ? saved.earnedXp : 0; } catch { return 0; }
  });
  const [submitted, setSubmitted] = useState<string[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('bh-lab-progress') ?? '{}'); return Array.isArray(saved.submitted) ? saved.submitted.filter((id: unknown): id is string => typeof id === 'string' && missions.some(mission => mission.id === id)) : []; } catch { return []; }
  });
  const [showBeginnerTips, setShowBeginnerTips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<(typeof internetArticles)[number] | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [registeredProfile, setRegisteredProfile] = useState<{name:string; email:string; handle:string} | null>(() => {
    try { const saved = localStorage.getItem('bh-lab-bounty-profile'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [joinedPrograms, setJoinedPrograms] = useState<string[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('bh-lab-progress') ?? '{}'); return Array.isArray(saved.joinedPrograms) ? saved.joinedPrograms.filter((name: unknown): name is string => typeof name === 'string' && bountyPrograms.some(program => program.name === name)) : []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('bh-lab-progress', JSON.stringify({ earnedXp, submitted, joinedPrograms })); } catch { /* Storage may be disabled; the game remains playable for this session. */ }
  }, [earnedXp, submitted, joinedPrograms]);
  useEffect(()=>{try{localStorage.setItem('bh-workspace-files',JSON.stringify(workspaceFiles));}catch{/* Workspace remains available in memory. */}},[workspaceFiles]);
  useEffect(()=>{try{localStorage.setItem('bh-workspace-dirs',JSON.stringify(workspaceDirs));}catch{/* Directories remain available in memory. */}},[workspaceDirs]);
  useEffect(()=>{try{localStorage.setItem('bh-notes-draft',notesDraft);}catch{/* Notes remain available in memory. */}},[notesDraft]);
  useEffect(()=>{try{localStorage.setItem('bh-docker-containers',JSON.stringify(containers));}catch{/* Container state remains available in memory. */}},[containers]);
  useEffect(()=>{try{localStorage.setItem('bh-shop-cart',JSON.stringify(shopCart));localStorage.setItem('bh-shop-orders',JSON.stringify(shopOrders));localStorage.setItem('bh-shop-balance',String(shopBalance));}catch{/* Shop remains usable for this session. */}},[shopCart,shopOrders,shopBalance]);
  const saveWorkspaceFile=()=>{setWorkspaceFiles(old=>({...old,[activeWorkspaceFile]:workspaceDraft}));setNotice('Uloženo: '+activeWorkspaceFile);};
  const createWorkspaceDirectory=(raw:string)=>{const path=raw.trim().replace(/\\/g,'/').replace(/\/$/,'');if(!/^workspace(?:\/[a-zA-Z0-9._-]+)*$/.test(path)||path.split('/').some(part=>part==='.'||part==='..')){add({text:'Neplatná cesta. Adresáře musí být uvnitř workspace/.',tone:'error'});return;}if(workspaceDirs.includes(path)){add({text:'Adresář již existuje: '+path,tone:'warn'});return;}const parts=path.split('/');const dirs=parts.map((_,i)=>parts.slice(0,i+1).join('/'));setWorkspaceDirs(old=>Array.from(new Set([...old,...dirs])));add({text:'Adresář vytvořen: '+path,tone:'good'});};
  const openWorkspaceFile=(path:string)=>{setActiveWorkspaceFile(path);setWorkspaceDraft(workspaceFiles[path]??'');setActiveApp('vscode');};
  const createWorkspaceFile=()=>{const path=newFileName.trim().replace(/\\/g,'/');if(!/^workspace\/[a-zA-Z0-9._/-]{1,90}$/.test(path)||path.endsWith('/')){setNotice('Neplatná cesta. Použij workspace/nazev-souboru.ext');return;}if(workspaceFiles[path]!==undefined){setNotice('Soubor již existuje: '+path);return;}setWorkspaceFiles(old=>({...old,[path]:''}));setActiveWorkspaceFile(path);setWorkspaceDraft('');setNotice('Vytvořen soubor: '+path);};
  const runWorkspaceFile=()=>{if(activeWorkspaceFile.toLowerCase().endsWith('.ps1')){setWorkspaceFiles(old=>({...old,[activeWorkspaceFile]:workspaceDraft}));setScript(workspaceDraft);runScript(workspaceDraft);setActiveApp('vscode');}else{setNotice('Spuštění podporuje pouze PowerShell skripty .ps1 v tomto simulátoru.');}};
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
    if(app==='notes')setNotesDraft(notesDraft);
    if(app==='vscode')setWorkspaceDraft(workspaceFiles[activeWorkspaceFile]??'');
    setActiveApp(app);
    setOpenApps(old => old.includes(app) ? old : [...old, app]);
  };
  const runCommand = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    add({ text: prompt + command, tone: 'good' });
    const lower = command.toLowerCase();
    if (lower === 'code' || lower === 'code .' || lower === 'code --new-window') { setActiveApp('vscode'); add({text:'VS Code Lab otevřen. Workspace je virtuální a lokálně uložený.',tone:'good'}); return; }
    if (lower === 'docker') { setActiveApp('docker'); add({text:'Docker Lab otevřen — runtime je simulovaný, žádný skutečný Docker daemon se nespouští.',tone:'good'}); return; }
    if (lower === 'notepad') { setNotesDraft(notesDraft); setActiveApp('notes'); add({text:'Poznámkový blok otevřen.',tone:'good'}); return; }
    if (lower.startsWith('mkdir ') || lower.startsWith('new-item -itemtype directory ')) { const path=command.replace(/^mkdir\s+|^new-item\s+-itemtype\s+directory\s+/i,''); createWorkspaceDirectory(path); return; }
    if (lower.startsWith('new-item ') || lower.startsWith('touch ')) { const path=command.replace(/^(new-item|touch)\s+/i,'').replace(/\\/g,'/'); if(!/^workspace\/[a-zA-Z0-9._/-]{1,90}$/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..')){add({text:'Použij bezpečnou cestu workspace/nazev.ext',tone:'error'});return;} setWorkspaceFiles(old=>({...old,[path]:old[path]??''})); add({text:'Soubor vytvořen: '+path,tone:'good'}); return; }
    if (lower.startsWith('set-content workspace/')) { const match=command.match(/^Set-Content\s+(workspace\/[a-zA-Z0-9._/-]+)\s+-Value\s+["'](.*)["']$/i); if(!match){add({text:'Syntax: Set-Content workspace/file.txt -Value "text"',tone:'warn'});return;} setWorkspaceFiles(old=>({...old,[match[1]]:match[2]})); add({text:'Soubor uložen: '+match[1],tone:'good'}); return; }
    if (lower.startsWith('remove-item workspace/')) { const path=command.slice(12).trim().replace(/\\/g,'/'); if(workspaceFiles[path]===undefined){add({text:'Soubor nenalezen: '+path,tone:'error'});return;} setWorkspaceFiles(old=>{const next={...old};delete next[path];return next;}); add({text:'Soubor odstraněn: '+path,tone:'good'}); return; }
    if (lower.startsWith('get-content workspace/') || lower.startsWith('cat workspace/')) { const path=command.replace(/^(get-content|cat)\s+/i,'').replace(/\\/g,'/'); const body=workspaceFiles[path]; add({text:body===undefined?'Soubor nenalezen: '+path:'--- '+path+' ---',tone:body===undefined?'error':'good'},{text:body??''}); return; }
    if (lower.startsWith('code workspace/')) { const path=command.slice(5).replace(/\\/g,'/'); if(workspaceFiles[path]===undefined){add({text:'Soubor nenalezen: '+path,tone:'error'});return;} openWorkspaceFile(path); add({text:'Otevřen '+path,tone:'good'}); return; }
    if (lower === 'docker ps') { setActiveApp('docker'); const rows:Line[]=containers.length?containers.map((c):Line=>({text:c.id+' '+c.image+' '+c.status+' '+c.name+' '+c.ports})): [{text:'CONTAINER ID   IMAGE   STATUS   NAMES',tone:'muted'},{text:'(no containers)'}]; add(...rows); return; }
    if (lower === 'docker images') { setActiveApp('docker'); add({text:'REPOSITORY       TAG        SIZE'},{text:'bh-nginx         training   42MB'},{text:'bh-python        lab        68MB'},{text:'bh-analyst       latest     95MB'}); return; }
    if (lower.startsWith('docker run ')) { const image=command.split(/\s+/).pop()||''; const allowed=['bh-nginx:training','bh-python:lab','bh-analyst:latest']; if(!allowed.includes(image)){add({text:'Image nenalezena. Dostupné: '+allowed.join(', '),tone:'error'});return;} const name='lab-'+(containers.length+1); const item:LabContainer={id:'c'+String(Date.now()).slice(-5),image,name,status:'running',ports:'simulated:8080->80/tcp'}; setContainers(old=>[...old,item]); setActiveApp('docker'); add({text:'SIMULATED CONTAINER STARTED: '+name+' ('+image+')',tone:'good'},{text:'Žádný host port se neotevírá.'}); return; }
    if (lower.startsWith('docker stop ') || lower.startsWith('docker start ') || lower.startsWith('docker rm ')) { const action=lower.split(/\s+/)[1]; const id=command.split(/\s+/).pop()||''; const match=containers.find(c=>c.id===id||c.name===id); if(!match)add({text:'Container not found: '+id,tone:'error'});else if(action==='rm'){setContainers(old=>old.filter(c=>c.id!==match.id));add({text:'Container removed: '+match.name,tone:'good'});}else{const status=action==='start'?'running':'stopped';setContainers(old=>old.map(c=>c.id===match.id?{...c,status}:c));add({text:'Container '+status+': '+match.name,tone:'good'});}setActiveApp('docker');return; }
    if (lower === 'help' || lower === 'get-help') {
      add({ text: 'ZÁKLADNÍ PŘÍKAZY', tone: 'good' }, { text: 'whoami · pwd · ls · cd · ipconfig · nslookup <host>' }, { text: 'nmap · dig · whois · gobuster · nikto · sqlmap · burpsuite · testssl · httpx' },
      { text: 'ssrf-lab · cloud-audit · token inspect · sql-lab' }, { text: 'aircrack-ng --analyze · wireshark · tshark · john --show · hashcat --show' }, { text: 'evidence add <název> · evidence list · report draft · report validate · submit' }, { text: 'code [workspace/file] · notepad · New-Item workspace/file · Get-Content workspace/file' }, { text: 'docker ps · docker images · docker run bh-nginx:training · docker stop/start/rm <id> · mkdir workspace/logs' }, { text: 'help <nástroj> zobrazí vysvětlení · toolkit otevře katalog nástrojů · guide otevře průvodce' }, { text: 'Příkazy pracují pouze se syntetickými daty této výukové laboratoře.', tone: 'muted' });
    } else if (lower === 'toolkit') {
      setActiveApp('toolkit');
      add({ text: 'Otevírám katalog výukových nástrojů.', tone: 'good' }); if (mission?.id === 'wifi-07') mark(0);
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
        john: 'John the Ripper umí auditovat heslové hashe. Zde pracuje jen s demonstrační sadou: john --show lab-demo-hashes.txt',
        testssl: 'Testssl kontroluje TLS protokoly a konfiguraci certifikátu. V této hře používá pouze syntetický profil: testssl portal.cloudnote.test',
        'ssrf-lab': 'Výukový validátor webhook URL. Neodesílá síťové požadavky: ssrf-lab check webhook-target'
      };
      add({ text: descriptions[name] ?? 'Nástroj není v rychlé nápovědě. Otevři toolkit a vyber kategorii.', tone: descriptions[name] ? 'good' : 'warn' });
    } else if (lower === 'whoami') {
      add({ text: 'bh-lab\\operator' }); if (mission?.id === 'recon-01') mark(0);
    } else if (lower === 'pwd') {
      add({ text: 'C:\\Users\\operator' });
    } else if (lower === 'ls' || lower === 'dir' || lower === 'get-childitem') {
      add(...[...files,...workspaceDirs.map(path=>path+'/'),...Object.keys(workspaceFiles)].filter((name,index,all)=>all.indexOf(name)===index).map(name => ({ text: name }))); if (mission?.id === 'ir-03') mark(0);
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
      const allowedHost = ['staging.noname-logistics.test', 'portal.cloudnote.test', 'hooks.cloudnote.test', 'catalog.greencart.test', 'files.cloudnote.test'].some(host => lower.includes(host));
      const headersOnly = /(^|\s)-I(\s|$)/i.test(command);
      const docsPath = lower.includes('/api/docs');
      if (!allowedHost) add({ text: 'curl: cíl není v inventáři izolované laboratoře.', tone: 'error' });
      else if (headersOnly) {
        add({ text: 'HTTP/1.1 200 OK', tone: 'good' }, { text: 'date: Tue, 05 Nov 2026 21:04:15 GMT' }, { text: 'server: nginx/1.24.0' }, { text: 'content-type: text/html; charset=utf-8' }, { text: 'content-length: 1842' }, { text: 'connection: keep-alive' }, { text: 'x-lab-route: /' });
        if (mission?.id === 'web-02') mark(1);
      } else if (docsPath) {
        add({ text: 'HTTP/1.1 200 OK', tone: 'good' }, { text: 'server: nginx/1.24.0' }, { text: 'content-type: text/html; charset=utf-8' }, { text: 'x-lab-route: /api/docs' }, { text: '--- RESPONSE BODY ---' }, { text: 'OpenAPI 3.0 · GET /api/v1/shipments/{id} · GET /api/v1/tracking/{code}', tone: 'warn' });
        if (mission?.id === 'web-02') mark(2);
      } else add({ text: 'HTTP/1.1 404 Not Found', tone: 'warn' }, { text: 'route not present in this application fixture' });
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
    } else if (lower === 'auth docs') {
      add({ text: 'AUTHENTICATION GUIDE · access tokens · scopes · expiry · rotation', tone: 'good' });
      if (mission?.id === 'api-08') mark(0);
    } else if (lower === 'token explain') {
      add({ text: 'Least privilege: issue only required scopes, set short expiry, rotate credentials and audit usage.' });
      if (mission?.id === 'api-08') mark(2);
    } else if (lower === 'webhook docs') {
      add({ text: 'WEBHOOK SERVICE GUIDE · SIMULATED', tone: 'good' }, { text: 'Endpoint accepts a destination URL and schedules an outbound callback.' }, { text: 'Security note: destination validation must run after canonicalization and on every redirect.' });
      if (mission?.id === 'ssrf-09') mark(0);
    } else if (lower === 'ssrf-lab check webhook-target') {
      add({ text: 'URL VALIDATION FIXTURE · NO NETWORK REQUEST SENT', tone: 'good' }, { text: 'Input profile: redirect-aware validation = DISABLED', tone: 'warn' }, { text: 'Finding: validator checks the initial hostname but does not re-check redirect destinations.' }, { text: 'Impact depends on reachable internal services; this lab does not access any internal address.' });
      if (mission?.id === 'ssrf-09') mark(1);
    } else if (lower === 'ssrf-lab policy') {
      add({ text: 'SANDBOX EGRESS POLICY', tone: 'good' }, { text: 'Default: DENY · Allowlist: approved webhook provider domains only' }, { text: 'Required controls: block loopback, private, link-local and metadata ranges; re-resolve and validate every redirect; enforce egress firewall.' });
      if (mission?.id === 'ssrf-09') mark(2);
    } else if (lower.startsWith('testssl ')) {
      add({ text: 'testssl.sh · SYNTHETIC TLS PROFILE', tone: 'good' }, { text: 'TLS 1.0: offered (legacy protocol)', tone: 'warn' }, { text: 'TLS 1.2 / TLS 1.3: supported' }, { text: 'Certificate fixture: valid · renewal window: 21 days' }, { text: 'No remote host was contacted.', tone: 'muted' });
      if (mission?.id === 'tls-10') mark(0);
    } else if (lower.startsWith('httpx ')) {
      add({ text: 'httpx · LOCAL INVENTORY FIXTURE', tone: 'good' }, { text: 'https://portal.cloudnote.test [200] [CloudNote Portal]' }, { text: 'Technology hints: nginx · TLS enabled · no live probe performed' });
    } else if (lower === 'tls-audit portal.cloudnote.test') {
      add({ text: 'TLS CONFIGURATION AUDIT · SYNTHETIC FIXTURE', tone: 'good' }, { text: 'TLS 1.0: ENABLED (legacy)', tone: 'warn' }, { text: 'TLS 1.2: ENABLED · TLS 1.3: ENABLED' }, { text: 'Certificate: valid in lab fixture · expires in 21 days' });
      if (mission?.id === 'tls-10') mark(0);
    } else if (lower === 'tls-audit headers portal.cloudnote.test') {
      add({ text: 'HTTP SECURITY HEADERS · SYNTHETIC FIXTURE', tone: 'good' }, { text: 'Strict-Transport-Security: MISSING', tone: 'warn' }, { text: 'Content-Security-Policy: present · X-Content-Type-Options: nosniff' });
      if (mission?.id === 'tls-10') mark(1);
    } else if (lower === 'tls-audit explain') {
      add({ text: 'HARDENING: disable TLS 1.0/1.1, prefer TLS 1.2/1.3, automate certificate renewal and add HSTS after validating HTTPS coverage.' });
      if (mission?.id === 'tls-10') mark(2);
    } else if (lower === 'sql-lab check catalog?id=1') {
      add({ text: 'HTTP 200 · item=1 · query parameter accepted', tone: 'good' }, { text: 'Baseline response captured.' });
      if (mission?.id === 'sqli-05') mark(1);
    } else if (lower === 'sql-lab analyze') {
      add({ text: 'SQLi LAB ANALYSIS · synthetic boolean differential detected', tone: 'warn' }, { text: 'True fixture: 200 / 1 result · False fixture: 200 / 0 results' }, { text: 'No payload sent to a real database. Confirm impact only in authorized environments.' });
      if (mission?.id === 'sqli-05') mark(2);
    } else if (lower === 'evidence list') {
      if (!evidence.length) add({ text: 'Evidence store je prázdný.', tone: 'warn' });
      else add({ text: 'EVIDENCE STORE · ' + evidence.length + ' ITEM(S)', tone: 'good' }, ...evidence.map((item, index) => ({ text: `${index + 1}. ${item}` })));
    } else if (lower.startsWith('select-string ') || lower.startsWith('grep ')) {
      const successMatch = lower.includes('auth_success');
      if (lower.includes('authentication.log') && successMatch) {
        add({ text: 'logs/authentication.log:3:21:05:02 AUTH_SUCCESS user=svc_backup src=10.20.0.44', tone: 'warn' });
        if (mission?.id === 'ir-03') mark(1);
      } else if (lower.includes('authentication.log') && lower.includes('auth_fail')) {
        add({ text: 'logs/authentication.log:1:21:04:12 AUTH_FAIL user=svc_backup src=10.20.0.44' }, { text: 'logs/authentication.log:2:21:04:18 AUTH_FAIL user=svc_backup src=10.20.0.44' });
        if (mission?.id === 'ir-03') mark(1);
      } else add({ text: 'Select-String: žádná shoda v dostupných laboratorních souborech.', tone: 'muted' });
    } else if (lower.startsWith('get-filehash ') || lower.startsWith('sha256sum ')) {
      if (lower.includes('evidence/sample.bin')) add({ text: 'Algorithm : SHA256', tone: 'good' }, { text: 'Hash      : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }, { text: 'Path      : evidence/sample.bin' });
      else add({ text: 'Soubor není součástí laboratorního inventáře.', tone: 'error' });
    } else if (lower === 'report draft') {
      if (!mission) add({ text: 'Nejdřív vyber aktivní misi.', tone: 'warn' });
      else if (!evidence.length) add({ text: 'Nelze vytvořit report: nejprve ulož alespoň jeden konkrétní důkaz pomocí evidence add <název>.', tone: 'warn' });
      else {
        setReportDrafted(true); setReportValidated(false);
        add({ text: 'VULNERABILITY REPORT · DRAFT', tone: 'good' }, { text: 'Title: ' + mission.title }, { text: 'Affected asset: ' + mission.target }, { text: 'Evidence: ' + evidence.join(', ') }, { text: 'Reproduction: doplň přesné kroky a pozorované chování.' }, { text: 'Impact: popiš dopad na důvěrnost, integritu nebo dostupnost.' }, { text: 'Remediation: navrhni konkrétní opravu.' }, { text: 'Status: DRAFT — spusť report validate před odevzdáním.', tone: 'warn' });
      }
    } else if (lower === 'report validate') {
      if (!mission) add({ text: 'Nejdřív vyber aktivní misi.', tone: 'warn' });
      else {
        const missing = [!evidence.length ? 'evidence' : '', !reportDrafted ? 'report draft' : '', ...mission.objectives.slice(0, -1).filter((_, index) => !completed.includes(mission.id + ':' + index)).map((objective, index) => objective)].filter(Boolean);
        if (missing.length) { setReportValidated(false); add({ text: 'REPORT VALIDATION FAILED · nedokončeno: ' + missing.join(' | '), tone: 'error' }); }
        else { setReportValidated(true); add({ text: 'REPORT VALIDATION PASSED · checklist, důkazy a draft jsou připravené.', tone: 'good' }, { text: 'Poznámka: obsah reportu stále vyžaduje odborné posouzení reprodukce, dopadu a mitigace.' }); }
      }
    } else if (lower === 'wireless summary') {
      add({ text: 'Capture: lab-handshake.cap · WPA2 · handshake frames present · synthetic AP only', tone: 'good' }, { text: 'Limitations: metadata does not reveal a password or prove exploitability.' });
      if (mission?.id === 'wifi-07') mark(2);
    } else if (lower.startsWith('http get ')) {
      add({ text: 'HTTP/1.1 200 OK · content-type: application/json', tone: 'good' }, { text: '{"service":"staging-api","version":"2.4.1","docs":"/api/docs"}' });
    } else if (lower === 'jq . findings.json') {
      add({ text: '{', tone: 'good' }, { text: '  "finding": "public-api-documentation",' }, { text: '  "severity": "low",' }, { text: '  "evidence": "unauthenticated HTTP 200"' }, { text: '}' });
    } else if (lower.startsWith('ffuf ')) {
      add({ text: 'ffuf SIMULATED content discovery', tone: 'good' }, { text: 'api/docs        [Status: 200, Size: 1842]' }, { text: 'api/v1          [Status: 200, Size: 920]' }, { text: 'admin           [Status: 403, Size: 128]' }, { text: 'FUZZ results are generated from the local wordlist fixture.' });
      if (mission?.id === 'web-02') mark(2);
    } else if (lower.startsWith('semgrep ')) {
      add({ text: 'Semgrep static analysis · demo-app', tone: 'good' }, { text: 'WARNING: authorization check missing in demo route /api/orders/:id', tone: 'warn' }, { text: 'Rule: bh.security.missing-object-authorization · confidence: HIGH' });
      if (mission?.id === 'idor-04') mark(2);
    } else if (lower.startsWith('exiftool ')) {
      add({ text: 'File Name: sample.jpg' }, { text: 'Create Date: 2026:11:04 20:14:00' }, { text: 'Camera Model: Training Fixture' }, { text: 'GPS Position: Not present' });
    } else if (lower.startsWith('volatility ')) {
      add({ text: 'Volatility 3 · synthetic memory image', tone: 'good' }, { text: 'PID 4088 · updater_tmp.exe · suspicious unsigned process', tone: 'warn' }, { text: 'PID 2912 · powershell.exe · operator session' });
      if (mission?.id === 'ir-03') mark(2);
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
      else add({ text: 'Aircrack-ng LAB ANALYZER · SYNTHETIC CAPTURE', tone: 'good' }, { text: 'File: lab-handshake.cap · 184 packets · 1 fictional access point' }, { text: 'SSID: BH-TRAINING · BSSID: 02:00:00:00:00:01' }, { text: 'WPA2 handshake metadata: PRESENT · frame sequence: CONSISTENT', tone: 'good' }, { text: 'Educational note: this exercise inspects capture metadata only. No real Wi-Fi capture, deauthentication or password cracking is performed.', tone: 'muted' }); if (mission?.id === 'wifi-07') mark(1);
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
    } else if (lower === 'get-content notes.txt' || lower === 'cat notes.txt') {
      add({ text: '--- workspace/notes.txt ---', tone: 'good' }, { text: notesDraft });
    } else if (lower === 'get-content logs/updater_tmp.log' || lower === 'cat logs/updater_tmp.log') {
      add({ text: '21:03:58 process_start name=updater_tmp.exe pid=4088 user=svc_backup', tone: 'warn' }, { text: '21:04:02 outbound_connection dst=198.51.100.24:443 process=updater_tmp.exe' }, { text: '21:05:02 auth_success user=svc_backup src=10.20.0.44' });
      if (mission?.id === 'ir-03') mark(2);
    } else if (lower === 'get-content recon.ps1' || lower === 'cat recon.ps1') {
      add({ text: 'Write-Host "Starting reconnaissance..."' }, { text: '$target = "staging.noname-logistics.test"' }, { text: 'Write-Host "Target: $target"' }, { text: '# Resolve-DnsName $target' });
    } else if (lower === 'get-process' || lower === 'ps') {
      add({ text: 'ProcessName       Id     CPU' }, { text: 'explorer          1840   00:01' }, { text: 'powershell        2912   00:02' }, { text: 'updater_tmp       4088   18:42', tone: 'warn' });
      if (mission?.id === 'ir-03') mark(2);
    } else if (lower.startsWith('evidence add ')) {
      const name = command.slice(13).trim() || 'unnamed-evidence';
      if (!/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(name)) { add({ text: 'Neplatný název důkazu. Použij 1–64 znaků: písmena, čísla, tečku, pomlčku nebo podtržítko.', tone: 'error' }); return; }
      setEvidence(old => old.includes(name) ? old : [...old, name]); setReportValidated(false);
      add({ text: 'Evidence uložen: ' + name, tone: 'good' });
      if (mission?.id === 'recon-01') mark(4);
      if (mission?.id === 'web-02' || mission?.id === 'sqli-05' || mission?.id === 'cloud-06' || mission?.id === 'api-08' || mission?.id === 'wifi-07') mark(3);
      if (mission?.id === 'ir-03') mark(3);
      if (mission?.id === 'idor-04' || mission?.id === 'sqli-05' || mission?.id === 'cloud-06' || mission?.id === 'wifi-07' || mission?.id === 'api-08' || mission?.id === 'ssrf-09' || mission?.id === 'tls-10') mark(3);
    } else if (lower === 'submit') {
      if (!mission) add({ text: 'Nejdřív vyber aktivní misi.', tone: 'warn' });
      else if (!evidence.length || !reportDrafted || !reportValidated) add({ text: 'Odevzdání zamítnuto: potřebuješ důkazy, draft a úspěšnou validaci. Použij evidence list, report draft a report validate.', tone: 'warn' });
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
  const runScript = (source = script) => {
    const output: string[] = [];
    const variables: Record<string,string> = { target: mission?.target ?? 'staging.noname-logistics.test', host: mission?.target ?? 'staging.noname-logistics.test' };
    const interpolate = (value:string) => value.replace(/\$([a-zA-Z_][\w]*)/g, (_match,key:string) => variables[key.toLowerCase()] ?? '');
    source.split(/\r?\n/).forEach((raw,index) => {
      const line=raw.trim();
      if(!line || line.startsWith('#')) return;
      const assignment=line.match(/^\$([a-zA-Z_][\w]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))$/);
      if(assignment){const key=assignment[1].toLowerCase();variables[key]=interpolate(assignment[2]??assignment[3]??assignment[4]??'');output.push('['+key+' nastavena] '+variables[key]);return;}
      const echo=line.match(/^(?:Write-Host|Write-Output)\s+(.+)$/i);
      if(echo){let value=echo[1].trim();const quoted=value.match(/^["'](.*)["']$/);if(quoted)value=quoted[1];output.push(interpolate(value));return;}
      const dns=line.match(/^(?:Resolve-DnsName|nslookup)\s+(.+)$/i);
      if(dns){const host=interpolate(dns[1].replace(/^["']|["']$/g,''));if(!host.endsWith('.test')&&!host.endsWith('.lab'))output.push('Řádek '+(index+1)+': DNS cíl mimo fiktivní namespace — zablokováno.');else output.push('Name: '+host+' · IPAddress: 10.20.0.24 (simulováno)');return;}
      const get=line.match(/^(?:Get-Content|cat)\s+(.+)$/i);
      if(get){const path=get[1].replace(/\\/g,'/').replace(/^\.\//,'');if(!path.startsWith('workspace/')){output.push('Řádek '+(index+1)+': čtení povoleno pouze z workspace/.');return;}const content=workspaceFiles[path];output.push(content===undefined?'Soubor nenalezen: '+path:content);return;}
      if(/^(?:Get-Location|pwd)$/i.test(line)){output.push('C:\\Users\\operator\\workspace');return;}
      output.push('Řádek '+(index+1)+': příkaz není v podporované sadě: '+line);
    });
    setScriptOutput(output.length ? output : ['Skript nevypsal žádný výstup.']);
  };
  const chooseMission = (id: string) => {
    setMissionId(id); setCompleted([]); setEvidence([]); setReportDrafted(false); setReportValidated(false); setLines(initialLines); setActiveApp('powershell'); setOpenApps(['powershell']); setNotice('');
  };
  type BlueprintSeed=[string,string,string,string,string[]];
  const makeBlueprints=(track:string,seeds:BlueprintSeed[])=>seeds.map(([slug,title,description,goal,steps])=>({
    title,description,file:track+'-'+slug+'.ps1',
    content:'# '+track.toUpperCase()+' · '+title.toUpperCase()+'\n# Training blueprint only. No host commands or external network requests.\n$case = "BH-TRAINING-001"\n$objective = "'+goal+'"\nWrite-Host "Case: $case"\nWrite-Host "Objective: $objective"\n'+(track==='red'?'$target = "'+(mission?.target??'staging.noname-logistics.test')+'"\nWrite-Host "Fictional target: $target"\nResolve-DnsName $target\n':'')+steps.map((step)=>'Write-Host "'+step.replace(/"/g,"'")+'"\n').join('')
  }));
  const scriptBlueprints:Record<CareerPath,{title:string;description:string;file:string;content:string}[]> = {
    red:makeBlueprints('red',[
      ['recon','Recon & asset notes','Inventář fiktivního rozsahu a DNS záznamu.','Zmapovat povolený laboratorní cíl.',['Ověř, že cíl patří do schváleného scope.','Zapiš DNS výsledek a čas kontroly.','Porovnej nalezené služby s inventářem.','Ulož minimální reprodukovatelný důkaz.']],
      ['scope-check','Scope validation','Kontrola pravidel programu před zahájením testování.','Potvrdit hranice autorizace.',['Zaznamenej povolené domény a IP rozsahy.','Vyřaď třetí strany a produkční systémy.','Zkontroluj zakázané testovací techniky.','Při nejasnosti testování zastav.']],
      ['subdomain-inventory','Subdomain inventory','Pracovní list pro inventář subdomén z lokálního datasetu.','Roztřídit známé subdomény.',['Rozděl hosty podle prostředí.','Označ zastaralé a duplicitní záznamy.','Neprováděj brute force ani externí dotazy.','Zaznamenej zdroj každé položky.']],
      ['port-review','Service exposure review','Vyhodnocení syntetického seznamu portů a služeb.','Posoudit vystavené služby.',['Porovnej porty s očekávaným profilem.','Ověř verze pouze v poskytnutém lab výstupu.','Označ zbytečně vystavené služby.','Navrhni omezení přístupu.']],
      ['http-review','HTTP surface review','Kontrolní seznam HTTP hlaviček a metod.','Zkontrolovat webovou attack surface.',['Zkontroluj bezpečnostní hlavičky.','Porovnej povolené HTTP metody.','Zaznamenej rozdíly mezi prostředími.','Navrhni bezpečné výchozí nastavení.']],
      ['content-discovery','Content discovery notes','Evidence veřejně dostupných cest z předpřipraveného datasetu.','Vyhodnotit nalezené webové cesty.',['Rozliš veřejné a interní endpointy.','Zkontroluj, zda odpověď neobsahuje citlivá data.','Nezkoušej přístup mimo scope.','Ulož pouze nezbytný důkaz.']],
      ['tls-review','TLS configuration review','Kontrola TLS profilu z laboratorního reportu.','Vyhodnotit šifrovací konfiguraci.',['Zkontroluj povolené protokoly.','Prověř platnost a SAN certifikátu.','Zaznamenej slabé algoritmy.','Doporuč moderní TLS konfiguraci.']],
      ['api-mapping','API endpoint mapping','Mapování API endpointů z lokální dokumentace.','Zmapovat API bez zásahu do dat.',['Vypiš endpointy a HTTP metody.','Označ autentizované operace.','Zkontroluj dokumentaci parametrů.','Vyber bezpečné testovací účty.']],
      ['idor-review','Object authorization review','Plán ověření autorizace na syntetických účtech a objektech.','Prověřit objektovou autorizaci.',['Použij pouze dva poskytnuté testovací účty.','Porovnej vlastnictví objektu.','Zaznamenej očekávaný a skutečný výsledek.','Nevypisuj cizí osobní data.']],
      ['sqli-indicator','SQL input validation review','Bezpečný checklist pro vyhodnocení laboratorního indikátoru SQLi.','Ověřit validaci vstupu.',['Začni běžným legitimním vstupem.','Porovnej chybové a úspěšné odpovědi.','Použij pouze vestavěný SQLi lab indikátor.','Doporuč parametrizované dotazy.']],
      ['ssrf-review','SSRF URL validation review','Kontrola URL validátoru bez odesílání síťových požadavků.','Prověřit ochranu webhooku.',['Zkontroluj allowlist schémat a hostů.','Ověř blokaci loopback a privátních rozsahů v test datech.','Prověř redirect policy.','Doporuč egress allowlist.']],
      ['auth-review','Authentication flow review','Mapování autentizačního toku a bezpečnostních kontrol.','Vyhodnotit přihlašovací tok.',['Zmapuj kroky přihlášení a odhlášení.','Zkontroluj ochranu session cookie.','Prověř rate limiting v lab reportu.','Doporuč MFA a bezpečné session.']],
      ['cookie-audit','Cookie security audit','Audit atributů cookie z připravené HTTP odpovědi.','Zkontrolovat session cookie.',['Zkontroluj Secure a HttpOnly.','Ověř vhodný SameSite režim.','Prověř expiraci a rotaci session.','Zaznamenej riziko únosu session.']],
      ['cors-review','CORS policy review','Vyhodnocení CORS hlaviček a důvěryhodných originů.','Prověřit CORS konfiguraci.',['Zkontroluj Access-Control-Allow-Origin.','Ověř kombinaci credentials a wildcard.','Porovnej origin proti allowlistu.','Doporuč přesný seznam originů.']],
      ['input-validation','Input validation matrix','Matice validace vstupů pro formuláře a API.','Zmapovat vstupní validační pravidla.',['Sepiš datové typy a limity.','Zkontroluj server-side validaci.','Prověř normalizaci a kódování.','Doporuč jednotné validační schéma.']],
      ['file-upload','File upload review','Bezpečný audit upload workflow v demonstrační aplikaci.','Vyhodnotit bezpečnost uploadu.',['Zkontroluj allowlist přípon a MIME typů.','Prověř limity velikosti a názvů.','Ověř ukládání mimo web root.','Doporuč malware scanning a izolaci.']],
      ['cache-review','Cache behavior review','Kontrola cache politiky pro citlivé a veřejné odpovědi.','Prověřit cache hlavičky.',['Rozliš veřejná a osobní data.','Zkontroluj Cache-Control a Vary.','Prověř cacheování autentizovaných odpovědí.','Doporuč no-store pro citlivé výstupy.']],
      ['error-analysis','Error handling analysis','Analýza chybových odpovědí bez vyvolávání destruktivních stavů.','Vyhodnotit únik informací v chybách.',['Zaznamenej kód a typ chyby.','Hledej stack trace a interní cesty.','Odstraň tajemství z důkazů.','Doporuč obecné chyby a interní logování.']],
      ['evidence-pack','Evidence collection pack','Šablona pro reprodukovatelné a minimální důkazy.','Připravit kvalitní důkaz.',['Zaznamenej čas a testovací účet.','Uveď přesný krok reprodukce.','Přilož redigovaný výstup.','Popiš omezení a nejistoty.']],
      ['report-draft','Finding report draft','Osnova profesionálního bug bounty reportu.','Popsat nález a opravu.',['Uveď stručný název a rozsah.','Popiš dopad a reprodukční kroky.','Odděl pozorování od hypotéz.','Navrhni konkrétní mitigaci.']]
    ]),
    blue:makeBlueprints('blue',[
      ['incident-triage','Incident triage','První kroky při incidentu a zachování důkazů.','Zahájit bezpečné vyšetřování.',['Zaznamenej čas detekce a oznamovatele.','Zachovej originály a pracuj s kopiemi.','Urči rozsah a kritičnost incidentu.','Založ evidenci rozhodnutí.']],
      ['log-review','Authentication log review','Analýza syntetických autentizačních logů.','Najít podezřelé přihlašovací vzorce.',['Seskup události podle identity a zdroje.','Hledej neobvyklé série neúspěchů.','Porovnej časové zóny a odchylky.','Ověř nález další telemetrií.']],
      ['timeline','Incident timeline builder','Sestavení časové osy z připravených artefaktů.','Rekonstruovat posloupnost událostí.',['Normalizuj časová razítka do UTC.','U každé události uveď zdroj.','Označ mezery v telemetrii.','Nevydávej časovou korelaci za kauzalitu.']],
      ['process-triage','Process triage','Kontrolní seznam pro analýzu procesních artefaktů.','Vyhodnotit podezřelý proces.',['Zaznamenej hash a cestu souboru.','Prověř rodičovský proces a podpis.','Porovnej chování s baseline.','Izolaci schvaluj podle IR playbooku.']],
      ['persistence-hunt','Persistence hunt','Hledání indikátorů persistence v syntetickém datasetu.','Identifikovat mechanismy persistence.',['Prohlédni připravené autorun artefakty.','Porovnej změny s baseline.','Ověř legitimitu správce a podpis.','Zdokumentuj nález před nápravou.']],
      ['yara-triage','YARA triage notes','Bezpečné vyhodnocení výsledků YARA skenu.','Interpretovat YARA shody.',['Zaznamenej pravidlo a jeho verzi.','Prověř false positive podmínky.','Koreluj hash s dalšími artefakty.','Neprováděj spuštění podezřelého souboru.']],
      ['hash-integrity','Evidence hash verification','Postup ověření integrity důkazních souborů.','Zajistit integritu artefaktů.',['Vypočti SHA-256 v izolovaném workflow.','Zaznamenej nástroj a čas.','Porovnej hash kopie s evidencí.','Při rozdílu zachovej obě verze.']],
      ['network-alerts','Network alert triage','Triage síťových alertů z předpřipraveného PCAP reportu.','Vyhodnotit podezřelou komunikaci.',['Urči zdroj a cíl z lab metadat.','Prohlédni protokol a časovou osu.','Rozliš DNS, TLS a aplikační signály.','Neprováděj aktivní spojení na cíl.']],
      ['dns-hunt','DNS anomaly hunt','Hledání anomálií v syntetických DNS událostech.','Najít podezřelé DNS vzorce.',['Seskup dotazy podle hostu a klienta.','Označ neobvyklou délku a četnost.','Porovnej domény s interní baseline.','Uveď alternativní benigní vysvětlení.']],
      ['phishing-triage','Phishing triage','Analýza hlaviček a indikátorů podezřelého e-mailu.','Vyhodnotit phishingové hlášení.',['Zkontroluj From, Reply-To a Received.','Prověř SPF, DKIM a DMARC výsledky.','Neotvírej přílohy ani odkazy.','Zaznamenej rozsah doručení.']],
      ['cloud-audit','Cloud configuration audit','Kontrola syntetického cloud audit reportu.','Najít riziková cloud oprávnění.',['Prohlédni veřejné storage policy.','Označ wildcard IAM oprávnění.','Prověř audit logging a retention.','Doporuč least privilege.']],
      ['identity-review','Identity & access review','Revize účtů, rolí a privilegovaných oprávnění.','Omezit nadměrná oprávnění.',['Identifikuj osiřelé účty.','Porovnej role s pracovní potřebou.','Zkontroluj MFA u privilegovaných účtů.','Navrhni recertifikaci přístupů.']],
      ['endpoint-baseline','Endpoint baseline check','Porovnání endpoint konfigurace s bezpečnou baseline.','Odhalit konfigurační odchylky.',['Zkontroluj verzi OS z inventáře.','Prověř stav ochrany a aktualizací.','Označ odchylky podle rizika.','Připrav nápravný ticket.']],
      ['vulnerability-priority','Vulnerability prioritization','Prioritizace zjištěných zranitelností podle kontextu.','Stanovit pořadí oprav.',['Zohledni exploitability a exposure.','Přidej business criticality aktiva.','Rozliš potvrzené a neověřené nálezy.','Stanov vlastníka a termín opravy.']],
      ['containment-plan','Containment plan','Plán omezení dopadu incidentu bez automatického zásahu.','Připravit bezpečné omezení incidentu.',['Vymez systémy a identity v rozsahu.','Zvaž dopad izolace na provoz.','Urči schvalovatele a rollback.','Zaznamenej rozhodnutí a čas.']],
      ['recovery-checklist','Recovery checklist','Kontrolní seznam obnovy po incidentu.','Bezpečně obnovit provoz.',['Ověř odstranění příčiny incidentu.','Obnovuj z důvěryhodných záloh.','Rotuj kompromitované přihlašovací údaje.','Sleduj opakování indikátorů.']],
      ['detection-gap','Detection gap analysis','Vyhodnocení chybějící telemetrie a slepých míst.','Najít mezery v detekci.',['Mapuj techniku na dostupné log zdroje.','Označ chybějící pole a retenci.','Navrhni doplnění telemetry.','Definuj test účinnosti.']],
      ['forensic-intake','Forensic evidence intake','Řetězec předání a evidence digitálních artefaktů.','Zachovat chain of custody.',['Přiřaď unikátní ID důkazu.','Zaznamenej kdo, kdy a odkud jej převzal.','Ulož hash a stav média.','Eviduj každé předání.']],
      ['executive-summary','Incident executive summary','Stručné shrnutí dopadu pro vedení.','Srozumitelně popsat incident.',['Uveď potvrzená fakta a časový rámec.','Vyčísli dopad a nejistoty.','Popiš provedená opatření.','Navrhni další rozhodnutí.']],
      ['lessons-learned','Lessons learned','Retrospektiva incidentu zaměřená na systémová zlepšení.','Předej poučení do praxe.',['Popiš co fungovalo a co selhalo.','Vyhni se obviňování jednotlivců.','Přiřaď konkrétní vlastníky opatření.','Stanov termín následné kontroly.']]
    ]),
    purple:makeBlueprints('purple',[
      ['detection-validation','Detection validation','Ověř, zda telemetry pokrývá modelovaný scénář.','Validovat detekční pravidlo.',['Popiš hypotézu a očekávaný signál.','Použij pouze syntetické události.','Ověř čas, identitu, zdroj a kontext.','Zaznamenej false positive i false negative.']],
      ['attack-mapping','Technique mapping','Mapování simulovaného chování na MITRE ATT&CK techniky.','Propojit chování s detekcí.',['Vyber techniku podle pozorovaného chování.','Uveď zdroj důkazu.','Rozliš emulaci od reálné aktivity.','Přiřaď relevantní detekční pokrytí.']],
      ['telemetry-review','Telemetry coverage review','Kontrola dostupnosti log zdrojů pro scénář.','Změřit pokrytí telemetry.',['Sepiš požadované log zdroje.','Zkontroluj retenci a časovou synchronizaci.','Označ chybějící pole.','Navrhni měřitelný coverage cíl.']],
      ['purple-exercise','Purple exercise plan','Plán společného cvičení Red a Blue Teamu.','Připravit kontrolované cvičení.',['Definuj cíl a rozsah cvičení.','Použij pouze izolovaný lab dataset.','Urči očekávané detekce a vlastníky.','Připrav rollback a stop podmínky.']],
      ['rule-tuning','Detection rule tuning','Ladění pravidla na syntetických pozitivních a negativních datech.','Snížit šum detekce.',['Zaznamenej baseline alert rate.','Přidej kontextové podmínky.','Ověř dopad na false negatives.','Verzuj pravidlo a zdůvodni změny.']],
      ['false-positive','False positive analysis','Rozbor benigních událostí chybně označených jako hrozba.','Vysvětlit falešné poplachy.',['Najdi společné benigní atributy.','Ověř legitimní proces a identitu.','Navrhni úzkou výjimku.','Zkontroluj, že výjimka neskrývá útok.']],
      ['false-negative','Missed detection review','Analýza scénáře, který detekce nezachytila.','Odhalit falešně negativní případy.',['Zrekonstruuj chybějící signál.','Urči zda chyběla data nebo logika.','Navrhni doplnění detekce.','Přidej regresní test.']],
      ['identity-detection','Identity attack detection','Ověření detekce neobvyklého chování identity.','Zachytit anomálie účtu.',['Porovnej běžnou a testovací přihlašovací sekvenci.','Zohledni zařízení a lokaci z lab dat.','Ověř rizikové změny oprávnění.','Navrhni eskalaci podle kontextu.']],
      ['lateral-movement','Lateral movement coverage','Mapování syntetických signálů laterálního pohybu.','Prověřit detekční pokrytí.',['Sleduj neobvyklé vztahy mezi hosty.','Koreluj autentizaci a procesní události.','Ověř segmentační logy.','Navrhni korelační pravidlo.']],
      ['persistence-detection','Persistence detection test','Validace detekce persistence na předpřipravených artefaktech.','Ověřit detekci persistence.',['Vyber syntetický autorun artefakt.','Zkontroluj, zda vznikl alert.','Změř dobu detekce.','Zaznamenej mezery v endpoint telemetry.']],
      ['web-detection','Web attack detection','Ověření detekce webových anomálií z lokálního log datasetu.','Prověřit webové signály.',['Seskup HTTP chyby a podezřelé cesty.','Zkontroluj kontext session a účtu.','Rozliš skenování od běžných chyb.','Navrhni prahové hodnoty a výjimky.']],
      ['cloud-detection','Cloud threat detection','Validace alertů pro změny cloud oprávnění a storage.','Detekovat cloud misconfiguration.',['Prohlédni syntetické audit události.','Označ veřejné změny a privilege escalation.','Ověř alert a jeho kontext.','Navrhni automatizované upozornění.']],
      ['network-detection','Network detection validation','Test pokrytí síťových detekcí na syntetických metadatech.','Prověřit síťovou analytiku.',['Použij pouze poskytnutý PCAP souhrn.','Zkontroluj DNS a TLS metadata.','Ověř korelaci se zdrojovým hostem.','Dokumentuj limity šifrovaného provozu.']],
      ['alert-enrichment','Alert enrichment design','Návrh kontextu, který zvyšuje užitečnost alertu.','Zlepšit triage alertů.',['Přidej asset criticality a identity kontext.','Uveď odkaz na relevantní důkazy.','Vyhni se nadbytečným osobním údajům.','Definuj prioritu a další krok.']],
      ['response-playbook','Response playbook validation','Ověření, zda playbook vede analytika správnými kroky.','Zlepšit reakci na incident.',['Definuj vstupní podmínku playbooku.','Ověř rozhodovací body a eskalace.','Zkontroluj schvalování destruktivních akcí.','Proveď tabletop test.']],
      ['control-validation','Security control validation','Kontrola účinnosti bezpečnostní kontroly proti modelované hrozbě.','Změřit účinnost kontroly.',['Definuj kontrolu a očekávaný výsledek.','Použij bezpečný syntetický scénář.','Zaznamenej důkaz účinnosti.','Při selhání otevři nápravné opatření.']],
      ['coverage-matrix','Detection coverage matrix','Matice technik, log zdrojů, alertů a vlastníků.','Zmapovat mezery v pokrytí.',['Pro každou techniku přiřaď datový zdroj.','Zaznamenej existující detekci.','Označ nechráněné scénáře.','Stanov prioritu podle rizika.']],
      ['purple-report','Purple team report','Zpráva o cvičení, detekcích a doporučeních.','Předat ověřitelné výsledky.',['Odděl provedené kroky od očekávání.','Uveď časy a ID syntetických událostí.','Zaznamenej detekční mezery.','Přiřaď vlastníky a termíny.']],
      ['regression-suite','Detection regression suite','Návrh opakovatelných testů detekčních pravidel.','Zabránit regresím detekce.',['Vytvoř pozitivní a negativní testovací případy.','Ulož očekávaný výsledek každého testu.','Spouštěj po změně pravidla.','Sleduj změny přesnosti.']],
      ['risk-prioritization','Risk-based validation plan','Prioritizace scénářů podle rizika a pokrytí.','Zvolit další validační testy.',['Zohledni kritičnost aktiva a expozici.','Přidej pravděpodobnost a dopad.','Vyber test s nejvyšší hodnotou.','Zaznamenej důvod prioritizace.']]
    ]),
    black:makeBlueprints('black',[
      ['trace-analysis','Adversary trace analysis','Fiktivní příběhový zápis a rekonstrukce syntetických stop.','Popsat průběh fiktivní operace.',['Urči zdroj a spolehlivost každé stopy.','Sestav časovou osu z artefaktů.','Odděl fakta od domněnek.','Vyhodnoť dopad na oběti.']],
      ['persona-dossier','Fictional persona dossier','Profil fiktivní postavy bez skutečných osobních údajů.','Zachytit motivaci postavy.',['Použij výhradně vymyšlené údaje.','Popiš cíle a omezení postavy.','Zaznamenej rozhodnutí a jejich následky.','Nevytvářej profil skutečné osoby.']],
      ['operation-journal','Operation journal','Deník fiktivní operace pro pozdější forenzní rozbor.','Zaznamenat narativní události.',['Zapiš čas a kontext scény.','Uveď použitý fiktivní artefakt.','Zaznamenej změnu plánu.','Připoj dopad na uživatele.']],
      ['evidence-trail','Evidence trail review','Rekonstrukce syntetického řetězce důkazů.','Pochopit zanechané stopy.',['Propoj události s konkrétními artefakty.','Ověř integritu a původ záznamu.','Označ chybějící články řetězce.','Vyhodnoť, co může analytik doložit.']],
      ['consequence-map','Consequence mapping','Mapa dopadů fiktivních rozhodnutí na uživatele a organizaci.','Vyhodnotit následky jednání.',['Identifikuj dotčené skupiny.','Popiš provozní a datový dopad.','Rozliš okamžité a dlouhodobé následky.','Navrhni nápravu a odpovědnost.']],
      ['opsec-review','Operational footprint review','Analýza syntetické operační stopy z pohledu vyšetřovatele.','Pochopit digitální stopu.',['Zkontroluj časová razítka a metadata.','Najdi opakující se identifikátory.','Urči limity atribuce.','Nepokoušej se stopy mazat ani skrývat.']],
      ['decision-log','Decision log','Záznam fiktivních rozhodnutí a jejich etických důsledků.','Zhodnotit rozhodovací proces.',['Zaznamenej rozhodnutí a alternativy.','Uveď očekávaný přínos.','Popiš škodu a riziko.','Vyhodnoť odpovědnost.']],
      ['victim-impact','Victim impact assessment','Dopadová analýza pro fiktivní oběti a organizace.','Vyčíslit následky scénáře.',['Urči dotčené služby a data.','Popiš dopad na dostupnost a důvěrnost.','Zvaž sekundární škody.','Navrhni podporu a obnovu.']],
      ['narrative-timeline','Narrative timeline','Časová osa příběhové mise založená na syntetických událostech.','Sestavit věrohodnou časovou osu.',['Normalizuj časy do UTC.','Propoj události s důkazy.','Označ neověřené části.','Zapiš alternativní vysvětlení.']],
      ['artifact-catalog','Artifact catalog','Katalog fiktivních souborů, logů a metadat.','Uspořádat artefakty.',['Přiřaď každému artefaktu ID.','Zaznamenej typ a zdroj.','Uveď hash z tréninkových dat.','Označ citlivost a retenci.']],
      ['investigator-brief','Investigator brief','Stručné zadání pro analytika, který přebírá případ.','Předat případ vyšetřovateli.',['Shrň potvrzené události.','Uveď dostupné artefakty.','Popiš otevřené otázky.','Doporuč bezpečné další kroky.']],
      ['ethics-review','Ethics and legality review','Kontrola hranic, souhlasu a dopadu fiktivního jednání.','Vyhodnotit etické hranice.',['Zkontroluj autorizaci a souhlas.','Urči možné poškozené strany.','Zvaž proporcionalitu jednání.','Zaznamenej právní a etická rizika.']],
      ['risk-register','Scenario risk register','Registr rizik pro fiktivní operaci a její okolí.','Zachytit a ohodnotit rizika.',['Popiš hrozbu a zranitelné aktivum.','Ohodnoť pravděpodobnost a dopad.','Přiřaď vlastníka rizika.','Navrhni prevenci a mitigaci.']],
      ['communications-review','Communications trace review','Analýza syntetických komunikačních metadat.','Vyhodnotit komunikační stopy.',['Zaznamenej čas a typ události.','Koreluj pouze dostupná metadata.','Nevyvozuj obsah z metadat.','Uveď limity závěrů.']],
      ['story-branch','Story branch planner','Rozhodovací strom příběhové mise s různými následky.','Naplánovat alternativní větve.',['Definuj rozhodovací bod.','Popiš alternativní výsledky.','Zohledni dopad na třetí strany.','Umožni forenzní dohru každé větve.']],
      ['incident-handoff','Incident handoff','Předání fiktivního případu obrannému týmu.','Předat poznatky Blue Teamu.',['Sepiš indikátory z lab prostředí.','Připoj časovou osu a důkazy.','Uveď nejistoty a slepé body.','Doporuč detekční opatření.']],
      ['remediation-review','Remediation review','Kontrola nápravy po fiktivním incidentu.','Ověřit odstranění příčiny.',['Přiřaď opatření ke kořenové příčině.','Definuj bezpečný test účinnosti.','Zkontroluj vedlejší dopady.','Uzavři případ až po ověření.']],
      ['lessons-learned','Lessons learned','Poučení z příběhové mise bez glorifikace škodlivého jednání.','Převést příběh na bezpečnostní poučení.',['Odděl fikci od technických faktů.','Popiš selhání kontrol.','Navrhni obranné zlepšení.','Zaznamenej odpovědnost a dopad.']],
      ['disclosure-draft','Responsible disclosure draft','Fiktivní návrh odpovědného oznámení nálezu.','Připravit bezpečné oznámení.',['Popiš problém bez citlivých dat.','Uveď omezený reprodukční scénář.','Navrhni mitigaci.','Respektuj pravidla koordinovaného zveřejnění.']],
      ['final-debrief','Final operation debrief','Závěrečný rozbor mise, rozhodnutí a dopadů.','Uzavřít fiktivní příběhovou operaci.',['Shrň průběh a klíčová rozhodnutí.','Vyhodnoť důkazy a jejich limity.','Popiš dopady na uživatele.','Navrhni bezpečnější alternativy.']]
    ])
  };
  const createBlueprintFile=(blueprint:{title:string;description:string;file:string;content:string})=>{
    const path='workspace/'+blueprint.file;
    setWorkspaceFiles(old=>({...old,[path]:blueprint.content}));
    setWorkspaceDirs(old=>old.includes('workspace')?old:[...old,'workspace']);
    setActiveWorkspaceFile(path);setWorkspaceDraft(blueprint.content);setNotice('Blueprint uložen jako '+path+'. Otevři VS Code Lab pro úpravy nebo spuštění.');setActiveApp('vscode');
    if(!openApps.includes('vscode'))setOpenApps(old=>[...old,'vscode']);
  };
  const careerOrder:Record<CareerPath,string[]>={red:['recon-01','web-02','idor-04','sqli-05','ssrf-09','tls-10'],blue:['ir-03','tls-10','cloud-06','wifi-07','api-08'],purple:['idor-04','ir-03','ssrf-09','tls-10','api-08'],black:['ssrf-09','api-08','ir-03','sqli-05','wifi-07']};
  const orderedMissions=[...missions].sort((a,b)=>{const order=careerOrder[careerPath];const ai=order.indexOf(a.id),bi=order.indexOf(b.id);return (ai<0?999:ai)-(bi<0?999:bi);});
  const careerLabels:Record<CareerPath,string>={red:'OFFENSIVE SECURITY · doporučený postup: recon → web → validace nálezu',blue:'DEFENSIVE SECURITY · doporučený postup: incident → logy → forenzní analýza',purple:'PURPLE TEAM · doporučený postup: ověření slabiny → detekce → validace obrany',black:'ADVERSARY STORYLINE · fiktivní scénáře, operační stopy a následná forenzní analýza'};
  const appDefs: { id: AppId; label: string; icon: typeof Terminal; hint: string }[] = [
    { id: 'powershell', label: 'Lab Terminal', icon: Terminal, hint: 'Izolovaný terminál s výukovým interpretem' },
    { id: 'editor', label: 'Script Lab', icon: Code2, hint: 'Jednoduchý editor a PowerShell mini-runner' },
    { id: 'vscode', label: 'VS Code Lab', icon: Code2, hint: 'Editor souborů s ukládáním, otevíráním a spuštěním skriptů' },
    { id: 'docker', label: 'Docker Lab', icon: Container, hint: 'Simulované kontejnery, image a lifecycle' },
    { id: 'notes', label: 'Notes', icon: StickyNote, hint: 'Poznámkový blok s automatickým ukládáním' },
    { id: 'browser', label: 'Web Browser', icon: Globe2, hint: 'Prohlížeč lokálních laboratorních webů' },
    { id: 'files', label: 'Files', icon: Folder, hint: 'Soubory a důkazy' },
    { id: 'knowledge', label: 'Documentation', icon: BookOpen, hint: 'Technická dokumentace' },
    { id: 'monitor', label: 'System Monitor', icon: Activity, hint: 'Simulovaná systémová a síťová telemetrie' },
    { id: 'system', label: 'RabbitOS Control', icon: Wrench, hint: 'BIOS, hardware, filesystem, účty a systémové služby' },
    { id: 'toolkit', label: 'Kali Tools', icon: HardDrive, hint: 'Katalog bezpečnostních nástrojů' },
    { id: 'help', label: 'Beginner Guide', icon: BookOpen, hint: 'Průvodce krok za krokem' },
    { id: 'search', label: 'BH Search', icon: Search, hint: 'Vyhledávač bezpečnostních znalostí' },
    { id: 'bounty', label: 'BH Bounty Hub', icon: Bug, hint: 'Simulovaná platforma bug bounty' },
    { id: 'shop', label: 'RabbitTech Store', icon: ShoppingBag, hint: 'Fiktivní obchod s vybavením pro operátora' }
  ];
  return <section className="laptop-lab">
    <div className="lab-intro"><div><span className="lab-kicker">SCRIPT KIDDIES // FIELD WORKSTATION · {careerPath.toUpperCase()} TRACK</span><h2>{cs ? 'Vyber misi a připrav pracovní stanici' : 'Select a mission and prepare your workstation'}</h2><p>{cs ? 'Každá mise se řeší přímo v simulovaném notebooku. Otevírej aplikace, používej příkazy, piš skripty a sbírej důkazy.' : 'Every mission is completed inside a simulated laptop. Open apps, use commands, write scripts and collect evidence.'}</p></div><div className="lab-online"><i/> LOCAL VM ONLINE<br/><span>{careerPath.toUpperCase()} TRACK · SKILL XP: {earnedXp}</span><br/><button className="career-switch-inline" onClick={()=>{try{localStorage.removeItem('bh-career-path');}catch{} window.location.reload();}}>CHANGE PATH</button></div></div>
    {!mission ? <><div className="career-path-context">{careerLabels[careerPath]}</div><div className="lab-mission-select">{orderedMissions.map((item, index) => <button key={item.id} className="lab-mission-card" onClick={() => chooseMission(item.id)}><span className="lab-mission-number">0{index + 1} / CONTRACT</span><h3>{item.title}</h3><p>{item.brief}</p><div><span>{item.target}</span><b>+{item.reward} XP <Play size={13}/></b></div></button>)}</div></> :
    <div className="laptop-shell">
      <div className="laptop-bezel"><div className="laptop-camera"/><div className="laptop-screen">
        <div className="desktop-topbar"><button className="linux-activities" onClick={() => setNotice('Activities: vyber aplikaci z plochy nebo spodního doku.')}><Grid3X3 size={12}/> Activities</button><span className="linux-host"><Monitor size={12}/> BOUNTYHUNTER-LAB</span><span className="linux-clock">Thu 05 Nov · 21:14</span><span className="linux-tray"><Wifi size={12}/><Volume2 size={12}/><BatteryFull size={13}/><i/> VM</span><button className="linux-session" onClick={() => setMissionId(null)}><Power size={12}/></button></div>
        <div className="desktop-area">
          <div className="desktop-icons">{appDefs.map((app, index) => <button key={app.id} onDoubleClick={() => openApp(app.id)} onClick={() => setNotice(app.hint)} className={activeApp === app.id ? 'selected' : ''} title={`${app.label} — dvojklikem otevřít`}><span className={`linux-app-icon app-icon-${index}`}><app.icon size={21}/></span><b>{app.label}</b></button>)}</div>
          <div className="desktop-mission-widget"><small>ACTIVE CONTRACT</small><b>{mission.title}</b><span>{mission.target}</span><div className="mission-progress"><i style={{ width: progress + '%' }}/></div><small>{objectiveIndex}/{mission.objectives.length} OBJECTIVES · {progress}%</small></div>
          {activeApp === 'powershell' && <div className="desktop-window terminal-window"><div className="desktop-window-title"><span><Terminal size={14}/> Windows PowerShell</span><div><button onClick={() => setLines(initialLines)}>↻</button><button onClick={() => setActiveApp('powershell')}>—</button><button onClick={() => setActiveApp('monitor')}>×</button></div></div><div className="powershell-output">{lines.map((line, i) => <div key={i} className={line.tone ?? ''}>{line.text || '\u00a0'}</div>)}</div><form className="powershell-input" onSubmit={e => { e.preventDefault(); runCommand(input); setInput(''); }}><span>{prompt}</span><input autoComplete="off" spellCheck={false} value={input} onChange={e => setInput(e.target.value)} placeholder="help"/><button><Play size={12}/></button></form></div>}
          {activeApp === 'editor' && <div className="desktop-window editor-window"><div className="desktop-window-title"><span><Code2 size={14}/> Script Lab — recon.ps1</span><button onClick={()=>{setWorkspaceFiles(old=>({...old,'workspace/recon.ps1':script}));setNotice('Uloženo: workspace/recon.ps1');}}><Save size={12}/> SAVE</button><button onClick={()=>runScript()}><Play size={12}/> RUN SCRIPT</button></div><div className="editor-help">PowerShell mini-runner · podporované konstrukce: Write-Host, proměnné $target a Resolve-DnsName.</div><textarea spellCheck={false} value={script} onChange={e => setScript(e.target.value)}/><div className="script-output">{scriptOutput.map((line, i) => <div key={i}>{line}</div>)}</div></div>}
          {activeApp === 'vscode' && <div className="desktop-window vscode-window"><div className="desktop-window-title"><span><Code2 size={14}/> Visual Studio Code // BH Workspace</span><div><button onClick={createWorkspaceFile}><FilePlus2 size={12}/> NEW FILE</button><button onClick={saveWorkspaceFile}><Save size={12}/> SAVE</button><button onClick={runWorkspaceFile}><Play size={12}/> RUN</button></div></div><div className="vscode-layout"><aside><b>EXPLORER</b>{Object.keys(workspaceFiles).sort().map(path=><button key={path} className={path===activeWorkspaceFile?'active':''} onClick={()=>openWorkspaceFile(path)}><FileText size={12}/>{path.replace('workspace/','')}</button>)}<input value={newFileName} onChange={e=>setNewFileName(e.target.value)} aria-label="New file path"/><button onClick={createWorkspaceFile}><FilePlus2 size={12}/> CREATE FILE</button></aside><section><div className="vscode-tab">● {activeWorkspaceFile}</div><textarea spellCheck={false} value={workspaceDraft} onChange={e=>setWorkspaceDraft(e.target.value)} aria-label="Code editor"/><div className="vscode-status">BH-LAB · UTF-8 · {activeWorkspaceFile.endsWith('.ps1')?'POWERSHELL':activeWorkspaceFile.endsWith('.py')?'PYTHON':'TEXT'} · SIMULATED WORKSPACE</div></section></div><div className="vscode-output">{scriptOutput.map((line,i)=><div key={i}>{line}</div>)}</div><div className="vscode-foot">Ukládání probíhá do virtuálního filesystemu prohlížeče. RUN podporuje bezpečný PowerShell subset.</div></div>}
          {activeApp === 'docker' && <div className="desktop-window docker-window"><div className="desktop-window-title"><span><Container size={14}/> Docker Desktop // Lab Runtime</span><span>SIMULATED ENGINE · ISOLATED</span></div><div className="docker-toolbar"><label>IMAGE<select value={dockerImage} onChange={e=>setDockerImage(e.target.value)}><option>bh-nginx:training</option><option>bh-python:lab</option><option>bh-analyst:latest</option></select></label><button onClick={()=>{const name='lab-'+(containers.length+1);setContainers(old=>[...old,{id:'c'+String(Date.now()).slice(-5),image:dockerImage,name,status:'running',ports:'simulated:8080->80/tcp'}]);setNotice('Simulovaný kontejner spuštěn.');}}><Play size={12}/> RUN CONTAINER</button></div><div className="docker-images"><b>LOCAL TRAINING IMAGES</b><span>bh-nginx:training · 42 MB</span><span>bh-python:lab · 68 MB</span><span>bh-analyst:latest · 95 MB</span></div><b className="docker-section-label">CONTAINERS ({containers.length})</b>{containers.length?containers.map(c=><article className="docker-container" key={c.id}><div><b>{c.name}</b><small>{c.id} · {c.image}</small><code>{c.ports}</code></div><span className={c.status}>{c.status.toUpperCase()}</span><button onClick={()=>setContainers(old=>old.map(x=>x.id===c.id?{...x,status:x.status==='running'?'stopped':'running'}:x))}>{c.status==='running'?'STOP':'START'}</button><button onClick={()=>setContainers(old=>old.filter(x=>x.id!==c.id))}><Trash2 size={13}/></button></article>):<p className="docker-empty">Zatím neběží žádný kontejner. Spusť training image.</p>}<div className="docker-safety">Docker je zde simulovaný: kontejnery nejsou skutečné procesy, image se nestahují a porty se nepublikují do hostitelského systému.</div></div>}
          {activeApp === 'notes' && <div className="desktop-window notes-window"><div className="desktop-window-title"><span><StickyNote size={14}/> Notepad // notes.txt</span><button onClick={()=>{setWorkspaceFiles(old=>({...old,'workspace/notes.txt':notesDraft}));setNotice('Poznámky uloženy.');}}><Save size={12}/> SAVE NOTES</button></div><textarea value={notesDraft} onChange={e=>setNotesDraft(e.target.value)} placeholder="Zapiš si poznámky, hypotézy a další kroky…"/><div>Rozepsané poznámky se automaticky ukládají lokálně; SAVE NOTES synchronizuje soubor workspace/notes.txt.</div><section className="notes-blueprints"><header><div><b>SCRIPT BLUEPRINTS</b><small>{careerPath.toUpperCase()} TRACK · připravené šablony</small></div><span>SAFE LAB TEMPLATES</span></header>{scriptBlueprints[careerPath].map((blueprint)=><article key={blueprint.file}><div><b>{blueprint.title}</b><p>{blueprint.description}</p><code>{'workspace/'+blueprint.file}</code></div><button onClick={()=>{setNotesDraft(old=>(old.trim()?old+'\n\n':'')+'# '+blueprint.title+'\n'+blueprint.content);setNotice('Šablona přidána do poznámek.');}}><FileText size={12}/> ADD TO NOTES</button><button onClick={()=>createBlueprintFile(blueprint)}><Code2 size={12}/> CREATE .PS1</button></article>)}</section></div>}
          {activeApp === 'shop' && <div className="desktop-window shop-window"><div className="desktop-window-title"><span><ShoppingBag size={14}/> RabbitTech Store <b className="shop-brand-tag">RABBIT TECH</b></span><span>VIRTUAL HARDWARE MARKET</span></div><div className="shop-toolbar"><div><small>VIRTUÁLNÍ ÚČET OPERÁTORA</small><strong>{formatMoney(shopBalance)}</strong><span>Rozpočet pouze pro herní ekonomiku</span></div><div className="shop-cart-summary"><ShoppingCart size={16}/><b>{shopCartCount} ks</b><strong>{formatMoney(shopCartTotal)}</strong></div></div><div className="shop-categories">{shopCategories.map(category=><button key={category} className={shopCategory===category?'active':''} onClick={()=>setShopCategory(category)}>{category}</button>)}</div><div className="shop-scroll"><div className="shop-products">{shopProducts.filter(p=>shopCategory==='VŠE'||p.category===shopCategory).map(product=><article key={product.id} className="shop-product"><div className="shop-product-art">{product.icon==='pi'?<Cpu size={35}/>:product.icon==='laptop'?<Laptop size={35}/>:product.icon==='desktop'?<Monitor size={35}/>:product.icon==='gpu'?<Cpu size={35}/>:product.icon==='ram'?<Package size={35}/>:<HardDrive size={35}/>}<small>{product.category}</small></div><h3>{product.name}</h3><p>{product.specs}</p><div className="shop-product-bottom"><strong>{formatMoney(product.price)}</strong><button onClick={()=>addShopItem(product.id)}><Plus size={13}/> DO KOŠÍKU</button></div>{(shopCart[product.id]??0)>0&&<div className="shop-quantity"><button onClick={()=>changeShopQuantity(product.id,-1)}><Minus size={12}/></button><b>{shopCart[product.id]} ks v košíku</b><button onClick={()=>addShopItem(product.id)}><Plus size={12}/></button></div>}</article>)}</div></div><div className="shop-checkout"><div><b>KOŠÍK · {shopCartCount} POLOŽEK</b><span>Celkem: <strong>{formatMoney(shopCartTotal)}</strong></span></div><button disabled={!shopCartCount||shopCartTotal>shopBalance} onClick={placeShopOrder}><ShoppingCart size={14}/> OBJEDNAT VYBAVENÍ</button></div><div className="shop-orders"><b><Package size={13}/> HISTORIE OBJEDNÁVEK / INVENTÁŘ</b>{shopOrders.length?shopOrders.slice(0,8).map(order=><div key={order.id}><span>{order.name} × {order.quantity}</span><strong>{formatMoney(order.price*order.quantity)}</strong><small>{order.id}</small></div>):<p>Zatím nemáš žádné objednávky. Vyber vybavení a objednej ho.</p>}</div><div className="shop-safety">SIMULOVANÝ E-SHOP · ŽÁDNÉ SKUTEČNÉ PLATBY · ŽÁDNÉ DORUČENÍ · STAV SE UKLÁDÁ LOKÁLNĚ</div></div>}
          {activeApp === 'browser' && <div className="desktop-window browser-window"><div className="desktop-window-title"><span><Globe2 size={14}/> BH Browser</span><span>LOCAL LAB ONLY</span></div><div className="browser-address"><Search size={13}/><input value={url} onChange={e => setUrl(e.target.value)}/><button onClick={() => { setNotice('Stránka načtena z lokální simulace.'); if (mission.id === 'web-02') mark(0); if (mission.id === 'sqli-05') mark(0); }}>GO</button></div><div className="browser-page"><div className="browser-brand">NONAME <b>LOGISTICS</b></div><h3>{url.includes('/api/docs') ? 'API Documentation' : 'Shipment Portal'}</h3><p>{url.includes('/api/docs') ? 'OpenAPI 3.0 · Internal shipment and tracking endpoints' : 'Track shipments, manage delivery preferences and view service status.'}</p><div className="browser-endpoints"><code>GET /api/v1/shipments/:id</code><code>GET /api/v1/tracking/:code</code><code>POST /api/v1/session</code></div><small>SIMULATED RESPONSE · HTTP 200</small></div></div>}

          {activeApp === 'search' && <div className="desktop-window internet-window"><div className="desktop-window-title"><span><Search size={14}/> BH Search <b className="fake-google">G</b></span><span>INDEX: LOCAL KNOWLEDGE WEB</span></div><div className="search-home"><div className="search-logo"><span>B</span>H Search</div><p>Vyhledávač znalostí pro bezpečnostní výzkumníky</p><form onSubmit={e => { e.preventDefault(); setSelectedArticle(null); }}><Search size={15}/><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Hledej třeba IDOR, Nmap, HTTP headers…"/><button>HLEDAT</button></form><div className="search-chips">{['bug bounty scope','IDOR','HTTP headers','Wi-Fi handshake','report'].map(q => <button key={q} onClick={() => {setSearchQuery(q);setSelectedArticle(null);}}>{q}</button>)}</div></div><div className="search-results">{selectedArticle ? <article className="search-article"><button className="back-results" onClick={() => setSelectedArticle(null)}>← ZPĚT NA VÝSLEDKY</button><small>{selectedArticle.category} · BH KNOWLEDGE BASE</small><h3>{selectedArticle.title}</h3><p>{selectedArticle.body}</p><div className="article-tags">{selectedArticle.tags}</div></article> : <>{(searchQuery.trim() ? internetArticles.filter(a => (a.title+' '+a.category+' '+a.tags+' '+a.excerpt).toLowerCase().includes(searchQuery.toLowerCase())) : internetArticles).map(a => <button className="search-result" key={a.title} onClick={() => { setSelectedArticle(a); if (mission?.id === 'cloud-06') mark(0); }}><small>bh-search.local › knowledge › {a.category.toLowerCase().replaceAll(' ','-')}</small><b>{a.title}</b><span>{a.excerpt}</span></button>)}{searchQuery.trim() && !internetArticles.some(a => (a.title+' '+a.category+' '+a.tags+' '+a.excerpt).toLowerCase().includes(searchQuery.toLowerCase())) && <p className="empty-search">Nic jsme nenašli. Zkus obecnější výraz, například „recon“ nebo „report“.</p>}</>}</div><div className="internet-footer">BH SEARCH · FIKTIVNÍ INTERNET · {internetArticles.length} INDEXOVANÝCH ČLÁNKŮ</div></div>}
          {activeApp === 'bounty' && <div className="desktop-window bounty-window"><div className="desktop-window-title"><span><Bug size={14}/> BH Bounty Hub</span><span>COMMUNITY PLATFORM · SIMULATED</span></div><div className="bounty-scroll"><div className="bounty-hero"><div><small>BUG BOUNTY ECOSYSTEM</small><h3>Find bugs. Learn skills. Earn reputation.</h3><p>Fiktivní platforma inspirovaná bug bounty ekosystémy. Registrace i programy zůstávají pouze v tomto herním profilu.</p></div><div className="bounty-stat"><b>{joinedPrograms.length}</b><span>JOINED PROGRAMS</span></div></div>{registeredProfile ? <div className="bounty-profile"><div><small>RESEARCHER ACCOUNT</small><b>{registeredProfile.handle}</b><span>{registeredProfile.name} · {registeredProfile.email}</span></div><strong>ROOKIE RESEARCHER</strong></div> : <form className="bounty-register" onSubmit={e => {e.preventDefault(); const name=applicantName.trim(); const email=applicantEmail.trim(); if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {setNotice('Vyplň jméno a platnou demonstrační e-mailovou adresu.');return;} const profile={name,email,handle:'@'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}; setRegisteredProfile(profile); try{localStorage.setItem('bh-lab-bounty-profile',JSON.stringify(profile));}catch{} setNotice('Simulovaný výzkumnický účet byl vytvořen.');}}><div><b>Vytvořit výzkumnický účet</b><small>Registrace je lokální. Nic se neposílá na server.</small></div><label>DISPLAY NAME<input required maxLength={32} value={applicantName} onChange={e=>setApplicantName(e.target.value)} placeholder="např. packet_rabbit"/></label><label>EMAIL (DEMO)<input required type="email" maxLength={100} value={applicantEmail} onChange={e=>setApplicantEmail(e.target.value)} placeholder="researcher@example.test"/></label><button>CREATE ACCOUNT ↗</button></form>}<div className="bounty-program-heading"><b>AVAILABLE PROGRAMS</b><span>{bountyPrograms.length} FICTIONAL PROGRAMS</span></div><div className="bounty-programs">{bountyPrograms.map(p => <article key={p.name}><div className="program-top"><span>{p.level}</span><b>{p.reward}</b></div><h4>{p.name}</h4><code>{p.domain}</code><p>{p.description}</p><small>SCOPE: {p.scope}</small><button disabled={!registeredProfile || joinedPrograms.includes(p.name)} onClick={()=>{setJoinedPrograms(old=>[...old,p.name]);setNotice('Připojil ses k programu '+p.name+'. Před testováním si prostuduj scope.')}}>{joinedPrograms.includes(p.name)?'JOINED ✓':registeredProfile?'JOIN PROGRAM':'REGISTER TO JOIN'}</button></article>)}</div><div className="bounty-rules"><b>PROGRAM RULES</b><p>Všechny programy, domény, odměny i účty jsou smyšlené. Scope je součástí mise. V reálném bug bounty vždy dodržuj pravidla programu a testuj jen výslovně povolené cíle.</p></div></div></div>}
          {activeApp === 'files' && <div className="desktop-window files-window"><div className="desktop-window-title"><span><Folder size={14}/> File Explorer</span><span> C:\Users\operator</span></div>{files.map(file => <button key={file} onClick={() => file === 'evidence/' ? setNotice(evidence.length ? evidence.join(', ') : 'Evidence folder je zatím prázdná.') : setNotice(file + ' — lokální ukázkový soubor.')}><Folder size={14}/>{file}</button>)}<div className="file-evidence"><b>VIRTUAL WORKSPACE</b>{Object.keys(workspaceFiles).sort().map(path=><button key={path} onClick={()=>openWorkspaceFile(path)}><FileText size={13}/>{path}</button>)}<b>COLLECTED EVIDENCE</b>{evidence.length ? evidence.map(item => <code key={item}>{item}</code>) : <small>Žádné důkazy. Použij evidence add &lt;název&gt; v PowerShellu.</small>}</div></div>}
          {activeApp === 'knowledge' && <div className="desktop-window knowledge-window"><div className="desktop-window-title"><span><BookOpen size={14}/> Knowledge Base</span><span>FIELD MANUAL / 01</span></div><h3>PowerShell pro bezpečnostní průzkum</h3><article><b>whoami</b><p>Vypíše aktuální účet. Před prací ověř, pod jakou identitou příkazy spouštíš.</p></article><article><b>ipconfig</b><p>Zobrazí síťová rozhraní, IP adresy, masku a výchozí bránu.</p></article><article><b>nslookup &lt;host&gt;</b><p>Dotáže DNS resolver a přeloží doménové jméno na IP adresu.</p></article><article><b>nmap -sV &lt;host&gt;</b><p>V laboratoři simuluje zjištění otevřených portů a identifikaci verzí služeb. -sV znamená detekci verzí.</p></article><article><b>curl -I &lt;url&gt;</b><p>Načte pouze hlavičky HTTP odpovědi. Učí číst status kód a metadata serveru.</p></article></div>}
          {activeApp === 'toolkit' && <div className="desktop-window toolkit-window"><div className="desktop-window-title"><span><HardDrive size={14}/> Kali Toolkit // Lab Edition</span><span>TOOLS: SIMULATED</span></div><div className="toolkit-scroll">{toolGroups.map(group => <section key={group.title}><h4>{group.title}</h4><div className="toolkit-cards">{group.tools.map(tool => <article key={tool.name}><b>{tool.name}</b><p>{tool.summary}</p><code>{tool.example}</code><button onClick={() => { setInput(tool.example); setActiveApp('powershell'); setNotice(tool.name + ' — příkaz vložen do PowerShellu. Zkontroluj ho a spusť.'); }}>VLOŽIT DO TERMINÁLU ↗</button></article>)}</div></section>)}</div><div className="toolkit-safety">Nástroje jsou simulované a pracují pouze s předpřipravenými daty této laboratoře.</div></div>}
          {activeApp === 'help' && <div className="desktop-window help-window"><div className="desktop-window-title"><span><BookOpen size={14}/> Beginner Guide</span><span>START HERE</span></div><div className="help-scroll"><h3>První den v hackerské laboratoři</h3><p>Nemusíš znát příkazy nazpaměť. Postupuj pomalu: přečti zadání, otevři nápovědu, spusť jeden příkaz a zkus vysvětlit jeho výsledek.</p><label><input type="checkbox" checked={showBeginnerTips} onChange={e => setShowBeginnerTips(e.target.checked)}/> Zobrazovat tipy pro začátečníky</label>{showBeginnerTips && <div className="help-steps"><article><b>01 · Zorientuj se</b><p>whoami zjistí, pod jakým účtem pracuješ. pwd ukáže aktuální složku. ls vypíše její obsah.</p><button onClick={() => { setInput('whoami'); setActiveApp('powershell'); }}>Zkusit whoami</button></article><article><b>02 · Poznej síť</b><p>ipconfig ukáže síťové rozhraní. nslookup překládá doménu na IP adresu. DNS je jako adresář internetu.</p><button onClick={() => { setInput('ipconfig'); setActiveApp('powershell'); }}>Zkusit ipconfig</button></article><article><b>03 · Prozkoumej služby</b><p>Nmap v tomto labu ukáže otevřené porty a názvy služeb. Port si představ jako konkrétní vstupní dveře do služby.</p><button onClick={() => { setInput('nmap -sV staging.noname-logistics.test'); setActiveApp('powershell'); }}>Zkusit Nmap</button></article><article><b>04 · Sbírej důkazy</b><p>Nález není hotový report. Zaznamenej, co jsi pozoroval, na jakém cíli a jaký to může mít dopad.</p><button onClick={() => { setInput('evidence add recon-observation'); setActiveApp('powershell'); }}>Přidat ukázkový důkaz</button></article></div>}<div className="help-callout"><b>Pravidlo bezpečné laboratoře</b><p>Všechny cíle končící .test a .lab jsou fiktivní. Nástroje nekomunikují s internetem ani s okolní sítí. Skutečné testování prováděj pouze s výslovným oprávněním.</p></div></div></div>}
          {activeApp === 'system' && <RabbitOSPanel username={(()=>{try{return JSON.parse(localStorage.getItem('bh-os-installation')??'{}').username||'operator';}catch{return 'operator';}})()}/>}
          {activeApp === 'monitor' && <div className="desktop-window monitor-window"><div className="desktop-window-title"><span><Activity size={14}/> Network Monitor</span><span>CAPTURE: SIMULATED</span></div><div className="monitor-metric"><b>10.20.0.15</b><span>OPERATOR WORKSTATION</span></div><div className="monitor-metric"><b>10.20.0.24</b><span>{mission.target}</span></div><div className="monitor-packet"><span>21:04:12</span> DNS query → staging.noname-logistics.test</div><div className="monitor-packet"><span>21:04:13</span> TCP SYN → 10.20.0.24:443</div><div className="monitor-packet"><span>21:04:14</span> TLS handshake → nginx/1.24.0</div><div className="monitor-packet"><span>21:04:15</span> HTTP GET /api/docs → 200 OK</div></div>}
        </div>
        <div className="desktop-taskbar"><button className="task-start" title="Show applications" onClick={() => setNotice('Applications: dvojklikem otevři ikonu na ploše.') }><Grid3X3 size={17}/></button>{openApps.map(app => { const item = appDefs.find(x => x.id === app)!; return <button key={app} title={item.label} className={activeApp === app ? 'active' : ''} onClick={() => openApp(app)}><item.icon size={17}/><span>{item.label}</span></button>; })}<span className="task-clock">{cs ? 'IZOLOVANÁ LABORATOŘ' : 'ISOLATED LAB'} · {mission.id.toUpperCase()}</span></div>
      </div></div>
      <div className="laptop-hinge"/><div className="laptop-base"><div className="laptop-trackpad"/></div>
      <div className="lab-below"><div className="lab-objectives"><div><b>MISSION OBJECTIVES</b><span>{objectiveIndex}/{mission.objectives.length} COMPLETE</span></div>{mission.objectives.map((item, index) => <div key={item} className={completed.includes(mission.id + ':' + index) ? 'done' : ''}><CheckCircle2 size={14}/><span>{item}</span></div>)}</div><div className="lab-coach"><div><BookOpen size={15}/> LEARN WHILE YOU PLAY</div><p>{mission.id === 'recon-01' ? 'Tip: Nejdřív si ověř vlastní síťové nastavení. Potom přelož DNS jméno a až následně zkoumej porty. Tento postup ti pomůže odlišit problém DNS od nedostupné služby.' : mission.id === 'web-02' ? 'Tip: HTTP hlavičky často prozradí server, typ obsahu nebo bezpečnostní konfiguraci. Samotná dostupnost dokumentace ještě automaticky neznamená kritickou zranitelnost — důležitý je její obsah a dopad.' : mission.id === 'ssrf-09' ? 'Tip: SSRF není jen kontrola textu URL. Server musí bezpečně vyhodnotit DNS, zakázané IP rozsahy a každý redirect. Nejspolehlivější je kombinace allowlistu a síťového egress filtru.' : mission.id === 'tls-10' ? 'Tip: Zastaralý protokol je konfigurační slabina, ale její závažnost závisí na dostupnosti a kontextu služby. Certifikát, TLS verze a HSTS kontroluj odděleně a doporučení formuluj konkrétně.' : 'Tip: Při incident response zachovej původní důkazy. Zaznamenej čas, zdroj, integritu a kontext každého artefaktu.'}</p><small>CONCEPTS: DNS · TCP · PORTS · SERVICE FINGERPRINTING</small></div></div>
      {notice && <div className="lab-notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    </div>}
    <div className="lab-disclaimer"><ShieldCheck size={13}/> {cs ? 'Všechny příkazy, cíle a síťové výstupy jsou simulované. Notebook neprovádí skutečné síťové operace.' : 'All commands, targets and network outputs are simulated. The laptop performs no real network operations.'}</div>
  </section>;
}
