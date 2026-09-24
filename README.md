# CellSense AI Portal

CellSense AI Portal, called CellSense AI, is a website that answers the questions people ask before they buy a phone. A person types what they need in plain words, browses by brand, opens a phone page, compares two or three phones side by side, asks for a recommendation or talks to the assistant. We build it for ASKME Ltd., a company that answers those questions by telephone today. This is the eProject for our Advanced Diploma in Software Engineering (ADSE) course at Aptech NG. The brief is the Semester 1 eProject and we are building it now that we have entered Semester 2.

## The team

- Gerald, project lead: the backend, the database, the AI features, the shared parts of the site, the documentation, and the review and merge of every pull request.
- Ibrahim: the Home, Search results, Browse, Phone detail and About pages and the components they need.
- Osakue: the Compare, Recommend, Assistant and Dashboard pages, the four account pages, and the components they need.

## The problem we are solving

ASKME Ltd. answers customer questions by telephone. A large share of the calls are the same five questions about phones: which model has a specific feature, what the specifications of a phone are, what the current price is, how one phone differs from another, and which phone is best within a budget. Every one of those calls is answered by a person. Thousands of them need enough staff on the phones, and that staff time costs money. Ordinary phone websites do not help, because they show static specs and leave the deciding to the reader.

CellSense AI answers the five questions on the page instead. A search in plain words finds the phones with the feature. A phone page shows the specs and the price with the date it was checked. A comparison table shows how two or three phones differ. A recommendation picks the best phones within a budget. The assistant answers anything else from the same data. ASKME gets fewer calls and customers get an answer at once.

## What the site does

1. Smart search: a person types a sentence such as "phone under $400 with a great camera" and gets the phones that fit, with chips that show how the sentence was understood.
2. Browse: phones by brand, price range and features, with a sort order.
3. Phone pages: the specs, the price with the date it was checked, the price history and a plain English summary of the phone.
4. Side by side comparison: two or three phones in one table, with the best value marked in each row.
5. Recommendations: five quick questions, then the three phones that fit with a reason for each.
6. The assistant: a chat page that answers phone questions from our own phone data.
7. The dashboard: a logged in person sees the phones they opened, their favourites, their search history and their last recommendations.
8. Price history with a best time to buy note: each phone page shows how the price has moved and whether it is falling, rising or stable.
9. Reviews with a summary: people rate a phone and write a few lines, and the page shows a short summary of what they said.

## How it is built

The site has five parts.

- The site in the browser. This is what a person sees and clicks. It shows the pages and asks the server for data. It never talks to the database or the model itself.
- The server. It receives every request from the browser, checks who is asking, reads and writes the database, calls the model when a feature needs it, and sends the answer back.
- The database. It stores the phones, the users, the reviews and the search logs.
- The model. A pre trained language model that we integrate through an OpenAI compatible API. The server sends it text and our phone data and gets text or JSON back. It does the natural language understanding for search and the assistant, ranks the recommendation shortlist and explains its choices, writes the plain English summaries and summarises reviews. We do not train, build or design any model.
- A nightly price check. A job inside the server runs every night, asks a price source for the price of every phone and adds it to the phone's price history. The trend on a phone page is a calculation from that history, not a forecast model.

One example, step by step. A person types "phone under $400 with a great camera" and presses Enter.

1. The browser sends the sentence to the server.
2. The server first tries to match the words against the brands and models in the database. A sentence like this matches nothing directly.
3. The server sends the sentence to the model and asks for filters.
4. The model answers with filters as JSON: a maximum price of 400 and a minimum camera resolution, sorted by camera.
5. The server runs a database query with those filters and gets three phones back.
6. The server writes the search to the search log and sends the three phones and the filters to the browser.
7. The browser shows the three phones as cards and the filters as chips: "Max price $400", "Camera 48MP or more", "Sorted by camera".

The stack: React 19 with Vite, React Router, Bootstrap 5 and plain CSS in the browser; Node 20 with Express 5 on the server; MongoDB Atlas with Mongoose for the database; JWT login with bcrypt; an OpenAI compatible chat API for the model; `node-cron` for the nightly price check; Nodemailer for the password reset email. The full explanation is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/BACKEND.md](docs/BACKEND.md).

## How the work is split

Gerald builds the backend, the database, the AI features and the shared parts of the site: the routes, the theme, the services, the shared components and the page shell. Ibrahim builds Home, Search results, Browse, Phone detail and About. Osakue builds Compare, Recommend, Assistant, Dashboard and the four account pages: Log in, Create account, Forgot password and Reset password. The split is even by weight: Ibrahim's five pages are the heavy browsing pages, Osakue's four account pages share one card component and are small. Who builds what, the branches, the rules and the checklist are in [docs/TEAM-GUIDE.md](docs/TEAM-GUIDE.md).

## Where we are and what is next

The designs are finished: every page and every state is drawn. The project structure is finished: the routes, the theme, the shared components, the services and one folder per page with a README that says what to build. Next, in order: the backend, the pages built against the designs, the mobile layouts, then the report, the test data and the demo video. The full order with an owner for each item is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Documents

- [docs/PROBLEM-DEFINITION.md](docs/PROBLEM-DEFINITION.md): the problem, the solution, the objectives, the scope, the users, and how the project covers the five terms in the brief.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the parts of the site talk to each other and the flow of every feature.
- [docs/BACKEND.md](docs/BACKEND.md): the backend explained folder by folder, the life of one request, login, the AI service, the price updater, the seed script, the settings and security.
- [docs/API.md](docs/API.md): every endpoint with its method, path, body and response.
- [docs/DATA-MODEL.md](docs/DATA-MODEL.md): the four collections and every field we store.
- [docs/DATA-FLOW.md](docs/DATA-FLOW.md): how a page gets its data, step by step, from the service call to the rendered result.
- [docs/ROUTES.md](docs/ROUTES.md): every frontend route, every click in the designs and the endpoints each page calls.
- [docs/COMPONENTS.md](docs/COMPONENTS.md): the reusable components, who owns each one and which pages use it.
- [docs/OWNERSHIP.md](docs/OWNERSHIP.md): every folder and file in client and server with its owner.
- [docs/STYLING.md](docs/STYLING.md): the theme variables, the shared classes, the spacing guide and the breakpoints.
- [docs/TEAM-GUIDE.md](docs/TEAM-GUIDE.md): who builds what, how to start, the rules and the pull request checklist.
- [docs/DESIGN-SPECIFICATIONS.md](docs/DESIGN-SPECIFICATIONS.md): the stack, the site map, the pages, the visual theme, the AI integration and security.
- [docs/DIAGRAMS.md](docs/DIAGRAMS.md): the list of diagrams for the report.
- [docs/TEST-DATA.md](docs/TEST-DATA.md): the test data and the test cases.
- [docs/INSTALLATION.md](docs/INSTALLATION.md): setup and run steps for a fresh Windows machine.
- [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md): the assumptions that go into the ReadMe.doc.
- [docs/REPORT-OUTLINE.md](docs/REPORT-OUTLINE.md): the structure of the final report and the submission checklist.
- [docs/DELIVERABLES.md](docs/DELIVERABLES.md): what we hand in at the end, who prepares each item and where it comes from.
- [docs/ROADMAP.md](docs/ROADMAP.md): what is finished, what is next in order, and who owns each item.
- `docs/ui/`: the finished designs as PNG files, one per page state.
- `docs/diagrams/`: the diagrams for the report.

To run the project, read [docs/INSTALLATION.md](docs/INSTALLATION.md).
