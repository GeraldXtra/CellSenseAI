# Data flow

Ibrahim, Osakue, this file shows how a page gets its data, step by step, from the function you call to the moment the page renders. Read it once and the services will make sense. The endpoints themselves are in [API.md](API.md) and the ones each page calls are in [ROUTES.md](ROUTES.md).

## The path of one request

Take the Phone detail page opening `/phones/samsung-galaxy-s24`.

1. The page calls a function in `src/services`. Here it is `getPhone(slug)` from `src/services/phones.service.js`:

   ```js
   const { phone } = await getPhone('samsung-galaxy-s24')
   ```

2. That function calls `api.js`. `getPhone` is one line: `api.get('/phones/samsung-galaxy-s24')`. `api.js` holds one axios instance with the base URL `/api`. Its request interceptor reads the token from localStorage (key `cs_token`) and, when there is one, adds the header `Authorization: Bearer <token>`. The request leaves the browser as `GET /api/phones/samsung-galaxy-s24`.
3. The Vite dev server on port 5173 sees a path that starts with `/api` and forwards it to the Express server on port 5000. That is the proxy in `vite.config.js`. Nothing on the page knows the server's port.
4. In Express, the request passes helmet, cors, the logger, the JSON parser and the rate limit, then reaches the router mounted at `/api/phones`. The route `GET /:slug` matches with `slug` set to `samsung-galaxy-s24`.
5. The controller asks the Phone model for the document with that slug. The model queries MongoDB Atlas and gets the document back.
6. The controller sends the document as JSON inside the envelope: `{ "ok": true, "data": { "phone": { ... } } }`.
7. `api.js` gets the answer. Its response interceptor looks at `ok`. When it is true, it returns `data`, so your function receives `{ phone }` and nothing else. When `ok` is false, it throws an `Error` whose message is the server's message. When the server cannot be reached at all, it throws "Could not reach the server. Check that it is running."
8. The page puts the phone in state and renders it. With `useAsync` that is automatic, see the last section.

Every request follows these eight steps. Only the function name, the path and the shape of `data` change.

## Four more cases

### A search that goes to the model

The Search results page calls `searchPhones(query)` from `src/services/ai.service.js`.

1. `searchPhones` calls `api.post('/ai/search', { query })`.
2. The proxy forwards `POST /api/ai/search` to Express, which routes it to the search controller.
3. The controller first matches the words against brand and model in MongoDB. When the query reads like a sentence, or nothing matched, it sends the sentence to the model through `ai.service.js` and gets filters back as JSON. It runs the phone query with those filters. If still nothing matches and the sentence names a real phone we do not have, it asks the model for that phone's specs and saves it with source `ai`.
4. The controller writes the search to `searchlogs`, and to the user's search history when a token was sent.
5. The answer is `{ ok: true, data: { items, filters, source } }`. You get `{ items, filters, source }`. `filters` feeds UnderstoodChips. A phone in `items` with `source` set to `ai` gets the NoticeBar and the Estimated label.

### A page that needs login

The Dashboard page calls `getDashboard()` from `src/services/users.service.js`.

1. ProtectedRoute in `App.jsx` runs first. While `useAuth().loading` is true it shows Loader. When there is no user it sends the person to `/login?next=/dashboard` and the page never renders.
2. With a user, the page calls `getDashboard()`, which calls `api.get('/users/me/dashboard')`. The request interceptor adds `Authorization: Bearer <token>`.
3. On the server, `requireAuth` reads the header, verifies the token and loads the user onto `req.user`. Without a valid token it answers 401 and the controller never runs.
4. The controller reads the user's recently viewed, favourites, search history and recommendations, fills in the phone documents, and answers `{ recentlyViewed, favourites, searchHistory, recommendations }`.
5. The token got there because AuthContext stored it at login with `setToken`, and on a later visit AuthContext called `me()` on load to turn the stored token back into a user. You never touch the token yourself.

### The compare page

The Compare page gets its slugs from the browser, not from a URL it builds.

1. `useCompare()` returns `slugs`, the list of up to three slugs kept in localStorage under `cs_compare`. The Compare checkbox on every PhoneCard and the Add to compare button on the phone page fill that list. When the page was opened with `/compare?ids=a,b,c`, CompareContext read those ids on load and put them in the same list.
2. With two or three slugs the page calls `comparePhones(slugs)` from `src/services/phones.service.js`, which calls `api.get('/phones/compare', { params: { ids: slugs.join(',') } })`, so the request is `GET /api/phones/compare?ids=a,b,c`.
3. The controller loads the phones by slug, builds the ten rows and marks the best value in each.
4. You get `{ phones, best }`. `phones` fills CompareSlots and the columns of CompareTable. `best` says which slug wins each row, so the table can add `cs-cell-best` to that cell.
5. With one slug or none, the page does not call the server. It shows the one phone state with "Browse phones".

### Posting a review

ReviewsSection on the phone page calls `addReview(slug, { rating, text })` from `src/services/phones.service.js`.

1. The person must be logged in. When `useAuth().user` is null, send them to `/login?next=/phones/<slug>` instead of posting.
2. `addReview` calls `api.post('/phones/<slug>/reviews', { rating, text })`. The interceptor adds the token.
3. On the server, `requireAuth` loads the user, `validate.js` checks that `rating` is 1 to 5 and `text` is not empty, and the controller stores the review with the user's name as the author. The model judges the sentiment; when the model is not configured, the rating decides it.
4. You get `{ review }`. Put it at the top of the list, then call `getReviews(slug)` and `getReviewSummary(slug)` again so the count and the summary are fresh.
5. A 400 from validation or a 401 from a missing token arrives as a thrown Error with the server's message. Show it under the form.

## The mock switch

Until an endpoint exists, the page imports the sample data and swaps to the service call later. Every page README says which sample export to use. The shape is the same, so the swap is a few lines.

Before, on sample data:

```js
import { mockPhones } from '../../data/mockPhones'

export default function Browse() {
  const items = mockPhones
  return <Grid items={items} />
}
```

After, on the real endpoint:

```js
import { listPhones } from '../../services/phones.service'
import { useAsync } from '../../hooks/useAsync'

export default function Browse() {
  const { data, loading, error } = useAsync(() => listPhones({ brand }), [brand])
  return <Grid items={data ? data.items : []} loading={loading} error={error} />
}
```

Write the page so that the data comes in through one variable. Then the swap touches only the import and the line that fills it. I tell you when an endpoint is ready; until then, do not call it, it answers 404.

## The three states and useAsync

Every page handles three states: loading, empty and error. `useAsync` in `src/hooks/useAsync.js` gives you all three from one call:

```js
const { data, loading, error, reload } = useAsync(() => getPhone(slug), [slug])
```

* `loading` is true while the request runs. Show `<Loader />`.
* `error` is the message string when the request failed, otherwise null. Show the message and a button that calls `reload()`.
* `data` is what the service returned when it worked. When it is an empty list, show `<EmptyState />` with the text from the design.
* The function runs again whenever a value in the second argument changes, so a new slug in the URL loads a new phone.

Put the three checks at the top of the page in that order: loading, then error, then empty, then the page itself.
