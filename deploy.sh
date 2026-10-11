#!/usr/bin/env bash
set -euo pipefail
cat <<'INSTRUCTIONS'
Deployment is managed by pink-nixos:

1. Commit and push your website changes in this repository.
2. In /home/shark/Dropbox/Informatik/nixos/pink-nixos, run:

   nix flake update quizzity
   git diff -- flake.lock
   git add flake.lock
   git commit -m "Update quizzity website"
   ./deploy.sh
   git push

The configuration pins the source revision and builds the website on pink.
INSTRUCTIONS
