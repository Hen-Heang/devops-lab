# Source record: Docker Fundamentals

**Source:** User-supplied student portal text in the conversation.
**Session:** W2 D1 · August 17, 2026 (matched by title to the supplied course list).

This is a condensed source record, not a verbatim transcript. Personal account details and repeated navigation/schedule text are omitted. Examples and corrections in the companion guide are edited teaching material.

## Supplied objectives and structure

Containerization and the environment-mismatch problem; containers versus VMs; client, daemon, images, containers, and registry; consistency and efficiency; image layers; lifecycle; image/container commands; port publishing; environment variables; logs.

## Supplied practice

1. Install Docker Desktop and run hello-world.
2. Pull and run Nginx, check the page/logs, stop and remove it.
3. Inspect configuration, commands, shell, filesystem, and processes.
4. Create multiple containers and practice lifecycle/cleanup.
5. Set environment variables and inspect/follow logs; the source uses a MySQL password example.

The source estimates 45 minutes theory and 45 minutes practice. Docker resource names were given without URLs.

## Corrections and clarifications

| Supplied point | Treatment in the prepared guide |
|---|---|
| Identical behavior everywhere | Compatible platform, configuration, data, and external services still matter. |
| Containers share the host OS kernel | Linux containers on Docker Desktop use a Linux environment/VM, not the macOS/Windows kernel. |
| Compromise cannot affect host/other containers | Isolation is not absolute; privileges, host mounts, socket access, and kernel issues matter. |
| Resource limits prevent exhaustion | Limits must be configured; they are not supplied automatically to every container. |
| Exact VM/container sizes and speed | Discuss typical overhead without fixed guarantees. |
| Bash and ps always available | Use sh for Alpine and host-side top where appropriate. |
| Old version output is the required version | Check client and server; output versions vary. |
| Bulk prune and possible dry-run | Prefer exact resources; prune has no general dry-run. |
| Stop always SIGTERM | The stop signal is configurable; timeout can cause forceful termination. |
| Print all MySQL env variables | Use a harmless example instead of printing credentials. |

Official references supporting the edits are linked in the prepared guide. The portal status is not evidence of completed local practice.
