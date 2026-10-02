# Installation

These steps set up CellSense AI on a Windows 11 laptop. We use PowerShell for every command, and every command is on its own line. The backend runs on port 5000 and the frontend on port 5173. The site needs an internet connection for the database and the model.

Steps 1 to 8 are for a teammate who runs the site on their own laptop against the database we share, with their own database user. The sections after them cover a machine outside the team, which needs a fresh database of its own, and the machine that runs the AI features and the reset email.

## Step 1: Install Node.js

1. Open `https://nodejs.org` in a browser and download the Windows installer for the LTS version.
2. Run the installer and keep the default options. This installs both `node` and `npm`.
3. Close every open PowerShell window and open a new one, so the new commands are found.
4. Check the versions:

```powershell
node -v
npm -v
```

`node -v` must print `v20.19` or higher on the 20 line, or `v22.12` or higher. The frontend tools, Vite and its React plugin, need one of those, and the backend needs Node 20 or newer.

## Step 2: Install Git

1. Open `https://git-scm.com` in a browser and download the Windows installer.
2. Run the installer and keep the default options.
3. Open a new PowerShell window and check the version:

```powershell
git --version
```

## Step 3: Clone the repository

Gerald sends the address of the repository. A teammate who already has the project folder skips this step.

1. In PowerShell, go to the folder where we keep our projects.
2. Clone the repository and go into it:

```powershell
git clone <repository URL>
cd <project folder>
```

Git creates a folder named after the repository. Inside it we find `client/`, `server/` and `docs/`.

## Step 4: A database user for each teammate

We share one MongoDB Atlas database, so every laptop shows the same phones, accounts and reviews. Each teammate connects to it with their own database user. No password is shared between us, and one user can be removed without touching the others.

1. The teammate asks Gerald for a database user.
2. Gerald creates the user in Atlas under Database Access, with a password made only of letters and digits.
3. Gerald sends the full connection string to the teammate privately, in a direct message. It starts with `mongodb+srv://` and already holds the user name and the password.
4. The teammate keeps the string for Step 5. It goes into `server/.env` and nowhere else.

The connection string is a secret. We never post it in the group chat, never write it in a document and never commit it. `server/.env` is ignored by git, so it stays on the laptop.

Atlas accepts connections only from the addresses listed under Network Access. If the backend cannot connect in Step 5, see "IP address not allowed in Atlas network access" under Common problems.

## Step 5: Set up the backend

The backend starts first, because the frontend sends every `/api` request to it.

1. From the project folder, go to `server` and install the packages:

```powershell
cd server
npm install
```

2. Copy the example settings file:

```powershell
Copy-Item .env.example .env
```

3. Make a `JWT_SECRET` for this laptop. It is the secret that signs the login tokens here. Each teammate makes their own and shares it with nobody:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The command prints one line of 96 letters and digits. Copy the whole line.

4. Open the settings file in a text editor:

```powershell
notepad .env
```

5. Make the file read exactly like this, with the connection string from Step 4 and the line from point 3 in place of the two values in angle brackets:

```
PORT=5000
MONGODB_URI=<the connection string from Step 4>
JWT_SECRET=<the line from point 3>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
# any OpenAI compatible chat endpoint works
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
PRICE_UPDATER_CRON=0 2 * * *
# used by the password reset email
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
CLIENT_URL=http://localhost:5173
```

Each line does this:

| Setting | What goes in it | When it is empty |
| --- | --- | --- |
| `PORT` | `5000`. The frontend proxy expects this port. | The server uses 5000. |
| `MONGODB_URI` | The connection string from Step 4, on one line, with nothing around it. | The server runs without a database, and every page that needs data fails after about ten seconds. |
| `JWT_SECRET` | The line from point 3. | Nobody can log in or create an account on this laptop. |
| `JWT_EXPIRES_IN` | `7d`. Login tokens expire after seven days. | The server uses `7d`. |
| `CLIENT_ORIGIN` | `http://localhost:5173`. CORS allows only this origin. | The server falls back to the same `http://localhost:5173`. |
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Empty on a teammate's laptop. See Turning on the AI features. | Search is direct only, the assistant answers "The AI features are not set up yet", recommendations come with plain reasons, review moods come from the stars, review summaries are star based unless the model already saved one, and a phone page shows a summary only when one is already stored. |
| `PRICE_UPDATER_CRON` | `0 2 * * *`, which is 02:00 every day. | The server uses `0 2 * * *`. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Empty on a teammate's laptop. See Turning on the reset email. | No email goes out, and the reset link is printed in the backend window. `MAIL_PORT` falls back to 587. |
| `CLIENT_URL` | `http://localhost:5173`, the address at the start of the reset link. | The server falls back to the same `http://localhost:5173`. |

`NODE_ENV` is not in the file. We leave it out, so the server runs in development mode and shows the real reason for an error. What each setting does in the server is explained in [BACKEND.md](BACKEND.md).

A teammate leaves the three AI lines empty. The AI features integrate a pre trained language model through an OpenAI compatible chat API, and the key for it stays on Gerald's laptop. With the three lines empty the site still runs, with the differences in the table. That is expected and nothing is broken.

6. Save the file and start the backend:

```powershell
npm run dev
```

This runs `nodemon src/index.js`, which restarts the server each time we change a file. Three lines must show in the window:

```
MongoDB connected: <the database name>
Nightly price check scheduled: 0 2 * * *
CellSense API running on http://localhost:5000
```

Leave this window open. The backend now listens on port 5000.

## Step 6: Set up the frontend

1. Open a second PowerShell window, go to the `client` folder inside the project folder and install the packages:

```powershell
cd <project folder>
cd client
npm install
```

2. Copy the example settings file:

```powershell
Copy-Item .env.example .env
```

The client file has one line, and we leave its value empty:

```
VITE_API_URL=
```

With it empty, `client/src/services/api.js` calls `/api`, and the Vite dev server forwards every `/api` request to the backend on port 5000 through the proxy in `client/vite.config.js`.

3. Start the frontend:

```powershell
npm run dev
```

Leave this window open. The frontend now runs on port 5173.

## Step 7: Check that both apps are running

Open a third PowerShell window for the checks.

1. Check the backend:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

It prints `ok` as `True` and `data` with the status `up`. In a browser the same address shows:

```json
{ "ok": true, "data": { "status": "up" } }
```

2. Check that the backend reaches the database:

```powershell
(Invoke-RestMethod http://localhost:5000/api/phones).data.total
```

It prints the number of phones in the database: 60 after the seed, more once search has added phones with source `ai`.

3. Check that the frontend reaches the backend through the proxy:

```powershell
Invoke-RestMethod http://localhost:5173/api/health
```

It prints the same answer as check 1.

4. Open `http://localhost:5173` in a browser. The pages load with the top bar, the footer and the assistant button at the bottom right. A page that is not built yet shows only its name.

If all four checks pass, the setup is complete. To start the site later we only run `npm run dev` in the `server` folder first and then `npm run dev` in the `client` folder, each in its own PowerShell window. To stop an app, press Ctrl+C in its window.

## Step 8: Leave the two scripts to Gerald

The server has two scripts that write to the database `MONGODB_URI` points to. On a teammate's laptop that is the shared database, so a teammate never runs either of them. Only Gerald does.

| Command | What it does |
| --- | --- |
| `npm run seed` | Loads `server/data/phones.json`: the 60 phones, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo. It adds the phones that are missing and refreshes the names, specs and image paths of the others, along with their category, release year and, where the file has one, their summary. It never changes a price or a price history that is already in the database, and it never removes a phone. It prints a line such as `Seed: 0 phones added, 60 updated`. |
| `npm run prices` | Runs the price check once by hand: it records the prices in `server/data/prices.json` with the date at the top of that file, and prints a line such as `Price check for 2026-10-01: 4 changed, 2 unchanged, 0 skipped`. The same check runs every night at 02:00 Lagos time while the server is running. |

The seed is safe: running it again cannot undo a price or a review. Only Gerald runs it all the same, so the shared database changes in one place. The other server commands are `npm run dev`, which starts the server with nodemon, and `npm start`, which starts it with plain `node`.

## The phone pictures

The pictures go in `client/public/phones/`, one PNG per phone, named after its slug, such as `samsung-galaxy-s24.png`. Vite serves that folder at `/phones/`, so the file is reached at `/phones/samsung-galaxy-s24.png`. The database stores only that path, in `imageUrl`, and the seed writes it for every phone. A new picture needs no change to the database: the file name only has to match the slug. When `imageUrl` is empty or the file is missing, the site shows a grey box with the phone name in place of the picture.

## A machine outside the team: a fresh database

A machine that cannot use our shared database needs its own. This replaces Step 4, and on this machine the two scripts are run by whoever sets it up.

1. Open `https://www.mongodb.com/atlas` in a browser and create a free account.
2. Create a project and then a cluster. Choose the free tier.
3. Open Database Access and add a database user. Choose a username and a password made only of letters and digits.
4. Open Network Access and add the IP address of this machine. Atlas has a button that adds the current address.
5. Go back to the cluster and click Connect. Choose the option for drivers and copy the connection string. It starts with `mongodb+srv://`.
6. In the copied string, replace `<password>` with the password from point 3, together with its angle brackets. Put the string into `MONGODB_URI` in `server/.env` as in Step 5.
7. Load the phones, then record the price list. From the `server` folder:

```powershell
npm run seed
npm run prices
```

The seed prints `Seed: 60 phones added, 0 updated`. The price check prints `Price check for 2026-10-01: 4 changed, 2 unchanged, 0 skipped`.

## Turning on the AI features

The AI features integrate a pre trained language model through an OpenAI compatible chat API. Any provider with such an endpoint works. We use Groq with the model `openai/gpt-oss-120b`. A teammate does not need this. It is for the laptop that holds the key, and for the machine that runs the demo.

1. Create an account with Groq and create an API key in its console.
2. Put these three lines into `server/.env`, with the key in place of the value in angle brackets:

```
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=<the key from the Groq console>
AI_MODEL=openai/gpt-oss-120b
```

3. Start the backend again.

With all three filled, a search that reads like a sentence goes to the model, search can add a phone we do not have, the assistant answers, the model ranks the recommendations and writes their reasons, each phone page gets its summary the first time it opens, and the model writes the review summaries and judges the mood of each review. When any of the three is empty, all of these fall back as described in Step 5.

The key is a secret. It lives only in `server/.env`, which is never committed and never shared. To switch provider later we change `AI_BASE_URL` and `AI_API_KEY`, and `AI_MODEL` when the new provider uses another model name.

## Turning on the reset email

Without the mail settings, the reset link is printed in the backend window, which is enough to test the reset pages. To send real email, fill the five mail lines in `server/.env` with an SMTP account and start the backend again:

```
MAIL_HOST=<the SMTP host of the mail account>
MAIL_PORT=587
MAIL_USER=<the user name of the mail account>
MAIL_PASS=<the password of the mail account>
MAIL_FROM=<the address the email comes from>
```

The email goes out only when `MAIL_HOST`, `MAIL_USER` and `MAIL_PASS` are all filled. An empty `MAIL_FROM` sends from `MAIL_USER`. Port 465 uses a secure connection from the start, and 587 is the usual port otherwise. `CLIENT_URL` must hold the address people open the site at, because the link starts with it.

## Common problems

### The port is already in use

The backend stops right after `npm run dev` with an error that contains `EADDRINUSE` and the port number. Another program is using port 5000. Most often it is an earlier copy of our own server in another PowerShell window.

1. Find that window and press Ctrl+C in it, or close it.
2. Run `npm run dev` again.
3. If nothing can be closed, restart the machine and run `npm run dev` again. We keep `PORT` at `5000`, because the frontend proxy sends `/api` requests to that port.

If port 5173 is taken, Vite starts on the next free port and prints the address. We open that address instead.

### Wrong database password

The backend prints `MongoDB connection failed` with `bad auth` in the message and then runs without a database. The password in `MONGODB_URI` does not match the database user.

1. Check that the whole connection string was pasted on one line, with no spaces and no quotes around it.
2. If it still fails, the teammate asks Gerald for a new connection string. On a database of our own, we open Database Access in Atlas and set a new password for the user, with only letters and digits.
3. Start the backend again.

### IP address not allowed in Atlas network access

The backend waits for a while and then prints `MongoDB connection failed`. The message says that it could not connect to the cluster and that our IP address may not be on the allowed list. The backend keeps running without a database. Atlas accepts connections only from addresses listed under Network Access, and our address changes when we move to another network.

1. On the shared database, the teammate tells Gerald, who adds the address under Network Access. On a database of our own, we open Network Access in Atlas, click Add IP Address and then Add Current IP Address.
2. Wait until the entry shows as active, then start the backend again.
3. While we develop on changing networks we can allow access from anywhere with `0.0.0.0/0`. We remove that entry before the site holds real user data.

### The database is not connected

The health check works, but the phone list waits about ten seconds and then answers 500. The backend is running without a database. Look at the backend window: it shows `MongoDB connection failed` or a warning that `MONGODB_URI` is empty. Fix `MONGODB_URI` in `server/.env` and start the backend again.

### Log in or Create account answers 500

`JWT_SECRET` is empty in `server/.env`, so the backend cannot sign a login token. Make one with the command in Step 5, put it in `server/.env` and start the backend again. An account created while the secret was empty is already saved, so we log in with it after the fix and do not create it again.

### A sentence search finds nothing, or the assistant says the AI features are not set up

The three AI lines are empty. Search then looks for every word in the brand and model names, so a sentence such as "phone under $400" finds nothing, while "samsung" or "galaxy s24" works. The assistant answers "The AI features are not set up yet". Both are expected on a teammate's laptop.

### No reset link shows in the backend window

The link is printed only for an email that has an account, and only while the mail settings are empty. After five requests in 15 minutes from one address, the page answers "Too many reset requests. Try again in 15 minutes." and no link is made until the time has passed.

### A phone shows a grey box in place of its picture

The picture file is missing from `client/public/phones/`, or its name does not match the slug. Add the PNG named after the slug, such as `samsung-galaxy-s24.png`, and reload the page.
