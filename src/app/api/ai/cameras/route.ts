import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const q=req.nextUrl.searchParams.get('q')?.trim();
  const radius=Math.min(100,Math.max(1,Number(req.nextUrl.searchParams.get('radiusKm')||25)));
  if (!q) return NextResponse.json({error:'Missing q'}, {status:400});

  const geoUrl=new URL('/api/geosearch',req.nextUrl.origin);
  geoUrl.searchParams.set('q',q);
  const geo=await fetch(geoUrl,{cache:'no-store'});
  const geoJson=await geo.json();
  const place=geoJson?.results?.[0];
  if (!place) return NextResponse.json({query:q,place:null,cameras:[]});

  // Return the target. The client searches its already-loaded authorized catalog;
  // this avoids a second worldwide CCTV download for every agent request.
  return NextResponse.json({
    query:q,
    radiusKm:radius,
    place:{name:place.name,context:place.context,lat:place.lat,lng:place.lng,kind:place.kind},
  });
}
