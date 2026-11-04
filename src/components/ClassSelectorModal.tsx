import React from 'react';
import { X, Sparkles, BookOpen, Check } from 'lucide-react';

interface ClassSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: number;
  onSelectClass: (classNum: number) => void;
  isUpdating?: boolean;
}

export const ClassSelectorModal: React.FC<ClassSelectorModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  onSelectClass,
  isUpdating = false,
}) => {
  if (!isOpen) return null;

  const classTiers = [
    {
      range: 'Class 1 – 3',
      description: 'Extremely simple words, very short sentences, playful real-life examples (toys, animals, everyday play).',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      classes: [1, 2, 3],
    },
    {
      range: 'Class 4 – 5',
      description: 'Simple school-level explanations, friendly teacher tone, relatable classroom and kitchen examples.',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      classes: [4, 5],
    },
    {
      range: 'Class 6 – 8',
      description: 'Clear middle school explanations with moderate detail, introducing core terminology, formulas, and concepts.',
      badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
      classes: [6, 7, 8],
    },
    {
      range: 'Class 9 – 10',
      description: 'Detailed secondary school explanations, rigorous definitions, formulas, chemical equations, and exam-focused takeaways.',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      classes: [9, 10],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Select Your Class</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All AI explanations, study packs, quizzes, and vocabulary will automatically calibrate to your selected class level.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tiers List */}
        <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {classTiers.map((tier) => (
            <div key={tier.range} className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${tier.badgeColor}`}>
                  {tier.range}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Class-tuned AI
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">{tier.description}</p>

              {/* Class Buttons Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {tier.classes.map((c) => {
                  const isSelected = currentClass === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onSelectClass(c)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40'
                      }`}
                    >
                      <span>Class {c}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>You can change your class anytime in Settings.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
