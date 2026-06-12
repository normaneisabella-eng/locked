#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Auto-sync to GitHub after every task merge (Replit commits via task merges,
# so this hook fires on every code change that creates a commit).
if [ -n "$GITHUB_PAT" ] && [ -n "$GITHUB_REPO" ]; then
  echo "Pushing to GitHub (${GITHUB_REPO})..."

  # Write a temporary askpass script so the PAT is never embedded in a URL
  # or passed as a visible command-line argument to git.
  ASKPASS=$(mktemp /tmp/git-askpass-XXXXXX)
  chmod 700 "$ASKPASS"
  printf '#!/bin/sh\ncase "$1" in\n  *Username*) echo "x-access-token" ;;\n  *Password*) printf "%%s" "${GITHUB_PAT}" ;;\nesac\n' > "$ASKPASS"

  # Add/update the remote (credential-free URL — auth provided via askpass)
  git remote add github "https://github.com/${GITHUB_REPO}.git" 2>/dev/null || \
    git remote set-url github "https://github.com/${GITHUB_REPO}.git"

  GIT_ASKPASS="$ASKPASS" GIT_TERMINAL_PROMPT=0 git push github HEAD:main

  rm -f "$ASKPASS"
  echo "GitHub push complete."
else
  echo "Skipping GitHub push: GITHUB_PAT or GITHUB_REPO not set."
fi
