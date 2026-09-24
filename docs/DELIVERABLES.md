# Deliverables

This file lists what we must hand in at the end of the eProject, who prepares each item and where it comes from. The brief asks for one zip file with the report, the source code, a ReadMe.doc and a demo video, plus an optional live URL. The order of the report is in [REPORT-OUTLINE.md](REPORT-OUTLINE.md).

## What we hand in

| Item | What it holds | Who prepares it | Where it comes from |
| --- | --- | --- | --- |
| The project report | Problem definition, objectives, design specifications, flowcharts and data flow diagrams, source code, test data and installation instructions, in that order. | Gerald writes it. Ibrahim and Osakue add the screenshots of their pages and read the whole report before we submit. | [PROBLEM-DEFINITION.md](PROBLEM-DEFINITION.md), [DESIGN-SPECIFICATIONS.md](DESIGN-SPECIFICATIONS.md), [ARCHITECTURE.md](ARCHITECTURE.md), [BACKEND.md](BACKEND.md), [API.md](API.md), [DATA-MODEL.md](DATA-MODEL.md), [DIAGRAMS.md](DIAGRAMS.md), [TEST-DATA.md](TEST-DATA.md), [INSTALLATION.md](INSTALLATION.md) and the designs in `docs/ui/`. |
| The ReadMe.doc | The assumptions we made. | Gerald. | [ASSUMPTIONS.md](ASSUMPTIONS.md), the ten numbered items. |
| The source code zip | The `client/`, `server/` and `docs/` folders without `node_modules` and without `.env`. `server/.env.example` and `client/.env.example` stay in. | Gerald makes the zip after the last merge into `main`. Everyone checks that their pages are in it. | The repository. The folder layout is in [ARCHITECTURE.md](ARCHITECTURE.md) and the owner of every file in [OWNERSHIP.md](OWNERSHIP.md). |
| The demo video | Five to eight minutes. It shows search, browse, a phone page, compare, a recommendation, the assistant, login, the dashboard and the password reset. | Osakue records it. Ibrahim writes the script of what to click. Gerald checks that the backend and the seed data are ready before the recording. | The pages as built and the test cases in [TEST-DATA.md](TEST-DATA.md). |
| The live URL (optional) | The site running on a public address, if we deploy it. | Gerald. | [INSTALLATION.md](INSTALLATION.md) for the settings, with `CLIENT_ORIGIN` and `CLIENT_URL` set to the public address. |

## Before we zip

1. Every page matches its image in `docs/ui/` at 1280px and works at 375px and 768px.
2. Every test case in [TEST-DATA.md](TEST-DATA.md) has an actual result and a pass mark.
3. Every diagram in [DIAGRAMS.md](DIAGRAMS.md) is exported to `docs/diagrams/`.
4. `server/.env` and both `node_modules` folders are outside the zip.
5. The report and the ReadMe.doc are in the zip next to the code and the video.
