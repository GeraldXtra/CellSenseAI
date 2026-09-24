# Data model

This file describes the four collections that CellSense AI stores in MongoDB Atlas. Each collection has a Mongoose model file in `server/src/models/`: `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`. We chose documents over fixed table columns because phone specs are uneven from one phone to the next. The endpoints that read and write these collections are listed in [API.md](API.md).

## Units

We state the units once here and do not repeat them in the tables. RAM and storage are in GB. Cameras are in megapixels. Battery is in mAh. Display size is in inches. Refresh rate is in Hz. Prices are in USD unless `price.currency` says otherwise.

## How to read the tables

The type column uses string, number, boolean, date, id, object and array. A field of type id holds the id of a document in another collection. A field name with a dot, such as `specs.ram`, is a field nested inside an object.

## Phones

Collection `phones`, model `server/src/models/Phone.js`. One document per phone.

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Unique. The brand and model in lowercase, joined by hyphens. Used in URLs such as `/phones/:slug`. |
| `brand` | string | The brand name. |
| `model` | string | The model name. |
| `imageUrl` | string | Link to the phone image. |
| `category` | string | One of `budget`, `midrange`, `flagship`, `gaming` or `camera`. |
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
| `specs.has5G` | boolean | True when the phone supports 5G. |
| `price.current` | number | The current guide price. Guide prices are not live shop prices. |
| `price.currency` | string | Currency code. See the Units section above. |
| `price.updatedAt` | date | The date the price was last checked. Shown next to the price on the phone page. |
| `priceHistory` | array of objects | One entry per price check. Each entry holds `price` (number), `date` (date) and `source` (string, one of `seed`, `ai`, `api` or `manual`). The nightly price updater appends an entry, then updates `price.current` and `price.updatedAt`. The price trend is computed from this array. |
| `aiSummary` | string | A plain English summary of the phone. The model writes it once when the phone is added. |
| `source` | string | One of `seed`, `ai` or `admin`. Phones loaded from `server/data/phones.json` have `seed`. Phones the model supplied during a search have `ai` and are shown with a note. |

## Users

Collection `users`, model `server/src/models/User.js`. One document per registered user.

| Field | Type | Notes |
|---|---|---|
| `name` | string | The user's name. |
| `email` | string | Unique. Stored in lowercase. Used to log in. |
| `passwordHash` | string | The bcrypt hash of the password. We never store the plain password. |
| `role` | string | `user` or `admin`. |
| `favourites` | array of ids | The phones the user marked as favourites. Each entry is a phone id. |
| `recentlyViewed` | array of objects | Each entry holds `phone` (id) and `viewedAt` (date). Added when a logged in user opens a phone page. Capped at 20 entries. |
| `searchHistory` | array of objects | Each entry holds `query` (string), `filters` (object) and `at` (date). Added on every search by a logged in user. Capped at 50 entries. |
| `recommendations` | array of objects | Each entry holds `phone` (id), `reason` (string) and `at` (date). Saved when a logged in user asks for a recommendation. |
| `passwordReset` | object | Set while a password reset is pending, empty otherwise. Holds `tokenHash` and `expiresAt`. |
| `passwordReset.tokenHash` | string | The hash of the reset token that went out in the email link. We never store the token itself. |
| `passwordReset.expiresAt` | date | One hour after the reset was requested. A token older than this is refused. |

## Reviews

Collection `reviews`, model `server/src/models/Review.js`. One document per review.

| Field | Type | Notes |
|---|---|---|
| `phone` | id | The phone the review is about. |
| `user` | id | Optional. The user who wrote the review. |
| `author` | string | The name shown with the review. |
| `rating` | number | 1 to 5. |
| `text` | string | The review text. |
| `sentiment` | string | One of `positive`, `neutral` or `negative`. Judged by the model, or by the rating when the model is not configured. |

## Search logs

Collection `searchlogs`, model `server/src/models/SearchLog.js`. One document per search. Every search is written here, whether the user is logged in or not.

| Field | Type | Notes |
|---|---|---|
| `query` | string | The words the user typed. |
| `filters` | object | The filters the search ran with. When the model reads the query, the keys are `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category` and `keywords`. |
| `resultCount` | number | How many phones the search returned. |
| `user` | id | Optional. Set when the user is logged in. |

## Links between collections

`reviews.phone`, `users.favourites`, `users.recentlyViewed.phone` and `users.recommendations.phone` hold ids from `phones`. `reviews.user` and `searchlogs.user` hold ids from `users`.
