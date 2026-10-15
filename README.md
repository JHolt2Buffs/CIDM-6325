# NBA Trivia Rewards

A static basketball trivia and rewards prototype for CIDM-6325 Project Deliverable 2. Fans can choose a general or team challenge, earn virtual credits, customize a profile, claim a prototype mystery reward, and leave feedback. Built with HTML, CSS, and vanilla JavaScript; no framework, authentication, payments, or backend is required.

## Run locally

Serve the project folder with a local web server, such as VS Code Live Server. With Python installed, run:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. Keep the same browser and site address to retain saved rewards. Opening `index.html` directly may work, but browser storage behavior for local files varies.

## Pages and quizzes

- `index.html` — Rewards Store, Prize Vault, profile preview, and My Rewards.
- `quizzes.html` — Quiz selection with category and difficulty filters.
- `quiz.html` — Reusable player; for example, `quiz.html?quiz=chicago-bulls`.
- `reviews.html` — Sample reviews, nickname-based feedback, and rating summary.

Five quizzes are available: Basketball Basics, NBA History, Chicago Bulls Challenge, Los Angeles Lakers Challenge, and Boston Celtics Challenge. Each currently has three questions worth 25 credits each. The player calculates question counts, progress, and maximum credits from the selected questions. Completed attempts credit the store once; replaying can earn more. A link without a quiz ID defaults to Basketball Basics; unknown or inactive IDs show a return link.

`js/quiz-data.js` holds the shared quiz and question catalog. Add future teams by adding quiz metadata and questions with matching `quizId` and `teamId`, then updating the matching JSON collections. No additional player pages are needed. `js/quizzes.js` handles selection and filters; `js/quiz.js` handles play and scoring.

## Rewards and Prize Vault

The store keeps the six digital rewards: two avatars, two profile frames, and two titles. Redeeming deducts credits and equips the product; equipping something already owned costs nothing. `js/reward-data.js` supplies product definitions to the store and saved-state validator. `js/app.js` handles store and review interactions; `css/styles.css` is shared by all pages.

The Legendary Mystery Memorabilia Box costs **900 credits**, with one claim per saved browser profile. Mini Basketball, Basketball Collectible Pack, and Hardwood Legends Poster each have a **1 in 3 chance**. Contents are disclosed before confirmation and cannot be redeemed individually. My Rewards shows equipped products and the claimed surprise.

This is a **class-project prototype**: every mystery claim has `fulfillmentStatus: "demo-only"`; nothing is shipped. There is no checkout, address collection, or monetary purchase. Physical-product `shippingRequired` fields describe a potential future fulfillment model only; `stockQuantity: null` means real inventory is not modeled. The new memorabilia illustrations are original SVG artwork.

## Browser storage

`js/rewards-state.js` uses the localStorage key `nbaTriviaRewardsState` with `creditBalance`, `ownedProducts`, `equippedAvatar`, `equippedFrame`, `equippedTitle`, and `claimedPhysicalRewards`. Earlier saved profiles remain compatible; missing claims default to an empty array. A new profile starts with 1,000 credits.

Balances, owned/equipped products, and claims persist across navigation and refreshes. Reviews and unfinished quiz attempts reset on reload. If browser storage is blocked or full, digital interactions work only within the current page and mystery claims are rejected without spending credits.

Clear this site's browser storage to reset the demo, including its one-box limit. The limit is a browser-local prototype behavior, not an account-level entitlement; it does not follow users between browsers or devices.

## MongoDB sample collections

MongoDB is **not connected** to the website and does not provide persistence. These readable JSON arrays are separate import samples:

| File | Collection | Documents |
| --- | --- | --- |
| `database/quizzes.json` | `quizzes` | 5 |
| `database/questions.json` | `questions` | 15 |
| `database/products.json` | `products` | 10 |

The ten products comprise six digital rewards, three mystery-box contents, and one box. Only the seven directly redeemable products appear as store cards. Question `quizId` values link to quiz metadata; team questions also carry `teamId`. Front-end and JSON catalog values match, with `null` for inapplicable product fields.

To demonstrate the collections in MongoDB Compass:

1. Connect Compass to your MongoDB deployment and create the database `nba_trivia_rewards` with empty `quizzes`, `questions`, and `products` collections.
2. Open each collection, choose **Add Data → Import JSON or CSV file**, and select its matching JSON file.
3. Choose JSON and import once into each empty collection to avoid duplicate samples. Compass supplies `_id` values.

See the [official Compass import guide](https://www.mongodb.com/docs/compass/import-export/) for the import controls. No MongoDB connection settings or credentials belong in this static application.

## Development checks and references

Optional regression checks use Node's built-in test utilities; they are not part of the website runtime:

```sh
node tests/rewards-state.test.cjs
node tests/catalog.test.cjs
```

These check saved-state compatibility, invalid storage, duplicate claims, failure recovery, JSON parsing, catalog consistency, and referenced product assets. Browser checks cover navigation, quizzes, store and review interactions, dialogs, and mobile/tablet/desktop layouts.

Trivia references include the [NBA scoring rules](https://official.nba.com/rule-no-5-scoring-and-timing/), [1979–80 season review](https://www.nba.com/news/history-season-review-1979-80), [Lakers season history](https://www.nba.com/lakers/history/season-capsule), and [Celtics' Bill Russell tribute](https://www.nba.com/celtics/russell).

AI assistance supported implementation and test preparation, including the shared browser-storage approach connecting quiz earnings to store rewards. This project is not affiliated with or endorsed by the NBA or its teams.
