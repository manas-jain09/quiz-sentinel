
import { QuizQuestion as QuestionType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizQuestionProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  onOptionSelect: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
  isLastSection?: boolean;
  showSubmitButton?: boolean;
}

const QuizQuestion = ({
  question,
  questionNumber,
  totalQuestions,
  onOptionSelect,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
  isLastSection = false,
  showSubmitButton = false
}: QuizQuestionProps) => {
  const handleSelectOption = (optionId: string) => {
    onOptionSelect(question.id, optionId);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-in shadow-md border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <CardTitle className="text-xl font-semibold">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        {question.imageUrl && (
          <div className="mb-4 flex justify-center">
            <img 
              src={question.imageUrl} 
              alt="Question image" 
              className="max-w-full rounded-md object-contain max-h-64"
            />
          </div>
        )}
        <RadioGroup 
          value={question.selectedOptionId} 
          onValueChange={handleSelectOption}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`option-button ${option.id === question.selectedOptionId ? 'option-selected' : ''}`}
            >
              <RadioGroupItem 
                value={option.id} 
                id={option.id} 
                className="peer sr-only" 
              />
              <Label
                htmlFor={option.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-5 h-5 border-2 rounded-full border-gray-300 flex items-center justify-center">
                  {option.id === question.selectedOptionId && (
                    <div className="w-2.5 h-2.5 bg-quiz-red rounded-full" />
                  )}
                </div>
                <div className="text-base">{option.text}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={questionNumber === 1}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {showSubmitButton ? (
          <Button 
            onClick={onSubmit} 
            className="bg-quiz-red hover:bg-quiz-red-light flex items-center gap-1"
          >
            Submit
            <Send className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={onNext}
            className="bg-quiz-red hover:bg-quiz-red-light flex items-center gap-1"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;
