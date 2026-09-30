# Assumptions

These assumptions go into the ReadMe.doc that ships with the zip. Items 1 to 10 are about the project as a whole. Items 11 to 15 are rules we chose while building the backend.

1. Our phone data is a sample set that we collect ourselves. It is not a full catalogue. Today it holds six phones, and we aim for about 60.
2. Prices are stored with the date we checked them. They are guide prices, not live shop prices.
3. When a user searches for a phone we do not have, the model supplies its specifications. We mark those records with source `ai` and show them with a note. This step is planned and not built yet.
4. The price updater runs once a day. Its price source can be a lookup through the model, a price API or manual entry, and each history entry says which one was used. The price updater is planned and not built yet.
5. Price prediction uses the stored price history. With a short history the trend is a simple comparison of recent prices, not a forecast.
6. Reviews are written by users of the site. For now the sentiment of a review is set from its stars: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative. Judging it from the text with the model is planned.
7. The site needs an internet connection for the database and the model.
8. Authentication uses email and password with JWT tokens that expire after seven days.
9. Password reset works by email. The reset link expires after one hour. Password reset is planned and not built yet.
10. We integrate a pre trained language model through an OpenAI compatible chat API that is set in `server/.env`. We do not train our own models. The brief asks for AI integration and that is what we built.
11. One review per person per phone. A person who has reviewed a phone cannot post a second review of the same phone.
12. The price trend compares the latest price with the oldest price in the 90 days before it. The threshold is two percent: two percent lower or more is falling, two percent higher or more is rising, and anything in between is stable.
13. A search query goes to the model when it reads like a sentence. That means four words or more, a dollar sign or a number of three digits or more, or a word such as under, with, best, cheap, camera or battery. A short name such as "samsung" is matched directly against brand and model, and goes to the model only when that match finds nothing.
14. The six phones in `server/data/phones.json` hold sample prices. Their prices and their four price checks each are sample values, not prices we checked in a shop.
15. Without the AI settings in `server/.env`, the site still searches directly. It matches the words against brand and model and never calls the model.
