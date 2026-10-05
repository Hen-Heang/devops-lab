# Preparation verification

Checked locally on October 5, 2026. These results verify the supplied examples, not completion of your course or a production deployment.

## Deployment and monitoring batch: lessons 09–15

- Three complete GitHub Actions workflow templates passed actionlint 1.7.12.
- Six Compose configurations passed `config --quiet`: development, production, proxy, production plus proxy, monitoring, and monitoring plus Linux host exporters.
- Both Prometheus scrape configurations and alert rules passed promtool 3.15.0 validation.
- Monitoring API tests passed: health/public metrics separation, counter and histogram route labels, and bounded unmatched-route labels (3 tests).
- A temporary local Prometheus process scraped the real API. UP, request counter, rate, and histogram p95 queries returned data. Both temporary processes were stopped afterward.
- Deployment Bash syntax passed. With mocked Docker/curl/flock commands, failed pulls stopped before update; failed health checks did not write a successful release record; successful updates recorded current and preceding digests; mutable references were rejected. This simulation does not verify Docker behavior or OS locking.
- Local lesson Markdown file links resolve. Workflow/API formatting was applied; tracked changes pass `git diff --check`.

## Still requires your real environment

Docker Engine was unavailable locally. No new container builds or container startup checks are claimed for this batch. No registry publication, GitHub hosted workflow run, SSH deployment, VPS provisioning, firewall change, DNS change, certificate issuance, Grafana UI verification, or notification delivery was performed.

The Prometheus rules can fire without sending messages: configure and test a notification receiver separately. Development examples and documentation are prepared; live exercise checkboxes remain for your own verified evidence.
