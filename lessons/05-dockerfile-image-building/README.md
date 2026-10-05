# Lesson 05: Dockerfile & Image Building

**Course session:** W2 D2 · August 18, 2026 · roadmap stage 2

A Dockerfile describes how to package your application. Docker builds an image from that description, then creates running containers from the image.

Read the explanation first, complete the existing static-site lab, then try the included API. You do not need to learn every language example in one session.

## What you will learn

- Explain Dockerfile, image, container, build context, and tag.
- Read the core instructions and distinguish build time from runtime.
- Build, run, check, and clean up an application.
- Reuse cached dependency installation when only source changes.
- Exclude unnecessary host files and keep development dependencies out of the final image.
- Choose the right build and runtime approach for your stack.

**Before starting:** Complete [Docker basics](../../labs/01-docker-basics/README.md), start Docker Desktop, and check `docker version` reports both a client and server. The Node exercise also requires local Node.js and npm for the optional local check.

**Source:** [Course source record and corrections](source.md). The API files and verification steps below are added learning examples, not a copy of the course resource files.

## 1. Understand the three objects

~~~text
Source files + Dockerfile → docker build → Image
Image                    → docker run   → Container
~~~

| Object | Plain meaning | Java comparison |
|---|---|---|
| Dockerfile | Instructions for creating the package | A build recipe, rather than the application itself |
| Image | The packaged application plus runtime files and configuration | A JAR plus the Java runtime and container configuration |
| Container | A running instance with its own writable layer | A running Java process, with container isolation around it |
| Build context | The files the builder can access | The project directory supplied to the build |
| Tag | A name pointing to an image | A release label such as `1.0` |

The same image can start several containers. Their environment variables, mounted data, and external services can differ, so the same image does not guarantee identical application results.

## 2. Read the instructions

| Instruction | What it does | When it matters |
|---|---|---|
| `FROM` | Starts a stage from a base image | Build |
| `WORKDIR /app` | Sets and creates the working directory | Later build steps and the default runtime directory |
| `COPY src/ ./src/` | Copies context files into the image | Build |
| `ADD` | Supports extra copy behavior, including archive extraction and remote sources | Build; prefer COPY for ordinary local files |
| `RUN npm ci` | Executes a build command and saves its filesystem changes | Build |
| `ARG NAME=value` | Defines a build argument in its applicable scope | Build; do not use for secrets |
| `ENV NAME=value` | Sets an environment default in the image | Build and runtime; can be overridden at runtime |
| `EXPOSE 3000` | Records an intended container port | Documentation; does not publish it |
| `USER node` | Changes the user for subsequent steps and runtime | Permissions |
| `CMD ["node", "src/index.js"]` | Sets the default startup command | Runtime; arguments after the image name can replace it |
| `ENTRYPOINT ["node"]` | Sets the startup executable | Runtime; CMD supplies default arguments; `--entrypoint` can override it |

`FROM` starts each stage, but global `ARG` and parser directives can appear before the first `FROM`. Not every instruction creates a filesystem layer: commands such as CMD and ENV principally set configuration. See the [Dockerfile reference](https://docs.docker.com/reference/dockerfile/).

Use exec form (`["node", "src/index.js"]`) for the startup command so the application directly receives container signals. The application must still handle shutdown appropriately.

### Build time versus runtime

~~~dockerfile
RUN npm ci --omit=dev
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
~~~

`RUN` installs packages while building. `CMD` does not start your server during the build; it defines what runs when the container starts. `ENV` provides a default that `docker run -e` can change.

## 3. Build and run: understand every part

~~~bash
docker build -t lesson-api:1.0 .
docker run --name lesson-api -d -p 127.0.0.1:4000:4000 -e PORT=4000 lesson-api:1.0
~~~

- `-t lesson-api:1.0`: name and tag for the built image.
- Final `.`: current directory is the context; run from the directory containing the Dockerfile.
- `--name`: makes the container easy to inspect and clean up.
- `-d`: runs in the background.
- `-p 127.0.0.1:4000:4000`: publish host port 4000 to container port 4000 for local access.
- `-e PORT=4000`: tells this sample application to listen on container port 4000.

The application listens on `0.0.0.0` **inside** the container so published traffic can reach it. The host binding remains `127.0.0.1` for local practice. EXPOSE 3000 does not prevent this application from listening on 4000.

Useful build options:

~~~bash
docker build -f Dockerfile.prod -t lesson-api:prod .
docker build --pull --no-cache -t lesson-api:fresh .
docker image ls lesson-api
docker history lesson-api:1.0
~~~

The first command requires a real `Dockerfile.prod`; it is a syntax example. `--no-cache` bypasses instruction cache; `--pull` checks for a newer base image. These options have different purposes.

## 4. Understand caching

Put dependency manifests before frequently edited source:

~~~dockerfile
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
~~~

If only source changes, the dependency installation can stay cached. If the manifests change, Docker reruns that installation and dependent steps. `npm ci` uses the committed lockfile and fails when it disagrees with package.json.

Caching is not a promise that downloaded packages or OS repositories are current. For Debian-based images, keep package update, install, and cleanup together:

~~~dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
~~~

This is a Debian/Ubuntu example, not an Alpine command. See [cache invalidation](https://docs.docker.com/build/cache/invalidation/).

## 5. Exercise A: static HTML with Nginx

Complete [Lab 02: build an Nginx image](../../labs/02-build-nginx-image/README.md). It already includes HTML, Dockerfile, ignore rules, health checks, rebuilding, and cleanup.

Your checkpoints:

1. Explain why the page is copied to `/usr/share/nginx/html`.
2. Build version 1.0 and open `http://localhost:8082`.
3. Change the page and build version 1.1.
4. Observe that the old container still serves the old image until replaced.
5. Verify the new text and clean up the named container.

Copy only the files Nginx needs; avoid copying the entire lesson folder into its public web directory.

## 6. Exercise B: the included Node.js API

Files are in [examples/node-api](examples/node-api/Dockerfile): source, package manifests, Dockerfile, and `.dockerignore`. The application has `/` and `/health` routes and a configurable PORT.

From the repository root, Bash/WSL/macOS:

~~~bash
cd lessons/05-dockerfile-image-building/examples/node-api
~~~

PowerShell:

~~~powershell
Set-Location lessons\05-dockerfile-image-building\examples\node-api
~~~

The Docker commands below work in both shells. On PowerShell use `curl.exe` instead of `curl` for HTTP checks.

~~~bash
docker build --target production -t lesson-api:1.0 .
docker run --name lesson-api -d -p 127.0.0.1:4000:4000 -e PORT=4000 lesson-api:1.0
curl http://localhost:4000/health
curl http://localhost:4000/
docker logs lesson-api
~~~

Expected: health JSON contains `"status":"healthy"`; `/` contains `"env":"production"`. Uptime varies. Successful `docker run` alone does not prove the API works.

### Verify non-root runtime and production dependencies

~~~bash
docker exec lesson-api id
docker exec lesson-api npm ls --omit=dev
docker exec lesson-api node -e "try { require.resolve('nodemon'); process.exit(1); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; console.log('nodemon absent'); }"
~~~

Expected: a nonzero user ID, Express installed, and `nodemon absent`. Local `node_modules` is ignored, but the image **should** have node_modules installed by npm. That is necessary for Express to run.

### Verify the ignore rule separately

Create `host-only-marker.txt` in this example directory using your editor. The supplied `.dockerignore` excludes it.

The regular Dockerfile copies only selected files, so absence there would not prove `.dockerignore` worked. To test the ignore rule, temporarily create `Dockerfile.ignore-check`:

~~~dockerfile
FROM node:24-alpine
WORKDIR /context
COPY . .
RUN test ! -e host-only-marker.txt
~~~

Run:

~~~bash
docker build -f Dockerfile.ignore-check -t lesson-context-check .
~~~

With the marker present on the host, a successful build proves it was excluded from this COPY. Remove the temporary Dockerfile and marker afterward. See [build context and ignore rules](https://docs.docker.com/build/concepts/context/).

### Verify the cache

Change the response message in `src/index.js`, then build again:

~~~bash
docker build --progress=plain --target production -t lesson-api:1.1 .
~~~

Expected: the unchanged production dependency installation is cached, while the source COPY changes. Inspect the actual log rather than assuming it is cached. The running 1.0 container keeps its old source.

### Optional: two instances of one image

~~~bash
docker run --name lesson-api-a -d -p 127.0.0.1:3000:3000 lesson-api:1.0
docker run --name lesson-api-b -d -p 127.0.0.1:3001:3000 lesson-api:1.0
curl http://localhost:3000/health
curl http://localhost:3001/health
~~~

Both containers use internal port 3000. Different host ports avoid a conflict.

## 7. Exercise C: compare multi-stage targets

Read the included [Dockerfile](examples/node-api/Dockerfile). Each `FROM` starts a stage:

| Stage | Purpose |
|---|---|
| `deps` | Install all dependencies |
| `all-deps` | Run an example image containing development dependencies |
| `production-deps` | Install only runtime dependencies |
| `production` | Copy runtime dependencies and source into the final non-root image |

Build different targets to make a real comparison:

~~~bash
docker build --target all-deps -t lesson-api:all-deps .
docker build --target production -t lesson-api:production .
docker image ls lesson-api
docker run --rm lesson-api:all-deps npm ls nodemon
docker run --rm lesson-api:production npm ls --omit=dev
~~~

Record the actual sizes; do not assume a fixed megabyte value. The development dependency should appear in `all-deps` and be absent from production.

This API has no compilation step. Multi-stage is used to separate installed dependencies from the final runtime. A compiled application adds a builder stage and copies its compiled output. With BuildKit, unrelated stages can be skipped; building production does not automatically run tests in `all-deps`. CI must explicitly run meaningful tests. See [multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

## 8. How this changes for other stacks

These are adaptation notes, not complete runnable exercises.

| Stack | Build or dependency step | Runtime requirement |
|---|---|---|
| FastAPI | Copy requirements first; install with pip | Include FastAPI and Uvicorn; run Uvicorn on `0.0.0.0:8000` |
| Vite React static site | `npm ci`, then `npm run build` | Copy `dist` into Nginx; configure routing if the app needs SPA fallback |
| Next.js static export | Set `output: 'export'`, then build | Serve `out`; server features are unavailable |
| Next.js server application | Set `output: 'standalone'`, then build | Node runtime; copy standalone output plus `.next/static` and public assets when present |
| Go | Build a Linux binary, with CGO disabled when appropriate | Static binary can run in scratch; add certificates if it makes outbound HTTPS requests |
| Spring Boot | Maven/Gradle packages the application | JRE image, application JAR, non-root user, `CMD ["java", "-jar", "app.jar"]` |

**Next.js is not automatically a static site.** The course's `/app/dist` → Nginx example fits a Vite-style React build. It does not support a normal Next.js application with server rendering or server routes. Use the documented [static export](https://nextjs.org/docs/app/guides/static-exports) or [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) path according to the application's features.

**Go:** The course's standard-library-only sample may not produce go.sum. Copy `go.mod` alone in that case; add go.sum when dependencies produce it. Scratch has no shell, package manager, or built-in certificate bundle, so debugging and HTTPS require planning.

**Java:** First practice with your actual generated JAR filename and JDK version. Then separate a JDK builder from the JRE runtime; do not copy your entire Maven cache into production.

## 9. Habits to keep

- Use a base compatible with your application. Alpine is small but uses musl; some native dependencies need a Debian-based alternative.
- Lock application dependencies. A version tag can move; a reviewed base digest identifies exact content. Keep it updated deliberately.
- Exclude `.env`, `.env.*`, Git data, generated dependencies, logs, and private keys as applicable. Use runtime secret injection or build secret mounts when needed.
- `.dockerignore` protects context inputs; it cannot stop a RUN command from creating or downloading sensitive files.
- Run the application as a non-root user when supported. File ownership and writable directories still need to match the application.
- Keep one main concern per container; related worker processes may be valid. Keep the database separate from the API.
- Measure image sizes and verify behavior rather than calling an image production-ready merely because it has multiple stages.

The supplied course uses Node 20. The added exercise uses Node 24, listed as LTS at preparation time; Node 20 is listed as end-of-life. See the [Node release table](https://nodejs.org/en/about/previous-releases). The floating learning tag is not a pinned release.

## 10. Troubleshooting and cleanup

| Symptom | Check | Likely fix |
|---|---|---|
| Cannot connect to Docker daemon | `docker version` | Start Docker Desktop or the configured engine |
| COPY cannot find a file | Context directory, source path, ignore rules | Run from the example directory; include the needed file |
| npm ci fails | Manifest/lockfile mismatch | Update the lockfile intentionally using npm install, then rebuild |
| Port already allocated | `docker ps`, local processes | Choose a free host port; keep the application port correct |
| Browser cannot reach API | `docker logs`, PORT, `-p`, listener address | Match ports and bind inside the container to 0.0.0.0 |
| Old response after rebuilding | Container image tag | Replace the container with the new image |
| Permission denied | Runtime user and path ownership | Give only needed directories appropriate ownership |

List the resources first:

~~~bash
docker ps -a --filter name=lesson-api
docker image ls lesson-api
~~~

Stop and remove only containers you created in this exercise:

~~~bash
docker stop lesson-api
docker rm lesson-api
~~~

If you ran the optional instances, also stop and remove `lesson-api-a` and `lesson-api-b`. If created, remove the temporary context-check image with `docker image rm lesson-context-check`. Keep your lesson images for comparison or remove their exact tags with `docker image rm`. Do not use a global prune for this lesson.

## Check your understanding

1. Why does building an image not start the server?
2. What does the dot in `docker build -t lesson-api:1.0 .` mean?
3. Why can dependency installation stay cached after editing source?
4. Does EXPOSE publish a port?
5. Why should node_modules exist even when `.dockerignore` excludes it?
6. Can any Next.js build be served by copying dist into Nginx?
7. Does a production target automatically execute all other stages or tests?

<details>
<summary>Suggested answers</summary>

1. Build commands create the package; CMD defines the later startup command.
2. The current directory supplies the build context.
3. Dependency inputs and previous relevant steps did not change.
4. No. Use port publishing for host access.
5. The builder installs runtime dependencies; only the host copy is excluded.
6. No. Static export produces out; server features require a server runtime.
7. No. BuildKit uses required stages; run tests explicitly in CI.

</details>

## Completion record

- [ ] I can explain Dockerfile → image → container.
- [ ] I completed the Nginx lab and verified an updated page.
- [ ] I built and ran the API and checked both routes.
- [ ] I verified non-root runtime and development dependency exclusion.
- [ ] I checked cache behavior and the ignore rule.
- [ ] I compared both targets and recorded real sizes.
- [ ] I cleaned up my containers.
- [ ] I recorded results in a [daily note](../../templates/daily-note.md).

**Preparation verification:** The included API passed local checks for `/`, `/health`, runtime PORT and NODE_ENV, JavaScript syntax, and clean SIGTERM shutdown. npm installed successfully from the lockfile. Local Markdown links and diff formatting passed. The Docker engine was unavailable during preparation. Container builds, image sizes, caching, and container behavior remain unverified; these checkboxes record your future practice, not course attendance.

**Next course lesson:** Docker Compose — connect the app, database, and other services. Read the [prepared Compose lesson](../06-docker-compose/README.md). See [roadmap stage 3](../../ROADMAP.md) and the [course session list](../COURSE.md).
