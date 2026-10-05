# Lesson 04: Docker Fundamentals

**Course:** W2 D1 · August 17, 2026 · roadmap stage 2

Docker packages an application with the files it needs and runs it as an isolated process. You can run Nginx without installing Nginx directly on your computer, then stop and remove that practice container when finished.

**Goal:** Explain the architecture, run an existing image, verify a web server, inspect its behavior, manage its lifecycle, and clean up exact resources.

**Before starting:** Git fundamentals and basic terminal navigation. Use [Windows setup](../../docs/WINDOWS-SETUP.md) for Windows/WSL, or install Docker Desktop for your platform. Start the engine before practice.

[Source record and corrections](source.md) · [Course list](../COURSE.md)

## 1. What problem does Docker solve?

A Java application may need Java 21, a specific startup command, and operating-system libraries. A Node application may need a particular Node runtime and installed packages. An image packages these requirements so a teammate or CI runner can start the same package on compatible infrastructure.

The image reduces environment differences. It does not make development and production identical: secrets, network access, CPU architecture, mounted data, configuration, and external services still matter.

## 2. Containers and virtual machines

| Question | Container | Virtual machine |
|---|---|---|
| What is isolated? | Application processes and their resources | A guest operating system on virtualized hardware |
| Which kernel is used? | The container host's kernel | A guest kernel |
| What usually ships? | Application, runtime, and needed filesystem files | A guest OS plus application files |
| Startup/size | Often lower overhead; varies by application | Often more overhead; depends on image and workload |
| Security | Process isolation with configuration-dependent limits | A different isolation boundary; still depends on configuration |

Linux containers in Docker Desktop on macOS or Windows run through a Linux environment/VM. They do not share the macOS or Windows kernel directly. Images also need a compatible platform or appropriate emulation; “runs anywhere” has limits.

Containers are not a guarantee that a compromise cannot reach the host. Privileged mode, sensitive host mounts, and Docker socket access can defeat useful boundaries. Resource limits must be configured; they are not automatically supplied to every container. See [Docker Engine security](https://docs.docker.com/engine/security/).

## 3. Docker's pieces

~~~text
You type a Docker CLI command
       ↓
The client contacts the selected Docker engine
       ↓
The engine manages images, containers, networks, and volumes
       ↕
A registry stores images that can be pulled or pushed
~~~

| Piece | Meaning | Example |
|---|---|---|
| Client | The `docker` command you run | `docker ps` |
| Engine / daemon | Background service managing containers | Docker Desktop's configured engine |
| Image | Read-only filesystem layers plus configuration | `nginx:alpine` |
| Container | A created instance of an image, running or stopped | `devops-nginx` |
| Registry | A distribution service for images | Docker Hub or GitHub Container Registry |
| Volume | Storage managed separately from a container | Database data |

An image is like a class and a container like an object instance, but this is only an analogy: containers also have runtime state, networking, and storage.

## 4. Installation checks

~~~bash
docker --version
docker version
docker compose version
docker run --rm hello-world
~~~

These Docker commands work in PowerShell too.

- `docker --version` checks the client binary only.
- `docker version` should show both client and server.
- `hello-world` demonstrates pulling/running a small image; internet access is needed if it is not already local.
- The printed version will differ from the course's old example. You do not need that exact release.

If server information is unavailable, start the engine or check the selected Docker context before continuing.

## 5. Exercise A: run and inspect Nginx

Complete [Lab 01: Docker Basics with Nginx](../../labs/01-docker-basics/README.md). It contains the main exercise, including the intentional port conflict and cleanup.

The central commands are:

~~~bash
docker pull nginx:alpine
docker run --name devops-nginx -d -p 127.0.0.1:8080:80 nginx:alpine
docker ps --filter name=devops-nginx
curl -I http://localhost:8080
docker logs --tail 20 devops-nginx
docker port devops-nginx
docker exec -it devops-nginx sh
~~~

PowerShell: use `curl.exe -I http://localhost:8080`. Exit the container shell with `exit` before continuing host commands.

**Verify:** Nginx returns a successful HTTP response and the browser shows its welcome page. A running container alone does not prove the web server is reachable.

`127.0.0.1:8080:80` means local host port 8080 forwards to container port 80. The port numbers need not match. A second container can use host port 8081 while still using internal port 80.

Use `sh` for this Alpine image; bash is not guaranteed to exist. `docker top devops-nginx` can inspect processes from the host without depending on tools installed inside the image. `docker stats --no-stream devops-nginx` shows a resource snapshot.

## 6. Understand lifecycle and storage

~~~text
docker create → created → docker start → running
docker run    → creates and starts a new container
running       → docker stop → stopped
stopped       → docker start → same container runs again
stopped       → docker rm → container removed
~~~

Pause/unpause freezes/resumes processes. Restart stops and starts an existing container; it does not rebuild an image or apply new run flags. Stop requests graceful shutdown and eventually forces termination if the configured timeout expires. The initial stop signal may be configured by the image. Kill sends a signal immediately, SIGKILL by default.

A stopped container still has its writable layer. Removing that container removes that layer. Named volumes and bind-mounted files have separate lifecycles, so removing a container does not necessarily remove its persistent data. Removing the container does not remove its image.

Images share content-identical layers. A container adds a writable layer above its image. Changing that layer is not a reproducible release method; update source and rebuild instead.

## 7. Exercise B: lifecycle without extra published ports

After the Nginx lab, create a separate lifecycle practice container:

~~~bash
docker create --name lesson-lifecycle nginx:alpine
docker ps -a --filter name=lesson-lifecycle
docker start lesson-lifecycle
docker top lesson-lifecycle
docker pause lesson-lifecycle
docker ps --filter name=lesson-lifecycle
docker unpause lesson-lifecycle
docker stop lesson-lifecycle
docker ps -a --filter name=lesson-lifecycle
docker start lesson-lifecycle
docker logs --tail 10 lesson-lifecycle
docker stop lesson-lifecycle
docker rm lesson-lifecycle
~~~

**Expected:** created, running, paused, running, and exited states appear at the appropriate points. No browser check is expected here because no host port was published. `docker start` reuses the same container; run would create a new one.

## 8. Exercise C: harmless environment variables and logs

Use a disposable container to observe a non-sensitive variable:

~~~bash
docker run --rm -e LESSON_MESSAGE=hello nginx:alpine sh -c 'printenv LESSON_MESSAGE'
~~~

Expected: `hello`, then the container exits and removes itself. The command after the image overrides its default command, so this example does not start the web server.

Environment variables configure an application only when that application actually reads them. Setting PORT on an unmodified Nginx image does not change its listen port.

For the Nginx container while running Lab 01:

~~~bash
docker logs --tail 20 --timestamps devops-nginx
docker logs -f --tail 20 devops-nginx
~~~

Make an HTTP request from another terminal to see an access log. Ctrl+C stops following logs, not the service. Docker logs reads the container's captured stdout/stderr; a program writing only to a file may not show those entries here.

Avoid printing a real database container's entire environment just to check one setting; it can expose credentials. The Compose lesson uses a local database without publishing its port.

## 9. Command lookup and cleanup

| Need | Command |
|---|---|
| List images | `docker image ls` |
| List running / all containers | `docker ps` / `docker ps -a` |
| Read configuration | `docker inspect NAME` |
| Inspect running processes | `docker top NAME` |
| Read recent logs | `docker logs --tail 20 NAME` |
| Enter a supported shell | `docker exec -it NAME sh` |
| Restart an existing container | `docker restart NAME` |
| Stop / remove one container | `docker stop NAME` / `docker rm NAME` |
| Remove a specific unused image | `docker image rm IMAGE:TAG` |

Inspect the targets first. Follow Lab 01's cleanup for its named containers, and remove lesson-lifecycle after its exercise. Keep nginx:alpine if later lessons need it.

Prune commands operate beyond the named exercise. Container prune removes stopped containers in its scope; image prune defaults to dangling images, while `-a` includes images not used by containers. These commands do not provide a general `--dry-run` option. Prefer exact names and tags for these lessons.

## Troubleshooting

| Symptom | Evidence to collect | Fix |
|---|---|---|
| Engine connection fails | `docker version`, selected context | Start/check the configured engine |
| Name already exists | `docker ps -a --filter name=NAME` | Inspect and reuse or remove the exact old container |
| Port conflict | `docker ps`, other local listeners | Choose another host port |
| Shell command missing | Image documentation, available shell | Use sh or host-side tools; do not assume bash/ps exists |
| Website unreachable | Logs, port mapping, process state | Correct the mapping or service behavior, then repeat HTTP check |

## Review questions

1. What is the difference between image and container?
2. Why does `docker --version` not prove the engine works?
3. What differs between run and start?
4. Where does Linux run when using Docker Desktop on macOS?
5. What happens to a named volume when its container is removed?

<details>
<summary>Suggested answers</summary>

1. Image is the package; container is a created instance with runtime state.
2. It only invokes the client binary.
3. Run creates a new instance; start starts an existing stopped one.
4. In Docker Desktop's Linux environment/VM.
5. It remains unless separately removed; container removal and storage removal differ.

</details>

## Completion record

- [ ] Client and engine checks passed on my machine.
- [ ] I verified Nginx over HTTP.
- [ ] I inspected logs, processes, and published ports.
- [ ] I practiced created/running/paused/stopped states.
- [ ] I observed the harmless environment variable.
- [ ] I cleaned up my exact containers and wrote a [daily note](../../templates/daily-note.md).

**Preparation status:** Docker CLI and Compose are installed, but the engine is unavailable. Runtime exercises remain unverified during preparation.

**Next:** [Dockerfile & Image Building](../05-dockerfile-image-building/README.md), then [Docker Compose](../06-docker-compose/README.md).
