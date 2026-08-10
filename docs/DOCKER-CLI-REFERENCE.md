# Docker CLI Reference

This page supports [Stage 2](../ROADMAP.md#stage-2-docker-fundamentals), [Lab 01](../labs/01-docker-basics/README.md), and [Lab 02](../labs/02-build-nginx-image/README.md). It is a lookup page, not a replacement for running the labs and recording evidence.

The command families are also covered in the external [Docker CLI Tutorial](https://github.com/Mengsreang-Chhoeung/docker-cli-tutorial), an extended walkthrough of fundamentals, volumes, networks, cleanup, Dockerfiles, and a Node.js application. Use that tutorial as a second explanation; use the current [Docker CLI](https://docs.docker.com/reference/cli/docker/) and [Dockerfile](https://docs.docker.com/reference/dockerfile/) references when exact behavior or available flags matter.

## Image versus container, again

An image is a read-only, layered filesystem plus a startup command. A container is a running or stopped instance of an image, with one writable layer on top. Removing a container does not remove the image it came from, and removing an image requires that no container still references it.

## Essential commands

### Inspect what exists

| Command | What it shows |
|---|---|
| `docker version` | Client and server (Engine) version |
| `docker info` | Daemon-wide configuration and resource usage |
| `docker ps` | Running containers |
| `docker ps -a` | All containers, including stopped ones |
| `docker images` | Locally stored images |
| `docker inspect <name>` | Full JSON configuration of an image or container |
| `docker logs <name>` | Captured stdout/stderr of a container |
| `docker logs -f <name>` | Follow logs as they are written |
| `docker stats` | Live CPU, memory, and network usage per container |
| `docker top <name>` | Processes running inside a container |

### Run and manage containers

| Command | What it does |
|---|---|
| `docker run <image>` | Create and start a new container |
| `docker run -d <image>` | Run in detached mode (background) |
| `docker run -it <image> sh` | Run interactively with a shell attached |
| `docker run --name <n> <image>` | Assign a predictable container name |
| `docker run -p 127.0.0.1:8080:80 <image>` | Publish container port 80 only on the local host's port 8080 |
| `docker exec -it <name> sh` | Open a shell inside an already-running container |
| `docker stop <name>` | Send a graceful shutdown signal |
| `docker start <name>` | Start an existing stopped container |
| `docker rm <name>` | Remove a stopped container |
| `docker rm -f <name>` | Force-stop and remove a container |

### Build and manage images

| Command | What it does |
|---|---|
| `docker build -t <name>:<tag> .` | Build an image from a Dockerfile in the current directory |
| `docker tag <image> <new-name>:<tag>` | Add another name/tag to an existing image |
| `docker login [registry]` | Authenticate to Docker Hub or another registry without putting credentials in the command |
| `docker logout [registry]` | Remove the saved credentials for that registry |
| `docker push <name>:<tag>` | Upload an image to a registry |
| `docker pull <name>:<tag>` | Download an image from a registry |
| `docker rmi <image>` | Remove a local image |
| `docker history <image>` | Show the layers that make up an image |

### Work with volumes and networks

Prefer `--mount` in documentation because it names each part explicitly and fails when a bind-mount source path does not exist.

| Command | What it does |
|---|---|
| `docker volume create <volume>` | Create a named volume |
| `docker volume ls` | List named volumes |
| `docker volume inspect <volume>` | Show a volume's Docker-managed location and metadata |
| `docker run --mount type=volume,source=<volume>,target=/data <image>` | Attach a named volume at `/data` in a container |
| `docker run --mount type=bind,source=<host-path>,target=/app <image>` | Mount an existing host path into a container |
| `docker network ls` | List Docker networks |
| `docker network create <network>` | Create a user-defined network with container-name DNS |
| `docker network inspect <network>` | Show network configuration and attached containers |
| `docker run --network <network> --name <name> <image>` | Start a named container on that network |

Do not remove a volume until you have confirmed it does not contain needed database or application data. Prefer Compose service names over fixed container IP addresses.

### Use Docker Compose

These commands belong mainly to [Stage 3](../ROADMAP.md#stage-3-docker-compose-and-a-local-platform), but they are included here for quick lookup.

| Command | What it does |
|---|---|
| `docker compose config` | Parse, merge, and render the resolved Compose configuration |
| `docker compose up --build` | Build changed images and start the application in the foreground |
| `docker compose up -d --build` | Build and start the application in detached mode |
| `docker compose ps` | Show the project's services and state |
| `docker compose logs -f <service>` | Follow one service's logs |
| `docker compose exec <service> sh` | Open a shell in a running service when that image contains `sh` |
| `docker compose down` | Remove the project's containers and networks, preserving named volumes |
| `docker compose down --volumes` | Also remove the project's named and anonymous volumes; data may be lost |

### Clean up

| Command | What it removes |
|---|---|
| `docker container prune` | All stopped containers |
| `docker image prune` | Dangling (untagged) images |
| `docker image prune -a` | All images not used by an existing container |
| `docker volume prune` | Unused anonymous volumes by default; `-a` also includes unused named volumes |
| `docker system prune` | Stopped containers, unused networks, dangling images, and unused build cache |

Run `prune` commands only after reviewing what exists. `docker system prune` does not remove volumes by default; `--volumes` also removes unused anonymous volumes, which may contain persistent data. The `-a` option expands image cleanup beyond dangling images and expands `docker volume prune` from anonymous to named volumes.

## Dockerfile instructions

| Instruction | Purpose |
|---|---|
| `FROM` | Choose the base image to build on |
| `WORKDIR` | Set the working directory for later instructions |
| `COPY` | Copy files from the build context into the image |
| `ADD` | Like `COPY`, but also unpacks local archives and can fetch URLs; prefer `COPY` unless you need that behavior |
| `RUN` | Execute a command while building the image, producing a new layer |
| `ENV` | Set an environment variable available at build and run time |
| `ARG` | Set a build-time-only variable |
| `EXPOSE` | Document which port the container listens on; it does not publish the port |
| `USER` | Select the user for later `RUN` instructions and for the runtime `ENTRYPOINT` or `CMD` |
| `CMD` | Default command for the container, overridable at `docker run` time |
| `ENTRYPOINT` | Fixed command for the container; arguments passed to `docker run` are appended to it |
| `HEALTHCHECK` | Command Docker runs periodically to decide if the container is healthy |

`CMD` alone is overridable; `ENTRYPOINT` alone is fixed. Combining both lets `CMD` supply default arguments to a fixed `ENTRYPOINT`.

## Tagging

Avoid depending on `latest` for anything beyond local experiments. `latest` is just a tag name, not a guarantee of the newest or best image, and two people can build different images that are both tagged `latest`. Use a specific version, a Git commit SHA, or a semantic release tag so a deployment is reproducible.

## Common beginner mistakes

- forgetting `-p` and assuming a container's port is reachable from the host;
- rebuilding an image but running a container created from the old one;
- storing a database's data only inside the container's writable layer;
- editing a `Dockerfile` and forgetting to rebuild before testing;
- publishing a local learning port on every host interface instead of binding it to `127.0.0.1`;
- using a fixed container IP instead of a Compose service or container name on a user-defined network;
- running `docker system prune` without checking what is currently in use.

## Further reading

- [Stage 2: Docker fundamentals](../ROADMAP.md#stage-2-docker-fundamentals)
- [Docker CLI Tutorial (external)](https://github.com/Mengsreang-Chhoeung/docker-cli-tutorial) — a longer walkthrough covering the same commands plus a worked Node.js Express example
- [Docker CLI reference (official)](https://docs.docker.com/reference/cli/docker/)
- [Dockerfile reference (official)](https://docs.docker.com/reference/dockerfile/)
- [Advanced curriculum map](ADVANCED-CURRICULUM-MAP.md) — where Docker fits into a wider DevOps syllabus
