# Installation

These steps set up CellSense AI on a Windows 11 laptop. We use PowerShell for every command, and every command is on its own line. The backend runs on port 5000 and the frontend on port 5173. The site needs an internet connection for the database.

Steps 1 to 8 are for a teammate who runs the server on his own laptop. He connects to the database we share, with his own database user. The section after them is for a machine outside the team, which needs a fresh database of its own.

## Step 1: Install Node.js 20 or newer

1. Open `https://nodejs.org` in a browser and download the Windows installer for the LTS version.
2. Run the installer and keep the default options. This installs both `node` and `npm`.
3. Close every open PowerShell window and open a new one, so the new commands are found.
4. Check the versions:

```powershell
node -v
npm -v
```

`node -v` must print a version that starts with `v20` or a higher number.

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

We share one MongoDB Atlas database, so every laptop shows the same phones, accounts and reviews. Each teammate connects to it with his own database user. No password is shared between us, and one user can be removed without touching the others.

1. The teammate asks Gerald for a database user.
2. Gerald creates the user in Atlas under Database Access, with a password made only of letters and digits.
3. Gerald sends the full connection string to the teammate privately, in a direct message. It starts with `mongodb+srv://` and already holds the user name and the password.
4. The teammate keeps the string for Step 5. It goes into `server/.env` and nowhere else.

The connection string is a secret. We never post it in the group chat, never write it in a document and never commit it. `server/.env` is ignored by git, so it stays on the laptop.

Atlas accepts connections only from the addresses listed under Network Access. If the backend cannot connect in Step 5, see "IP address not allowed in Atlas network access" under Common problems.

## Step 5: Set up the backend

1. From the project folder, go to `server` and install the packages:

```powershell
cd server
npm install
```

2. Copy the example settings file:

```powershell
Copy-Item .env.example .env
```

3. Make a `JWT_SECRET` for this laptop. It is the secret that signs the login tokens here. Each teammate makes his own and shares it with nobody:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The command prints one line of 96 letters and digits. Copy the whole line.

4. Open the settings file in a text editor:

```powershell
notepad .env
```

5. Fill it in. The file has these settings:

| Setting | What goes in it |
| --- | --- |
| `PORT` | Leave as `5000`. The frontend proxy expects this port. |
| `MONGODB_URI` | The connection string from Step 4, on one line, with nothing around it. |
| `JWT_SECRET` | The line from point 3. |
| `JWT_EXPIRES_IN` | Leave as `7d`. Login tokens expire after seven days. |
| `CLIENT_ORIGIN` | Leave as `http://localhost:5173`. CORS allows only this origin. |
| `AI_BASE_URL` | Leave empty. |
| `AI_API_KEY` | Leave empty. |
| `AI_MODEL` | Leave empty. |
| `PRICE_UPDATER_CRON` | Leave as `0 2 * * *`. Nothing reads it until the price updater is built. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Leave empty. Nothing reads them until password reset is built. |
| `CLIENT_URL` | `http://localhost:5173`. Nothing reads it until password reset is built. |

A teammate leaves the three AI lines empty. The AI features integrate a pre trained language model through an OpenAI compatible chat API, and the key for it stays on Gerald's laptop. With the three lines empty the server still runs and the site still searches. Search stays direct: it matches the words against brand and model, so "samsung" finds the Samsung phones. A search in a full sentence needs the model, so on this laptop it finds nothing. That is expected and nothing is broken.

6. Save the file and start the backend:

```powershell
npm run dev
```

This runs `nodemon src/index.js`, which restarts the server each time we change a file. Two lines must show in the window:

```
MongoDB connected: <the database name>
CellSense API running on http://localhost:5000
```

Leave this window open. The backend now listens on port 5000.

All server scripts are listed below.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with nodemon. |
| `npm start` | Starts the server with plain `node`. |
| `npm run seed` | Loads `server/data/phones.json` into the database. Never on the shared database. See Step 6. |
| `npm run prices` | Will run the price updater once by hand. The script is a placeholder and does nothing yet. |

## Step 6: Never run the seed on the shared database

The shared database already holds the phones. A teammate does not run this command:

```powershell
npm run seed
```

The seed script writes the six phones from `server/data/phones.json` over the phones with the same slug. It puts their prices and their price history back to the sample values in the file. On the shared database that would undo changes for all three of us. Only Gerald runs the seed, and only on a fresh database.

## Step 7: Set up the frontend

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

The file holds one setting, `VITE_API_URL=`. We leave it empty. The Vite dev server then forwards every `/api` request to the backend on port 5000 through the proxy in `client/vite.config.js`.

3. Start the frontend:

```powershell
npm run dev
```

Leave this window open. The frontend now runs on port 5173.

## Step 8: Check that both apps are running

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

It prints the number of phones in the database. With only the seed phones that is 6.

3. Check that the frontend reaches the backend through the proxy:

```powershell
Invoke-RestMethod http://localhost:5173/api/health
```

It prints the same answer as check 1.

4. Open `http://localhost:5173` in a browser. The CellSense AI pages load with the top bar and the footer. Pages that are not built yet show only their name.

If all four checks pass, the setup is complete. The endpoints that are built are marked in [API.md](API.md). The others answer 404 until we build them.

To start the site later we only repeat `npm run dev` in the `server` folder and `npm run dev` in the `client` folder, each in its own PowerShell window. To stop an app, press Ctrl+C in its window.

## A machine outside the team: a fresh database

A machine that cannot use our shared database needs its own. This replaces Step 4 and Step 6.

1. Open `https://www.mongodb.com/atlas` in a browser and create a free account.
2. Create a project and then a cluster. Choose the free tier.
3. Open Database Access and add a database user. Choose a username and a password made only of letters and digits.
4. Open Network Access and add the IP address of this machine. Atlas has a button that adds the current address.
5. Go back to the cluster and click Connect. Choose the option for drivers and copy the connection string. It starts with `mongodb+srv://`.
6. In the copied string, replace `<password>` with the password from point 3, together with its angle brackets. Put the string into `MONGODB_URI` in `server/.env` as in Step 5.
7. Load the sample phones. This database is fresh and belongs to this machine alone, so the seed is safe here. From the `server` folder:

```powershell
npm run seed
```

It prints `Seeded 6 phones`. We run it once.

## Turning on the AI features

The AI features integrate a pre trained language model through an OpenAI compatible chat API. Any provider with such an endpoint works. A teammate does not need this. It is for the laptop that holds the key, and for the machine that runs the demo.

1. Create an account with the provider and create an API key in its console.
2. From the documentation of the provider, note the base URL of its OpenAI compatible chat endpoint and the name of the model.
3. Put the three values into `server/.env` as `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.
4. Start the backend again.

With all three filled, a search that reads like a sentence goes to the model, which turns it into filters. When any of the three is empty, search stays direct.

The key is a secret. It lives only in `server/.env`. That file is never committed and never shared. To switch provider later we change `AI_BASE_URL` and `AI_API_KEY`, and `AI_MODEL` when the new provider uses another model name.

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

The backend waits for a while and then prints `MongoDB connection failed`. The message says that it could not connect to the cluster and that our IP address may not be on the allowed list. The backend keeps running without a database. Atlas accepts connections only from addresses listed under Network Access. Our address changes when we move to another network.

1. On the shared database, the teammate tells Gerald, who adds the address under Network Access. On a database of our own, we open Network Access in Atlas, click Add IP Address and then Add Current IP Address.
2. Wait until the entry shows as active, then start the backend again.
3. While we develop on changing networks we can allow access from anywhere with `0.0.0.0/0`. We remove that entry before the site holds real user data.

### The database is not connected

The health check works, but the phone list waits about ten seconds and then answers 500. The backend is running without a database. Look at the backend window: it shows `MongoDB connection failed` or a warning that `MONGODB_URI` is empty. Fix `MONGODB_URI` in `server/.env` and start the backend again.

### Log in or Create account answers 500

`JWT_SECRET` is empty in `server/.env`, so the backend cannot sign a login token. Make one with the command in Step 5, put it in `server/.env` and start the backend again. An account created while the secret was empty is already saved, so we log in with it after the fix and do not create it again.

### A sentence search finds nothing

The three AI lines are empty, so search stays direct and looks for every word in the brand and model names. This is expected on a teammate's laptop. Search for a brand or a model name instead, such as "samsung" or "galaxy s24".
