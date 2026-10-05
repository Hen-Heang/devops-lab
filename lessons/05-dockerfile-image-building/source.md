# Source record: W2 D2 — Dockerfile & Image Building

**Source:** Student portal lesson text supplied by the user in the conversation; no recording or resource files were provided.
**Session:** ON-DE-I-26-WKD-EV-S01, August 18, 2026, 10:30 PM–12:00 AM, 90 minutes, online, marked completed. Recording availability was shown, but no recording URL was supplied.

This file is a condensed record of the supplied material, not a verbatim transcript. Personal account details and unrelated portal navigation are omitted. The companion README is an edited study guide with additional examples and corrections.

## Original learning objectives

- Write a Dockerfile using core instructions.
- Build and tag images with `docker build`.
- Explain layers and instruction order.
- Containerize Node.js, Python, Go, and static sites.
- Use `.dockerignore`.
- Optimize build speed and image size.
- Use multi-stage builds.

## Original theory outline (45–60 minutes)

1. Dockerfile as a recipe: source + Dockerfile → build → image → run → container.
2. Core instructions: FROM, WORKDIR, COPY, ADD, RUN, ENV, ARG, EXPOSE, CMD, ENTRYPOINT.
3. Build options: tag, alternate Dockerfile, no-cache; inspect images and run them.
4. Examples: Nginx static HTML, Express API, FastAPI, React/Next.js frontend, Go static binary.
5. `.dockerignore`: exclude generated dependencies, Git data, virtual environments, and secrets.
6. Best practices: stable instructions first, specific tags, non-root user, one concern per container, smaller images.
7. Named multi-stage builds and `docker build --target`.

## Original practice outline (45 minutes)

- **Exercise 1 (10 minutes):** Create HTML, use `nginx:alpine`, copy into `/usr/share/nginx/html`, build, publish port 8080 to container port 80, open the page.
- **Exercise 2 (15 minutes):** Create Express `/` and `/health` routes; use `process.env.PORT || 3000`; copy manifests before source; ignore local dependencies and `.env`; run with PORT=4000; optionally run two containers on host ports 3000 and 3001.
- **Exercise 3 (15 minutes):** Add nodemon and Jest as development dependencies; compare an image with all dependencies against a production multi-stage image; run as the `node` user.
- **Exercise 4 (bonus):** Choose Flask, FastAPI, Laravel, Go, Spring Boot, or Rails. Check base image, work directory, dependency caching, ignore file, listener address, non-root runtime, and exec-form command.

The stated theory and practice ranges exceed the listed 90-minute session at their upper end. Study these sections across multiple sessions if needed.

## Issues preserved for review

| Supplied material | Correction in the prepared guide |
|---|---|
| FROM is always first | Global ARG and parser directives can precede FROM. |
| Every instruction is a filesystem layer | Some instructions set metadata; RUN and COPY typically change the filesystem. |
| Specific version tags guarantee reproducibility | Tags can move; digests identify exact base content. Dependencies also need locking. |
| Nginx frontend copies `/app/dist` for React/Next.js | This fits a Vite-style static build; Next.js uses `out` for static export or a server runtime for dynamic features. |
| Excluding node_modules means it should not be present in the container | Dependencies installed during the build should be present; ignored host files should be absent. |
| Multi-stage hint copies `/app/src` from a builder that never copied source | Explicitly copy source, or copy it directly from the context in the final stage. |
| Both fat and slim builds use the same unnamed Dockerfile | Use distinct named targets to compare all dependencies with production dependencies. |
| Go example requires go.sum | A standard-library-only module may have no go.sum. |
| Node `.dockerignore` template is blank | Added a working template. |
| Fixed image-size estimates | Measure locally; version, architecture, and compressed versus local sizes differ. |
| `--no-cache` means fresh base | Add `--pull` when intentionally checking for a newer base tag. |

## Original resource names

Dockerfile Reference; best practices for writing Dockerfiles; multi-stage builds; `.dockerignore`; Docker Build overview; hadolint; Dive.

Official documentation links used to review corrections are provided in the prepared lesson. No course recording has been watched and no original resource link was available in the pasted text.
