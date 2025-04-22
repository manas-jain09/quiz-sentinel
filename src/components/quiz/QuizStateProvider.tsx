
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
import { useLocation, useNavigate } from "react-router-dom"; // for path and redirect

interface QuizStateProviderProps {
  children: (state: QuizStateValues) => ReactNode;
}

// Separate explicit type definition to avoid recursive type references
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
  handleReturnHome: () => void;
  mode?: "assessment" | "practice";
}

export const QuizStateProvider = ({ children }: QuizStateProviderProps) => {
  // Add location, navigation
  const location = typeof window !== "undefined"
    ? window.location
    : { search: "" };
  const navigate = useNavigate();

  // Parse query params for user id and quiz id
  const query = new URLSearchParams(location.search);
  const practiceUserId = query.get("userId") || "";
  const practiceQuizId = query.get("quizId") || "";

  // Track mode: "assessment" or "practice"
  const [mode, setMode] = useState<"assessment" | "practice">("assessment");
  const [practiceUserVerified, setPracticeUserVerified] = useState(false);

  const { quizData, quizLoading, quizError, fetchQuiz } = useQuizData();
  const { saveQuizResult } = useQuizResults();
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [localQuizError, setLocalQuizError] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);

  const {
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
    getCurrentQuestion
  } = useQuiz(quizData.instructions, quizData.questions, quizData.sections);

  const {
    isFullScreen,
    isWarningShown,
    setIsWarningShown,
    requestFullScreen,
    exitFullScreen
  } = useFullScreen(handleCheatingDetected);

  useEffect(() => {
    if (quizData && quizData.sections && quizData.sections.length > 0 && !dataInitialized) {
      console.log('Initializing quiz with data:', quizData);
      initializeQuiz(quizData.instructions, quizData.questions, quizData.sections);
      setDataInitialized(true);
    }
  }, [quizData, dataInitialized, initializeQuiz]);

  const handleUserRegistration = async (userData: UserInfo) => {
    try {
      console.log('User registration with quiz code:', userData.quizCode);
      setLocalQuizError(null);
      setUserInfo(userData);
      setUser(userData);
      
      const sections = await fetchQuiz(userData.quizCode, userData.prn);
      
      if (!sections || sections.length === 0) {
        console.error("Quiz data invalid after fetch:", { sections });
        throw new Error("Unable to load quiz content. Please check the quiz code and try again.");
      }
      
      await fetchQuizId(userData.quizCode);
      console.log("Quiz loaded successfully", { quizData, sections });
    } catch (error) {
      console.error('Error during user registration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz. Please check your quiz code and try again.';
      setLocalQuizError(errorMessage);
      toast.error(errorMessage);
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
    if (
      quizState.isCompleted &&
      userInfo &&
      quizId &&
      mode !== "practice"
    ) {
      saveQuizResult(
        userInfo,
        quizId,
        quizState.score || 0,
        quizState.questions.length,
        quizState.isCheating,
        quizState.questions
      );
    }
  }, [
    quizState.isCompleted,
    userInfo,
    quizId,
    saveQuizResult,
    quizState.score,
    quizState.questions,
    quizState.isCheating,
    mode
  ]);

  useEffect(() => {
    if (
      quizState.isStarted &&
      !quizState.isCompleted &&
      !isFullScreen &&
      mode !== "practice"
    ) {
      requestFullScreen();
    }
  }, [
    quizState.isStarted,
    quizState.isCompleted,
    isFullScreen,
    requestFullScreen,
    mode
  ]);

  const handleSubmitPrompt = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    try {
      submitQuiz();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('There was an error submitting your quiz. Please try again.');
      setShowConfirmDialog(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const handleReturnToFullScreen = () => {
    setIsWarningShown(false);
    requestFullScreen();
  };

  const handleReturnHome = () => {
    exitFullScreen();
    window.location.href = "https://quiz.arenahq-mitwpu.in/";
  };

  // Practice mode check
  useEffect(() => {
    if (
      practiceUserId &&
      practiceQuizId &&
      typeof practiceQuizId === "string"
    ) {
      setMode("practice");
      // Verify user id before allowing start
      (async () => {
        const { data: user, error } = await supabase
          .from("users")
          .select("id")
          .eq("id", practiceUserId)
          .maybeSingle();
        if (error || !user) {
          window.location.href = "https://astra.ikshvaku-innovations.in";
        } else {
          setPracticeUserVerified(true);
        }
      })();
    } else {
      setMode("assessment");
    }
  }, [practiceUserId, practiceQuizId]);

  // On practice mode, auto load quizData if not loaded
  useEffect(() => {
    if (
      mode === "practice" &&
      practiceUserVerified &&
      !quizLoading &&
      (!quizData.sections || quizData.sections.length === 0)
    ) {
      // Use fetchQuiz with quiz id (by code for compatibility)
      fetchQuiz(practiceQuizId, "practice-user-dummyprn").catch(() => {
        window.location.href = "https://astra.ikshvaku-innovations.in";
      });
    }
  }, [mode, practiceQuizId, practiceUserVerified, fetchQuiz, quizData.sections, quizLoading]);

  // Create the state object without self-references
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
    getCurrentQuestion,
    handleReturnHome,
    // Add practice helpers:
    mode
  };

  // Do NOT render modals/timers/warnings in practice mode
  return (
    <>
      {mode !== "practice" && isWarningShown && (
        <FullScreenAlert onReturn={handleReturnToFullScreen} />
      )}

      {mode !== "practice" && (
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
      )}

      {children(state)}
    </>
  );
};
