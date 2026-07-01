# DB Terracrest Advisory — On-Premise Runbook

The platform ships today on managed hosting (static frontend + a FastAPI service +
Postgres). This document is the production target described in the mandate: a
**self-hosted, no-cloud deployment on three machines** under the firm's physical
control. Nothing sealed ever leaves the premises, and the masking moat is enforced
by the same server code that runs in the cloud build — only the substrate changes.

It is written to be executed by one competent operator with root on all three
machines. Commands assume Ubuntu Server 24.04 LTS. Substitute paths and interface
names where noted.

---

## 1. Why three machines

| Role | Hostname | Runs | Network |
|------|----------|------|---------|
| **A — Application / Primary** | `tc-app` | Nginx, FastAPI (Gunicorn/Uvicorn), Postgres **primary** | LAN + WireGuard |
| **B — Standby / On-site backup** | `tc-standby` | Postgres **streaming replica**, nightly dumps, on-site restic repo | LAN + WireGuard |
| **C — Cold vault** | `tc-vault` | Nothing. Powered off and disconnected except during a monthly sync window | **Air-gapped** |

The design goal is *containment, not uptime*. A single parcel's sealed data
(coordinates, owner identity, survey numbers, contact) is the asset being
protected. Three machines give us: a live service (A), a hot copy that survives A's
disk dying (B), and an offline copy that survives ransomware, theft, or a bad actor
with LAN access (C).

```
   Principals (browser, over TLS)
              │
        ┌─────▼─────┐        WireGuard         ┌───────────────┐
        │   tc-app  │◄───────  wg0  ───────────►│  tc-standby   │
        │  Nginx    │   streaming replication   │  PG replica   │
        │  FastAPI  │──────────────────────────►│  restic repo  │
        │  PG primary│                          └───────┬───────┘
        └───────────┘                                   │  monthly, offline
                                                 ┌───────▼───────┐
                                                 │   tc-vault    │ (air-gapped)
                                                 │  encrypted    │
                                                 │  cold backups │
                                                 └───────────────┘
```

---

## 2. Baseline hardening (all three machines)

Do this before anything else, on every box.

### 2.1 Full-disk encryption (LUKS)

The sealed data is at rest on these disks. Encrypt the whole system volume at
install time — the Ubuntu installer offers **"Encrypt the new Ubuntu installation
for security"**; take it. This provisions LUKS2 on the root LV.

Verify after first boot:

```bash
sudo cryptsetup status $(sudo dmsetup ls --target crypt | awk '{print $1}')
# Type: LUKS2, cipher: aes-xts-plain64 — confirm both
```

Store the passphrase and a LUKS header backup off-site (a sealed envelope in the
firm's safe). A machine that boots to the passphrase prompt and no further is a
machine a thief cannot read.

```bash
sudo cryptsetup luksHeaderBackup /dev/nvme0n1p3 --header-backup-file luks-header-$(hostname).img
# move that .img to the safe; a lost header = unrecoverable disk
```

### 2.2 OS baseline

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y ufw fail2ban unattended-upgrades chrony
sudo systemctl enable --now fail2ban chrony
sudo dpkg-reconfigure -plow unattended-upgrades   # security patches auto-apply
```

### 2.3 Accounts & SSH

- No password SSH. Keys only.
- One admin account with sudo; disable `root` login.

```bash
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### 2.4 Firewall (deny by default)

`tc-app` — the only machine principals reach:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow in on eth0 to any port 443 proto tcp   # HTTPS from the LAN/office only
sudo ufw allow in on wg0                                # WireGuard peers (replication)
sudo ufw allow 51820/udp                               # WireGuard handshake
sudo ufw allow OpenSSH
sudo ufw enable
```

`tc-standby` — no public surface at all; only WireGuard + SSH:

```bash
sudo ufw default deny incoming
sudo ufw allow in on wg0
sudo ufw allow 51820/udp
sudo ufw allow OpenSSH
sudo ufw enable
```

`tc-vault` stays firewalled to nothing and is powered off. See §7.

---

## 3. Private network (WireGuard)

Replication and admin traffic between A and B ride an encrypted overlay, never the
raw LAN. Generate keys on each of A and B:

```bash
umask 077
wg genkey | tee privatekey | wg pubkey > publickey
```

`/etc/wireguard/wg0.conf` on **tc-app** (`10.10.0.1`):

```ini
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <tc-app private key>

[Peer]                       # tc-standby
PublicKey = <tc-standby public key>
AllowedIPs = 10.10.0.2/32
```

`/etc/wireguard/wg0.conf` on **tc-standby** (`10.10.0.2`):

```ini
[Interface]
Address = 10.10.0.2/24
ListenPort = 51820
PrivateKey = <tc-standby private key>

[Peer]                       # tc-app
PublicKey = <tc-app public key>
Endpoint = <tc-app LAN IP>:51820
AllowedIPs = 10.10.0.1/32
PersistentKeepalive = 25
```

```bash
sudo systemctl enable --now wg-quick@wg0
sudo wg show          # expect a handshake within ~25s
ping 10.10.0.2        # from tc-app
```

From here, Postgres replication uses `10.10.0.x` addresses exclusively.

---

## 4. Database — Postgres primary + streaming replica

Install Postgres 16 on **both** A and B.

```bash
sudo apt install -y postgresql-16
```

### 4.1 Primary (`tc-app`)

`/etc/postgresql/16/main/postgresql.conf`:

```
listen_addresses = 'localhost,10.10.0.1'
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1GB
hot_standby = on
ssl = on
```

`/etc/postgresql/16/main/pg_hba.conf` — replica connects only over WireGuard, with a
dedicated replication role:

```
# TYPE  DATABASE      USER          ADDRESS         METHOD
host    terracrest    terracrest    10.10.0.1/32    scram-sha-256
host    replication   replicator    10.10.0.2/32    scram-sha-256
```

Create the roles and the application database:

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE terracrest LOGIN PASSWORD 'CHANGE_ME_APP';
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'CHANGE_ME_REPL';
CREATE DATABASE terracrest OWNER terracrest;
SQL
sudo systemctl restart postgresql
```

The application's `DATABASE_URL` (see §5) points at this instance. On first boot the
service creates the schema and seeds the reference book of business
(`app.seed:seed_if_empty` — non-destructive).

### 4.2 Standby (`tc-standby`)

Take a base backup over WireGuard and start streaming:

```bash
sudo systemctl stop postgresql
sudo -u postgres rm -rf /var/lib/postgresql/16/main
sudo -u postgres pg_basebackup \
  -h 10.10.0.1 -U replicator \
  -D /var/lib/postgresql/16/main \
  -Fp -Xs -P -R                       # -R writes standby.signal + primary_conninfo
sudo systemctl start postgresql
```

Confirm replication is live:

```bash
# on tc-app
sudo -u postgres psql -c "SELECT client_addr, state, sync_state FROM pg_stat_replication;"
# expect: 10.10.0.2 | streaming | async
```

Replica lag should sit near zero on a LAN. This is the machine you promote if A's
disk fails (§8).

---

## 5. Application deploy (`tc-app`)

### 5.1 Backend service

```bash
sudo useradd --system --home /opt/terracrest --shell /usr/sbin/nologin terracrest
sudo mkdir -p /opt/terracrest && sudo chown terracrest: /opt/terracrest
sudo -u terracrest git clone <repo-url> /opt/terracrest/app
cd /opt/terracrest/app/backend
sudo -u terracrest python3 -m venv .venv
sudo -u terracrest .venv/bin/pip install -r requirements.txt gunicorn
```

`/etc/terracrest/api.env` (root-owned, `chmod 600` — this holds the DB password and
JWT secret):

```
TERRACREST_DATABASE_URL=postgresql+psycopg://terracrest:CHANGE_ME_APP@localhost/terracrest
TERRACREST_JWT_SECRET=<64+ random chars: `openssl rand -hex 48`>
TERRACREST_CORS_ORIGINS=https://portal.terracrest.internal
TERRACREST_ACCESS_TOKEN_MINUTES=15
TERRACREST_REFRESH_TOKEN_DAYS=7
```

`systemd` unit — copy from [`ops/on-prem/terracrest-api.service`](../ops/on-prem/terracrest-api.service):

```bash
sudo cp ops/on-prem/terracrest-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now terracrest-api
sudo systemctl status terracrest-api        # bound to 127.0.0.1:8000, behind Nginx
```

### 5.2 Frontend build

The React app is static. Build it with the API pointed at the internal hostname and
hand the `dist/` to Nginx:

```bash
cd /opt/terracrest/app
VITE_API_URL=https://portal.terracrest.internal/api npm ci && npm run build
sudo rsync -a --delete dist/ /var/www/terracrest/
```

### 5.3 Nginx + TLS

Principals reach only Nginx on 443. It serves the static build and reverse-proxies
`/api` to the backend on loopback. Config in
[`ops/on-prem/nginx.conf`](../ops/on-prem/nginx.conf).

For an internal hostname, issue a certificate from the firm's own CA (or `mkcert`
for a pilot) and install it at `/etc/terracrest/tls/`. Do **not** expose the portal
to the public internet — access is over the office LAN or a client VPN.

```bash
sudo cp ops/on-prem/nginx.conf /etc/nginx/sites-available/terracrest
sudo ln -sf /etc/nginx/sites-available/terracrest /etc/nginx/sites-enabled/terracrest
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5.4 Redeploy (routine)

```bash
cd /opt/terracrest/app && sudo -u terracrest git pull
# backend
cd backend && sudo -u terracrest .venv/bin/pip install -r requirements.txt
sudo systemctl restart terracrest-api
# frontend
cd .. && VITE_API_URL=https://portal.terracrest.internal/api npm ci && npm run build
sudo rsync -a --delete dist/ /var/www/terracrest/
```

---

## 6. On-site backups (`tc-standby`)

Streaming replication protects against a disk failure, **not** against a bad
migration, a fat-fingered `DELETE`, or corruption — those replicate faithfully. So B
also keeps point-in-time logical dumps in an encrypted [restic](https://restic.net)
repository.

Install and initialise once:

```bash
sudo apt install -y restic
sudo restic init --repo /srv/restic/terracrest        # prompts for a repo passphrase — store it in the safe
```

Nightly dump + snapshot via
[`ops/on-prem/backup.sh`](../ops/on-prem/backup.sh), driven by a systemd timer:

```bash
sudo cp ops/on-prem/backup.sh /usr/local/sbin/tc-backup
sudo cp ops/on-prem/tc-backup.service ops/on-prem/tc-backup.timer /etc/systemd/system/
sudo systemctl enable --now tc-backup.timer
systemctl list-timers tc-backup.timer                  # confirm next run (02:30 daily)
```

Retention is enforced in the script: `--keep-daily 14 --keep-weekly 8
--keep-monthly 12`. Verify a snapshot restores **before** you rely on it (§9).

---

## 7. Cold vault (`tc-vault`) — the air-gapped copy

`tc-vault` is the firm's insurance against a compromise of the live network. It has
no WireGuard key, is not in `pg_hba.conf`, and is powered off. Once a month, during a
supervised window:

1. Physically connect `tc-vault` to `tc-standby` with a **direct Ethernet cable**
   (a crossover/patch link between the two — not through the office switch).
2. Bring up a temporary link-local address on both ends.
3. Run [`ops/on-prem/cold-sync.sh`](../ops/on-prem/cold-sync.sh), which `rsync`s the
   encrypted restic repository from B to C over that cable — encrypted data only; the
   passphrase never travels.
4. Unplug the cable. Power `tc-vault` off. Log the sync date in the operations diary.

Because the restic repo is encrypted at rest, the bytes on `tc-vault` are useless
without the passphrase held in the safe. A monthly cadence bounds worst-case data
loss to one month while keeping the vault offline 99% of the time.

---

## 8. Failover — promote the standby

If `tc-app`'s database is lost but the machine is otherwise fine, restore from B
(§9). If `tc-app` is *gone* (dead disk, seized, on fire), promote `tc-standby` to
primary and repoint the app:

```bash
# on tc-standby — promote to a read/write primary
sudo -u postgres pg_ctl promote -D /var/lib/postgresql/16/main
sudo -u postgres psql -c "SELECT pg_is_in_recovery();"   # expect: f

# stand the application up on B (or a replacement app host) pointing at the new primary,
# then rebuild a fresh replica from the promoted node when hardware is replaced.
```

Update `TERRACREST_DATABASE_URL` to the promoted host and restart `terracrest-api`.
Target RTO: **under 30 minutes**. Target RPO: **≈0** for the DB (streaming), **≤24h**
worst case if you must fall back to a logical dump.

---

## 9. Restore drill (run quarterly — a backup you haven't restored is a rumour)

```bash
# list snapshots
sudo restic -r /srv/restic/terracrest snapshots

# restore the latest dump to a scratch file
sudo restic -r /srv/restic/terracrest restore latest --target /tmp/tc-restore

# load into a throwaway database and sanity-check the row counts
sudo -u postgres createdb terracrest_verify
sudo -u postgres pg_restore -d terracrest_verify /tmp/tc-restore/terracrest-*.dump
sudo -u postgres psql -d terracrest_verify -c "SELECT count(*) FROM listings; SELECT count(*) FROM ndas;"
sudo -u postgres dropdb terracrest_verify
sudo rm -rf /tmp/tc-restore
```

Record the drill result and the restore time in the operations diary.

---

## 10. Security posture — how this maps to the moat

| Threat | Control |
|--------|---------|
| Laptop physically stolen | LUKS full-disk encryption; header backed up off-site |
| Attacker on the office LAN | Replication only over WireGuard; DB not listening on the LAN; Nginx is the sole ingress |
| Sealed data leaking to a non-entitled member | Enforced **server-side** in `routers/listings.py:can_see_sealed` — the API never serializes sealed fields without a logged NDA. On-prem changes nothing here |
| Document exfiltration | Every vault PDF is watermarked with the viewer's username; every open is written to the `activity_events` audit trail |
| Ransomware / destructive insider | Air-gapped, encrypted cold vault (`tc-vault`) that is offline except during a supervised monthly sync |
| Credential theft | Short-lived (15 min) access tokens; bcrypt password hashes; admin-issued accounts only — no self-signup |
| Repudiation ("I never opened that") | Append-only `activity_events`: login, NDA, document view, Deal Room message, status change, architect delivery |

The application code is identical between the cloud pilot and this on-prem target.
The moat is in the server, not the network — the three-machine layout adds
*physical* containment on top of it.

---

## 11. Bill of materials

- 3 × business laptops, 32 GB RAM, 1 TB NVMe, TPM 2.0 (for LUKS key sealing if desired)
- 1 × UPS for `tc-app` and `tc-standby`
- 1 × direct Ethernet cable reserved for cold syncs (labelled, stored with `tc-vault`)
- 1 × fire-rated safe for: LUKS passphrases + header backups, the restic repo
  passphrase, and the sealed-envelope break-glass admin credentials

Everything above is commodity hardware and open-source software. No third-party
cloud provider ever holds a byte of sealed parcel data.
```
