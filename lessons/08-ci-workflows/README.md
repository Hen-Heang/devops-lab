# Lesson 08: CI Workflows

**Course:** W4 D1 · August 31, 2026 · roadmap stage 4

A useful CI workflow reports separate evidence: whether the code passes lint and formatting, whether tests and coverage pass, and whether the application can be packaged and started. Required repository checks can then block integration when that evidence fails.

**Goal:** Use parallel jobs, needs dependencies, formatting and coverage gates, Docker build/runtime verification, npm caching, coverage artifacts, and an explicit final quality gate.

**Before starting:** Complete [Introduction to CI/CD](../07-introduction-cicd/README.md), use its starter or your separate copy, and start Docker for image practice. The course's `modules/4-devops/codes/w2d3` directory was not supplied; this repository's [starter](../07-introduction-cicd/examples/cicd-express-demo/README.md) replaces that missing source.

[Source record and corrections](source.md) · [Course list](../COURSE.md)

## 1. Understand the job graph

~~~text
                   ┌─ Lint & Format ────────────────┐
PR / main update ──┤                                ├─ Build Verification ─┐
                   └─ Test + Coverage (22 and 24) ───┘                      │
                          All job results ────────────────────────────────┴─ Quality Gate
~~~

Lint and tests do not depend on each other, so they can run concurrently. Build uses `needs: [lint, test]`, so it waits for successful upstream checks. Actual concurrency depends on runner availability and account limits; splitting jobs adds setup overhead and is not always faster for a tiny project.

There are four job definitions and five job executions because the test matrix expands to two versions. Jobs on GitHub-hosted runners get fresh environments; self-hosted runners do not necessarily start from clean machines. Steps in a job run sequentially unless a command explicitly starts parallel work.

If an upstream job fails, ordinary dependent jobs are skipped. Our final Quality Gate uses `if: always()` and explicitly rejects failure, cancellation, or skip results. It therefore runs and fails when lint fails and build is skipped, rather than itself being silently skipped. See [job dependencies](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs).

## 2. Exercise A: inspect the local quality tools

From the starter directory or your copied practice repository:

~~~bash
npm ci
npm run lint
npm run format:check
npm run coverage
~~~

The supplied files already include Prettier, eslint-config-prettier, and coverage thresholds. Inspect them instead of adding duplicate dependencies or a conflicting `.eslintrc.json` file.

| Tool | Useful signal | What it cannot prove |
|---|---|---|
| ESLint | Undefined/unused names and configured code patterns | Complete application correctness |
| Prettier check | Files agree with the formatting policy | Correct behavior |
| Jest/Supertest | Specified request/response behavior holds | Every production scenario |
| Coverage threshold | Covered code meets configured counts | That assertions are useful or complete |

In `eslint.config.js`, the Prettier compatibility configuration comes last to disable overlapping lint rules. Formatting itself is checked by `prettier --check`, not by that compatibility package. Run `npm run format` locally to intentionally format files, review the diff, then rerun checks. CI only checks formatting.

The Jest threshold is 70% branches and 80% functions, lines, and statements. Coverage is collected from app.js, including untested routes; it does not count server.js startup or shutdown. The build/runtime job checks that separate packaging concern. See [Jest coverage configuration](https://jestjs.io/docs/configuration#coveragethreshold-object).

## 3. Exercise B: prove coverage blocks insufficient testing

Do this only on a disposable practice branch. Save the test file before editing. Temporarily remove the entire `describe('GET /users/:id', ...)` block from `server.test.js`, then run:

~~~bash
npm test
npm run coverage
~~~

Expected: remaining tests can pass while coverage fails, because route handling and its branches are no longer exercised enough. Read the actual counts and threshold error; the original course's exact 50% or 91% figures do not describe this replacement starter.

Restore the block and rerun coverage. If your own modified application still meets the threshold, use a temporary threshold above its measured result to demonstrate enforcement, then restore it. Do not keep an artificial threshold or deleted test block in the final project.

## 4. Exercise C: package and run the API

Read the starter Dockerfile and `.dockerignore`. The image installs runtime dependencies only, explicitly copies app.js and server.js, uses the node user, and starts the server in exec form.

~~~bash
docker build -t cicd-express-demo:local .
docker run --name cicd-demo -d -p 127.0.0.1:3000:3000 cicd-express-demo:local
curl http://localhost:3000/health
docker exec cicd-demo id
docker logs --tail 20 cicd-demo
~~~

PowerShell uses curl.exe. Stop any local npm server using port 3000 before this exercise, or choose a different host port and adjust the HTTP check.

Expected: health status ok and a non-root runtime user. A successful Docker build verifies packaging commands; it does not by itself prove the packaged application can start. That is why the advanced workflow includes HTTP and runtime-user checks after building.

Inspect, stop, and remove the specific container:

~~~bash
docker stop cicd-demo
docker rm cicd-demo
~~~

## 5. Exercise D: install the multi-job workflow

The complete [workflow template](examples/.github/workflows/ci.yml) belongs at `.github/workflows/ci.yml` in your separate starter repository. It replaces the single-job workflow; do not run both examples unintentionally.

If studying directly in this course repository, first copy the starter as explained in lesson 07. Copy the advanced workflow to that practice repository using your actual source path. Bash example, run from the course repository root after creating the practice copy:

~~~bash
cp lessons/08-ci-workflows/examples/.github/workflows/ci.yml ~/devops-practice/cicd-express-demo/.github/workflows/ci.yml
cd ~/devops-practice/cicd-express-demo
npm run format:check
npm run lint
npm run coverage
git switch -c feature/ci-quality-gates
git add .github/workflows/ci.yml
git diff --staged
git commit -m "ci: separate lint test and packaging gates"
git push -u origin feature/ci-quality-gates
~~~

Update the paths if your practice project has a different name. Open a PR targeting main in your own repository and inspect the actual job graph. Copying YAML alone does not execute hosted jobs or configure branch protection. Publishing is an exercise for your account and is not performed during preparation.

### Workflow responsibilities

| Job ID | Display name | Commands and evidence |
|---|---|---|
| lint | Lint & Format | Clean install, lint, formatting check |
| test | Test + Coverage (Node 22/24) | Clean install and threshold-enforced tests on both runtimes |
| build | Build Verification | Docker build, packaged API health, non-root user check |
| quality-gate | Quality Gate | All three upstream results must equal success |

The job IDs are used by needs. Display names appear in the check UI. The matrix's fail-fast setting is false so one failing version does not automatically stop the other version's evidence.

`contents: read` is sufficient for checkout in this non-deploying example. Persisted Git credentials are disabled. The templates use action versions reviewed from the official [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), and [upload-artifact](https://github.com/actions/upload-artifact) documentation. Learning major tags can move; a production policy may pin reviewed full commit SHAs. Action runtime versions and the Node version you test are separate choices.

## 6. Caching versus artifacts

| Mechanism | Purpose | Included behavior |
|---|---|---|
| npm cache | Reuse downloaded package data to speed installation | setup-node cache keyed using package-lock.json; npm ci still runs |
| Artifact | Preserve a run's output for download or a later job | Node 24 uploads coverage/ as coverage-node-24 for seven days |
| Job output | Share a small declared value with dependent jobs | Not needed by this example |

Jobs do not automatically share a filesystem. A later job can download an uploaded artifact if its task actually needs those files. This build job needs source and a lockfile, not a coverage report, so it does not download one unnecessarily.

Only the Node 24 matrix job uploads coverage, avoiding conflicting artifact names. The upload is attempted even if the tests fail, when a report exists. If installation failed and no coverage files were generated, it warns instead of pretending a report was created. Artifacts are evidence, not secrets storage.

Do not delete a valid lockfile to “refresh the cache.” Fix package/lockfile mismatches intentionally and rerun npm ci. Cache misses are normal and must not prevent a clean installation.

## 7. Exercise E: break each gate separately

Use one disposable practice branch per fault, and restore each fault before moving to the next. Run local checks first to understand the error; publish intentionally broken branches only to your practice repository if you want hosted failure evidence.

| Intentional fault | Local command | Expected hosted result |
|---|---|---|
| Add unused `const unusedExample = 1;` in app.js | npm run lint | Lint fails; build skips; Quality Gate fails |
| Change a quote to inconsistent formatting | npm run format:check | Formatting step fails; build skips; gate fails |
| Remove health status property | npm test | Test matrix fails; build skips; gate fails |
| Remove the user-ID tests | npm run coverage | Coverage threshold fails even if remaining tests pass |
| Misspell base image as `nod:24-alpine` | docker build | Build fails after lint/tests pass; gate fails |
| Omit app.js from Dockerfile COPY | Docker run plus HTTP check | Build can succeed, but packaged API startup/health fails |

In the starter, the health handler is in app.js, not server.js. Do not change a test expectation to accept the defect as the fix. Restore the intended behavior, verify checks pass, and record Error → Cause → Fix.

## 8. Branch protection: make the result required

After a real successful hosted run creates its check names, use your repository's ruleset or branch-protection settings to require **Quality Gate** on main. That gate verifies every prerequisite, including both matrix versions. Alternatively, require every concrete check and understand their names and skipped-job behavior.

Also require pull requests according to your team's policy and consider requiring up-to-date branches. Verify enforcement with a deliberately failing practice PR. A green check on the dashboard is advisory until an applicable rule requires it; account/repository plan availability and bypass permissions affect enforcement. See [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

Our final gate rejects skipped prerequisites deliberately. Avoid required workflows with path filters that can leave their required check pending for unrelated changes. This example does not use path filters or continue-on-error to weaken required gates.

No account settings or protection rules are changed during preparation. No deployment, registry push, or third-party coverage service is configured. A Codecov upload needs its own reviewed configuration and is optional; downloadable GitHub coverage artifacts already serve this lesson.

## Troubleshooting

| Symptom | Evidence | Fix |
|---|---|---|
| Build starts before checks | Job IDs and needs | Depend on lint and test IDs |
| Gate passes despite failure | Gate condition and needs results | Reject every result other than success explicitly |
| Format and lint disagree | ESLint config ordering | Put the compatibility config last; use Prettier for formatting |
| Tests pass but threshold fails | Coverage table and collection scope | Add useful tests for uncovered behavior |
| Import works locally, fails on Linux | Filename case, Docker COPY, runtime | Match actual names and required runtime files |
| Artifact absent | Matrix value, test/install logs | Check which job was eligible and whether reports exist |
| npm install issue blamed on cache | npm ci error and manifests | Correct the dependency/lockfile change; do not assume cache corruption |
| PR still merges with failed gate | Applied protection/ruleset and bypass access | Require the actual gate and verify rule behavior |

## Review questions

1. Why do lint and test not need each other?
2. What does a skipped build tell you?
3. Why must a final gate inspect needs results?
4. How do a cache and artifact differ?
5. Does high coverage prove good assertions?
6. What does the packaged health check catch beyond a successful build?

<details>
<summary>Suggested answers</summary>

1. They can assess independent properties of the same source.
2. Its prerequisites did not permit execution; it is not a successful build.
3. The gate must fail when any required upstream work fails, cancels, or skips.
4. Cache speeds repeatable work; artifacts preserve a particular run's output.
5. No. Assertions and realistic cases still matter.
6. Missing startup files, runtime dependencies, startup errors, and a broken health response.

</details>

## Completion record

- [ ] Lint and format checks pass on my final files.
- [ ] Coverage passes and I observed a deliberate threshold failure.
- [ ] I built and checked the packaged API.
- [ ] I understand parallel jobs and needs dependencies.
- [ ] If using GitHub, I inspected a real matrix run and coverage artifact.
- [ ] If enabled, I tested protection with a failed PR.
- [ ] I restored all faults and wrote a [daily note](../../templates/daily-note.md).

**Preparation verification:** Lint and formatting passed, and 11 tests with coverage passed on Node 22 and 24. In temporary copies, unused variables failed lint, inconsistent quotes failed formatting independently, missing health status failed tests, and removing user-ID tests left four passing tests but failed the coverage thresholds (52.38% statements, 0% branches, 66.66% functions, 55% lines). Restoring tests passed. Workflow YAML structure and shell syntax passed local checks; the actual final-gate script rejected every unsuccessful prerequisite combination in a 64-case result check. The advanced template also passed the starter's formatting policy. Docker runtime, hosted matrix execution/artifacts, and branch-protection enforcement remain pending unless actually run.

**Next:** Building & Pushing Docker Images, course W4 D2. Read the [prepared publishing lesson](../09-building-pushing-images/README.md).
