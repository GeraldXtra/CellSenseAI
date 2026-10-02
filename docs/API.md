# CellSense AI API

We list here every endpoint of the CellSense AI backend, all of them live: who can call it, what it takes, what it returns, every error message it can send and the rate limits. The frontend pages call these endpoints only through the functions in `client/src/services/`. The fields of a phone, a user, a review and a search log are in [DATA-MODEL.md](DATA-MODEL.md). How a request travels through the server is in [BACKEND.md](BACKEND.md).

## Base URL

Every path below sits under `/api`. The backend runs on port 5000, so the full address of the health check is `http://localhost:5000/api/health`. The frontend runs on port 5173, and the Vite proxy in `client/vite.config.js` forwards every `/api` request to port 5000. The client leaves `VITE_API_URL` empty (see `client/.env.example`), so `client/src/services/api.js` calls the short paths through that proxy.

## Response envelope

Every reply uses the same envelope. On success the payload sits in `data`:

```json
{ "ok": true, "data": {} }
```

On failure the reason sits in `error.message`:

```json
{ "ok": false, "error": { "message": "..." } }
```

The reply shapes below show what sits inside `data`. The error messages below are the exact text in `error.message`.

## Login and the token

`POST /auth/register` and `POST /auth/login` return a JWT token. The token carries the user id and the role, and it expires after `JWT_EXPIRES_IN`, which is seven days. The client keeps it in the browser and sends it with every request:

```
Authorization: Bearer <token>
```

The Login column in the tables has three values.

| Login | Meaning |
| --- | --- |
| Yes | The route runs `requireAuth`. Without a valid token it answers 401 with "Please log in". That covers a missing header, a fake or expired token, and a token whose account no longer exists. |
| Optional | The route runs `optionalAuth`. It works for everyone and does a little more for a logged in user. A missing, fake or expired token is ignored and the request runs as a visitor. |
| No | The route never reads the token. |

## Rate limits

Every limit counts the requests from one address. The counters live in the server's memory, so they start again when the server restarts.

| Limit | Applies to | Status and message past the limit |
| --- | --- | --- |
| 300 requests every 15 minutes | Every path under `/api` | 429, "Too many requests. Try again in a few minutes." |
| 20 requests every minute | Every path under `/api/ai`: search, chat and recommend share one counter | 429, "Too many questions at once. Wait a minute and try again." |
| 5 requests every 15 minutes | `POST /auth/forgot-password` | 429, "Too many reset requests. Try again in 15 minutes." |

A request to `/api/ai` or to forgot password also counts toward the 300.

## Status codes and general errors

| Code | Meaning |
| --- | --- |
| 200 | It worked. |
| 201 | Something was created: an account or a review. |
| 400 | The request is wrong, such as a missing field or a rating of 7. |
| 401 | Not logged in, or the email and password do not match. |
| 404 | No such phone, or no such route. |
| 409 | It already exists: an email that has an account, or a second review of the same phone. |
| 413 | The JSON body is larger than 1 MB. |
| 429 | Too many requests, see Rate limits. |
| 500 | Something broke on the server. |
| 502 | The model could not be reached, or its reply could not be read. Only search and chat answer this. |
| 503 | Chat was called while the AI settings are empty. |

These answers can come from any route:

- A path with no route answers 404 with "No route for", the method and the path, for example "No route for GET /api/nothing". Under `/api/users` the login check runs first, so a request there without a valid token answers 401 with "Please log in", even for a path that does not exist.
- A body that is not valid JSON answers 400, and a body over 1 MB answers 413. Both carry the message of the JSON parser.
- A value that Mongoose refuses answers 400 with the message from Mongoose. A value that must be unique and is already taken answers 409 with "That value is already taken".
- Any other failure answers 500. While `NODE_ENV` is not `production` the reply holds the real message. In production a plain 500 carries "Something went wrong on the server." instead. A 502 or 503 keeps its own message in production too, so the person sees what went wrong with the model.

## Health

| Method | Path | Login | Body | Reply |
| --- | --- | --- | --- | --- |
| GET | `/health` | No | none | 200, `{ status: "up" }` |

The health check does not touch the database, so it answers even when MongoDB is not connected.

## Auth

| Method | Path | Login | Body | Reply |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | `{ name, email, password }` | 201, `{ token, user }` |
| POST | `/auth/login` | No | `{ email, password }` | 200, `{ token, user }` |
| GET | `/auth/me` | Yes | none | 200, `{ user }` |
| POST | `/auth/forgot-password` | No | `{ email }` | 200, `{ sent: true }` |
| POST | `/auth/reset-password` | No | `{ token, password }` | 200, `{ ok: true }` |

`user` is always `{ _id, name, email, role }`. The password hash never leaves the server.

### POST /auth/register

The name and the email are trimmed, and the email is stored in lowercase, so the same person cannot sign up twice with different capitals. The password is stored only as a bcrypt hash.

| Status | Message | When |
| --- | --- | --- |
| 400 | Name, email and password are required | A field is missing or empty. |
| 400 | Enter a valid email address | The email does not have the form name@domain.ending. |
| 400 | Password must be at least 8 characters | The password is shorter than 8 characters. |
| 409 | An account with that email already exists | The email already has an account. |

### POST /auth/login

| Status | Message | When |
| --- | --- | --- |
| 400 | Email and password are required | A field is missing or empty. |
| 401 | Wrong email or password | The email has no account, or the password is wrong. Both get the same message, so nobody can use login to find out who has an account. |

### GET /auth/me

Returns the user the token belongs to. The client calls it once when the site opens with a saved token, so a person stays logged in after a reload. Without a valid token it answers 401 with "Please log in".

### POST /auth/forgot-password

The reply is `{ sent: true }` for every valid email, whether or not it has an account. When it has one, the backend makes a random token, stores only its `sha256` hash with an expiry one hour ahead in `passwordReset` on the user, and builds the link `<CLIENT_URL>/reset-password/<token>`. A new request replaces the earlier token, so only the newest link works.

When `MAIL_HOST`, `MAIL_USER` and `MAIL_PASS` are all set, Nodemailer sends the link by email with the subject "Reset your CellSense AI password". When any of them is empty, no email goes out. Outside production the server prints "Mail is not set up. Reset link for", the email and the link, in its terminal. In production it prints "Mail is not set up, so the reset email was not sent." A failed send is printed as "Could not send the reset email:" with the reason, and the reply stays `{ sent: true }`.

| Status | Message | When |
| --- | --- | --- |
| 400 | Enter a valid email address | The email is missing or does not have the form name@domain.ending. |
| 429 | Too many reset requests. Try again in 15 minutes. | More than five requests in 15 minutes from one address. |

### POST /auth/reset-password

On success the backend stores the new bcrypt hash and removes `passwordReset`, so a link works once. The reply holds no token: the person logs in with the new password.

| Status | Message | When |
| --- | --- | --- |
| 400 | This reset link is not complete. Open the link from the email again. | The token is missing. |
| 400 | Password must be at least 8 characters | The new password is shorter than 8 characters. |
| 400 | This reset link is invalid or has expired. Ask for a new one. | No account holds that token, the link was already used, or the hour has passed. |

## Phones

| Method | Path | Login | Body | Reply |
| --- | --- | --- | --- | --- |
| GET | `/phones` | No | none | 200, `{ items, total, page, pages }` |
| GET | `/phones/compare?ids=a,b,c` | No | none | 200, `{ phones, best }` |
| GET | `/phones/:slug` | Optional | none | 200, `{ phone, isFavourite }` |
| GET | `/phones/:slug/price-trend` | No | none | 200, `{ history, trend, suggestion }` |
| GET | `/phones/:slug/reviews` | No | none | 200, `{ items, average, count }` |
| POST | `/phones/:slug/reviews` | Yes | `{ rating, text }` | 201, `{ review }` |
| GET | `/phones/:slug/review-summary` | No | none | 200, `{ summary, sentiment }` |

`:slug` is the phone's slug, built from the brand and the model as [DATA-MODEL.md](DATA-MODEL.md) explains, for example `samsung-galaxy-s24`. It is the same value the page address `/phones/:slug` uses. Every route with `:slug` answers 404 with "Phone not found" when no phone has that slug.

### GET /phones

All params are optional. Units follow [DATA-MODEL.md](DATA-MODEL.md): prices in USD, RAM and storage in GB, cameras in megapixels, battery in mAh, refresh rate in Hz.

| Param | Meaning |
| --- | --- |
| `brand` | One brand, or several separated by commas, for example `brand=xiaomi,vivo`. The whole brand name must match, and capitals do not matter, so `samsung` from a page address works. |
| `category` | One of `budget`, `midrange`, `flagship`, `gaming`, `camera`. Any other value is ignored. |
| `has5G` | `true` keeps only phones with 5G. Any other value is ignored. |
| `minPrice` | Lowest price. |
| `maxPrice` | Highest price. |
| `minRam` | Lowest RAM, for example 8 for "8GB RAM or more". |
| `minStorage` | Lowest storage. |
| `minCamera` | Lowest main camera resolution. |
| `minBattery` | Lowest battery capacity, for example 5000 for "5000mAh or more". |
| `minRefresh` | Lowest refresh rate, for example 120 for "120Hz display". |
| `q` | Words to look for. Each word must appear in the brand or the model, capitals ignored, so `samsung s24` finds the Galaxy S24, the Galaxy S24+ and the Galaxy S24 Ultra. Only the first 100 characters are used. |
| `sort` | `newest` (the default): release year, newest first, then brand and model from A to Z. `priceAsc`: lowest price first. `priceDesc`: highest price first. `camera`: biggest main camera first, then lowest price. `battery`: biggest battery first, then lowest price. Any other value falls back to `newest`. |
| `page` | Page number, starting at 1. The default is 1. |
| `limit` | Phones per page. The default is 24 and the most is 50. |

A number param that is empty or not a number is ignored, so an empty price box never filters anything. The minimums and the price limits include the value itself: `maxPrice=400` keeps a phone at exactly 400.

`items` holds the phones of that page as whole phone documents, `total` the number of matching phones, `page` the page number and `pages` the number of pages, which is at least 1.

### GET /phones/compare

`ids` holds slugs separated by commas. Spaces around each slug are cut, and only the first three slugs are used.

`phones` holds the phones in the order of `ids`, as whole phone documents. A slug that does not exist is left out. `best` maps a row to the list of slugs that win it. The rows are `price`, `ram`, `storage`, `mainCamera`, `frontCamera`, `battery`, `displaySize` and `refreshRate`. The lowest price wins the price row and the highest number wins every other row. When phones tie for the top, all of them are listed. A row where every phone has the same value is left out, and so is a row where a phone has no number. Processor, display type and operating system are text, so they have no winner.

| Status | Message | When |
| --- | --- | --- |
| 400 | Choose at least two phones to compare | `ids` holds fewer than two slugs. |
| 404 | Could not find at least two of those phones | Fewer than two of the slugs exist. |

### GET /phones/:slug

`phone` is the whole phone document, with `priceHistory` and `aiSummary`. `isFavourite` is true when the logged in user has saved the phone, and false for a visitor.

With a valid token the phone also goes to the top of the user's `recentlyViewed`. An earlier entry for the same phone is removed first, and the list keeps the latest 20.

When the AI settings are filled and `aiSummary` is empty, the backend asks the model for a summary of one or two sentences, at most 40 words, about who the phone suits, without the price. It stores the summary in `aiSummary` and returns it, so the model writes it once per phone. When the model fails, the phone comes back with the empty summary and the server prints "Could not write the summary for", the slug and the reason.

### GET /phones/:slug/price-trend

`history` is the phone's `priceHistory`, oldest first, as `{ price, date, source }` entries, where `source` is `seed`, `ai`, `api` or `manual`.

`trend` compares the latest price with a base price. The base is the oldest price check in the 90 days up to the date of the latest one. When the latest check is the only one in those 90 days, the base is the check just before it. A latest price two percent or more below the base is `falling`, two percent or more above it is `rising`, and anything in between is `stable`. With fewer than two price checks, `trend` is `stable`.

`suggestion` is one of these four sentences:

| Case | Suggestion |
| --- | --- |
| `falling` | Price has been falling. Waiting a little could save you money. |
| `rising` | Price has been rising. Buying soon may cost less than waiting. |
| `stable` | Price has been steady. Now is as good a time to buy as any. |
| Fewer than two price checks | Not enough price checks yet to see which way the price is moving. |

### GET /phones/:slug/reviews

`items` holds the reviews newest first, each with `_id`, `author`, `rating`, `text`, `sentiment` and `createdAt`. `average` is the mean rating rounded to one decimal, and 0 when there are no reviews. `count` is the number of reviews.

### POST /phones/:slug/reviews

`rating` must be a whole number from 1 to 5. `text` is trimmed and must hold 3 to 1000 characters. The author name comes from the logged in account, never from the request. The reply is the stored review document: `_id`, `phone`, `user`, `author`, `rating`, `text`, `sentiment`, `createdAt`, `updatedAt` and the Mongoose version key `__v`.

The sentiment is `positive`, `neutral` or `negative`. When the AI settings are filled, the model reads the text and answers with one of the three words. Otherwise the stars decide: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative. The stars also decide when the model fails or answers with another word, and a failure is printed as "Review mood fell back to the stars:" with the reason.

The checks run in this order:

| Status | Message | When |
| --- | --- | --- |
| 401 | Please log in | No valid token. |
| 404 | Phone not found | No phone has that slug. |
| 400 | Choose a rating from 1 to 5 | `rating` is not a whole number from 1 to 5. |
| 400 | Write a few words about the phone | `text` is shorter than 3 characters. |
| 400 | Keep the review under 1000 characters | `text` is longer than 1000 characters. |
| 409 | You have already reviewed this phone | The same account already reviewed this phone. |

### GET /phones/:slug/review-summary

The reply depends on the reviews and the settings, in this order:

1. With no reviews, `summary` is "No reviews yet. Be the first to write one." and `sentiment` is `neutral`.
2. When the phone holds a summary the model wrote, and the number of reviews has not changed since, that saved summary is returned.
3. When the AI settings are filled, the model reads the 30 newest reviews with their stars, writes one or two sentences of at most 40 words about what people like and dislike, and judges the overall mood. The backend saves both in `reviewSummary` on the phone, with the number of reviews, and returns them.
4. Otherwise, or when the model fails, the summary is star based, for example "3 reviews with an average of 4.3 out of 5." with "review" for a single one, and the sentiment follows the rounded average with the star rule above. A failure is printed as "Review summary fell back to the stars:" with the reason. The star based summary is not saved.

## AI

The AI features integrate a pre trained language model through an OpenAI compatible chat API. The address, the key and the model name are set in `server/.env` as `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`, and the model counts as set up only when all three are filled. Any provider with an OpenAI compatible chat endpoint works. We use Groq with the model `openai/gpt-oss-120b`.

| Method | Path | Login | Body | Reply |
| --- | --- | --- | --- | --- |
| POST | `/ai/search` | Optional | `{ query }` | 200, `{ items, filters, source }` |
| POST | `/ai/chat` | No | `{ messages: [{ role, content }] }` | 200, `{ reply, phones }` |
| POST | `/ai/recommend` | Optional | `{ budget, brand, purpose, performance, camera, gaming, battery }` | 200, `{ items: [{ phone, reason }], widened }` |

All three share the limit of 20 requests every minute from one address.

When a call to the model fails, search and chat answer with one of these. Recommendations, summaries and review moods never do: they fall back to their own rules.

| Status | Message | When |
| --- | --- | --- |
| 502 | Could not reach the AI service. Try again in a moment. | The model did not answer within 20 seconds, or the request could not be sent. |
| 502 | The AI service did not answer. Try again in a moment. | The provider answered with an error status. |
| 502 | The AI service sent a reply we could not read. | The provider's reply was not JSON. |
| 503 | The AI features are not set up yet | Chat was called while one of the three AI settings is empty. |

### POST /ai/search

`query` is trimmed and only the first 200 characters are used. An empty query answers 400 with "Type what you are looking for". The search runs in these steps.

1. Direct match. The backend matches each word of the query against brand and model, the same way `q` works on `GET /phones`, newest first, at most 24 phones. `source` is `direct` and `filters` is `{ q }` with the query in it. This step is skipped when the AI settings are filled and the query reads like a sentence.
2. The sentence rule. A query reads like a sentence when it has four words or more, when it holds a dollar sign or a number of three digits or more, or when it holds one of these words: under, below, over, above, less, more, than, with, without, best, good, great, cheap, cheapest, budget, around, between, for, long, big, fast, gaming, camera, battery, selfie, selfies.
3. The model. When the AI settings are filled and step 1 was skipped or found nothing, the model turns the query into filters as JSON. The backend keeps only these keys: `brand`, `minPrice`, `maxPrice`, `has5G` (only `true`), `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category`, `sort` (only the five sort values) and `keywords`, which comes back in `filters` as `q`. A number must be above zero. The same database search then runs with those filters, following the rules of `GET /phones`, at most 24 phones, and `source` is `ai`. A category outside the five is dropped. When the model gives no filter we can use, `items` is empty and `filters` is `{}`.
4. A phone we do not have. When step 3 finds nothing and `filters` holds `q`, the backend asks the model for the phone named by the brand and `q`. When the model knows it, we save it with `source` set to `ai`: the brand, the model name, the category (`midrange` when the model gives none of the five), the release year, the specs, a whole dollar price from 20 to 5000 as `price.current` with today's date, one `priceHistory` entry with source `ai`, and the model's one or two sentence summary in `aiSummary`. A number outside a sensible range is left empty, for example a battery outside 1000 to 10000 mAh. `items` then holds that one phone, which the pages show with the Estimated label. When a phone with the same slug already exists, that phone is returned instead. When the model does not know the phone, `items` is empty.
5. The log. Every search is written to the `searchlogs` collection with the query, the filters, the source, the number of phones found and the user when logged in. With a valid token the search also goes to the top of the user's `searchHistory`, which keeps the latest 50.

Without the AI settings every search stays direct and still answers 200. A sentence then finds phones only when every word is in a brand or a model name.

### POST /ai/chat

`messages` is the conversation so far, oldest first. Each message has a `role` of `user` or `assistant` and a `content` string. The backend keeps only messages with one of those roles and some text, takes the last 12, trims each and cuts it to 1000 characters. When nothing is left, or the last message kept is not from the user, it answers 400 with "Send a question to the assistant".

Before it calls the model, the backend picks phones from the database as data for the answer:

1. Every phone named in the last four messages, in the order they are named. The backend looks for each phone's full name, the brand and the model together, and for the model name on its own only when it has three characters or more with at least one letter and one digit, such as "Galaxy S24" or "12R". Capitals do not matter, and a name counts only as a whole word. The longest names are looked for first, and each name found is blanked out of the text before the shorter ones are looked for, so "Galaxy S24 Ultra" is not also read as the Galaxy S24.
2. Then other phones until there are ten. When the last message holds a budget, only phones at or under it count. A budget is a dollar amount, or a number after under, below, less than, up to, max, maximum, around, about, budget of or budget is. They are ordered by main camera when the last message talks about the camera, photos, pictures or selfies, by battery when it talks about the battery or charging, by lowest price when it talks about price, cost, cheap or budget, and otherwise by release year, newest first.

The model receives our rules, those phones with their guide prices and the dates they were checked, and the conversation. The rules tell it to answer only about phones, to use only the data for specs and prices, to say "guide price", to say when a phone is estimated, to keep to four sentences and three phones, and to write plain text.

`reply` is the model's answer, or "I could not answer that. Try asking another way." when the model sends back nothing. `phones` holds the phones the reply names, found the same way. The backend looks in the reply for the names of every phone in the database, longest first, then keeps only the phones it gave the model as data, at most three, in the order the reply names them. Matching every name first means a longer name the model was not given, such as Galaxy S24 Ultra, cannot be read as a shorter one it was given, such as the Galaxy S24. Each phone has `_id`, `slug`, `brand`, `model`, `category`, `releaseYear`, `specs`, `price`, `source` and `imageUrl`.

Without the AI settings chat answers 503 with "The AI features are not set up yet".

### POST /ai/recommend

| Field | Values |
| --- | --- |
| `budget` | A number from 50 to 5000 US dollars, rounded to a whole number. |
| `brand` | A brand name, matched whole with capitals ignored. `any` or an empty string means any brand. Only the first 40 characters are used. |
| `purpose` | `everyday`, `photos`, `gaming` or `work`. Anything else counts as `everyday`. |
| `performance` | `basic`, `balanced` or `high`. Anything else counts as `balanced`. |
| `camera`, `gaming`, `battery` | `true` when that need matters. Any other value counts as false. |

A budget outside 50 to 5000, or one that is not a number, answers 400 with "Enter a budget between 50 and 5000 US dollars".

The backend first builds a shortlist with our own rules. It takes the phones at or under the budget, of the chosen brand when there is one. When fewer than three fit, it raises the budget by 15 percent, rounds it, takes the phones again and sets `widened` to true. It scores every phone on four measures: camera (the square root of the main camera plus 0.3 times the square root of the front camera), battery (mAh), speed (RAM in GB, plus 4 for a refresh rate of 120Hz or more, or 2 for 90Hz or more) and newness (years after 2018). Each measure is divided by the best value in the group, then weighted:

| Need | Effect on the weights |
| --- | --- |
| Always | camera 1, battery 1, speed 1, newness 0.5 |
| `purpose: photos` | camera plus 2 |
| `purpose: gaming` | speed plus 2 |
| `purpose: work` | battery plus 1.5, speed plus 1 |
| `camera: true` | camera plus 2 |
| `battery: true` | battery plus 2 |
| `gaming: true` | speed plus 2 |
| `performance: high` | speed plus 1.5 |
| `performance: basic` | speed set to 0.5 |

The six highest scores form the shortlist, and a tie goes to the lower price.

Without the AI settings the reply holds the top three of the shortlist, each with a reason from our rules, such as "Guide price $289, with a 200 MP main camera." The reason names the camera when photos or the camera matter, the battery when work or the battery matter, and the RAM with the refresh rate when gaming or high performance matter. When none of them matter, it names the camera and the battery.

With the AI settings the model receives the needs and the shortlist, picks the three phones that suit the needs best, best first, and writes a reason of one or two sentences for each. A pick that is not on the shortlist is dropped. When the model gives fewer than three usable picks, the list is filled from our own order with our own reasons. When the model fails, the reply uses our own order and reasons, and the server prints "Ranking fell back to our own order:" with the reason.

`items` holds up to three `{ phone, reason }` entries, and is empty when no phone fits even the raised budget. Each phone has `_id`, `slug`, `brand`, `model`, `category`, `releaseYear`, `specs`, `price`, `source` and `imageUrl`. With a valid token and at least one item, the picks replace the user's `recommendations`, each with the time it was made.

## Users

Every route under `/users` needs login and answers 401 with "Please log in" without a valid token.

| Method | Path | Login | Body | Reply |
| --- | --- | --- | --- | --- |
| GET | `/users/me/dashboard` | Yes | none | 200, `{ recentlyViewed, favourites, searchHistory, recommendations }` |
| POST | `/users/me/favourites/:slug` | Yes | none | 200, `{ favourites }` |
| DELETE | `/users/me/favourites/:slug` | Yes | none | 200, `{ favourites }` |

The dashboard holds four lists:

| Field | What it holds |
| --- | --- |
| `recentlyViewed` | The phones the user opened, newest first, at most 20, as whole phone documents. |
| `favourites` | The saved phones, the most recently saved first, as whole phone documents. |
| `searchHistory` | `{ query, filters, at }` entries, newest first, at most 50. |
| `recommendations` | `{ phone, reason, at }` entries from the last recommendation, with `phone` as a whole phone document. |

A new account gets four empty lists. A phone that no longer exists is left out of every list.

`POST /users/me/favourites/:slug` adds the phone to the favourites. Adding it a second time changes nothing. `DELETE /users/me/favourites/:slug` removes it. Both return the whole favourites list after the change, the most recently saved first, and both answer 404 with "Phone not found" when no phone has that slug.
