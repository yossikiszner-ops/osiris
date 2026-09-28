import type { PublicCameraResult } from './types';

export const INTELLIGENCE_AGENT_TOOLS = {
  search_public_cameras: {
    description: 'Find public or explicitly authorized cameras near a place or map area. Never searches private or access-controlled cameras.',
    input: { query: 'string', radiusKm: 'number?' },
  },
  set_map_layers: {
    description: 'Turn OSIRIS X map layers on or off.',
    input: { layers: 'string[]' },
  },
  zoom_to: {
    description: 'Move the map to a named public place or coordinates.',
    input: { query: 'string?' , latitude: 'number?', longitude: 'number?' },
  },
  open_public_camera: {
    description: 'Open a camera already returned by the authorized public camera catalog.',
    input: { cameraId: 'string' },
  },
  query_events: {
    description: 'Query normalized public-source events for an area and time window.',
    input: { query: 'string', since: 'string?' },
  },
  build_timeline: {
    description: 'Build an evidence-linked timeline from currently loaded public-source records.',
    input: { query: 'string', since: 'string?', until: 'string?' },
  },
} as const;

export function onlyAuthorizedPublicCameras(items: PublicCameraResult[]) {
  return items.filter(c => c.publicAuthorized === true);
}
