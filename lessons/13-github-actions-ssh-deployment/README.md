# 13 · GitHub Actions SSH Deployment

The CI runner builds and publishes the image. The VPS downloads and runs that image. SSH carries the deployment command.

## Before you begin

Complete lessons 09–12. Keep the lesson 07 API at the root of your own repository and copy the complete [workflow](examples/.github/workflows/ci.yml) to `.github/workflows/ci.yml`. This template replaces the preceding workflow; do not run duplicate publishers for the same image.

The workflow checks lint, formatting, tests, coverage, Docker packaging, and a final quality gate. Publishing runs only after the gate passes. It pulls and starts the published image by digest, verifies `/health`, then passes that same digest to deployment.

```text
Push main → lint + tests → build → quality gate → publish to GHCR
                                              → verify published digest
                                              → SSH → deploy.sh → health verification
```

Release tags publish versioned images; this template automatically deploys only pushes to `main`. Pull requests and manual check runs do not deploy production.

## Prepare the VPS once

Place lesson 11's `compose.yaml`, `compose.prod.yaml`, `frontend.conf`, and `deploy.sh` in `/home/deploy/app`. Add lesson 12's `compose.proxy.yaml`. Create `.env` on the VPS with the required configuration. Start the proxy network first. Install Bash, curl, flock (util-linux), Docker Engine and Compose.

For a private image, configure a read-only registry credential on the VPS separately. An Actions token is not a permanent server login. The deployment script locks concurrent updates, validates configuration, pulls the requested digest, waits for container health, checks HTTP responses, and records `.release.env` only after success. `.previous-release.env` retains the preceding successful reference.

## Give CI its own SSH identity

```bash
# Laptop: choose a new path; do not overwrite an existing key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
```

Install only the public key in the deploy user's `authorized_keys`. Verify access in a second terminal. Store the private key securely in GitHub Secrets, preserving its header, footer, and line breaks. Use an approved clipboard or secrets manager; never commit it. Passphrases are supported by this workflow.

Create secrets `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`, and `SSH_FINGERPRINT`; add `SSH_KEY_PASSPHRASE` if used. Obtain and verify the server host-key fingerprint through a trusted server console. The fingerprint authenticates the server, while your private key authenticates CI.

GHCR publishing uses the job-scoped `GITHUB_TOKEN` with `packages: write`. For private VPS pulls, provision an appropriately scoped read credential on the server. Ensure the package grants the repository access.

## Enable and verify deployment

Configure the `production` GitHub environment and any desired approval rules. They are not created by YAML alone. Set repository variable `ENABLE_VPS_DEPLOY=true` after the server prerequisites are ready.

Push a visible API change through your normal review process. Confirm every gate passes, the registry contains the SHA tag, the publish smoke test succeeds, and the deploy job verifies the digest. Finally test your public HTTPS endpoint; internal health does not validate DNS or TLS.

```bash
# VPS: deploy a known digest manually
cd /home/deploy/app
bash ./deploy.sh 'REGISTRY/OWNER/IMAGE@sha256:REPLACE_WITH_REAL_DIGEST' --proxy

# Inspect the API service without guessing its container name
container_id=$(docker compose --env-file .env --env-file .release.env -f compose.yaml -f compose.prod.yaml -f compose.proxy.yaml ps -q api)
docker inspect "$container_id" --format '{{.Config.Image}}'
```

## Roll back

Read the previous successful `API_IMAGE` reference in `.previous-release.env`, then pass that exact digest to `deploy.sh` with `--proxy`. The script pulls it and checks health before recording success. Verify public HTTPS too. Image rollback does not reverse database migrations or restore data. Keep known-good artifacts available in the registry.

Tags such as `latest` and `sha-...` can be overwritten unless registry policy prevents it. The digest identifies the actual image content. Unsetting a shell variable does not necessarily override an env file, and choosing `latest` does not prove you restored a known-good release.

## Troubleshooting

| Failure | Check |
|---|---|
| SSH denied | Dedicated key, authorized_keys ownership, user and port |
| Host fingerprint mismatch | Verify server identity before updating the secret |
| Pull denied | Image name, registry visibility, server read credentials |
| Missing variable | `.env` and Compose's required-variable validation |
| Container unhealthy | API logs and configuration; deployment must fail |
| Internal health works, public request fails | DNS, proxy network, upstream and TLS |

The job serializes production runs and the server script adds a lock. Serialization does not guarantee release order across unrelated workflows. A failed update can have changed running containers before verification fails; inspect state and explicitly restore a known-good release. This is not an automatic transactional rollback or a zero-downtime rolling update.

## Review questions

Why does deployment need both quality checks and post-start health checks? Which credential lets the VPS read a private registry? How does a server fingerprint differ from a client public key? Which image reference would you put in an incident report?

Hosted publishing and SSH deployment are prepared exercises, not verified live executions.

Sources: [SSH action and fingerprint inputs](https://github.com/appleboy/ssh-action), [GHCR authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [Build and push](https://github.com/docker/build-push-action).
