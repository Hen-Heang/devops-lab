# Lab 00: DevOps Foundations

## Objective

Learn how to inspect your environment before changing it. You will practise directories, files, environment variables, processes, ports, HTTP, and a small health-check shell script.

## Why this lab comes first

Docker, CI runners, and cloud servers hide very little. When something fails, you need to answer:

- Where am I?
- Which files exist?
- Which user is running the command?
- Which process is running?
- Which port is listening?
- Which configuration value is set?
- What did the HTTP server return?

## Prerequisites

- Complete [Windows setup](../../docs/WINDOWS-SETUP.md).
- Open WSL Ubuntu for the main commands.
- Keep a PowerShell tab open for comparison.

## Part 1: identify the shell and location

WSL:

~~~bash
echo $SHELL
pwd
whoami
uname -a
~~~

What:

- echo prints your active shell path;
- pwd prints the current directory;
- whoami prints the current user;
- uname prints operating-system and kernel information.

Why: many dangerous mistakes happen because a command is run as the wrong user or in the wrong directory.

When: check before file operations, scripts, deployment commands, or troubleshooting.

PowerShell comparison:

~~~powershell
$PSVersionTable
Get-Location
whoami
~~~

## Part 2: create and inspect files

Run from this lab directory:

~~~bash
mkdir -p devops-practice/logs
printf 'service=demo status=starting\n' > devops-practice/logs/app.log
ls -la devops-practice
find devops-practice -maxdepth 2 -type f
cat devops-practice/logs/app.log
~~~

What:

- mkdir -p creates the requested directory path;
- printf writes one predictable line;
- ls shows directory entries and permissions;
- find searches for files;
- cat prints a small text file.

Why: configuration, logs, artifacts, and scripts are all files. You must know exactly which file a command reads or writes.

When: preparing an application directory, checking build output, or reading logs.

## Part 3: environment variables

~~~bash
export DEMO_SERVICE_URL='http://localhost:8080'
printenv DEMO_SERVICE_URL
~~~

What: export creates a variable inherited by programs started from this shell.

Why: applications often receive ports, URLs, feature settings, and secret references at runtime.

When: local experiments, CI jobs, containers, and server services.

The variable disappears when this shell session ends unless a startup file or service definition sets it again.

Never store a real secret in shell history while learning.

## Part 4: start and inspect a local HTTP process

Check whether Python 3 exists:

~~~bash
python3 --version
~~~

If available, start a temporary server from the practice directory:

~~~bash
cd devops-practice
python3 -m http.server 8080
~~~

Keep it running and open a second WSL tab.

Verify from the second tab:

~~~bash
curl -i http://localhost:8080/logs/app.log
ss -ltnp | grep :8080
ps aux | grep '[h]ttp.server'
~~~

What:

- curl shows the HTTP status, headers, and body;
- ss shows which process is listening on port 8080;
- ps shows the running server process.

Why: this is the same evidence pattern used for Spring Boot, Next.js, Nginx, and deployed services.

When: a service is unreachable, returns the wrong content, or cannot bind to a port.

Keep the server running for Part 5.

If Python is unavailable, record that result and continue. Do not install it only to finish this lab. You can still read and explain the script in Part 5, but record its live checks as blocked.

## Part 5: write a small health-check script

In the second WSL tab, return to this lab directory. Confirm the directory before creating the script:

~~~bash
pwd
find ./devops-practice -maxdepth 2 -type f -print
~~~

Create the script:

~~~bash
cat > devops-practice/check-http.sh <<'EOF'
#!/usr/bin/env bash
set -u

url="${1:-http://localhost:8080/logs/app.log}"

if curl --fail --silent --show-error --output /dev/null "$url"; then
  printf 'healthy: %s\n' "$url"
  exit 0
fi

printf 'unhealthy: %s\n' "$url" >&2
exit 1
EOF

chmod 750 devops-practice/check-http.sh
~~~

Run it while the HTTP server is available:

~~~bash
./devops-practice/check-http.sh
printf 'exit=%s\n' "$?"
~~~

Expected exit status: `0`, meaning the check succeeded.

Return to the first tab and press Ctrl+C. Then verify the failure path in the second tab:

~~~bash
ss -ltnp | grep :8080
./devops-practice/check-http.sh
printf 'exit=%s\n' "$?"
~~~

No matching `ss` line and a non-zero script exit status are the expected results.

What:

- `#!/usr/bin/env bash` selects Bash through the current environment;
- `set -u` stops the script if it reads an unset variable;
- `${1:-...}` accepts an optional URL and otherwise uses the local lab URL;
- `curl --fail` returns a non-zero status for connection failures and HTTP errors;
- `if` converts the command result into an explicit success or failure message;
- `exit 0` means success, while `exit 1` means failure.

Why: CI jobs, health checks, and deployment scripts need reliable exit statuses, not only text that looks successful.

When: automate a small, already-understood check after you can run and diagnose the same command manually.

## Part 6: understand permissions

~~~bash
ls -l devops-practice/logs/app.log
chmod 640 devops-practice/logs/app.log
ls -l devops-practice/logs/app.log
~~~

The three permission groups are:

~~~text
owner | group | others
rw-   | r--   | ---
~~~

For chmod 640:

- 6 means read plus write for the owner;
- 4 means read for the group;
- 0 means no access for others.

Why: services should receive only the access they need.

When: scripts cannot execute, a service cannot read configuration, or sensitive files are too widely readable.

Do not solve every permission error with chmod 777.

## Troubleshooting challenge

Start the HTTP server twice on port 8080.

Expected result: the second process fails because only one process can listen on the same IP address and port combination.

Record:

1. the exact error;
2. the process already using the port;
3. whether you stopped it or selected another port;
4. the command that proved the fix.

Stop the temporary server before continuing.

## Part 7: clean up safely

First confirm both the current directory and exact target:

~~~bash
pwd
find ./devops-practice -maxdepth 3 -print
~~~

Then remove only the directory created by this lab:

~~~bash
rm -r ./devops-practice
~~~

Verify:

~~~bash
test ! -e ./devops-practice && echo 'cleanup complete'
~~~

## Completion check

- [ ] I can identify PowerShell versus Bash.
- [ ] I check my current directory before changing files.
- [ ] I can read a small log file.
- [ ] I can set and inspect a temporary environment variable.
- [ ] I can identify a listening port and its process.
- [ ] I can explain every line of the health-check script.
- [ ] The script returns zero when the server is available and non-zero when it is unavailable.
- [ ] I understand chmod 640.
- [ ] I stopped the temporary server.
- [ ] I removed only the practice directory.
- [ ] I documented one Error -> Cause -> Fix.

Continue to [Lab 01: Docker basics](../01-docker-basics/README.md).
