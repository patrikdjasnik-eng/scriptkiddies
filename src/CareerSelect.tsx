import { useState, type CSSProperties } from 'react';
import { Shield, Crosshair, Network, Eye, ArrowRight, Terminal, Lock, Bug } from 'lucide-react';

export type CareerPath = 'red' | 'blue' | 'purple' | 'black';
type Props = { onSelect: (path: CareerPath) => void; current?: CareerPath | null };
const paths = [
  { id:'red' as const, name:'RED TEAM', title:'Offensive Security', color:'#f87171', icon:Crosshair, motto:'Think like an attacker. Prove the weakness.', focus:'Recon · Web testing · Exploit analysis · Privilege boundaries', intro:'Učíš se hledat slabiny v autorizovaném sandboxu, ověřovat dopad a připravovat reprodukovatelné nálezy.', tools:'Nmap · Burp Suite · ffuf · SQLi Lab · Semgrep' },
  { id:'blue' as const, name:'BLUE TEAM', title:'Defensive Security', color:'#60a5fa', icon:Shield, motto:'Detect early. Investigate deeply. Respond precisely.', focus:'SOC · SIEM · Threat hunting · Incident response', intro:'Sleduješ telemetrii, koreluješ události, analyzuješ artefakty a stavíš detekce proti simulovaným hrozbám.', tools:'SIEM · YARA · Wireshark · Volatility · Log Explorer' },
  { id:'purple' as const, name:'PURPLE TEAM', title:'Adversary Emulation & Detection', color:'#c084fc', icon:Network, motto:'Connect attack paths with defensive evidence.', focus:'Attack simulation · Detection engineering · Validation', intro:'Propojuješ techniky Red a Blue Teamu. Simuluješ techniku, hledáš její stopy a ověřuješ účinnost detekce.', tools:'Atomic-style Lab · Sigma · YARA · Packet Analysis · Reports' },
  { id:'black' as const, name:'BLACK HAT', title:'Adversary Underworld Storyline', color:'#d1d5db', icon:Eye, motto:'Explore the adversary mindset. Face the consequences.', focus:'Fictional intrusion stories · OPSEC lessons · Digital traces', intro:'Příběhová cesta z pohledu fiktivního protivníka. Rozhodnutí mají následky a každá operace zanechává stopy pro vyšetřovatele.', tools:'Fictional C2 Console · Artifact Lab · Forensics · Risk & Impact' }
];
export default function CareerSelect({onSelect,current}:Props) {
  const [selected,setSelected]=useState<CareerPath>(current ?? 'red');
  const active=paths.find(p=>p.id===selected)!;
  return <main className="career-screen">
    <div className="career-top"><div className="career-brand"><span><Bug size={19}/></span><div><b>SCRIPT KIDDIES</b><small>CAREER INITIALIZATION // BH-OS</small></div></div><div className="career-status"><i/> SIMULATION CORE ONLINE</div></div>
    <section className="career-hero"><div className="career-kicker"><span/> OPERATOR INTAKE / STEP 01</div><h1>Choose your <em>path.</em></h1><p>Každá cesta nabízí vlastní výcvik, mise, nástroje a způsob vyhodnocování. Specializaci můžeš později rozšířit — tvoje rozhodnutí určí první nasazení.</p></section>
    <section className="career-grid">{paths.map(path=>{const Icon=path.icon;return <button key={path.id} className={'career-card '+(selected===path.id?'chosen':'')} style={{'--career':path.color} as CSSProperties} onClick={()=>setSelected(path.id)}><div className="career-card-head"><span className="career-icon"><Icon size={23}/></span><span className="career-radio">{selected===path.id?'SELECTED':'SELECT'}</span></div><small>{path.title}</small><h2>{path.name}</h2><p>{path.motto}</p><div className="career-focus">{path.focus}</div></button>})}</section>
    <section className="career-detail" style={{'--career':active.color} as React.CSSProperties}><div><div className="career-kicker"><span/> SELECTED TRAINING TRACK</div><h3>{active.name} <small>// {active.title}</small></h3><p>{active.intro}</p><div className="career-tools"><Terminal size={14}/> {active.tools}</div></div><button className="career-start" onClick={()=>onSelect(selected)}>INITIALIZE WORKSTATION <ArrowRight size={17}/></button></section>
    <div className="career-foot"><span><Lock size={12}/> FICTIONAL TARGETS · ISOLATED LAB · NO EXTERNAL REQUESTS</span><span>PROFILE CAN BE CHANGED LATER</span></div>
  </main>;
}