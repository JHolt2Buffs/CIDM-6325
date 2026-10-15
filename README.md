# NBA Trivia Rewards

A static HTML, CSS, and JavaScript class project where basketball fans earn quiz credits, redeem rewards, and leave feedback.

## Run locally

Run `python -m http.server 8000` from the project folder, then open `http://localhost:8000`. VS Code Live Server also works.

## Pages and quizzes

- `index.html` — Rewards Store, Prize Vault, and My Rewards.
- `quizzes.html` — Quiz selection with category/difficulty filters.
- `quiz.html` — Shared player, e.g. `quiz.html?quiz=chicago-bulls`.
- `reviews.html` — Reviews and nickname-based feedback.

Five quizzes cover Basketball Basics, NBA History, Chicago Bulls, Los Angeles Lakers, and Boston Celtics: three questions each, worth 25 credits per correct answer. Completed attempts add credits to the store.

Add teams through `js/quiz-data.js` and matching database JSON files, using consistent `quizId` and `teamId` values. All quizzes reuse the same player.

## Rewards and storage

Six digital rewards provide avatars, frames, and titles. The 900-credit Mystery Memorabilia Box offers a Mini Basketball, Basketball Collectible Pack, or Hardwood Legends Poster with equal odds (1 in 3). One claim per saved browser profile; **demo-only, nothing ships**.

Start with 1,000 credits. Balance, ownership, equipment, and claims persist in browser storage for the same site. Reviews and unfinished quizzes reset on reload. Clearing site storage resets everything, including the claim limit. Unavailable storage makes digital progress temporary and prevents mystery claims.

## MongoDB samples

MongoDB is **not connected** to the website. Import these JSON arrays into matching collections in `nba_trivia_rewards`:

| File | Collection | Documents |
| --- | --- | --- |
| `database/quizzes.json` | `quizzes` | 5 |
| `database/questions.json` | `questions` | 15 |
| `database/products.json` | `products` | 10 |

In Compass, connect to MongoDB, create the database and empty collections, then use **Add Data → Import JSON or CSV file** for each file. Import once to avoid duplicates.

AI assisted implementation and testing. Not affiliated with or endorsed by the NBA or its teams.
