# n8n integration repair — 12 November 2026

Production portal: https://boiler-nongchok.netlify.app

Workflow: https://thifrank.app.n8n.cloud/workflow/Bp9h1nHM9YAqwOeP

## Authentication directions

1. n8n → portal: `Authorization: Bearer <PORTAL_API_TOKEN>`. The existing Simplified Custom Auth credential uses `{"headers":{"Authorization":"Bearer {{api_key}}"}}`; the real value belongs in API Key. A read-only HTTP Request against `/api/v1/feedback?limit=1` succeeded from n8n on 12 November 2026. The credential modal's separate test currently reports a missing service-origin binding; that message alone does not establish an API rejection.
2. Portal → n8n: POST `https://thifrank.app.n8n.cloud/webhook/boiler-ingest`. Header Auth must have Name `Authorization` and Value `Bearer <N8N_INGEST_TOKEN>`. Keep this token separate from the portal token. Local secret files under `storage/` are ignored by Git.

## Corrected workflow contract

- Upload through the portal so the backend registers a UUID and checks the uploader's role. The old n8n Form trigger must be disabled; its `FORM-…` IDs are not registered portal uploads.
- Both validators require a portal UUID and normalize `asset_id` to `boiler-1`.
- The processing PATCH supplies all counters and `errors: []`.
- Tag mapping/rule asset matching is case insensitive; approved rule values are retained.
- Invalid readings use quality `bad`, missing readings retain `null`, and units are strings.
- Alert transport sends string `rule_version`, `source.file`, and string evidence units. Reference entries with no actual HTTP(S) URL remain in the diagnosis as document names instead of fabricated links.

`n8n/boiler-ingest.json` is a reviewed reference export; credentials contain references, not secret values. n8n's **Import from file adds nodes to the current canvas**. Do not import it into a populated workflow as a replacement; update existing node parameters, or import into a new empty workflow and review connections before publishing.

Run `npm test` for contract, missing data, authentication-origin, and notification checks. This does not replace the live upload → observations → alert → engineer feedback → export acceptance test after ingress authentication and publication.
