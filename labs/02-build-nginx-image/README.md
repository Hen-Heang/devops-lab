# Lab 02: Build Your First Docker Image

## Objective

Build a custom Nginx image from a Dockerfile, run it, verify its health, change the source, build a new version, and understand why images are immutable.

## What, why, and when

| Question | Answer |
|---|---|
| What is a Dockerfile? | An ordered set of instructions used to build an image |
| Why build an image? | To package application files and runtime behavior repeatably |
| When do you build? | After source or build instructions change, and in CI before publishing |

Lab 01 used an image built by someone else. This lab creates an image owned by this project.

## Files in this lab

~~~text
02-build-nginx-image/
|-- Dockerfile        # Image build instructions
|-- .dockerignore     # Files excluded from the build context
|-- README.md         # This lab guide
+-- site/
    +-- index.html    # Page copied into the image
~~~

## Prerequisites

- Complete [Lab 01](../01-docker-basics/README.md).
- Docker Desktop is running.
- Host port 8082 is available.

Open PowerShell in this lab directory:

~~~powershell
Set-Location labs\02-build-nginx-image
Get-Location
Get-ChildItem -Force
~~~

WSL equivalent:

~~~bash
cd labs/02-build-nginx-image
pwd
ls -la
~~~

## Step 1: read the Dockerfile

~~~dockerfile
FROM nginx:alpine

COPY site/index.html /usr/share/nginx/html/index.html

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1
~~~

### FROM

What: selects the base image.

Why: this image already contains Nginx and its runtime files.

When: every Dockerfile begins from a base image or the special scratch base.

The alpine tag is convenient for this learning lab. A production build should select and regularly update a reviewed version tag or digest.

### COPY

What: copies the project page into the image.

Why: the built image should contain the exact static page it serves.

When: copy source, build artifacts, or configuration that belongs in the immutable image. Never copy secrets.

### HEALTHCHECK

What: asks Nginx for the page from inside the container.

Why: a running process can still be unable to serve requests.

When: add a health check that tests useful application behavior and finishes quickly.

### Build context

The final dot in docker build means the current directory is the build context. Docker can only COPY files from that context.

The .dockerignore file reduces unnecessary build input. Smaller contexts improve speed and reduce accidental file inclusion.

## Step 2: build version 1.0

~~~powershell
docker build --tag devops-nginx-site:1.0 .
~~~

Meaning:

- docker build executes the Dockerfile;
- --tag assigns the repository name and version tag;
- devops-nginx-site is the local image name;
- 1.0 is this lab version;
- the final dot selects the current directory as build context.

Verify:

~~~powershell
docker image ls devops-nginx-site
docker history devops-nginx-site:1.0
~~~

docker history shows image layers created by build instructions. Layers support caching and reuse.

## Step 3: run and verify version 1.0

~~~powershell
docker run --name devops-nginx-site -d -p 127.0.0.1:8082:80 devops-nginx-site:1.0
docker ps --filter name=devops-nginx-site
curl.exe http://localhost:8082
~~~

Open http://localhost:8082 in a browser.

Expected result: the page says that your first Docker image works.

After the health check has had time to run:

~~~powershell
docker inspect --format '{{.State.Health.Status}}' devops-nginx-site
~~~

Expected result: healthy. If it initially reports starting, inspect it again after the configured interval.

Inspect health-check history:

~~~powershell
docker inspect devops-nginx-site
docker logs devops-nginx-site
~~~

## Step 4: change the source and build version 1.1

Open site/index.html in your editor and change the heading or paragraph. Save the file.

The running version 1.0 container does not change. Its image is immutable and already contains the old page.

Build a new tag:

~~~powershell
docker build --tag devops-nginx-site:1.1 .
docker image ls devops-nginx-site
~~~

Watch the build output. Unchanged instructions may use cached layers, while the changed COPY layer is rebuilt.

Replace the old container with one created from version 1.1:

~~~powershell
docker stop devops-nginx-site
docker rm devops-nginx-site
docker run --name devops-nginx-site -d -p 127.0.0.1:8082:80 devops-nginx-site:1.1
curl.exe http://localhost:8082
~~~

Expected result: the response contains your new text.

This is the container deployment pattern:

~~~text
Change source -> Build new image -> Verify image
-> Replace container -> Verify application
~~~

Do not edit files inside a running container as the normal release process.

## Step 5: inspect image identity

~~~powershell
docker image inspect devops-nginx-site:1.0 --format '{{.Id}}'
docker image inspect devops-nginx-site:1.1 --format '{{.Id}}'
~~~

The tags point to different image IDs after the content change.

A tag is a convenient name. A digest identifies exact image content and is safer for reproducible production deployment.

## Step 6: clean up

Confirm the exact resources:

~~~powershell
docker ps -a --filter name=devops-nginx-site
docker image ls devops-nginx-site
~~~

Stop and remove the container:

~~~powershell
docker stop devops-nginx-site
docker rm devops-nginx-site
~~~

Optional image cleanup:

~~~powershell
docker image rm devops-nginx-site:1.0
docker image rm devops-nginx-site:1.1
~~~

Keep the images if you plan to compare them later.

## Troubleshooting

| Symptom | Cause | Evidence | Fix |
|---|---|---|---|
| Dockerfile not found | Command ran from the wrong directory | Get-Location and Get-ChildItem | Change to this lab directory |
| COPY cannot find index.html | Build context does not contain site/index.html | Check the final dot and file path | Use this directory as context |
| Port 8082 already allocated | Another process uses the host port | docker ps or Get-NetTCPConnection | Identify it or choose another port |
| Old page still appears | Old container is running or browser cache is used | docker inspect shows the image tag | Replace the container and request again |
| Health is unhealthy | Nginx cannot serve the page | docker inspect health output and docker logs | Read the failing command output and fix the image |

## Security and production notes

- Do not COPY passwords, .env files, private keys, or tokens.
- Review and update base images regularly.
- Use a precise tag or digest for releases.
- Prefer a non-root runtime when the application and image support it.
- Add metadata and vulnerability scanning in CI later.
- Publish only required ports.
- Treat health checks as one signal, not complete monitoring.

## Questions to answer

1. What does the final dot in docker build mean?
2. What is the difference between a Dockerfile, image, and container?
3. Why did the version 1.0 container keep the old page?
4. Which Dockerfile layer changed for version 1.1?
5. Why should secrets not be copied into an image?
6. What does the health check prove?
7. What is the difference between a tag and a digest?

## Completion check

- [ ] I can explain each Dockerfile instruction.
- [ ] I built image version 1.0.
- [ ] I ran and verified the custom page.
- [ ] The container health became healthy.
- [ ] I changed the source and built version 1.1.
- [ ] I replaced the container and verified the new page.
- [ ] I compared the two image IDs.
- [ ] I cleaned up the container.
- [ ] I documented one Error -> Cause -> Fix.

Next: containerize a small Spring Boot application, then a Next.js application, before building the full Docker Compose stack in Stage 3.
