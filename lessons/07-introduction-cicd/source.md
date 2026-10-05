# Source record: Introduction to CI/CD

**Source:** User-supplied lesson text in the conversation.
**Session:** W3 D1 · August 24, 2026 (matched by title to the course list).

This is a condensed source record, not a verbatim transcript. Prepared guides add examples, complete missing code, and explain corrections. No recording or external course starter was accessed.

## Supplied material

Objectives: explain CI, continuous delivery/deployment, pipeline stages, DevOps culture, benefits/challenges, full-stack pipeline architecture, and deployment policy.

Theory (20 minutes): push-triggered checks, CI versus the two meanings of CD, GitHub Actions workflows/jobs/steps/triggers, checkout/setup/lint/test/build/deploy stages.

Practice (70 minutes): create an Express API with Jest/Supertest and ESLint, publish an introductory workflow, add a CI badge, remove the health status field to observe a failed check, restore the field, optionally upload coverage, add a deployment job, and configure branch protection.

## Missing supplied code

The server.js, server.test.js, CI workflow, and README code blocks were blank. The separate starter project in this lesson is added teaching material; it is not recovered course code. Recording and starter links were not supplied.

## Corrections and clarifications

| Supplied point | Prepared treatment |
|---|---|
| Every push automatically tests and deploys | Events, branch filters, and configured jobs determine execution; intro deploys nothing. |
| Tests prevent broken production code | Tests catch asserted regressions, not every defect or configuration issue. |
| New ESLint install uses .eslintrc.json by default | Supply a tested flat configuration for the selected ESLint version. |
| Inline NODE_ENV assignment works in all shells | Use cross-env for the npm test script. |
| Init/stage before creating ignore rules | Include ignores before the first commit and review an explicit file list. |
| Remove status in server.js | In this replacement project the route is in app.js; server.js handles listening. |
| Workflow must already be on main for every trigger | Explain discovery and event-specific branch behavior. |
| Old action tags and Node examples | Use action versions reviewed against official documentation and Node 24 locally. |
| Codecov upload is immediately usable | Keep third-party upload optional; advanced lesson supplies downloadable GitHub artifacts. |
| Echo Deploying is a deployment | A message is not a deploy; real deployment requires a destination and verification. |
| Next lesson label w12d1 | Follow actual course list: lesson 08, W4 D1. |

Official references are linked in the prepared guide. Course status does not mark local practice complete.
