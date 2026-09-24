# Installation

These steps set up CellSense AI on a fresh Windows 11 machine. We use PowerShell for every command. The backend runs on port 5000 and the frontend on port 5173. The site needs an internet connection for the database and the model.

We need three things from outside the project: Node.js 20 or newer, a MongoDB Atlas connection string and an API key from a provider with an OpenAI compatible chat endpoint. A mail account is optional; it is only needed to send the password reset email. The steps below cover each one in order.

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

The address of our repository is [to be decided].

1. In PowerShell, go to the folder where we keep our projects.
2. Clone the repository and go into it:

```powershell
git clone <repository URL>
cd <project folder>
```

Git creates a folder named after the repository. Inside it we find `client/`, `server/` and `docs/`.

## Step 4: Create a free MongoDB Atlas cluster

1. Open `https://www.mongodb.com/atlas` in a browser and create a free account.
2. Create a project and then a cluster. Choose the free tier.
3. Open Database Access and add a database user. Choose a username and a password made only of letters and digits. Write both down. We need them in Step 6.
4. Open Network Access and add the IP address of this machine. Atlas has a button that adds the current address.
5. Go back to the cluster and click Connect. Choose the option for drivers and copy the connection string. It starts with `mongodb+srv://`.
6. In the copied string, replace `<password>` with the password from point 3. Keep the string for Step 6.

The list in Network Access is tied to the network we are on. When we work from another network later, we add the new address there. See Common problems below.

## Step 5: Get an API key from a provider with an OpenAI compatible chat endpoint

The AI features call a chat API through an OpenAI compatible endpoint. Any provider with such an endpoint works. The provider we use is [to be decided].

1. Create an account with the provider.
2. In the console of the provider, create an API key and copy it right away.
3. From the documentation of the provider, note two more values: the base URL of its OpenAI compatible chat endpoint and the name of the model we want to use.
4. We put these three values into `server/.env` in Step 6 as `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.

The key is a secret. It lives only in `server/.env`. That file is never committed and never shared. To switch provider later we change `AI_BASE_URL` and `AI_API_KEY` in `server/.env`, and `AI_MODEL` when the new provider uses another model name.

## Step 6: Set up the backend

1. From the project folder, go to `server` and install the packages:

```powershell
cd server
npm install
```

2. Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

3. Open `server/.env` in a text editor and fill it in. The file has these keys:

| Key | What we put in it |
| --- | --- |
| `PORT` | Leave as `5000`. |
| `MONGODB_URI` | The connection string from Step 4, with the real password in it. |
| `JWT_SECRET` | A long random string that we type ourselves. It signs the login tokens. |
| `JWT_EXPIRES_IN` | Leave as `7d`. Login tokens expire after seven days. |
| `CLIENT_ORIGIN` | Leave as `http://localhost:5173`. CORS allows only this origin. |
| `AI_BASE_URL` | The base URL from Step 5. |
| `AI_API_KEY` | The API key from Step 5. |
| `AI_MODEL` | The model name from Step 5. |
| `PRICE_UPDATER_CRON` | Leave as `0 2 * * *`. The price updater runs at 02:00 every day. |
| `MAIL_HOST` | The SMTP host of the mail account that sends the password reset email. |
| `MAIL_PORT` | The SMTP port of that account, usually `587`. |
| `MAIL_USER` | The user name of that account. |
| `MAIL_PASS` | The password of that account. |
| `MAIL_FROM` | The sender address shown in the email. |
| `CLIENT_URL` | The address of the site that goes into the reset link. `http://localhost:5173` in development. |

The six mail keys can stay empty while we develop. When they are empty, the backend prints the reset link to its console instead of sending an email, so the password reset can still be tested.

4. Start the backend:

```powershell
npm run dev
```

This runs `nodemon src/index.js`, which restarts the server each time we change a file. Leave this window open. The backend now listens on port 5000.

All server scripts are listed below.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with nodemon. |
| `npm start` | Starts the server with plain `node`. |
| `npm run seed` | Loads `server/data/phones.json` into the database. See Step 8. |
| `npm run prices` | Runs `scripts/runPriceUpdate.js`, the price updater, once by hand. |

## Step 7: Set up the frontend

1. Open a second PowerShell window, go to `client` and install the packages:

```powershell
cd <project folder>/client
npm install
```

2. Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

The file holds one key, `VITE_API_URL=`. We leave it empty. The Vite dev server then forwards every `/api` request to the backend on port 5000 through the proxy in `client/vite.config.js`.

3. Start the frontend:

```powershell
npm run dev
```

Leave this window open. The frontend now runs on port 5173.

## Step 8: Seed the database

The sample phones live in `server/data/phones.json`. The seed script loads them into the `phones` collection of our Atlas database.

1. Open a third PowerShell window and go to `server`:

```powershell
cd <project folder>/server
```

2. Run the seed script:

```powershell
npm run seed
```

This runs `node scripts/seed.js`. It uses the same `MONGODB_URI` as the server, so Step 6 must be done first. We run it once on a fresh database. While `phones.json` is still empty, the pages run on the sample phones in `client/src/data/mockPhones.js`.

## Step 9: Check that both apps are running

1. Open `http://localhost:5000/api/health` in a browser. We expect this reply:

```json
{ "ok": true, "data": { "status": "up" } }
```

2. Open `http://localhost:5173` in a browser. The CellSense AI pages load with the top bar and the footer. Pages that are not built yet show only their name.

If both addresses answer, the setup is complete. The other `/api` routes answer 404 until we build them.

To start the site later we only repeat point 4 of Step 6 and point 3 of Step 7, each in its own PowerShell window.

## Common problems

### The port is already in use

The backend stops right after `npm run dev` with an error that contains `EADDRINUSE` and the port number. Another program is using port 5000. Most often it is an earlier copy of our own server in another PowerShell window.

1. Find that window and press Ctrl+C in it, or close it.
2. Run `npm run dev` again.
3. If nothing can be closed, restart the machine and run `npm run dev` again. We keep `PORT` at `5000`, because the frontend proxy sends `/api` requests to that port.

If port 5173 is taken, Vite starts on the next free port and prints the address. `CLIENT_ORIGIN` and `CLIENT_URL` in `server/.env` must then match that address.

### Wrong Atlas password

The backend prints `MongoDB connection failed` with `bad auth` in the message and then runs without a database. The seed script stops with the same error. The password in `MONGODB_URI` does not match the database user.

1. Open Database Access in Atlas and set a new password for the user. Use only letters and digits.
2. Put the new password into `MONGODB_URI` in `server/.env`. Check that `<password>` was replaced together with its angle brackets and that the username is right.
3. Start the backend again.

### IP address not allowed in Atlas network access

The backend waits for a while and then prints `MongoDB connection failed`. The message says that it could not connect to the cluster and that our IP address may not be on the allowed list. The backend keeps running without a database, and the seed script stops with the same error. Atlas accepts connections only from addresses listed under Network Access. Our address changes when we move to another network.

1. Open Network Access in Atlas, click Add IP Address and then Add Current IP Address.
2. Wait until the entry shows as active, then start the backend again.
3. While we develop on changing networks we can allow access from anywhere with `0.0.0.0/0`. We remove that entry before the site holds real user data.

### The password reset email does not arrive

The mail keys in `server/.env` are empty or wrong. While they are empty the backend prints the reset link to its console. Copy that link into the browser to finish the reset. When the keys are filled and the email still does not arrive, check the host, the port and the password with the mail provider, and look at the backend console for the error it prints.
