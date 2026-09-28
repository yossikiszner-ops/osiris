import type { AIProviderId, DiscoveredModel, ProviderProbeResult } from './types';

const GOOGLE_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';

function scoreModel(m: DiscoveredModel) {
  const id = m.id.toLowerCase();
  let score = 0;
  if (/pro|reason|thinking/.test(id)) score += 40;
  if (/flash|fast|mini/.test(id)) score += 15;
  if (m.supportsTools) score += 30;
  return score;
}

export async function discoverProviderModels(provider: AIProviderId, apiKey: string): Promise<ProviderProbeResult> {
  if (!apiKey.trim()) return { provider, models: [], error: 'Missing API key' };
  try {
    if (provider === 'google') {
      const r = await fetch(`${GOOGLE_BASE}/models?key=${encodeURIComponent(apiKey)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`Google model discovery failed (${r.status})`);
      const json = await r.json();
      const models: DiscoveredModel[] = (json.models ?? [])
        .filter((m: any) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
        .map((m: any) => ({
          id: String(m.name).replace(/^models\//, ''),
          name: m.displayName || m.name,
          provider,
          supportsTools: true,
        }));
      const selectedModel = [...models].sort((a,b) => scoreModel(b)-scoreModel(a))[0]?.id;
      return { provider, models, selectedModel };
    }

    const r = await fetch(`${NVIDIA_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    if (!r.ok) throw new Error(`NVIDIA model discovery failed (${r.status})`);
    const json = await r.json();
    const models: DiscoveredModel[] = (json.data ?? []).map((m: any) => ({
      id: m.id,
      name: m.id,
      provider,
      supportsTools: true,
    }));
    const selectedModel = [...models].sort((a,b) => scoreModel(b)-scoreModel(a))[0]?.id;
    return { provider, models, selectedModel };
  } catch (e) {
    return { provider, models: [], error: e instanceof Error ? e.message : 'Provider discovery failed' };
  }
}
