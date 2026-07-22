# Lab 01 — Docker Basics with Nginx

## Objective

Learn the basic container lifecycle by running Nginx, inspecting it, reading its logs, and removing it safely.

## Prerequisites

- Docker Desktop or Docker Engine is installed.
- Docker is running.

Verify:

```bash
docker --version
docker info
```

## Concepts

- **Image:** A packaged, read-only template used to create containers.
- **Container:** A running or stopped instance of an image.
- **Registry:** A place where images are stored and distributed.
- **Port publishing:** Maps a host port to a container port.

## Step 1 — Pull the image

```bash
docker pull nginx:alpine
```

Inspect downloaded images:

```bash
docker image ls
```

## Step 2 — Run Nginx

```bash
docker run --name devops-nginx -d -p 8080:80 nginx:alpine
```

Meaning:

- `--name devops-nginx`: gives the container a readable name
- `-d`: runs it in the background
- `-p 8080:80`: maps host port `8080` to container port `80`
- `nginx:alpine`: uses the Alpine-based Nginx image

## Step 3 — Verify

```bash
docker ps
curl -I http://localhost:8080
```

Open this address in a browser:

```text
http://localhost:8080
```

Expected result: the Nginx welcome page and an HTTP success response.

## Step 4 — Inspect and troubleshoot

Read logs:

```bash
docker logs devops-nginx
docker logs -f devops-nginx
```

Inspect metadata:

```bash
docker inspect devops-nginx
```

Enter the container:

```bash
docker exec -it devops-nginx sh
```

Inside the container, try:

```sh
hostname
ls -la /usr/share/nginx/html
cat /usr/share/nginx/html/index.html
exit
```

## Step 5 — Understand container state

Stop and confirm:

```bash
docker stop devops-nginx
docker ps
docker ps -a
```

Start it again:

```bash
docker start devops-nginx
curl -I http://localhost:8080
```

## Step 6 — Cleanup

```bash
docker stop devops-nginx
docker rm devops-nginx
```

Optional image cleanup:

```bash
docker image rm nginx:alpine
```

## Troubleshooting challenge

Run a second container using the same host port:

```bash
docker run --name devops-nginx-2 -d -p 8080:80 nginx:alpine
```

It should fail because the host port is already allocated. Fix it by choosing a different host port:

```bash
docker run --name devops-nginx-2 -d -p 8081:80 nginx:alpine
```

Clean it up afterward.

## Questions to answer in your note

1. What is the difference between an image and a container?
2. What does `8080:80` mean?
3. Why does `docker ps` not show stopped containers?
4. What is the difference between `docker stop` and `docker rm`?
5. Where did Nginx store its default HTML file?

## Completion check

- [ ] I can run a named container.
- [ ] I can publish a port.
- [ ] I can inspect logs and metadata.
- [ ] I can enter a running container.
- [ ] I can stop, restart, and remove it.
- [ ] I documented at least one error and fix.

## Next lab

Build your own Nginx image containing a custom static page using a `Dockerfile`.
