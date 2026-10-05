# Lesson 07: Introduction to CI/CD

**Course:** W3 D1 · August 24, 2026 · roadmap stage 4

CI/CD turns repeatable checks and release steps into automation. A commit can trigger dependency installation, linting, tests, packaging, and—when a deployment is actually configured—a release to an environment.

**Goal:** Explain CI, continuous delivery, and continuous deployment; run a tested API; read a GitHub Actions workflow; and prove that a broken behavior makes its test fail.

**Before starting:** Complete the Git lessons and understand npm commands. Use Node 24 and npm locally for the starter; Docker is needed later for packaging. Bash/WSL/macOS examples are labeled below; npm and Git commands also work in PowerShell.

[Source record and corrections](source.md) · [Course list](../COURSE.md)

## 1. CI and the two meanings of CD

| Practice | Meaning | Example |
|---|---|---|
| Continuous integration | Integrate small changes frequently and validate the integrated code with an automated build/test process | A pull request gets lint and test results before merging |
| Continuous delivery | Keep changes in a releasable state; production release remains a deliberate decision | Release candidate passes checks; a person approves the production release |
| Continuous deployment | Automatically release eligible changes to production after the required gates pass | An approved merge to main passes checks and triggers production deployment |

CI is a development practice as well as a workflow file. Running tests on a long-lived isolated branch is useful, but integration still needs to happen frequently. See [Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html).

Not every push deploys, and not every project uses GitHub. Events, branch filters, permissions, and deployment policy control what happens. Our first workflow only checks code; it deploys nothing.

## 2. Why automate, and what can still go wrong?

Automation gives teammates the same checks, catches tested regressions sooner, and leaves reviewable evidence. It can reduce repetitive release work and support faster feedback.

Tests only cover what they assert. A green workflow cannot promise there are no bugs, that configuration is correct in production, or that a rollback is safe. Flaky tests, slow checks, missing credentials, environment differences, and weak monitoring still need attention.

DevOps culture means developers and operators share responsibility for delivery and reliability. Use small changes, clear ownership, useful feedback, and learning from failures rather than treating the CI dashboard as someone else's problem.

## 3. Read a workflow

~~~text
Push to main / PR targeting main
        ↓
Checkout → Set up Node → npm ci → Lint → Tests
        ↓
Passed or failed check for the repository
~~~

| Term | Meaning |
|---|---|
| Workflow | YAML automation file under the repository root's `.github/workflows/` |
| Trigger | Event such as push, pull_request, or workflow_dispatch |
| Job | Group of steps scheduled on a runner |
| Runner | Machine/environment executing the job |
| Step | Action invocation (`uses`) or command (`run`) |
| Action | Reusable automation component, such as checkout or setup-node |
| Status check | Result that can be required by repository protection rules |

The included [single-job workflow](examples/cicd-express-demo/.github/workflows/ci.yml) triggers on pushes to main, PRs targeting main, and manual dispatch. A push to an unrelated feature branch without a PR does not match its push filter. The PR trigger checks the proposed integration rather than publishing it.

Checkout gets the files; setup-node chooses the runtime and caches npm's downloaded package data; `npm ci` installs the committed lockfile. Cache does not replace installation.

## 4. Exercise A: run the provided starter

The course's server and test blocks were blank. This repository provides a complete [starter project](examples/cicd-express-demo/README.md) with Express, Jest, Supertest, flat ESLint configuration, a lockfile, and a single-job workflow. Prettier, coverage thresholds, and Docker files are also supplied for lesson 08, where you will turn them into separate gates.

From the course repository root:

~~~bash
cd lessons/07-introduction-cicd/examples/cicd-express-demo
npm ci
npm run lint
npm test
npm start
~~~

PowerShell changes directory with:

~~~powershell
Set-Location lessons\07-introduction-cicd\examples\cicd-express-demo
~~~

Run requests in a second terminal:

~~~bash
curl http://localhost:3000/health
curl http://localhost:3000/users
curl http://localhost:3000/users/2
curl -i http://localhost:3000/users/99
curl -i http://localhost:3000/users/abc
~~~

PowerShell uses `curl.exe`. Expected: health status ok, two demo users, user Lin for ID 2, 404 for a missing valid ID, and 400 for an invalid ID. Stop the local server with Ctrl+C.

The users are in memory, not in a database. Tests import app.js without starting server.js, so Jest does not leave a listening server behind. `server.js` is the startup entry point, and `/health`'s behavior is defined in `app.js`.

The test script uses cross-env so NODE_ENV works in PowerShell as well as Bash. Jest's ESM support uses the VM modules flag; see [Jest ESM guidance](https://jestjs.io/docs/ecmascript-modules). ESLint uses `eslint.config.js`, following [flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files). The starter uses ESLint 10 with Node 24, rather than an unsupported `.eslintrc.json` default. See [ESLint version support](https://eslint.org/version-support/).

## 5. Exercise B: copy into your own practice repository

Work in a separate project to try GitHub publishing. Do not initialize a nested repository inside this course repo. From the course repository root, Bash:

~~~bash
mkdir -p ~/devops-practice
mkdir ~/devops-practice/cicd-express-demo
cp -R lessons/07-introduction-cicd/examples/cicd-express-demo/. ~/devops-practice/cicd-express-demo/
cd ~/devops-practice/cicd-express-demo
npm ci
git init -b main
git config user.name "Your Name"
git config user.email "your.email@example.com"
git status --short
git add .gitignore .dockerignore .prettierignore .prettierrc.json .github README.md package.json package-lock.json app.js server.js server.test.js eslint.config.js jest.config.js Dockerfile
git diff --staged --stat
git commit -m "chore: add tested API and introductory CI workflow"
~~~

Choose a new target name if the directory already exists. Copying `source/.` includes hidden configuration and workflow files. If you already ran npm in the source, this copy may also include ignored local dependencies; npm ci reinstalls from the lockfile and Git ignores them. Replace the identity placeholders.

PowerShell copying alternative, from the course repository root:

~~~powershell
$practiceTarget = Join-Path $HOME 'devops-practice\cicd-express-demo'
New-Item -ItemType Directory -Path $practiceTarget
Get-ChildItem -Force lessons\07-introduction-cicd\examples\cicd-express-demo | Copy-Item -Destination $practiceTarget -Recurse -Force
Set-Location $practiceTarget
npm ci
~~~

Then use the Git initialization and explicit file list above. The commands do not alter your global Git identity.

Create an empty repository on GitHub and use your own URL:

~~~bash
git remote add origin https://github.com/YOUR_USERNAME/cicd-express-demo.git
git remote -v
git push -u origin main
~~~

Review files before publishing and use your existing GitHub authentication. In GitHub's Actions tab, open Intro CI and inspect its installation, lint, and test steps. A badge or copied YAML file is not proof of a hosted run. These publishing steps have not been executed during preparation.

The nested workflow in this course repository is a template. GitHub only discovers workflows under the root `.github/workflows/`; copying the starter into its own repository puts the file in the right place. Workflow event rules differ: it is not true that every possible workflow must already exist on main to run. See [workflow syntax and events](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

## 6. Exercise C: break the health contract and fix it

In your disposable practice repository, create a feature branch:

~~~bash
git switch -c practice/break-health
~~~

Edit `app.js`: remove the `status: 'ok'` property from the health response. Run `npm test` and read the failing health assertion. The test should fail even though the endpoint still returns HTTP 200.

If you are practicing hosted failure, commit this intentional defect only to the practice branch, push it, and open a PR to main:

~~~bash
git add app.js
git commit -m "test: demonstrate health contract regression"
git push -u origin practice/break-health
~~~

Observe the red test step. Restore the status property, rerun lint and tests, then commit and push the fix. Keep the broken commit out of your production application. Intentional failure exercises are exceptions to the usual goal of sending passing changes for review.

This proves a specific assertion catches a specific regression; it does not prove comprehensive coverage of the API.

## 7. Exercise D: add a real status badge

After creating your GitHub repository, add this badge to its README and replace YOUR_USERNAME:

~~~markdown
[![CI](https://github.com/YOUR_USERNAME/cicd-express-demo/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/cicd-express-demo/actions/workflows/ci.yml)
~~~

Use the actual workflow filename and branch. A main-branch badge can remain green while a feature PR is red; open that PR's checks for its result. The provided starter README deliberately has no simulated green badge.

## 8. Design CI/CD for your full-stack project

~~~text
PR / main update
  ├─ Next.js: install → lint → relevant tests → production build
  └─ Spring Boot: dependency resolution → unit/integration tests → JAR
                       ↓
               Build container images
                       ↓
               Release candidate
                       ↓
          Staging → verify → release decision
                       ↓
       Production → health/monitoring → recovery if needed
~~~

Choose continuous delivery when release timing needs approval or coordination. Continuous deployment needs reliable gates, observability, controlled rollout, and a working recovery strategy; it does not mean “publish every branch.” Database migrations, irreversible changes, and configuration deserve specific release handling.

An echo step saying Deploying to staging is only a message, not a deployment. A real deploy job needs a defined destination, credentials, artifact identity, and verification. No deploy command, server, registry upload, or account secret is added in these introductory templates.

## Troubleshooting

| Symptom | Check | Next step |
|---|---|---|
| npm ci fails | package.json and lockfile agreement | Update the dependency change intentionally; do not routinely delete the lockfile |
| Jest import error | type module and test script | Use the supplied ESM setup and matching Node runtime |
| ESLint cannot find config | Working directory and eslint.config.js | Run from the starter root |
| No workflow run | File location, event, branch filters, Actions settings | Confirm the copied repository's root workflow and matching event |
| Local pass, hosted fail | Runtime, case-sensitive paths, lockfile, logs | Reproduce the actual job commands |
| Coverage report missing | Command used | Intro runs tests; lesson 08 runs coverage and uploads it |

## Review questions

1. What separates delivery from deployment?
2. Does a passing test automatically deploy this starter?
3. Why commit package-lock.json?
4. Why is the Express app separate from its listening server?
5. What must be checked before choosing automatic production deployment?

<details>
<summary>Suggested answers</summary>

1. Delivery keeps a releasable candidate; deployment automatically releases eligible changes after gates.
2. No. There is no deployment job.
3. It records dependency resolution for npm ci.
4. Tests can make requests to the app without leaving a live server running.
5. Gate reliability, release policy, monitoring, rollout/recovery, and application-specific risks.

</details>

## Completion and cleanup

- [ ] I can explain CI and both meanings of CD.
- [ ] I installed from the lockfile and ran lint/tests.
- [ ] I saw the health assertion fail and then pass after restoration.
- [ ] I can read the workflow triggers and steps.
- [ ] If using GitHub, I inspected a real hosted run and linked the correct badge.
- [ ] I recorded results in a [daily note](../../templates/daily-note.md).

Stop npm start with Ctrl+C. The local starter creates no database or cloud service. Keep your practice repository for evidence; manage any GitHub repository you created separately.

**Preparation verification:** npm ci, ESLint, and Prettier checks passed. All 11 API tests passed on Node 24.7.0 and Node 22.23.3. Collected app.js coverage was 100% in the four measured categories; server startup/shutdown is outside that coverage scope. Separate local requests verified health, user lookup, 404/400 cases, runtime PORT, and SIGTERM shutdown. Removing health status caused the intended test failure. Hosted workflow execution and account publishing are not performed during preparation.

**Next:** [CI Workflows](../08-ci-workflows/README.md).
