# Agent Browser-Control Server

A tiny local HTTP server that lets the chat agent control a Playwright browser session and fetch screenshots/DOM/logs.

## Install

- Install deps and Playwright browsers:
  - npm install
  - npm run agent:browsers

## Run

- Start the server (default port 9323):
  - npm run agent:browser

Env:
- AGENT_BROWSER_PORT to change the port.

## Basic flow

1) Create a session (optional; defaults to "default"):

curl -s localhost:9323/session \
  -H 'content-type: application/json' \
  -d '{"id":"default","headless":true}'

2) Navigate:

curl -s localhost:9323/goto \
  -H 'content-type: application/json' \
  -d '{"sessionId":"default","url":"http://localhost:5173"}'

3) Get a screenshot:

curl -s "localhost:9323/screenshot?sessionId=default&fullPage=true" > shot.png

4) Query DOM:

curl -s "localhost:9323/dom?sessionId=default" > dom.html

5) Interact:

curl -s localhost:9323/click -H 'content-type: application/json' \
  -d '{"sessionId":"default","selector":"text=Start"}'

curl -s localhost:9323/type -H 'content-type: application/json' \
  -d '{"sessionId":"default","selector":"input[name=q]","text":"hello"}'

curl -s localhost:9323/wait -H 'content-type: application/json' \
  -d '{"sessionId":"default","selector":"#results"}'

6) Logs:

curl -s "localhost:9323/logs?sessionId=default" | jq .

7) Evaluate JS in the page context:

curl -s localhost:9323/eval -H 'content-type: application/json' \
  -d '{"sessionId":"default","expression":"document.title"}'

8) Close session:

curl -s localhost:9323/close -H 'content-type: application/json' \
  -d '{"sessionId":"default"}'

## Endpoints

- POST /session { id?, headless?, device?, viewport?, userAgent? }
- POST /goto { sessionId, url, waitUntil?, timeout? }
- POST /click { sessionId, selector, button?, clickCount?, delay? }
- POST /type { sessionId, selector, text, delay?, clear? }
- POST /wait { sessionId, selector, state?, timeout? }
- GET  /screenshot?sessionId&fullPage=true|false
- GET  /dom?sessionId
- GET  /logs?sessionId
- POST /eval { sessionId, expression }
- POST /key { sessionId, key }
- POST /hover { sessionId, selector }
- POST /scroll { sessionId, to? | x?, y? }
- POST /close { sessionId }

Notes:
- Selectors are Playwright selectors (css, text=, nth, :has(), etc.).
- This server is local and unauthenticated; keep it on localhost.
