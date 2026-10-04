import React, { useState, useRef } from 'react';
import type { Word, DelimiterType, TxtParseResult } from '../types/voca';
import { parseTxtContent } from '../utils/txtParser';
import { Upload, X, CheckCircle2, AlertTriangle, FileText, Settings } from 'lucide-react';

interface TxtImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportWords: (words: Partial<Word>[]) => void;
}

export const TxtImportModal: React.FC<TxtImportModalProps> = ({
  isOpen,
  onClose,
  onImportWords,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [delimiter, setDelimiter] = useState<DelimiterType>('auto');
  const [parseResult, setParseResult] = useState<TxtParseResult | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string, delim: DelimiterType = delimiter) => {
    setRawText(text);
    if (text.trim()) {
      const result = parseTxtContent(text, delim);
      setParseResult(result);
    } else {
      setParseResult(null);
    }
  };

  const handleDelimiterChange = (newDelim: DelimiterType) => {
    setDelimiter(newDelim);
    if (rawText.trim()) {
      const result = parseTxtContent(rawText, newDelim);
      setParseResult(result);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFinalizeImport = () => {
    if (parseResult && parseResult.parsedWords.length > 0) {
      onImportWords(parseResult.parsedWords);
      onClose();
      setRawText('');
      setParseResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">TXT 파일 텍스트 일괄 단어 등록</h3>
              <p className="text-xs text-slate-500">
                구분자(콜론, 탭, 쉼표 등)를 사용하여 여러 단어를 한 번에 가져옵니다.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.csv"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              .txt 파일을 이 곳에 드래그하거나 클릭하여 선택하세요
            </p>
            <p className="text-xs text-slate-400 mt-1">
              예시 형식: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">apple : 사과</code> 또는{' '}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">apple \t n. \t 사과 \t 예문</code>
            </p>
          </div>

          {/* Delimiter Selector & Raw Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-blue-500" /> 구분자 설정 (Delimiter)
              </label>
              <div className="flex space-x-1">
                {(
                  [
                    ['auto', '자동 감지'],
                    ['colon', '콜론 ( : )'],
                    ['tab', '탭 ( Tab )'],
                    ['comma', '쉼표 ( , )'],
                    ['equal', '이콜 ( = )'],
                    ['hyphen', '하이픈 ( - )'],
                  ] as [DelimiterType, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDelimiterChange(key)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      delimiter === key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              value={rawText}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={`단어 텍스트를 직접 붙여넣으세요.\n\neffort : n. : 노력, 수고 : Success requires constant effort.\nfocus : v. : 집중하다\nhonest : adj. : 정직한`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Real-time Preview Table */}
          {parseResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <div className="flex items-center space-x-2 text-sm font-semibold text-blue-900">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span>파싱 결과: 총 {parseResult.validCount}개 유효 단어</span>
                  {parseResult.detectedDelimiter && (
                    <span className="text-xs bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-md font-mono">
                      감지된 구분자: '{parseResult.detectedDelimiter}'
                    </span>
                  )}
                </div>
                {parseResult.errorCount > 0 && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 오류 {parseResult.errorCount}개
                  </span>
                )}
              </div>

              {/* Error messages if any */}
              {parseResult.errors.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1 max-h-24 overflow-y-auto">
                  <p className="font-bold mb-1 text-amber-950">오류 라인 상세:</p>
                  {parseResult.errors.map((err, idx) => (
                    <p key={idx}>
                      <span className="font-mono font-bold">Line {err.line}:</span> {err.rawText} &rarr;{' '}
                      <span className="text-red-600">{err.reason}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* Table Preview */}
              {parseResult.parsedWords.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">영단어 (Word)</th>
                        <th className="py-2 px-3">품사 (POS)</th>
                        <th className="py-2 px-3">한글 뜻 (Meaning)</th>
                        <th className="py-2 px-3">예문 (Example)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.parsedWords.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{item.word}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono">{item.pos || '-'}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{item.meaning}</td>
                          <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">
                            {item.example || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleFinalizeImport}
            disabled={!parseResult || parseResult.validCount === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all"
          >
            단어장에 {parseResult?.validCount || 0}개 단어 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};
