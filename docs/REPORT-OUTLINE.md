# Report outline

This file gives the structure of our final report for CellSense AI. The sections follow the order in the eProject brief. Under each section we name the file in `docs/` that it comes from. The submission checklist is at the end.

## Report sections

### 1. Problem definition

It comes from [PROBLEM-DEFINITION.md](PROBLEM-DEFINITION.md): section 1 (problem statement), section 2 (proposed solution), section 4 (scope) and section 5 (users).

### 2. Objectives

It comes from [PROBLEM-DEFINITION.md](PROBLEM-DEFINITION.md), section 3 (the eight objectives).

### 3. Design specifications

It comes from [DESIGN-SPECIFICATIONS.md](DESIGN-SPECIFICATIONS.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [BACKEND.md](BACKEND.md), with the tables in [DATA-MODEL.md](DATA-MODEL.md) and [API.md](API.md). The finished designs in `docs/ui/` go in this section as the page designs.

### 4. Diagrams

It comes from [DIAGRAMS.md](DIAGRAMS.md); the PNG files are in `docs/diagrams/` next to their `.drawio` source files.

### 5. Source code

It comes from the `client/` and `server/` folders of the repo; [ARCHITECTURE.md](ARCHITECTURE.md) describes the folder layout.

### 6. Test data

It comes from [TEST-DATA.md](TEST-DATA.md); the seed phones in `server/data/phones.json` are the test data.

### 7. Installation instructions

It comes from [INSTALLATION.md](INSTALLATION.md).

### 8. Assumptions (the ReadMe.doc)

It comes from [ASSUMPTIONS.md](ASSUMPTIONS.md); the same ten assumptions make up the ReadMe.doc that ships in the zip.

### 9. Demo video

It does not come from a docs file. We record it after the build.

## Submission checklist

We submit one zip file. It holds:

1. The report, with the nine sections above in that order.
2. The source code, without `node_modules` and without `.env`.
3. The ReadMe.doc with the assumptions.
4. The demo video, five to eight minutes long. It shows search, browse, a phone page, compare, a recommendation, the assistant, login, the dashboard and the password reset.
5. The live URL, if we deploy the site. This item is optional.

Who prepares each item and where it comes from is in [DELIVERABLES.md](DELIVERABLES.md). The order we build the remaining work in is in [ROADMAP.md](ROADMAP.md).
