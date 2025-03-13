
import { QuizInstructions, UserInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Info, AlertTriangle } from 'lucide-react';

interface InstructionsProps {
  instructions: QuizInstructions;
  userInfo: UserInfo;
  onStart: () => void;
}

const Instructions = ({ instructions, userInfo, onStart }: InstructionsProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto animate-slide-up shadow-lg border-gray-100">
      <CardHeader className="space-y-1">
        <div className="uppercase text-xs font-semibold text-quiz-red tracking-wide mb-2">Quiz Instructions</div>
        <CardTitle className="text-2xl font-bold">{instructions.title}</CardTitle>
        <CardDescription>
          Welcome, <span className="font-medium">{userInfo.name}</span>! Please read the following instructions carefully before proceeding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-base">{instructions.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-quiz-red flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">Duration</h4>
              <p className="text-sm text-muted-foreground">
                {instructions.duration} minutes
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-quiz-red flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">Total Questions</h4>
              <p className="text-sm text-muted-foreground">
                {instructions.totalQuestions} questions
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary p-4 rounded-md">
          <h3 className="text-sm font-semibold mb-2">Important Rules:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-quiz-red flex-shrink-0 mt-0.5" />
              <span>The quiz will run in fullscreen mode. Exiting fullscreen twice or staying out of fullscreen for more than 30 seconds will terminate the quiz.</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-quiz-red flex-shrink-0 mt-0.5" />
              <span>The quiz will be automatically submitted when the timer expires.</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-quiz-red flex-shrink-0 mt-0.5" />
              <span>Once submitted, you cannot retake or modify your answers.</span>
            </li>
          </ul>
        </div>
        
        {instructions.additionalInfo && (
          <div className="border-t pt-4">
           
            <ul className="space-y-1 text-sm list-disc pl-5">
              {instructions.additionalInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button 
          onClick={onStart} 
          size="lg"
          className="bg-quiz-red hover:bg-quiz-red-light"
        >
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Instructions;
