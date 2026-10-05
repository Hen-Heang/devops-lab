# Lesson 09: Building & Pushing Docker Images

**Course:** W4 D2 · September 1, 2026 · roadmap stages 4–5

A registry stores the built application image so a server can pull it without compiling your source. Publishing is a separate step from deployment: an image can exist in a registry without running anywhere.

**Goal:** Choose a registry, design traceable tags, configure CI authentication, publish behind quality gates, use layer caching, and verify the published artifact.

**Before starting:** Complete [CI Workflows](../08-ci-workflows/README.md). Use its separate Express practice repository, with the starter files at the repository root. The course's w2d4 starter path was not supplied. Our existing starter replaces it.

[Source and corrections](source.md) · [Course list](../COURSE.md)

## Registry, tag, and digest

| Object | What it answers | Example |
|---|---|---|
| Registry/repository | Where is the image stored? | ghcr.io/owner/cicd-express-demo |
| Tag | Which convenient name should be selected? | latest, sha-COMMIT, v1.4.0 |
| Digest | Which exact published manifest/index? | image@sha256:DIGEST |

Tags are pointers and can be overwritten or deleted unless a registry policy prevents it. A SHA-shaped tag is traceable by convention, not inherently immutable. Rebuilding one Git commit with a changed base image or dependency input can create different bytes. For deployments, record the published digest alongside the source commit.

`latest` has no automatic semantic meaning: it means whatever image a publisher assigned that tag. A registry is convenient distribution, not the only possible transport; an image can also be transferred as an archive.

## Choose a registry

| Choice | Authentication in this example | Practical fit |
|---|---|---|
| GHCR | Repository GITHUB_TOKEN with packages:write | Artifacts associated with GitHub repositories |
| Docker Hub | Docker Hub token stored as an Actions secret | Images distributed under a Docker Hub account |

Package visibility, storage, quotas, access, and pricing depend on current policies and your account. Do not decide using the source's unverified “free/private” comparisons. GHCR's automatic token still needs appropriate package ownership and repository access. Initial visibility can be private. See [GHCR permissions and pulling](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

A VPS does not inherit the runner's registry login. For private images, configure a separate read-capable credential on the server. Do not copy the short-lived workflow token to the VPS as a permanent credential.

## The prepared publishing workflow

Copy [ci.yml](examples/.github/workflows/ci.yml) over your practice repository's existing root workflow. The template retains all lesson 08 gates and adds publish only after Quality Gate succeeds.

~~~text
Lint + Test matrix → Build Verification → Quality Gate
                                              ↓ eligible main/tag push
                               Build and push → Pull by digest → Smoke check
                                              ↓
                                  Record verified image reference
~~~

It uses:

- checkout, Buildx setup, registry login, metadata generation, and build-push-action;
- a lowercased GHCR path, derived on the Ubuntu runner;
- scoped GitHub Actions layer caching;
- a pull/run check of the published digest;
- a job output for later deployment.

The publish job builds again from the checked commit. It does not claim byte-for-byte identity with the earlier job's local image. It verifies the actual published digest and only exposes a successful deployment reference afterward. If that post-push check fails, an image may remain in the registry, but the later deployment job must not run.

The example publishes linux/amd64. Check your VPS architecture with `uname -m`; arm64 servers require a compatible build. Multi-platform publishing requires additional platform-aware testing.

## Tag policy used here

| Event | Published tags |
|---|---|
| Push to main | latest and sha-FULL_40_CHARACTER_COMMIT |
| Stable version tag v1.4.0 | v1.4.0, v1.4, and sha-FULL_COMMIT |
| Pull request | Checks only; no registry login/push job |
| Manual dispatch | Checks only; no publishing job |

The metadata flavor disables automatic latest creation, then explicitly assigns latest only on main. Release tags do not move that main pointer. Semver patterns include `prefix=v`, so their outputs really retain v; without that prefix, version 1.4.0 would normally be unprefixed.

Both the push tag trigger and job condition accept releases. Keeping a main-only publish condition while adding a tag trigger would prevent release publishing. The validation step accepts stable numeric vX.Y.Z tags; prereleases need an explicit policy change. See [metadata-action tagging](https://github.com/docker/metadata-action).

## Practice: GHCR publication

1. Run npm ci, lint, format check, and coverage in your separate starter repo.
2. Replace its ci.yml with this template and review the diff.
3. Commit and push through your practice workflow.
4. Inspect the publish logs and workflow summary in Actions.
5. Confirm the package access/visibility and record the verified image@digest reference.

The job grants packages:write only to publishing. No custom GHCR token is needed for an authorized package in this workflow. Existing package permissions can still require adjustment.

The nested file in this course repo is an inactive template. No image is published during preparation.

## Verify outside CI

Replace the placeholders with your real lowercase path and the digest recorded by Actions. Run from any directory on a Docker host; the commands need no application source:

~~~bash
docker pull ghcr.io/YOUR_OWNER/cicd-express-demo@sha256:YOUR_DIGEST
docker run --name registry-demo -d -p 127.0.0.1:3009:3000 ghcr.io/YOUR_OWNER/cicd-express-demo@sha256:YOUR_DIGEST
curl http://localhost:3009/health
docker inspect registry-demo --format '{{.Config.Image}}'
docker stop registry-demo
docker rm registry-demo
~~~

PowerShell uses curl.exe. A private package needs login first; use an interactive credential flow and keep tokens out of command text and logs. Check the response contract, not only process state.

For this template's SHA tag, compare with `git rev-parse HEAD`, not a variable-length `--short` output. OCI labels from metadata record source/revision; the deployment digest records the artifact identity.

## Optional Docker Hub target and releases

The [Docker Hub lesson](../14-dockerhub-ssh-deployment/README.md) supplies a full alternative with the same gates. Use a public username variable DOCKERHUB_USERNAME and secret DOCKERHUB_TOKEN. A username is an image identifier, not an authentication secret; keeping it as a variable also avoids masking it in cross-job outputs.

To copy a tested local single-platform image to a second registry, authenticate to both, tag that local image for the other repository, and push the new tag. This shares the loaded image content; it is not a complete multi-platform index-copy procedure. Building independently for two registries does not guarantee identical digests.

For a stable release in your practice repo:

~~~bash
git tag v1.0.0
git push origin v1.0.0
~~~

Choose an unused tag for your own practice project; these commands publish a Git ref and trigger the workflow when enabled. Confirm version tags and digest in the registry. A successful release publish does not automatically deploy in our later template; its deploy policy is main-only.

## Cache and troubleshooting

Buildx is set up explicitly for the [build-push action](https://github.com/docker/build-push-action). cache-from/to with type=gha reuses eligible layers; it is not a guarantee of a hit or zero cost. Different cache scopes avoid unrelated builds replacing each other's cache. See [cache management](https://docs.docker.com/build/ci/github-actions/cache/).

| Failure | Check | Fix |
|---|---|---|
| Permission denied on push | Package linkage and job permissions | Authorize the repository and packages:write |
| Invalid image path | Lowercase owner/repository | Use the normalization step |
| Release checks run but no publish | Trigger and publish condition | Include stable version refs in both |
| Server pull denied | Package visibility and server credential | Configure pull access on that machine |
| Expected tags differ | Metadata prefix/flavor and actual commit | Read generated metadata, not guessed strings |
| Digest runs on runner but not laptop | Target platform | Pull/run a compatible platform |

## Review and completion

Explain why tags differ from digests, why the VPS needs its own private-registry access, and why registry publication is not deployment.

- [ ] I inspected the publish gate and release condition.
- [ ] I can explain latest, SHA tags, semver, and digest identity.
- [ ] If publishing, I recorded a real workflow result and pulled its digest elsewhere.
- [ ] I removed the practice container and recorded evidence in a [daily note](../../templates/daily-note.md).

**Preparation status:** Templates and local validation are provided; no registry authentication, push, or published-image runtime verification has been performed here.

**Next:** [VPS Setup & SSH Security](../10-vps-ssh-security/README.md).
