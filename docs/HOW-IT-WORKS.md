# How CellSense AI works, in simple words

This file explains three things in plain language: the hooks folder, how the website talks to the server, and how our AI works.

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

## Part 3: How our AI works in the backend

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
