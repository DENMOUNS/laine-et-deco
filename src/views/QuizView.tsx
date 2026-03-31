import React, { useState } from 'react';
import { motion } from 'motion/react';

const questions = [
  {
    question: "Quel est votre style préféré ?",
    options: ["Minimaliste", "Bohème", "Industriel", "Scandinave"]
  },
  {
    question: "Quelles couleurs préférez-vous ?",
    options: ["Neutres", "Vives", "Pastels", "Sombres"]
  }
];

export const QuizView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz finished, show result
      alert(`Votre style est : ${answers[0] || 'Inconnu'}`);
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-8">Quiz Style Déco</h1>
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5">
        <h2 className="text-2xl font-bold mb-6">{questions[currentQuestion].question}</h2>
        <div className="grid grid-cols-1 gap-4">
          {questions[currentQuestion].options.map(option => (
            <button 
              key={option}
              onClick={() => handleAnswer(option)}
              className="bg-secondary/50 p-4 rounded-2xl hover:bg-accent/10 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
