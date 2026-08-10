# Lab 01: Docker Basics with Nginx

## Objective

Run an existing Nginx image, verify its HTTP response, inspect the container, understand its state, diagnose a port conflict, and clean up safely.

## What, why, and when

| Question | Answer |
|---|---|
| What is Docker? | A tool for building images and running isolated container processes |
| Why use it here? | Nginx can run without manually installing Nginx on Windows |
| When is this useful? | Local development, CI, integration testing, and container deployments |

## Prerequisites

- Complete [Windows setup](../../docs/WINDOWS-SETUP.md).
- Docker Desktop is running.
- No important application is using host ports 8080 or 8081.

Verify:

~~~powershell
docker version
docker info
docker ps
~~~

Do not continue if docker version cannot reach the server.

## Core concepts

- Image: a read-only package used to create containers.
- Container: a running or stopped instance of an image.
- Registry: a service that stores and distributes images.
- Port publishing: forwards a host port to a container port.
- Container name: a human-readable identifier for commands and logs.
- Container state: created, running, paused, stopped, or removed.

An image is not a running process. A container is not a permanent server. You can remove and recreate a container from the same image.

## Step 1: pull the image

~~~powershell
docker pull nginx:alpine
docker image ls nginx
~~~

What: Docker downloads the Nginx Alpine image from its registry.

Why: a local image is required before Docker can create a container. Docker run also pulls automatically when the image is missing, but pulling separately makes the step visible.

When: pull when you need an image that is not local or when you intentionally want an updated tag.

The alpine tag is convenient for a beginner lab, but it can move to a newer image. Production builds should use a reviewed version tag or digest.

## Step 2: create and start the container

~~~powershell
docker run --name devops-nginx -d -p 127.0.0.1:8080:80 nginx:alpine
~~~

Meaning:

- docker run creates and starts a container;
- --name devops-nginx gives it a readable name;
- -d runs it in the background;
- 127.0.0.1 limits access to your computer;
- 8080 is the host port;
- 80 is the Nginx port inside the container;
- nginx:alpine selects the image.

The traffic path is:

~~~text
Browser -> 127.0.0.1:8080 on Windows
        -> Docker port forwarding
        -> port 80 inside devops-nginx
        -> Nginx
~~~

Confirm the state:

~~~powershell
docker ps
docker ps --filter name=devops-nginx
~~~

Expected result: devops-nginx is Up and shows the 127.0.0.1:8080 to port 80 mapping.

## Step 3: verify the application

PowerShell:

~~~powershell
curl.exe -I http://localhost:8080
~~~

WSL or Bash:

~~~bash
curl -I http://localhost:8080
~~~

Open http://localhost:8080 in a browser.

Expected result:

- an HTTP success status;
- Nginx response headers;
- the Nginx welcome page in the browser.

Why verify with HTTP? docker ps proves the process is running, but an HTTP request proves traffic reaches Nginx and Nginx responds.

## Step 4: inspect and troubleshoot

Read logs:

~~~powershell
docker logs devops-nginx
docker logs --tail 20 devops-nginx
~~~

Use docker logs -f only when you want to follow new log lines. Press Ctrl+C to stop following; this does not stop the container.

Inspect metadata:

~~~powershell
docker inspect devops-nginx
docker port devops-nginx
~~~

Enter the running container:

~~~powershell
docker exec -it devops-nginx sh
~~~

Inside the container:

~~~sh
hostname
id
ps
ls -la /usr/share/nginx/html
cat /usr/share/nginx/html/index.html
exit
~~~

What: docker exec starts an additional command inside an already running container.

Why: it helps inspect the container filesystem and process environment.

When: use it for diagnosis. Do not make undocumented production fixes inside a running container because they disappear when the container is replaced.

## Step 5: understand container state

Stop the container:

~~~powershell
docker stop devops-nginx
docker ps
docker ps -a --filter name=devops-nginx
~~~

docker ps shows running containers. docker ps -a also shows stopped containers.

Start the same container again:

~~~powershell
docker start devops-nginx
curl.exe -I http://localhost:8080
~~~

docker start reuses an existing stopped container. docker run creates a new container.

## Step 6: diagnose a port conflict

Keep devops-nginx running on host port 8080. Attempt to create another container using the same host port:

~~~powershell
docker run --name devops-nginx-conflict -d -p 127.0.0.1:8080:80 nginx:alpine
~~~

Expected result: the second container cannot start because two processes cannot publish the same host address and port.

Inspect the evidence:

~~~powershell
docker ps
docker ps -a --filter name=devops-nginx-conflict
~~~

The failed docker run can leave a stopped container with the requested name. Remove that specific failed container before reusing the name:

~~~powershell
docker rm devops-nginx-conflict
~~~

Run it with a different host port:

~~~powershell
docker run --name devops-nginx-second -d -p 127.0.0.1:8081:80 nginx:alpine
curl.exe -I http://localhost:8081
~~~

Both containers still listen on port 80 internally. Their host ports are different.

Clean up the second container:

~~~powershell
docker stop devops-nginx-second
docker rm devops-nginx-second
~~~

## Step 7: clean up the main container

Confirm the exact target:

~~~powershell
docker ps -a --filter name=devops-nginx
~~~

Stop and remove it:

~~~powershell
docker stop devops-nginx
docker rm devops-nginx
~~~

Verify:

~~~powershell
docker ps -a --filter name=devops-nginx
~~~

No matching container is the expected result.

Optional image cleanup:

~~~powershell
docker image ls nginx
docker image rm nginx:alpine
~~~

Remove the image only if no other lab needs it. Keeping a reusable image is not an error.

## Error -> Cause -> Fix examples

| Error | Likely cause | Evidence | Fix |
|---|---|---|---|
| docker command not found | Docker Desktop is not installed or PATH is stale | docker version fails before contacting a server | Install Docker Desktop and reopen the terminal |
| Cannot connect to daemon | Docker engine is stopped | docker info cannot show server information | Start Docker Desktop and wait for the engine |
| Port is already allocated | Another process uses host port 8080 | docker ps or Get-NetTCPConnection shows a listener | Identify it, then stop it safely or choose another port |
| Container name is already in use | A running or stopped container has that name | docker ps -a --filter name=devops-nginx | Reuse, rename, or remove that exact container |
| Browser cannot connect | Container stopped, wrong port, or engine issue | docker ps, docker port, and docker logs | Correct the state or port, then repeat the HTTP check |

## Questions to answer in your note

1. What is the difference between an image and a container?
2. What does 127.0.0.1:8080:80 mean?
3. Why does docker ps not show stopped containers?
4. What is the difference between docker run and docker start?
5. What is the difference between docker stop and docker rm?
6. Why did the second 8080 container fail?
7. Why is HTTP verification stronger than only checking docker ps?
8. Where does Nginx store its default HTML file?

## Completion check

- [ ] I can explain image versus container.
- [ ] I can run a named container.
- [ ] I can explain host and container ports.
- [ ] I can verify Nginx with an HTTP request.
- [ ] I can inspect logs and metadata.
- [ ] I can enter and exit a running container.
- [ ] I can stop and restart a container.
- [ ] I diagnosed the expected port conflict.
- [ ] I removed the failed conflict container.
- [ ] I cleaned up every container created by the lab.
- [ ] I documented one Error -> Cause -> Fix.

Continue to [Lab 02: build an Nginx image](../02-build-nginx-image/README.md).
