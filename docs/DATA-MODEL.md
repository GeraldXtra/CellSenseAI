# Data model

This file describes the four collections that CellSense AI stores in MongoDB Atlas, field by field, as the Mongoose schemas define them. Each collection has a model file in `server/src/models/`: `Phone.js`, `User.js`, `Review.js` and `SearchLog.js`. We chose documents over fixed table columns because phone specs are uneven from one phone to the next. The endpoints that read and write these collections are in [API.md](API.md).

## Units

We state the units once here and do not repeat them in the tables. RAM and storage are in GB. Cameras are in megapixels. Battery is in mAh. Display size is in inches. Refresh rate is in Hz. Prices are in US dollars, the only currency the backend writes.

## How to read the tables

The type column uses string, number, boolean, date, id, mixed, object and array. A field of type id holds the id of a document in another collection. A mixed field holds any JSON value. A field name with a dot, such as `specs.ram`, is a field nested inside an object.

Every document in the four collections also has `_id`, the id MongoDB gives it, and the two dates `createdAt` and `updatedAt`, which Mongoose fills in. We do not repeat them in the tables. Entries inside the arrays `priceHistory`, `recentlyViewed`, `searchHistory` and `recommendations` have no `_id` of their own.

## The slug

Every phone has a slug, built from the brand and the model by `Slugify` in `server/src/utils/slug.js`. The rule has four steps:

1. Join the brand and the model with a space and write it in lowercase.
2. Write every plus sign as the word plus.
3. Turn every run of characters that are not a letter from a to z or a digit into one hyphen.
4. Remove the hyphens at both ends.

| Brand and model | Slug |
| --- | --- |
| Samsung Galaxy S24 | `samsung-galaxy-s24` |
| Samsung Galaxy S24+ | `samsung-galaxy-s24-plus` |
| Xiaomi Redmi Note 13 Pro+ | `xiaomi-redmi-note-13-pro-plus` |
| Apple iPhone SE (2022) | `apple-iphone-se-2022` |
| OnePlus 12 | `oneplus-12` |

The seed script and the search lookup build slugs this way. The slug names the phone in the page address `/phones/:slug`, in the price list `server/data/prices.json`, and in the picture file `client/public/phones/<slug>.png`.

## Phones

Collection `phones`, model `server/src/models/Phone.js`. One document per phone. The seed loads the 60 phones in `server/data/phones.json`, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo, and search can add more with source `ai`.

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | Required and unique. Built by the rule above. |
| `brand` | string | Required, trimmed. The maker, such as Samsung. Indexed, because the lists filter on it. |
| `model` | string | Required, trimmed. The name without the brand, such as Galaxy S24. |
| `imageUrl` | string | The path of the phone picture. Empty by default. Every seed phone has `/phones/<slug>.png`, the address of its picture file in `client/public/phones/`. When the path is empty or the file is missing, the site shows a grey placeholder with the phone name. A phone added by the model has no path. |
| `category` | string | One of `budget`, `midrange`, `flagship`, `gaming` or `camera`. The default is `midrange`. |
| `releaseYear` | number | The year the phone came out. |
| `specs.processor` | string | The processor name. |
| `specs.ram` | number | Memory size. |
| `specs.storage` | number | Storage size. |
| `specs.mainCamera` | number | Main camera resolution. |
| `specs.frontCamera` | number | Front camera resolution. |
| `specs.battery` | number | Battery capacity. |
| `specs.displaySize` | number | Display size. |
| `specs.displayType` | string | Display type, such as AMOLED. |
| `specs.refreshRate` | number | Display refresh rate. |
| `specs.os` | string | Operating system. |
| `specs.has5G` | boolean | True when the phone supports 5G. The default is false. |
| `price.current` | number | The current guide price. Guide prices are not live shop prices. Indexed, because the lists filter and sort on it. The schema does not mark it as required, but every phone the seed or the search lookup saves has one. |
| `price.currency` | string | The default is `USD`, and the backend writes no other value. |
| `price.updatedAt` | date | The date the price was last checked. The default is the moment the phone is saved. The seed sets it to the date of the last price check in the file, and the price check sets it to the date of the price list. The phone page design shows it next to the price. |
| `priceHistory` | array of objects | One entry per price check, oldest first. Each entry holds `price` (number, required), `date` (date, default now) and `source` (string, one of `seed`, `ai`, `api` or `manual`, default `seed`). The seed writes `seed` entries from the file. The price check appends a `manual` entry from the price list. A phone added by the model starts with one `ai` entry. The schema allows `api`, and no code writes it. The price trend is worked out from this array. |
| `aiSummary` | string | One or two plain sentences about who the phone suits. Empty by default. The model writes it the first time the phone page opens with the AI settings filled, and it is kept from then on. The Galaxy S24 brings its summary from the seed file, and a phone added by the model gets one when it is added. |
| `reviewSummary.text` | string | The summary of the reviews written by the model. Empty by default. |
| `reviewSummary.sentiment` | string | The overall mood the model judged: `positive`, `neutral` or `negative`. The default is `neutral`. |
| `reviewSummary.count` | number | How many reviews the saved summary covers. The default is 0. The saved summary is reused while the phone has exactly that many reviews, and written again when the number changes. A star based summary is never saved here. |
| `source` | string | One of `seed`, `ai` or `admin`. The default is `seed`. `seed` phones come from the seed file. `ai` phones were added by the model during a search, and the pages show their price with the Estimated label. The schema allows `admin`, and no code writes it. |

## Users

Collection `users`, model `server/src/models/User.js`. One document per account.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required, trimmed. Shown in the top bar and copied onto each review the user writes. |
| `email` | string | Required and unique, trimmed and stored in lowercase. Used to log in. |
| `passwordHash` | string | Required. The bcrypt hash of the password. We never store the password itself. The model leaves this field out of every query unless the code asks for it, so it never reaches a reply. |
| `role` | string | `user` or `admin`. The default is `user`. The login token carries it. Every account made on the site is a `user`, and no route treats the two differently. |
| `favourites` | array of ids | The phones the user saved, each once, in the order they were saved. The replies show the latest first. |
| `recentlyViewed` | array of objects | Each entry holds `phone` (id) and `viewedAt` (date, default now). Newest first, one entry per phone, at most 20. Opening a phone page while logged in moves the phone to the top. |
| `searchHistory` | array of objects | Each entry holds `query` (string), `filters` (mixed) and `at` (date, default now). Newest first, at most 50. Every search by a logged in user adds an entry at the top. |
| `recommendations` | array of objects | Each entry holds `phone` (id), `reason` (string) and `at` (date, default now). The picks of the user's last recommendation, up to three. Each recommendation the user asks for while logged in replaces the list, as long as it found at least one phone. |
| `passwordReset.tokenHash` | string | The `sha256` hash of the reset token in the email link. We never store the token itself. |
| `passwordReset.expiresAt` | date | One hour after the reset was asked for. A token past this time is refused. |

`passwordReset` is set by forgot password, replaced by the next request, and removed by a successful reset, so each link works once. A reply never holds the whole user document: the model method `toSafeJSON` returns only `_id`, `name`, `email` and `role`.

## Reviews

Collection `reviews`, model `server/src/models/Review.js`. One document per review.

| Field | Type | Notes |
| --- | --- | --- |
| `phone` | id | Required. The phone the review is about. Indexed, because reviews are always read by phone. |
| `user` | id | Required. The account that wrote the review. |
| `author` | string | Required, trimmed. The name shown with the review, copied from the account when the review is posted. |
| `rating` | number | Required, from 1 to 5. The route also requires a whole number. |
| `text` | string | Required, trimmed, at most 1000 characters. The route also requires at least 3. |
| `sentiment` | string | One of `positive`, `neutral` or `negative`. The default is `neutral`. With the AI settings filled the model judges it from the text. Otherwise, or when the model fails, the stars decide: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative. |

A unique index on `phone` and `user` together allows one review per person per phone. The route checks first and answers 409 with "You have already reviewed this phone".

## Search logs

Collection `searchlogs`, model `server/src/models/SearchLog.js`. One document per search, whether the person is logged in or not.

| Field | Type | Notes |
| --- | --- | --- |
| `query` | string | Required. The words the person typed, trimmed and cut to 200 characters. |
| `filters` | mixed | The filters the search ran with. A direct search stores `{ q }` with the query in it. When the model reads the query, the keys can be `brand`, `minPrice`, `maxPrice`, `has5G`, `minRam`, `minStorage`, `minCamera`, `minBattery`, `minRefresh`, `category`, `sort` and `q`. |
| `source` | string | Required. `direct` when the words were matched against brand and model, `ai` when the model turned the query into filters. |
| `resultCount` | number | How many phones the search returned. The default is 0. |
| `user` | id | Set when the person is logged in, empty otherwise. |

## Links between collections

`reviews.phone`, `users.favourites`, `users.recentlyViewed.phone` and `users.recommendations.phone` hold ids from `phones`. `reviews.user` and `searchlogs.user` hold ids from `users`.
