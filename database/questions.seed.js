"use strict";

// Run in mongosh after selecting: use nba_trivia_rewards
// Run once in an empty collection; rerunning adds duplicate sample documents.

db.questions.insertMany([
  {
    questionId: "question-001",
    questionText: "How many points is a successful free throw worth?",
    category: "Rules",
    difficulty: "Easy",
    choices: [
      "1 point",
      "2 points",
      "3 points",
      "4 points"
    ],
    correctAnswerIndex: NumberInt(0),
    explanation: "A successful free throw adds one point to the team's score.",
    creditReward: NumberInt(25),
    active: true,
    imagePath: null
  },
  {
    questionId: "question-002",
    questionText: "How many players from one team are normally on the court at one time?",
    category: "Rules",
    difficulty: "Easy",
    choices: [
      "4 players",
      "5 players",
      "6 players",
      "7 players"
    ],
    correctAnswerIndex: NumberInt(1),
    explanation: "Each team normally has five active players on the court.",
    creditReward: NumberInt(25),
    active: true,
    imagePath: null
  },
  {
    questionId: "question-003",
    questionText: "Which team won the 1996 NBA Finals?",
    category: "NBA History",
    difficulty: "Medium",
    choices: [
      "Utah Jazz",
      "Phoenix Suns",
      "Chicago Bulls",
      "Houston Rockets"
    ],
    correctAnswerIndex: NumberInt(2),
    explanation: "The Chicago Bulls defeated the Seattle SuperSonics in the 1996 NBA Finals.",
    creditReward: NumberInt(25),
    active: true,
    imagePath: null
  },
  {
    questionId: "question-004",
    questionText: "Which franchise selected Kobe Bryant in the 1996 NBA Draft before trading him to the Los Angeles Lakers?",
    category: "Draft History",
    difficulty: "Medium",
    choices: [
      "Charlotte Hornets",
      "Boston Celtics",
      "Chicago Bulls",
      "New York Knicks"
    ],
    correctAnswerIndex: NumberInt(0),
    explanation: "The Charlotte Hornets selected Kobe Bryant and traded his rights to the Los Angeles Lakers.",
    creditReward: NumberInt(25),
    active: false,
    imagePath: null
  },
  {
    questionId: "question-005",
    questionText: "How many seconds are on the NBA shot clock?",
    category: "Rules",
    difficulty: "Easy",
    choices: [
      "20 seconds",
      "24 seconds",
      "30 seconds",
      "35 seconds"
    ],
    correctAnswerIndex: NumberInt(1),
    explanation: "NBA teams normally have 24 seconds to attempt a shot.",
    creditReward: NumberInt(25),
    active: false,
    imagePath: null
  }
]);
