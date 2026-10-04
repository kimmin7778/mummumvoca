import React, { useState, useEffect, useRef } from 'react';
import type { Word } from '../types/voca';
import { speakWord } from '../utils/tts';
import { soundFx } from '../utils/audio';
import { Volume2, HelpCircle, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface SpellingModeProps {
  words: Word[];
}

export const SpellingMode: React.FC<SpellingModeProps> = ({ words }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputSpelling, setInputSpelling] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord) {
      speakWord(currentWord.word);
      setInputSpelling('');
      setFeedback(null);
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, currentWord]);

  const handleCheckSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputSpelling.trim() || feedback !== null) return;

    const isCorrect = inputSpelling.trim().toLowerCase() === currentWord.word.toLowerCase();

    if (isCorrect) {
      soundFx.playCorrect();
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      soundFx.playIncorrect();
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setInputSpelling('');
    setFeedback(null);
  };

  if (!words || words.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm text-center border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">학습할 단어가 없습니다</h3>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((score / words.length) * 100);
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl text-center border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-2">스펠 학습 완료!</h2>
        <p className="text-sm text-slate-500 mb-6">총 {words.length}개 단어 중 {score}개의 스펠링을 맞혔습니다.</p>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
          <p className="text-xs font-bold text-blue-700 uppercase">정확도 (Accuracy)</p>
          <p className="text-4xl font-black text-blue-900 mt-1">{accuracy}%</p>
        </div>
        <button
          onClick={handleRestart}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>다시 도전하기</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-slate-600">
          단어 <span className="text-blue-600 text-lg font-black">{currentIndex + 1}</span> / {words.length}
        </span>
        <button
          type="button"
          onClick={() => speakWord(currentWord.word)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-bold text-xs hover:bg-blue-200 transition-all"
        >
          <Volume2 className="w-4 h-4" />
          <span>발음 재듣기</span>
        </button>
      </div>

      {/* Meaning & Typing Card */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6">
        {/* Korean Meaning Prompt */}
        <div>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full uppercase">
            {currentWord.pos || 'MEANING'}
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2 mb-1">
            {currentWord.meaning}
          </h2>
          {currentWord.example && (
            <p className="text-xs text-slate-500 italic">"{currentWord.example}"</p>
          )}
        </div>

        {/* Form Input */}
        <form onSubmit={handleCheckSpelling} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputSpelling}
              onChange={e => setInputSpelling(e.target.value)}
              disabled={feedback !== null}
              placeholder="영단어 스펠링을 입력하세요"
              className={`w-full text-center text-2xl font-bold px-4 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                feedback === 'correct'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 animate-correct-glow'
                  : feedback === 'incorrect'
                  ? 'border-red-500 bg-red-50 text-red-900 animate-shake'
                  : 'border-slate-300 focus:border-blue-500 bg-slate-50 text-slate-900'
              }`}
            />
          </div>

          {/* Feedback badge */}
          {feedback === 'correct' && (
            <div className="flex items-center justify-center space-x-1.5 text-emerald-600 font-extrabold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>정답입니다!</span>
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="flex items-center justify-center space-x-1.5 text-red-600 font-extrabold text-sm">
              <XCircle className="w-5 h-5" />
              <span>오답입니다: <span className="underline font-mono">{currentWord.word}</span></span>
            </div>
          )}

          {/* Hint Button */}
          {!showHint && feedback === null && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>힌트 보기 ({currentWord.word.length}글자)</span>
            </button>
          )}

          {showHint && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono font-bold text-amber-900">
              힌트: 첫 글자 <span className="text-base text-amber-600">'{currentWord.word[0]}'</span> / 총 {currentWord.word.length}글자
            </div>
          )}

          <button
            type="submit"
            disabled={!inputSpelling.trim() || feedback !== null}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>확인 (Enter)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
