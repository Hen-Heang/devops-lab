# Lesson 06: Docker Compose

**Course:** W2 D3 · August 19, 2026 · roadmap stage 3

Compose describes several related services in one YAML file. For a full-stack application, it can start the frontend, API, database, and cache with a shared network and the storage you declare.

**Goal:** Read a Compose file, start and inspect services, use service-name networking, prove database persistence, understand environment variables and health checks, and enable development hot reload.

**Before starting:** Complete [Docker Fundamentals](../04-docker-fundamentals/README.md) and [Dockerfile & Image Building](../05-dockerfile-image-building/README.md). Start the Docker engine. Check `docker version` and `docker compose version`.

[Source record and corrections](source.md) · [Course list](../COURSE.md)

The supplied text has missing YAML and API code. The files linked below are complete added learning examples. They are for disposable local practice, with host ports bound to 127.0.0.1; they are not a production deployment.

## 1. Why use Compose?

Without Compose, you repeatedly describe network membership, volumes, credentials, ports, and container commands separately. Compose keeps those relationships together:

~~~text
Browser → localhost:8086 → web (Nginx)
                              ↓ /api/ requests
                           api:3000
                           ↙      ↘
                      db:5432    cache:6379
                      PostgreSQL Redis
                           ↓
                     named pg-data volume
~~~

Compose supplies a local application model. Kubernetes uses different resource types and operational concepts; a Compose file is not directly interchangeable with a Kubernetes manifest.

## 2. Read the file

The examples use the preferred filename `compose.yaml`. The legacy `docker-compose.yml` filename is also supported. Use spaces for YAML indentation and quote port mappings.

| Field | Purpose |
|---|---|
| `services` | Named service definitions |
| `image` | Image to use |
| `build.context` | Directory supplying the Dockerfile and build files |
| `build.target` | Dockerfile stage to build |
| `ports` | Host-to-container port publication |
| `environment` | Values explicitly passed into a service |
| `env_file` | A file supplying variables to the container |
| `volumes` | Bind mounts or named storage attached to a service |
| Top-level `volumes` | Named volume declarations |
| `depends_on` | Startup dependencies, optionally with health conditions |
| `healthcheck` | Command used to assess a service's health |
| `restart` | Container restart policy, when configured |

Use the supported `docker compose` plugin rather than the retired Python Compose v1 command `docker-compose`. The plugin installed here reports v5.4.0, so the space syntax does not imply its version must be exactly v2.

## 3. Exercise A: Nginx and Redis

From the repository root, Bash/WSL/macOS:

~~~bash
cd lessons/06-docker-compose/examples/basics
~~~

PowerShell:

~~~powershell
Set-Location lessons\06-docker-compose\examples\basics
~~~

Read [the basic Compose file](examples/basics/compose.yaml), then run:

~~~bash
docker compose config --quiet
docker compose up -d
docker compose ps
curl -I http://localhost:8085
docker compose exec cache redis-cli ping
docker compose run --rm --no-deps cache redis-cli -h cache ping
docker compose logs --tail 20 web cache
~~~

PowerShell uses `curl.exe` for HTTP requests. Expected: Nginx returns a successful response; both Redis checks return PONG. The one-off Redis client proves another container on the project network can reach the `cache` hostname.

Redis speaks the Redis protocol, not HTTP. Do not test it with `curl cache:6379`. You do not need to install packages inside Nginx to verify this network relationship. `compose exec cache` runs inside the service, not on the host.

Clean up this basic project before moving on:

~~~bash
docker compose down
~~~

## 4. Networking: container names versus host ports

On the default project network, services use DNS names such as api, db, and cache. Inside api, `localhost` means api itself, not your laptop or the database.

| Caller | Target | Address in the full-stack example |
|---|---|---|
| Your browser | Nginx | `http://localhost:8086` |
| Host terminal | API | `http://localhost:3006` |
| Nginx container | API | `http://api:3000` |
| API container | PostgreSQL | Host `db`, port `5432` |
| API container | Redis | `redis://cache:6379` |

Browser JavaScript runs on the host/browser, not inside the web container; it cannot generally resolve Compose's internal api hostname. This example uses relative `/api/` links and Nginx forwards those requests internally.

Only web and api publish host ports. Database and Redis communicate internally without `ports` or `expose`. `expose` documents container ports; it is not a firewall or a requirement for same-network access. `host.docker.internal` is provided on Docker Desktop; native Linux may need explicit host-gateway configuration. See [Compose networking](https://docs.docker.com/compose/how-tos/networking/).

## 5. Exercise B: full stack with a working API

The [full-stack Compose file](examples/full-stack/compose.yaml) includes:

- Nginx serving a page and proxying `/api/`.
- A non-root Node API with `/`, `/live`, `/health`, and `/cache`.
- PostgreSQL with a named data volume.
- Redis with disposable cache data.
- Health checks and dependency startup conditions.

From the basic example directory, Bash:

~~~bash
cd ../full-stack
cp .env.example .env
~~~

PowerShell:

~~~powershell
Set-Location ..\full-stack
Copy-Item .env.example .env
~~~

Edit `.env` in your editor: replace the password placeholder with a password used only for this local practice. Keep API_PORT=3006 and WEB_PORT=8086 unless those ports are occupied. Do not use a production credential.

The dependency lockfile is included, so Docker installs the API with `npm ci`; you do not need local npm to run this stack.

~~~bash
docker compose config --quiet
docker compose up --build -d --wait
docker compose ps
curl http://localhost:3006/
curl http://localhost:3006/health
curl http://localhost:8086/api/
curl http://localhost:8086/api/cache
curl http://localhost:8086/api/cache
~~~

Expected:

- `/` returns a message and `dbTime` from a real database query.
- `/health` returns healthy only when both PostgreSQL and Redis respond.
- Nginx's `/api/` path returns the API result.
- The two cache requests return increasing visit counts. The exact initial number can differ if you already used the route.

Open `http://localhost:8086` to see the page and API links. `--wait` requires a recent Compose plugin; on an older supported installation without it, start with `-d`, inspect ps/health, and make the same HTTP checks yourself.

## 6. Environment variables and secrets

The three relevant mechanisms have different purposes:

| Mechanism | What it does |
|---|---|
| Project `.env` / CLI `--env-file` | Supplies values for `${VARIABLE}` interpolation in the Compose model |
| Service `environment` | Passes explicit variables to the container |
| Service `env_file` | Loads container environment values from a file |

A project `.env` file does not automatically inject all its contents into every container. Shell environment variables can override interpolation values. Use `${NAME:?message}` to reject missing required inputs; the example uses it for POSTGRES_PASSWORD. See [interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).

The API reads PGHOST, PGPORT, PGUSER, PGPASSWORD, and PGDATABASE. Separate connection fields avoid password URL-encoding pitfalls. A DATABASE_URL is also possible when correctly encoded.

`.env` is ignored by Git; `.env.example` contains placeholders. This is not encryption or a production secret store. Container inspection and rendered configuration can reveal environment values. `docker compose config --quiet` validates without printing them. Avoid sharing full config or environment dumps.

## 7. Startup order and health

Short `depends_on: [db]` waits for the database container to start, not for successful queries. The example uses:

~~~yaml
depends_on:
  db:
    condition: service_healthy
  cache:
    condition: service_healthy
~~~

PostgreSQL uses pg_isready; Redis uses redis-cli ping. The API health check makes an HTTP request that checks both dependencies. PostgreSQL accepting connections does not prove schemas, application permissions, or migrations are ready, so the application check is still useful.

These startup conditions are not continuous supervision. If a dependency fails later, the API can become unhealthy; Compose does not automatically repair every failure or restart a container just because it is unhealthy. Applications need reconnection/error handling, and deployments need a monitoring policy. The sample returns 503 for unavailable dependencies and Redis retries its connection. See [startup order](https://docs.docker.com/compose/how-tos/startup-order/).

`/live` only proves the HTTP process responds. `/health` checks its database and cache too. Neither route proves every application feature works.

## 8. Exercise C: prove database persistence

A time query alone is not proof that data survived. Write a row first:

~~~bash
docker compose exec -T db psql -U learner -d lesson -c "CREATE TABLE IF NOT EXISTS lesson_notes (id integer PRIMARY KEY, note text NOT NULL); INSERT INTO lesson_notes VALUES (1, 'kept after recreation') ON CONFLICT (id) DO UPDATE SET note = EXCLUDED.note;"
docker compose exec -T db psql -U learner -d lesson -c "SELECT * FROM lesson_notes;"
docker compose down
docker compose up -d --wait
docker compose exec -T db psql -U learner -d lesson -c "SELECT * FROM lesson_notes;"
~~~

Expected: the row still exists after containers were removed and recreated. Compose reused the named volume.

Redis intentionally has no persistent volume and has persistence disabled in this example. Its counter should start fresh after cache recreation. Use PostgreSQL's row to demonstrate persistence, not the cache count.

### Optional data-loss demonstration

Only for this disposable lesson project, after confirming you do not need its database contents:

~~~bash
docker compose down -v
docker compose up -d --wait
docker compose exec -T db psql -U learner -d lesson -c "SELECT to_regclass('public.lesson_notes');"
~~~

Expected: the result is null because the database was initialized into a fresh volume. `down -v` removes the project's declared named volumes and attached anonymous volumes, not all Docker volumes. It still destroys this lesson database. External volumes are not removed. See [Compose down](https://docs.docker.com/reference/cli/docker/compose/down/).

POSTGRES_USER, DB, and PASSWORD initialize a new PostgreSQL data directory. Editing `.env` later does not change existing database users/passwords. Update an existing database deliberately or recreate only disposable data; do not use volume deletion as a routine fix.

## 9. Exercise D: development override with hot reload

The base file builds the production target without nodemon. The [development override](examples/full-stack/compose.dev.yaml) chooses a stage that installs development dependencies, then mounts only source. This avoids hiding the container's node_modules under a whole-project bind mount.

~~~bash
docker compose -f compose.yaml -f compose.dev.yaml config --quiet
docker compose -f compose.yaml -f compose.dev.yaml up --build -d --wait
docker compose logs -f api
~~~

In another terminal/editor, change the response message in `backend/src/index.js` and save. Then:

~~~bash
curl http://localhost:3006/
~~~

Expected: nodemon reports a restart and the response changes without rebuilding. The source mount is read-only from the container; you edit it on the host. Nodemon uses polling in this lesson for cross-platform mount behavior. Dependency changes still need a lockfile update and image rebuild.

Stop following logs with Ctrl+C. Return to the base model explicitly:

~~~bash
docker compose -f compose.yaml up --build -d --wait
~~~

Default Compose discovery can automatically load `compose.override.yaml` (or its supported legacy equivalent). This lesson names the file `compose.dev.yaml` so dev mode is always an explicit choice. Specify the same file set consistently for config and up. Paths in merged files resolve relative to the base file.

Merge behavior varies by field: ports can accumulate, environment keys are overridden by name, and mounts are matched by target. Adding `image` does not automatically remove a base `build` field. Check the merged model before using overrides. See [merge rules](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/).

The course's `deploy.replicas: 3` plus a fixed host port is not a complete scaling setup: replicas cannot all bind the same host port. Use a suitable load-balancing design and check the capabilities of your actual deployment platform.

### Named volumes and bind mounts

| Storage | What it means | This example |
|---|---|---|
| Named volume | Docker-managed storage outside container lifetime | PostgreSQL pg-data |
| Bind mount | A host file/directory mounted into a container | Nginx files and development source |
| Anonymous volume | Unnamed Docker-managed volume | Not needed by this example |

The course's whole-project mount plus `/app/node_modules` anonymous volume can work, but the volume may retain stale dependencies after rebuilding. It also does not supply nodemon if the image never installed it. Mounting only source and selecting a development target makes the lesson's dependency behavior explicit.

## 10. Debug and clean up

Run commands from the relevant example directory so the project name and configuration are correct:

~~~bash
docker compose ps -a
docker compose logs --tail 30 api db cache web
docker compose exec api id
docker compose exec cache redis-cli ping
docker compose top
~~~

Use `docker compose exec api sh` for a shell. `exec` enters an existing running service; `run --rm` creates a new one-off container. Logs show stdout/stderr, not every log file on disk.

| Problem | Check | Likely fix |
|---|---|---|
| YAML invalid | `config --quiet`, indentation | Use spaces and check the named field |
| Required password missing | Local .env path; shell overrides | Copy example and set a local value |
| API cannot reach db | PGHOST, readiness, logs | Use db:5432; inspect database health and credentials |
| Password fails after .env edit | Existing database volume | Change credentials in the database or reset only disposable data |
| Hot reload command missing | Development build target | Use both files and rebuild development dependencies |
| Old dependencies remain | Image build and mount targets | Update lockfile and rebuild; inspect any dependency volumes |
| Redis check fails using curl | Protocol and endpoint | Use redis-cli |
| Web upstream error | API health and current network | Check API first; recreate web if its upstream address is stale |
| Restart did not apply changes | Model/image differs from container | Use up with the correct files and --build when rebuilding is needed |

For ordinary cleanup:

~~~bash
docker compose down
~~~

This preserves PostgreSQL data. To remove development containers, use the same two `-f` arguments with down. If finished with the disposable database and intentionally deleting it, use `down -v` from the full-stack directory. Avoid global prune. Images and local `.env` remain until separately removed.

## Review questions

1. What does localhost mean inside api?
2. Do db and cache need published ports for the API to reach them?
3. What differs between `.env` interpolation and `env_file`?
4. Does depends_on imply readiness or guarantee later recovery?
5. What proves data survived container recreation?
6. Why does hot reload require a development dependency installation?

<details>
<summary>Suggested answers</summary>

1. The API container itself.
2. No; service DNS and container ports work on the shared network.
3. Interpolation fills the model; service env_file supplies container variables.
4. Short form orders startup; health conditions can gate readiness but do not continuously repair failures.
5. A stored row read back after down and up without deleting its volume.
6. A production-only installation omits nodemon; a mount cannot install the missing package.

</details>

## Completion record

- [ ] I validated both examples and their startup behavior.
- [ ] I checked HTTP, Redis, database time, and proxy routes.
- [ ] I stored a row and verified it after recreation.
- [ ] I can explain intentional volume deletion.
- [ ] I used the development target and observed hot reload.
- [ ] I inspected errors and cleaned up the intended resources.
- [ ] I wrote results in a [daily note](../../templates/daily-note.md).

**Preparation status:** Basic, full-stack, and development Compose models passed config validation. Checks confirmed build targets, private database/cache ports, local published ports, health dependencies, the source mount, and rejection of a missing password. The lockfile installed successfully and JavaScript syntax passed. The API returned 200 on /live and 503 on dependency routes with unavailable local database/cache endpoints; SIGTERM shutdown passed. The Docker engine is unavailable; real container builds, database/cache integration, persistence, proxy behavior, and hot reload have not been runtime-verified.

**Next:** Introduction to CI/CD, roadmap stage 4. That course lesson's detailed text has not been supplied yet; see the [course index](../COURSE.md).
