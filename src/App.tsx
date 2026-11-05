import { useEffect, useState } from 'react';
import LaptopLab from './LaptopLab';
import CareerSelect, { type CareerPath } from './CareerSelect';
import BootSetup from './BootSetup';
import WelcomeGuide from './WelcomeGuide';

const hasInstalledOS=()=>{try{const value=JSON.parse(localStorage.getItem('bh-os-installation')??'null');return value?.installed===true&&value?.os==='RabbitOS 1.0'&&typeof value?.username==='string';}catch{return false;}};
const hasSeenGuide=()=>{try{return localStorage.getItem('bh-welcome-guide-seen')==='true';}catch{return false;}};

export default function App() {
  const [lang,setLang]=useState<'cs'|'en'>('cs');
  const [installed,setInstalled]=useState(hasInstalledOS);
  const [career,setCareer]=useState<CareerPath|null>(()=>{try{const value=localStorage.getItem('bh-career-path');return value==='red'||value==='blue'||value==='purple'||value==='black'?value:null;}catch{return null;}});
  const [showGuide,setShowGuide]=useState(false);
  const [guideInitialized,setGuideInitialized]=useState(hasSeenGuide);
  useEffect(()=>{try{if(career)localStorage.setItem('bh-career-path',career);}catch{/* Session remains playable without storage. */}},[career]);
  useEffect(()=>{if(installed&&career&&!guideInitialized){setShowGuide(true);}},[installed,career,guideInitialized]);
  const closeGuide=()=>{setShowGuide(false);setGuideInitialized(true);try{localStorage.setItem('bh-welcome-guide-seen','true');}catch{/* Guide can still be dismissed for this session. */}};
  if(!installed)return <BootSetup onComplete={()=>setInstalled(true)}/>;
  if(!career)return <CareerSelect onSelect={setCareer}/>;
  return <div className="game-root"><div className="game-global-bar"><span>SCRIPT KIDDIES // RABBITOS OPERATOR WORKSTATION</span><div><button onClick={()=>setShowGuide(true)}>NÁPOVĚDA</button><button onClick={()=>setLang(v=>v==='cs'?'en':'cs')}>{lang.toUpperCase()}</button><button onClick={()=>{try{localStorage.removeItem('bh-career-path');}catch{}setCareer(null);}}>CHANGE CAREER PATH</button></div></div>{showGuide?<WelcomeGuide onClose={closeGuide} onOpenLaptop={closeGuide}/>:<LaptopLab lang={lang} careerPath={career}/>}</div>;
}
