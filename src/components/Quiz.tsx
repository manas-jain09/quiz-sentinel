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
import { supabase } from '@/integrations/supabase/client';

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
  const [quizData, setQuizData] = useState<{ instructions: QuizInstructions, questions: QuestionType[] }>({
    instructions: {
      title: "",
      description: "",
      duration: 30,
      totalQuestions: 0,
      additionalInfo: []
    },
    questions: []
  });
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

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
  } = useQuiz(quizData.instructions, quizData.questions);

  const {
    isFullScreen,
    isWarningShown,
    setIsWarningShown,
    requestFullScreen,
    exitFullScreen
  } = useFullScreen(handleCheatingDetected);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchQuiz = async (quizCode: string) => {
    try {
      setQuizLoading(true);
      setQuizError(null);
      
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', quizCode)
        .single();
      
      if (quizError) throw new Error(quizError.message);
      if (!quizData) throw new Error('Quiz not found');
      
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('display_order');
      
      if (sectionsError) throw new Error(sectionsError.message);
      
      let allQuestions: QuestionType[] = [];
      
      for (const section of sectionsData) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('section_id', section.id)
          .order('display_order');
          
        if (questionsError) throw new Error(questionsError.message);
        
        for (const question of questionsData) {
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .eq('question_id', question.id)
            .order('display_order');
            
          if (optionsError) throw new Error(optionsError.message);
          
          allQuestions.push({
            id: question.id,
            text: question.text,
            options: optionsData.map(option => ({
              id: option.id,
              text: option.text,
              isCorrect: option.is_correct
            }))
          });
        }
      }
      
      allQuestions = allQuestions.map(question => ({
        ...question,
        options: [...question.options].sort(() => Math.random() - 0.5)
      }));
      
      setQuizData({
        instructions: {
          title: quizData.title,
          description: quizData.instructions || '',
          duration: quizData.duration,
          totalQuestions: allQuestions.length,
          additionalInfo: []
        },
        questions: allQuestions
      });
      
      setQuizLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setQuizError(error instanceof Error ? error.message : 'Failed to load quiz');
      setQuizLoading(false);
    }
  };

  const saveQuizResult = async () => {
    if (!userInfo || !quizState.isCompleted) return;
    
    try {
      const { data, error } = await supabase
        .from('student_results')
        .insert({
          name: userInfo.name,
          email: userInfo.email,
          prn: userInfo.prn,
          division: userInfo.division,
          quiz_id: (await supabase.from('quizzes').select('id').eq('code', userInfo.quizCode).single()).data?.id,
          marks_scored: quizState.score || 0,
          total_marks: quizState.questions.length,
          cheating_status: quizState.isCheating ? 'caught-cheating' : 'no-issues'
        });
        
      if (error) {
        console.error('Error saving quiz result:', error);
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const handleUserRegistration = (userData: typeof userInfo) => {
    setUser(userData);
    if (userData?.quizCode) {
      fetchQuiz(userData.quizCode);
    }
  };

  useEffect(() => {
    if (quizState.isCompleted) {
      saveQuizResult();
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

  const renderContent = () => {
    if (quizLoading) {
      return <div className="flex justify-center items-center py-10">Loading quiz...</div>;
    }
    
    if (quizError) {
      return <div className="text-quiz-red p-4 border border-quiz-red rounded-md">{quizError}</div>;
    }
    
    if (!userInfo) {
      return <QuizForm onSubmit={handleUserRegistration} />;
    }
    
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
    
    if (!quizState.isStarted) {
      return (
        <Instructions
          instructions={quizData.instructions}
          userInfo={userInfo}
          onStart={startQuiz}
        />
      );
    }
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;
    
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-center mb-4">
          <div className="timer-display px-4 py-2 bg-white shadow rounded-full flex items-center text-quiz-red">
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
    </div>
  );
};

export default Quiz;
