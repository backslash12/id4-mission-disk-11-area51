#!/usr/bin/env bash
# Open the complete offline game in Ubuntu's default browser.
set -eu
game_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
game_file="$game_dir/index.html"
if [[ ! -f "$game_file" || ! -d "$game_dir/assets" ]]; then
    printf '%s\n' 'Bitte die gesamte ZIP-Datei entpacken; index.html und assets müssen im selben Ordner bleiben.' >&2
    exit 1
fi
# Turn spaces, umlauts, # and other filename characters into a proper file URL.
if command -v python3 >/dev/null 2>&1; then
    game_url="$(python3 -c 'import pathlib,sys; print(pathlib.Path(sys.argv[1]).as_uri())' "$game_file")"
else
    game_url="$game_file"
fi
if command -v xdg-open >/dev/null 2>&1; then
    exec xdg-open "$game_url"
elif command -v gio >/dev/null 2>&1; then
    exec gio open "$game_url"
elif command -v firefox >/dev/null 2>&1; then
    exec firefox "$game_url"
elif command -v chromium >/dev/null 2>&1; then
    exec chromium "$game_url"
else
    printf 'Öffne diese Datei in Firefox oder Chromium:\n%s\n' "$game_file"
    exit 1
fi
