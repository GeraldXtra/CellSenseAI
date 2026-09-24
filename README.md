# CellSense AI Portal

CellSense AI is a phone information website built for ASKME Ltd. People come to it to search phones in plain words, read specs and prices, compare phones side by side, get a recommendation for their budget and ask an assistant questions about phones.

This is our eProject for the Advanced Diploma in Software Engineering (ADSE) at Aptech NG. The brief is the Semester 1 eProject and we are building it now that we have entered Semester 2.

## The team

- Gerald, project lead. Backend, database, the AI features, the shared parts of the site, documentation.
- Ibrahim, frontend. Home, Search results, Browse, Phone detail and About.
- Osakue, frontend. Compare, Recommend, Assistant, Dashboard and the account pages.

## The problem we are solving

ASKME Ltd. answers customer questions over the telephone. Most of the calls are about phones, and most of them are the same five questions: which phone has a certain feature, what the specs of a phone are, what it costs today, how two phones differ, and which phone is the best for a budget. Answering thousands of those calls by hand costs support time, staff and money. CellSense AI answers the same questions on a website, so people get the answer themselves and nobody has to call.

## What the site does

- Search in plain words, such as "phone under $400 with a great camera".
- Browse by brand, price range and features.
- A page for every phone with its specs, its price with the date it was checked, and a summary in plain English.
- Compare two or three phones side by side.
- Recommendations from five quick questions about budget and needs.
- An assistant that answers questions from the same phone data as the site.
- A personal dashboard with recently viewed phones, favourites and search history.
- Price history with a note on whether the price is falling, rising or steady.
- Reviews with a short summary.

## How it is built

The site runs in the browser and is built with React. It asks our server for everything it shows. The server is built with Node and Express, keeps the phones, users and reviews in MongoDB, and calls a pre trained language model when a feature needs it, for smart search, the assistant, recommendations and summaries. A job runs every night to check prices and add them to each phone's history.

When someone types "phone under $400 with a great camera", the browser sends the sentence to the server, the server asks the model to turn it into filters, looks up the matching phones in the database, and sends them back for the page to show.

Stack: React 19 with Vite, React Router, Bootstrap 5 and plain CSS; Node 20 with Express 5; MongoDB Atlas with Mongoose; JWT login with bcrypt; an OpenAI compatible chat API; node-cron; Nodemailer.

## Where we are

The designs are finished and the project structure is in place. We are building the backend and the pages now, then the mobile layouts, then the report, the test data and the demo video.
