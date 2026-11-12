"use strict";

const { randomUUID } = require("node:crypto");
const { fail } = require("../errors");
const { slug, uuid, selectedIndex } = require("../validation");

function createAttemptService(database) {
  const attempts = database.collection("quizAttempts");
  const profiles = database.collection("profiles");
  const quizzes = database.collection("quizzes");
  const questions = database.collection("questions");

  async function getAttempt(attemptId, profileId) {
    uuid(attemptId, "Attempt ID");
    uuid(profileId, "Profile ID");
    const attempt = await attempts.findOne({ attemptId, profileId });
    if (!attempt) fail(404, "ATTEMPT_NOT_FOUND", "This quiz attempt was not found.");
    return attempt;
  }

  return {
    async start(profileId, quizId) {
      uuid(profileId, "Profile ID");
      slug(quizId, "Quiz ID");
      if (!await profiles.findOne({ profileId })) fail(404, "PROFILE_NOT_FOUND", "This profile no longer exists.");
      const quiz = await quizzes.findOne({ quizId, active: true }, { projection: { _id: 0 } });
      if (!quiz) fail(404, "QUIZ_NOT_FOUND", "This quiz is unavailable.");
      const assigned = await questions.find({ quizId, active: true }).sort({ _id: 1 }).toArray();
      if (!assigned.length) fail(409, "QUIZ_UNAVAILABLE", "This quiz has no available questions.");
      const attemptId = randomUUID();
      await attempts.insertOne({
        attemptId, profileId, quizId,
        questionIds: assigned.map((question) => question.questionId),
        answers: [], status: "in-progress", earnedCredits: 0,
        startedAt: new Date(), completedAt: null, creditsAwardedAt: null
      });
      return {
        attemptId, quiz,
        questions: assigned.map(({ questionId, questionText, category, difficulty, choices, creditReward }) =>
          ({ questionId, questionText, category, difficulty, choices, creditReward }))
      };
    },

    async answer(attemptId, profileId, questionId, choice) {
      const attempt = await getAttempt(attemptId, profileId);
      if (attempt.status !== "in-progress") fail(409, "ATTEMPT_COMPLETE", "This quiz is already complete.");
      slug(questionId, "Question ID");
      const expectedId = attempt.questionIds[attempt.answers.length];
      if (questionId !== expectedId) fail(409, "QUESTION_ORDER", "Answer the current question first.");
      const question = await questions.findOne({ questionId, quizId: attempt.quizId });
      if (!question) fail(409, "QUESTION_UNAVAILABLE", "This question is unavailable.");
      selectedIndex(choice, question.choices.length);
      const correct = choice === question.correctAnswerIndex;
      const earnedCredits = correct ? question.creditReward : 0;
      const saved = await attempts.updateOne(
        { attemptId, profileId, status: "in-progress", "answers.questionId": { $ne: questionId }, answers: { $size: attempt.answers.length } },
        { $push: { answers: { questionId, selectedIndex: choice, correct, earnedCredits, answeredAt: new Date() } } }
      );
      if (!saved.modifiedCount) fail(409, "ANSWER_ALREADY_SUBMITTED", "This answer was already submitted. Refresh to start a new quiz.");
      return { questionId, correct, correctAnswerIndex: question.correctAnswerIndex, explanation: question.explanation, earnedCredits };
    },

    async complete(attemptId, profileId) {
      const attempt = await getAttempt(attemptId, profileId);
      if (attempt.answers.length !== attempt.questionIds.length) fail(409, "ATTEMPT_INCOMPLETE", "Answer every question before finishing.");
      const score = attempt.answers.filter((answer) => answer.correct).length;
      const earnedCredits = attempt.answers.reduce((sum, answer) => sum + answer.earnedCredits, 0);
      const updated = await profiles.updateOne(
        { profileId, awardedAttemptIds: { $ne: attemptId } },
        { $inc: { creditBalance: earnedCredits }, $addToSet: { awardedAttemptIds: attemptId }, $set: { updatedAt: new Date() } }
      );
      if (!updated.modifiedCount && !await profiles.findOne({ profileId })) fail(404, "PROFILE_NOT_FOUND", "This profile no longer exists.");
      await attempts.updateOne(
        { attemptId, status: "in-progress" },
        { $set: { status: "completed", earnedCredits, completedAt: new Date(), creditsAwardedAt: new Date() } }
      );
      const profile = await profiles.findOne({ profileId }, { projection: { _id: 0 } });
      return {
        attemptId, score, totalQuestions: attempt.questionIds.length,
        accuracy: Math.round(score / attempt.questionIds.length * 100),
        earnedCredits, balance: profile.creditBalance, profile
      };
    }
  };
}

module.exports = { createAttemptService };
