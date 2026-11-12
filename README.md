# NBA Trivia Rewards

A static HTML, CSS, and JavaScript class project: choose a basketball quiz, learn from each answer, earn credits, and redeem them for profile upgrades or a prototype memorabilia reward.

## Run locally

Run `python -m http.server 8000` from the project folder, then open `http://localhost:8000`. VS Code Live Server also works.

## Pages and quizzes

- `index.html` — Rewards Store and Prize Vault.
- `quizzes.html` — Quiz selection with category/difficulty filters.
- `quiz.html` — Shared player, e.g. `quiz.html?quiz=chicago-bulls`.
- `reviews.html` — Reviews and nickname-based feedback.

Eight quizzes cover Basketball Basics, NBA History, NBA Legends, Basketball Strategy and Positions, Chicago Bulls, Los Angeles Lakers, Boston Celtics, and Oklahoma City Thunder. Each has three questions worth 25 credits each; a perfect quiz earns 75. The homepage explains the journey and shows Prize Vault progress.

Add teams through `js/quiz-data.js` and matching database JSON files, using consistent `quizId` and `teamId` values. All quizzes reuse the same player.

## Rewards and storage

Six digital rewards provide avatars, frames, and titles. The 2,500-credit Mystery Memorabilia Box has three possible contents with equal odds. It is a class-project prototype: no physical item ships. One claim per saved browser profile.

Start with 1,000 credits. Balance, ownership, equipment, and claims persist in browser storage for the same site. Reviews and unfinished quizzes reset on reload. Clearing site storage resets everything, including the claim limit. Unavailable storage makes digital progress temporary and prevents mystery claims.

## MongoDB samples

MongoDB is **not connected** to the website. Import these JSON arrays into matching collections in `nba_trivia_rewards`:

| File | Collection | Documents |
| --- | --- | --- |
| `database/quizzes.json` | `quizzes` | 8 |
| `database/questions.json` | `questions` | 24 |
| `database/products.json` | `products` | 10 |

In Compass, connect to MongoDB, create the database and empty collections, then use **Add Data → Import JSON or CSV file** for each file. Import once to avoid duplicates.

AI assisted implementation and testing. Not affiliated with or endorsed by the NBA or its teams.
