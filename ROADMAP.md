# DevOps Roadmap: Beginner to Capstone

This roadmap is designed for a full-stack developer using Spring Boot, Next.js, PostgreSQL, GitHub, and Windows.

Recommended pace: about five focused hours per week. The suggested weeks are guidance, not deadlines.

## How to use the roadmap

For every module:

1. Learn the minimum concept.
2. Explain what it is, why it matters, and when to use it.
3. Complete a small lab.
4. Verify the result with evidence.
5. Cause one safe failure and diagnose it.
6. Write Error -> Cause -> Fix -> Prevention.
7. Clean up.
8. Commit one focused change.

Do not move forward only because you watched a video. Move forward when you can pass the exit gate.

## Stage map

| Stage | Suggested time | Main result |
|---|---:|---|
| 0. Environment | 1 session | Windows, WSL, Git, and Docker are understood and verified |
| 1. Foundations | 1-2 weeks | You can diagnose files, processes, ports, HTTP, and Git state |
| 2. Docker | 2-3 weeks | You can run, build, inspect, and clean up containers |
| 3. Docker Compose | 2 weeks | A full-stack application runs with networking and persistent data |
| 4. CI | 2 weeks | Pull requests automatically lint, test, and build |
| 5. Deployment | 2-3 weeks | A tagged release runs on one Linux VM behind HTTPS |
| 6. Observability | 2 weeks | Health, logs, metrics, and an actionable alert exist |
| 7. Terraform | 1-2 weeks | Disposable infrastructure is created from reviewed code |
| 8. Kubernetes | 2-3 weeks | The application can roll out and roll back on a local cluster |

## Stage 0: prepare the environment

### What

Understand the tools already running on your computer before installing more tools.

### Why

PowerShell, WSL, Docker Desktop, Linux containers, Java, and Node are different layers. Confusing them causes misleading errors.

### When

Complete this once at the beginning and repeat the verification after upgrades or environment failures.

### Work

- Follow [Windows setup](docs/WINDOWS-SETUP.md).
- Verify Git identity and repository remotes.
- Verify Docker client, server, and Compose.
- Learn Windows paths versus WSL paths.

### Exit gate

- [ ] I know which shell is running.
- [ ] docker version reports both client and server.
- [ ] docker run --rm hello-world succeeds.
- [ ] git status works in this repository.
- [ ] I can explain where E:\devops-learning appears in WSL.

## Stage 1: Linux, networking, HTTP, and Git

### What

Learn the operating-system and network facts beneath every deployment.

### Why

Most failures first appear as a missing file, wrong permission, stopped process, unavailable port, DNS problem, or incorrect HTTP response.

### When

Use these skills in WSL, containers, CI runners, remote Linux servers, and incident diagnosis.

### Work

- Complete [Lab 00](labs/00-foundations/README.md).
- Navigate and inspect files.
- Read permissions and identify users.
- Find running processes and listening ports.
- Inspect HTTP status, headers, and body.
- Practise Git branch, diff, log, restore, and pull-request concepts.

### Exit gate

- [ ] I can find which process uses a port.
- [ ] I can read a log and identify its relevant time.
- [ ] I can explain chmod 640 and chmod 755.
- [ ] I can explain browser -> DNS -> server -> application.
- [ ] I can restore a tracked file from Git history without discarding unrelated work.

## Stage 2: Docker fundamentals

### What

Learn images, containers, Dockerfiles, registries, port publishing, logs, volumes, networks, health checks, and multi-stage builds.

### Why

An application should run from a documented package rather than depend on one developer machine.

### When

Use Docker in local development, integration tests, CI, and container-based deployment.

### Work

1. Complete [Lab 01](labs/01-docker-basics/README.md).
2. Complete [Lab 02](labs/02-build-nginx-image/README.md).
3. Containerize one Spring Boot JAR with a supported Java runtime.
4. Containerize one Next.js production build.
5. Run PostgreSQL with a named volume.
6. Rebuild one image using a multi-stage Dockerfile.

### Exit gate

- [ ] I can explain Dockerfile, image, container, registry, and volume.
- [ ] I can explain EXPOSE versus published ports.
- [ ] I can inspect logs, configuration, and processes inside a container.
- [ ] I can rebuild an image and prove the new container uses it.
- [ ] PostgreSQL data survives container removal and recreation.
- [ ] I can remove only the lab resources I created.

## Stage 3: Docker Compose and a local platform

### What

Describe a multi-service system in one Compose file.

### Why

A real full-stack system contains several processes that need repeatable configuration, networking, startup checks, and persistent data.

### When

Use Compose for local integration, demos, test dependencies, and simple single-host deployments.

### Build

~~~text
Browser -> Nginx -> Next.js
                 -> Spring Boot -> PostgreSQL
~~~

Include:

- relative or named mounts;
- one private application network;
- a named PostgreSQL volume;
- health checks;
- environment variable names documented in .env.example;
- no committed secrets;
- only required host ports;
- service names for container-to-container DNS.

### Exit gate

- [ ] docker compose config succeeds.
- [ ] docker compose up --build starts the complete stack.
- [ ] Spring Boot connects to postgres, not localhost.
- [ ] A health check proves the API is ready.
- [ ] Data survives docker compose down and a later restart.
- [ ] A new developer can follow the README from a clean clone.

## Stage 4: Continuous Integration with GitHub Actions

### What

Run validation automatically for every pull request.

### Why

A review should have repeatable evidence that code compiles, tests pass, and artifacts can be built.

### When

Add CI after each project already has reliable local validation commands.

### Build

~~~text
Pull request
|-- frontend lint, test, build
|-- backend unit and integration tests
+-- Docker image build
~~~

### Exit gate

- [ ] A deliberately failing test blocks the pull request.
- [ ] Frontend and backend jobs can run independently.
- [ ] Dependency caches do not hide missing build steps.
- [ ] Workflow permissions use least privilege.
- [ ] No secret is printed in logs.
- [ ] The README lists the same commands CI runs.

## Stage 5: one Linux VM deployment

### What

Deploy a tagged container release to one Linux server behind Nginx and HTTPS.

### Why

A simple VM teaches processes, files, firewalls, DNS, certificates, backups, and rollback before an orchestration platform hides them.

### When

Start after Docker Compose and CI are comfortable.

### Learn

- SSH keys and restricted users;
- Linux service and Docker management;
- container registry authentication;
- domain DNS records;
- Nginx reverse proxy;
- HTTPS certificate renewal;
- firewall rules;
- release tags;
- rollback;
- PostgreSQL backup and restore;
- environment and secret separation.

### Exit gate

- [ ] Only required public ports are open.
- [ ] HTTPS works for the selected domain.
- [ ] The deployed image uses an immutable release tag or digest.
- [ ] A health check runs after deployment.
- [ ] I can roll back to the previous known-good image.
- [ ] I restored a backup into a separate test database.
- [ ] A runbook explains normal deployment and recovery.

## Stage 6: observability

### What

Use health checks, logs, metrics, traces, dashboards, alerts, and runbooks to understand the live system.

### Why

Running is a process state, not proof that an application is correct or useful to users.

### When

Observability begins during development and becomes essential during deployment and incidents.

### Learning order

1. Spring Boot Actuator health and metrics.
2. Docker logs.
3. Structured application logs.
4. Request or correlation IDs.
5. Prometheus and Grafana.
6. One actionable alert.
7. OpenTelemetry basics.
8. Centralized logging.
9. Optional [Elastic Stack lab](elasticsearch/README.md).

### Exit gate

- [ ] I can diagnose a deliberately broken service using evidence.
- [ ] A dashboard answers a real operational question.
- [ ] One alert has a clear owner and action.
- [ ] Health, readiness, and liveness are not treated as identical.
- [ ] Log retention and storage cost are considered.

## Stage 7: Terraform and cloud

### What

Describe infrastructure resources as reviewed code.

### Why

Manual cloud setup is difficult to reproduce, compare, and recover.

### When

Start after manually deploying and understanding a small environment.

### Work

- Learn provider, resource, data source, variable, output, state, and module.
- Use format, validate, plan, apply, and destroy.
- Begin with disposable or free local resources.
- Select one cloud only after the local workflow is understood.
- Store credentials outside configuration.
- Add cost and cleanup checks.

### Exit gate

- [ ] terraform fmt and terraform validate pass.
- [ ] I read and explain the plan before applying.
- [ ] State and credentials are not committed.
- [ ] I can recreate a disposable environment from code.
- [ ] I safely destroy unused resources and verify billing impact.

## Stage 8: Kubernetes

### What

Operate container workloads through desired-state objects such as Deployments, Services, ConfigMaps, Secrets, and Ingress.

### Why

Kubernetes supports rollout, recovery, scaling, and service discovery for larger container platforms.

### When

Begin only after Linux, Docker, Compose, CI/CD, one VM deployment, and observability are understood.

### Work

- Use a local learning cluster first.
- Learn Pod, Deployment, ReplicaSet, Service, Namespace, and Ingress.
- Add resource requests and limits.
- Add readiness and liveness probes.
- Perform rolling update and rollback.
- Diagnose CrashLoopBackOff and image-pull failures.
- Learn Helm only after understanding the generated Kubernetes objects.

### Exit gate

- [ ] The backend runs on a local cluster.
- [ ] A Service or Ingress exposes only the intended endpoint.
- [ ] Configuration and secrets are separated.
- [ ] Resource requests and limits exist.
- [ ] I perform and verify a rolling update.
- [ ] I perform and verify a rollback.
- [ ] I diagnose one startup failure without deleting random resources.

## Final capstone

Take one real Spring Boot and Next.js application through the complete lifecycle:

- [ ] documented local setup;
- [ ] repeatable frontend and backend tests;
- [ ] production Dockerfiles;
- [ ] Docker Compose with PostgreSQL and Nginx;
- [ ] GitHub Actions CI;
- [ ] versioned image publishing;
- [ ] Linux VM deployment;
- [ ] domain and HTTPS;
- [ ] database backup and restore;
- [ ] health checks, logs, metrics, and alerts;
- [ ] rollback procedure;
- [ ] Terraform infrastructure;
- [ ] later Kubernetes deployment;
- [ ] architecture diagram and operational runbook.

## Topics to postpone

These are useful, but they create distraction before the fundamentals:

- multi-cloud architecture;
- service mesh;
- multi-cluster Kubernetes;
- advanced Kubernetes operators;
- complex microservices;
- GitOps platforms;
- certification study without practical labs.

## Progress rule

Mark a checkbox complete only when you have evidence. Useful evidence includes:

- command output with secrets removed;
- an HTTP response;
- a test report;
- a screenshot without sensitive data;
- a Git commit;
- a lab note explaining Error -> Cause -> Fix;
- successful cleanup and rerun from a clean state.
