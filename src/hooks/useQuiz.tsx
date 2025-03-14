import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizInstructions, QuizQuestion, QuizSection, UserInfo } from '@/lib/types';
import { formatInTimeZone } from 'date-fns-tz';

interface QuizState {
  user: UserInfo | null;
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestionIndex: number;
  currentSectionIndex: number;
  startTime: Date | null;
  endTime: Date | null;
  timeRemaining: number;
  score: number | null;
  questions: QuizQuestion[];
  sections: QuizSection[];
  isCheating: boolean;
}

export const useQuiz = (instructions: QuizInstructions, questions: QuizQuestion[], sections: QuizSection[]) => {
  const [quizState, setQuizState] = useState<QuizState>({
    user: null,
    isStarted: false,
    isCompleted: false,
    currentQuestionIndex: 0,
    currentSectionIndex: 0,
    startTime: null,
    endTime: null,
    timeRemaining: instructions.duration * 60,
    score: null,
    questions: questions,
    sections: sections,
    isCheating: false,
  });

  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const setUser = (user: UserInfo) => {
    setQuizState(prevState => ({ ...prevState, user: user }));
  };

  const initializeQuiz = (instructions: QuizInstructions, questions: QuizQuestion[], sections: QuizSection[]) => {
    setQuizState({
      user: quizState.user,
      isStarted: false,
      isCompleted: false,
      currentQuestionIndex: 0,
      currentSectionIndex: 0,
      startTime: null,
      endTime: null,
      timeRemaining: instructions.duration * 60,
      score: null,
      questions: questions,
      sections: sections,
      isCheating: false,
    });
  };

  const startQuiz = () => {
    setQuizState(prevState => ({
      ...prevState,
      isStarted: true,
      startTime: new Date(),
    }));

    timerInterval.current = setInterval(() => {
      setQuizState(prevState => {
        if (prevState.timeRemaining <= 0) {
          clearInterval(timerInterval.current!);
          submitQuiz();
          return prevState;
        }

        return {
          ...prevState,
          timeRemaining: prevState.timeRemaining - 1,
        };
      });
    }, 1000);
  };

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prevState => ({
        ...prevState,
        currentQuestionIndex: prevState.currentQuestionIndex + 1,
      }));
    } else if (quizState.currentSectionIndex < quizState.sections.length - 1) {
      // Move to the next section
      setQuizState(prevState => ({
        ...prevState,
        currentSectionIndex: prevState.currentSectionIndex + 1,
        currentQuestionIndex: 0, // Reset question index to the first question of the new section
      }));
    }
  };

  const previousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prevState => ({
        ...prevState,
        currentQuestionIndex: prevState.currentQuestionIndex - 1,
      }));
    }
  };

  const selectOption = (questionId: string, optionId: string) => {
    setQuizState(prevState => ({
      ...prevState,
      questions: prevState.questions.map(question => {
        if (question.id === questionId) {
          return { ...question, selectedOptionId: optionId };
        }
        return question;
      }),
    }));
  };

  const submitQuiz = () => {
    clearInterval(timerInterval.current!);
    const correctAnswers = quizState.questions.filter(
      question => {
        const selectedOption = question.options.find(option => option.id === question.selectedOptionId);
        return selectedOption && selectedOption.isCorrect;
      }
    ).length;

    setQuizState(prevState => ({
      ...prevState,
      isCompleted: true,
      endTime: new Date(),
      score: correctAnswers,
      timeRemaining: 0
    }));
  };

  const handleCheatingDetected = () => {
    setQuizState(prevState => ({
      ...prevState,
      isCheating: true,
    }));
    clearInterval(timerInterval.current!);
    submitQuiz();
  };

  const getCurrentQuestion = (): QuizQuestion | null => {
    if (!quizState.questions || quizState.questions.length === 0) {
      return null;
    }
    return quizState.questions[quizState.currentQuestionIndex];
  };
  
  const formatTimeRemaining = useCallback(() => {
    if (!quizState.timeRemaining) return "00:00";
    
    const minutes = Math.floor(quizState.timeRemaining / 60);
    const seconds = quizState.timeRemaining % 60;
    
    // Format in IST timezone
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getTime() + quizState.timeRemaining * 1000);
    
    // Using the time component only from the date
    return formatInTimeZone(
      targetDate,
      'Asia/Kolkata', // IST timezone
      'mm:ss'
    ).slice(-5); // Take only the last 5 characters (mm:ss)
  }, [quizState.timeRemaining]);

  return {
    quizState,
    setUser,
    initializeQuiz,
    startQuiz,
    nextQuestion,
    previousQuestion,
    selectOption,
    submitQuiz,
    formatTimeRemaining,
    handleCheatingDetected,
    getCurrentQuestion,
  };
};
