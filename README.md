# DevOps Learning

A hands-on DevOps learning repository for a backend-focused software engineer working with **Java, Spring Boot, Next.js, PostgreSQL, Docker, and GitHub**.

## Goal

Learn how to move an application through this complete flow:

```text
Code -> Test -> Build -> Package -> Deploy -> Observe -> Improve
```

This repository is not only a note archive. Every topic should include:

1. A short explanation in your own words
2. Commands you actually used
3. A small working lab
4. Errors, causes, and fixes
5. A clear completion check

## Start here

1. Read [`ROADMAP.md`](ROADMAP.md).
2. Start with [`labs/01-docker-basics/README.md`](labs/01-docker-basics/README.md).
3. Record each study session with [`templates/daily-note.md`](templates/daily-note.md).
4. Record each practical exercise with [`templates/lab-report.md`](templates/lab-report.md).
5. Commit small, meaningful changes after every completed lab.

## Learning order

| Stage | Topic | Practical result |
|---|---|---|
| 1 | Linux, terminal, networking, Git | Diagnose processes, ports, permissions, and HTTP problems |
| 2 | Docker fundamentals | Build and run a container confidently |
| 3 | Docker Compose | Run Spring Boot, Next.js, and PostgreSQL together |
| 4 | CI with GitHub Actions | Automatically test and build pull requests |
| 5 | Deployment | Deploy a containerized application behind Nginx with HTTPS |
| 6 | Observability | Collect logs, metrics, health checks, and alerts |
| 7 | Infrastructure as Code | Provision infrastructure using Terraform |
| 8 | Kubernetes | Deploy and manage the application on a local cluster |

## Repository structure

```text
devops-learning/
├── README.md
├── ROADMAP.md
├── notes/
├── labs/
├── templates/
└── elasticsearch/     # Existing advanced/legacy observability experiment
```

## Study rules

- Learn one concept, then immediately use it.
- Do not copy commands without explaining what they do.
- Never commit passwords, API keys, private keys, `.env` files, or cloud credentials.
- Prefer one complete project over many unfinished tutorials.
- Do not start Kubernetes until Docker Compose and CI/CD feel comfortable.
- Use pull requests for meaningful changes, even when working alone.

## Recommended capstone

Containerize and deploy a full-stack system containing:

- Next.js frontend
- Spring Boot REST API
- PostgreSQL
- Nginx reverse proxy
- GitHub Actions CI/CD
- Health checks and logs
- Terraform infrastructure
- Kubernetes manifests as the final stage

## Current status

- [x] Existing Docker/Elastic Stack experiment
- [ ] Stage 1: Foundations
- [ ] Stage 2: Docker
- [ ] Stage 3: Docker Compose full-stack lab
- [ ] Stage 4: GitHub Actions CI
- [ ] Stage 5: Deployment
- [ ] Stage 6: Observability
- [ ] Stage 7: Terraform
- [ ] Stage 8: Kubernetes
