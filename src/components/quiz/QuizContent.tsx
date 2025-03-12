
import { Clock } from 'lucide-react';
import { QuizQuestion, QuizState } from '@/lib/types';
import QuizQuestion from '@/components/QuizQuestion';

interface QuizContentProps {
  currentQuestion: QuizQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  formatTimeRemaining: () => string;
  onOptionSelect: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

const QuizContent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  formatTimeRemaining,
  onOptionSelect,
  onNext,
  onPrevious,
  onSubmit
}: QuizContentProps) => {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

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
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onOptionSelect={onOptionSelect}
        onNext={onNext}
        onPrevious={onPrevious}
        onSubmit={onSubmit}
        isLastQuestion={isLastQuestion}
      />
    </div>
  );
};

export default QuizContent;
