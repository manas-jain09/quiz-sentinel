
import { QuizQuestion, UserInfo } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Clock, Check, X } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  userInfo: UserInfo;
  questions: QuizQuestion[];
  isCheating: boolean;
  onReturnHome: () => void;
}

const QuizResults = ({
  score,
  totalQuestions,
  userInfo,
  questions,
  isCheating,
  onReturnHome
}: QuizResultsProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getScoreColor = () => {
    if (isCheating) return 'text-destructive';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-destructive';
  };

  const getScoreMessage = () => {
    if (isCheating) return 'Quiz Terminated - Cheating Detected';
    if (percentage >= 80) return 'Excellent Performance!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Fair Attempt';
    return 'Needs Improvement';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-slide-up shadow-lg border-gray-100">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isCheating ? (
          <div className="flex justify-center items-center p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-destructive mr-4" />
            <div>
              <h3 className="text-lg font-bold text-destructive">Quiz Terminated</h3>
              <p className="text-sm text-muted-foreground">
                Anti-cheating measures detected suspicious activity
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
              {score} / {totalQuestions}
            </div>
            <div className={`text-xl font-medium ${getScoreColor()}`}>
              {percentage}% - {getScoreMessage()}
            </div>
          </div>
        )}

        <div className="border-t border-b py-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Name:</span>
            <span className="text-sm">{userInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm">{userInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">PRN:</span>
            <span className="text-sm">{userInfo.prn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Year:</span>
            <span className="text-sm">{userInfo.year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Batch:</span>
            <span className="text-sm">{userInfo.batch}</span>
          </div>
        </div>

        {!isCheating && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Question Summary</h3>
            <div className="space-y-2">
              {questions.map((question, index) => {
                const selectedOption = question.options.find(
                  opt => opt.id === question.selectedOptionId
                );
                const isCorrect = selectedOption?.isCorrect;
                
              
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button 
          onClick={onReturnHome}
          className="bg-quiz-red hover:bg-quiz-red-light"
        >
          Return to Home
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizResults;
