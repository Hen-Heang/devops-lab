# Docker Command Reference

This replaces the old personal command list with complete, safe examples.

Read a command before running it. Names such as devops-nginx are real examples. Words such as YOUR_ACCOUNT are placeholders and must be replaced.

## Command model

~~~text
docker OBJECT ACTION OPTIONS
~~~

Examples:

~~~powershell
docker image ls
docker container ls
docker volume ls
~~~

The shorter docker ps command is an alias for listing containers.

## Images

### Pull an image

~~~powershell
docker pull nginx:alpine
~~~

What: downloads an image.

Why: containers need a local image.

When: before first use or when intentionally updating a tag.

### List and inspect images

~~~powershell
docker image ls
docker image inspect nginx:alpine
docker history nginx:alpine
~~~

Use inspect for metadata and history for build layers.

### Build an image

~~~powershell
docker build --tag devops-nginx-site:1.0 .
~~~

The final dot is the build context. Run this from the directory containing the intended Dockerfile and files.

### Tag an image for a registry

~~~powershell
docker tag devops-nginx-site:1.0 YOUR_ACCOUNT/devops-nginx-site:1.0
~~~

A tag adds a name. It does not rebuild or upload the image.

### Sign in and push

~~~powershell
docker login
docker push YOUR_ACCOUNT/devops-nginx-site:1.0
~~~

Use an approved access token and secret store. Never put a registry password in this file, a shell script, or Git history.

### Remove one image

~~~powershell
docker image rm devops-nginx-site:1.0
~~~

Inspect docker image ls first. Removal can fail while a container still references the image.

## Containers

### Create and run

~~~powershell
docker run --name devops-nginx -d -p 127.0.0.1:8080:80 nginx:alpine
~~~

docker run creates a new container and starts it.

### List containers

~~~powershell
docker ps
docker ps -a
docker ps --filter name=devops-nginx
~~~

- docker ps shows running containers.
- docker ps -a includes stopped containers.
- filters reduce the chance of acting on the wrong resource.

### Read logs

~~~powershell
docker logs devops-nginx
docker logs --tail 100 devops-nginx
docker logs --since 30m devops-nginx
docker logs -f devops-nginx
~~~

Use -f to follow new output. Press Ctrl+C to stop following without stopping the container.

### Inspect ports and metadata

~~~powershell
docker port devops-nginx
docker inspect devops-nginx
~~~

### Run a command inside a container

~~~powershell
docker exec -it devops-nginx sh
~~~

docker exec requires:

1. a running container;
2. a complete command, such as sh;
3. a shell that actually exists in the image.

Use this for diagnosis, not undocumented permanent changes.

### Copy a file from a container

~~~powershell
docker cp devops-api:/app/application.jar .\application.jar
~~~

The source before the colon is a container name or container ID, not an image ID.

To copy into a container:

~~~powershell
docker cp .\example.txt devops-api:/tmp/example.txt
~~~

Files copied into a container disappear when that container is removed unless they are also stored in persistent storage.

### Stop, start, and restart

~~~powershell
docker stop devops-nginx
docker start devops-nginx
docker restart devops-nginx
~~~

- stop requests a graceful shutdown;
- start starts an existing stopped container;
- restart stops and starts the same container.

Do not start every stopped container with a broad command. Start the exact service you intend.

### Remove a container

~~~powershell
docker stop devops-nginx
docker rm devops-nginx
~~~

Inspect the exact name first. Use force removal only when you understand why graceful stop and normal removal cannot work.

## Volumes

~~~powershell
docker volume ls
docker volume inspect VOLUME_NAME
~~~

A named volume stores data independently from a container.

Before removing one:

~~~powershell
docker ps -a --filter volume=VOLUME_NAME
docker volume inspect VOLUME_NAME
docker volume rm VOLUME_NAME
~~~

Volume removal deletes data. Confirm the name, project, backup requirement, and current users first.

## Networks

~~~powershell
docker network ls
docker network inspect NETWORK_NAME
~~~

Docker networks let containers communicate using container or Compose service names.

## Docker Compose

Run these commands from the directory containing the Compose file.

### Validate

~~~powershell
docker compose config
docker compose config --images
docker compose config --services
~~~

### Start

~~~powershell
docker compose pull
docker compose up -d
docker compose ps
~~~

### Inspect

~~~powershell
docker compose logs --tail 100
docker compose logs --tail 100 SERVICE_NAME
docker compose top
~~~

### Stop or remove

~~~powershell
docker compose stop
docker compose down
~~~

stop keeps containers. down removes the project containers and default network but normally keeps named volumes.

This command also deletes named volumes:

~~~powershell
docker compose down --volumes
~~~

Use it only for disposable data after checking the current directory and Compose project.

## Safe diagnosis order

When a containerized application fails:

1. docker version
2. docker ps -a
3. docker logs --tail 100 CONTAINER_NAME
4. docker inspect CONTAINER_NAME
5. docker port CONTAINER_NAME
6. make one small correction
7. repeat the original application-level verification

Do not begin by deleting every container, image, volume, or network. Deletion removes evidence and may remove data.
