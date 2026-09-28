import type { AIProviderId } from './types';

export type AgentAction =
  | { type:'locate'; query:string; zoom?:number }
  | { type:'camera_search'; query:string; radiusKm?:number }
  | { type:'layers'; enable?:string[]; disable?:string[] }
  | { type:'none' };

export type AgentReply = { reply:string; actions:AgentAction[] };

const SYSTEM = `You are OSIRIS X, an operator assistant for a public-source situational-awareness map.
Interpret Hebrew and English. Return ONLY valid JSON with shape:
{"reply":"short answer in the user's language","actions":[...]}
Allowed actions:
{"type":"locate","query":"place","zoom":12}
{"type":"camera_search","query":"place","radiusKm":25}
{"type":"layers","enable":["cctv","flights"],"disable":[]}
{"type":"none"}
Layer keys: cctv,cctv_previews,live_news,flights,private,jets,military,maritime,satellites,sat_comms,sat_military,sat_navigation,sat_earth,sat_science,earthquakes,fires,weather,infrastructure,global_incidents,alert_pins,gdelt_events,malware,cyber_attacks,cf_outages,cf_attacks,day_night,terrain_3d,terrain_elevation.
Never claim private camera access. Cameras are public/authorized catalog entries only.
If asked to show cameras near a place, use camera_search (it also locates). If asked to go to a place, use locate. If asked to show/hide map categories, use layers.
Do not invent observations that are not in the prompt.`;

function parse(raw:string):AgentReply {
  const cleaned=raw.replace(/^\`\`\`(?:json)?/i,'').replace(/\`\`\`$/,'').trim();
  const start=cleaned.indexOf('{'), end=cleaned.lastIndexOf('}');
  if(start<0||end<start) return {reply:cleaned||'לא הצלחתי לפרש את הבקשה.',actions:[{type:'none'}]};
  try {
    const j=JSON.parse(cleaned.slice(start,end+1));
    return {reply:String(j.reply||''),actions:Array.isArray(j.actions)?j.actions:[{type:'none'}]};
  } catch { return {reply:cleaned,actions:[{type:'none'}]}; }
}

export async function runAgent(provider:AIProviderId, apiKey:string, model:string, message:string):Promise<AgentReply>{
  if(provider==='google'){
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM}]},contents:[{role:'user',parts:[{text:message}]}],generationConfig:{responseMimeType:'application/json',temperature:0.1}})
    });
    if(!r.ok) throw new Error(`Google request failed (${r.status})`);
    const j=await r.json(); return parse(j.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('')||'');
  }
  const r=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
    method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'content-type':'application/json'},
    body:JSON.stringify({model,messages:[{role:'system',content:SYSTEM},{role:'user',content:message}],temperature:0.1,max_tokens:700})
  });
  if(!r.ok) throw new Error(`NVIDIA request failed (${r.status})`);
  const j=await r.json(); return parse(j.choices?.[0]?.message?.content||'');
}
