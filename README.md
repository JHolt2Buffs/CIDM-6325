# NBA Trivia Rewards

NBA Trivia Rewards is a full-stack web application where basketball fans complete trivia quizzes, earn credits, and redeem those credits for digital profile items or a prototype Mystery Memorabilia Box.

I built the project to create a clear customer journey from playing trivia to earning and redeeming rewards. The application uses an automatically generated anonymous profile, so no registration or personal information is required.

## Main Features

- Eight basketball quizzes with 24 total questions
- General and team-specific quiz categories
- Immediate answer feedback and explanations
- Server-calculated scores and credit awards
- Persistent credit balances and anonymous profiles
- Redeemable avatars, profile frames, and titles
- Prototype Mystery Memorabilia Box
- Persistent reviews and ratings
- Responsive and keyboard-accessible interface

## Technology

- HTML, CSS, and vanilla JavaScript
- Node.js and Express
- MongoDB
- Fetch API
- REST-style API routes
- Server-side validation

The application follows this basic structure:

```
Browser → Express API → MongoDB
```

Quiz scoring, credit awards, product redemption, and Mystery Box claims are processed by the server and saved in MongoDB.

## Requirements

Install the following before running the project:

- Node.js 20.19 or later
- MongoDB Community Server
- A modern web browser

MongoDB Compass is optional but useful for viewing the database.

## Running the Project

Open a terminal in the project folder and install the dependencies:

```
npm install
```

Copy `.env.example` and name the copy `.env`.

The default configuration is:

```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=nba_trivia_rewards
```

Make sure MongoDB is running, and then seed the database:

```
npm run seed
```

Start the application:

```
npm start
```

For development with automatic restarts:

```
npm run dev
```

Open the application at:

```
http://localhost:3000
```

Do not open the HTML files directly because the application requires Express and MongoDB.

## Database

The application uses these MongoDB collections:

- `quizzes`
- `questions`
- `products`
- `reviews`
- `profiles`
- `quizAttempts`

The initial seed contains:

- 8 quizzes
- 24 questions
- 10 products
- 2 sample reviews

Profiles and quiz attempts are created as the application is used.

To view the database in MongoDB Compass, connect to:

```yaml
mongodb://127.0.0.1:27017
```

Then open the `nba_trivia_rewards` database.

## Verification

After starting the application, confirm that:

1. All eight quizzes appear.
2. Completing a quiz increases the credit balance.
3. The balance remains after refreshing the page.
4. Digital rewards can be redeemed and equipped.
5. Submitted reviews remain after refreshing.

The server health check is available at:

```
http://localhost:3000/api/health
```

If the latest quizzes or sample data do not appear, run `npm run seed` again and refresh the browser.

## Prototype Limitations

This is a class-project prototype. It does not include payment processing, shipping, password-based accounts, or real prize fulfillment. The Mystery Memorabilia Box demonstrates the planned reward experience, but no physical product is shipped.

This project is not affiliated with or endorsed by the NBA or any NBA team.
