# Lesson 10: VPS Setup & SSH Security

**Course:** W4 D3 · September 2, 2026 · roadmap stage 5

A VPS is a virtual server you administer: users, updates, network access, services, backups, and recovery become your responsibility. SSH provides an encrypted remote session; key authentication proves possession of a private key without sending that private key to the server.

**Goal:** Understand hosting choices, prepare key-based access, create a deploy user, validate SSH changes, and open only necessary traffic.

**Before starting:** Use a disposable Linux VPS or VM with a tested provider/VM console. These are instructions to run on your chosen environment, not changes applied to this computer. Provisioning a paid VPS is your account exercise; no server is ordered here.

[Source and corrections](source.md) · [Course list](../COURSE.md)

## Hosting options and costs

| Type | You control | Common use |
|---|---|---|
| Shared hosting | Limited application/site configuration | Simple hosted sites |
| VPS | A guest OS and allocated resources | Learning a single-host deployment |
| Dedicated host | A physical server | Specialized isolation/performance needs |
| Cloud functions | Function code and platform-supported settings | Event-driven tasks within runtime limits |

The course uses Contabo, but fixed price, egress, support, and SLA claims have not been verified. Review current provider pricing, region, taxes, backups, cancellation, and console access before buying. Use a currently supported Ubuntu LTS suitable for the course and Docker; 22.04 is the source's example, not a required universal choice.

## Keys: what actually happens

SSH user authentication uses cryptographic signatures and public-key verification; the source's encrypted-puzzle/decryption diagram is only an analogy. SSH encrypts password sessions too. Keys reduce password-guessing exposure but their storage, passphrases, and permissions still matter.

The public key goes into the intended user's authorized_keys. The private key stays under your control; use a unique filename and a passphrase for interactive access. Do not overwrite an existing key.

**On your local machine, Bash/WSL/macOS:**

~~~bash
ls -la ~/.ssh
ssh-keygen -t ed25519 -C "devops-practice" -f ~/.ssh/id_ed25519_devops_vps
~~~

Use your existing trusted initial server access. Verify its host fingerprint against the provider console or another trusted channel, not solely a fresh network scan.

## Exercise A: create the intended user

**On the disposable server, in the initial administrator session:**

~~~bash
sudo adduser deploy
sudo usermod -aG sudo deploy
~~~

Set a suitable account password when prompted; SSH password authentication and sudo authentication are separate. Grant only the permissions the role needs. This teaching account has administrative sudo access and is not a sandboxed application identity.

**On your laptop, while password/initial access still works:**

~~~bash
ssh-copy-id -i ~/.ssh/id_ed25519_devops_vps.pub deploy@YOUR_VPS_IP
ssh -i ~/.ssh/id_ed25519_devops_vps -o IdentitiesOnly=yes deploy@YOUR_VPS_IP
~~~

If ssh-copy-id is unavailable, install that public key through your trusted administrator session. Do not copy every root-authorized key by default. Server-side ownership should be deploy:deploy, directory mode 700, and authorized_keys mode 600. World-writable ownership/permissions are especially dangerous; do not use chmod 777.

In the **second terminal**, verify the correct user and sudo access:

~~~bash
whoami
sudo -v
~~~

Expected: deploy, then a successful sudo validation. Keep the original administrator session and recovery console available until the final checks succeed.

## Exercise B: harden authentication first

Read [the authentication fragment](examples/00-devops-lab.conf). It disables root, password, and keyboard-interactive SSH access while keeping public-key authentication. It intentionally keeps the existing port for this first step.

Inspect the server's Include directives and existing snippets, then place a reviewed fragment in the appropriate sshd_config.d directory. OpenSSH commonly uses the first obtained setting, so a later conflicting file may not override an earlier one. Match blocks can change effective settings.

Before applying a change, run on the server:

~~~bash
sudo sshd -t
sudo sshd -T
systemctl status ssh.service ssh.socket
~~~

Check the effective authentication settings and the unit actually managing listeners. Ubuntu commonly uses ssh.service; distributions can differ. If ssh.service manages the listener and supports reload, use `sudo systemctl reload ssh.service`. Socket-activated installations require the appropriate socket/service procedure for their version. Follow [Ubuntu OpenSSH guidance](https://documentation.ubuntu.com/server/how-to/security/openssh-server/).

Validate a **new** key-authenticated connection from another terminal after applying changes. An existing session alone proves neither new authentication nor the new listener. Do not close it until the new session works.

## Exercise C: firewall and optional port change

Keep port 22 if you do not need a custom port. A changed port can reduce some scan noise; it does not make SSH undiscoverable or replace key authentication.

For initial firewall setup on your own disposable server, first inspect existing rules and the provider firewall. Allow the SSH port actually serving your verified connection **before enabling deny-by-default behavior**:

~~~bash
sudo ufw status verbose
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
sudo ufw status numbered
~~~

Scope SSH to a trusted source/network when practical, accounting for your changing home IP and recovery path. Web ports are needed only for the later proxy exercise.

If you choose port 2222, allow it in both server and provider firewalls first. Change the listener using the procedure for the active ssh.service/ssh.socket setup, run sshd -t, and verify the actual listener with `sudo ss -lntp`. Test from a new terminal:

~~~bash
ssh -p 2222 -i ~/.ssh/id_ed25519_devops_vps -o IdentitiesOnly=yes deploy@YOUR_VPS_IP
~~~

Only after that works should you remove the old port's listener/rule. A reload is not guaranteed to apply a socket-activation port change; do not guess or copy `reload sshd` to every Ubuntu system.

## Docker permissions and firewall limits

Install Docker using the reviewed [Ubuntu installation guide](https://docs.docker.com/engine/install/ubuntu/), then verify client, engine, and Compose. Do not assume the docker group exists before installation.

Adding deploy to the docker group is convenient but gives root-equivalent control through the Docker daemon. It does not provide the limited blast radius claimed in the source. Distinguish administrator/deployment access from the non-root user inside the application image.

Docker-published ports can bypass normal UFW filtering. UFW alone cannot make `81:81` or database port publishing safe. Bind administrative/diagnostic listeners to 127.0.0.1 or leave them unpublished; use a tested provider/network policy where required. See [Docker and UFW](https://docs.docker.com/engine/network/packet-filtering-firewalls/#docker-and-ufw).

## Recovery and verification

| Symptom | First check | Recovery |
|---|---|---|
| Permission denied (publickey) | User, selected key, ownership, authorized_keys | Repair through the existing admin session/console |
| Connection refused | Actual listener and service/socket status | Restore the reviewed listener config |
| Connection times out | Server/provider firewall, IP, routing | Use the console to repair reachability |
| sudo fails | Account/group and password policy | Fix role configuration in the retained admin session |
| New session works, old port still reachable | ss and firewall rules | Remove old access only after validating the replacement |

Do not disable a firewall globally or erase keys as a first troubleshooting step. Restore the specific failed setting through the retained trusted access.

## Review and completion

Explain public versus private keys, why a second connection matters, why port changes are optional, and why docker-group membership is administrative access.

- [ ] I have a working recovery console.
- [ ] I tested the deploy user and key from a second terminal.
- [ ] I checked syntax and effective SSH settings before applying changes.
- [ ] I tested the firewall/listener from outside the server.
- [ ] I know which ports are reachable and who can operate Docker.

**Preparation status:** Configuration and instructions only. No VPS was provisioned, key generated, account created, firewall changed, or SSH daemon reconfigured during preparation.

**Next:** [Dev & Production Docker Compose Stacks](../11-dev-production-compose/README.md).
