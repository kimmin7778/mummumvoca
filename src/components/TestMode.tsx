import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Word, TestResult } from '../types/voca';
import { formatShortTimestamp } from '../utils/dateFormatter';
import { saveTestResult } from '../utils/storage';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Award, Clock, CheckCircle2, XCircle, RotateCcw, AlertTriangle, Play } from 'lucide-react';

interface TestModeProps {
  words: Word[];
  setId: string;
  setName: string;
  onRetestWrongWords: (wrongWords: Word[]) => void;
}

export const TestMode: React.FC<TestModeProps> = ({
  words,
  setId,
  setName,
  onRetestWrongWords,
}) => {
  const [testState, setTestState] = useState<'config' | 'running' | 'results'>('config');
  const [questionCount, setQuestionCount] = useState<number>(Math.min(10, words.length));
  const [testWords, setTestWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Timer effect during running test
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (testState === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testState, startTime]);

  // Handle starting test
  const handleStartTest = () => {
    const selectedWords = [...words].sort(() => 0.5 - Math.random()).slice(0, questionCount);
    setTestWords(selectedWords);
    setCurrentIndex(0);
    setUserAnswers({});
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setTestState('running');
  };

  const currentWord = testWords[currentIndex];

  // Generate 4 choices for current question
  const currentOptions = useMemo(() => {
    if (!currentWord || testWords.length === 0) return [];
    const correctMeaning = currentWord.meaning;
    const distractors = words
      .filter(w => w.id !== currentWord.id)
      .map(w => w.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    while (distractors.length < 3) {
      distractors.push('해당 없음');
    }

    return [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentWord, words, testWords]);

  const handleSelectAnswer = (meaning: string) => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: meaning }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < testWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Submit and evaluate test
  const handleSubmitTest = useCallback(() => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let correctCount = 0;
    const wrongWords: Word[] = [];

    testWords.forEach((word, i) => {
      const ans = userAnswers[i];
      if (ans === word.meaning) {
        correctCount++;
      } else {
        wrongWords.push(word);
      }
    });

    const scorePct = Math.round((correctCount / testWords.length) * 100);

    const result: TestResult = {
      id: `test_${Date.now()}`,
      setId,
      setName,
      date: formatShortTimestamp(),
      totalQuestions: testWords.length,
      correctAnswers: correctCount,
      score: scorePct,
      accuracy: scorePct,
      timeTakenSeconds: timeTaken,
      wrongWords,
      mode: 'test',
    };

    saveTestResult(result);
    setTestResult(result);
    setTestState('results');

    if (scorePct >= 80) {
      soundFx.playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      soundFx.playIncorrect();
    }
  }, [startTime, testWords, userAnswers, setId, setName]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Render Config Screen
  if (testState === 'config') {
    return (
      <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">단어 시험 설정</h2>
        <p className="text-sm text-slate-500 mb-6">
          현재 단어장: <span className="font-bold text-slate-800">{setName}</span> (총 {words.length}단어)
        </p>

        {/* Question Count selector */}
        <div className="space-y-3 mb-8 text-left">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            출제 문항 수 선택
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, words.length].map(count => {
              const countVal = Math.min(count, words.length);
              const isSelected = questionCount === countVal;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(countVal)}
                  className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {count === words.length ? '전체' : `${countVal}개`}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStartTest}
          disabled={words.length === 0}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 text-base"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>시험 시작하기</span>
        </button>
      </div>
    );
  }

  // Render Running Test Screen
  if (testState === 'running' && currentWord) {
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Timer Bar */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-3 rounded-2xl mb-6 shadow-md">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="font-mono font-bold text-sm">경과 시간: {formatTime(elapsedSeconds)}</span>
          </div>
          <span className="text-xs font-semibold bg-slate-800 px-3 py-1 rounded-full text-slate-300">
            {answeredCount} / {testWords.length} 응답 완료
          </span>
        </div>

        {/* Question Navigator Dots */}
        <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
          {testWords.map((_, idx) => {
            const isAnswered = userAnswers[idx] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg font-mono font-bold text-xs transition-all ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 bg-blue-600 text-white scale-110 shadow-xs'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center mb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full uppercase">
            Question {currentIndex + 1}
          </span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight my-4">
            {currentWord.word}
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase">
            올바른 한글 뜻을 선택하세요
          </p>
        </div>

        {/* Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {currentOptions.map((opt, i) => {
            const isSelected = userAnswers[currentIndex] === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelectAnswer(opt)}
                className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Bottom Nav Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            이전 문제
          </button>

          {currentIndex === testWords.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/20"
            >
              시험 제출하기
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
            >
              다음 문제 &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Results Screen
  if (testState === 'results' && testResult) {
    const isPassed = testResult.score >= 80;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Results Banner */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center mb-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isPassed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <span
            className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase mb-2 ${
              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isPassed ? '🎉 PASS (합격)' : 'FAIL (불합격)'}
          </span>

          <h2 className="text-3xl font-black text-slate-900 mb-1">
            시험 점수: {testResult.score}점
          </h2>
          <p className="text-xs text-slate-500">
            응시 일시: {testResult.date} | 총 소요 시간: {formatTime(testResult.timeTakenSeconds)}
          </p>

          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold">총 문제 수</p>
              <p className="text-xl font-black text-slate-800 mt-1">{testResult.totalQuestions}개</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <p className="text-xs text-emerald-700 font-bold">맞힌 개수</p>
              <p className="text-xl font-black text-emerald-900 mt-1">{testResult.correctAnswers}개</p>
            </div>
            <div className="bg-red-50 p-3 rounded-2xl border border-red-200">
              <p className="text-xs text-red-700 font-bold">틀린 개수</p>
              <p className="text-xl font-black text-red-900 mt-1">{testResult.wrongWords.length}개</p>
            </div>
          </div>

          {/* Retest Wrong Words Action (Requirement 2.D.1) */}
          {testResult.wrongWords.length > 0 && (
            <button
              onClick={() => onRetestWrongWords(testResult.wrongWords)}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 text-base mb-3"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>틀린 단어만 모아서 재시험 보기 ({testResult.wrongWords.length}단어)</span>
            </button>
          )}

          <button
            onClick={() => setTestState('config')}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>새 시험 설정으로 돌아가기</span>
          </button>
        </div>

        {/* Wrong Words List Review */}
        {testResult.wrongWords.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span>오답 단어 노트 ({testResult.wrongWords.length})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {testResult.wrongWords.map((word, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 text-base mr-2">{word.word}</span>
                    <span className="text-xs text-slate-500 font-mono">{word.pos}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
