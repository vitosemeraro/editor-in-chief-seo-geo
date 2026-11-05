#!/usr/bin/env bash
# Fail if the repository contains something that looks like a credential.
# Run before every commit and in CI. Usage: scripts/check_secrets.sh [folder]
set -u
dir="${1:-.}"
patterns=(
  'sk-ant-[A-Za-z0-9_-]{20,}'
  'AKIA[0-9A-Z]{16}'
  'AIza[0-9A-Za-z_-]{35}'
  'ghp_[A-Za-z0-9]{36}'
  'github_pat_[A-Za-z0-9_]{40,}'
  'xox[baprs]-[A-Za-z0-9-]{10,}'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
  '"type": *"service_account"'
  '(password|passwd|api[_-]?key|secret|token) *[:=] *["'"'"'][^"'"'"' ]{8,}["'"'"']'
)
found=0
for p in "${patterns[@]}"; do
  if grep -rInE --exclude-dir=.git --exclude=check_secrets.sh -- "$p" "$dir"; then found=1; fi
done
if [ "$found" -ne 0 ]; then echo "Possible secret found. Remove it before committing."; exit 1; fi
echo "No secrets found."
