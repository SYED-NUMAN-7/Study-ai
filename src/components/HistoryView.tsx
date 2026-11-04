import React, { useState } from 'react';
import type { User, QuestionRecord } from '../types/index.js';
import {
  History,
  Search,
  Trash2,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
  Pin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HistoryViewProps {
  user: User;
  questions: QuestionRecord[];
  onDeleteQuestion: (id: string) => Promise<void>;
  onAskAgain: (question: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  user,
  questions,
  onDeleteQuestion,
  onAskAgain,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = questions.filter((q) => {
    const s = searchQuery.toLowerCase();
    return (
      q.question.toLowerCase().includes(s) ||
      q.simple_answer.toLowerCase().includes(s) ||
      (q.subject && q.subject.toLowerCase().includes(s))
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Personal Activity
            </span>
            <span className="text-xs text-slate-500">Only visible to {user.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Ask AI History
          </h1>
        </div>

        <span className="text-xs text-slate-500 self-start sm:self-auto">
          {questions.length} Questions Asked
        </span>
      </div>

      {/* Search Input */}
      {questions.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions and definitions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 bg-white"
          />
        </div>
      )}

      {/* History List or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? 'No matching questions found' : 'No Questions Asked Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try different keywords or clear your search query.'
              : 'Every time you ask a question in Ask AI, it will be saved here in your private history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition-colors"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600">{item.subject || 'General'}</span>
                      <span>·</span>
                      <span>Class {item.class_level}</span>
                      <span>·</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.question}
                    </h3>

                    {!isExpanded && (
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {item.simple_answer}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteQuestion(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs sm:text-sm">
                    {/* Simple Answer */}
                    <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Simple Answer</span>
                      </div>
                      <p className="text-slate-900 font-medium">{item.simple_answer}</p>
                    </div>

                    {/* Explanation */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Explanation:</span>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Example */}
                    {item.example && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="font-bold text-emerald-900 block mb-1">Example:</span>
                        <p className="text-slate-800">{item.example}</p>
                      </div>
                    )}

                    {/* Key Point */}
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="font-bold text-amber-900 block mb-1">Key Revision Point:</span>
                      <p className="text-slate-900 font-semibold">{item.key_point}</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onAskAgain(item.question)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask Again in Ask AI</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
