# DevOps Learning for a Full-Stack Java Developer

This repository is a practical, beginner-first DevOps course for someone who already works with Java, Spring Boot, Next.js, PostgreSQL, Git, and GitHub.

You do not need previous Linux, Docker, cloud, or Kubernetes experience.

## Start here

Follow this order. Do not begin with Elasticsearch or Kubernetes.

1. Read [Why DevOps matters](docs/WHY-DEVOPS-FOR-FULLSTACK-JAVA.md).
2. Prepare Windows, WSL 2, Git, and Docker with [Windows setup](docs/WINDOWS-SETUP.md).
3. Learn the main ideas in the [beginner guide](docs/BEGINNER-GUIDE.md).
4. Complete [Lab 00: foundations](labs/00-foundations/README.md).
5. Complete [Lab 01: run an Nginx container](labs/01-docker-basics/README.md).
6. Complete [Lab 02: build an Nginx image](labs/02-build-nginx-image/README.md).
7. Continue through the stages in [ROADMAP.md](ROADMAP.md).

The existing [Elastic Stack lab](elasticsearch/README.md) belongs to the observability stage. It is intentionally not a starting exercise.

## What is DevOps?

DevOps is a way of delivering and operating software reliably. It combines:

- development: writing application code;
- operations: running the application in a real environment;
- automation: making builds, tests, and deployments repeatable;
- feedback: using logs, metrics, alerts, and user results to improve the system;
- collaboration: sharing responsibility instead of throwing work from one team to another.

The complete delivery loop is:

~~~text
Plan -> Code -> Test -> Build -> Package -> Deploy -> Observe -> Improve
~~~

DevOps is not one tool. Docker, GitHub Actions, Nginx, Terraform, and Kubernetes are tools used at different parts of this loop.

## What, why, and when

| Topic | What is it? | Why learn it? | When do you use it? |
|---|---|---|---|
| Linux and shell | The operating system and command interface used by most servers | To inspect files, processes, ports, permissions, and logs | Local WSL practice, containers, servers, and CI runners |
| Networking and HTTP | Rules that let browsers and services communicate | To diagnose DNS, ports, TLS, proxy, and connection failures | Whenever a frontend, backend, database, or external API communicates |
| Git and GitHub | Version history plus a collaboration platform | To review, test, release, and recover changes safely | Every code or infrastructure change |
| Docker | A way to package an application and its runtime into an image | To run the same package on different machines | Local development, CI, testing, and deployment |
| Docker Compose | A definition for running several containers together | To start a complete stack with one command | Local full-stack development and simple server deployments |
| CI/CD | Automated validation and delivery pipelines | To catch errors early and deploy repeatably | Pull requests, releases, and deployments |
| Nginx and HTTPS | A reverse proxy and secure public entry point | To route traffic and protect connections | When users access a deployed application |
| Observability | Logs, metrics, traces, health checks, dashboards, and alerts | To understand what a running system is doing | During testing, deployment verification, and incidents |
| Terraform | Infrastructure described as version-controlled code | To reproduce cloud resources safely | After you understand the infrastructure you are automating |
| Kubernetes | A platform for operating many containers | To manage replicas, rollouts, recovery, and service discovery | After Docker, Compose, CI/CD, and one VM deployment are comfortable |

## How to study each topic

Use the same seven-step loop for every lesson:

1. Read the concept and explain it in your own words.
2. Predict what a command will do before running it.
3. Run the command yourself.
4. Verify the result instead of assuming success.
5. Break one small thing intentionally.
6. Diagnose the error and record Error -> Cause -> Fix.
7. Clean up the resources you created.

Use [templates/daily-note.md](templates/daily-note.md) for study sessions and [templates/lab-report.md](templates/lab-report.md) for practical exercises. Store completed notes in [notes/](notes/README.md).

## Your first three study sessions

### Session 1: understand your environment

- Complete the Windows setup checks.
- Learn the difference between PowerShell, WSL, and a Linux container.
- Complete Lab 00.
- Record one command that failed and how you fixed it.

### Session 2: run a container

- Complete Lab 01.
- Explain image versus container.
- Explain host port versus container port.
- Stop, start, inspect, and remove the container.

### Session 3: build an image

- Complete Lab 02.
- Explain what each Dockerfile instruction does.
- Change the web page, rebuild, and verify the change.
- Compare a Dockerfile, image, and container.

## Repository structure

~~~text
devops-learning/
|-- README.md                         # Entry point and study instructions
|-- ROADMAP.md                        # Ordered beginner-to-advanced path
|-- docs/
|   |-- BEGINNER-GUIDE.md             # What, why, and when for every major topic
|   |-- WINDOWS-SETUP.md              # Windows, WSL 2, Git, and Docker setup
|   +-- WHY-DEVOPS-FOR-FULLSTACK-JAVA.md
|-- labs/
|   |-- 00-foundations/               # Shell, environment, process, port, and HTTP basics
|   |-- 01-docker-basics/             # Run and manage an existing image
|   +-- 02-build-nginx-image/          # Build your first image
|-- notes/                             # Your completed learning evidence
|-- templates/                         # Reusable note and lab-report templates
+-- elasticsearch/                     # Advanced local observability lab
~~~

## Command conventions

Commands labelled PowerShell run in Windows PowerShell or Windows Terminal:

~~~powershell
Get-Location
docker version
curl.exe -I http://localhost:8080
~~~

Commands labelled Bash run inside WSL or a Linux terminal:

~~~bash
pwd
docker version
curl -I http://localhost:8080
~~~

On Windows PowerShell, prefer curl.exe when following curl examples. Older PowerShell versions use curl as an alias for a different command.

## Safety rules

- Read every command before running it.
- Never paste a command containing a secret into notes, commits, or screenshots.
- Never commit .env files, cloud credentials, private keys, database dumps, or access tokens.
- Before rm, docker rm, docker compose down, or terraform destroy, confirm the exact target.
- Do not use force flags until you understand why the normal command failed.
- Bind local learning services to 127.0.0.1 unless another machine truly needs access.
- Treat access to the Docker daemon as administrator-level access.
- Use disposable local resources before using paid cloud resources.

## Repository content status

These checkboxes describe material present in the repository. They do not mark your personal learning as complete.

- [x] Beginner purpose and learning path
- [x] Windows and WSL setup guide
- [x] Stage 1 foundation lab
- [x] Stage 2 Docker run lab
- [x] Stage 2 Docker build lab
- [ ] Stage 3 full-stack Docker Compose lab
- [ ] Stage 4 GitHub Actions CI
- [ ] Stage 5 Linux VM deployment with Nginx and HTTPS
- [ ] Stage 6 core observability lab
- [x] Optional advanced Elastic Stack configuration and guide
- [ ] Runtime verification of the Elastic Stack on a Docker host
- [ ] Stage 7 Terraform
- [ ] Stage 8 Kubernetes

## Definition of success

The goal is not to memorize commands. The goal is to answer these questions about an application:

- How is it built and tested?
- What runs it outside the IDE?
- Which ports and environment variables does it use?
- How do services find each other?
- Where are secrets stored?
- How is a release deployed and rolled back?
- Where are logs and health information?
- How is data backed up and restored?
- Can a new developer reproduce the environment from the documentation?

When you can answer those questions and demonstrate the answers, you are using DevOps as a full-stack developer.
