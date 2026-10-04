import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Word } from '../types/voca';
import { speakWord } from '../utils/tts';
import { soundFx } from '../utils/audio';
import { Volume2, CheckCircle2, XCircle, Flame, RotateCcw, Trophy } from 'lucide-react';

interface RecallModeProps {
  words: Word[];
  onFinishQuiz?: (score: number, wrongWords: Word[]) => void;
}

export const RecallMode: React.FC<RecallModeProps> = ({ words, onFinishQuiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [wrongWordsList, setWrongWordsList] = useState<Word[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = words[currentIndex];

  // Generate 4 multiple-choice options (1 correct + 3 distractors)
  const options = useMemo(() => {
    if (!currentWord || words.length === 0) return [];
    
    const correctMeaning = currentWord.meaning;
    const otherMeanings = words
      .filter(w => w.id !== currentWord.id)
      .map(w => w.meaning);

    // Shuffle and pick 3 random distractors
    const shuffledDistractors = [...otherMeanings]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // If less than 4 words in total set, create mock distractors
    while (shuffledDistractors.length < 3) {
      const fallbackOptions = ['의미 없음', '기억하다', '이해하다', '표현하다', '도전하다'];
      const pick = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      if (!shuffledDistractors.includes(pick) && pick !== correctMeaning) {
        shuffledDistractors.push(pick);
      }
    }

    const allOptions = [correctMeaning, ...shuffledDistractors].sort(() => 0.5 - Math.random());
    return allOptions;
  }, [currentWord, words]);

  // Speak word when question loads
  useEffect(() => {
    if (currentWord) {
      speakWord(currentWord.word);
    }
  }, [currentIndex, currentWord]);

  const handleSelectOption = (index: number, chosenMeaning: string) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = chosenMeaning === currentWord.meaning;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      soundFx.playIncorrect();
      setStreak(0);
      setWrongWordsList(prev => [...prev, currentWord]);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      setSelectedOption(null);
      setIsAnswered(false);

      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
        if (onFinishQuiz) {
          onFinishQuiz(score + (isCorrect ? 1 : 0), [...wrongWordsList, ...(isCorrect ? [] : [currentWord])]);
        }
      }
    }, 1200);
  };

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setWrongWordsList([]);
    setIsFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, []);

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
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl text-center border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">리콜 모드 완료!</h2>
        <p className="text-sm text-slate-500 mb-6">총 {words.length}개 단어 중 {score}개를 맞혔습니다.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase">점수 (Accuracy)</p>
            <p className="text-3xl font-black text-blue-900 mt-1">{accuracy}%</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-xs font-bold text-amber-700 uppercase">오답 (Wrong Count)</p>
            <p className="text-3xl font-black text-amber-900 mt-1">{wrongWordsList.length}개</p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>다시 도전하기</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between mb-6">
        {/* Counter */}
        <span className="text-sm font-bold text-slate-600">
          문제 <span className="text-blue-600 text-lg font-black">{currentIndex + 1}</span> / {words.length}
        </span>

        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
          <span className="text-xs font-black text-amber-700">{streak} 연속 정답</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center mb-6">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => speakWord(currentWord.word)}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl transition-all"
            title="발음 듣기"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          {currentWord.word}
        </h2>
        {currentWord.phonetic && (
          <p className="text-sm font-mono text-slate-400 mb-4">{currentWord.phonetic}</p>
        )}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          올바른 한글 뜻을 선택하세요
        </p>
      </div>

      {/* 4-Choice Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isCorrectAnswer = option === currentWord.meaning;
          const isSelected = selectedOption === index;

          let btnClass = 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800';

          if (isAnswered) {
            if (isCorrectAnswer) {
              btnClass = 'bg-emerald-500 border-emerald-500 text-white font-bold animate-correct-glow';
            } else if (isSelected && !isCorrectAnswer) {
              btnClass = 'bg-red-500 border-red-500 text-white font-bold animate-shake';
            } else {
              btnClass = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={index}
              disabled={isAnswered}
              onClick={() => handleSelectOption(index, option)}
              className={`p-4 rounded-2xl border-2 text-left font-bold text-base transition-all flex items-center justify-between shadow-xs ${btnClass}`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-mono font-bold">
                  {index + 1}
                </span>
                <span>{option}</span>
              </div>

              {isAnswered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-white" />}
              {isAnswered && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
