# Source record: Git Fundamentals

**Source:** User-supplied student portal text in the conversation.
**Session:** W1 D2 · ON-DE-I-26-WKD-EV-W1D2 · August 11, 2026.

This is a condensed source record, not a verbatim transcript. Personal account details and repeated navigation/schedule text are omitted. Examples and corrections in the companion guide are edited teaching material.

## Supplied objectives and structure

Version control; Git versus GitHub; working directory, index, and history; repository, commit, branch, remote; configuration and basic workflow; command reference; commit messages; ignore rules; GitHub setup; HTTPS/SSH; undo and stash scenarios.

## Supplied practice

1. Configure identity and initialize a repository with README and app.js.
2. Create a greeting branch, commit, and compare with main.
3. Create an empty GitHub repository and push main and a feature branch.
4. Add user input, update README, merge and delete the integrated branch.
5. Create ignored log, environment, and dependency files.
6. Portfolio challenge: header, about, and projects branches, two commits per branch, integration and optional styling/interaction.

The supplied lesson estimates 45 minutes of theory and 45 minutes of practice. Its review asks about Git/GitHub, file states, staging, commit messages, branches, ignore rules, fetch/pull, file undo, origin, and team main-branch policy.

## Corrections and clarifications

| Supplied point | Treatment in the prepared guide |
|---|---|
| Git tracks all changes; working file is always latest | Only committed snapshots are saved; local working files can differ from remote versions. |
| HTTPS accepts username/password | GitHub account passwords are not accepted for HTTPS Git; use appropriate authentication. |
| Always pull before pushing | Fetch/inspect when needed; ff-only updates refuse divergence instead of guessing an integration policy. |
| Initialize then push main | Explicit `git init -b main` avoids dependence on a global default. |
| Node ignore template blank | A complete ignore example is supplied. |
| checkout/reset hard as basic discard advice | Teach staged versus unstaged changes and narrowly scoped restore first; hard reset can discard uncommitted work. |
| Git makes permanent loss difficult | Uncommitted/ignored data is not protected; reflog is not a universal backup. |
| Force branch deletion and stash clear in ordinary reference | Explain their destructive effect rather than include them in the practice sequence. |
| SSH automatically more secure | Compare credential management and context instead of promising stronger security. |

## Schedule discrepancy

The displayed session time is 8:00–9:30 PM. The auto-generated description says 18:00–19:30 Asia/Phnom_Penh. The pasted source does not identify the display timezone, so the discrepancy is recorded without asserting a conversion.

Official references supporting the edits are linked in the prepared guide. The portal status is not evidence of completed local practice.
