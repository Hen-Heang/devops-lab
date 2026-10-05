# Source record: Git Advanced & Branching Strategies

**Source:** User-supplied student portal text in the conversation.
**Session:** W1 D3 · ON-DE-I-26-WKD-EV-W1D3 · August 12, 2026.

This is a condensed source record, not a verbatim transcript. Personal account details and repeated navigation/schedule text are omitted. Examples and corrections in the companion guide are edited teaching material.

## Supplied objectives and structure

HTTPS token and SSH setup; Git Flow, GitHub Flow, trunk-based development; feature branch naming/workflow; pull requests and review; merge conflicts; merge versus rebase; interactive rebase; daily workflow and branch hygiene; stash, cherry-pick, reflog, and branch protection.

## Supplied practice

1. Initialize main and develop with an initial README.
2. Add a user-profile feature through structure, fields, and styling commits.
3. Create header and footer branches from the same develop base; edit the same line, merge both, resolve the conflict.
4. Extension: Express server and routes in focused commits, conflict resolution, and a sample PR.

The source estimates 45 minutes theory and 45 minutes practice. Resource names include Git Flow Cheatsheet, Atlassian tutorials, GitHub Flow, Conventional Commits, Git mistake recovery guides, and Learn Git Branching. No resource URLs or recordings were supplied.

## Corrections and clarifications

| Supplied point | Treatment in the prepared guide |
|---|---|
| Identity username required to match GitHub | Commit author name is distinct from login; verified or noreply email can link commits. |
| Broad classic PAT scopes including admin:org | Prefer supported fine-grained access or credential manager; no routine organization administration permission. |
| Windows wincred as standard helper | Follow current Git Credential Manager guidance; do not overwrite working helpers unnecessarily. |
| SSH key generated at default path | Check existing keys and use a distinct practice filename to avoid overwriting. |
| SSH test success treated like a normal zero exit | GitHub greeting succeeds in authentication but exits 1 because shell access is unavailable. |
| Git Flow most widely used | Describe release needs and tradeoffs without a popularity claim. |
| Merge always makes a merge commit | A fast-forward is possible; --no-ff is an explicit policy choice. |
| Three-commit interactive rebase shows four todo entries | Use a consistent three-entry example and require enough commits. |
| Daily rebase followed by plain push on pushed branch | Explain changed identities and shared-history coordination. |
| Ours/theirs always maps to your/their branch | Rebase labels differ; inspect rather than accept a side blindly. |
| Never commit directly to main/develop alongside trunk-based guidance | Team policy controls this; local demo integration commits are explicitly simulations. |
| Request Changes used sparingly | State correctness blockers clearly; review action follows the actual defect. |

## Schedule discrepancy

The displayed session time is 8:00–9:30 PM. The auto-generated description says 18:00–19:30 Asia/Phnom_Penh. The pasted source does not identify the display timezone, so the discrepancy is recorded without asserting a conversion.

Official references supporting the edits are linked in the prepared guide. The portal status is not evidence of completed local practice.
