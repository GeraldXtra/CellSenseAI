# Installation

These steps set up CellSense AI on a Windows 11 laptop. We use PowerShell for every command, and every command is on its own line. The backend runs on port 5000 and the frontend on port 5173. The site needs an internet connection for the database, the model, the security check on Create account and the email.

Steps 1 to 8 are for a teammate who runs the site on their own laptop against the database we share, with their own database user. The sections after them cover a machine outside the team, which needs a fresh database of its own, the machine that runs the AI features and sends real email, and the real security check keys for a public site.

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
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
RESEND_API_KEY=
MAIL_FROM="CellSense AI <onboarding@resend.dev>"
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
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA`, Cloudflare's test secret key for the security check on Create account. | Create account answers "The security check is not set up yet", so nobody can create an account on this laptop. |
| `RESEND_API_KEY` | Empty on a teammate's laptop. See Turning on real email. | No email goes out. The 6 digit code of a new account and the reset link are printed in the backend window. |
| `MAIL_FROM` | `"CellSense AI <onboarding@resend.dev>"`, the sender of every email. | No email goes out, as for `RESEND_API_KEY`. |
| `CLIENT_URL` | `http://localhost:5173`, the address at the start of the reset link. | The server falls back to the same `http://localhost:5173`. |

`NODE_ENV` is not in the file. We leave it out, so the server runs in development mode, shows the real reason for an error, and prints the codes and links that it cannot email. What each setting does in the server is explained in [BACKEND.md](BACKEND.md).

A teammate leaves the three AI lines empty. The AI features integrate a pre trained language model through an OpenAI compatible chat API, and the key for it stays on Gerald's laptop. With the three lines empty the site still runs, with the differences in the table. That is expected and nothing is broken.

The Turnstile value is one of Cloudflare's test keys. It passes every check, and it accepts only the test token `XXXX.DUMMY.TOKEN.XXXX`, which the test site key in `client/.env` (Step 6) gives the page. The two test keys belong together. A teammate also leaves `RESEND_API_KEY` empty: without it no email goes out, and the backend window prints the code of each new account as `Mail is not set up. Verification code for <email>: <code>` and each reset link as `Mail is not set up. Reset link for <email>: <link>`. We copy the code from there into the Check your email page.

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

The client file has two lines, and we keep them exactly like this:

```
VITE_API_URL=
VITE_TURNSTILE_SITE_KEY=3x00000000000000000000FF
```

| Setting | What goes in it | When it is empty |
| --- | --- | --- |
| `VITE_API_URL` | Nothing. | `client/src/services/api.js` calls `/api`, and the Vite dev server forwards every `/api` request to the backend on port 5000 through the proxy in `client/vite.config.js`. That is what we want. |
| `VITE_TURNSTILE_SITE_KEY` | `3x00000000000000000000FF`, Cloudflare's test site key for the security check. It always shows the checkbox, so a person must tick it by hand. | Create account shows "The security check is not set up yet." and its button stays off. |

Both Turnstile values in this guide are Cloudflare's test keys, not real ones: the site key here and `TURNSTILE_SECRET_KEY` in `server/.env`. They work on any address, including `localhost`, and protect nothing. Real keys come later, as Real security check keys explains. Vite reads `client/.env` only when it starts, so after a change to it we stop the frontend with Ctrl+C and start it again. `client/.env` is ignored by git.

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
5. Open `http://localhost:5173/register`, fill in the form, tick "Verify you are human" and press Create account. The Check your email page opens, and the backend window prints `Mail is not set up. Verification code for`, the email and a 6 digit code. Type that code on the page to finish. The account is then logged in.

If all five checks pass, the setup is complete. To start the site later we only run `npm run dev` in the `server` folder first and then `npm run dev` in the `client` folder, each in its own PowerShell window. To stop an app, press Ctrl+C in its window.

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

## Turning on real email

Every email goes through Resend: the 6 digit code for a new account, the reset link and the notice that a password was changed. Without `RESEND_API_KEY`, the codes and the reset links are printed in the backend window, which is enough to test every page. A teammate does not need a key.

1. Open `https://resend.com` in a browser, create an account, and create an API key under API Keys.
2. Put the key into `server/.env`, with the key in place of the value in angle brackets, and keep the sender line:

```
RESEND_API_KEY=<the key from Resend>
MAIL_FROM="CellSense AI <onboarding@resend.dev>"
```

3. Start the backend again.

The email goes out only when both lines are filled. `onboarding@resend.dev` is Resend's shared test sender, and it can only send to the email address of the Resend account itself. With it, a code reaches only that one inbox. To send codes to other people, we add our own domain under Domains in Resend, add the DNS records it shows, wait until the domain shows as verified, and set `MAIL_FROM` to an address on that domain, such as `"CellSense AI <no-reply@our domain>"`. `CLIENT_URL` must hold the address people open the site at, because the reset link starts with it.

The key is a secret. It lives only in `server/.env`, which is never committed and never shared.

## Real security check keys

The two Turnstile values in Step 5 and Step 6 are Cloudflare's test keys, so the security check stops nobody. Before the site goes public we replace them with real keys:

1. Open the Cloudflare dashboard at `https://dash.cloudflare.com` and sign in, or create a free account.
2. Open Turnstile and click Add widget.
3. Give it a name, add the hostname the site runs on, such as the domain of the public site, and choose Managed mode.
4. Create it. Cloudflare shows a site key and a secret key.
5. Replace the line `VITE_TURNSTILE_SITE_KEY` in `client/.env` with the site key, and the line `TURNSTILE_SECRET_KEY` in `server/.env` with the secret key.
6. Start both apps again, and build the frontend again for the public site, because the build takes the site key from `client/.env`.

Real keys should not allow `localhost`, so they work only on the public site. Laptops keep the two test keys. The secret key is a secret like the other keys in `server/.env`; the site key is public, because the browser needs it.

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

### Log in or Verify email answers 500

`JWT_SECRET` is empty in `server/.env`, so the backend cannot sign a login token. Make one with the command in Step 5, put it in `server/.env` and start the backend again. An account confirmed with its code while the secret was empty is already saved, so we log in with it after the fix and do not create it again.

### Create account says the security check is not set up

The page shows "The security check is not set up yet." under the form when `VITE_TURNSTILE_SITE_KEY` is missing from `client/.env`. Add the line from Step 6 and start the frontend again. The same message in red after pressing Create account comes from the backend: `TURNSTILE_SECRET_KEY` is missing from `server/.env`. Add the line from Step 5 and start the backend again.

### The security check failed. Tick it again.

The site key and the secret key do not belong together, for example a real site key with the test secret, or the other way round. On a laptop both must be the test keys from Steps 5 and 6. A token also works only once, so the page clears the box after every failed try and the person ticks it again.

### The security check could not load

The box under the password shows "The security check could not load. Check your connection, then try again." The browser could not reach `challenges.cloudflare.com`. Check the internet connection, then press Try again.

### No code arrives by email

With `RESEND_API_KEY` empty, no email is sent: the code is in the backend window, as Step 7 shows. With a key and the sender `onboarding@resend.dev`, Resend sends only to the email of the Resend account, so any other address gets nothing and the page says "We could not send the code. Try again in a moment." The backend window then shows `Resend could not send to` with Resend's reason. Use a verified domain in `MAIL_FROM`, as Turning on real email explains.

### A sentence search finds nothing, or the assistant says the AI features are not set up

The three AI lines are empty. Search then looks for every word in the brand and model names, so a sentence such as "phone under $400" finds nothing, while "samsung" or "galaxy s24" works. The assistant answers "The AI features are not set up yet". Both are expected on a teammate's laptop.

### No reset link shows in the backend window

The link is printed only for an email that has an account, and only while `RESEND_API_KEY` or `MAIL_FROM` is empty. After five requests in 15 minutes from one address, the page answers "Too many reset requests. Try again in 15 minutes." and no link is made until the time has passed.

### A phone shows a grey box in place of its picture

The picture file is missing from `client/public/phones/`, or its name does not match the slug. Add the PNG named after the slug, such as `samsung-galaxy-s24.png`, and reload the page.
