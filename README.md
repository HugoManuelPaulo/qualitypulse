# QualityPulse — QA Intelligence Platform

[![QualityPulse CI and Pages](https://github.com/HugoManuelPaulo/qualitypulse/actions/workflows/qualitypulse.yml/badge.svg)](https://github.com/HugoManuelPaulo/qualitypulse/actions/workflows/qualitypulse.yml)

[Live quality dashboard](https://hugomanuelpaulo.github.io/qualitypulse/) · [Tested demo store](https://hugomanuelpaulo.github.io/qualitypulse/demo/)

Every push to `main` runs 12 automated UI and API checks before publishing the latest quality evidence.

QualityPulse is a deterministic test automation project that validates a controlled e-commerce application across browser UI and REST API layers, then turns the execution evidence into a recruiter-friendly quality dashboard.

## What it demonstrates

- End-to-end browser testing with Playwright and TypeScript
- REST API contract and negative-path validation
- Page-level evidence through traces, screenshots and video on failure
- CI execution and GitHub Pages deployment through GitHub Actions
- Quality metrics and scenario-level visibility
- Accessible, responsive demo application with controlled test data

## Test coverage

The browser suite covers authentication, error handling, search, sorting, cart management, checkout validation and successful order completion. The API suite validates health, catalogue schema, missing resources, rejected payloads and successful order creation.

## Run locally

```bash
npm install
npx playwright install chromium
npm run typecheck
npm test
npm run report:build
```

The Playwright configuration starts the local application automatically at `http://127.0.0.1:4173`. Open that address after running `npm start` to explore the dashboard and demo store.

## Architecture

```text
docs/                  Static dashboard and tested demo store
tests/                 Playwright UI and API specifications
scripts/               Dashboard result transformation
server.mjs             Controlled local API and static server
.github/workflows/     Automated test and publishing pipeline
```

## Quality controls

- No dependency on unstable third-party test environments
- Fixed product and order data for repeatable assertions
- Positive and negative scenarios
- CI retries limited to one and enabled only in CI
- Failure evidence retained for diagnosis

Built by [Hugo Paulo](https://hugomanuelpaulo.github.io/).
