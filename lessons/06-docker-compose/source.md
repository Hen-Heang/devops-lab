# Source record: Docker Compose

**Source:** User-supplied student portal text in the conversation.
**Session:** W2 D3 · ON-DE-I-26-WKD-EV-S05 · August 19, 2026 (matched by title to the supplied course list).

This is a condensed source record, not a verbatim transcript. Personal account details and repeated navigation/schedule text are omitted. Examples and corrections in the companion guide are edited teaching material.

## Supplied objectives and structure

Multi-container application model; YAML services, image/build, ports, volumes, environment, depends_on, networks, restart; Compose commands; service DNS; named volumes and bind mounts; .env interpolation and env_file; readiness checks; multi-service examples; development/production overrides.

## Supplied practice

1. Nginx and Redis on one network, inspect both, test connectivity, tear down.
2. Build an Express/pg API and PostgreSQL stack, return database time, test persistence.
3. Add database health and Redis, optionally increment a visits counter with ioredis.
4. Use a development override with nodemon for hot reload.

The source estimates 45 minutes theory and 45 minutes practice; several theory subparts total longer than 45 minutes. Take multiple study sessions as needed.

## Missing original content

The pasted anatomy YAML, general commands block, full-stack YAML, and backend/index.js blocks are blank. The prepared guide and example files fill these gaps with explicitly added teaching material; no missing course recording was watched.

## Corrections and clarifications

| Supplied point | Treatment in the prepared guide |
|---|---|
| curl cache:6379 verifies Redis | Redis is not HTTP; use redis-cli from a networked client. |
| compose exec checks Redis from host | Exec runs inside the service; distinguish caller location. |
| expose restricts visibility | It is not an isolation control; same-network traffic does not require it. |
| host.docker.internal only macOS/Windows | Docker Desktop provides it; native Linux can explicitly configure a host gateway. |
| .env automatically supplies container environment | Interpolation and container environment are separate. |
| Base installs omit=dev, override runs nodemon | Select a development target that actually installs dev dependencies. |
| Anonymous node_modules volume always matches rebuilt image | It can persist stale dependency content; this example mounts only source. |
| depends_on starts services correctly | Readiness needs health conditions; later recovery still needs application/operational handling. |
| SELECT NOW() demonstrates persistence | Store a row and verify it after container recreation. |
| Three replicas plus one fixed host port | Fixed-port replicas conflict; scaling needs a suitable frontend/network model. |
| Production override image cancels build | Merge does not remove a base build field simply because image is added. |
| Compose YAML translates directly to Kubernetes | Similar ideas, different resources and operational behavior. |
| down -v as routine clean-start step | Optional, clearly labeled destruction of disposable lesson data only. |

Official references supporting the edits are linked in the prepared guide. The portal status is not evidence of completed local practice.
