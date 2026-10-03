# NBA Trivia Rewards

A three-page basketball trivia and rewards prototype for CIDM-6325 Assignment 3, built with HTML, CSS, and vanilla JavaScript.

## Open the website

Open `index.html` in a browser. Keep the HTML files and supporting folders together. For consistent shared storage across pages, use a local web server such as VS Code Live Server; storage behavior for files opened directly can vary by browser.

## Features

- **Rewards store:** Browse six avatars, frames, and titles. Redeem them using a starting balance of 1,000 virtual credits and equip them on a live profile preview.
- **Daily quiz:** Answer three questions, read explanations, and view your score. Each correct answer earns 25 credits, added to the shared rewards-store balance once the attempt is completed. Replaying can earn more credits.
- **Reviews:** Read two sample reviews and submit feedback with a rating and recommendation.
- Responsive layouts, keyboard controls, and clear feedback messages.

The balance, owned rewards, and equipped avatar, frame, and title persist across navigation and refreshes through browser storage (`nbaTriviaRewardsState`). Clear the site's browser storage to reset the demo to 1,000 credits. Storage is specific to the browser and site address; if storage is blocked or full, progress lasts only on the current page. Reviews and unfinished quiz attempts reset on reload.

## Files

```text
index.html                   Rewards store
quiz.html                    Three-question quiz
reviews.html                 Reviews and feedback
css/styles.css               Shared styles
js/app.js                    Store and review interactions
js/quiz.js                   Quiz questions and scoring
js/rewards-state.js          Shared browser storage for rewards
images/                      Logo and product images
database/questions.json      Five sample question documents
database/products.json       Six sample product documents
```

MongoDB is not connected to the website and does not provide its persistence. The JSON collections remain separate sample data; import `database/questions.json` and `database/products.json` into the `questions` and `products` collections in MongoDB Compass.
