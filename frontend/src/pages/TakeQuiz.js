import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";

const TakeQuiz = () => {
  const { id } = useParams(); // lecture id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lecture, setLecture] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== "student") {
      navigate("/dashboard");
      return;
    }
    fetchQuizData();
  }, [id, user.role, navigate]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [lectureRes, quizzesRes] = await Promise.all([
        axios.get(`/api/lectures/${id}`),
        axios.get(`/api/quizzes/lecture/${id}`),
      ]);

      setLecture(lectureRes.data.lecture);
      setQuizzes(quizzesRes.data.quizzes);
      setAnswers(new Array(quizzesRes.data.quizzes.length).fill(null));
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      toast.error("Failed to load quiz");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuizIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuizIndex < quizzes.length - 1) {
      // Move to next question
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(newAnswers[currentQuizIndex + 1]);
    } else {
      // Show results
      calculateScore(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setSelectedAnswer(answers[currentQuizIndex - 1]);
    }
  };

  const calculateScore = (finalAnswers) => {
    let correct = 0;
    quizzes.forEach((quiz, index) => {
      if (finalAnswers[index] === quiz.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Array(quizzes.length).fill(null));
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!lecture || quizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Quiz Available
          </h2>
          <p className="text-gray-600 mb-6">
            No quiz questions are available for this lecture.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  // Results View
  if (showResults) {
    const percentage = Math.round((score / quizzes.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  passed ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                {passed ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <Target className="h-10 w-10 text-orange-600" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Completed!
              </h1>
              <p className="text-gray-600">{lecture.title}</p>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-700 mb-2">Your Score</p>
                <p className="text-5xl font-bold text-purple-600 mb-2">
                  {percentage}%
                </p>
                <p className="text-gray-700">
                  {score} out of {quizzes.length} correct
                </p>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Answers
              </h3>
              {quizzes.map((quiz, index) => {
                const isCorrect = answers[index] === quiz.correctAnswer;
                return (
                  <div
                    key={quiz._id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        Q{index + 1}. {quiz.question}
                      </p>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        Your answer:{" "}
                        <span
                          className={
                            isCorrect ? "text-green-700" : "text-red-700"
                          }
                        >
                          {quiz.options[answers[index]]?.text || "Not answered"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-gray-700">
                          Correct answer:{" "}
                          <span className="text-green-700">
                            {quiz.options[quiz.correctAnswer]?.text}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={restartQuiz}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
              >
                <Award className="h-5 w-5 mr-2" />
                Retake Quiz
              </button>
              <Link
                to="/dashboard"
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {lecture.title} - Quiz
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Question {currentQuizIndex + 1} of {quizzes.length}
            </span>
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuiz.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedAnswer === index
                        ? "border-purple-600 bg-purple-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAnswer === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuizIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {currentQuizIndex === quizzes.length - 1 ? "Submit Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
