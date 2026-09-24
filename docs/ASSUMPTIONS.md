# Assumptions

These assumptions go into the ReadMe.doc that ships with the zip.

1. Our phone data is a sample set of about 60 phones that we collected. It is not a full catalogue.
2. Prices are stored with the date we checked them. They are guide prices, not live shop prices.
3. When a user searches for a phone we do not have, the model supplies its specifications. We mark those records with source `ai` and show them with a note.
4. The price updater runs once a day. Its price source can be a lookup through the model, a price API or manual entry, and each history entry says which one was used.
5. Price prediction uses the stored price history. With a short history the trend is a simple comparison of recent prices, not a forecast.
6. Reviews are written by users of the site. Sentiment is judged by the model, or by the star rating when the model is not configured.
7. The site needs an internet connection for the database and the model.
8. Authentication uses email and password with JWT tokens that expire after seven days.
9. Password reset works by email. The reset link expires after one hour.
10. We use a pre trained language model through an API. We do not train our own models. The brief asks for AI integration and that is what we built.
