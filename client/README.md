# CellSense AI client

Ibrahim, Osakue, this folder is the React app. This file says how to run it, what each folder is for and who owns it, and where the designs are. The full guide for the two of you is [`docs/TEAM-GUIDE.md`](../docs/TEAM-GUIDE.md).

## Run it

From this folder:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. Every page already shows with the top bar and the footer; a page that is not built yet shows only its name.

The `/api` calls go through the Vite proxy to the server on port 5000, so start the server too when you switch a page from the sample data to a real endpoint. Until then you do not need it. `npm run build` makes the production build in `dist/` and `npm run preview` serves that build so you can check it. `npm run lint` runs the linter.

## The folder map

| Path | Owner | What it is for |
| --- | --- | --- |
| `index.html` | Gerald | The one HTML page with the favicon links and the root div. |
| `vite.config.js` | Gerald | The React plugin, port 5173 and the proxy for `/api`. |
| `public/brand/` | Gerald | The logo mark, the favicons and the horizontal logo. |
| `src/main.jsx` | Gerald | Loads Bootstrap, `theme.css` and `global.css`, then renders App inside the router and the two providers. |
| `src/App.jsx` | Gerald | The route table. Every page sits inside Layout. |
| `src/styles/theme.css` | Gerald | Every colour, spacing, font size, radius and shadow, plus the shared classes. See [`docs/STYLING.md`](../docs/STYLING.md). |
| `src/styles/global.css` | Gerald | The body defaults, the page shell, the top bar, the footer, the phone card and the breakpoints. |
| `src/services/` | Gerald | `api.js` and one file per endpoint group. Pages call these and nothing else. See [`docs/DATA-FLOW.md`](../docs/DATA-FLOW.md). |
| `src/context/` | Gerald | `AuthContext.jsx` (the logged in user) and `CompareContext.jsx` (the compare list). |
| `src/hooks/` | Gerald | `useAsync.js`, which gives a page its loading, data and error state. |
| `src/data/` | Gerald | `mockPhones.js`, the sample phones, reviews and summary used until an endpoint is ready. |
| `src/components/shared/` | Gerald | Layout, Navbar, AccountMenu, Footer, ChatLauncher, PhoneImage, PhoneCard, Loader, EmptyState, ProtectedRoute. See [`docs/COMPONENTS.md`](../docs/COMPONENTS.md). |
| `src/components/ibrahim/` | Ibrahim | SearchBar, UnderstoodChips, FilterStrip, BrandTabs, SortSelect, SpecTable, PriceHistoryChart, NoticeBar. |
| `src/components/osakue/` | Osakue | CompareTable, CompareSlots, AddPhoneDialog, RecommendForm, ChatThread, ChatInput, ReviewsSection, AuthCard. |
| `src/pages/Home/` | Ibrahim | Home. |
| `src/pages/SearchResults/` | Ibrahim | Search results. |
| `src/pages/Browse/` | Ibrahim | Browse and Browse by brand. |
| `src/pages/PhoneDetail/` | Ibrahim | Phone detail. It places Osakue's ReviewsSection. |
| `src/pages/About/` | Ibrahim | About. |
| `src/pages/Compare/` | Osakue | Compare. |
| `src/pages/Recommend/` | Osakue | Recommend. |
| `src/pages/Assistant/` | Osakue | Assistant. |
| `src/pages/Dashboard/` | Osakue | Dashboard. |
| `src/pages/Login/` | Osakue | Log in. |
| `src/pages/Register/` | Osakue | Create account. |
| `src/pages/ForgotPassword/` | Osakue | Forgot password. |
| `src/pages/ResetPassword/` | Osakue | Reset password. |
| `src/pages/NotFound/` | Gerald | Page not found, already built. |

Each page folder holds `<Page>.jsx`, `<Page>.css` and a `README.md` that says what to build. Import the css file at the top of the page file. The owner of every single file is in [`docs/OWNERSHIP.md`](../docs/OWNERSHIP.md).

## The rule on shared files

Shared files, services and context are changed only by me: everything in `src/styles/`, `src/services/`, `src/context/`, `src/hooks/`, `src/data/` and `src/components/shared/`, plus `index.html`, `vite.config.js`, `src/main.jsx` and `src/App.jsx`. If you need a new theme value, a new prop on a shared component or a new service function, ask me and I add it on `backend`. Never copy a shared component to change it.

## The three breakpoints

Every page is checked at 375px, 768px and 1280px. Build for 1280px first, then make the two smaller sizes work. The page never scrolls sideways; wide tables scroll inside their own box (`.cs-table-wrap`). Under 768px the top bar collapses to the logo mark, a search icon and a menu icon; `global.css` already does that.

## Where the designs are

The finished designs are in [`docs/ui/`](../docs/ui/), one image per page state. Your page README names the images for your page. Open the image next to your browser while you build. A page is done when it matches its image at 1280px. The list of every image and what it shows is in [`docs/DESIGN-SPECIFICATIONS.md`](../docs/DESIGN-SPECIFICATIONS.md).
