# The data files

This folder holds the two data files of the backend. Gerald owns both.

`phones.json` holds the 60 phones the seed loads, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo. It is a JSON array with one object per phone: `brand`, `model`, `category`, `releaseYear`, `imageUrl`, `specs`, `price`, `priceHistory` and `aiSummary`. The slug is not in the file; the seed builds it from the brand and the model, with a plus sign written as plus. Every `imageUrl` is `/phones/<slug>.png`, the path of the phone's picture file in `client/public/phones/`. When that file is missing, the site shows a grey placeholder with the phone name. Six phones carry four monthly price checks from 1 June to 1 September 2026, and the other 54 carry one check dated 1 October 2026. Only the Galaxy S24 has a filled `aiSummary`; the model writes the others the first time each phone page opens with the AI settings filled.

`npm run seed` loads `phones.json` into MongoDB. It adds the phones that are missing and refreshes the names, category, release year, specs, image paths and, where the file has one, the summary of the others. It never changes a price or a price history that is already in the database, and it never removes a phone. The seed is safe, but only Gerald runs it.

`prices.json` is the price list: a `checkedOn` date and guide prices in US dollars for the phone slugs it lists. The nightly price check, and `npm run prices` by hand, record each price with that date for every listed phone whose last check is older, and skip the rest. To record new prices, Gerald writes the new date and the new prices into this file. Only Gerald runs `npm run prices`.
