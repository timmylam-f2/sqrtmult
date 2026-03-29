/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Delete, 
  ArrowRight,
  Trophy,
  History
} from 'lucide-react';
import katex from 'katex';
import { 
  generateProblem, 
  parseUserInput, 
  areRadicalsEqual, 
  formatRadicalLatex,
  Problem,
  simplifyRadical
} from './utils/mathUtils';

const Latex = ({ formula, className = "" }: { formula: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [formula]);

  return <div ref={containerRef} className={className} />;
};

export default function App() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<{ question: string; answer: string; correct: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProblem(generateProblem());
  }, []);

  const handleNext = () => {
    setProblem(generateProblem());
    setUserInput('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!problem || !userInput) return;

    const parsed = parseUserInput(userInput);
    if (!parsed) {
      alert('請輸入有效的格式，例如：3√2 或 5');
      return;
    }

    const isCorrect = areRadicalsEqual(parsed, problem.answer);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setTotal(t => t + 1);
    
    setHistory(prev => [
      { 
        question: problem.latex, 
        answer: userInput, 
        correct: isCorrect 
      }, 
      ...prev.slice(0, 4)
    ]);
  };

  const insertSymbol = (symbol: string) => {
    setUserInput(prev => prev + symbol);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback) handleNext();
      else checkAnswer();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Calculator className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">二次根式乘除法練習</h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">當前得分</span>
            <span className="text-xl font-mono font-bold text-blue-600">{score} / {total}</span>
          </div>
          <Trophy className="text-amber-400 w-5 h-5" />
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-6">
        {/* Question Card */}
        <motion.div 
          layout
          className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex flex-col items-center gap-8">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-widest">計算下列算式</div>
            
            <AnimatePresence mode="wait">
              {problem && (
                <motion.div
                  key={problem.latex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-4xl md:text-5xl font-serif py-4"
                >
                  <Latex formula={problem.latex} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full flex flex-col gap-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="在此輸入答案..."
                  disabled={feedback !== null}
                  className={`w-full text-2xl font-mono p-6 rounded-2xl border-2 outline-none transition-all text-center
                    ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : 
                      feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : 
                      'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
                />
                
                {feedback && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {feedback === 'correct' ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Math Keyboard */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => insertSymbol('√')}
                  disabled={feedback !== null}
                  className="col-span-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 py-4 rounded-xl font-bold text-xl transition-colors"
                >
                  √
                </button>
                <button
                  onClick={() => setUserInput(prev => prev.slice(0, -1))}
                  disabled={feedback !== null}
                  className="col-span-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 py-4 rounded-xl flex justify-center items-center transition-colors"
                >
                  <Delete className="w-6 h-6" />
                </button>
                <div className="col-span-2">
                  {!feedback ? (
                    <button
                      onClick={checkAnswer}
                      className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                      檢查答案
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full h-full bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      下一題 <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {feedback === 'incorrect' && problem && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full p-4 bg-red-50 rounded-2xl border border-red-100 text-red-800 text-center"
              >
                <p className="text-sm font-bold uppercase tracking-wider mb-1">正確答案是</p>
                <div className="text-2xl">
                  <Latex formula={formatRadicalLatex(simplifyRadical(problem.answer))} />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* History / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <History className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-widest">最近練習</h2>
            </div>
            <div className="space-y-3">
              {history.length === 0 && (
                <p className="text-slate-400 text-sm italic">尚無練習記錄</p>
              )}
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="scale-75 origin-left">
                    <Latex formula={item.question} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold">{item.answer}</span>
                    {item.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">提示</div>
            <p className="text-slate-600 text-sm leading-relaxed">
              輸入答案時，請盡量化簡。例如：<br/>
              <code className="bg-slate-100 px-1 rounded">√8</code> 應輸入 <code className="bg-slate-100 px-1 rounded">2√2</code>。<br/>
              點擊 <span className="font-bold">√</span> 按鈕或直接輸入 <code className="bg-slate-100 px-1 rounded">√</code> 符號。
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl w-full">
              <p className="text-blue-700 text-xs font-bold">正確率</p>
              <p className="text-3xl font-bold text-blue-600">
                {total > 0 ? Math.round((score / total) * 100) : 0}%
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-12 text-slate-400 text-xs text-center">
        <p>© 2026 二次根式乘除法練習工具</p>
        <p className="mt-1">支持整數與最簡根式輸入</p>
      </footer>
    </div>
  );
}
