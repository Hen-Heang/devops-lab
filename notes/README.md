# Learning Notes

Store completed study evidence in this directory.

## Naming

Use a sortable date and a short topic:

~~~text
2026-08-10-docker-container-lifecycle.md
2026-08-12-linux-processes-and-ports.md
~~~

## Create a daily note

PowerShell:

~~~powershell
Copy-Item templates\daily-note.md notes\2026-08-10-topic.md
~~~

Bash:

~~~bash
cp templates/daily-note.md notes/2026-08-10-topic.md
~~~

Replace the date and topic with your real session.

## What makes a useful note?

A useful note proves learning. It contains:

- the goal;
- what the concept is;
- why it matters;
- when it should be used;
- commands you actually ran;
- important output;
- one Error -> Cause -> Fix example;
- a verification result;
- the next small action.

Never store passwords, tokens, private keys, personal production data, or complete sensitive logs here.
