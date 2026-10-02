# MongoDB Sample Collections

Database: `nba_trivia_rewards`

- **questions:** Five sample questions with their existing fields. The first three match the questions in `js/quiz.js`.
- **products:** Six sample products matching the catalog in `js/app.js`.

Run the seed files in mongosh from the project folder:

```javascript
use nba_trivia_rewards
load("database/questions.seed.js")
load("database/products.seed.js")
```

You can also run the insertion commands in MongoDB Compass's embedded shell. Run each seed once in an empty collection; running it again adds duplicate samples.

Question text, categories, difficulty, and explanations use strings. Choices are arrays of strings; answer indexes, credit rewards, and product prices use numbers.
