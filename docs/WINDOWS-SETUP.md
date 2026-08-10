# Windows Setup for DevOps Learning

This repository is being used from Windows. The recommended beginner environment is:

~~~text
Windows Terminal
|-- PowerShell: Windows files and Windows administration
+-- WSL 2 Ubuntu: Linux commands and server practice

Docker Desktop
+-- WSL 2 backend: runs Linux containers
~~~

## Why use both PowerShell and WSL?

PowerShell is useful because your computer is Windows. WSL is useful because most servers, CI runners, and containers use Linux concepts.

Do not try to make PowerShell pretend to be Bash. Learn which shell you are using and choose the matching command.

| Task | Recommended environment |
|---|---|
| Manage Windows files or services | PowerShell |
| Learn Linux commands and permissions | WSL Ubuntu |
| Run Docker commands | PowerShell or WSL |
| Run Bash scripts | WSL |
| Work with IntelliJ | Windows |
| Connect to a Linux server | WSL or Windows SSH |

## 1. Install Windows Terminal

What: a terminal application that can open PowerShell, Command Prompt, and WSL tabs.

Why: it gives you one place for different shells.

When: use it whenever you run commands during this course.

Install Windows Terminal from the Microsoft Store if it is not already available.

## 2. Install or update WSL 2

Open PowerShell as Administrator for the initial setup:

~~~powershell
wsl --version
wsl --status
~~~

If WSL is not installed:

~~~powershell
wsl --install
~~~

If it is installed but old:

~~~powershell
wsl --update
~~~

Restart Windows if requested. Then install or select Ubuntu:

~~~powershell
wsl --list --online
wsl --install -d Ubuntu
~~~

The first Ubuntu start asks you to create a Linux username and password. This account is separate from your Windows account.

Verify inside Ubuntu:

~~~bash
uname -a
cat /etc/os-release
pwd
whoami
~~~

Expected result:

- uname reports Linux;
- the OS file reports Ubuntu;
- pwd shows your Linux home directory;
- whoami shows your Linux username.

## 3. Understand Windows and WSL paths

The Windows path:

~~~text
E:\devops-learning
~~~

is normally available in WSL as:

~~~text
/mnt/e/devops-learning
~~~

Open it from WSL:

~~~bash
cd /mnt/e/devops-learning
pwd
ls -la
~~~

This location is acceptable for the beginner labs. Large Node or Docker builds are often faster when a repository is stored inside the WSL Linux filesystem, but moving the project is not required to begin.

## 4. Install Git

Verify from PowerShell:

~~~powershell
git --version
git config --global user.name
git config --global user.email
~~~

If your name or email is missing, configure the identity that should appear in commits:

~~~powershell
git config --global user.name 'Your Name'
git config --global user.email 'you@example.com'
~~~

Do not copy the example email literally.

Useful verification:

~~~powershell
git status
git remote -v
~~~

What these commands answer:

- git status: which branch am I on and what files changed?
- git remote -v: which remote repository will receive a push?

## 5. Install Docker Desktop

Docker Desktop with the WSL 2 backend is the simplest supported way to run Linux containers on Windows.

Before installing, verify:

- hardware virtualization is enabled;
- WSL 2 works;
- the computer has enough memory;
- your Docker Desktop usage follows Docker licensing terms.

Install Docker Desktop from the official Docker website. During setup, use the WSL 2 backend. Start Docker Desktop and wait until its engine reports that it is running.

Verify:

~~~powershell
docker version
docker compose version
docker info
~~~

What the output means:

- docker version should show both Client and Server;
- docker compose version proves the modern Compose plugin is available;
- docker info proves the client can reach the Docker engine.

If docker version shows only the client or a connection error, Docker Desktop is installed but its engine is not ready.

## 6. Run a safe smoke test

~~~powershell
docker run --rm hello-world
~~~

What:

- Docker downloads a small image if necessary;
- creates a container;
- runs it;
- prints a success explanation;
- removes the stopped container because of --rm.

Why: this verifies the client, engine, network download, image storage, and container runtime together.

When: run it after installing Docker or when you suspect the Docker engine is broken.

Verify no stopped test container remains:

~~~powershell
docker ps -a
~~~

## 7. Verify HTTP tools

PowerShell:

~~~powershell
curl.exe --version
Test-NetConnection localhost -Port 8080
~~~

WSL:

~~~bash
curl --version
which curl
~~~

Use curl.exe in Windows examples because Windows PowerShell may use curl as an alias for Invoke-WebRequest.

## 8. Optional Java and Node checks

These tools are not required for the first Docker lab, but the later capstone needs them.

~~~powershell
java -version
node --version
npm --version
~~~

Record the versions instead of installing random replacements. Each future application should declare its required Java and Node versions.

## 9. Recommended editor settings

- Save text files as UTF-8.
- Use LF line endings for shell scripts.
- Show hidden files so .gitignore and .env.example are visible.
- Enable final newlines.
- Do not enable automatic formatting for unfamiliar configuration until you review the diff.

The repository includes an .editorconfig file so compatible editors can apply these basics.

## 10. Common setup failures

### docker is not recognized

Cause: Docker Desktop is missing, its command directory is not on PATH, or the terminal was open during installation.

Fix:

1. Install and start Docker Desktop.
2. Close and reopen the terminal.
3. Run docker version.

### Cannot connect to the Docker daemon

Cause: Docker Desktop is not running or its engine is still starting.

Fix:

1. Open Docker Desktop.
2. Wait for the engine to report healthy.
3. Run docker info again.

### WSL command returns no version information

Cause: the older Windows-provided WSL package may be installed.

Fix: update WSL from an Administrator PowerShell terminal, restart if requested, and verify again.

### A Linux command fails in PowerShell

Cause: Bash and PowerShell are different shells.

Fix: open Ubuntu through WSL for Bash commands, or use the documented PowerShell equivalent.

### Port 8080 is already in use

Cause: another program or container already listens on the host port.

PowerShell diagnosis:

~~~powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
docker ps
~~~

WSL diagnosis:

~~~bash
ss -ltnp | grep :8080
docker ps
~~~

Do not stop a process until you identify what it is. You can often choose another host port instead.

## Official references

- [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Use Docker Desktop with WSL 2](https://docs.docker.com/desktop/features/wsl/)
- [Install WSL](https://learn.microsoft.com/windows/wsl/install)

## Completion check

- [ ] I can open both PowerShell and WSL Ubuntu.
- [ ] I can explain the difference between Windows and Linux paths.
- [ ] git status works in the repository.
- [ ] docker version shows a client and server.
- [ ] docker compose version works.
- [ ] docker run --rm hello-world succeeds.
- [ ] I know whether a command is PowerShell or Bash before running it.
- [ ] I recorded any setup error and its fix.

Continue to [Lab 00: foundations](../labs/00-foundations/README.md).
