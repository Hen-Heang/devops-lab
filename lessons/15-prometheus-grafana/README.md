# 15 · Deployment Monitoring with Prometheus & Grafana

Deployment tells you what changed. Monitoring tells you what happened afterward.

## Understand the tools

Metrics are numbers over time, logs describe individual events, and traces follow a request through services. Prometheus pulls metrics from targets; Grafana queries Prometheus and draws dashboards. An exporter translates host or container measurements into Prometheus metrics.

| Type | Example | Typical query |
|---|---|---|
| Counter | Total HTTP requests | `rate(http_requests_total[5m])` |
| Gauge | Current memory usage | `process_resident_memory_bytes` |
| Histogram | Request latency buckets | `histogram_quantile(...)` |

The supplied [monitoring stack](examples/monitoring-stack/compose.yaml) is a separate learning project. It includes a complete Express API, Prometheus configuration, alert rules, Grafana data-source provisioning, and an API dashboard. It does not depend on missing pasted code.

## Run the local exercise

```bash
cd lessons/15-prometheus-grafana/examples/monitoring-stack
cp .env.example .env
# Edit GRAFANA_PASSWORD in .env before starting.
docker compose --env-file .env -f compose.yaml config --quiet
docker compose --env-file .env -f compose.yaml up --build -d --wait
curl --fail http://localhost:3015/health
```

Open Grafana at `http://localhost:3001`, log in as admin with your configured password, and open **DevOps API**. Prometheus is already provisioned at `http://prometheus:9090`. Open the local Prometheus UI at `http://localhost:9090` and check Targets: `app` and `prometheus` should be UP.

The API serves normal requests on port 3000 and metrics on a separate internal port 9464. The host publishes only the normal API port. Public `/metrics` returns 404. This course-compatible example pins `prom-client` 15.1.3. npm currently marks that package deprecated in favor of a successor; evaluate the successor and its API before adopting this teaching example in a new production project.

The code defines both the request counter and duration histogram, so the lesson's queries refer to metrics that actually exist.

```bash
# Generate normal and missing-user requests
curl http://localhost:3015/users/1
curl http://localhost:3015/users/999
# Inspect internal metrics via the container, without publishing its metrics port
 docker compose --env-file .env -f compose.yaml exec app node -e "fetch('http://localhost:9464/metrics').then(r=>r.text()).then(console.log)"
```

Labels use route templates such as `/users/:id`, and unknown paths use `unmatched`. Raw user IDs, URLs, emails, and arbitrary query strings must not create unlimited metric series. An app scrape being UP proves the metrics endpoint answered; it is not proof of every dependency or public HTTPS working.

## Add host and container exporters on a Linux VPS

```bash
# Linux VPS, same monitoring-stack directory
docker compose --env-file .env -f compose.yaml -f compose.host.yaml config --quiet
docker compose --env-file .env -f compose.yaml -f compose.host.yaml up -d --wait
```

The [host overlay](examples/monitoring-stack/compose.host.yaml) supplies node-exporter and cAdvisor and adds their scrape targets. Host mounts and cAdvisor's privileged access are for a Linux Docker host; on Docker Desktop they describe the Linux VM rather than your physical Mac/Windows machine. Review them before using this overlay on your server. No exporter port is published.

Prometheus and Grafana host ports bind to localhost. On the VPS, use SSH tunnels:

```bash
ssh -p YOUR_SSH_PORT -L 9090:127.0.0.1:9090 -L 3001:127.0.0.1:3001 deploy@YOUR_VPS_IP
```

For HTTPS access through containerized NPM, join Grafana to the shared proxy network and forward to its service/network alias on port 3000. NPM's own localhost cannot reach a host-local port. Keep Prometheus, exporters, and the metrics listener internal. Disable anonymous access and sign-up; the example already sets both false.

## Ask useful questions

```promql
up
sum by (status) (rate(http_requests_total[5m]))
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
100 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100
```

Rate queries need multiple scrapes; wait and generate traffic. `node_*` queries need the host overlay. A 5xx ratio needs handling for no errors and no traffic; the supplied alert rule uses a zero fallback, clamps the denominator, and requires meaningful request volume.

## Alerts and a safe failure exercise

[alerts.yml](examples/monitoring-stack/prometheus/alerts.yml) defines an unavailable app target, a missing app target, and sustained high errors. Prometheus can show these rules pending/firing. **No notification receiver is configured**, so firing is not evidence that an email or chat message was sent.

Create a Grafana-managed rule for `up{job="app"}` below 1 for one minute, choose deliberate No Data behavior, and connect an existing approved contact point. Verify delivery yourself. Alternatively configure Alertmanager and route the supplied Prometheus rules to it; that requires additional configuration.

On this disposable learning stack only, stop `app`, wait for the rule, then start it again. Record both the alert and recovery. Import community host/container dashboards only after inspecting whether their queries match your exporter versions and labels; dashboard IDs alone are not compatibility guarantees.

## Checks and cleanup

Run API tests without Docker with `npm ci` and `npm test` inside `api/`. Validate Prometheus files with `promtool` when available. Verify the running stack's targets, dashboard, API health, and notification delivery separately.

```bash
# Stops this learning project; preserves named volumes
 docker compose --env-file .env -f compose.yaml down
# If using the host overlay, include -f compose.host.yaml too.
```

Review: Why use `rate` for a counter? What does UP actually prove? Why are route templates useful? Which ports are reachable publicly? What component delivers a notification?

Sources: [Prometheus configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/), [Alert rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/), [Node exporter](https://prometheus.io/docs/guides/node-exporter/), [cAdvisor](https://github.com/google/cadvisor), [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/), [Node metrics client](https://github.com/prometheus/client_js).
