'use client';

import { useState } from 'react';
import { Bot, KeyRound, MapPin, Search, X } from 'lucide-react';
import { searchAuthorizedCameraCatalog, type AgentCameraMatch } from '@/lib/ai/camera-search';
import type { AIProviderId, ProviderProbeResult } from '@/lib/ai/types';

type Props = {
  cameras: any[];
  onLocate: (lat:number,lng:number,zoom?:number)=>void;
  onOpenCamera: (camera:any)=>void;
  onEnableCctv?: ()=>void;
};

export default function AIAgentPanel({cameras,onLocate,onOpenCamera,onEnableCctv}:Props) {
  const [open,setOpen]=useState(false);
  const [provider,setProvider]=useState<AIProviderId>('google');
  const [apiKey,setApiKey]=useState('');
  const [probe,setProbe]=useState<ProviderProbeResult|null>(null);
  const [probing,setProbing]=useState(false);
  const [query,setQuery]=useState('');
  const [matches,setMatches]=useState<AgentCameraMatch[]>([]);
  const [status,setStatus]=useState('');

  async function detectModels(){
    setProbing(true); setProbe(null);
    try {
      const r=await fetch('/api/ai/models',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({provider,apiKey})});
      setProbe(await r.json());
    } finally { setProbing(false); }
  }

  async function findPublicCameras(){
    if(!query.trim()) return;
    setStatus('מאתר מקום ומצלמות ציבוריות…'); setMatches([]);
    try{
      const r=await fetch('/api/ai/cameras?q='+encodeURIComponent(query)+'&radiusKm=25');
      const d=await r.json();
      if(!d.place){setStatus('לא נמצא מקום מתאים.');return;}
      onLocate(Number(d.place.lat),Number(d.place.lng),12);
      onEnableCctv?.();
      const found=searchAuthorizedCameraCatalog(cameras,Number(d.place.lat),Number(d.place.lng),Number(d.radiusKm),25);
      setMatches(found);
      setStatus(found.length?`נמצאו ${found.length} מצלמות ציבוריות/מורשות באזור.`:'לא נמצאו מצלמות ציבוריות בקטלוג באזור הזה.');
    }catch{setStatus('החיפוש נכשל. נסה שוב.');}
  }

  return <>
    <button type="button" onClick={()=>setOpen(v=>!v)} className="fixed bottom-20 right-4 z-[520] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/85 shadow-xl" aria-label="סוכן AI">
      <Bot className="h-5 w-5"/>
    </button>
    {open&&<aside dir="rtl" className="fixed bottom-36 right-4 z-[520] w-[min(92vw,420px)] max-h-[70vh] overflow-auto rounded-xl border border-white/15 bg-black/90 p-4 text-white backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between"><strong>סוכן OSIRIS X</strong><button onClick={()=>setOpen(false)}><X className="h-4 w-4"/></button></div>
      <div className="mb-4 rounded-lg border border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs"><KeyRound className="h-4 w-4"/> ספק AI</div>
        <div className="flex gap-2">
          <select value={provider} onChange={e=>{setProvider(e.target.value as AIProviderId);setProbe(null)}} className="rounded bg-black p-2 text-xs"><option value="google">Google Gemini</option><option value="nvidia">NVIDIA</option></select>
          <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="API key" className="min-w-0 flex-1 rounded bg-white/10 p-2 text-xs" autoComplete="off"/>
          <button onClick={detectModels} disabled={!apiKey||probing} className="rounded border border-white/20 px-2 text-xs">{probing?'בודק…':'זהה'}</button>
        </div>
        {probe?.selectedModel&&<p className="mt-2 text-xs text-emerald-300">נבחר אוטומטית: {probe.selectedModel} · {probe.models.length} מודלים זמינים</p>}
        {probe?.error&&<p className="mt-2 text-xs text-red-300">{probe.error}</p>}
        <p className="mt-2 text-[10px] text-white/45">המפתח משמש לבדיקה ואינו נכתב לריפו.</p>
      </div>
      <div className="flex gap-2">
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void findPublicCameras()}} placeholder="לדוגמה: Astoria, New York" className="min-w-0 flex-1 rounded bg-white/10 p-3 text-sm"/>
        <button onClick={findPublicCameras} className="rounded border border-white/20 px-3"><Search className="h-4 w-4"/></button>
      </div>
      <p className="mt-2 text-xs text-white/60">{status}</p>
      <div className="mt-3 space-y-2">{matches.map(c=><button key={String(c.id)} onClick={()=>{onLocate(Number(c.lat??c.latitude),Number(c.lng??c.longitude),16);onOpenCamera(c)}} className="block w-full rounded border border-white/10 p-3 text-right hover:bg-white/10">
        <div className="flex items-center gap-2"><MapPin className="h-3 w-3"/><span className="font-semibold">{String(c.name||'מצלמה ציבורית')}</span></div>
        <div className="mt-1 text-[10px] text-white/50">{String(c.source||'Public source')} · {c.distanceKm} ק״מ · {c.freshness}</div>
      </button>)}</div>
    </aside>}
  </>;
}
