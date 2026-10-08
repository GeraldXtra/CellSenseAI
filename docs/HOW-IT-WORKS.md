# How CellSense AI works, in simple words

This file explains five things in plain language:

1. The hooks folder in the client.
2. How the client talks to the server.
3. How the server works, folder by folder.
4. How the database works, and how we save phones, pictures and other data.
5. How our AI works.

## First, a few words we use

- **Client** or **frontend**: the part you see in the browser. The pages, buttons and pictures. It lives in the `client` folder.
- **Server** or **backend**: the part that runs in the background. It keeps the data and answers questions from the client. It lives in the `server` folder.
- **Database**: where all the phones, users and reviews are stored. We use MongoDB.
- **Request**: the client asking the server for something, like "give me all Samsung phones".
- **Response**: the server's answer to that request.
- **API**: the list of questions the server knows how to answer. Every one starts with `/api`, like `/api/phones`.

A simple way to picture it: the client is a waiter, the server is the kitchen, and the database is the store room. You tell the waiter what you want, the waiter takes it to the kitchen, the kitchen gets the food from the store room, and the waiter brings it back to you.

## Part 1: The hooks folder

There is only one file in `client/src/hooks/`. It is called `useAsync.js`.

### What it does

When a page needs data from the server, it has to wait for the answer. While it waits, three things can happen:

1. The answer is still coming, so the page shows a spinner.
2. Something went wrong, so the page shows an error message.
3. The answer arrived, so the page shows the phones.

`useAsync.js` handles all three for the page. The page just asks it for the data, and it gives back four things:

| What it gives back | What it means |
| --- | --- |
| `data` | The answer from the server, like a list of phones. |
| `loading` | Yes or no. Yes means "still waiting", so show the spinner. |
| `error` | The message to show if something went wrong. |
| `reload` | A button action that asks the server again. The "Try again" buttons use it. |

### Why we have it

Without it, every page would need to write the same waiting, error and retry code again and again. With it, we write that code once and every page uses it.

## Part 2: How the frontend talks to the backend

The pages never talk to the server by themselves. They always go through a small group of files called **services**, in `client/src/services/`.

### The files that do the talking

| File | Its job in simple words |
| --- | --- |
| `api.js` | The messenger. Every request goes through this one file. It adds the user's login pass to each request, sends it to the server, and brings back only the useful part of the answer. If the server is off, it turns the problem into a simple message like "Could not reach the server". |
| `phones.service.js` | Asks for phone things: the list of phones, one phone, compare, price history and reviews. |
| `ai.service.js` | Asks for AI things: smart search, the assistant chat and recommendations. |
| `auth.service.js` | Asks for account things: create account, log in, forgot password and reset password. |
| `users.service.js` | Asks for the dashboard and adds or removes favourites. |

### The helpers that remember things

These files are in `client/src/context/`. They hold information that many pages need at the same time.

| File | What it remembers |
| --- | --- |
| `AuthContext.jsx` | Who is logged in. When you log in, it saves your login pass (called a token) in the browser so you stay logged in. |
| `ChatContext.jsx` | The chat with the assistant. The Assistant page and the small chat window share it, so they show the same messages. |
| `CompareContext.jsx` | The phones you picked to compare, up to three. It saves them in the browser so they are still there after a refresh. |

### The full trip, step by step

Here is what happens when someone opens the Browse page:

1. The Browse page asks `useAsync` to get the phones.
2. `useAsync` calls `listPhones` in `phones.service.js`.
3. `listPhones` hands the request to `api.js`.
4. `api.js` sends it to `/api/phones`.
5. In development, the client file `vite.config.js` passes every `/api` request from port 5173 to the server on port 5000.
6. The server finds the phones in the database and sends them back.
7. `api.js` takes out the phones and gives them to the page.
8. The page stops the spinner and shows the phone cards.

### What is the login pass (token)?

When you log in, the server gives the browser a long secret code called a **token**. It works like a visitor's badge. `api.js` shows this badge with every request, so the server knows who you are. The badge lasts seven days. When you log out, the browser throws it away.

## Part 3: How the backend works

The backend is the `server` folder. It runs on Node.js with a tool called Express. It waits for requests from the client, does the work, and sends back an answer.

### What happens to every request inside the server

Think of the server as an office with a front desk and several departments.

1. **The front door** (`src/index.js`). Every request comes in here first. It checks a few safety things: it adds security settings, it only accepts requests from our own website, it refuses very large requests, and it blocks anyone who sends too many requests too fast (more than 300 in 15 minutes).
2. **The front desk** (`src/routes/`). It reads the address of the request, like `/api/phones` or `/api/auth/login`, and sends it to the right department.
3. **The security guard** (`src/middleware/auth.js`). For private pages like the Dashboard, it checks the login token. No valid token means "Please log in".
4. **The department manager** (`src/controllers/`). It reads what the client asked for and decides what to do.
5. **The workers** (`src/services/`). They do the real work, like building a search, working out a price trend or asking the AI.
6. **The store room** (`src/models/` and the database). The data is read from or saved to MongoDB.
7. **The answer goes back.** Every answer has the same shape: `{ ok: true, data: ... }` when it worked, or `{ ok: false, error: { message } }` when it did not. This makes it easy for the client to read.

If anything goes wrong at any step, the error handler (`src/middleware/error.js`) catches it and sends back a clear message instead of crashing the server.

### What each folder in the server does

| Folder or file | What it does, in simple words |
| --- | --- |
| `src/index.js` | Starts the server. Adds the safety checks, connects all the routes, connects to the database, starts the nightly price check, and opens port 5000. |
| `src/config/` | The settings. `env.js` reads the secret settings from the `.env` file once, like the database address and the AI key. `db.js` connects to the MongoDB database. |
| `src/routes/` | The address book. It says which address goes to which controller. There are four: `auth.routes.js` for accounts, `phones.routes.js` for phones, `ai.routes.js` for the AI features and `users.routes.js` for the dashboard and favourites. It also adds the extra limits, like 20 AI requests a minute. |
| `src/controllers/` | The managers. One per area: `auth.controller.js` (create account, log in, reset password), `phones.controller.js` (list phones, one phone, compare, price trend, reviews), `ai.controller.js` (smart search, chat, recommend) and `users.controller.js` (dashboard, favourites). |
| `src/services/` | The workers that do the hard parts. `ai.service.js` talks to the AI. `phoneQuery.js` turns filters into a database search. `recommend.service.js` picks phones for a budget. `price.service.js` works out if a price is rising or falling. `review.service.js` works out the review mood from the stars. `mail.service.js` sends the reset password email. |
| `src/models/` | The shape of each kind of data in the database. There are four: `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`. Part 4 explains them. |
| `src/middleware/` | Checks that run before or after the managers. `auth.js` checks the login token. `error.js` turns any error into a clear message. |
| `src/jobs/priceUpdater.js` | A timer that runs every night at 2 am and updates the phone prices. |
| `src/utils/` | Small helper tools. `http.js` builds the answer shape. `jwt.js` makes and checks login tokens. `password.js` scrambles passwords and makes reset codes. `slug.js` makes the short name of a phone, like `samsung-galaxy-s24`. |
| `data/phones.json` | The list of our 60 starting phones, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo. |
| `data/prices.json` | The latest guide price for each phone, read by the nightly price check. |
| `scripts/seed.js` | Run with `npm run seed`. Copies the phones from `phones.json` into the database. |
| `scripts/runPriceUpdate.js` | Run with `npm run prices`. Runs the price check once, right now. |
| `.env` | The secret settings: the database address, the login token secret, the AI settings and the email settings. It is never shared or uploaded. |

### A full example: logging in

1. You type your email and password on the Log in page and press the button.
2. The client sends them to `/api/auth/login`.
3. `index.js` lets the request in, and `auth.routes.js` sends it to `auth.controller.js`.
4. The controller finds your account in the database by email.
5. `password.js` checks your password against the scrambled one we saved.
6. If it matches, `jwt.js` makes a login token that lasts seven days.
7. The server sends back your name and the token.
8. The client saves the token and shows you as logged in.

## Part 4: How the database works

### What we use

We use **MongoDB**, on a hosted service called **MongoDB Atlas**, so the database lives online and not on our laptop. The server connects to it with a tool called **Mongoose**, using the address saved in `MONGODB_URI` in the `.env` file.

MongoDB does not store data in tables with rows like Excel. It stores each item as a **document**, which looks like a card with labels and values. Documents of the same kind are kept together in a **collection**, like a drawer of cards.

### Our four collections

| Collection | What one document holds |
| --- | --- |
| `phones` | One phone: its short name (slug), brand, model, picture path, category (budget, midrange, flagship, gaming or camera), release year, specs, current price, price history, the AI summary, the review summary, and where it came from (our list or the AI). |
| `users` | One person: name, email, scrambled password, favourite phones, recently viewed phones (last 20), search history (last 50), last recommendations, and the password reset code when they ask for one. |
| `reviews` | One review: which phone, which user, the name shown, the stars from 1 to 5, the text (up to 1000 letters) and the mood. One person can review a phone only once. |
| `searchlogs` | One search: what was typed, the filters used, whether the AI helped, how many phones were found, and who searched if they were logged in. We use this to see what people look for. |

The model files in `src/models/` describe these shapes. If the server tries to save something with a missing or wrong field, Mongoose refuses it.

### How documents link to each other

Documents point to each other by ID, like a reference number. A user's favourites list does not copy the whole phone. It keeps only the phone's ID. When the Dashboard opens, the server follows those IDs and fills in the full phone details. Reviews link to a phone and a user the same way.

### How phones get into the database

1. All our phones are written in `server/data/phones.json`.
2. We run `npm run seed` once.
3. `scripts/seed.js` reads the file and adds every phone that is missing. For phones already there, it refreshes the names, specs and picture path, but it never changes a price.
4. Each phone gets a **slug**, a short unique name made from the brand and model, like `samsung-galaxy-s24`. The slug is used in the web address, like `/phones/samsung-galaxy-s24`.

A phone can also be added by the AI when someone searches for a real phone we do not have. That phone is saved with its source set to `ai` and is shown as Estimated.

### How we save the phone pictures

The pictures are **not** saved inside the database. Saving pictures in a database makes it slow and big.

Instead:

1. Each picture is a PNG file in `client/public/phones/`, named after the phone's slug, like `samsung-galaxy-s24.png`.
2. The database only saves the **path** to the picture in the phone's `imageUrl` field, like `/phones/samsung-galaxy-s24.png`.
3. The website shows the picture straight from that folder.
4. If a picture is missing, the shared `PhoneImage` component shows a grey box with the phone's name instead, so the page never breaks.

To add or change a picture, we just put the PNG with the right name in that folder. Nothing in the database has to change.

### How prices are saved and updated

- Each phone keeps its **current price** with the date it was checked, and a **price history**, a list of every past price with its date.
- `server/data/prices.json` holds the latest guide price for every phone and the date those prices were checked.
- Every night at 2 am, `jobs/priceUpdater.js` reads that file. If the file has a newer check date than the phone, it saves the new price as the current price and adds it to the history with that date. If the date is not newer, the phone is left alone, so the same check is never added twice.
- The price chart on the phone page is drawn from that history. The server compares the prices and says if the trend is falling, rising or stable.

### How user data is saved

- **Passwords** are never saved as typed. They are scrambled with bcrypt first, so even we cannot read them.
- **Favourites** are saved when you press Save to favourites on a phone page.
- **Recently viewed** phones are saved each time a logged in person opens a phone page. Only the last 20 are kept.
- **Search history** is saved each time a logged in person searches. Only the last 50 are kept.
- **Recommendations** are saved each time a logged in person uses the Recommend page.
- **Password reset**: when you ask for a reset, the server saves a scrambled reset code and the time it ends, one hour later. After the code is used once, it is removed.

### What is saved in the browser, not the database

A few small things are kept in the browser only:

- The **login token**, so you stay logged in.
- The **compare list**, the phones you picked to compare.

## Part 5: How our AI works in the backend

### What we did and did not do

We did not build or train our own AI. We use a ready made language model that is already trained, and our server sends it questions over the internet. Three settings in `server/.env` tell the server where the model is and how to reach it:

- `AI_BASE_URL`: the address of the AI service.
- `AI_API_KEY`: the password for the AI service.
- `AI_MODEL`: the name of the model we use.

### The one file that talks to the AI

Only one file on the server talks to the AI: `server/src/services/ai.service.js`. Every AI feature goes through it. This keeps things simple. If we ever change the AI service, we change the settings, not the whole project.

Inside that file, a function called `askModel` does the sending. It sends the question, waits up to 20 seconds, and returns the AI's answer as text. If the AI does not answer, it returns a clear error instead of crashing.

### The seven jobs the AI does for us

| Feature | What the AI does, in simple words |
| --- | --- |
| Smart search | If you type a sentence like "phone under $400 with a great camera", the AI turns it into simple filters: price below 400, good camera. Our server then uses those filters to search the database. If you type just a name like "Galaxy S24", we search the database directly and do not use the AI. |
| Phone we do not have | If you search for a real phone that is not in our database, the AI gives us its specs and price. We save it and show it with an "Estimated" label, so people know it was not checked by us. |
| Assistant chat | The server first picks up to 10 phones from our database that match your question. Then it sends your question and those phones to the AI with a strict rule: "Use only this phone data. Never invent a spec or a price." The phones the AI mentions are shown under its reply as cards. |
| Recommend | Our own rules first pick the phones that fit your budget and needs. The AI then picks the best three and writes why each one fits you. |
| Phone summary | The first time a phone page opens, the AI writes a short plain summary of the phone. We save it, so it is only written once. |
| Review summary | The AI reads the reviews of a phone and writes one short summary of what people think. |
| Review mood | The AI reads each new review and decides if it is positive, neutral or negative. |

### What if the AI is not working?

The website still works. Each feature has a backup plan:

- Search only matches phone and brand names.
- Recommend and the review summary use our own rules instead.
- The review mood is taken from the star rating.
- The assistant says the AI features are not set up.

### The main idea to remember

The AI does not make up our data. All specs and prices come from our own database. The AI only reads that data and explains it in plain words. The only time the AI supplies data is for a phone we do not have, and that phone is always marked "Estimated".
