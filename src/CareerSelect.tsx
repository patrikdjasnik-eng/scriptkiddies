import { useState, type CSSProperties } from 'react';
import { Shield, Crosshair, Network, Eye, ArrowRight, Terminal, Lock, Bug, Building2, Wallet } from 'lucide-react';

export type CareerPath = 'red' | 'blue' | 'purple' | 'black';
type Employer = { id:string; name:string; role:string; salary:number; level:string; description:string };
type Props = { onSelect: (path: CareerPath) => void; current?: CareerPath | null };

const paths = [
  { id:'red' as const, name:'RED TEAM', title:'Professional security role', color:'#f87171', icon:Crosshair, motto:'Think like an attacker. Prove the weakness.', focus:'Recon · Web testing · Exploit analysis · Privilege boundaries', intro:'Učíš se hledat slabiny v autorizovaném sandboxu, ověřovat dopad a připravovat reprodukovatelné nálezy.', tools:'Nmap · Burp Suite · ffuf · SQLi Lab · Semgrep' },
  { id:'blue' as const, name:'BLUE TEAM', title:'Professional security role', color:'#60a5fa', icon:Shield, motto:'Detect early. Investigate deeply. Respond precisely.', focus:'SOC · SIEM · Threat hunting · Incident response', intro:'Sleduješ telemetrii, koreluješ události, analyzuješ artefakty a stavíš detekce proti simulovaným hrozbám.', tools:'SIEM · YARA · Wireshark · Volatility · Log Explorer' },
  { id:'purple' as const, name:'PURPLE TEAM', title:'Professional security role', color:'#c084fc', icon:Network, motto:'Connect attack paths with defensive evidence.', focus:'Attack simulation · Detection engineering · Validation', intro:'Propojuješ techniky Red a Blue Teamu. Simuluješ techniku, hledáš její stopy a ověřuješ účinnost detekce.', tools:'Atomic-style Lab · Sigma · YARA · Packet Analysis · Reports' },
  { id:'black' as const, name:'BLACK HAT', title:'Fictional narrative mode · not a professional team', color:'#d1d5db', icon:Eye, motto:'Explore the adversary mindset. Face the consequences.', focus:'Fictional intrusion stories · OPSEC lessons · Digital traces', intro:'Samostatný fiktivní příběhový režim z perspektivy protivníka. Black Hat označuje neetickou/malicious motivaci, nikoli běžnou profesní specializaci jako Red, Blue nebo Purple Team. Rozhodnutí mají následky a každá operace zanechává stopy pro vyšetřovatele.', tools:'Fictional C2 Console · Artifact Lab · Forensics · Risk & Impact' }
];

const employers: Record<Exclude<CareerPath,'black'>,Employer[]> = {
  red: [
    {id:'red-01',name:'Northstar Security',role:'Junior Security Tester',salary:42000,level:'JUNIOR',description:'Webové testování a základní ověřování nálezů.'},
    {id:'red-02',name:'CopperFox Labs',role:'Application Security Analyst',salary:48000,level:'JUNIOR+',description:'Analýza aplikací, API a bezpečnostních konfigurací.'},
    {id:'red-03',name:'Grey Lantern',role:'Penetration Tester',salary:55000,level:'MEDIOR',description:'Autorizované testy aplikací a infrastruktury.'},
    {id:'red-04',name:'Redwood Assurance',role:'Web Security Specialist',salary:61000,level:'MEDIOR',description:'Hloubkové testování webů a reportování dopadů.'},
    {id:'red-05',name:'Foxglove Cyber',role:'API Security Engineer',salary:68000,level:'MEDIOR',description:'Testování API, autentizace a řízení přístupu.'},
    {id:'red-06',name:'Obsidian Audit',role:'Senior Penetration Tester',salary:76000,level:'SENIOR',description:'Komplexní bezpečnostní audity a mentoring.'},
    {id:'red-07',name:'Iron Finch Security',role:'Red Team Operator',salary:84000,level:'SENIOR',description:'Řízené adversary emulation v izolovaných rozsazích.'},
    {id:'red-08',name:'Velvet Hammer',role:'Senior Offensive Security Engineer',salary:92000,level:'SENIOR+',description:'Návrh testovacích scénářů a technické vedení.'},
    {id:'red-09',name:'Asterion Research',role:'Principal Security Consultant',salary:105000,level:'LEAD',description:'Odborné vedení zakázek a konzultace.'},
    {id:'red-10',name:'Blackbird Security Works',role:'Red Team Lead',salary:120000,level:'LEAD+',description:'Vedení týmu a návrh bezpečnostních cvičení.'}
  ],
  blue: [
    {id:'blue-01',name:'Blue Pine Operations',role:'Junior SOC Analyst',salary:38000,level:'JUNIOR',description:'První triage alertů a práce se základní telemetrií.'},
    {id:'blue-02',name:'Quiet Harbor',role:'Security Monitoring Analyst',salary:44000,level:'JUNIOR+',description:'Monitoring událostí a eskalace podezřelých aktivit.'},
    {id:'blue-03',name:'Signal Orchard',role:'SOC Analyst L2',salary:52000,level:'MEDIOR',description:'Korelace logů a vyšetřování incidentů.'},
    {id:'blue-04',name:'Frostline Defense',role:'Incident Response Analyst',salary:59000,level:'MEDIOR',description:'Analýza incidentů a tvorba časových os.'},
    {id:'blue-05',name:'Mosslight Security',role:'Threat Hunter',salary:67000,level:'MEDIOR',description:'Hypotézy threat huntingu a detekční pravidla.'},
    {id:'blue-06',name:'Granite Shield',role:'Detection Engineer',salary:75000,level:'SENIOR',description:'Vývoj, ladění a testování detekcí.'},
    {id:'blue-07',name:'Wintergate Cyber',role:'Digital Forensics Specialist',salary:83000,level:'SENIOR',description:'Forenzní analýza endpointů a digitálních stop.'},
    {id:'blue-08',name:'Cedar Sentinel',role:'Senior Threat Hunter',salary:91000,level:'SENIOR+',description:'Pokročilé vyhledávání hrozeb a mentoring.'},
    {id:'blue-09',name:'Pale Horizon Security',role:'Security Operations Lead',salary:104000,level:'LEAD',description:'Vedení SOC směny a rozvoj procesů.'},
    {id:'blue-10',name:'Everwatch Systems',role:'Head of Detection & Response',salary:118000,level:'LEAD+',description:'Strategie detekce, reakce a řízení týmu.'}
  ],
  purple: [
    {id:'purple-01',name:'Violet Circuit',role:'Junior Security Validation Analyst',salary:44000,level:'JUNIOR',description:'Kontrola pokrytí detekcí podle jednoduchých scénářů.'},
    {id:'purple-02',name:'Prism Forge',role:'Security Testing Analyst',salary:50000,level:'JUNIOR+',description:'Propojení testovacích případů s dostupnou telemetrií.'},
    {id:'purple-03',name:'Amethyst Signal',role:'Purple Team Analyst',salary:58000,level:'MEDIOR',description:'Ověřování detekcí a mapování technik.'},
    {id:'purple-04',name:'Spectrum Grove',role:'Detection Validation Engineer',salary:65000,level:'MEDIOR',description:'Validace alertů a měření účinnosti kontrol.'},
    {id:'purple-05',name:'Orchid Matrix',role:'Adversary Emulation Analyst',salary:73000,level:'MEDIOR',description:'Bezpečná emulace technik a analýza stop.'},
    {id:'purple-06',name:'Prism Harbor',role:'Purple Team Engineer',salary:81000,level:'SENIOR',description:'Návrh cvičení a spolupráce Red/Blue týmů.'},
    {id:'purple-07',name:'Indigo Bastion',role:'Senior Detection Engineer',salary:89000,level:'SENIOR',description:'Pokročilé ladění detekcí a automatizace validace.'},
    {id:'purple-08',name:'Lavender Ridge',role:'Security Exercise Architect',salary:97000,level:'SENIOR+',description:'Architektura bezpečnostních cvičení a metrik.'},
    {id:'purple-09',name:'Ultraviolet Labs',role:'Purple Team Lead',salary:110000,level:'LEAD',description:'Vedení validačních programů a odborných týmů.'},
    {id:'purple-10',name:'Prismatic Defense Group',role:'Director of Security Validation',salary:125000,level:'LEAD+',description:'Strategie adversary emulation a měření obrany.'}
  ]
};

const formatSalary=(value:number)=>new Intl.NumberFormat('cs-CZ').format(value)+' Kč / měsíc';

export default function CareerSelect({onSelect,current}:Props) {
  const [selected,setSelected]=useState<CareerPath>(current ?? 'red');
  const [selectedEmployer,setSelectedEmployer]=useState('');
  const active=paths.find(p=>p.id===selected)!;
  const options=selected==='black'?[]:employers[selected];
  const employer=options.find(item=>item.id===selectedEmployer);
  const choosePath=(path:CareerPath)=>{setSelected(path);setSelectedEmployer('');};
  const initialize=()=>{
    if(selected!=='black'&&!employer)return;
    try{if(employer)localStorage.setItem('bh-employer-selection',JSON.stringify({careerPath:selected,...employer,selectedAt:new Date().toISOString()}));else localStorage.removeItem('bh-employer-selection');}catch{/* Workstation remains playable without storage. */}
    onSelect(selected);
  };
  return <main className="career-screen">
    <div className="career-top"><div className="career-brand"><span><Bug size={19}/></span><div><b>SCRIPT KIDDIES</b><small>CAREER INITIALIZATION // BH-OS</small></div></div><div className="career-status"><i/> SIMULATION CORE ONLINE</div></div>
    <section className="career-hero"><div className="career-kicker"><span/> OPERATOR INTAKE / STEP 01</div><h1>Choose your <em>track.</em></h1><p>Red, Blue a Purple jsou profesní bezpečnostní role. Black Hat je oddělený fiktivní příběhový režim, nikoli etická certifikace ani běžná kariérní specializace. Volbu můžeš později změnit.</p></section>
    <section className="career-grid">{paths.map(path=>{const Icon=path.icon;return <button key={path.id} className={'career-card '+(selected===path.id?'chosen':'')} style={{'--career':path.color} as CSSProperties} onClick={()=>choosePath(path.id)}><div className="career-card-head"><span className="career-icon"><Icon size={23}/></span><span className="career-radio">{selected===path.id?'SELECTED':'SELECT'}</span></div><small>{path.id==='black'?'FICTIONAL STORYLINE':'PROFESSIONAL SECURITY ROLE'}</small><h2>{path.name}</h2><p>{path.motto}</p><div className="career-focus">{path.focus}</div></button>})}</section>
    <section className="career-detail" style={{'--career':active.color} as React.CSSProperties}><div><div className="career-kicker"><span/> SELECTED TRAINING TRACK</div><h3>{active.name} <small>// {active.title}</small></h3><p>{active.intro}</p><div className="career-tools"><Terminal size={14}/> {active.tools}</div></div></section>
    {selected!=='black'&&<section className="employer-picker" style={{'--career':active.color} as CSSProperties}>
      <div className="employer-heading"><div><div className="career-kicker"><span/> OPERATOR INTAKE / STEP 02</div><h2><Building2 size={20}/> Vyber si zaměstnavatele</h2><p>Vyber jednu z 10 fiktivních no-name společností. Nabídky se liší pozicí, senioritou i měsíční hrubou mzdou.</p></div><span className="employer-count">{employer?'1':'0'} / 1 VYBRÁNO</span></div>
      <div className="employer-grid">{options.map((item,index)=><button type="button" key={item.id} className={'employer-card '+(selectedEmployer===item.id?'chosen':'')} onClick={()=>setSelectedEmployer(item.id)}><div className="employer-card-top"><span>{String(index+1).padStart(2,'0')} // {item.level}</span><span>{selectedEmployer===item.id?'✓ VYBRÁNO':'VYBRAT'}</span></div><h3>{item.name}</h3><b className="employer-role">{item.role}</b><p>{item.description}</p><div className="employer-salary"><Wallet size={15}/><strong>{formatSalary(item.salary)}</strong></div></button>)}</div>
      <p className="employer-note">* Fiktivní firmy a herní mzdové nabídky v CZK hrubého. Nejde o skutečné pracovní nabídky ani reálné zaměstnavatele.</p>
    </section>}
    {selected==='black'&&<div className="employer-note black-note">Black Hat je příběhový režim, nikoli profesní role — výběr zaměstnavatele se zde nepoužívá.</div>}
    <section className="career-actions" aria-label="Dokončení výběru kariéry"><div className="career-foot"><span><Lock size={12}/> FICTIONAL TARGETS · ISOLATED LAB · NO EXTERNAL REQUESTS</span><span>PROFILE CAN BE CHANGED LATER</span></div><button type="button" className="career-start" disabled={selected!=='black'&&!employer} onClick={initialize}>{selected!=='black'&&!employer?'NEJPRVE VYBER FIRMU':'POKRAČOVAT DO PRACOVNÍ STANICE'} <ArrowRight size={17}/></button></section>
  </main>;
}
