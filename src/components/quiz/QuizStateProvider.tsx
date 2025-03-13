
import { ReactNode, useEffect, useState } from 'react';
import { QuizInstructions, QuizQuestion, UserInfo } from '@/lib/types';
import { useQuiz } from '@/hooks/useQuiz';
import { useFullScreen } from '@/hooks/useFullScreen';
import { useQuizData } from '@/hooks/useQuizData';
import { useQuizResults } from '@/hooks/useQuizResults';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import FullScreenAlert from '@/components/quiz/FullScreenAlert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizStateProviderProps {
  children: (state: QuizStateValues) => ReactNode;
}

interface QuizStateValues {
  quizData: any;
  quizLoading: boolean;
  quizError: string | null;
  userInfo: UserInfo | null;
  quizState: any;
  isWarningShown: boolean;
  showConfirmDialog: boolean;
  handleUserRegistration: (userData: UserInfo) => Promise<void>;
  startQuiz: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  selectOption: (questionId: string, optionId: string) => void;
  handleSubmitPrompt: () => void;
  formatTimeRemaining: () => string;
  handleReturnToFullScreen: () => void;
  setShowConfirmDialog: (show: boolean) => void;
  getCurrentQuestion: () => QuizQuestion | null;
}

export const QuizStateProvider = ({ children }: QuizStateProviderProps) => {
  const { quizData, quizLoading, quizError, fetchQuiz } = useQuizData();
  const { saveQuizResult } = useQuizResults();
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [localQuizError, setLocalQuizError] = useState<string | null>(null);

  const {
    quizState,
    setUser,
    startQuiz,
    nextQuestion,
    previousQuestion,
    selectOption,
    submitQuiz,
    formatTimeRemaining,
    handleCheatingDetected,
    getCurrentQuestion
  } = useQuiz(quizData.instructions, quizData.questions, quizData.sections);

  const {
    isFullScreen,
    isWarningShown,
    setIsWarningShown,
    requestFullScreen,
    exitFullScreen
  } = useFullScreen(handleCheatingDetected);

  const handleUserRegistration = async (userData: UserInfo) => {
    try {
      console.log('User registration with quiz code:', userData.quizCode);
      setLocalQuizError(null);
      setUserInfo(userData);
      setUser(userData);
      
      // Fetch quiz data
      await fetchQuiz(userData.quizCode);
      
      // Check if quiz data is valid
      if (!quizData.sections || quizData.sections.length === 0) {
        console.error("Quiz data invalid after fetch:", quizData);
        throw new Error("Unable to load quiz content. Please check the quiz code and try again.");
      }
      
      await fetchQuizId(userData.quizCode);
      console.log("Quiz loaded successfully", { quizData, quizState });
    } catch (error) {
      console.error('Error during user registration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz. Please check your quiz code and try again.';
      setLocalQuizError(errorMessage);
      toast.error(errorMessage);
      // Reset user info if there was an error loading the quiz
      setUserInfo(null);
    }
  };

  const fetchQuizId = async (quizCode: string) => {
    try {
      console.log('Fetching quiz ID for code:', quizCode);
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('code', quizCode)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching quiz ID:', error);
        throw new Error(`Error fetching quiz: ${error.message}`);
      }
      
      if (data) {
        console.log('Quiz ID found:', data.id);
        setQuizId(data.id);
      } else {
        console.error('No quiz found with code:', quizCode);
        throw new Error(`No quiz found with code: ${quizCode}`);
      }
    } catch (error) {
      console.error('Error fetching quiz ID:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (quizState.isCompleted && userInfo && quizId) {
      saveQuizResult(
        userInfo,
        quizId,
        quizState.score || 0,
        quizState.questions.length,
        quizState.isCheating
      );
    }
  }, [quizState.isCompleted, userInfo, quizId]);

  useEffect(() => {
    if (quizState.isStarted && !quizState.isCompleted && !isFullScreen) {
      requestFullScreen();
    }
  }, [quizState.isStarted, quizState.isCompleted, isFullScreen, requestFullScreen]);

  const handleSubmitPrompt = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    submitQuiz();
    setShowConfirmDialog(false);
    exitFullScreen();
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const handleReturnToFullScreen = () => {
    setIsWarningShown(false);
    requestFullScreen();
  };

  const state: QuizStateValues = {
    quizData,
    quizLoading,
    quizError: localQuizError || quizError,
    userInfo,
    quizState,
    isWarningShown,
    showConfirmDialog,
    handleUserRegistration,
    startQuiz,
    nextQuestion,
    previousQuestion,
    selectOption,
    handleSubmitPrompt,
    formatTimeRemaining,
    handleReturnToFullScreen,
    setShowConfirmDialog,
    getCurrentQuestion
  };

  return (
    <>
      {isWarningShown && (
        <FullScreenAlert onReturn={handleReturnToFullScreen} />
      )}
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSubmit}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSubmit}
              className="bg-quiz-red hover:bg-quiz-red-light"
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {children(state)}
    </>
  );
};
