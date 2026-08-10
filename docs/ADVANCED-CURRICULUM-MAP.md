# Advanced Course Curriculum Map

This repository's [ROADMAP.md](../ROADMAP.md) is deliberately scoped for a full-stack developer who wants to own delivery of one Spring Boot and Next.js application. This page cross-references that path with the provided **DevOps 12th Advanced Course Curriculum** PDF.

The PDF's own summary reports 24 topics: 17 presentation topics, 7 self-learning topics, 1 mini-project, 8 homework assignments, and 5 quizzes. Its calendar dates are from 2024, so this repository keeps the topic order but remains self-paced.

This is a curriculum map, not a claim that every listed tool already has a lab in this repository. Repository coverage is tracked separately in the [README](../README.md#repository-content-status).

## Presentation-topic crosswalk

| PDF session | Main subject | Where it belongs in this repository | Coverage decision |
|---:|---|---|---|
| 1 | DevOps, SDLC, Waterfall, Agile, Lean, lifecycle, and benefits | [Why DevOps matters](WHY-DEVOPS-FOR-FULLSTACK-JAVA.md) and the [beginner guide](BEGINNER-GUIDE.md) | Core concepts |
| 2 | Linux fundamentals, files, users, groups, sudo, and permissions | [Stage 1](../ROADMAP.md#stage-1-linux-networking-http-and-git) and [Lab 00](../labs/00-foundations/README.md) | Core skills |
| 3 | IP, subnet, gateway, DNS, Linux network tools, static IP, and UFW | [Stage 1](../ROADMAP.md#stage-1-linux-networking-http-and-git) and [Stage 5](../ROADMAP.md#stage-5-one-linux-vm-deployment) | Core diagnosis; static-IP and detailed UFW administration are optional |
| 4 | Proxy, reverse proxy, load balancing, availability, web servers, and Nginx | [Stage 5](../ROADMAP.md#stage-5-one-linux-vm-deployment) | Learned in a real deployment rather than as an isolated server exercise |
| 5 | Docker Engine, CLI, Dockerfiles, images, containers, registry, and full-stack deployment | [Stage 2](../ROADMAP.md#stage-2-docker-fundamentals), the [Docker CLI reference](DOCKER-CLI-REFERENCE.md), [Stage 3](../ROADMAP.md#stage-3-docker-compose-and-a-local-platform), and [Stage 5](../ROADMAP.md#stage-5-one-linux-vm-deployment) | Split across fundamentals, composition, and deployment |
| 6 | Volumes, mounts, YAML, Docker Compose, and persistent full-stack data | [Stage 3](../ROADMAP.md#stage-3-docker-compose-and-a-local-platform) | Core skills |
| 7 | Docker networking, multi-tier applications, orchestration, and Docker Swarm | Docker networking is in [Stage 3](../ROADMAP.md#stage-3-docker-compose-and-a-local-platform); Swarm is in [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Compose networking is core; Swarm is optional |
| 8 | Ansible and Kubernetes overview | Kubernetes starts in [Stage 8](../ROADMAP.md#stage-8-kubernetes); Ansible is in [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Learn one server manually before automating server configuration |
| 9 | Minikube, Pods, Deployments, Services, and Ingress | [Stage 8](../ROADMAP.md#stage-8-kubernetes) | Core Kubernetes objects |
| 10 | Kubespray, deployment strategies, autoscaling, storage, RBAC, and Ingress TLS | [Stage 8](../ROADMAP.md#stage-8-kubernetes) followed by [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Rollouts, storage basics, and TLS are core; cluster provisioning and advanced administration come later |
| 11 | API gateways, monoliths, microservices, communication, and service mesh | [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Architecture study after the single-application capstone |
| 12 | Istio, traffic management, ingress gateway, and Kiali | [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Optional service-mesh specialization |
| 13 | Helm, charts, templates, repositories, and Helmfile | [Stage 8](../ROADMAP.md#stage-8-kubernetes), then [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Read and write plain manifests before templating them |
| 14 | Jenkins, pipeline syntax, Maven, Gradle, and automated deployment | CI concepts are in [Stage 4](../ROADMAP.md#stage-4-continuous-integration-with-github-actions); Jenkins is in [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | GitHub Actions is the primary implementation here |
| 15 | Jenkins nodes, GitOps, Argo CD, and application delivery | [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Add after CI, manual deployment, health checks, and rollback are understood |
| 16 | Continuous monitoring, Nagios, Prometheus, and Grafana | [Stage 6](../ROADMAP.md#stage-6-observability) | Actuator, Prometheus, and Grafana are core; Nagios is optional |
| 17 | Shell scripting with Spring Boot | [Stage 1](../ROADMAP.md#stage-1-linux-networking-http-and-git) and [Stage 5](../ROADMAP.md#stage-5-one-linux-vm-deployment) | Learn safe shell basics first, then automate a documented deployment or health check |

## Self-learning and project crosswalk

| PDF subject | Maps to | Decision |
|---|---|---|
| GitHub Actions | [Stage 4](../ROADMAP.md#stage-4-continuous-integration-with-github-actions) | Promoted from self-learning to the repository's primary CI path |
| Rancher | [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | Useful when a learner has clusters that need centralized management |
| Continuous testing with Selenium, Maven, and TestNG | Application test suites plus [Stage 4](../ROADMAP.md#stage-4-continuous-integration-with-github-actions) | CI runs the tests, but browser-test implementation belongs with the application |
| Performance testing with Sitespeed.io and Grafana | [Stage 6](../ROADMAP.md#stage-6-observability) | Add after a deployed application has a meaningful performance target |
| Version control with Git | [Stage 1](../ROADMAP.md#stage-1-linux-networking-http-and-git) | Treated as a prerequisite and reinforced through every stage |
| Self-hosted Git/GitLab server | [Stage 9](../ROADMAP.md#stage-9-extended-platform-tools-optional) | GitHub remains the default source of truth for this repository |
| Mini-project | [Final capstone](../ROADMAP.md#final-capstone) | Use the evidence-based Spring Boot, Next.js, PostgreSQL, and Nginx delivery project |

## Why some tools wait until Stage 9

The tools below are useful, but each adds another system to configure, secure, upgrade, observe, and recover. The roadmap first teaches the underlying operation manually, then introduces automation or platform layers.

| Tool or topic | Learn first | Add it when |
|---|---|---|
| Ansible | Configure and verify one Linux VM by hand | The same reviewed configuration must be repeated across hosts |
| Docker Swarm | Docker, Compose networking, health checks, and rollbacks | A workplace uses Swarm or you need to compare orchestrators |
| Kubespray and multi-node administration | A local Kubernetes cluster and its core objects | You are ready to own cluster installation and upgrades |
| Service mesh with Istio and Kiali | Service-to-service networking, TLS, logs, metrics, and traces | Several services need consistent traffic policy or mutual TLS |
| Helm and Helmfile | Plain Deployments, Services, ConfigMaps, Secrets, and Ingress | Repeated Kubernetes manifests need packaging and controlled values |
| Jenkins | A reliable local build plus a small GitHub Actions workflow | A team requires a self-hosted automation server or Jenkins integration |
| Argo CD and GitOps | CI, immutable artifacts, manual deployment, verification, and rollback | Kubernetes desired state should be reconciled from Git |
| Rancher | One cluster's access control and operations | Multiple clusters need centralized management |

## How to use this map

1. Follow Stages 0 through 8 in order.
2. Use this crosswalk when a PDF lesson overlaps the current stage.
3. Complete the [Final capstone](../ROADMAP.md#final-capstone).
4. Choose Stage 9 tools because your project or workplace has the problem they solve, not only because they appear in a tool list.
