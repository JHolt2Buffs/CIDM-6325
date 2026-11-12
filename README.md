# NBA Trivia Rewards

Basketball fans choose from eight quizzes, earn credits for correct answers, customize a profile, and leave reviews. A 2,500-credit Mystery Memorabilia Box reveals a random physical basketball collectible **(prototype)**. This class project does not ship items and is not affiliated with the NBA or its teams. AI assisted implementation and testing.

## Run locally

Install **Node.js 20.19+** and **MongoDB Community Server**; start MongoDB. MongoDB Compass is optional for inspecting the data.

```bash
npm install
cp .env.example .env       # Windows Command Prompt: copy .env.example .env
npm run seed
npm start
```

Open **http://localhost:3000**. Edit `.env` to change the port, MongoDB URI, or database name. Use `npm run dev` for automatic server restarts. If startup fails, check that MongoDB is running and that `.env` points to it.

## Data and checks

`npm run seed` idempotently loads 8 quizzes, 24 questions, 10 products, and 2 sample reviews from `database/*.json` into matching MongoDB collections. The server also stores `profiles` and `quizAttempts`. Run `npm test` and `npm run check`; set `MONGODB_TEST_URI=mongodb://127.0.0.1:27017` to include the isolated MongoDB integration test (Windows Command Prompt: `set MONGODB_TEST_URI=mongodb://127.0.0.1:27017 && npm test`).

The browser stores only an anonymous profile ID. The server owns credits, answers, purchases, equipment, claims, and reviews. A first server-backed visit creates a fresh 1,000-credit profile; old browser-only balances are not imported. Clear this site's browser storage to start a new profile; the previous MongoDB profile remains. Unfinished quiz attempts reset on refresh. If browser storage is blocked, the profile lasts only for the current page session.

The Express API provides `/api/health`, `/api/quizzes`, `/api/products`, `/api/profiles`, `/api/quiz-attempts`, and `/api/reviews`. The pages in `public/` use these endpoints; opening HTML files directly will not work.
