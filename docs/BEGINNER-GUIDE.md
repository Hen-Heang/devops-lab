# DevOps Beginner Guide

This guide explains the purpose of each major DevOps topic before asking you to use its tools.

## 1. The problem DevOps solves

Writing correct code is necessary, but users cannot use source code directly. The code must be tested, packaged, configured, deployed, monitored, and repaired.

Without a repeatable delivery process, teams commonly see:

- works on my machine failures;
- forgotten tests;
- different configuration on every computer;
- manual deployments that cannot be reproduced;
- secrets copied into source code;
- no clear rollback process;
- logs that are difficult to find;
- lost database data;
- production failures that nobody can explain quickly.

DevOps reduces these problems with automation, shared ownership, small changes, observable systems, and repeatable environments.

## 2. Three environments you must understand

### Development

What: the environment where you write and change code.

Why: it should provide fast feedback and be easy to reset.

When: every day while developing.

Typical examples: IntelliJ, VS Code, local PostgreSQL, Docker Compose, and test data.

### Test or staging

What: an environment that behaves more like production but is not used by real customers.

Why: it lets a team test integration, configuration, migrations, and deployment steps safely.

When: before releasing a meaningful change.

Typical examples: a preview deployment, temporary database, or shared test server.

### Production

What: the real environment used by customers.

Why: this is where reliability, security, monitoring, backups, and rollback matter most.

When: only after automated checks and release approval pass.

Never assume that a command safe for development is safe for production.

## 3. Linux and the shell

### What

Linux is the operating system used by most cloud servers and Linux containers. A shell is the program that reads commands and starts other programs.

### Why

Applications fail outside an IDE because of files, permissions, processes, memory, ports, DNS, environment variables, or services. Linux commands let you inspect those facts directly.

### When

Use Linux and shell knowledge when:

- working inside WSL;
- entering a container;
- connecting to a server through SSH;
- reading CI job output;
- inspecting a failed service;
- checking files and permissions.

### Example

A Spring Boot application reports that port 8080 is already in use. You inspect the listening process instead of changing random settings.

~~~bash
ss -ltnp
ps aux
~~~

### Common beginner mistakes

- running commands without checking the current directory;
- copying sudo everywhere;
- deleting files with a broad wildcard;
- confusing a Windows path with a Linux path;
- changing permissions to 777 instead of finding the real owner problem.

### Ready-to-continue check

You can navigate directories, read a file, identify a process, inspect a port, set a temporary environment variable, and explain file permissions.

## 4. Networking, DNS, HTTP, and TLS

### What

Networking lets processes communicate. Important building blocks are:

- IP address: identifies a network interface;
- port: identifies a listening application on a machine;
- DNS: converts a name into an IP address;
- HTTP: request-response protocol used by web applications;
- TLS: encrypts a connection and proves server identity;
- reverse proxy: receives public traffic and forwards it to internal services.

### Why

A browser, Next.js server, Spring Boot API, PostgreSQL database, and external API all communicate across network boundaries.

### When

Use networking knowledge when:

- a connection is refused;
- a request times out;
- localhost works outside a container but not inside it;
- a domain resolves to the wrong server;
- a browser reports a TLS certificate problem;
- Nginx returns 502 Bad Gateway.

### Example

Inside Docker Compose, localhost means the current container. Spring Boot should connect to a PostgreSQL service using its Compose service name, such as postgres, instead of localhost.

### Diagnosis order

1. Is the target process running?
2. Is it listening on the expected port?
3. Is the hostname correct?
4. Can DNS resolve it?
5. Can the network path reach it?
6. Is TLS expected?
7. What HTTP status and response body were returned?

## 5. Git and GitHub

### What

Git records file history locally. GitHub hosts repositories and adds pull requests, reviews, issues, releases, and automation.

### Why

Infrastructure and delivery configuration can break a system. It needs the same review and history as application code.

### When

Use Git for every meaningful change to:

- create a focused branch;
- compare changes;
- review before merging;
- restore a previous version;
- connect a commit to a build or deployment;
- create release tags.

### Healthy workflow

~~~text
Create branch -> Make small change -> Validate -> Commit
-> Push -> Pull request -> Automated checks -> Review -> Merge
~~~

### Common beginner mistakes

- committing secrets;
- mixing unrelated changes in one commit;
- using force commands without understanding them;
- treating a pushed commit as a deployed release;
- committing generated build output.

## 6. Docker

### What

Docker builds images and runs containers.

- Dockerfile: instructions for building an image.
- Image: a read-only packaged filesystem and startup definition.
- Container: a running or stopped instance of an image.
- Registry: a server that stores images.
- Volume: persistent data managed separately from a container.
- Bind mount: a host path made available inside a container.

### Why

Docker makes runtime dependencies repeatable. A tested image can include the correct operating-system packages, Java runtime, Node runtime, application files, and startup command.

### When

Use Docker when:

- another developer needs the same runtime;
- CI must build and test in a controlled environment;
- an application will be deployed as a container;
- several disposable dependencies are needed locally;
- you need isolation from host-installed software.

Docker is not a replacement for understanding configuration, networking, persistence, or security.

### Image versus container

Think of an image as a Java class and a container as one object created from it. One image can create many containers.

### Port publishing

~~~text
host-port:container-port
8080:80
~~~

The browser connects to port 8080 on your computer. Docker forwards that traffic to port 80 inside the container.

### Persistence

Removing a container removes its writable container layer. Data that must survive container replacement belongs in a named volume, bind mount, database, or external storage service.

### Common beginner mistakes

- using localhost to reach another container;
- storing database data only inside a container;
- copying secrets into an image;
- using latest everywhere and expecting reproducible builds;
- publishing database or admin ports to every network interface;
- believing EXPOSE publishes a port;
- rebuilding an image but starting an old container.

## 7. Docker Compose

### What

Docker Compose describes multiple containers, their networks, volumes, configuration, and startup relationships in one YAML file.

### Why

A full-stack application usually needs more than one process:

~~~text
Browser -> Nginx -> Next.js
                 -> Spring Boot -> PostgreSQL
~~~

Compose gives the team one documented command instead of a long list of unrelated docker run commands.

### When

Use Compose for:

- local integration environments;
- repeatable demonstrations;
- development dependencies;
- simple single-server deployments;
- learning service networking and persistence.

### Important rule

Startup order is not the same as readiness. A PostgreSQL container can be running before it is ready to accept connections. Use health checks and application retry logic.

### Common beginner mistakes

- absolute bind-mount paths that work on only one computer;
- passwords committed directly in YAML;
- no named volume for database data;
- publishing internal-only ports;
- assuming depends_on proves an application is ready;
- mixing incompatible service versions.

## 8. CI and CD

### What

Continuous Integration, or CI, automatically validates changes. Continuous Delivery or Deployment, or CD, moves validated changes toward an environment.

### Why

Humans forget repetitive steps. A pipeline performs the same checks for every pull request and records the result.

### When

Add CI when a repository has repeatable lint, test, and build commands. Add CD after deployment and rollback are understood.

### A useful first CI pipeline

~~~text
Pull request
|-- frontend lint
|-- frontend tests
|-- backend unit tests
|-- backend integration tests
+-- production builds
~~~

### Delivery versus deployment

- Continuous delivery keeps a validated release ready for an approval.
- Continuous deployment automatically releases every change that passes all gates.

Start with delivery and manual production approval.

### Common beginner mistakes

- putting secrets in workflow files;
- using a successful build as proof the deployed service is healthy;
- deploying from an unreviewed branch;
- no timeout, rollback, or post-deployment check;
- giving workflow tokens broad write permissions.

## 9. Nginx, domains, and HTTPS

### What

Nginx can serve static files and act as a reverse proxy. DNS maps a domain to an address. HTTPS uses TLS to protect browser-server traffic.

### Why

Users should access one secure public address while internal services remain private.

### When

Use a reverse proxy when:

- one domain routes to frontend and API services;
- TLS is terminated at a controlled entry point;
- internal ports should not be public;
- request headers, size limits, or timeouts need central control.

### Example

~~~text
https://app.example.com       -> Next.js
https://app.example.com/api   -> Spring Boot
Spring Boot                   -> PostgreSQL on a private network
~~~

## 10. Observability

### What

Observability is the ability to understand a running system from its outputs.

- logs describe events;
- metrics measure values over time;
- traces follow work across services;
- health checks answer whether a service can operate;
- alerts notify a person about an actionable condition.

### Why

A container showing Running does not prove the application is healthy. A successful deployment does not prove users can complete a request.

### When

Use observability during development, deployment verification, capacity planning, and incident response.

### Recommended learning order

1. Spring Boot Actuator health.
2. Docker container logs.
3. Structured JSON application logs.
4. Request or correlation IDs.
5. Prometheus metrics and Grafana dashboards.
6. Centralized logs.
7. OpenTelemetry traces.
8. Useful alerts and runbooks.

The Elastic Stack example in this repository is an advanced centralized-logging lab, not the first observability exercise.

## 11. Terraform

### What

Terraform describes infrastructure resources in configuration files and compares the desired state with real infrastructure.

### Why

Manual cloud changes are difficult to review, reproduce, and recover.

### When

Use Terraform after you can create and explain the infrastructure manually. Start with disposable local or low-cost resources.

### Core workflow

~~~text
Write configuration -> Format -> Validate -> Plan -> Review -> Apply
~~~

Destroy only after checking the exact workspace, state, provider account, and planned targets.

### Common beginner mistakes

- applying without reading the plan;
- committing state or credentials;
- using one state for unrelated environments;
- learning on expensive resources;
- automating infrastructure that is not yet understood.

## 12. Kubernetes

### What

Kubernetes manages containerized workloads across a cluster. It adds desired-state reconciliation, service discovery, rolling updates, scaling, configuration, and recovery.

### Why

It helps operate many workloads consistently, but adds significant complexity.

### When

Learn Kubernetes after you can:

- build secure images;
- run and debug containers;
- use Compose networks and volumes;
- configure CI/CD;
- deploy to one Linux server;
- create health checks;
- read logs and metrics;
- roll back a release.

Do not use Kubernetes to avoid learning Docker or Linux.

## 13. Secrets and configuration

Configuration changes between environments. Secrets are sensitive configuration values such as passwords, tokens, and private keys.

Use:

- environment variables for simple non-secret runtime configuration;
- ignored local .env files for local-only values;
- a managed secret store for deployed environments;
- example files containing names and safe placeholders;
- least-privilege credentials with rotation and expiration.

Never put a real secret in:

- source code;
- a Dockerfile;
- an image;
- Git history;
- a screenshot;
- a learning note;
- CI log output.

## 14. How to diagnose a failure

Do not change several things at once. Use this order:

1. Read the exact error.
2. Define what should have happened.
3. Check process or container state.
4. Check logs around the failure time.
5. Check configuration and environment variables.
6. Check port, DNS, and network reachability.
7. Check dependency health.
8. Make one small change.
9. Repeat the original verification.
10. Record Error -> Cause -> Fix -> Prevention.

## 15. Beginner glossary

| Term | Simple meaning |
|---|---|
| Artifact | A file produced by a build, such as a JAR or image |
| Build | Convert source code into a runnable or deployable artifact |
| CI runner | A machine that executes pipeline jobs |
| Container | An isolated process created from an image |
| Deployment | Put a selected application version into an environment |
| Environment variable | A named value supplied to a process at runtime |
| Health check | A test that reports whether a service can perform useful work |
| Image | A packaged filesystem and startup definition for containers |
| Incident | An event that reduces system availability, security, or correctness |
| Infrastructure as Code | Manage infrastructure through reviewed configuration |
| Port | A numbered network endpoint used by a process |
| Registry | Storage and distribution service for container images |
| Rollback | Return to a previously working release |
| Secret | Sensitive value that must be protected |
| Service | A long-running application or infrastructure process |
| Volume | Persistent storage managed separately from a container |

## 16. How to know you really understand

For each topic, you should be able to:

1. Define it without copying.
2. Explain which problem it solves.
3. Say when it is appropriate and when it is not.
4. Run a small example.
5. Verify the result.
6. Diagnose one failure.
7. Clean up safely.
8. Document what you learned.

That ability is more valuable than memorizing a long command list.
