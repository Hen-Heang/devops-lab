# Advanced Lab: Elastic Stack Log Pipeline

This is an optional Stage 6 observability lab. Complete the Linux, Docker, Compose, health-check, and basic logging lessons first.

This setup is for local learning only. It deliberately disables Elastic authentication and TLS, so it must not be copied into production.

## What this lab teaches

~~~text
sample-logs/demo-api.log
          |
          v
       Filebeat
          |
          v
       Logstash
          |
          v
    Elasticsearch
          |
          v
        Kibana
~~~

| Component | What | Why | When |
|---|---|---|---|
| Filebeat | A lightweight log shipper | Reads log files and forwards new events | Applications or hosts produce files that need centralized collection |
| Logstash | A configurable event pipeline | Receives, transforms, and routes events | Logs need parsing, enrichment, filtering, or multiple destinations |
| Elasticsearch | A search and analytics data store | Indexes events for fast search and aggregation | Centralized operational data must be queried across services |
| Kibana | A web interface for Elastic data | Explores events and builds visualizations | People need search, dashboards, and investigation tools |

Not every application needs this stack. Begin with application logs and docker logs. Add centralized logging when searching many services or hosts becomes difficult.

## Why the old configuration was replaced

The original experiment used:

- absolute paths from one macOS computer;
- unsupported Elastic 7.x versions;
- different versions for different stack components;
- Docker host log and socket mounts;
- no Elasticsearch data volume;
- dependencies that waited for Kibana instead of Elasticsearch.

This lab now uses:

- repository-relative mounts;
- the same supported 9.x version for all Elastic components;
- synthetic sample logs that work without Docker socket access;
- a named volume for Elasticsearch data;
- an Elasticsearch health check;
- host ports bound only to 127.0.0.1;
- an explicit local-only security warning.

## Prerequisites

- Docker Desktop with Linux containers is installed and running.
- Docker Compose is available through docker compose.
- Allocate at least 4 GB of memory to Docker Desktop; more may be needed alongside other applications.
- Host ports 9200 and 5601 are free.
- No production or sensitive log data is used.

Verify:

~~~powershell
docker version
docker compose version
docker info
~~~

## Configuration files

| File | Purpose |
|---|---|
| docker-compose.yml | Services, networking, volumes, ports, and startup relationships |
| .env.example | One shared Elastic version |
| filebeat.yml | Reads files from /logs and sends events to Logstash |
| logstash.conf | Receives Beats events, adds a learning field, and writes to Elasticsearch |
| logstash.yml | Logstash runtime settings |
| sample-logs/demo-api.log | Synthetic non-sensitive learning events |

Elastic requires the same version across the stack. Change ELASTIC_VERSION only after reviewing official release, compatibility, and upgrade guidance.

Filebeat 9.x identifies files by fingerprint and waits until a file reaches 1024 bytes by default. The tracked sample file is intentionally larger than that threshold so the first run can ingest it without changing the recommended identity behavior.

## Step 1: prepare the local environment file

Open PowerShell in the elasticsearch directory:

~~~powershell
Set-Location elasticsearch
Copy-Item .env.example .env
Get-Content .env
~~~

The .env file is ignored by Git. This example contains only a public version number, but the same pattern is often used for local configuration.

Do not put production credentials in this learning file.

## Step 2: validate before starting

~~~powershell
docker compose config
~~~

What: Compose merges configuration, resolves variables, and validates the document it can parse.

Why: syntax and interpolation errors should be found before containers are created.

When: run after every Compose or .env change and before a pull request.

Expected result:

- all four services appear;
- all image names use the same version;
- mounts resolve under this elasticsearch directory;
- no validation error is printed.

Review the images without starting containers:

~~~powershell
docker compose config --images
~~~

## Step 3: pull and start the stack

Pulling can download several large images:

~~~powershell
docker compose pull
docker compose up -d
~~~

What:

- pull downloads the selected images;
- up creates the project network and volumes;
- -d leaves the services running in the background;
- Compose waits for Elasticsearch health before creating dependent services.

Watch state and logs:

~~~powershell
docker compose ps
docker compose logs --tail 50 elasticsearch
docker compose logs --tail 50 logstash
docker compose logs --tail 50 filebeat
~~~

Do not treat a container state alone as success. Continue with functional checks.

## Step 4: verify Elasticsearch

~~~powershell
curl.exe 'http://localhost:9200/_cluster/health?pretty'
~~~

Expected result:

- an HTTP success response;
- a JSON cluster health document;
- one single-node development cluster.

A yellow state can be normal for a single-node lab when replica shards cannot be assigned to another node. Read the shard explanation before changing settings.

Query the learning index:

~~~powershell
curl.exe 'http://localhost:9200/devops-learning-*/_search?pretty&size=5'
~~~

The first events can take time while Logstash and Filebeat start. If no index exists, use the troubleshooting section instead of restarting everything randomly.

## Step 5: verify Kibana

Open http://localhost:5601.

Kibana can take longer than Elasticsearch to become ready. Check its logs if the page is still unavailable:

~~~powershell
docker compose logs --tail 100 kibana
~~~

To explore the events:

1. Open Discover in Kibana.
2. Create a data view for devops-learning-* if requested.
3. Select the timestamp field offered by the indexed events.
4. Search for level=ERROR or service=demo-api.
5. Find the learning_pipeline field added by Logstash.

## Step 6: follow one event through the pipeline

Choose one request_id from sample-logs/demo-api.log.

Find it in:

1. the source log file;
2. Filebeat logs;
3. Logstash output;
4. the Elasticsearch search response;
5. Kibana Discover.

This proves the complete data path instead of proving only that four containers started.

To generate another event, add a new non-sensitive line to sample-logs/demo-api.log with your editor. Filebeat should detect the appended line and send it.

## Persistence

The named volume elasticsearch-data stores indexed events separately from the Elasticsearch container.

The named volume filebeat-data stores Filebeat registry state. It prevents Filebeat from resending the same file from the beginning every time its container restarts.

This distinction matters:

| Command | Containers | Named volumes | Data |
|---|---|---|---|
| docker compose stop | Kept | Kept | Kept |
| docker compose down | Removed | Kept | Kept |
| docker compose down --volumes | Removed | Removed | Deleted |

## Cleanup

Inspect the exact project first:

~~~powershell
docker compose ps
docker compose config --volumes
~~~

Stop and remove containers while keeping learning data:

~~~powershell
docker compose down
~~~

To permanently delete this lab data, first confirm you are inside the elasticsearch directory and that the displayed project is devops-elastic-lab:

~~~powershell
Get-Location
docker compose ls
docker compose down --volumes
~~~

The final command deletes the named volumes for this project. Use it only when the indexed learning data is no longer needed.

## Troubleshooting

### Docker is unavailable

Evidence:

~~~powershell
docker version
docker info
~~~

Fix: install or start Docker Desktop and wait for its Linux engine. Repository changes cannot fix a missing Docker engine.

### A service exits

Inspect state and only that service log:

~~~powershell
docker compose ps -a
docker compose logs --tail 150 SERVICE_NAME
~~~

Replace SERVICE_NAME with elasticsearch, kibana, logstash, or filebeat.

### Elasticsearch exits with a memory error

Cause: Docker Desktop does not have enough memory for the stack.

Fix: close unnecessary containers, increase Docker Desktop resources, then recreate the lab. Do not remove volumes unless data reset is intended.

### No devops-learning index exists

Check in dependency order:

~~~powershell
docker compose ps
docker compose logs --tail 100 elasticsearch
docker compose logs --tail 100 logstash
docker compose logs --tail 100 filebeat
~~~

Possible causes:

- Logstash is not ready yet;
- the sample file was already recorded in the Filebeat registry;
- a configuration mount failed;
- an image version does not exist;
- Elasticsearch rejected events.

Append one new sample line and repeat the query. Reset volumes only if you intentionally want a completely new lab.

### Port 9200 or 5601 is allocated

PowerShell:

~~~powershell
Get-NetTCPConnection -LocalPort 9200 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 5601 -ErrorAction SilentlyContinue
docker ps
~~~

Identify the owner before stopping anything. Alternatively, change only the host side of the relevant port mapping.

## Security boundary

This lab sets xpack.security.enabled to false so a beginner can inspect the pipeline without first configuring certificates and service credentials.

Therefore:

- use it only on a trusted local computer;
- keep ports bound to 127.0.0.1;
- never deploy this Compose file to a server;
- never ingest customer, authentication, payment, or production logs;
- enable authentication and TLS for any real environment;
- protect and minimize access to operational data.

## Official references

- [Install Elasticsearch with Docker](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch)
- [Run Filebeat on Docker](https://www.elastic.co/docs/reference/beats/filebeat/running-on-docker)
- [Filebeat filestream input](https://www.elastic.co/docs/reference/beats/filebeat/filebeat-input-filestream)
- [Elastic version support policy](https://www.elastic.co/support/eol)
- [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)

## Completion check

- [ ] I can explain the purpose of every service.
- [ ] docker compose config succeeds.
- [ ] Every Elastic component uses the same version.
- [ ] Elasticsearch answers an HTTP health request.
- [ ] A sample event reaches the devops-learning index.
- [ ] I can find the event in Kibana.
- [ ] I traced one request_id through the complete pipeline.
- [ ] I can explain both named volumes.
- [ ] I understand why this configuration is local-only.
- [ ] I cleaned up containers and intentionally chose whether to keep data.

See [DOCKER-COMMANDS.md](DOCKER-COMMANDS.md) for a corrected command reference.
