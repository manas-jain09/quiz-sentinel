
import { useState, useEffect, useCallback } from 'react';
import { QuizState, QuizQuestion, QuizInstructions, UserInfo } from '@/lib/types';
import { toast } from 'sonner';

// Helper function to shuffle options
const shuffleOptions = (questions: QuizQuestion[]): QuizQuestion[] => {
  return questions.map(question => ({
    ...question,
    options: [...question.options].sort(() => Math.random() - 0.5)
  }));
};

export const useQuiz = (instructions: QuizInstructions, sampleQuestions: QuizQuestion[]) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    isStarted: false,
    isCompleted: false,
    currentQuestionIndex: 0,
    timeRemaining: instructions.duration * 60, // Convert minutes to seconds
    questions: shuffleOptions(sampleQuestions),
    isFullScreenExitWarningShown: false,
    fullScreenExitCount: 0,
    fullScreenExitTime: null,
    isCheating: false
  });

  // Set user information
  const setUser = useCallback((user: UserInfo) => {
    setUserInfo(user);
  }, []);

  // Start the quiz
  const startQuiz = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      isStarted: true
    }));
  }, []);

  // Handle timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (quizState.isStarted && !quizState.isCompleted && quizState.timeRemaining > 0) {
      timer = setInterval(() => {
        setQuizState(prev => {
          if (prev.timeRemaining <= 1) {
            // Time's up, submit quiz automatically
            clearInterval(timer as NodeJS.Timeout);
            submitQuiz();
            toast.warning("Time's up! Quiz submitted automatically", {
              duration: 5000,
            });
            return {
              ...prev,
              timeRemaining: 0,
              isCompleted: true
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizState.isStarted, quizState.isCompleted, quizState.timeRemaining]);

  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(quizState.timeRemaining / 60);
    const seconds = quizState.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [quizState.timeRemaining]);

  // Navigate to the next question
  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  }, [quizState.currentQuestionIndex, quizState.questions.length]);

  // Navigate to the previous question
  const previousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  }, [quizState.currentQuestionIndex]);

  // Handle option selection
  const selectOption = useCallback((questionId: string, optionId: string) => {
    setQuizState(prev => {
      const updatedQuestions = prev.questions.map(q => 
        q.id === questionId ? { ...q, selectedOptionId: optionId } : q
      );
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  }, []);

  // Handle cheating detection
  const handleCheatingDetected = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      isCompleted: true,
      isCheating: true
    }));
  }, []);

  // Calculate score
  const calculateScore = useCallback((): number => {
    const correctAnswers = quizState.questions.filter(question => {
      const selectedOption = question.options.find(opt => opt.id === question.selectedOptionId);
      return selectedOption && selectedOption.isCorrect;
    }).length;
    
    return correctAnswers;
  }, [quizState.questions]);

  // Submit the quiz
  const submitQuiz = useCallback(() => {
    const score = calculateScore();
    
    setQuizState(prev => ({
      ...prev,
      isCompleted: true,
      score
    }));

    // Here you would integrate with Supabase to save the results
    // This is a placeholder for the actual implementation
    console.log('Quiz submitted', { userInfo, score, answers: quizState.questions });

    return score;
  }, [calculateScore, quizState.questions, userInfo]);

  return {
    quizState,
    userInfo,
    setUser,
    startQuiz,
    nextQuestion,
    previousQuestion,
    selectOption,
    submitQuiz,
    formatTimeRemaining,
    handleCheatingDetected
  };
};
