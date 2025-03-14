
import { useState, useEffect, useCallback } from 'react';
import { QuizState, QuizQuestion, QuizInstructions, UserInfo, QuizSection } from '@/lib/types';
import { toast } from 'sonner';

// Helper function to shuffle options
const shuffleOptions = (questions: QuizQuestion[]): QuizQuestion[] => {
  return questions.map(question => ({
    ...question,
    options: [...question.options].sort(() => Math.random() - 0.5)
  }));
};

export const useQuiz = (instructions: QuizInstructions, sampleQuestions: QuizQuestion[], sampleSections: QuizSection[]) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    isStarted: false,
    isCompleted: false,
    currentQuestionIndex: 0,
    currentSectionIndex: 0,
    timeRemaining: (instructions?.duration || 30) * 60, // Convert minutes to seconds, default to 30 mins
    questions: shuffleOptions(sampleQuestions || []),
    sections: sampleSections || [],
    isFullScreenExitWarningShown: false,
    fullScreenExitCount: 0,
    fullScreenExitTime: null,
    isCheating: false
  });

  // Set user information
  const setUser = useCallback((user: UserInfo) => {
    setUserInfo(user);
  }, []);

  // Initialize quiz with new data
  const initializeQuiz = useCallback((
    newInstructions: QuizInstructions, 
    newQuestions: QuizQuestion[], 
    newSections: QuizSection[]
  ) => {
    console.log('Initializing quiz with:', { 
      instructionsLength: newInstructions ? Object.keys(newInstructions).length : 0,
      questionsCount: newQuestions ? newQuestions.length : 0, 
      sectionsCount: newSections ? newSections.length : 0 
    });
    
    setQuizState(prev => ({
      ...prev,
      timeRemaining: (newInstructions?.duration || 30) * 60,
      questions: shuffleOptions(newQuestions || []),
      sections: newSections || [],
      currentQuestionIndex: 0,
      currentSectionIndex: 0
    }));
  }, []);

  // Start the quiz
  const startQuiz = useCallback(() => {
    console.log('Starting quiz with sections:', quizState.sections);
    
    if (!quizState.sections || quizState.sections.length === 0) {
      console.error('Cannot start quiz: No sections available');
      toast.error('Quiz data is not properly loaded. Please try again.');
      return;
    }
    
    setQuizState(prev => ({
      ...prev,
      isStarted: true
    }));
  }, [quizState.sections]);

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
    setQuizState(prev => {
      const currentSection = prev.sections[prev.currentSectionIndex];
      
      if (!currentSection || !currentSection.questions) {
        console.error('Cannot navigate: Invalid section or questions');
        return prev;
      }
      
      const isLastQuestionInSection = prev.currentQuestionIndex === currentSection.questions.length - 1;
      
      if (isLastQuestionInSection) {
        // If last question in section, move to next section
        if (prev.currentSectionIndex < prev.sections.length - 1) {
          return {
            ...prev,
            currentSectionIndex: prev.currentSectionIndex + 1,
            currentQuestionIndex: 0
          };
        }
      } else {
        // Move to next question in current section
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        };
      }
      
      return prev; // No change if already at the last question of the last section
    });
  }, []);

  // Navigate to the previous question
  const previousQuestion = useCallback(() => {
    setQuizState(prev => {
      if (prev.currentQuestionIndex > 0) {
        // If not the first question in section, go to previous question
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1
        };
      } else if (prev.currentSectionIndex > 0) {
        // If first question but not first section, go to last question of previous section
        const previousSection = prev.sections[prev.currentSectionIndex - 1];
        return {
          ...prev,
          currentSectionIndex: prev.currentSectionIndex - 1,
          currentQuestionIndex: previousSection.questions.length - 1
        };
      }
      
      return prev; // No change if already at the first question
    });
  }, []);

  // Get the current question based on current section and question index
  const getCurrentQuestion = useCallback(() => {
    if (!quizState.sections || quizState.sections.length === 0) {
      console.log('No sections available in quiz state', quizState);
      return null;
    }
    
    const currentSection = quizState.sections[quizState.currentSectionIndex];
    if (!currentSection || !currentSection.questions) {
      console.log('Invalid current section in quiz state', { 
        sectionIndex: quizState.currentSectionIndex, 
        sections: quizState.sections 
      });
      return null;
    }
    
    if (currentSection.questions.length === 0) {
      console.log('No questions in current section', currentSection);
      return null;
    }
    
    if (quizState.currentQuestionIndex >= currentSection.questions.length) {
      console.log('Current question index out of bounds', { 
        currentQuestionIndex: quizState.currentQuestionIndex, 
        questionsLength: currentSection.questions.length 
      });
      return null;
    }
    
    return currentSection.questions[quizState.currentQuestionIndex];
  }, [quizState.sections, quizState.currentSectionIndex, quizState.currentQuestionIndex]);

  // Handle option selection
  const selectOption = useCallback((questionId: string, optionId: string) => {
    setQuizState(prev => {
      // Update in both questions array and sections array
      const updatedQuestions = prev.questions.map(q => 
        q.id === questionId ? { ...q, selectedOptionId: optionId } : q
      );
      
      const updatedSections = prev.sections.map(section => ({
        ...section,
        questions: section.questions.map(q => 
          q.id === questionId ? { ...q, selectedOptionId: optionId } : q
        )
      }));
      
      return {
        ...prev,
        questions: updatedQuestions,
        sections: updatedSections
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
    console.log('Submitting quiz with questions:', quizState.questions);
    try {
      const score = calculateScore();
      console.log('Calculated score:', score);
      
      setQuizState(prev => {
        console.log('Updating quiz state with score:', score);
        return {
          ...prev,
          isCompleted: true,
          score
        };
      });

      return score;
    } catch (error) {
      console.error('Error in submitQuiz:', error);
      throw error;
    }
  }, [calculateScore, quizState.questions]);

  return {
    quizState,
    userInfo,
    setUser,
    initializeQuiz,
    startQuiz,
    nextQuestion,
    previousQuestion,
    selectOption,
    submitQuiz,
    formatTimeRemaining,
    handleCheatingDetected,
    getCurrentQuestion
  };
};
