# Lesson 02: Git Fundamentals

**Course:** W1 D2 · August 11, 2026 · roadmap stage 1

Git records snapshots of your project so you can explain changes, compare versions, and work on separate branches. GitHub hosts repositories and adds collaboration tools. You can make local Git commits without GitHub or an internet connection.

**Goal:** Create a repository, review and stage changes, make meaningful commits, use a branch, ignore generated files, and understand how to share work.

**Before starting:** Install Git and run `git --version`. The local exercises use Bash, WSL, macOS Terminal, or Git Bash. Windows users can open Git Bash for these blocks; ordinary Git commands also work in PowerShell. No Node.js installation is needed unless you want to run the sample JavaScript.

[Source record and corrections](source.md) · [Course list](../COURSE.md)

## 1. The mental model

~~~text
Edit a file → Working tree
  git add   → Staging area (the next snapshot you have selected)
  git commit → Local history
  git push   → Remote repository
~~~

| Term | Simple meaning |
|---|---|
| Working tree | Files you currently edit |
| Index / staging area | The version of each file selected for the next commit |
| Commit | A recorded snapshot with parents, author information, and a message |
| Branch | A movable name pointing to a commit |
| HEAD | Usually identifies your current branch and therefore its current commit |
| Remote | A named URL for another repository; `origin` is a convention |
| Remote-tracking branch | Your local record of a remote branch, such as `origin/main`, updated by fetch |

A commit saves **staged** content. If you stage a file and edit it again, the new edit is not included until you stage it again. Git does not automatically save every file edit. A working file is the version you checked out plus local edits, not necessarily the latest version from GitHub.

For your Spring Boot or Next.js projects, Git lets you connect a bug fix to a particular change and review its history without keeping `final-v2` copies of files.

## 2. Exercise A: your first repository

Use a new practice directory outside this course repository. Do not initialize Git inside the lesson folder. These commands create a small separate project:

~~~bash
mkdir -p ~/devops-practice
cd ~/devops-practice
mkdir git-fundamentals-practice
cd git-fundamentals-practice
git init -b main
git config user.name "Your Name"
git config user.email "your.email@example.com"
git config --get user.name
git config --get user.email
printf '# Git Practice\n' > README.md
printf "console.log('Hello Git!');\n" > app.js
git status --short
git add README.md app.js
git diff --staged
git commit -m "chore: create Git practice project"
git log --oneline
git status --short
~~~

Replace the identity placeholders before making your own commits. This example sets identity **only for this practice repository**. `--global` applies a setting to your other repositories too; use it deliberately. GitHub's verified email or its account-specific noreply email can link commits to your account. Identity is not authentication.

**Expected:** one commit on main and a clean working tree; the final short status prints nothing. If the directory already exists, choose a new practice name rather than overwriting it.

### See the difference between staged and unstaged

Run inside your practice repository:

~~~bash
printf "console.log('Welcome to Git!');\n" >> app.js
git diff
git add app.js
git diff --staged
printf "console.log('One more edit');\n" >> app.js
git diff
git diff --staged
git status --short
~~~

**Expected:** the staged diff includes Welcome; the unstaged diff includes One more edit. Short status shows `MM app.js`: the first column describes staging, the second the working tree.

Commit both edits intentionally:

~~~bash
git add app.js
git diff --staged
git commit -m "feat: add greeting messages"
~~~

## 3. Exercise B: a feature branch

~~~bash
git switch -c feature/add-greeting
printf "console.log('Hello from the feature branch');\n" >> app.js
git add app.js
git commit -m "feat: add branch greeting"
git switch main
cat app.js
git show feature/add-greeting:app.js
git log --oneline --graph --all
~~~

**Expected:** main does not have the new feature greeting; the feature snapshot does. Branches are references into history, not separate folders. Switching updates tracked files; unrelated local changes may follow you or prevent switching. Check status first.

Merge after reviewing:

~~~bash
git diff main..feature/add-greeting -- app.js
git merge feature/add-greeting
git branch -d feature/add-greeting
git status --short
~~~

This merge can fast-forward main because main has no new commits since the feature started. A merge does not always create a merge commit. The next lesson explains divergent histories.

## 4. Exercise C: ignore files

Create ignore rules before adding sensitive or generated files. In this disposable exercise, `.env` contains only a fake value:

~~~bash
cat > .gitignore <<'IGNORE'
node_modules/
.env
.env.*
!.env.example
logs/
*.log
.DS_Store
Thumbs.db
.next/
dist/
coverage/
IGNORE
mkdir -p logs node_modules
printf 'example log\n' > logs/example.log
printf 'DEMO_VALUE=not-a-real-secret\n' > .env
printf '{}\n' > node_modules/package.json
git status --short
git check-ignore .env logs/example.log node_modules/package.json
git add .gitignore
git diff --staged
git commit -m "chore: ignore local configuration and generated files"
~~~

**Expected:** the generated files are ignored; `.gitignore` is committed. `.env.example` can be committed with placeholders.

Ignore rules do not untrack an already tracked file or erase earlier history. For an ordinary file you want to stop tracking, `git rm --cached filename` removes it from the next snapshot while keeping the working file; review before committing. If a real secret was committed, revoke or rotate it promptly and coordinate any history cleanup. A revert does not remove the secret from old commits.

## 5. Share on GitHub (optional account exercise)

Create an empty GitHub repository called `git-fundamentals-practice`. For this local-first path, do not initialize the remote with a README. Substitute your own username and confirm the URL before publishing:

~~~bash
git remote add origin https://github.com/YOUR_USERNAME/git-fundamentals-practice.git
git remote -v
git push -u origin main
~~~

`-u` sets the upstream association so later push/pull commands can use it. These commands publish your practice files; they are instructions for you and have not been executed during preparation.

GitHub does not accept your account password for HTTPS Git authentication. Use a credential manager, GitHub CLI login, an appropriate token, or SSH. See [GitHub authentication](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github) and the [next lesson's authentication guide](../03-git-advanced-branching/README.md).

### Fetch versus pull

~~~bash
git status
git fetch origin
git log --oneline --graph --all
git pull --ff-only origin main
~~~

Fetch updates remote-tracking information without integrating it into your current branch. Pull fetches and then integrates. `--ff-only` refuses an automatic merge when the histories have diverged; inspect that divergence instead of adding a force flag. Run this main update while on main with your local work saved. Pull is not a required ritual before every push.

If the GitHub repository already has commits, cloning it is usually the simpler starting point:

~~~bash
git clone https://github.com/YOUR_USERNAME/existing-repository.git
~~~

Use the actual repository name; do not blindly combine separately initialized histories.

## 6. Keep commits understandable

A useful commit answers what changed and, when needed, why. Keep one coherent change together:

~~~text
feat: add borrower search
fix: wrap navigation labels on small screens
docs: explain local database setup
~~~

Prefixes from Conventional Commits are useful when a project uses that convention; Git does not require them. Explain substantial reasons in a commit body. Do not claim tests passed unless you ran them.

## 7. Command reference and safe undo choices

| Need | Command | Meaning |
|---|---|---|
| Inspect work | `git status`, `git diff`, `git diff --staged` | See what exists and what the next commit will save |
| Stage a selected file | `git add app.js` | Select its current content |
| Unstage while keeping edits | `git restore --staged app.js` | Restore the index from HEAD |
| Discard unstaged edits in one file | `git restore app.js` | Replace working content with the index; local edits are lost |
| Inspect a snapshot | `git show HEAD` | Show the latest commit |
| Follow a file | `git log --follow -- app.js` | Follow history including rename detection |
| Save tracked and untracked work temporarily | `git stash push -u -m "pause practice"` | Ignored files are not included |
| Restore stash without removing it | `git stash apply` | May conflict; inspect before deleting the stash |
| Undo a published ordinary commit | `git revert COMMIT_ID` | Add an inverse commit; does not erase history |

The unstage/discard distinction follows the [Git restore reference](https://git-scm.com/docs/git-restore). Discard only edits you have reviewed and intentionally do not need.

`git commit -am` includes modifications/deletions of tracked files, not new untracked files. `git commit --amend` replaces the last commit; reserve it for your own unshared work. `git reset --soft HEAD~1` moves the branch back while keeping changes staged, but requires a parent commit and rewrites history. Hard reset discards tracked changes; it is not a routine beginner undo step. Stash clear and forced branch deletion can remove useful recovery references.

## 8. Collaboration exercise and portfolio challenge

For a local collaboration simulation, continue in the fundamentals practice repository:

~~~bash
git switch main
git switch -c feature/user-input
cat > input.js <<'JS'
const readline = require('node:readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('What is your name? ', (name) => {
  console.log(`Hello, ${name}!`);
  rl.close();
});
JS
git add input.js
git commit -m "feat: add interactive greeting"
printf '\n## Features\n- Greeting messages\n- Interactive user input\n' >> README.md
git add README.md
git commit -m "docs: describe greeting features"
git switch main
git diff main..feature/user-input
git merge feature/user-input
git branch -d feature/user-input
~~~

If Node is installed, run `node input.js`, enter a practice name, and expect a personalized greeting. A real team normally reviews this through a pull request; [lesson 03](../03-git-advanced-branching/README.md) supplies a complete conflict exercise and PR template.

For the course portfolio challenge, create a separate `my-portfolio` repository with README, ignore rules, and a small HTML page. Add header, about, and projects through three branches, with at least two meaningful commits per branch. Merge each reviewed branch, then create the next from updated main. Publish only after reviewing tracked files. Optional branches add CSS and an interaction.

## Troubleshooting

| Symptom | Check | Next action |
|---|---|---|
| Author identity unknown | `git config --get user.name` and user.email | Set local identity |
| Nothing to commit | `git status`, staged diff | Stage the intended file; distinguish ignored files |
| Not a Git repository | `pwd`, `git rev-parse --show-toplevel` | Enter the practice repository |
| Main does not exist | `git branch` | This exercise uses `git init -b main`; inspect your actual branch |
| Push rejected | Status, remote, authentication, `git fetch` | Inspect remote commits and access; do not force push |
| Detached HEAD | `git status` | If keeping new commits, create a branch before switching away |

## Review questions

1. What can Git do without GitHub?
2. If you edit after staging, what does the next commit contain?
3. How do you unstage without deleting edits?
4. What is origin?
5. Why does `.gitignore` not fix a committed secret?
6. How do fetch and pull differ?

<details>
<summary>Suggested answers</summary>

1. Record history, inspect differences, branch, and merge locally.
2. The previously staged version, unless you stage again.
3. `git restore --staged FILE`.
4. A conventional remote name, not a special GitHub server.
5. It affects untracked paths, not saved history; revoke the secret and handle history separately.
6. Fetch updates remote references; pull also integrates into the current branch.

</details>

## Completion and cleanup

- [ ] I understand working tree, index, and commits.
- [ ] I created and merged a feature branch.
- [ ] I checked ignore rules and reviewed staged content.
- [ ] I made at least five focused commits across my practice exercises.
- [ ] I can explain remote sharing and authentication.
- [ ] I recorded actual results in a [daily note](../../templates/daily-note.md).

Keep the practice repository as learning evidence. It creates no background service. Delete only that practice directory later if you no longer need its files and history. Optional GitHub repositories remain until you manage them yourself.

**Preparation status:** The local staging, branch, ignore, interactive greeting, and merge exercises passed in temporary practice repositories. Push, clone, fetch, and ff-only pull passed against an isolated local bare remote. GitHub authentication and publishing require your account and are not performed here.

**Next:** [Git Advanced & Branching Strategies](../03-git-advanced-branching/README.md).
