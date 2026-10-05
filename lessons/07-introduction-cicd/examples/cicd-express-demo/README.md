# CI Express starter

A complete teaching project for CI fundamentals and quality gates. The course text omitted its server, test, and workflow code; these files are added examples.

## Run locally

Use Node 24 and npm from this directory:

```bash
npm ci
npm run lint
npm test
npm start
```

In a second terminal, request `http://localhost:3000/health`. Stop the server with Ctrl+C. Set PORT using your shell if 3000 is occupied.

## Files

| File                     | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| app.js                   | Express routes using in-memory demo users              |
| server.js                | Starts the server and handles SIGTERM                  |
| server.test.js           | HTTP contract and error-case tests                     |
| eslint.config.js         | Flat ESLint configuration; Prettier compatibility last |
| jest.config.js           | ESM setup and application coverage thresholds          |
| package-lock.json        | Locked dependency installation                         |
| .github/workflows/ci.yml | Introductory single-job workflow                       |
| Dockerfile               | Production dependency install and non-root API runtime |

Tests collect coverage from app.js. Server startup, shutdown, and Docker packaging need separate runtime checks; application coverage does not include them.

## Next lesson's commands

```bash
npm run format:check
npm run coverage
docker build -t cicd-express-demo:local .
docker run --name cicd-demo -d -p 127.0.0.1:3000:3000 cicd-express-demo:local
```

This repository already supplies Prettier and the threshold configuration so you can inspect them before upgrading the workflow. The Dockerfile copies both app.js and server.js explicitly.

Read coverage output from your own run. Do not assume the original course's starter percentages apply to this example. A coverage threshold is enforced only when coverage is collected.

## GitHub setup

Copy this entire directory, including hidden files, into a separate practice repository. The workflow becomes active only at that repository's root .github/workflows path. Review ignored files before committing. Update your copied README with a badge for your actual account/workflow after a hosted run exists.

To advance, replace its workflow with the multi-job template from lesson 08 in the course repository. It runs lint/format and a Node 22/24 test matrix, then Docker build and runtime checks, then an explicit final gate. It deploys nothing.

## Cleanup

Stop the local npm server with Ctrl+C. If you ran the Docker example, inspect cicd-demo, then stop and remove that exact container. Keep or remove the exact local image tag according to whether you still need it. Generated node_modules and coverage are ignored by Git.
