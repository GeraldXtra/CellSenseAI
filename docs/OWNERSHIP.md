# Ownership

Ibrahim, Osakue, this is one table of every folder and file in `client/` and `server/`, who owns it, and what it is for. Shared files are marked "changed only by Gerald". `node_modules`, `dist` and the lock files are left out.

## client/

| Path | Owner | What it is for |
| --- | --- | --- |
| `client/index.html` | shared, changed only by Gerald | The one HTML page: the title, the favicon links and the root div. |
| `client/vite.config.js` | shared, changed only by Gerald | The Vite config: the React plugin, port 5173 and the proxy that sends `/api` to port 5000. |
| `client/package.json` | shared, changed only by Gerald | The client packages and the scripts. Ask me before adding a package. |
| `client/.env.example` | shared, changed only by Gerald | The one client setting, `VITE_API_URL`, left empty for the proxy. |
| `client/.gitignore` | shared, changed only by Gerald | What git ignores in the client. |
| `client/.oxlintrc.json` | shared, changed only by Gerald | The lint rules. |
| `client/README.md` | Gerald | How to run the client and the folder map. |
| `client/public/brand/favicon.svg` | shared, changed only by Gerald | The favicon as SVG. |
| `client/public/brand/favicon-32.png` | shared, changed only by Gerald | The favicon at 32px. |
| `client/public/brand/favicon-512.png` | shared, changed only by Gerald | The favicon at 512px. |
| `client/public/brand/apple-touch-icon.png` | shared, changed only by Gerald | The home screen icon. |
| `client/public/brand/favicon-mark.png` | shared, changed only by Gerald | The logo mark used in the top bar. |
| `client/public/brand/favicon-mark-transparent.png` | shared, changed only by Gerald | The logo mark with a transparent background. |
| `client/public/brand/logo-horizontal.png` | shared, changed only by Gerald | The logo with the name, for the report and the video. |
| `client/src/main.jsx` | shared, changed only by Gerald | The entry point: loads Bootstrap and the styles, renders App inside the router and the providers. |
| `client/src/App.jsx` | shared, changed only by Gerald | The route table. Every page sits inside Layout. |
| `client/src/styles/theme.css` | shared, changed only by Gerald | Every colour, spacing, font size, radius and shadow, the Bootstrap hooks and the shared classes. |
| `client/src/styles/global.css` | shared, changed only by Gerald | The body defaults, the page shell, the top bar, the footer, the phone card and the breakpoints. |
| `client/src/services/api.js` | shared, changed only by Gerald | The axios instance, the token storage, the auth header and the envelope unwrapping. |
| `client/src/services/phones.service.js` | shared, changed only by Gerald | listPhones, getPhone, comparePhones, getPriceTrend, getReviews, addReview, getReviewSummary. |
| `client/src/services/ai.service.js` | shared, changed only by Gerald | searchPhones, chat, recommend. |
| `client/src/services/auth.service.js` | shared, changed only by Gerald | register, login, me, forgotPassword, resetPassword. |
| `client/src/services/users.service.js` | shared, changed only by Gerald | getDashboard, addFavourite, removeFavourite. |
| `client/src/context/AuthContext.jsx` | shared, changed only by Gerald | The logged in user, loading, login, register, logout, and the useAuth hook. |
| `client/src/context/CompareContext.jsx` | shared, changed only by Gerald | The compare list of up to three slugs in localStorage, the `?ids=` reader, and the useCompare hook. |
| `client/src/context/ChatContext.jsx` | shared, changed only by Gerald | The chat messages, the loading flag, the open state of the chat window, the send action, and the useChat hook. |
| `client/src/hooks/useAsync.js` | shared, changed only by Gerald | Runs an async function and gives data, loading, error and reload. |
| `client/src/data/mockPhones.js` | shared, changed only by Gerald | The six sample phones, the brands, the three sample reviews and the sample review summary. |
| `client/src/components/shared/Layout.jsx` | shared, changed only by Gerald | The shell: Navbar, the page, Footer, ChatLauncher. |
| `client/src/components/shared/Navbar.jsx` | shared, changed only by Gerald | The top bar and its collapsed form under 768px. |
| `client/src/components/shared/AccountMenu.jsx` | shared, changed only by Gerald | The Dashboard and Log out dropdown. |
| `client/src/components/shared/Footer.jsx` | shared, changed only by Gerald | The five column footer. |
| `client/src/components/shared/ChatLauncher.jsx` | shared, changed only by Gerald | The fixed button that opens the floating chat window. |
| `client/src/components/shared/PhoneImage.jsx` | shared, changed only by Gerald | The phone picture or the grey placeholder, and the phoneName helper. |
| `client/src/components/shared/PhoneCard.jsx` | shared, changed only by Gerald | The product card, and the specLine helper. |
| `client/src/components/shared/Loader.jsx` | shared, changed only by Gerald | The spinner with a label. |
| `client/src/components/shared/EmptyState.jsx` | shared, changed only by Gerald | The empty box with a title, a message and an action. |
| `client/src/components/shared/ProtectedRoute.jsx` | shared, changed only by Gerald | The login guard for the dashboard. |
| `client/src/components/ibrahim/SearchBar.jsx` | Ibrahim | The search field and button. Used on Home and Search results. |
| `client/src/components/ibrahim/UnderstoodChips.jsx` | Ibrahim | The "Understood as" chips on Search results. |
| `client/src/components/ibrahim/FilterStrip.jsx` | Ibrahim | The filter strip on Search results and Browse. |
| `client/src/components/ibrahim/BrandTabs.jsx` | Ibrahim | The brand tabs on Browse. |
| `client/src/components/ibrahim/SortSelect.jsx` | Ibrahim | The sort select on Search results and Browse. |
| `client/src/components/ibrahim/SpecTable.jsx` | Ibrahim | The Tech specs table on Phone detail. |
| `client/src/components/ibrahim/PriceHistoryChart.jsx` | Ibrahim | The price history chart on Phone detail. |
| `client/src/components/ibrahim/NoticeBar.jsx` | Ibrahim | The notice bar on Search results. |
| `client/src/components/osakue/CompareTable.jsx` | Osakue | The compare table. |
| `client/src/components/osakue/CompareSlots.jsx` | Osakue | The slots above the compare table. |
| `client/src/components/osakue/AddPhoneDialog.jsx` | Osakue | The Add a phone dialog. |
| `client/src/components/osakue/RecommendForm.jsx` | Osakue | The recommendation form. |
| `client/src/components/osakue/ChatThread.jsx` | Osakue | The chat bubbles, the phones under a reply and the typing dots, on Assistant and inside ChatWindow. |
| `client/src/components/osakue/ChatInput.jsx` | Osakue | The chat text field and send button, on Assistant and inside ChatWindow. |
| `client/src/components/osakue/ChatWindow.jsx` | Osakue | The small floating chat window at the bottom right, built from ChatThread and ChatInput. |
| `client/src/components/osakue/ReviewsSection.jsx` | Osakue | The reviews block placed on Phone detail. |
| `client/src/components/osakue/AuthCard.jsx` | Osakue | The card on the four account pages. |
| `client/src/pages/Home/` (Home.jsx, Home.css, README.md) | Ibrahim | The Home page. |
| `client/src/pages/SearchResults/` (SearchResults.jsx, SearchResults.css, README.md) | Ibrahim | The Search results page. |
| `client/src/pages/Browse/` (Browse.jsx, Browse.css, README.md) | Ibrahim | The Browse page. |
| `client/src/pages/PhoneDetail/` (PhoneDetail.jsx, PhoneDetail.css, README.md) | Ibrahim | The Phone detail page. It places Osakue's ReviewsSection. |
| `client/src/pages/About/` (About.jsx, About.css, README.md) | Ibrahim | The About page. |
| `client/src/pages/Compare/` (Compare.jsx, Compare.css, README.md) | Osakue | The Compare page. |
| `client/src/pages/Recommend/` (Recommend.jsx, Recommend.css, README.md) | Osakue | The Recommend page. |
| `client/src/pages/Assistant/` (Assistant.jsx, Assistant.css, README.md) | Osakue | The Assistant page. |
| `client/src/pages/Dashboard/` (Dashboard.jsx, Dashboard.css, README.md) | Osakue | The Dashboard page. |
| `client/src/pages/Login/` (Login.jsx, Login.css, README.md) | Osakue | The Log in page. |
| `client/src/pages/Register/` (Register.jsx, Register.css, README.md) | Osakue | The Create account page. |
| `client/src/pages/ForgotPassword/` (ForgotPassword.jsx, ForgotPassword.css, README.md) | Osakue | The Forgot password page. |
| `client/src/pages/ResetPassword/` (ResetPassword.jsx, ResetPassword.css, README.md) | Osakue | The Reset password page. |
| `client/src/pages/NotFound/` (NotFound.jsx, NotFound.css, README.md) | shared, changed only by Gerald | The Page not found page, already built. |

The README in each page folder is mine too: I wrote it for the owner of the page. If it is wrong or unclear, tell me and I fix it.

## server/

Everything in `server/` is mine. You do not need to open it to build your pages; [DATA-FLOW.md](DATA-FLOW.md) and [API.md](API.md) tell you what comes back from each endpoint.

| Path | Owner | What it is for |
| --- | --- | --- |
| `server/package.json` | Gerald | The server packages and the scripts dev, start, seed and prices. |
| `server/.env.example` | Gerald | Every server setting with an empty value. The real `.env` is never committed. |
| `server/README.md` | Gerald | How to run the server, the scripts, the keys and the folder map. |
| `server/data/phones.json` | Gerald | The sample phones the seed script loads. |
| `server/data/README.md` | Gerald | What `phones.json` is. |
| `server/scripts/seed.js` | Gerald | Loads `phones.json` into the database. |
| `server/scripts/runPriceUpdate.js` | Gerald | Runs the price updater once. |
| `server/src/index.js` | Gerald | Builds the Express app, mounts the routers and starts the server. |
| `server/src/config/env.js` | Gerald | Reads every setting once and exports a frozen object. |
| `server/src/config/db.js` | Gerald | Connects to MongoDB Atlas. |
| `server/src/models/Phone.js` | Gerald | The phones collection. |
| `server/src/models/User.js` | Gerald | The users collection, including favourites, history and the password reset. |
| `server/src/models/Review.js` | Gerald | The reviews collection. |
| `server/src/models/SearchLog.js` | Gerald | The searchlogs collection. |
| `server/src/routes/auth.routes.js` | Gerald | The `/api/auth` router. |
| `server/src/routes/phones.routes.js` | Gerald | The `/api/phones` router. |
| `server/src/routes/ai.routes.js` | Gerald | The `/api/ai` router. |
| `server/src/routes/users.routes.js` | Gerald | The `/api/users` router. |
| `server/src/controllers/auth.controller.js` | Gerald | Register, login, me, forgot password, reset password. |
| `server/src/controllers/phones.controller.js` | Gerald | List, compare, detail, price trend, reviews. |
| `server/src/controllers/ai.controller.js` | Gerald | Search, chat, recommend. |
| `server/src/controllers/users.controller.js` | Gerald | Dashboard and favourites. |
| `server/src/services/ai.service.js` | Gerald | The one file that calls the model. |
| `server/src/services/phoneQuery.js` | Gerald | Turns the query params into one MongoDB query. |
| `server/src/services/recommend.service.js` | Gerald | Builds the shortlist and asks the model to rank it. |
| `server/src/services/price.service.js` | Gerald | Computes the trend and the best time to buy note. |
| `server/src/services/review.service.js` | Gerald | Stores reviews and asks the model for the sentiment and the summary. |
| `server/src/services/mail.service.js` | Gerald | Sends the password reset email with Nodemailer. |
| `server/src/middleware/auth.js` | Gerald | requireAuth and optionalAuth. |
| `server/src/middleware/validate.js` | Gerald | Checks bodies and queries with zod. |
| `server/src/middleware/error.js` | Gerald | The not found answer and the error handler. |
| `server/src/jobs/priceUpdater.js` | Gerald | The nightly price job. |
| `server/src/utils/http.js` | Gerald | The response envelope helpers. |
| `server/src/utils/jwt.js` | Gerald | Signs and verifies the tokens. |
| `server/src/utils/password.js` | Gerald | Hashes and checks passwords. |

## The rule

If the file you need is not yours, ask me, do not edit it.
