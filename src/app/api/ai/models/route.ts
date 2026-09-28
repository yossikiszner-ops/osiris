import { NextRequest, NextResponse } from 'next/server';
import { discoverProviderModels } from '@/lib/ai/providers';
import type { AIProviderId } from '@/lib/ai/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { provider, apiKey } = await req.json();
  if (!['google', 'nvidia'].includes(provider)) {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }
  // Key is used only for this request. Never log or persist it here.
  const result = await discoverProviderModels(provider as AIProviderId, String(apiKey || ''));
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
