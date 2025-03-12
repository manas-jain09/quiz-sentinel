<lov-codelov-code>
import { useEffect, useState } from 'react';
import { QuizInstructions, QuizQuestion as QuestionType } from '@/lib/types';
import { useQuiz } from '@/hooks/useQuiz';
import { useFullScreen } from '@/hooks/useFullScreen';
import Instructions from './Instructions';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizForm from './QuizForm';
import FullScreenAlert from './FullScreenAlert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

// Sample quiz data (in a real app this would come from Supabase)
const sampleInstructions: QuizInstructions = {
  title: "Web Development Fundamentals Quiz",
  description: "This quiz tests your knowledge of fundamental web development concepts including HTML, CSS, and JavaScript. Answer all questions to the best of your ability.",
  duration: 30, // 30 minutes
  totalQuestions: 5,
  passingScore: 3,
  additionalInfo: [
    "Each question has only one correct answer",
    "You may navigate between questions using the next and previous buttons",
    "Your answers are saved automatically as you progress through the quiz"
  ]
};

// Sample questions
const sampleQuestions: QuestionType[] = [
  {
    id: "q1",
    text: "What does HTML stand for?",
    options: [
      { id: "q1_a", text: "Hyper Text Markup Language", isCorrect: true },
      { id: "q1_b", text: "High Technical Modern Language", isCorrect: false },
      { id: "q1_c", text: "Hyper Transfer Markup Language", isCorrect: false },
      { id: "q1_d", text: "Hyperlink Text Management Language", isCorrect: false }
    ]
  },
  {
    id: "q2",
    text: "Which CSS property is used to control the spacing between elements?",
    options: [
      { id: "q2_a", text: "spacing", isCorrect: false },
      { id: "q2_b", text: "margin", isCorrect: true },
      { id: "q2_c", text: "padding-between", isCorrect: false },
      { id: "q2_d", text: "element-gap", isCorrect: false }
    ]
  },
  {
    id: "q3",
    text: "Which of the following is NOT a JavaScript data type?",
    options: [
      { id: "q3_a", text: "String", isCorrect: false },
      { id: "q3_b", text: "Boolean", isCorrect: false },
      { id: "q3_c", text: "Character", isCorrect: true },
      { id: "q3_d", text: "Object", isCorrect: false }
    ]
  },
  {
    id: "q4",
    text: "What is the correct way to comment in JavaScript?",
    options: [
      { id: "q4_a", text: "// This is a comment", isCorrect: true },
      { id: "q4_b", text: "<!-- This is a comment -->", isCorrect: false },
      { id: "q4_c", text: "/* This is a comment", isCorrect: false },
      { id: "q4_d", text: "# This is a comment", isCorrect: false }
    ]
  },
  {
    id: "q5",
    text: "Which CSS property changes the text color?",
    options: [
      { id: "q5_a", text: "font-color", isCorrect: false },
      { id: "q5_b", text: "text-color", isCorrect: false },
      { id: "q5_c", text: "text-style", isCorrect: false },
      { id: "q5_d", text: "color", isCorrect: true }
    ]
  }
];

const Quiz = () => {
  const {
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
  } = useQuiz(sampleInstructions, sampleQuestions);

  const {
    isFullScreen,
    isWarningShown,
    setIsWarningShown,
    requestFullScreen,
    exitFullScreen
  } = useFullScreen(handleCheatingDetected);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Request fullscreen when quiz starts
  useEffect(() => {
    if (quizState.isStarted && !quizState.isCompleted && !isFullScreen) {
      requestFullScreen();
    }
  }, [quizState.isStarted, quizState.isCompleted, isFullScreen, requestFullScreen]);

  // Handle quiz submission
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

  // Determine which component to render based on quiz state
  const renderContent = () => {
    // If user hasn't registered
    if (!userInfo) {
      return <QuizForm onSubmit={setUser} />;
    }
    
    // If quiz is completed, show results
    if (quizState.isCompleted) {
      return (
        <QuizResults
          score={quizState.score || 0}
          totalQuestions={quizState.questions.length}
          userInfo={userInfo}
          questions={quizState.questions}
          isCheating={quizState.isCheating}
          onReturnHome={() => window.location.reload()}
        />
      );
    }
    
    // If quiz hasn't started, show instructions
    if (!quizState.isStarted) {
      return (
        <Instructions
          instructions={sampleInstructions}
          userInfo={userInfo}
          onStart={startQuiz}
        />
      );
    }
    
    // Otherwise, show the current question
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;
    
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-center mb-4">
          <div className="timer-display">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTimeRemaining()}</span>
          </div>
        </div>
        
        <QuizQuestion
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          onOptionSelect={selectOption}
          onNext={nextQuestion}
          onPrevious={previousQuestion}
          onSubmit={handleSubmitPrompt}
          isLastQuestion={isLastQuestion}
        />
      </div>
    );
  };

  return (
    <div className="quiz-container pb-10">
      {renderContent()}
      
      {/* Fullscreen warning */}
      {isWarningShown && (
        <FullScreenAlert onReturn={handleReturnToFullScreen} />
      )}
      
      {/* Submission confirmation dialog */}
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
    </div>
  );
};

export default Quiz;
