# End-to-end deployment workshop

This unnamed lesson is a supplement to sessions 09–15, not an extra numbered session. The supplied workshop allocates 20 minutes theory and 70 minutes practice.

## Your goal

Prove the complete path: Git push → checks → registry artifact → SSH deployment → healthy application → public HTTPS. Use the examples from lessons 11–14 and fill in the [deployment runbook](deployment-runbook.md).

1. Make a visible API response change on a practice repository. Commit it through your normal review process.
2. Watch every Actions job, including the published-image smoke test and deployment health check.
3. On the VPS, inspect the same Compose project with the same env files and overlays used by deployment.
4. Check the recorded release digest, API health, frontend proxy route, and public HTTPS endpoint.
5. Record actual duration and evidence; do not invent an expected deployment time.
6. Restore a previous successful digest through `deploy.sh`, verify it, then deploy the intended current digest.

Practice missing configuration on a disposable stack. Do not rename a production `.env` to simulate an incident. Required-variable checks should fail before changing containers. Also simulate an application that starts but fails health: a bare `up -d` can succeed while the service fails shortly afterward, whereas `up --wait` and HTTP checks provide stronger evidence.

## Debug from outside inward

Check DNS A/AAAA → TCP 443 → TLS/HTTP → proxy upstream/network → container health/logs → image digest/configuration → workflow logs. A failed ping does not prove the VPS is down; ICMP may be blocked. A green Actions job does not independently prove public DNS or TLS.

Finish when another person can follow the runbook, identify the running artifact, and restore a known-good release. Registry publishing, VPS access, certificate issuance, and alert delivery still need your real environment.
