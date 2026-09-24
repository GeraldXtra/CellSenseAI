# Roadmap

This file says what is finished, what is next and who owns each item. We build the backend and the pages at the same time: the pages run on the sample data in `client/src/data/mockPhones.js` until the matching endpoint is ready, then switch to the real service call.

## Finished

| Item | What it means | Owner |
| --- | --- | --- |
| The designs | Every page and every state is drawn in `docs/ui/`, 25 images. The pages are built against them. | Gerald |
| The project structure | The client has its routes, theme, shared components, services, contexts, hooks, sample data, and one folder per page with a README. The server has its folders, its settings file, its middleware and its placeholder files. | Gerald |
| The documents | The problem definition, the architecture, the backend guide, the API, the data model, the routes, the components, the ownership, the styling guide, the data flow guide, the team guide, the design specifications, the test plan, the installation steps, the assumptions, the report outline, the deliverables and this roadmap. | Gerald |

## Next, in order

| No. | Item | What gets done | Owner |
| --- | --- | --- | --- |
| 1 | Backend auth and phone routes | Register, login, me, the Phone and User models, `GET /phones`, `GET /phones/:slug` with recently viewed. | Gerald |
| 2 | Frontend pages against the designs | Home, Search results, Browse, Phone detail and About on sample data. | Ibrahim |
| 3 | Frontend pages against the designs | Compare, Recommend, Assistant, Dashboard, Log in, Create account, Forgot password and Reset password on sample data. | Osakue |
| 4 | AI routes | `POST /ai/search` with the direct layer, the model layer and the fallback; `POST /ai/chat`; `POST /ai/recommend`. Search results, Assistant and Recommend switch to the real calls. | Gerald |
| 5 | Dashboard and compare | `GET /users/me/dashboard`, the favourites, `GET /phones/compare` and the price trend. Dashboard, Compare and Phone detail switch to the real calls. | Gerald |
| 6 | Reviews | Posting, listing and the summary. The reviews block switches to the real calls. | Gerald and Osakue |
| 7 | Price updater | The nightly job, the price source and `npm run prices`. | Gerald |
| 8 | Password reset | The two endpoints, the email through Nodemailer, the `passwordReset` field. Forgot password and Reset password switch to the real calls. | Gerald and Osakue |
| 9 | Mobile layouts | Every page checked at 375px and 768px, the collapsed top bar, tables that scroll inside their own box. | Ibrahim and Osakue on their pages, Gerald on the shared parts |
| 10 | The report | The sections in [REPORT-OUTLINE.md](REPORT-OUTLINE.md), the diagrams exported to `docs/diagrams/`, the screenshots of the built pages. | Gerald, with screenshots from Ibrahim and Osakue |
| 11 | Test data | The phones collected into `server/data/phones.json`, at least two test cases per feature run and recorded in [TEST-DATA.md](TEST-DATA.md). | All three |
| 12 | Demo video | Five to eight minutes, recorded once every item above is done. | Osakue records, Ibrahim writes the script, Gerald prepares the data |

Items 2 and 3 start right away and run next to item 1. Everything after item 8 waits for the backend to be complete. What we hand in and who prepares it is in [DELIVERABLES.md](DELIVERABLES.md).
