import React, { useState } from 'react';
import type { StudyPack } from '../types/index.js';
import {
  BookOpen,
  ListTree,
  Pin,
  HelpCircle,
  Layers,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Share2,
  Trash2,
} from 'lucide-react';

interface StudyPackDetailViewProps {
  pack: StudyPack;
  onBack: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export const StudyPackDetailView: React.FC<StudyPackDetailViewProps> = ({
  pack,
  onBack,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'topics' | 'important' | 'quiz' | 'flashcards'>('summary');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const score = pack.quiz.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.answer_index ? acc + 1 : acc;
  }, 0);

  const currentFlashcard = pack.flashcards[currentCardIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to all study packs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{pack.subject || 'General'}</span>
              <span>·</span>
              <span>Class {pack.class_level}</span>
              <span>·</span>
              <span>{pack.file_name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {pack.title}
            </h1>
          </div>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this study pack?')) {
                onDelete(pack.id);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Pack</span>
          </button>
        )}
      </div>

      {/* Primary Study Pack Tabs */}
      {/* Displayed as: Summary | Topics | Important | Quiz | Flashcards */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'topics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListTree className="w-4 h-4" />
          <span>Topics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('important')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'important' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pin className="w-4 h-4" />
          <span>Important</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'quiz' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz (10)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'flashcards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards</span>
        </button>
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Chapter Summary (Class {pack.class_level})</span>
            </h2>
            <span className="text-xs text-slate-500">Grounded in uploaded material</span>
          </div>

          <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="whitespace-pre-line bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/80">
              {pack.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500">Topics Covered</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{pack.topics.length}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500">Quiz Questions</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{pack.quiz.length}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500">Flashcards</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{pack.flashcards.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOPICS & SUBTOPICS */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListTree className="w-5 h-5 text-indigo-600" />
              <span>Core Topics & Subtopics</span>
            </h2>
            <span className="text-xs text-slate-500">{pack.topics.length} Key Topics</span>
          </div>

          <div className="space-y-4">
            {pack.topics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {topic.title}
                    </h3>
                  </div>
                </div>

                {/* Subtopics bullet points */}
                {topic.subtopics && topic.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {topic.subtopics.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        • {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {topic.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IMPORTANT POINTS */}
      {activeTab === 'important' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-600" />
              <span>Important Points for Quick Revision</span>
            </h2>
            <span className="text-xs text-slate-500">Definitions, formulas & exam highlights</span>
          </div>

          <div className="space-y-3">
            {pack.important_points.map((pt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 10 QUIZ QUESTIONS + ANSWERS */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>10-Question Knowledge Quiz</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions are directly grounded in your study material at Class {pack.class_level} level.
              </p>
            </div>

            {/* Score pill or status */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {quizSubmitted ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Score: {score} / {pack.quiz.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500">
                  Answered: {Object.keys(selectedAnswers).length} / {pack.quiz.length}
                </span>
              )}
            </div>
          </div>

          {/* Quiz Questions List */}
          <div className="space-y-6">
            {pack.quiz.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.answer_index;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    quizSubmitted
                      ? isCorrect
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                      <span className="text-indigo-600 font-bold mr-1.5">Q{qIdx + 1}.</span>
                      {q.question}
                    </h3>
                    {quizSubmitted && (
                      <div className="shrink-0">
                        {isCorrect ? (
                          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-600 text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            <span>Incorrect</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      const isThisCorrectAnswer = q.answer_index === optIdx;

                      let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400';
                      if (quizSubmitted) {
                        if (isThisCorrectAnswer) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                        } else if (isThisSelected && !isCorrect) {
                          btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                        } else {
                          btnStyle = 'border-slate-200 bg-white text-slate-400 opacity-60';
                        }
                      } else if (isThisSelected) {
                        btnStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-600/30';
                      }

                      const optionLetters = ['A', 'B', 'C', 'D'];

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`flex items-start text-left gap-2.5 p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {optionLetters[optIdx]}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">
                        Answer: {q.options[q.answer_index]}
                      </p>
                      <p className="text-slate-600">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz Button */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {quizSubmitted
                ? `You scored ${score} out of 10 points.`
                : `${Object.keys(selectedAnswers).length} of ${pack.quiz.length} questions answered`}
            </span>

            {quizSubmitted ? (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check My Answers</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FLASHCARDS */}
      {activeTab === 'flashcards' && currentFlashcard && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Interactive Flashcards</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Click card to flip between Question and Answer.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Card {currentCardIndex + 1} of {pack.flashcards.length}
            </span>
          </div>

          {/* 3D Flip Flashcard */}
          <div className="max-w-md mx-auto">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[220px] p-8 rounded-2xl border-2 border-indigo-200/80 bg-linear-to-br from-indigo-50/50 via-white to-amber-50/30 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-400 transition-all text-center select-none"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-600">
                  {isFlipped ? 'ANSWER (BACK)' : 'CONCEPT / QUESTION (FRONT)'}
                </span>
                <span>Click to flip</span>
              </div>

              <div className="my-auto py-4">
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {isFlipped ? currentFlashcard.back : currentFlashcard.front}
                </p>
                {!isFlipped && currentFlashcard.hint && (
                  <p className="text-xs text-slate-400 mt-3 italic">
                    Hint: {currentFlashcard.hint}
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                {isFlipped ? 'Tap to see prompt' : 'Tap to reveal answer'}
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMasteredCards((prev) => ({
                    ...prev,
                    [currentCardIndex]: !prev[currentCardIndex],
                  }));
                }}
                className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  masteredCards[currentCardIndex]
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {masteredCards[currentCardIndex] ? '✓ Mastered' : 'Mark as Mastered'}
              </button>

              <button
                type="button"
                disabled={currentCardIndex === pack.flashcards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => Math.min(pack.flashcards.length - 1, prev + 1));
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
