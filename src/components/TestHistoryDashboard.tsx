import React, { useState } from 'react';
import type { TestResult, Word } from '../types/voca';
import { History, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface TestHistoryDashboardProps {
  history: TestResult[];
  onClearHistory: () => void;
  onRetestWrongWords: (words: Word[]) => void;
}

export const TestHistoryDashboard: React.FC<TestHistoryDashboardProps> = ({
  history,
  onClearHistory,
  onRetestWrongWords,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm text-center border border-slate-200">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <History className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">저장된 시험 성적 기록이 없습니다</h3>
        <p className="text-sm text-slate-500">시험 모드에서 학습 후 시험을 제출하면 성적이 자동으로 기록됩니다.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Title & Clear Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>시험 성적 히스토리</span>
          </h2>
          <p className="text-xs text-slate-500">누적 {history.length}회 응시 기록</p>
        </div>

        <button
          onClick={onClearHistory}
          className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>성적 기록 전체 삭제</span>
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.map(item => {
          const isExpanded = expandedId === item.id;
          const isPassed = item.score >= 80;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Summary Row */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                      isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.score}점
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{item.setName}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      응시일: {item.date} | 총 {item.totalQuestions}문항 중 {item.correctAnswers}개 정답
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isPassed ? 'PASS' : 'FAIL'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details: Wrong Words & Actions */}
              {isExpanded && (
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {item.wrongWords && item.wrongWords.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> 오답 단어 목록 ({item.wrongWords.length}개)
                        </span>

                        <button
                          onClick={() => onRetestWrongWords(item.wrongWords)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-2xs transition-all"
                        >
                          이 시험 오답만 재시험 보기
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.wrongWords.map((word, wIdx) => (
                          <div
                            key={wIdx}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
                          >
                            <span className="font-bold text-slate-900">{word.word}</span>
                            <span className="text-red-600 font-medium">{word.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-700">
                      🎉 만점입니다! 오답인 단어가 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
