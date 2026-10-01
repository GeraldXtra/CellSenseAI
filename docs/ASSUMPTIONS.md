# Assumptions

These assumptions go into the ReadMe.doc that ships with the zip. Items 1 to 10 are about the project as a whole. Items 11 to 15 are rules we chose while building the backend.

1. Our phone data is a set of 60 phones that we collect ourselves, 12 each for Samsung, Apple, OnePlus, Xiaomi and Vivo. It is not a full catalogue.
2. Prices are guide prices in US dollars, stored with the date we checked them. They are not live shop prices.
3. When a user searches for a phone we do not have, the model supplies its specifications, a guide price and a short summary. We save the phone with source `ai` and show it with a note and an "Estimated" label, because those values are estimates.
4. The price check runs once a day, at 02:00 Lagos time. Its prices come from a price list we keep by hand in `server/data/prices.json`, with the date of the check. Each price history entry records where its price came from: `seed` for the phone file, `manual` for the price list and `ai` for the first price of a phone the model added.
5. Price prediction uses the stored price history. The trend is a comparison of recent prices, not a forecast.
6. Reviews are written by users of the site. With the AI settings in place, the model judges the sentiment of each review from its text. Without them, the stars set it: 4 or 5 is positive, 3 is neutral, 1 or 2 is negative.
7. The site needs an internet connection for the database and the model.
8. Authentication uses email and password with JWT tokens that expire after seven days.
9. Password reset works by email. The reset link expires after one hour and works once. Without mail settings, the server prints the link in its terminal instead of sending it.
10. We integrate a pre trained language model through an OpenAI compatible chat API that is set in `server/.env`. We use Groq with the model `openai/gpt-oss-120b`. We do not train our own models. The brief asks for AI integration and that is what we built.
11. One review per person per phone. A person who has reviewed a phone cannot post a second review of the same phone.
12. The price trend compares the latest price with the oldest price in the 90 days before it, or with the check just before it when no other check falls in those 90 days. The threshold is two percent: two percent lower or more is falling, two percent higher or more is rising, and anything in between is stable.
13. A search query goes to the model when it reads like a sentence. That means four words or more, a dollar sign or a number of three digits or more, or a word such as under, with, best, cheap, camera or battery. A short name such as "samsung" is matched directly against brand and model, and goes to the model only when that match finds nothing.
14. The prices in `server/data/phones.json` and `server/data/prices.json` are guide prices we set ourselves, not prices we checked in a shop. Six phones carry four monthly price checks from June to September 2026, so the trend has a history to work on. The other 54 start with one check dated 1 October 2026.
15. Without the AI settings in `server/.env`, the site still works. Search matches the words against brand and model, the assistant says that the AI features are not set up, recommendations come with reasons from our own rules, and review summaries and review moods come from the stars.
