# OSIRIS X Intelligence Agent

The agent is a map operator and evidence analyst, not merely a chat panel.

## Providers

Initial BYOK providers:
- Google Gemini
- NVIDIA API

Settings flow:
1. Choose provider.
2. Paste API key.
3. OSIRIS X calls the provider model-list endpoint.
4. Compatible models are detected.
5. Auto mode ranks compatible models; manual selection remains available.

API keys must never be committed, logged, embedded in client bundles, or stored in repository files. The initial model-discovery route uses a key only for the request. A production deployment should use an encrypted server-side secret store for optional persistence.

## Agent tools

The model may plan calls to constrained application tools:
- search_public_cameras
- set_map_layers
- zoom_to
- open_public_camera
- query_events
- build_timeline

Example:
“Find public street cameras in Astoria, New York.”

The agent geocodes Astoria, searches only the public/authorized camera catalog, returns evidence/source metadata, moves the map and offers to open a selected result.

The agent does not discover private cameras, bypass credentials/access controls, or turn inference into claimed observation.

## Next implementation

- Wire the settings UI to /api/ai/models.
- Implement provider chat/tool-call adapters.
- Connect search_public_cameras to the existing camera catalog.
- Add the agent drawer and map action dispatcher.
- Require provenance/freshness metadata in agent answers.
