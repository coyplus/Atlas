#!/bin/zsh
cd "${0:A:h}"
if [[ ! -d node_modules ]]; then npm ci || exit 1; fi
npm run build || exit 1
open 'http://localhost:4174/?p=jordan'
npm run preview -- --port 4174
