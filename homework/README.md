# Homework

Store assigned DevOps homework here, separate from the self-paced [labs](../labs) and personal [notes](../notes).

## Structure

One folder per assignment, numbered in the order it was assigned. Keep the question and your answer as separate files so the two never get mixed together:

~~~text
homework/
  00-<short-topic>/
    question.md
    answer.md
  01-<short-topic>/
    question.md
    answer.md
~~~

## Create a new homework entry

PowerShell:

~~~powershell
New-Item -ItemType Directory homework\00-topic
New-Item -ItemType File homework\00-topic\question.md
Copy-Item templates\homework-answer.md homework\00-topic\answer.md
~~~

Bash:

~~~bash
mkdir -p homework/00-topic
touch homework/00-topic/question.md
cp templates/homework-answer.md homework/00-topic/answer.md
~~~

Paste the assignment prompt into `question.md` exactly as given. Fill in `answer.md` from the [homework answer template](../templates/homework-answer.md): approach, commands run, verification, and the final answer in your own words.

## Rules

- Number folders in assignment order, not topic order.
- One assignment per folder; keep supporting files (scripts, compose files, screenshots) inside that folder.
- Never commit credentials, tokens, or real production data.
