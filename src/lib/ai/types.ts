export type AIProviderId = 'google' | 'nvidia';

export interface DiscoveredModel {
  id: string;
  name: string;
  provider: AIProviderId;
  supportsTools?: boolean;
  supportsVision?: boolean;
}

export interface ProviderProbeResult {
  provider: AIProviderId;
  models: DiscoveredModel[];
  selectedModel?: string;
  error?: string;
}

export interface AgentToolResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export type IntelligenceFreshness = 'live' | 'near_live' | 'delayed' | 'static' | 'unknown';

export interface PublicCameraResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  source: string;
  sourceUrl?: string;
  freshness: IntelligenceFreshness;
  publicAuthorized: true;
}
