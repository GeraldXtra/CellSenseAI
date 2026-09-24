# Problem Definition

CellSense AI Portal, called CellSense AI, is our eProject for the Advanced Diploma in Software Engineering (ADSE) course at Aptech NG. The brief is the Semester 1 eProject and we are building it now that we have entered Semester 2. Our client is ASKME Ltd. This document states the problem, our proposed solution, our objectives, the scope of the work, the users of the site, and how the project covers what the brief asks for.

## 1. Problem statement

ASKME Ltd. answers customer questions through telephone support. A large share of the calls are the same five questions about phones:

1. Which model has a specific feature.
2. What the specifications of a phone are.
3. What the current price is.
4. How one phone differs from another.
5. Which phone is best within a budget.

Handling thousands of these calls by hand has three costs for ASKME:

| Cost | Why it happens |
| --- | --- |
| Support time | Every one of these calls is taken and answered by a person. |
| Staff | Thousands of calls need enough people on the phones to answer them. |
| Money | Staff time spent on the same five questions costs money. |

Ordinary phone websites show static specs and do not help people decide.

## 2. Proposed solution

We propose CellSense AI, a responsive single page web application that answers the five questions itself. A customer types a question or picks a filter and gets the answer on the page.

CellSense AI provides:

| What it provides | What it means for the customer |
| --- | --- |
| The assistant | A chat page that answers questions about phones from our own phone data. |
| Smart search | The customer can search in natural language, such as "5G phone with long battery life". |
| Personalised recommendations | The site suggests three phones that fit the customer's budget and needs, with a reason for each. |
| Side by side comparison | Two or three phones are compared in one table, with the best value marked in each row. |
| Instant phone information | Every phone page shows the specifications, the current price with the date it was checked, the price history and a plain English summary. |

The result is fewer calls for ASKME and better decisions for customers.

Our frontend is React 19 with Vite. Our backend is Node 20 with Express 5. Phone data lives in MongoDB Atlas. The AI features call a pre trained language model through an OpenAI compatible chat API. The full stack and the reasons for it are in [DESIGN-SPECIFICATIONS.md](DESIGN-SPECIFICATIONS.md).

## 3. Objectives

We have eight objectives:

1. Build an intelligent AI powered mobile information website.
2. Provide personalised smartphone recommendations.
3. Implement AI based product comparison.
4. Create an AI assistant for mobile related queries.
5. Enable smart search using natural language.
6. Provide dynamic and updated smartphone information.
7. Simplify mobile purchase decisions.
8. Demonstrate AI integration with a modern web application.

## 4. Scope

### 4.1 Features

The site has nine features.

| No. | Feature | What it does |
| --- | --- | --- |
| 1 | Recommendation | The user gives a budget, brand preference, usage purpose, camera needs, gaming needs, battery preference and performance needs. Our shortlist rules pick the phones that fit and the model ranks the top three with a reason each. |
| 2 | The assistant | Answers questions about specifications, features, prices, brand comparisons and purchase guidance from our phone data. |
| 3 | Smart search | Understands natural language such as "5G phone with long battery life". The model turns the sentence into filters and our database runs them. |
| 4 | Phone pages | Show brand, image, processor, RAM, storage, camera, battery, display, operating system and price, with a plain English summary written by the model. |
| 5 | Comparison | Compares phones from the same brand, different brands or the same price range on price, processor, RAM, storage, cameras, battery, display and refresh rate, shown as a table. |
| 6 | Personal dashboard | Shows recently viewed phones, search history, favourites and the last recommendations. |
| 7 | Price prediction and trend analysis | Computes the trend (falling, rising or stable) from the stored price history and gives a best time to buy note. It is a trend calculation, not a forecast model. |
| 8 | Browse | Filters phones by brand, price range, features and category, with Samsung, Apple, OnePlus, Xiaomi and Vivo as example brands. |
| 9 | Review summarisation | Collects user reviews, the model judges their sentiment and writes a short summary. |

### 4.2 Non functional requirements

| Requirement | What we must deliver |
| --- | --- |
| Browser support | The site works in all modern browsers. |
| Responsive layout | The site is fully responsive on desktop, tablet and mobile. |
| Security | Access and authentication are secure. |
| Speed | Pages load fast. |
| Scalability | The AI modules are scalable. |
| Design | The UI and UX are attractive. |

### 4.3 Limits of the scope

- The phone data is a sample set of about 60 phones collected by the team, not a full catalogue.
- Prices are guide prices stored with the date they were checked, not live shop prices.
- The site needs an internet connection for the database and the model.
- We do not train, build or design any machine learning or NLP model. We integrate a pre trained model through an API.

All our assumptions are listed in [ASSUMPTIONS.md](ASSUMPTIONS.md).

## 5. Users

The site has two groups of users.

### 5.1 Customers looking for a phone

Customers come to the site to choose a phone. Without logging in they can:

- search in plain English from the home page,
- browse phones by brand, price range, features and category,
- open a phone page and read its specifications, price, price history chart, reviews and summary,
- compare two or three phones in a table,
- ask the assistant,
- ask for a recommendation.

After they register and log in with an email and password they also get:

- a personal dashboard with recently viewed phones, search history, favourites and their last recommendations,
- the option to save favourites,
- the option to write a review with a rating from 1 to 5 and text,
- a password reset by email when they forget their password.

Nobody has to use the assistant. Every feature is reachable through search, filters and buttons.

### 5.2 The ASKME support team

The ASKME support team no longer answer the five phone questions by hand. Customers get those answers from CellSense AI. The result is fewer calls for the support team.

## 6. How this project covers what the brief asks for

The brief names five terms. The table says where each one lives in the site and how we implement it. We integrate a pre trained language model through an OpenAI compatible API. The model does the natural language understanding for smart search and the assistant, ranks the recommendation shortlist and explains its choices, writes the plain English spec summaries and summarises reviews. We do not train, build or design any machine learning or NLP model.

| Term in the brief | Where it lives in the site | How we implement it |
| --- | --- | --- |
| Artificial Intelligence | Smart search, the assistant, recommendations, the plain English summary on each phone page, the review summary | We integrate a pre trained language model through an OpenAI compatible API. The backend calls the model with our phone data and the person's words. We do not build or train a model. |
| Machine Learning | The ranking inside recommendations, the summaries, the review sentiment | We use the pre trained model for the parts that need learning from language. We do not train, build or design any machine learning model. |
| NLP | Smart search and the assistant | The model does the natural language understanding. It turns a sentence into filters for search and answers the assistant's questions from our phone data. We do not build an NLP model. |
| Recommendation Systems | The Recommend page and the dashboard | Our own shortlist rules (budget, brand, needs) pick the phones that fit, then the model ranks the shortlist and explains its choices. |
| Predictive Analytics | The price trend and the best time to buy note on each phone page | A trend calculation from the stored price history: falling, rising or stable, with a best time to buy note. It is not a forecast model. |

How the site is built is described in [ARCHITECTURE.md](ARCHITECTURE.md).
