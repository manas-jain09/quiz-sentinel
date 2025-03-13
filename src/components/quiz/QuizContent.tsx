
import { Clock, BookOpen } from 'lucide-react';
import { QuizQuestion as QuestionType } from '@/lib/types';
import QuestionComponent from '@/components/QuizQuestion';

interface QuizContentProps {
  currentQuestion: QuestionType;
  currentQuestionIndex: number;
  totalQuestions: number;
  formatTimeRemaining: () => string;
  onOptionSelect: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  currentSectionTitle?: string;
  currentSection?: number;
  totalSections?: number;
}

const QuizContent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  formatTimeRemaining,
  onOptionSelect,
  onNext,
  onPrevious,
  onSubmit,
  currentSectionTitle = "General Questions",
  currentSection = 1,
  totalSections = 1
}: QuizContentProps) => {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="section-info flex items-center text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>Section {currentSection} of {totalSections}: {currentSectionTitle}</span>
        </div>
        <div className="timer-display px-4 py-2 bg-white shadow rounded-full flex items-center text-quiz-red">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatTimeRemaining()}</span>
        </div>
      </div>
      
      <QuestionComponent
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
