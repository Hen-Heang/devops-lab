# DevOps Roadmap: Beginner to Advanced

This roadmap is designed around a real stack: **Spring Boot + Next.js + PostgreSQL**.

## How to use this roadmap

For each module:

1. Learn the minimum concepts.
2. Complete the lab without blindly copying.
3. Write an Error -> Cause -> Fix note.
4. Commit the result.
5. Continue only when the completion check passes.

A realistic pace is **5 focused hours per week**. Depth matters more than speed.

---

## Stage 1 — Foundations

### 1. Linux and shell

Know:

- Files and directories
- Absolute and relative paths
- Users, groups, ownership, and permissions
- Processes and signals
- Environment variables
- Package installation
- Services and logs
- Basic Bash scripting

Commands to practise:

```bash
pwd
ls -la
cd
mkdir
cp
mv
rm
cat
less
grep
find
chmod
chown
ps
top
kill
env
export
curl
systemctl
journalctl
```

Completion check:

- [ ] Find which process uses a port.
- [ ] Read a service log.
- [ ] Explain `chmod 755`.
- [ ] Write a script that checks whether an HTTP endpoint is healthy.

### 2. Networking and web fundamentals

Know:

- IP address, subnet, gateway, and DNS
- Port and socket
- TCP versus UDP
- HTTP request and response
- HTTP status codes
- HTTPS and TLS at a high level
- Domain resolution
- Reverse proxy
- Firewall and cloud security group

Completion check:

- [ ] Use `curl` to inspect headers and status codes.
- [ ] Explain the path from browser -> DNS -> server -> application.
- [ ] Explain why frontend, backend, and database use different ports.

### 3. Git and delivery workflow

Know:

- Commit, branch, merge, rebase, tag
- Pull request workflow
- Semantic commit messages
- `.gitignore`
- Release tags and changelogs

Completion check:

- [ ] Build one feature on a branch and merge it through a pull request.
- [ ] Recover a deleted local file using Git history.

---

## Stage 2 — Docker fundamentals

Know:

- Image versus container
- Registry
- Layers and build cache
- Dockerfile instructions
- Port publishing
- Bind mounts and volumes
- Container networks
- Environment variables
- Container logs and health checks
- Multi-stage builds

Labs:

1. Run Nginx.
2. Build a tiny static website image.
3. Containerize a Spring Boot JAR.
4. Containerize a Next.js application.
5. Persist PostgreSQL data with a named volume.

Completion check:

- [ ] Explain `EXPOSE` versus `-p`.
- [ ] Enter a running container and inspect it.
- [ ] Build a smaller production image using a multi-stage Dockerfile.
- [ ] Remove and recreate a PostgreSQL container without losing its named-volume data.

---

## Stage 3 — Docker Compose and local platform

Build one system:

```text
Browser -> Nginx -> Next.js
                 -> Spring Boot -> PostgreSQL
```

Know:

- Compose services
- Internal DNS by service name
- Networks and volumes
- Startup dependencies versus application readiness
- Health checks
- Development and production configuration
- `.env.example` and secret handling

Completion check:

- [ ] Start the complete stack with `docker compose up --build`.
- [ ] Spring Boot connects using the PostgreSQL service name, not `localhost`.
- [ ] A new developer can clone the repository and run it from the README.

---

## Stage 4 — CI with GitHub Actions

Know:

- Workflow, event, job, step, action, and runner
- Pull request checks
- Dependency caching
- Build artifacts
- Repository and environment secrets
- Least-privilege workflow permissions

Build:

```text
Pull request
  -> lint frontend
  -> test frontend
  -> test backend
  -> build applications
  -> build container images
```

Completion check:

- [ ] A failing test blocks a pull request.
- [ ] Backend and frontend jobs can run independently.
- [ ] Workflow uses pinned major versions and minimal permissions.
- [ ] No secrets are printed in logs.

---

## Stage 5 — Deployment and operations

Start with one Linux VM before learning Kubernetes.

Know:

- SSH keys
- Linux service management
- Docker on a remote server
- Nginx reverse proxy
- Domain and DNS records
- HTTPS certificates
- Firewall rules
- Deployment rollback
- Database backup and restore
- Environment separation

Build:

```text
GitHub Actions -> container registry -> Linux VM -> Docker Compose
```

Completion check:

- [ ] Deploy a tagged release.
- [ ] Roll back to the previous image tag.
- [ ] Restore a PostgreSQL backup into a test database.
- [ ] HTTPS works and only required ports are public.

---

## Stage 6 — Observability

Your existing `elasticsearch/` directory belongs here, not at the beginning.

Know:

- Structured application logs
- Correlation/request IDs
- Metrics versus logs versus traces
- Health, readiness, and liveness
- CPU, memory, disk, and latency
- Alert quality
- Retention and storage cost

Suggested progression:

1. Spring Boot Actuator health and metrics
2. Docker logs
3. Prometheus and Grafana
4. Centralized logging
5. OpenTelemetry basics
6. Elastic Stack as an advanced lab

Completion check:

- [ ] Diagnose a deliberately broken service using logs and metrics.
- [ ] Create a useful dashboard.
- [ ] Create one alert with a clear action.

---

## Stage 7 — Terraform and cloud

Know:

- Infrastructure as Code
- Provider, resource, data source, variable, output
- State and remote state
- Plan, apply, and destroy
- Modules
- Secret handling
- Cloud IAM and least privilege
- Cost awareness

Start locally, then choose one cloud provider. AWS fits well with a Java backend path, but the core Terraform concepts transfer to other providers.

Completion check:

- [ ] `terraform plan` clearly shows intended changes.
- [ ] Recreate a disposable environment from code.
- [ ] Keep state and credentials out of Git.
- [ ] Destroy unused lab infrastructure to avoid cost.

---

## Stage 8 — Kubernetes

Begin only after completing Docker, Compose, CI, and one VM deployment.

Know:

- Cluster, control plane, and node
- Pod
- Deployment and ReplicaSet
- Service
- ConfigMap and Secret
- Namespace
- Ingress
- PersistentVolume and PersistentVolumeClaim
- Requests and limits
- Readiness and liveness probes
- Rolling update and rollback
- Helm basics

Use a local learning cluster first.

Completion check:

- [ ] Deploy the backend and database locally.
- [ ] Expose the backend through a Service or Ingress.
- [ ] Perform a rolling update and rollback.
- [ ] Diagnose `CrashLoopBackOff` and image-pull failures.

---

## Final capstone

Take one existing Spring Boot + Next.js project through the complete lifecycle:

- [ ] Local developer setup
- [ ] Automated tests
- [ ] Production Dockerfiles
- [ ] Docker Compose
- [ ] GitHub Actions CI
- [ ] Image publishing
- [ ] VM deployment
- [ ] Domain and HTTPS
- [ ] Database backup
- [ ] Logs, metrics, and health checks
- [ ] Terraform infrastructure
- [ ] Kubernetes deployment
- [ ] Runbook and architecture diagram

## Topics to postpone

These are useful, but not first priorities:

- Multi-cloud architecture
- Service mesh
- GitOps platforms
- Multi-cluster Kubernetes
- Advanced Kubernetes operators
- Complex microservices
- Certification study before practical deployment experience
