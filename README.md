# NBA Trivia Rewards

A three-page basketball trivia and rewards prototype for CIDM-6325 Assignment 3, built with HTML, CSS, and vanilla JavaScript.

## Open the website

Open `index.html` in a browser. No installation, server, or build process is needed. Keep the HTML files and supporting folders together.

## Features

- **Rewards store:** Browse six avatars, frames, and titles. Redeem them using a starting balance of 1,000 virtual credits and equip them on a live profile preview.
- **Daily quiz:** Answer three questions, read explanations, and view your score and demo credits. Each correct answer earns 25 demo credits, which do not transfer to the store.
- **Reviews:** Read two sample reviews and submit feedback with a rating and recommendation.
- Responsive layouts, keyboard controls, and clear feedback messages.

Demo progress resets on a fresh page load.

## Files

```text
index.html                   Rewards store
quiz.html                    Three-question quiz
reviews.html                 Reviews and feedback
css/styles.css               Shared styles
js/app.js                    Store and review interactions
js/quiz.js                   Quiz questions and scoring
images/                      Logo and product images
database/questions.seed.js   Five sample question documents
database/products.seed.js    Six sample product documents
database/README.md           Sample data setup
```

MongoDB is not connected to the website yet. See the [database guide](database/README.md) to load the sample documents separately.
