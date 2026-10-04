import React, { useState, useEffect, useCallback } from 'react';
import type { Word } from '../types/voca';
import { speakWord } from '../utils/tts';
import { soundFx } from '../utils/audio';
import {
  Volume2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Star,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';

interface FlashcardModeProps {
  words: Word[];
  onToggleStar: (wordId: string) => void;
  onToggleMastered: (wordId: string) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  onToggleStar,
  onToggleMastered,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [unknownIds, setUnknownIds] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentWord = words[currentIndex];

  // Auto pronunciation when card changes or flipped to English side
  useEffect(() => {
    if (currentWord && !isFlipped) {
      speakWord(currentWord.word);
    }
  }, [currentIndex, currentWord, isFlipped]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
    soundFx.playFlip();
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, words.length]);

  const handleMarkKnown = useCallback(() => {
    if (!currentWord) return;
    if (!knownIds.includes(currentWord.id)) {
      setKnownIds(prev => [...prev, currentWord.id]);
      setUnknownIds(prev => prev.filter(id => id !== currentWord.id));
    }
    soundFx.playCorrect();
    handleNext();
  }, [currentWord, knownIds, handleNext]);

  const handleMarkUnknown = useCallback(() => {
    if (!currentWord) return;
    if (!unknownIds.includes(currentWord.id)) {
      setUnknownIds(prev => [...prev, currentWord.id]);
      setKnownIds(prev => prev.filter(id => id !== currentWord.id));
    }
    soundFx.playIncorrect();
    handleNext();
  }, [currentWord, unknownIds, handleNext]);

  // Hotkeys handling (Left Arrow: Known, Right Arrow: Study Again, Space: Flip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleMarkKnown();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleMarkUnknown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleMarkKnown, handleMarkUnknown]);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (autoPlay && words.length > 0) {
      timer = setInterval(() => {
        setIsFlipped(prev => {
          if (!prev) {
            return true;
          } else {
            setCurrentIndex(idx => (idx + 1) % words.length);
            return false;
          }
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [autoPlay, words.length]);

  if (!words || words.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm text-center border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">학습할 단어가 없습니다</h3>
        <p className="text-sm text-slate-500 mb-4">새 단어를 추가하거나 TXT 파일로 단어를 등록해주세요.</p>
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / words.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col items-center justify-between min-h-[calc(100vh-140px)]">
      {/* Top Header Stats & Control Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        {/* Progress Counter */}
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {currentIndex + 1} <span className="text-slate-400 font-normal text-lg">/ {words.length}</span>
          </span>
          <div className="w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden hidden sm:block">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Star Toggle */}
          <button
            onClick={() => onToggleStar(currentWord.id)}
            className={`p-2 rounded-xl border transition-all ${
              currentWord.starred
                ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-xs'
                : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
            title="관심 단어 지정"
          >
            <Star className={`w-5 h-5 ${currentWord.starred ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Mastered Toggle */}
          <button
            onClick={() => onToggleMastered(currentWord.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              currentWord.mastered
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${currentWord.mastered ? 'text-emerald-600 fill-emerald-100' : ''}`} />
            <span>완전 암기</span>
          </button>

          {/* Auto-Play Toggle */}
          <button
            onClick={() => setAutoPlay(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              autoPlay
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoPlay ? '자동 재생 중' : '자동 재생'}</span>
          </button>

          {/* Restart / Reset */}
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="처음부터 다시 보기"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Center 3D Flip Card Container */}
      <div className="w-full flex-1 flex items-center justify-center my-4">
        <div
          onClick={handleFlip}
          className="w-full max-w-xl h-80 sm:h-96 cursor-pointer perspective-1000 select-none group"
        >
          <div
            className={`relative w-full h-full duration-500 transform-style-3d rounded-3xl shadow-xl border border-slate-200/80 transition-transform ${
              isFlipped ? 'rotate-y-180 bg-blue-50/30' : 'bg-white hover:border-blue-300 hover:shadow-2xl'
            }`}
          >
            {/* Front Side: English Word */}
            <div className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden bg-white">
              {/* Top Tag & TTS */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full uppercase tracking-wider">
                  {currentWord.pos || 'ENGLISH'}
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    speakWord(currentWord.word);
                  }}
                  className="p-3 bg-blue-100/80 hover:bg-blue-200 text-blue-700 rounded-2xl transition-all shadow-xs active:scale-95"
                  title="발음 듣기 (TTS)"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              {/* Main Word & Phonetic */}
              <div className="text-center my-auto">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
                  {currentWord.word}
                </h2>
                {currentWord.phonetic && (
                  <p className="text-lg font-mono text-slate-400">{currentWord.phonetic}</p>
                )}
              </div>

              {/* Bottom Flip Hint */}
              <div className="flex items-center justify-center text-xs font-semibold text-slate-400 gap-1">
                <RotateCw className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
                <span>카드 클릭 또는 스페이스바를 누르면 뜻을 봅니다</span>
              </div>
            </div>

            {/* Back Side: Korean Meaning & Example Sentence */}
            <div className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-white/20 text-white font-bold text-xs rounded-full uppercase tracking-wider backdrop-blur-xs">
                  KOREAN MEANING
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    speakWord(currentWord.word);
                  }}
                  className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all backdrop-blur-xs"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Main Korean Meaning */}
              <div className="text-center my-auto space-y-4">
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {currentWord.meaning}
                </h3>

                {currentWord.example && (
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-left space-y-1.5 backdrop-blur-xs max-w-lg mx-auto">
                    <p className="text-sm font-medium text-blue-100 italic">"{currentWord.example}"</p>
                    {currentWord.exampleMeaning && (
                      <p className="text-xs text-blue-200">{currentWord.exampleMeaning}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Hint */}
              <div className="text-center text-xs text-blue-200/80 font-medium">
                영단어로 되돌아가려면 다시 클릭하세요
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotkeys Helper Badge */}
      <div className="my-2 hidden sm:flex items-center space-x-6 text-xs text-slate-500 font-medium bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
        <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono font-bold">Space</kbd> 뒤집기</span>
        <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono font-bold">&larr;</kbd> 알아요</span>
        <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono font-bold">&rarr;</kbd> 몰라요</span>
      </div>

      {/* Bottom Sticky Accessible Action Bar */}
      <div className="w-full max-w-xl grid grid-cols-3 gap-3 mt-2">
        {/* Left: Study Again (몰라요) */}
        <button
          onClick={handleMarkUnknown}
          className="py-4 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <ArrowRight className="w-5 h-5 text-red-500" />
          <span>몰라요 (Study Again)</span>
        </button>

        {/* Middle: Flip (뒤집기) */}
        <button
          onClick={handleFlip}
          className="py-4 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <RotateCw className="w-5 h-5" />
          <span>카드 뒤집기</span>
        </button>

        {/* Right: Known (알아요) */}
        <button
          onClick={handleMarkKnown}
          className="py-4 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>알아요 (Known)</span>
        </button>
      </div>
    </div>
  );
};
