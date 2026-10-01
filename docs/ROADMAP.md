# Roadmap

This file says what is done and what is left, with the owner of each item. It matches the code as it is today. The backend and the shared frontend are finished and every endpoint is live, so each page is built against the real data from the start, as [DATA-FLOW.md](DATA-FLOW.md) describes.

## Done

| Item | What it means | Owner |
| --- | --- | --- |
| The designs | Every page and every state is drawn in `docs/ui/`, 26 images. The pages are built against them. | Gerald |
| The project structure | The client has its routes, theme, services, contexts, hooks, sample data, and one folder per page with a README. The server has its folders, its settings file, its middleware, its models and its scripts. | Gerald |
| The shared frontend | The layout, the top bar with the account menu, the footer, the assistant button and the floating chat window, the phone card, the phone picture, the loader, the empty state, the login guard, the three contexts, the services, `useAsync` and the Page not found page. | Gerald |
| Login and password reset | Register, log in and `GET /auth/me` with bcrypt hashes and JWT tokens, and the reset by email with a one hour link that works once. In the client, AuthContext saves the token and sets the user. | Gerald |
| The phone data | 60 phones in `server/data/phones.json`, 12 for each of five brands, with their specs, guide prices and picture paths. The seed script adds new phones and refreshes their descriptions without touching prices. `GET /phones` with filters, sorting and pages, and `GET /phones/:slug`. | Gerald |
| Search | `POST /ai/search`: direct first, the sentence rule, the model turning a sentence into filters, the same database search, a phone we do not have added with source `ai`, the search log and the search history of a logged in user. | Gerald |
| Comparison | `GET /phones/compare` for two or three phones, with the best value in each row. | Gerald |
| Reviews | Posting and listing reviews with one review per person per phone, the mood judged by the model, and the review summary written by the model, both with the stars as the fallback. | Gerald |
| Phone summaries | The model writes the "In plain words" summary of each phone the first time its page opens. | Gerald |
| The assistant | `POST /ai/chat` with the related phones from the database, used by the floating chat window and the Assistant page through ChatContext. | Gerald |
| Recommendations | `POST /ai/recommend`: the shortlist from our own rules, ranked by the model with a reason for each phone, saved to the dashboard of a logged in user. | Gerald |
| The dashboard | `GET /users/me/dashboard`, the favourites, and recently viewed phones recorded on the phone route, capped at 20. | Gerald |
| Prices | The trend with its suggestion, the nightly price check from `server/data/prices.json`, and `npm run prices` to run it by hand. | Gerald |
| The documents | The problem definition, the architecture, the backend guide, the API, the data model, the routes, the components, the ownership, the styling guide, the data flow guide, the team guide, the design specifications, the test cases, the installation steps, the assumptions, the report outline, the deliverables and this roadmap. | Gerald |

## Next, in order

| No. | Item | What gets done | Owner |
| --- | --- | --- | --- |
| 1 | Log in and Create account pages | AuthCard and the two pages against the designs, through `useAuth`. | Osakue |
| 2 | Browsing pages | Home, Search results, Browse, Phone detail and About against the designs, on the live phone list, phone detail, price trend, favourites and search. | Ibrahim |
| 3 | Compare page and the reviews block | The Compare page and ReviewsSection against the designs, on the live compare and review endpoints. | Osakue |
| 4 | Recommend, Assistant and Dashboard pages | The three pages against the designs, on the live recommend endpoint, ChatContext and the dashboard. | Osakue |
| 5 | Forgot password and Reset password pages | The two pages against the designs, on the live reset endpoints. | Osakue |
| 6 | Mobile layouts | Every page checked at 375px and 768px, with tables that scroll inside their own box. | Ibrahim and Osakue on their pages |

Items 1 to 6 run side by side. Each page follows its section in [DATA-FLOW.md](DATA-FLOW.md) and reaches `develop` through a pull request, as [TEAM-GUIDE.md](TEAM-GUIDE.md) describes.

## Later

| No. | Item | What gets done | Owner |
| --- | --- | --- | --- |
| 7 | The report | The sections in [REPORT-OUTLINE.md](REPORT-OUTLINE.md), the diagrams exported to `docs/diagrams/`, the screenshots of the built pages. | Gerald, with screenshots from Ibrahim and Osakue |
| 8 | Test data | The test cases in [TEST-DATA.md](TEST-DATA.md) run and recorded, with at least two per feature. | All three |
| 9 | Demo video | Five to eight minutes, recorded once every item above is done. | Osakue records, Ibrahim writes the script, Gerald prepares the data |

What we hand in and who prepares it is in [DELIVERABLES.md](DELIVERABLES.md).
