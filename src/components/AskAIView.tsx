import React, { useState } from 'react';
import type { User, QuestionRecord } from '../types/index.js';
import {
  HelpCircle,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
  Pin,
  Clock,
  Trash2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AskAIViewProps {
  user: User;
  onAskQuestion: (question: string, subject?: string) => Promise<QuestionRecord>;
  recentQuestions: QuestionRecord[];
  onDeleteQuestion: (id: string) => Promise<void>;
  onOpenClassSelector: () => void;
}

export const AskAIView: React.FC<AskAIViewProps> = ({
  user,
  onAskQuestion,
  recentQuestions,
  onDeleteQuestion,
  onOpenClassSelector,
}) => {
  const [questionInput, setQuestionInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<QuestionRecord | null>(
    recentQuestions.length > 0 ? recentQuestions[0] : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const subjects = ['All', 'Science', 'Maths', 'Social Science', 'English'];

  // Suggested questions based on class level
  const classSuggestions: Record<number, string[]> = {
    1: ['What is a plant?', 'Why do we need water?', 'What is a shape?', 'Who was Mahatma Gandhi?'],
    2: ['Why does the sun rise?', 'What are living things?', 'What is an addition?', 'What is an animal habitat?'],
    3: ['What is photosynthesis?', 'What is a fraction?', 'Why does it rain?', 'Who was Mahatma Gandhi?'],
    4: ['What is photosynthesis?', 'What is a fraction?', 'Explain the water cycle.', 'Why do teeth fall out?'],
    5: ['What is photosynthesis?', 'How does digestion work?', 'What are prime numbers?', 'Explain solar eclipse.'],
    6: ['What is photosynthesis?', 'What is a fraction and decimal?', 'Explain the water cycle.', 'Who was Mahatma Gandhi?'],
    7: ['Explain cellular respiration.', 'What is heat and temperature?', 'What was the Mughal Empire?', 'What are rational numbers?'],
    8: ['What is photosynthesis?', 'What is friction and its types?', 'Explain cell structure.', 'What is pressure?'],
    9: ['What is photosynthesis in detail?', 'Explain Newton\'s laws of motion.', 'What was the French Revolution?', 'What is the structure of an atom?'],
    10: ['Explain the mechanism of photosynthesis.', 'What is Ohm\'s Law and resistance?', 'Explain chemical reactions and equations.', 'What is trigonometry?'],
  };

  const currentSuggestions = classSuggestions[user.selected_class] || [
    'What is photosynthesis?',
    'What is a fraction?',
    'Explain the water cycle.',
    'Who was Mahatma Gandhi?',
  ];

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = customQuestion || questionInput;
    if (!query.trim() || loading) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      const subjectParam = selectedSubject === 'All' ? undefined : selectedSubject;
      const res = await onAskQuestion(query.trim(), subjectParam);
      setCurrentAnswer(res);
      if (!customQuestion) {
        setQuestionInput('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to get answer from AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentAnswer) return;
    const textToCopy = `Question: ${currentAnswer.question}
Simple Answer: ${currentAnswer.simple_answer}
Explanation: ${currentAnswer.explanation}
${currentAnswer.example ? `Example: ${currentAnswer.example}\n` : ''}Key Point: ${currentAnswer.key_point}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!currentAnswer) return;
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const text = `${currentAnswer.simple_answer}. ${currentAnswer.explanation}. Key point to remember: ${currentAnswer.key_point}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = user.selected_class <= 4 ? 0.85 : 0.95; // Slightly slower for younger grades
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Hero / Greeting Banner */}
      <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs">
                Class {user.selected_class} Mode
              </span>
              <button
                type="button"
                onClick={onOpenClassSelector}
                className="text-xs text-indigo-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Change class
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
              Ask AI Anything for Class {user.selected_class}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
              Type any question from Science, Maths, Social Science, or English. AI explains with words and examples tailored directly for your grade!
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center backdrop-blur-xs">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>
        </div>
      </div>

      {/* Main Question Input Box */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          {/* Subject Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap">Subject:</span>
            {subjects.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedSubject === subj
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Large Text Input */}
          <div className="relative">
            <textarea
              rows={3}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Ask a question (e.g. "What is photosynthesis?", "What is a fraction?", "Explain the water cycle")...`}
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400 text-sm sm:text-base resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Press Enter to ask AI · Difficulty calibrated for Class {user.selected_class}
              </span>
              <button
                type="submit"
                disabled={loading || !questionInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">Try asking these popular Class {user.selected_class} questions:</p>
          <div className="flex flex-wrap gap-2">
            {currentSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestionInput(item);
                  handleSubmit(undefined, item);
                }}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 transition-colors text-left border border-indigo-100 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{item}</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2">
          <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Animation Indicator */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Preparing Class {user.selected_class} Explanation...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Selecting appropriate vocabulary, relatable examples, and key revision points for your grade level.
            </p>
          </div>
        </div>
      )}

      {/* Answer Result Display Card */}
      {!loading && currentAnswer && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
          {/* Header of Answer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-indigo-600">{currentAnswer.subject || 'General'}</span>
                <span>·</span>
                <span>Calibrated for Class {currentAnswer.class_level || user.selected_class}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {currentAnswer.question}
              </h2>
            </div>
            {/* Action buttons: Read Aloud + Copy */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud with student voice'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Copy answer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* If the AI found the question unclear */}
          {Boolean(currentAnswer.is_unclear) ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Could you clarify your question?</span>
              </div>
              <p className="text-xs sm:text-sm">
                {currentAnswer.clarification_prompt ||
                  'The question seems a bit short or unclear. Please tell me which specific chapter, subject, or topic you want to learn about!'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 1. Simple Answer (Highlighted) */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1.5 uppercase tracking-wide">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Simple Answer</span>
                </div>
                <p className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
                  {currentAnswer.simple_answer}
                </p>
              </div>

              {/* 2. Easy Explanation */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Easy Explanation</span>
                </div>
                <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  {currentAnswer.explanation}
                </div>
              </div>

              {/* 3. Helpful Example */}
              {currentAnswer.example && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-Life Example</span>
                  </div>
                  <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                    {currentAnswer.example}
                  </p>
                </div>
              )}

              {/* 4. Key Point for Quick Revision */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">
                  <Pin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Point for Quick Revision</span>
                </div>
                <p className="text-slate-900 font-semibold text-xs sm:text-sm">
                  {currentAnswer.key_point}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Questions for this Student */}
      {recentQuestions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">Your Recent Questions</h3>
            </div>
            <span className="text-[11px] text-slate-500">Private to {user.name}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentQuestions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50 px-2 rounded-lg transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setCurrentAnswer(q)}
                  className="text-left flex-1 cursor-pointer"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {q.question}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {q.simple_answer}
                  </p>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">Class {q.class_level}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuestion(q.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
