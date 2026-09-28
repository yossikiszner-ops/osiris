type CameraLike = {
  id: string | number;
  name?: string;
  city?: string;
  country?: string;
  source?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  external_url?: string;
  feed_url?: string;
  stream_url?: string;
  stream_type?: string;
  [key: string]: unknown;
};

export type AgentCameraMatch = CameraLike & {
  distanceKm: number;
  freshness: 'live' | 'near_live' | 'static' | 'unknown';
  publicAuthorized: true;
};

function radians(v: number) { return v * Math.PI / 180; }
function distanceKm(aLat:number,aLng:number,bLat:number,bLng:number) {
  const R=6371, dLat=radians(bLat-aLat), dLng=radians(bLng-aLng);
  const x=Math.sin(dLat/2)**2+Math.cos(radians(aLat))*Math.cos(radians(bLat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function freshness(c: CameraLike): AgentCameraMatch['freshness'] {
  const t=String(c.stream_type||'').toLowerCase();
  if (['hls','mjpeg','mp4','iframe'].includes(t)) return 'live';
  if (c.feed_url || c.stream_url) return 'near_live';
  if (c.external_url) return 'static';
  return 'unknown';
}

export function searchAuthorizedCameraCatalog(cameras: CameraLike[], lat:number, lng:number, radiusKm=25, limit=25): AgentCameraMatch[] {
  return cameras.flatMap(c => {
    const clat=Number(c.lat ?? c.latitude), clng=Number(c.lng ?? c.longitude);
    if (!Number.isFinite(clat)||!Number.isFinite(clng)) return [];
    const d=distanceKm(lat,lng,clat,clng);
    if (d>radiusKm) return [];
    // Catalog entries are already sourced from OSIRIS public/authorized adapters.
    return [{...c,distanceKm:Math.round(d*10)/10,freshness:freshness(c),publicAuthorized:true as const}];
  }).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,limit);
}
