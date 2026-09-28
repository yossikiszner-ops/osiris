import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/ai/agent';
import type { AIProviderId } from '@/lib/ai/types';
export const runtime='edge';

export async function POST(req:NextRequest){
  try{
    const {provider,apiKey,model,message}=await req.json();
    if(!['google','nvidia'].includes(provider)) return NextResponse.json({error:'Unsupported provider'},{status:400});
    if(!apiKey||!model||!message) return NextResponse.json({error:'Missing provider credentials, model, or message'},{status:400});
    const result=await runAgent(provider as AIProviderId,String(apiKey),String(model),String(message));
    return NextResponse.json(result);
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Agent failed'},{status:500});}
}
