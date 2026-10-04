import React from 'react';
import type { WordSet, LearningMode } from '../types/voca';
import { BookOpen, Layers, CheckCircle2, Edit3, Award, PlusCircle, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  wordSets: WordSet[];
  activeSetId: string;
  onSelectSetId: (id: string) => void;
  activeMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
  onCreateNewSet: () => void;
  onOpenTxtImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wordSets,
  activeSetId,
  onSelectSetId,
  activeMode,
  onSelectMode,
  onCreateNewSet,
}) => {
  const activeSet = wordSets.find(s => s.id === activeSetId) || wordSets[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">ClassVoca</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Classcard Style
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">스마트 클래스카드 영단어 암기 & 리콜 학습</p>
            </div>
          </div>

          {/* Word Set Selector Dropdown & Add Button */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={activeSetId}
                onChange={e => onSelectSetId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer max-w-[200px] sm:max-w-[260px] truncate"
              >
                {wordSets.map(set => (
                  <option key={set.id} value={set.id}>
                    {set.title} ({set.words.length}단어)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onCreateNewSet}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="새 단어장 만들기"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Learning Modes Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => onSelectMode('flashcard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeMode === 'flashcard'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>암기 모드 (Flashcard)</span>
          </button>

          <button
            onClick={() => onSelectMode('recall')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeMode === 'recall'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>리콜 모드 (4지선다)</span>
          </button>

          <button
            onClick={() => onSelectMode('spelling')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeMode === 'spelling'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>스펠 모드 (Spelling)</span>
          </button>

          <button
            onClick={() => onSelectMode('test')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeMode === 'test'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>시험 (Test)</span>
          </button>

          <div className="h-6 w-px bg-slate-200 self-center mx-1" />

          <button
            onClick={() => onSelectMode('manage')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeMode === 'manage'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>단어 관리 ({activeSet?.words?.length || 0})</span>
          </button>

          <button
            onClick={() => onSelectMode('history')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeMode === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>시험 성적표</span>
          </button>
        </div>
      </div>
    </header>
  );
};
