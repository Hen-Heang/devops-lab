# Lab Report: Name

- **Date:** YYYY-MM-DD
- **Roadmap stage:**
- **Environment:**
- **Shell:**

## Objective

What observable result must this lab produce?

## What, why, and when

### What

What technology or practice is being tested?

### Why

Which real application-delivery problem does it solve?

### When

When should a project use it? When would it be unnecessary?

## Architecture

~~~text
Client -> Service -> Dependency
~~~

Explain every arrow: protocol, hostname, port, and trust boundary.

## Prerequisites

- Required software and versions
- Required knowledge
- Required environment variables
- Required ports
- Expected memory or disk use

## Before state

Record relevant state before making changes:

- current directory;
- Git status;
- running containers or processes;
- existing resources that must be preserved.

## Steps

### 1. Prepare

Explain the action before the command.

~~~text
Add command here
~~~

### 2. Run

~~~text
Add command here
~~~

### 3. Verify

| Verification | Expected result | Actual result | Pass? |
|---|---|---|---|
| Example | Example expectation | Observed evidence | Yes / No |

A successful command exit is not always enough. Verify the useful application behavior.

## Failure experiment

Break one safe and reversible condition.

| Item | Details |
|---|---|
| Error | Exact relevant message |
| Cause | Why it happened |
| Evidence | Logs, state, port, response, or configuration |
| Fix | Smallest corrective change |
| Prevention | Documentation, automation, or alert |

## Security check

- [ ] No credentials are committed or printed.
- [ ] Only required ports are exposed.
- [ ] Images use reviewed version tags or digests.
- [ ] Sensitive values come from approved secret storage.
- [ ] Persistent data has a deliberate location.
- [ ] Privileged access is documented and minimized.

## Cleanup

List the exact resources before removing them.

~~~text
Add inspection command here
Add cleanup command here
Add cleanup verification here
~~~

## Rollback

If this were a deployment, how would you return to the previous known-good state?

## Completion evidence

- [ ] Commands work from a documented starting environment.
- [ ] Functional verification passed.
- [ ] The failure experiment was diagnosed.
- [ ] Cleanup was tested.
- [ ] Important errors were documented.
- [ ] Remaining limitations are honest and explicit.

## What I learned

Explain the result in your own words without copying the lab instructions.
