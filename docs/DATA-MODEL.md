# Data model

This file describes the four collections that CellSense AI stores in MongoDB Atlas. Each collection has a Mongoose model file in `server/src/models/`: `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`. We chose documents over fixed table columns because phone specs are uneven from one phone to the next. The endpoints that read and write these collections are listed in [API.md](API.md).

## Units

We state the units once here and do not repeat them in the tables. RAM and storage are in GB. Cameras are in megapixels. Battery is in mAh. Display size is in inches. Refresh rate is in Hz. Prices are in USD unless `price.currency` says otherwise.

## How to read the tables

The type column uses string, number, boolean, date, id, object and array. A field of type id holds the id of a document in another collection. A field name with a dot, such as `specs.ram`, is a field nested inside an object.

Every document in the four collections also has `_id`, the id MongoDB gives it, and the two dates `createdAt` and `updatedAt`, which Mongoose fills in. We do not repeat them in the tables.

The tables list every field the models have today. Some fields are in a model but no endpoint writes them yet. Their notes say so.

## Phones

Collection `phones`, model `server/src/models/Phone.js`. One document per phone. Today the collection holds the six phones from `server/data/phones.json`.

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Required and unique. The brand and model in lowercase, joined by hyphens, for example `samsung-galaxy-s24`. The seed script builds it with `server/src/utils/slug.js`. Used in URLs such as `/phones/:slug`. |
| `brand` | string | Required. The brand name. Indexed, because the lists filter on it. |
| `model` | string | Required. The model name. |
| `imageUrl` | string | Link to the phone image. Empty by default. The six seed phones have no image yet. |
| `category` | string | One of `budget`, `midrange`, `flagship`, `gaming` or `camera`. The default is `midrange`. |
| `releaseYear` | number | The year the phone was released. |
| `specs.processor` | string | Processor name. |
| `specs.ram` | number | Memory size. |
| `specs.storage` | number | Storage size. |
| `specs.mainCamera` | number | Main camera resolution. |
| `specs.frontCamera` | number | Front camera resolution. |
| `specs.battery` | number | Battery capacity. |
| `specs.displaySize` | number | Display size. |
| `specs.displayType` | string | Display type. |
| `specs.refreshRate` | number | Display refresh rate. |
| `specs.os` | string | Operating system. |
| `specs.has5G` | boolean | True when the phone supports 5G. The default is false. |
| `price.current` | number | The current guide price. Guide prices are not live shop prices. Indexed, because the lists filter and sort on it. |
| `price.currency` | string | Currency code. The default is `USD`. See the Units section above. |
| `price.updatedAt` | date | The date the price was last checked. The seed script sets it to the date of the last entry in the price history. Shown next to the price on the phone page. |
| `priceHistory` | array of objects | One entry per price check. Each entry holds `price` (number, required), `date` (date) and `source` (string, one of `seed`, `ai`, `api` or `manual`, default `seed`). Today every entry comes from the seed file and has source `seed`. The price trend is computed from this array. The nightly price updater is planned: it will append an entry, then update `price.current` and `price.updatedAt`. |
| `aiSummary` | string | A plain English summary of the phone. Empty by default. Today it comes from the seed file, and only the Galaxy S24 has one. Planned: the model writes it once when a phone is added. |
| `source` | string | One of `seed`, `ai` or `admin`. The default is `seed`, and all six phones have it today. `ai` is kept for phones the model will supply during a search, which is planned. Those phones will be shown with a note. |

## Users

Collection `users`, model `server/src/models/User.js`. One document per registered user.

| Field | Type | Notes |
|---|---|---|
| `name` | string | Required. The user's name. |
| `email` | string | Required and unique. Stored in lowercase. Used to log in. |
| `passwordHash` | string | Required. The bcrypt hash of the password. We never store the plain password. The model leaves this field out of every query unless the code asks for it, so it never reaches a reply. |
| `role` | string | `user` or `admin`. The default is `user`. The login token carries it. |
| `favorites` | array of ids | The phones the user marked as favourites. Each entry is a phone id. The model spells the field `favorites`. The planned replies in [API.md](API.md) call the list `favourites`. No endpoint writes it yet. |
| `recentlyViewed` | array of objects | Each entry holds `phone` (id) and `viewedAt` (date). Our rule is a cap of 20 phones, newest first. No endpoint writes it yet. The cap will be applied by the phone route when the dashboard is built. |
| `searchHistory` | array of objects | Each entry holds `query` (string), `filters` (object) and `at` (date). `POST /ai/search` adds an entry at the top for a logged in user and keeps the latest 50 searches. |
| `recommendations` | array of objects | Each entry holds `phone` (id), `reason` (string) and `at` (date). Planned: saved when a logged in user asks for a recommendation. No endpoint writes it yet. |
| `passwordReset` | object | Holds `tokenHash` and `expiresAt`. Planned: set while a password reset is pending, empty otherwise. No endpoint writes it yet. |
| `passwordReset.tokenHash` | string | The hash of the reset token that will go out in the email link. We will never store the token itself. |
| `passwordReset.expiresAt` | date | One hour after the reset was requested. A token older than this will be refused. |

A reply never holds the whole user document. The model method `toSafeJSON` returns only `_id`, `name`, `email` and `role`.

## Reviews

Collection `reviews`, model `server/src/models/Review.js`. One document per review.

| Field | Type | Notes |
|---|---|---|
| `phone` | id | Required. The phone the review is about. Indexed, because reviews are always read by phone. |
| `user` | id | Required. The user who wrote the review. |
| `author` | string | Required. The name shown with the review. The backend copies it from the account when the review is posted. |
| `rating` | number | Required. A whole number from 1 to 5. |
| `text` | string | Required. The review text, 3 to 1000 characters. |
| `sentiment` | string | One of `positive`, `neutral` or `negative`. The default is `neutral`. For now it is set from the stars when the review is posted: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative. Planned: the model judges it from the text. |

One review per person per phone. Before it saves a review, the route looks for an earlier review with the same `phone` and `user`, and answers 409 when it finds one.

## Search logs

Collection `searchlogs`, model `server/src/models/SearchLog.js`. One document per search. Every search is written here, whether the user is logged in or not.

| Field | Type | Notes |
|---|---|---|
| `query` | string | Required. The words the user typed, cut to 200 characters. |
| `filters` | object | The filters the search ran with. A direct search stores `{ q }` with the query in it. When the model reads the query, the keys can be `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category`, `sort` and `q`. The keywords from the model are stored as `q`. |
| `source` | string | Required. `direct` when the words were matched against brand and model, `ai` when the model turned the query into filters. |
| `resultCount` | number | How many phones the search returned. The default is 0. |
| `user` | id | Optional. Set when the user is logged in. |

## Links between collections

`reviews.phone`, `users.favorites`, `users.recentlyViewed.phone` and `users.recommendations.phone` hold ids from `phones`. `reviews.user` and `searchlogs.user` hold ids from `users`.
