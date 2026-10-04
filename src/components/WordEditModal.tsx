import React, { useState, useEffect } from 'react';
import type { Word } from '../types/voca';
import { fetchWordDefinition } from '../utils/dictionaryApi';
import { formatTimestamp } from '../utils/dateFormatter';
import { X, Sparkles, Loader2, Save, BookOpen } from 'lucide-react';

interface WordEditModalProps {
  isOpen: boolean;
  wordToEdit: Word | null; // null if adding new word
  onClose: () => void;
  onSave: (wordData: Partial<Word>) => void;
}

export const WordEditModal: React.FC<WordEditModalProps> = ({
  isOpen,
  wordToEdit,
  onClose,
  onSave,
}) => {
  const [word, setWord] = useState('');
  const [pos, setPos] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (wordToEdit) {
      setWord(wordToEdit.word || '');
      setPos(wordToEdit.pos || '');
      setMeaning(wordToEdit.meaning || '');
      setExample(wordToEdit.example || '');
      setExampleMeaning(wordToEdit.exampleMeaning || '');
      setPhonetic(wordToEdit.phonetic || '');
    } else {
      setWord('');
      setPos('');
      setMeaning('');
      setExample('');
      setExampleMeaning('');
      setPhonetic('');
    }
    setApiError(null);
  }, [wordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAutoFill = async () => {
    if (!word.trim()) {
      setApiError('단어를 먼저 입력해주세요.');
      return;
    }
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const res = await fetchWordDefinition(word);
      if (res.pos && !pos) setPos(res.pos);
      if (res.meaning && !meaning) setMeaning(res.meaning);
      if (res.example && !example) setExample(res.example);
      if (res.exampleMeaning && !exampleMeaning) setExampleMeaning(res.exampleMeaning);
      if (res.phonetic) setPhonetic(res.phonetic);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '사전 조회에 실패했습니다.';
      setApiError(errorMessage);
    } finally {
      setIsLoadingApi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) {
      setApiError('영단어와 한글 뜻은 필수 입력 항목입니다.');
      return;
    }

    const now = formatTimestamp();
    onSave({
      ...(wordToEdit ? { id: wordToEdit.id, createdAt: wordToEdit.createdAt } : { id: `word_${Date.now()}`, createdAt: now }),
      word: word.trim(),
      pos: pos.trim() || undefined,
      meaning: meaning.trim(),
      example: example.trim() || undefined,
      exampleMeaning: exampleMeaning.trim() || undefined,
      phonetic: phonetic.trim() || undefined,
      updatedAt: now,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {wordToEdit ? '단어 수정' : '새 단어 추가'}
              </h3>
              <p className="text-xs text-slate-500">
                {wordToEdit ? `생성 일시: ${wordToEdit.createdAt}` : `저장 시점: ${formatTimestamp()}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {apiError}
            </div>
          )}

          {/* Word Input & Auto-fill button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                영단어 (English Word) *
              </label>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isLoadingApi || !word.trim()}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 border border-blue-200 transition-all disabled:opacity-50"
              >
                {isLoadingApi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span>사전 자동완성 (Auto-Fill)</span>
              </button>
            </div>
            <input
              type="text"
              value={word}
              onChange={e => setWord(e.target.value)}
              placeholder="예: opportunity"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          {/* POS & Phonetic Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                품사 (Part of Speech)
              </label>
              <input
                type="text"
                value={pos}
                onChange={e => setPos(e.target.value)}
                placeholder="예: n. / v. / adj."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                발음 기호 (Phonetic)
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={e => setPhonetic(e.target.value)}
                placeholder="예: /ˌɑː.pɚˈtuː.nə.t̬i/"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Meaning Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              한글 뜻 (Korean Meaning) *
            </label>
            <input
              type="text"
              value={meaning}
              onChange={e => setMeaning(e.target.value)}
              placeholder="예: 기회, 호기"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Example Sentence */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              영어 예문 (Example Sentence)
            </label>
            <textarea
              rows={2}
              value={example}
              onChange={e => setExample(e.target.value)}
              placeholder="예: Don't miss this great opportunity."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Example Meaning */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              예문 한글 해석 (Example Translation)
            </label>
            <input
              type="text"
              value={exampleMeaning}
              onChange={e => setExampleMeaning(e.target.value)}
              placeholder="예: 이 좋은 기회를 놓치지 마세요."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{wordToEdit ? '수정 내용 저장' : '단어 등록하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
