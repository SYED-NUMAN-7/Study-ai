import React, { useState } from 'react';
import type { User, StudyPackSummaryItem } from '../types/index.js';
import {
  FolderKanban,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface StudyPacksListViewProps {
  user: User;
  packs: StudyPackSummaryItem[];
  onOpenPack: (id: string) => void;
  onCreateNew: () => void;
  onDeletePack: (id: string) => Promise<void>;
}

export const StudyPacksListView: React.FC<StudyPacksListViewProps> = ({
  user,
  packs,
  onOpenPack,
  onCreateNew,
  onDeletePack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPacks = packs.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Private Library
            </span>
            <span className="text-xs text-slate-500">Only accessible by {user.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            My Study Packs
          </h1>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Pack</span>
        </button>
      </div>

      {/* Search Input */}
      {packs.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your study packs by topic or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 bg-white"
          />
        </div>
      )}

      {/* Packs Grid / Empty State */}
      {filteredPacks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? 'No matching study packs found' : 'No Study Packs Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different keyword or clear your search query.'
                : 'Upload a PDF chapter, photo of textbook notes, or paste notes to generate your first Class ' + user.selected_class + ' study pack.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your First Study Pack</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPacks.map((pack) => (
            <div
              key={pack.id}
              onClick={() => onOpenPack(pack.id)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-indigo-600">{pack.subject || 'General'}</span>
                  <span>Class {pack.class_level}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {pack.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {pack.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate max-w-[150px]">{pack.file_name}</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this study pack?')) {
                        onDeletePack(pack.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete pack"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
