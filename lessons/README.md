# Lessons

Use this folder for lessons from your class or course. Follow the [roadmap](../ROADMAP.md) for the overall study order.

## Add a new lesson

Send the lesson text, a file, screenshots, or a link in the conversation. Include the topic or lesson number if you know it. Rough notes are enough to start.

Each lesson will have its own numbered folder:

~~~text
lessons/
  01-topic/
    source.md       # Original notes and source references
    README.md       # Clear explanation and practice
~~~

Keep a clearly labeled source transcript or condensed source record in `source.md`. Use the [lesson template](../templates/lesson.md) for `README.md`. Number folders in course order, and link each prepared lesson in the table below.

## How lessons are prepared

1. State what you will learn and what you need first.
2. Explain the idea in plain English, defining new terms.
3. Connect it to a Java, Spring Boot, Next.js, or database example when useful.
4. Explain each command, where it runs, and what result to expect.
5. Add a small exercise and a way to verify it.
6. Include common mistakes and short review questions.

Keep commands from the source distinct from added examples. Flag unclear or missing details instead of guessing. Expected output is an example; mark practice as verified only after it has actually been run.

## Lesson index

The [DevOps Essentials course list](COURSE.md) tracks all 15 supplied sessions. Detailed material is available only for the lessons linked below.

| Lesson | Topic | Roadmap stage | Prepared lesson |
|---|---|---|---|
| 02 · W1 D2 | Git Fundamentals | 1 · Foundations | [Explanation and exercises](02-git-fundamentals/README.md) |
| 03 · W1 D3 | Git Advanced & Branching Strategies | 1 · Foundations | [Explanation and exercises](03-git-advanced-branching/README.md) |
| 04 · W2 D1 | Docker Fundamentals | 2 · Docker | [Explanation and exercises](04-docker-fundamentals/README.md) |
| 05 · W2 D2 | Dockerfile & Image Building | 2 · Docker | [Explanation and exercises](05-dockerfile-image-building/README.md) |
| 06 · W2 D3 | Docker Compose | 3 · Compose | [Explanation and exercises](06-docker-compose/README.md) |
| 07 · W3 D1 | Introduction to CI/CD | 4 · CI | [Explanation and starter API](07-introduction-cicd/README.md) |
| 08 · W4 D1 | CI Workflows | 4 · CI | [Parallel jobs and quality gates](08-ci-workflows/README.md) |
| 09 | Building & Pushing Images | 4 · CI | [Guide and examples](09-building-pushing-images/README.md) |
| 10 | VPS & SSH Security | 5 · Deployment | [Guide and examples](10-vps-ssh-security/README.md) |
| 11 | Dev & Production Compose | 5 · Deployment | [Guide and examples](11-dev-production-compose/README.md) |
| 12 | Domain & Nginx Proxy Manager | 5 · Deployment | [Guide and examples](12-domain-nginx-proxy-manager/README.md) |
| 13 | GitHub Actions SSH Deployment | 5 · Deployment | [Guide and examples](13-github-actions-ssh-deployment/README.md) |
| 14 | Docker Hub SSH Deployment | 5 · Deployment | [Guide and examples](14-dockerhub-ssh-deployment/README.md) |
| 15 | Prometheus & Grafana | 6 · Observability | [Guide and examples](15-prometheus-grafana/README.md) |

Supplement: [End-to-end deployment workshop and runbook](deployment-workshop/README.md).

Study these prepared lessons in table order. Introduction to DevOps (lesson 01) still awaits its course text; the [beginner guide](../docs/BEGINNER-GUIDE.md) provides an introduction meanwhile.

See [preparation verification](VERIFICATION.md) for what has been tested locally and what still requires your server.

After studying, record your own results in [notes](../notes/README.md). Assigned questions and answers belong in [homework](../homework/README.md).
