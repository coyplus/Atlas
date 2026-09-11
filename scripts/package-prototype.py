"""Create a portable source handover and a smaller, built-demo archive."""
from pathlib import Path
from datetime import datetime
import hashlib
import shutil
import zipfile

APP = Path(__file__).resolve().parents[1]
DAY = datetime.now().strftime('%Y-%m-%d')
OUT = APP.parent / 'deliveries'
NAME = f'HSBC-Atlas-Prototype-{DAY}'
if (OUT / NAME).exists():
    NAME += datetime.now().strftime('-%H%M%S')
DEST = OUT / NAME
DEMO_NAME = NAME.replace('Prototype', 'Demo')
OMIT = {'node_modules', 'test-results', 'playwright-report', 'reports', '.git',
        '.DS_Store', '__pycache__', '.env', '.env.local', '.env.production'}

if not (APP / 'dist/index.html').is_file():
    raise SystemExit('Run npm run build first.')
shutil.copytree(APP, DEST / 'atlas-app', ignore=lambda _path, names: {
    n for n in names if n in OMIT or n.endswith('.pyc') or n.startswith('.env.')
})

SERVER = '''#!/usr/bin/env python3
"""Serve the included Atlas build using Python's standard library."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import argparse
import functools
import threading
import webbrowser

def main():
    parser = argparse.ArgumentParser(description='Open the HSBC Atlas concept demo')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=4184)
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent / 'atlas-app' / 'dist'
    if not (root / 'index.html').is_file():
        raise SystemExit('Keep this launcher beside the atlas-app folder.')

    class Handler(SimpleHTTPRequestHandler):
        def do_GET(self):
            path = urlsplit(self.path).path
            if path.startswith('/app/') or path in (
                '/workbench.html', '/support-blueprint.html', '/bento.html', '/metro.html'
            ):
                self.path = '/index.html'
            super().do_GET()

        def end_headers(self):
            self.send_header('Cache-Control', 'no-store')
            super().end_headers()

    try:
        server = ThreadingHTTPServer((args.host, args.port), functools.partial(Handler, directory=str(root)))
    except OSError as error:
        raise SystemExit(f'Cannot start on port {args.port}: {error}. Try --port 4185.')
    host = 'localhost' if args.host in ('127.0.0.1', '0.0.0.0') else args.host
    url = f'http://{host}:{server.server_port}/?p=sam&theme=vanilla&tab=now'
    print(f'HSBC Atlas is ready: {url}', flush=True)
    print('Keep this window open. Press Ctrl+C to stop.', flush=True)
    if not args.no_open:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
'''
(DEST / 'serve-demo.py').write_text(SERVER)
(DEST / 'Launch Demo.command').write_text('''#!/bin/zsh
cd "${0:A:h}"
if command -v python3 >/dev/null 2>&1; then
  python3 serve-demo.py
else
  echo 'Python 3 is required. See START-HERE.md for the development option.'
  read '?Press Return to close.'
fi
''')
(DEST / 'Launch Demo.command').chmod(0o755)
(DEST / 'Launch Demo.bat').write_text('''@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 serve-demo.py
) else (
  python serve-demo.py
)
pause
''')

README = f'''# HSBC Atlas — prototype handover

Packaged {DAY}. This is the current prototype, including the revised Explore and
Behind the Money Personality experiences, across Alex, Jordan, Sam and Elena.

## Play the demo

1. Extract the ZIP completely.
2. On macOS, double-click **Launch Demo.command**. On Windows, use **Launch Demo.bat**.
3. Keep the terminal window open while reviewing. Close it or press Ctrl+C to stop.

The lightweight launcher needs Python 3. It serves the included build; no npm
installation or build step is needed. Alternatively, from this folder run:

```sh
python3 serve-demo.py
```

The browser opens at http://localhost:4184. Tap the HSBC logo to switch customer
scenarios. Now, Future and You are the main sections. In You → Money Personality,
Explore explains the interpretation; Behind shows the measured activity.

Use a local server rather than opening `index.html` directly. To choose another
port, run `python3 serve-demo.py --port 4185`. For phone review on the same Wi-Fi,
run with `--host 0.0.0.0` and open your computer's network address on port 4184.

## Find the files

| Folder | Contents |
| --- | --- |
| `atlas-app/src/` | Application source, shared components and visual system |
| `atlas-app/data/` | Editable scenarios, customer facts and catalogues |
| `atlas-app/assets/` | Source images, fonts, logos and audio |
| `atlas-app/dist/` | Latest ready-built web demo |
| `atlas-app/public/` | Static files and generated web assets |
| `atlas-app/docs/` | Design decisions, feature specifications and handover notes |
| `atlas-app/docs/screenshots/` | Visual review captures, including earlier iterations |
| `atlas-app/docs/screenshots/portrait-metrics/` | Latest Explore and Behind captures |
| `atlas-app/docs/audit/` | End-to-end experience audit evidence |
| `atlas-app/tests/`, `atlas-app/e2e/` | Behaviour and browser tests |
| `atlas-app/scripts/` | Build, data, verification and capture utilities |

Start with `atlas-app/docs/EXPERIENCE-SYSTEM.md`, `BEHIND-THE-PORTRAIT.md` and
`ARCHITECTURE.md`. Earlier migration/reference documents and old screenshots are
retained as history; the app source and current experience-system document are
the current implementation.

## Continue development

Use Node.js 22.12 or newer and Python 3. Node 24.14.0 is recorded in `.nvmrc`.

```sh
cd atlas-app
npm ci
npm run dev
```

The development URL is http://localhost:4173. Rebuild with `npm run build` and
check with `npm run verify`. For browser tests, install the engines once with
`npx playwright install chromium webkit`, then run `npm run test:production`.

The application builds independently of the original HSBC Atlas workspace.
No API keys, database or environment file are required. The concept's AI responses
use local scenario logic. New browser sessions start with the authored scenarios;
personal edits stored in another browser are not part of this archive.

## Package scope

All files in the current `atlas-app` project are included except installed
dependencies, transient test reports, caches and machine-specific metadata.
`package-lock.json` is included for reproducible dependency installation.
The sibling legacy prototype, early concept decks and unrelated workspace
references are not needed to run or develop this version and are not included.
Asset attribution remains in `atlas-app/docs/ASSET-CREDITS.md`.

`SHA256SUMS.txt` records the packaged file contents. A smaller **{DEMO_NAME}.zip**
is supplied separately for sharing just the runnable demo and its launcher.
'''
(DEST / 'START-HERE.md').write_text(README)

files = sorted(p for p in DEST.rglob('*') if p.is_file())
(DEST / 'SHA256SUMS.txt').write_text(''.join(
    hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.relative_to(DEST).as_posix() + '\n'
    for p in files
))
files = sorted(p for p in DEST.rglob('*') if p.is_file())
fullzip = OUT / (NAME + '.zip')
with zipfile.ZipFile(fullzip, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in files:
        z.write(p, NAME + '/' + p.relative_to(DEST).as_posix())

demozip = OUT / (DEMO_NAME + '.zip')
demo_files = [p for p in files if p.name in ('Launch Demo.command', 'Launch Demo.bat', 'serve-demo.py') and p.parent == DEST or p.is_relative_to(DEST / 'atlas-app/dist')]
demo_readme = README[:README.index('## Find the files')] + '''## What is included

This smaller package contains the built demo and launcher. The companion
Prototype ZIP contains the editable source, assets, scenarios, documentation,
test suites and visual review history.
'''
with zipfile.ZipFile(demozip, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in demo_files:
        z.write(p, DEMO_NAME + '/' + p.relative_to(DEST).as_posix())
    z.writestr(DEMO_NAME + '/START-HERE.md', demo_readme)

for path in (fullzip, demozip):
    with zipfile.ZipFile(path) as z:
        bad = z.testzip()
        if bad:
            raise SystemExit(f'Archive verification failed: {bad}')
        print(f'{path}\n{len(z.infolist())} files · {path.stat().st_size / 1024**2:.1f} MB · ZIP integrity OK', flush=True)
print(f'Unpacked handover: {DEST}', flush=True)
