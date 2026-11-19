#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
classes="$(mktemp -d)"
trap 'rm -rf "$classes"' EXIT HUP INT TERM
javac --release 17 -d "$classes" java/BrowserJudge.java
jar --create --file public/browser-judge.jar --date=2024-01-01T00:00:00Z -C "$classes" .
