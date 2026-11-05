import { BookOpen, Laptop, MousePointer2, ShieldCheck, Terminal, Folder, Settings, X, ArrowRight, Compass } from 'lucide-react';

type Props = { onClose: () => void; onOpenLaptop: () => void };

const sections = [
  { icon: Laptop, title: 'Virtuální notebook', text: 'Hlavní herní prostředí. Po zavření této nápovědy se dostaneš na plochu RabbitOS, kde najdeš aplikace, okna a systémové nástroje.' },
  { icon: Terminal, title: 'Terminál a vývoj', text: 'Lab Terminal slouží k práci s příkazovým interpretem hry. Script Lab a VS Code Lab jsou určené pro psaní, úpravu a ukládání vlastních skriptů.' },
  { icon: Folder, title: 'Soubory a poznámky', text: 'Ve Files prohlížíš virtuální soubory a pracovní prostor. Notes slouží k vlastním poznámkám. Změny se ukládají lokálně v herním profilu.' },
  { icon: Settings, title: 'Systém a nástroje', text: 'System Monitor zobrazuje simulovaný stav systému. Kali Tools obsahuje katalog výukových nástrojů. Docker Lab pracuje pouze s virtuálními kontejnery.' },
  { icon: BookOpen, title: 'Dokumentace a učení', text: 'Documentation a Beginner Guide vysvětlují pojmy a ovládání aplikací. BH Search prohledává lokální znalostní obsah.' },
  { icon: MousePointer2, title: 'Ovládání plochy', text: 'Aplikace otevřeš ikonou na ploše nebo v docku. Okna můžeš přepínat a zavírat jejich ovládacími prvky. Stav některých aplikací se ukládá automaticky.' },
];

export default function WelcomeGuide({ onClose, onOpenLaptop }: Props) {
  return <main className="welcome-screen">
    <section className="welcome-panel">
      <header className="welcome-header">
        <div className="welcome-brand"><span><Compass size={20}/></span><div><b>SCRIPT KIDDIES</b><small>OPERATOR QUICK START</small></div></div>
        <button className="welcome-close" onClick={onClose} aria-label="Zavřít nápovědu"><X size={18}/></button>
      </header>
      <div className="welcome-intro">
        <div className="welcome-kicker"><i/> RABBITOS · PRŮVODCE PRO ZAČÁTEK</div>
        <h1>Vítej na palubě.</h1>
        <p>Tady najdeš rychlý přehled toho, kde co v notebooku je a k čemu jednotlivé části slouží. Nejde o návod na řešení konkrétních úkolů — obsahuje pouze orientaci v prostředí a ovládání.</p>
      </div>
      <div className="welcome-grid">{sections.map(({icon:Icon,title,text},index)=><article className="welcome-card" key={title}>
        <div className="welcome-card-top"><span><Icon size={18}/></span><small>0{index+1}</small></div><h2>{title}</h2><p>{text}</p>
      </article>)}</div>
      <div className="welcome-notice"><ShieldCheck size={18}/><p><b>Bezpečné herní prostředí</b><br/>Notebook, soubory, terminál, kontejnery i síťové nástroje jsou simulované. Příkazy se nespouštějí ve skutečném operačním systému a hra neposílá požadavky na reálné cíle.</p></div>
      <footer className="welcome-footer"><span>NÁPOVĚDU MŮŽEŠ KDYKOLI ZNOVU OTEVŘÍT Z HORNÍ LIŠTY.</span><button onClick={onOpenLaptop}>ROZUMÍM, OTEVŘÍT NOTEBOOK <ArrowRight size={16}/></button></footer>
    </section>
  </main>;
}
