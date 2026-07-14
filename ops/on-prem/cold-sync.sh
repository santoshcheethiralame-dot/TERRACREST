#!/usr/bin/env bash
# Monthly, supervised sync of the ENCRYPTED restic repo from tc-standby to the
# air-gapped tc-vault, over a direct Ethernet cable (see docs/on-prem-runbook.md §7).
#
# Only encrypted bytes travel — the restic passphrase never leaves the safe/operator.
# Run from tc-standby after physically cabling the two machines.
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-169.254.10.2}"      # link-local on the direct cable
VAULT_USER="${VAULT_USER:-tcvault}"
REPO="${RESTIC_REPOSITORY:-/srv/restic/terracrest}"

echo "[cold-sync] verifying direct link to $VAULT_ADDR"
ping -c 2 -W 2 "$VAULT_ADDR" >/dev/null || {
    echo "[cold-sync] ERROR: no link to tc-vault. Is the cable connected and the vault powered on?" >&2
    exit 1
}

echo "[cold-sync] rsyncing encrypted repo -> tc-vault (this may take a while)"
rsync -a --delete --info=progress2 \
    "$REPO/" "${VAULT_USER}@${VAULT_ADDR}:/srv/cold/terracrest/"

echo "[cold-sync] done. Now: unplug the cable, power tc-vault off, and log the date in the ops diary."
