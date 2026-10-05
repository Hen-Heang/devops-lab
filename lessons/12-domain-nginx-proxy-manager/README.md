# 12 · Domain Mapping & Nginx Proxy Manager

DNS finds the address. A reverse proxy chooses the application. TLS encrypts the connection. These are three different jobs.

## What you will learn

Point a domain at a VPS, connect containers to one shared proxy network, and route HTTPS requests through Nginx Proxy Manager (NPM). Complete lessons 10 and 11 first. Domain ownership and a running VPS are prerequisites for the remote exercises.

```text
Browser → DNS → VPS:443 → NPM → lesson-api:3000
                            → lesson-frontend:80
```

An A record maps a name to IPv4; AAAA maps to IPv6; CNAME maps one name to another name. With Cloudflare DNS-only, a lookup returns your origin address. With proxying enabled, it returns Cloudflare edge addresses. Check both A and AAAA records when troubleshooting.

## Start the proxy on your VPS

The complete [proxy Compose file](examples/proxy/compose.yaml) publishes 80 and 443, binds the admin UI to `127.0.0.1:8181`, persists settings/certificates, and creates a network explicitly named `devops-proxy`.

```bash
# VPS: directory containing the supplied proxy compose.yaml
 docker compose -f compose.yaml config --quiet
 docker compose -f compose.yaml up -d
```

Copy [compose.proxy.yaml](examples/compose.proxy.yaml) into the application directory from lesson 11. Start the proxy first, then include that overlay when starting the application:

```bash
# VPS: /home/deploy/app
 docker compose --env-file .env -f compose.yaml -f compose.prod.yaml -f compose.proxy.yaml up -d --wait
```

The overlay joins the external network created by NPM and supplies stable aliases `lesson-api` and `lesson-frontend`. Keep the application network too. Do not create a second, differently named proxy network.

## Open the admin UI through SSH

```bash
# Laptop: substitute your real port and address
ssh -p YOUR_SSH_PORT -L 8181:127.0.0.1:8181 deploy@YOUR_VPS_IP
```

Open `http://localhost:8181`. Follow the initial setup instructions for the pinned NPM version; historical default credentials are not universal. Set your own admin credentials. A containerized NPM reaches applications over the shared Docker network, not its own `localhost`.

## Configure DNS and HTTPS

1. Create DNS-only A records for `api.yourdomain.com` and `app.yourdomain.com` pointing to your VPS.
2. Run `dig api.yourdomain.com @8.8.8.8 +short`. Expect the VPS address while DNS-only.
3. In NPM, add a proxy host for the API, scheme HTTP, hostname `lesson-api`, port `3000`.
4. Add another for the frontend, hostname `lesson-frontend`, port `80`.
5. Request a Let's Encrypt certificate for each domain, agree to its terms, and enable Force SSL.
6. Verify `curl --fail https://api.yourdomain.com/health` and the frontend in a browser.
7. If enabling Cloudflare proxying, use **Full (strict)** and verify again.

HTTP-01 certificate validation needs public port 80. A proxied Cloudflare record can still work when the challenge is forwarded correctly. Wildcard certificates need DNS-01 and suitably scoped DNS credentials. Cloudflare controls the allowed TTL values; Auto is not a promise of 60 seconds.

## Diagnose common failures

| Symptom | Check |
|---|---|
| Wrong DNS address | A/AAAA records, nameservers, resolver caches |
| 502 Bad Gateway | Shared network, alias, internal port, application health |
| Certificate request fails | Domain ownership, public port 80, challenge routing |
| Redirect loop | Cloudflare SSL mode; avoid Flexible |
| Admin page unreachable publicly | Expected: use the SSH tunnel |

Docker-published ports can bypass ordinary UFW rules. Binding the admin port to localhost avoids relying on UFW alone to hide it. Exposing a proxy does not prove that the origin IP is inaccessible through other paths.

## Practice and review

Record the DNS result, proxy target, HTTPS response, and certificate renewal settings. Explain why NPM should forward to `lesson-api:3000` rather than the public domain. Test a wrong upstream alias on a disposable stack, observe 502, then restore it.

Configuration is supplied; domain changes, certificate issuance, and VPS runtime verification remain exercises.

Sources: [NPM setup](https://nginxproxymanager.com/setup/), [Cloudflare TTL](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/), [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/), [Let's Encrypt challenges](https://letsencrypt.org/docs/challenge-types/), [Docker and UFW](https://docs.docker.com/engine/network/packet-filtering-firewalls/#docker-and-ufw).

Next: [SSH deployment](../13-github-actions-ssh-deployment/README.md).
