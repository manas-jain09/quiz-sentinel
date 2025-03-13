
import { ReactNode, useEffect, useState } from 'react';
import { QuizInstructions, QuizQuestion, UserInfo } from '@/lib/types';
import { useQuiz } from '@/hooks/useQuiz';
import { useFullScreen } from '@/hooks/useFullScreen';
import { useQuizData } from '@/hooks/useQuizData';
import { useQuizResults } from '@/hooks/useQuizResults';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import FullScreenAlert from '@/components/quiz/FullScreenAlert';
import { supabase } from '@/integrations/supabase/client';

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
  handleUserRegistration: (userData: UserInfo) => void;
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

  const handleUserRegistration = (userData: UserInfo) => {
    setUser(userData);
    if (userData?.quizCode) {
      fetchQuiz(userData.quizCode);
      fetchQuizId(userData.quizCode);
    }
  };

  const fetchQuizId = async (quizCode: string) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('code', quizCode)
        .maybeSingle();
      
      if (data && !error) {
        setQuizId(data.id);
      }
    } catch (error) {
      console.error('Error fetching quiz ID:', error);
    }
  };

  useEffect(() => {
    if (quizState.isCompleted && userInfo) {
      saveQuizResult(
        userInfo,
        quizId,
        quizState.score || 0,
        quizState.questions.length,
        quizState.isCheating
      );
    }
  }, [quizState.isCompleted]);

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
    quizError,
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
