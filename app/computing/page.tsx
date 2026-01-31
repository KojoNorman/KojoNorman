'use client'; 

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import confetti from 'canvas-confetti'; 
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// COMPUTING QUESTIONS
const questions = [
  {
    id: 1,
    question: "Which of these is an OUTPUT device?",
    options: ["Keyboard", "Mouse", "Monitor", "Microphone"],
    correct: "Monitor"
  },
  {
    id: 2,
    question: "Which part is known as the 'Brain' of the computer?",
    options: ["Hard Drive", "CPU", "RAM", "Fan"],
    correct: "CPU"
  },
  {
    id: 3,
    question: "What does 'RAM' stand for?",
    options: ["Read Access Memory", "Random Access Memory", "Run All Morning", "Real Active Memory"],
    correct: "Random Access Memory"
  }
];

export default function ComputingQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentStep].correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      }
    }, 1500);
  };

  return (
    // Changed background to Purple to match the Computing Card
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4">
      
      <Link href="/dashboard" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-purple-600 transition">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <div className="w-full max-w-lg">
        
        {!showResult && (
          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold text-gray-400 mb-2">
              <span>Question {currentStep + 1} / {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-purple-500" // Purple Progress Bar
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8 min-h-[400px] flex flex-col justify-center">
          
          {showResult ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💾</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Computing Master!</h2>
              <p className="text-gray-500 mb-8">You scored {score} out of {questions.length}</p>
              
              <Link href="/">
                <button className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition w-full">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          ) : (
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentStep}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-tight">
                  {questions[currentStep].question}
                </h2>

                <div className="space-y-3">
                  {questions[currentStep].options.map((option) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === questions[currentStep].correct;
                    
                    let bgStyle = "bg-gray-50 hover:bg-gray-100 border-gray-200";
                    if (isAnswered) {
                      if (isSelected && isCorrect) bgStyle = "bg-green-100 border-green-500 text-green-700";
                      else if (isSelected && !isCorrect) bgStyle = "bg-red-100 border-red-500 text-red-700";
                      else if (!isSelected && isCorrect) bgStyle = "bg-green-50 border-green-200 text-green-600 opacity-70";
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={isAnswered}
                        className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all flex justify-between items-center ${bgStyle}`}
                      >
                        {option}
                        {isAnswered && isSelected && (
                          isCorrect ? <CheckCircle size={20} className="text-green-600"/> : <XCircle size={20} className="text-red-600"/>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}