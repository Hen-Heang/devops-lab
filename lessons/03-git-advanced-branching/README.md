# Lesson 03: Git Advanced & Branching Strategies

**Course:** W1 D3 · August 12, 2026 · roadmap stage 1

A branching strategy tells a team where changes start, how they are reviewed, and how they reach a release. Learn one simple workflow first, then use a more elaborate model only when the release process needs it.

**Goal:** Choose a branching model, write a useful pull request, resolve a real merge conflict, and distinguish merge from rebase.

**Before starting:** Complete [Git Fundamentals](../02-git-fundamentals/README.md). Use Bash, WSL, macOS Terminal, or Git Bash for shell blocks. Work in a separate practice repository. The examples are added teaching material based on the [course source record](source.md).

## 1. Identity and authentication are different

Git's user.name is a commit author label, not necessarily your GitHub username. user.email can be a verified GitHub address or your GitHub noreply address. These settings do not sign you in.

| Method | What proves your access | Practical choice |
|---|---|---|
| HTTPS | Credential manager login or a suitable token | Convenient on networks allowing HTTPS |
| SSH | Your private key proves possession; GitHub has the public key | Useful with an SSH agent and protected keys |

Both can be secure when configured correctly. SSH is not inherently a guarantee of stronger security, and an unprotected private key is sensitive.

### HTTPS

Prefer Git Credential Manager or GitHub CLI's interactive `gh auth login` if installed. An OS-backed credential store avoids repeatedly pasting credentials. Do not overwrite a working credential helper just to match an old lesson command. See [credential caching](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git).

If a token is needed, use a fine-grained token when it supports the task, select the practice repository, choose an expiration, and grant only needed permissions. Ordinary repository work does not require organization administration. Workflow-editing permissions are needed only for tasks that edit workflow files. Follow [GitHub's token guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens); never put a token into a remote URL, lesson note, or shell command.

### SSH (optional account setup)

First inspect existing key filenames; do not overwrite a key already in use:

~~~bash
ls -la ~/.ssh
~~~

If needed, generate a uniquely named key and protect it with a passphrase:

~~~bash
ssh-keygen -t ed25519 -C "your.email@example.com" -f ~/.ssh/id_ed25519_devops_practice
~~~

Use your platform's SSH-agent setup. In a Bash environment where an agent is needed:

~~~bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_devops_practice
cat ~/.ssh/id_ed25519_devops_practice.pub
~~~

Only the `.pub` content goes into GitHub's SSH keys settings. Never display or upload the private file. Test with:

~~~bash
ssh -T git@github.com
~~~

On the first connection, verify GitHub's published host-key fingerprint rather than accepting an unknown host blindly. Successful GitHub SSH authentication prints a greeting but exits with status 1 because GitHub offers no interactive shell. A key may also need organization SSO authorization. See [testing SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection).

No authentication settings or keys are changed during lesson preparation.

## 2. Choose a branching strategy

| Model | Main idea | When it fits | Tradeoff |
|---|---|---|---|
| GitHub Flow | Deployable main, short feature branches, PR review | Web applications with frequent delivery | CI and a clear deployment process are needed |
| Git Flow | Main plus develop, feature, release, and hotfix branches | Scheduled releases or maintained release lines | More merging and branch coordination |
| Trunk-based development | Integrate very small changes rapidly through trunk or very short branches | Teams with strong CI, incremental work, and feature flags | Requires disciplined integration |

Use GitHub Flow as the starting point for a small Spring Boot/Next.js web project. A team can protect main and require PRs; trunk-based development does not require bypassing reviews. A merge may trigger deployment, but deployment timing is a team policy.

In Git Flow, features usually merge into develop. Releases and hotfixes need to reach main and the relevant ongoing development branch so fixes are not lost. Git Flow is a model, not a mandatory Git plugin or a universal default.

~~~text
Simple feature workflow:
main → feature/borrower-search → commits → PR → review + checks → main
~~~

Keep changes small enough to review and branches short enough to integrate frequently. Course numbers such as 200–400 lines and two weeks are rough guidance, not quality guarantees.

## 3. Exercise A: create a Git Flow practice repository

This is a local teaching repository with no remote. Set your own identity placeholders:

~~~bash
mkdir -p ~/devops-practice
cd ~/devops-practice
mkdir git-advanced-practice
cd git-advanced-practice
git init -b main
git config user.name "Your Name"
git config user.email "your.email@example.com"
printf '# Branching Practice\n' > README.md
printf '<h1>Original title</h1>\n' > index.html
git add README.md index.html
git commit -m "chore: create branching practice project"
git switch -c develop
git switch -c feature/user-profile
printf '<form></form>\n' > profile.html
git add profile.html
git commit -m "feat: add profile form structure"
printf '<form><label>Name <input name="name"></label></form>\n' > profile.html
git add profile.html
git commit -m "feat: add profile name field"
printf 'form { max-width: 30rem; margin: auto; }\n' > profile.css
git add profile.css
git commit -m "style: add profile form layout"
git switch develop
git diff develop..feature/user-profile
git merge --no-ff feature/user-profile -m "Merge profile feature into develop"
git log --oneline --graph --all
git branch -d feature/user-profile
~~~

Expected: three feature commits, a merge commit on develop, and main unchanged. `--no-ff` deliberately creates a merge commit even when a fast-forward would be possible. Follow a real team's merge policy rather than assuming every feature must use this option.

## 4. Exercise B: produce and resolve a conflict

Start both branches from the same develop commit **before** merging either:

~~~bash
git switch develop
git branch feature/footer
git switch -c feature/header
printf '<h1>Header title</h1>\n' > index.html
git add index.html
git commit -m "feat: update page header"
git switch feature/footer
printf '<h1>Footer title</h1>\n' > index.html
git add index.html
git commit -m "feat: update page footer title"
git switch develop
git merge feature/header
git merge feature/footer
~~~

**Expected:** the last merge stops with a conflict. That failure is intentional. Both branches changed the same original line differently. Conflicts can also come from deletion, rename, or other incompatible edits.

Inspect:

~~~bash
git status
cat index.html
~~~

You should see conflict markers around the alternatives. Replace the file with an intentional combined result:

~~~bash
printf '<h1>Header title</h1>\n<footer>Footer title</footer>\n' > index.html
git diff --check
git add index.html
git diff --staged
git commit -m "merge: combine header and footer content"
git status --short
git log --oneline --graph --all
~~~

Expected: both intended elements, no markers, a clean working tree, and a merge commit. Check the resulting page or application too; removing markers alone does not prove correctness.

If you need to cancel instead, `git merge --abort` applies while the merge is in progress. Save local edits before starting a merge so abort has a clean starting point. Abort and resolution are alternatives, not successive steps.

`git checkout --ours FILE` and `--theirs` select an entire side of the conflicted file and can drop intended changes. During rebase their meanings differ from a normal merge. Read the content and resolve deliberately.

## 5. Merge and rebase

~~~text
Before:
base:    A--B--C
feature: A--D--E

Merge into base: preserves D and E and can add a two-parent commit M.
Rebase feature: A--B--C--D'--E' (replayed commits have new identities).
~~~

Merge can also fast-forward; it does not always create M. Rebase replays commits onto another base and changes history. Use it for your own local work when useful. Shared branches normally use a coordinated merge instead. See [Git rebase](https://git-scm.com/docs/git-rebase).

### Exercise C: rebase an unshared branch

In this practice repository, make one feature commit and a separate base update:

~~~bash
git switch develop
git switch -c feature/rebase-demo
printf 'Feature note\n' > feature-note.txt
git add feature-note.txt
git commit -m "docs: add feature note"
git rev-parse HEAD
git switch develop
printf '\nBase documentation update\n' >> README.md
git add README.md
git commit -m "docs: clarify practice repository"
git switch feature/rebase-demo
git rebase develop
git rev-parse HEAD
git log --oneline --graph --all
~~~

Expected: the feature now includes the README update and its commit ID changed. The direct develop commit is a controlled simulation of another integrated change, not a recommendation to bypass team review.

If rebase conflicts, inspect and edit, stage the resolved file, then `git rebase --continue`. Use `git rebase --abort` to cancel. `--skip` removes the current replayed commit; use it only when intentionally dropping that change.

### Interactive rebase

On an unshared branch with at least three commits after its base:

~~~bash
git rebase -i HEAD~3
~~~

A three-commit todo might be:

~~~text
pick aaaaaaa Add form
squash bbbbbbb Fix form label
reword ccccccc Add validation
~~~

This combines the first two and lets you rename the third. The hashes are illustrative. `edit` stops to modify a commit; `drop` removes it. Rebase only a range you have counted and reviewed. Do not copy HEAD~3 into the one-commit demo above.

An already pushed branch may need a coordinated history update after rebase. Do not rebase a published branch and then expect an ordinary push to succeed. If a team explicitly agrees to rewriting an owned branch, `--force-with-lease` adds a reference check but is not a substitute for coordination. No force push is needed for these exercises.

## 6. Pull requests and reviews

A PR asks to integrate a branch and gives reviewers the problem, result, and evidence. In a Git Flow practice project, the base is develop; in GitHub Flow, the base is main.

1. Save focused commits and push the feature branch to your own practice remote.
2. Open a PR and confirm the base branch and diff.
3. Explain the behavior and actual checks run using the [PR template](pull-request-template.md).
4. Review correctness, permissions, error behavior, tests, and relevant documentation.
5. Address comments, rerun affected checks, and merge according to project policy.

A useful comment names the problem and impact: “This handler returns before the database write finishes; could we await it and test a failed write?” State blocking defects clearly. Cosmetic preferences can be suggestions; there is no rule to avoid Request Changes when correctness needs work.

Delete a feature branch after its work is integrated and no one still needs it. `git branch -d NAME` checks merged status; `git fetch --prune` removes stale remote-tracking references, not local branches. Deleting a remote branch changes the shared repository and should follow the team policy.

## 7. Recovery and collaboration reference

| Situation | First action | Next step |
|---|---|---|
| Uncommitted work before switching | `git status`, `git diff` | Commit on an appropriate branch or stash with `-u` for untracked files |
| Commit on the wrong branch | Create a branch at that commit | Inspect whether it was shared; use a reviewed revert for published work |
| Missing local commit | `git reflog` | Find its ID and create a recovery branch; reflog is local and expires |
| Need one existing change | Inspect `git show COMMIT_ID` | Cherry-pick onto the right branch; it can conflict |
| Push rejected after someone else updated | Fetch and inspect both histories | Integrate deliberately rather than force pushing |
| Conflict during cherry-pick | `git status` | Resolve and continue, or abort that operation |

Reflog helps recover recorded commits, not every unsaved or untracked file. Hard reset can discard work that no commit contains.

## Course practice extension

Create a separate Express practice project with README, `.gitignore`, and `src/app.js`. Choose Git Flow for this exercise and explain the policy in README. Add the server in one branch through three or four focused commits, then add two routes in another branch. Simulate an overlapping edit, resolve it, and write a sample PR. If you need an API example, adapt [the Dockerfile lesson's source](../05-dockerfile-image-building/examples/node-api/src/index.js). Install dependencies intentionally and commit the manifest and lockfile.

## Review questions

1. When would Git Flow add useful structure?
2. What does rebase change that merge usually preserves?
3. Why is blindly accepting ours/theirs risky?
4. How do you cancel an in-progress merge versus rebase?
5. Does creating a PR automatically prove the code was tested?

<details>
<summary>Suggested answers</summary>

1. Scheduled releases and maintained release lines may need distinct integration/release branches.
2. Rebase replaces replayed commits and their identities.
3. It selects a whole side and can lose intended edits; rebase labels can also surprise you.
4. `git merge --abort` or `git rebase --abort`, respectively.
5. No. Review actual checks and their results.

</details>

## Completion and cleanup

- [ ] I can choose a strategy and explain its tradeoff.
- [ ] I made a three-commit feature and reviewed its integration.
- [ ] I created and resolved the intentional conflict.
- [ ] I rebased only the unshared practice branch and compared IDs.
- [ ] I prepared a concrete PR description.
- [ ] I recorded my evidence in a [daily note](../../templates/daily-note.md).

Keep the practice repository for reference. No remote branches, account settings, or SSH keys are created by preparation. If you personally created credentials or repositories, manage those separately when no longer needed.

**Preparation status:** The three-commit feature, explicit merge commit, intentional conflict and manual resolution, and unshared rebase passed in a temporary repository. Rebased commit IDs changed as expected. Interactive editing and account setup are explained but were not executed. Remote authentication, PRs, protected branches, and publishing remain account exercises.

**Next:** [Docker Fundamentals](../04-docker-fundamentals/README.md).
