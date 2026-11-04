import { useEffect, useState } from 'react';
import LaptopLab from './LaptopLab';
import CareerSelect, { type CareerPath } from './CareerSelect';

export default function App() {
  const [lang,setLang]=useState<'cs'|'en'>('cs');
  const [career,setCareer]=useState<CareerPath|null>(()=>{try{const value=localStorage.getItem('bh-career-path');return value==='red'||value==='blue'||value==='purple'||value==='black'?value:null;}catch{return null;}});
  useEffect(()=>{try{if(career)localStorage.setItem('bh-career-path',career);}catch{/* Session remains playable without storage. */}},[career]);
  if(!career)return <CareerSelect onSelect={setCareer}/>;
  return <div className="game-root"><div className="game-global-bar"><span>SCRIPT KIDDIES // OPERATOR WORKSTATION</span><div><button onClick={()=>setLang(v=>v==='cs'?'en':'cs')}>{lang.toUpperCase()}</button><button onClick={()=>setCareer(null)}>CHANGE CAREER PATH</button></div></div><LaptopLab lang={lang} careerPath={career}/></div>;
}