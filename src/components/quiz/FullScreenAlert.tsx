
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FullScreenAlertProps {
  onReturn: () => void;
}

const FullScreenAlert = ({ onReturn }: FullScreenAlertProps) => {
  return (
    <div className="fullscreen-warning">
      <Card className="max-w-md w-full bg-white animate-slide-up">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Warning: Fullscreen Required
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-base">
            You have exited fullscreen mode. This is your first warning.
          </p>
          <p className="text-sm mt-3 font-medium">
            Important: If you exit fullscreen mode again or remain outside fullscreen for more than 30 seconds, your quiz will be terminated.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onReturn} 
            className="w-full bg-quiz-red hover:bg-quiz-red-light"
          >
            Return to Fullscreen
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FullScreenAlert;
