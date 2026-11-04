import { useMemo, useState } from 'react';
import LaptopLab from './LaptopLab';
import { Activity, ArrowRight, Bug, CheckCircle2, Cpu, FileSearch, Fingerprint, Globe2, HardDrive, Network, Play, Radar, ShieldCheck, Terminal, XCircle } from 'lucide-react';

type Locale = 'cs' | 'en';
type Program = { id: string; name: string; scope: string[]; difficulty: string; reward: number };
type Props = {
  page: 1 | 2 | 3;
  lang: Locale;
  active: Program | null;
  assets: number;
  finding: boolean;
  onRecon: () => void;
  onScan: () => void;
  onReport: () => void;
};

const copy = {
  cs: {
    workspace: 'VIRTUÁLNÍ PRACOVIŠTĚ', subtitle: 'Izolovaná laboratoř • pouze simulované cíle',
    contract: 'AKTIVNÍ PROGRAM', noContract: 'Není vybraný program', target: 'CÍLOVÝ SYSTÉM',
    scope: 'POVOLENÝ ROZSAH', assets: 'ASSETY', findings: 'NÁLEZY',
    tools: 'NÁSTROJE OPERÁTORA', recon: 'Průzkum infrastruktury', reconDesc: 'Objev simulované hosty a služby v povoleném rozsahu.',
    scan: 'Bezpečnostní audit', scanDesc: 'Proveď předpřipravenou kontrolu konfigurace v herní laboratoři.',
    run: 'SPUSTIT SIMULACI', discovered: 'OBJEKTIVY LABORATOŘE', discoveredDesc: 'Výsledky jsou deterministické herní scénáře. Žádné síťové požadavky neopouštějí aplikaci.',
    nodes: 'Síťové uzly', services: 'Simulované služby', status: 'STAV LABORATOŘE', ready: 'PŘIPRAVENO',
    equipment: 'VYBAVENÍ OPERÁTORA', equipmentSub: 'Nástroje jsou součástí lokální herní simulace.',
    terminal: 'BH Terminal', terminalDesc: 'Příkazové rozhraní pro herní úlohy.',
    radar: 'Scope Radar', radarDesc: 'Přehled povolených domén a herních uzlů.',
    fingerprint: 'Service Fingerprint', fingerprintDesc: 'Simulované rozpoznávání technologií.',
    audit: 'Config Auditor', auditDesc: 'Kontrola bezpečnostních nastavení ve scénáři.',
    reports: 'CENTRUM NÁLEZŮ', reportsSub: 'Evidence a příprava bounty reportů.',
    empty: 'Zatím nemáš žádný nález.', emptyDesc: 'Otevři pracoviště a spusť bezpečnostní audit.',
    reportReady: 'NÁLEZ PŘIPRAVEN K REPORTOVÁNÍ', reportTitle: 'Veřejně dostupná API dokumentace',
    severity: 'ZÁVAŽNOST', low: 'LOW', asset: 'DOTČENÝ ASSET', evidence: 'DŮKAZ', evidenceText: 'Simulovaná staging služba zpřístupňuje API dokumentaci bez přihlášení.',
    create: 'VYTVOŘIT NÁVRH REPORTU', safety: 'BEZPEČNOSTNÍ GARANCE',
    safetyText: 'Všechny nástroje pracují pouze s lokálními herními daty. Cíle mimo fiktivní .test rozsah jsou blokovány.'
  },
  en: {
    workspace: 'VIRTUAL WORKSPACE', subtitle: 'Isolated lab • simulated targets only',
    contract: 'ACTIVE PROGRAM', noContract: 'No program selected', target: 'TARGET SYSTEM',
    scope: 'AUTHORIZED SCOPE', assets: 'ASSETS', findings: 'FINDINGS',
    tools: 'OPERATOR TOOLS', recon: 'Infrastructure reconnaissance', reconDesc: 'Discover simulated hosts and services inside the authorized scope.',
    scan: 'Security audit', scanDesc: 'Run a scripted configuration check inside the game lab.',
    run: 'RUN SIMULATION', discovered: 'LAB OBJECTIVES', discoveredDesc: 'Results are deterministic game scenarios. No network requests leave the application.',
    nodes: 'Network nodes', services: 'Simulated services', status: 'LAB STATUS', ready: 'READY',
    equipment: 'OPERATOR EQUIPMENT', equipmentSub: 'Tools are part of the local game simulation.',
    terminal: 'BH Terminal', terminalDesc: 'Command interface for in-game operations.',
    radar: 'Scope Radar', radarDesc: 'Overview of authorized domains and game nodes.',
    fingerprint: 'Service Fingerprint', fingerprintDesc: 'Simulated technology identification.',
    audit: 'Config Auditor', auditDesc: 'Security configuration checks in a scenario.',
    reports: 'FINDINGS CENTER', reportsSub: 'Evidence tracking and bounty report preparation.',
    empty: 'No findings yet.', emptyDesc: 'Open the workspace and run a security audit.',
    reportReady: 'FINDING READY FOR REPORTING', reportTitle: 'Publicly exposed API documentation',
    severity: 'SEVERITY', low: 'LOW', asset: 'AFFECTED ASSET', evidence: 'EVIDENCE', evidenceText: 'A simulated staging service exposes API documentation without authentication.',
    create: 'CREATE REPORT DRAFT', safety: 'SAFETY GUARANTEE',
    safetyText: 'All tools operate on local game data only. Targets outside the fictional .test scope are blocked.'
  }
};

export default function Operations({ page, lang, active, assets, finding, onRecon, onScan, onReport }: Props) {
  const t = copy[lang];
  const program = active ?? { id: 'NML-001', name: 'NoName Logistics', scope: ['noname-logistics.test', 'api.noname-logistics.test', '*.staging.noname-logistics.test'], difficulty: 'LOW', reward: 850 };
  const [selectedTarget, setSelectedTarget] = useState(program.scope[0] ?? 'noname-logistics.test');
  const [running, setRunning] = useState<'recon' | 'scan' | null>(null);
  const targets = useMemo(() => program.scope, [program.id]);
  const affectedAsset = program.scope.find(target => target.includes('staging') || target.startsWith('*.'))?.replace(/^\*\./, 'staging.') ?? program.scope[0] ?? 'unknown.test';
  const start = (kind: 'recon' | 'scan') => {
    if (!selectedTarget.endsWith('.test')) return;
    setRunning(kind);
    window.setTimeout(() => {
      if (kind === 'recon') onRecon();
      else onScan();
      setRunning(null);
    }, 650);
  };

  if (page === 2) return <section className="ops-page">
    <div className="ops-heading"><div className="eyebrow"><i/>{t.equipment}</div><h1>{t.equipment}</h1><p>{t.equipmentSub}</p></div>
    <div className="equipment-grid">
      {[
        { icon: Terminal, name: t.terminal, desc: t.terminalDesc, tag: 'CORE', state: 'READY' },
        { icon: Radar, name: t.radar, desc: t.radarDesc, tag: 'RECON', state: 'READY' },
        { icon: Fingerprint, name: t.fingerprint, desc: t.fingerprintDesc, tag: 'ANALYSIS', state: 'READY' },
        { icon: ShieldCheck, name: t.audit, desc: t.auditDesc, tag: 'AUDIT', state: 'READY' }
      ].map(item => <article className="equipment-card" key={item.name}><div className="equipment-icon"><item.icon size={20}/></div><span className="equipment-tag">{item.tag}</span><h3>{item.name}</h3><p>{item.desc}</p><div className="equipment-status"><CheckCircle2 size={13}/>{item.state}</div></article>)}
    </div>
    <div className="safety-note"><ShieldCheck size={18}/><div><b>{t.safety}</b><p>{t.safetyText}</p></div></div>
  </section>;

  if (page === 3) return <section className="ops-page">
    <div className="ops-heading"><div className="eyebrow"><i/>{t.reports}</div><h1>{t.reports}</h1><p>{t.reportsSub}</p></div>
    {finding ? <article className="finding-card"><div className="finding-top"><span className="finding-severity">{t.low}</span><span className="finding-state"><CheckCircle2 size={13}/> {t.reportReady}</span></div><h2>{t.reportTitle}</h2><div className="finding-meta"><div><small>{t.severity}</small><b>{t.low}</b></div><div><small>{t.asset}</small><b>staging.{affectedAsset}</b></div></div><div className="evidence-box"><b>{t.evidence}</b><p>{t.evidenceText}</p></div><button className="primary" onClick={onReport}><FileSearch size={15}/>{t.create}<ArrowRight size={15}/></button></article> : <div className="empty-findings"><Bug size={28}/><h2>{t.empty}</h2><p>{t.emptyDesc}</p></div>}
  </section>;

  return <section className="ops-page">
    <div className="ops-heading"><div className="eyebrow"><i/>{t.workspace}</div><h1>{t.workspace}</h1><p>{t.subtitle}</p></div>
    <div className="workspace-contract">
      <div><small>{t.contract}</small><h2>{active?.name ?? t.noContract}</h2><span>{program.id} · {program.difficulty} · €{program.reward.toLocaleString('en-US')}</span></div>
      <div className="contract-status"><i/> {t.ready}</div>
    </div>
    <div className="workspace-grid">
      <div className="workspace-main panel">
        <div className="panel-head"><div><span className="terminal-icon"><Cpu size={15}/></span><b>{t.tools}</b><small>LOCAL GAME RUNTIME</small></div><label>● SANDBOX</label></div>
        <div className="target-picker"><label htmlFor="target-picker">{t.target}</label><select id="target-picker" value={selectedTarget} onChange={e=>setSelectedTarget(e.target.value)}>{targets.map(target=><option key={target} value={target}>{target}</option>)}</select></div>
        <div className="tool-action"><div className="tool-action-icon"><Network size={18}/></div><div className="tool-action-copy"><b>{t.recon}</b><p>{t.reconDesc}</p></div><button className="primary" disabled={!!running} onClick={()=>start('recon')}><Play size={13}/>{running==='recon'?'...':t.run}</button></div>
        <div className="tool-action"><div className="tool-action-icon audit"><ShieldCheck size={18}/></div><div className="tool-action-copy"><b>{t.scan}</b><p>{t.scanDesc}</p></div><button className="primary" disabled={!!running} onClick={()=>start('scan')}><Play size={13}/>{running==='scan'?'...':t.run}</button></div>
      </div>
      <aside className="workspace-side">
        <div className="panel workspace-scope"><div className="panel-head"><div><span className="tele-icon"><Globe2 size={15}/></span><b>{t.scope}</b></div></div>{targets.map(target=><code key={target}><CheckCircle2 size={12}/>{target}</code>)}</div>
        <div className="panel workspace-metrics"><div><small><HardDrive size={12}/>{t.assets}</small><strong>{String(assets).padStart(2,'0')}</strong></div><div><small><Bug size={12}/>{t.findings}</small><strong>{finding?'01':'00'}</strong></div><div><small><Activity size={12}/>{t.status}</small><strong className="green">{t.ready}</strong></div></div>
      </aside>
    </div>
    <div className="workspace-footnote"><XCircle size={14}/>{t.discoveredDesc}</div>
    <LaptopLab lang={lang} />
  </section>;
}
