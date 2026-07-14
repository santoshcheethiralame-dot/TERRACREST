#!/usr/bin/env bash
# Nightly logical backup of the Terracrest database into an encrypted restic repo.
# Runs on tc-standby (see docs/on-prem-runbook.md §6). Install as /usr/local/sbin/tc-backup.
set -euo pipefail

# --- configuration ------------------------------------------------------------
PGHOST="${PGHOST:-10.10.0.1}"          # the primary, over WireGuard
PGUSER="${PGUSER:-terracrest}"
PGDATABASE="${PGDATABASE:-terracrest}"
RESTIC_REPOSITORY="${RESTIC_REPOSITORY:-/srv/restic/terracrest}"
# RESTIC_PASSWORD_FILE and PGPASSWORD are provided by the systemd unit's EnvironmentFile.
export RESTIC_REPOSITORY

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP="$WORKDIR/terracrest-$STAMP.dump"

# --- dump ---------------------------------------------------------------------
echo "[tc-backup] dumping $PGDATABASE from $PGHOST"
pg_dump -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -Fc -f "$DUMP"

# --- snapshot into the encrypted repo ----------------------------------------
echo "[tc-backup] snapshotting into $RESTIC_REPOSITORY"
restic backup --tag nightly "$DUMP"

# --- retention ----------------------------------------------------------------
echo "[tc-backup] pruning old snapshots"
restic forget --tag nightly \
    --keep-daily 14 --keep-weekly 8 --keep-monthly 12 \
    --prune

# --- integrity ----------------------------------------------------------------
restic check --read-data-subset=5%     # sample-verify a slice each night
echo "[tc-backup] done: $STAMP"
