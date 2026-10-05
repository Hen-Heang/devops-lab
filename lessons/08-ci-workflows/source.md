# Source record: CI Workflows

**Source:** User-supplied lesson text in the conversation.
**Session:** W4 D1 · August 31, 2026 (matched by title to the course list).

This is a condensed source record, not a verbatim transcript. Prepared guides add examples, complete missing code, and explain corrections. No recording or external course starter was accessed.

## Supplied material

Objectives: parallel jobs and needs; ESLint/Prettier gates; minimum Jest coverage; image build verification; caching/artifacts; required checks on main.

Theory (40 minutes): separate lint and tests, then dependent build, then gate; independent runner environments; formatting versus lint; thresholds of 70% branches and 80% functions/lines/statements; Docker image build; npm cache; coverage artifact upload/download; branch protection.

Practice (50 minutes): use a course starter, add Prettier and compatibility config, enforce coverage, create Dockerfile and ignore file, replace single-job workflow, break each gate separately, and optionally require checks on main.

## Missing supplied code

The advanced workflow block was blank. The named starter path modules/4-devops/codes/w2d3 was not supplied. The repository reuses lesson 07's complete replacement starter and supplies an advanced workflow template.

## Corrections and clarifications

| Supplied point | Prepared treatment |
|---|---|
| Every job uses a fresh VM | Describe GitHub-hosted jobs; self-hosted runners may retain state. |
| Splitting jobs always halves runtime | Runner capacity, install overhead, and critical path determine actual elapsed time. |
| Four-job pipeline described as lint → test | Lint and test are parallel; build depends on both; matrix expands executions. |
| Gate never runs after lint failure | Use always plus explicit result checks so the gate runs and fails on unsuccessful prerequisites. |
| Build success proves artifact runs | Build and run the packaged API, check HTTP health and non-root user. |
| Provided coverage percentages apply universally | Measure this replacement starter and deliberately verify a failing threshold. |
| eslintrc extends config alongside modern installs | Use flat config with Prettier compatibility last. |
| Delete lockfile to fix caching | Diagnose manifest/lockfile agreement; retain intentional locked dependency resolution. |
| Multiple matrix uploads need no naming decision | Upload only the Node 24 report with a distinct artifact name. |
| Required checks automatically enforce merges | Configure an applicable rule and verify behavior; availability/bypass permissions matter. |
| dockerignore can omit secrets | Explicitly ignore .env and related files and copy runtime files narrowly. |
| Next lesson w2d4 | Follow course list: W4 D2, Building & Pushing Docker Images. |

Official references are linked in the prepared guide. Course status does not mark local practice complete.
