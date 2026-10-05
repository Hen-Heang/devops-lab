# Lesson 11: Dev & Production Docker Compose Stacks

**Course:** W5 D1 · September 7, 2026 · roadmap stages 3 and 5

Keep shared relationships in a base file, then explicitly choose development or production settings. The useful check is the effective model, not whether each YAML file looks reasonable in isolation.

**Goal:** Understand merge behavior, distinguish builds from registry images, manage environment inputs, verify updates, and preserve data deliberately.

**Before starting:** Complete Compose, CI, registry, and VPS lessons. The [minimal stack](examples/stack/compose.yaml) uses the tested lesson 07 API plus a small Nginx frontend. Its users are in memory; it does not claim database integration. For real database/cache practice, use the [lesson 06 full stack](../06-docker-compose/README.md) and adapt its application contracts and persistence checks.

[Source and corrections](source.md) · [Course list](../COURSE.md)

## What differs?

| Setting | Development | Production example |
|---|---|---|
| API package | Build from local starter | Pull a verified image digest |
| Source | Read-only bind mounts plus Node watch | No source mounts |
| API host port | Localhost:3011 | Not published |
| Frontend access | Localhost:8088 | Local diagnostic port; NPM adds public routing later |
| Restart | No automatic restart | unless-stopped |
| Resources/logs | Inspect freely, still respect machine limits | CPU/memory caps and bounded log files |

Development does not require unlimited memory. A restart policy responds to process exits, not every unhealthy state. A production configuration needs more than these settings: backups, migrations, secrets handling, and monitoring depend on the application.

## The three files

- [compose.yaml](examples/stack/compose.yaml): service names, internal network, health checks, proxy configuration mount.
- [compose.dev.yaml](examples/stack/compose.dev.yaml): local build, source mounts, watch mode, host-only ports.
- [compose.prod.yaml](examples/stack/compose.prod.yaml): explicit API image, runtime environment, restart, limits, log rotation.

The base intentionally contains neither API image nor build, so it is a partial model and must be combined with one environment file. There is no automatically discovered override file.

The development mounts point to lesson 07 in this repository. After copying the deployment files to a server, use production; those development source paths are not required there.

## Merge rules to remember

Maps and fields merge according to Compose's rules, not a universal “append every list” rule. Environment keys merge by name; volumes have uniqueness based on mount target; ports have their own matching rules. An override's image does not remove an existing build. Empty values do not universally delete inherited fields.

Recent Compose supports explicit !reset/!override behavior for applicable fields, but check your installed version. This example avoids needing those tags by keeping environment-specific properties out of the base. All relative paths resolve from the first base file, not the shell's current directory or each override's location. See [merge rules](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/).

## Exercise A: development

From the repository root, Bash/WSL/macOS:

~~~bash
cd lessons/11-dev-production-compose/examples/stack
docker compose -f compose.yaml -f compose.dev.yaml config --quiet
docker compose -f compose.yaml -f compose.dev.yaml up --build -d --wait
curl http://localhost:3011/health
curl http://localhost:8088/api/health
~~~

PowerShell can use Set-Location and curl.exe. Change the API's message in the starter source, observe watch mode restart, and make the request again. Keep changes intentional and restore them after the exercise. This affects your local lesson 07 source, not a production image.

Inspect and stop with the same files:

~~~bash
docker compose -f compose.yaml -f compose.dev.yaml logs --tail 30
docker compose -f compose.yaml -f compose.dev.yaml down
~~~

## Exercise B: production model validation

~~~bash
cp .env.example .env
~~~

The included API_IMAGE digest is a **validation placeholder**, not a real published image. Replace it in your editor with the verified output from your own registry workflow before attempting pull/up.

~~~bash
docker compose --env-file .env -f compose.yaml -f compose.prod.yaml config --quiet
docker compose --env-file .env -f compose.yaml -f compose.prod.yaml pull
docker compose --env-file .env -f compose.yaml -f compose.prod.yaml up -d --no-build --wait
curl http://localhost:8088/api/health
~~~

Expected: the API image is pulled, its health contract passes, and the frontend forwards a request. config --quiet avoids printing interpolated credentials. A project .env supplies interpolation inputs; it is not automatically a container environment file. Shell variables can override env-file values.

Keep real .env files out of Git; commit only examples. An encrypted SSH/SCP transfer is not inherently unsafe—the source's “never scp a secret” rule is inaccurate—but destination permissions, authorization, and exposure still matter. Do not paste credentials into notes.

## Exercise C: transfer only deployment files

On your prepared VPS, create /home/deploy/app. From your laptop, using your actual port and host:

~~~bash
scp -P YOUR_PORT compose.yaml compose.prod.yaml frontend.conf deploy.sh deploy@YOUR_VPS_IP:/home/deploy/app/
~~~

Create the server's .env through a trusted session, restrict it to the intended owner, and configure private-registry read access there if needed. You do not transfer application source or build dependencies for this production path.

The provided [deploy.sh](examples/stack/deploy.sh) accepts an exact image@sha256:digest reference. It validates inputs, serializes updates with Linux flock, checks the effective model, pulls, recreates with --wait, and verifies health through Nginx and the API. It records the successful selection in .release.env and retains the prior recorded selection in .previous-release.env.

~~~bash
cd /home/deploy/app
bash ./deploy.sh YOUR_LOWERCASE_IMAGE@sha256:YOUR_64_CHARACTER_DIGEST
~~~

The shell arguments are placeholders; copy a real reference from your successful publish job. A failed pull stops the script. A failed health check stops success reporting and does not record the candidate as the last verified release.

If recreation occurred before a failed check, containers may already be running the candidate. The script deliberately does not pretend the update was transactional or silently roll back data/migrations. Inspect state and invoke a reviewed known-good digest to recover.

## Updates and rollback

Compose up on one host recreates changed containers; it is not a built-in rolling, zero-downtime deployment. --scale is not a substitute for a load-balancing/rollout plan, and fixed host ports prevent all replicas binding the same port.

For a known-good rollback, use the same script with its recorded digest. Pull explicitly before recreation so an absent old image fails early. Verify the app and public path afterward. An image rollback does not undo database migrations or persistent writes.

For later manual commands, load the recorded release as an additional env file:

~~~bash
docker compose --env-file .env --env-file .release.env -f compose.yaml -f compose.prod.yaml ps
docker compose --env-file .env --env-file .release.env -f compose.yaml -f compose.prod.yaml logs --tail 30 api
~~~

Use the same environment/files/project for pull, up, logs, exec, and cleanup. If lesson 12 adds compose.proxy.yaml, include it too and deploy with `--proxy`; the provided script has an explicit mode for that file.

Do not add global image prune to every deployment. Keep known-good registry artifacts according to retention policy. Avoid down -v for routine updates and --remove-orphans unless you reviewed the exact project and intended service set.

## Database adaptation and troubleshooting

For the source's MongoDB example or a Spring Boot/PostgreSQL stack, keep credentials, connection URLs, migrations, and persistence consistent. Mongo initialization settings and PostgreSQL initialization variables act on new data directories; changing .env alone does not change existing database credentials. Mount named storage deliberately and test actual stored data after recreation.

| Symptom | Check | Fix |
|---|---|---|
| Dev mount appears in production | Exact -f file list | Do not include the dev override |
| Production attempts a build | Effective model | Move/remove the inherited build using supported merge behavior |
| New API is healthy, frontend gives 502 | Internal DNS/upstream | Our Nginx config re-resolves api; verify routing too |
| Current manual target differs from running image | .release.env and container inspection | Use recorded release inputs consistently |
| Two updates overlap | Workflow concurrency and server lock | Run one reviewed release at a time |

## Completion

- [ ] I inspected both effective models.
- [ ] I understand source mounts versus runtime configuration mounts.
- [ ] I used a real verified digest before production pull.
- [ ] I can distinguish recreation from rolling deployment.
- [ ] I know how release records and rollback verification work.

**Preparation status:** Local configuration/script checks are provided; no image pull, VPS transfer, deployment, rollback, or production data change has been performed.

**Next:** [Domain Mapping & Nginx Proxy Manager](../12-domain-nginx-proxy-manager/README.md).
