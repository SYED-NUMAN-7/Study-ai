import React, { useState, useRef } from 'react';
import type { User, StudyPack } from '../types/index.js';
import { SAMPLE_CHAPTERS, type SampleChapter } from '../data/sampleMaterial.js';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Camera,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  X,
  FileCheck,
  Play,
} from 'lucide-react';

interface CreateStudyPackViewProps {
  user: User;
  onGenerateStudyPack: (payload: {
    userPromptTitle?: string;
    textContent?: string;
    fileBufferBase64?: string;
    mimeType?: string;
    fileName?: string;
    fileType?: string;
  }) => Promise<StudyPack>;
  onStudyPackCreated: (pack: StudyPack) => void;
  onOpenClassSelector: () => void;
}

export const CreateStudyPackView: React.FC<CreateStudyPackViewProps> = ({
  user,
  onGenerateStudyPack,
  onStudyPackCreated,
  onOpenClassSelector,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'text' | 'sample'>('upload');
  const [titleInput, setTitleInput] = useState('');
  const [textNotesInput, setTextNotesInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    base64: string;
    previewUrl?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    `Reading textbook page and analyzing contents...`,
    `Extracting chapters, subtopics, and core definitions...`,
    `Calibrating explanation depth for Class ${user.selected_class}...`,
    `Generating 10 multiple-choice quiz questions grounded in your material...`,
    `Assembling interactive flashcards and quick revision highlights...`,
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!validTypes.includes(file.type) && !isImage && !isPdf) {
      setErrorMsg('Please upload a valid PDF or image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size must be under 25MB.');
      return;
    }

    const cleanDefaultTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/^(IMG|PXL|PHOTO|SCAN)\w*/i, 'Textbook Page Notes');

    if (isImage) {
      // Optimize image for fast upload and AI processing
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const base64Data = optimizedDataUrl.split(',')[1];

            setSelectedFile({
              file,
              base64: base64Data,
              previewUrl: optimizedDataUrl,
            });

            if (!titleInput.trim()) {
              setTitleInput(cleanDefaultTitle);
            }
          } else {
            // Fallback to original
            const origResult = reader.result as string;
            setSelectedFile({
              file,
              base64: origResult.split(',')[1],
              previewUrl: origResult,
            });
            if (!titleInput.trim()) {
              setTitleInput(cleanDefaultTitle);
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // PDF handling
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setSelectedFile({
          file,
          base64: base64Data,
          previewUrl: undefined,
        });

        if (!titleInput.trim()) {
          setTitleInput(cleanDefaultTitle);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectSample = (sample: SampleChapter) => {
    setTitleInput(sample.title);
    setTextNotesInput(sample.textNotes);
    setSelectedFile(null);
    setActiveMode('text');
  };

  const handleGenerate = async () => {
    setErrorMsg(null);

    const hasFile = selectedFile && selectedFile.base64;
    const hasText = textNotesInput.trim().length > 0;

    if (!hasFile && !hasText) {
      setErrorMsg('Please upload a PDF / photo, or enter textbook notes/chapter text.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const res = await onGenerateStudyPack({
        userPromptTitle: titleInput.trim() || undefined,
        textContent: hasText ? textNotesInput.trim() : undefined,
        fileBufferBase64: hasFile ? selectedFile.base64 : undefined,
        mimeType: hasFile ? selectedFile.file.type : undefined,
        fileName: hasFile ? selectedFile.file.name : titleInput ? `${titleInput}.txt` : 'Notes.txt',
        fileType: hasFile
          ? selectedFile.file.type.includes('pdf')
            ? 'pdf'
            : 'image'
          : 'text',
      });

      clearInterval(stepInterval);
      onStudyPackCreated(res);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'Failed to generate study pack. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs">
                Class {user.selected_class} Study Pack
              </span>
              <button
                type="button"
                onClick={onOpenClassSelector}
                className="text-xs text-amber-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Change class
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
              Create a Personal Study Pack
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
              Upload a PDF chapter, textbook photo, or paste your notes. AI generates a Class {user.selected_class} Summary, Topics, Important Points, 10-Question Quiz, and Flashcards!
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center backdrop-blur-xs">
            <BookOpen className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Main Creation Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload PDF / Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeMode === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Type / Paste Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('sample')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeMode === 'sample' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Samples</span>
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Chapter or Topic Title (Optional)
          </label>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="e.g. Chapter 4: Heat and Temperature"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>

        {/* MODE 1: PDF / PHOTO UPLOAD */}
        {activeMode === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 sm:p-10 text-center transition-colors bg-slate-50/60"
            >
              {selectedFile ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  {selectedFile.previewUrl ? (
                    <img
                      src={selectedFile.previewUrl}
                      alt="Upload preview"
                      className="max-h-48 rounded-xl object-contain border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileCheck className="w-8 h-8" />
                    </div>
                  )}

                  <div className="text-center">
                    <p className="font-semibold text-slate-900 text-sm">{selectedFile.file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB · Ready for Class {user.selected_class} analysis
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove file</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">Upload PDF or Photo of Textbook / Notes</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Drag and drop your file here, or click to browse. Supports PDF documents and textbook page photos (JPEG, PNG, WEBP).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Choose PDF or Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                  </div>

                  {/* Hidden inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: TEXT NOTES */}
        {activeMode === 'text' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Textbook Content or Chapter Notes
            </label>
            <textarea
              rows={10}
              value={textNotesInput}
              onChange={(e) => setTextNotesInput(e.target.value)}
              placeholder="Paste or type chapter notes, definitions, formulas, or study material here..."
              className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-sans"
            />
            <p className="text-[11px] text-slate-400">
              The AI will read this exact material to extract summaries, topics, 10 quiz questions, and flashcards.
            </p>
          </div>
        )}

        {/* MODE 3: SAMPLE CHAPTERS FOR 1-CLICK TEST */}
        {activeMode === 'sample' && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">
              Click any realistic textbook chapter below to test study pack generation immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_CHAPTERS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-indigo-600">{sample.subject}</span>
                    <span>Class {sample.classLevel}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sample.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
                    <Play className="w-3.5 h-3.5" />
                    <span>Load Chapter</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading State with animated progress steps */}
        {loading && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Processing Study Material...</h3>
                <p className="text-xs text-slate-600">Strictly grounded in your uploaded content for Class {user.selected_class}</p>
              </div>
            </div>

            {/* Stepper list */}
            <div className="space-y-2.5 max-w-md mx-auto pt-2">
              {loadingSteps.map((step, idx) => {
                const isDone = idx < loadingStep;
                const isCurrent = idx === loadingStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs transition-opacity ${
                      isDone
                        ? 'text-emerald-700 font-medium'
                        : isCurrent
                        ? 'text-indigo-900 font-semibold'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Generate Button */}
        {!loading && (
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Generate Study Pack (Class {user.selected_class})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
