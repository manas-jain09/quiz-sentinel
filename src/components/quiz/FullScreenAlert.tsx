
import { Button } from '@/components/ui/button';
import { AlertTriangle, Smartphone } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface FullScreenAlertProps {
  onReturn: () => void;
}

const FullScreenAlert = ({ onReturn }: FullScreenAlertProps) => {
  const isMobile = useIsMobile();

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
          {isMobile && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Mobile Device Detected</span>
              </div>
              <p className="text-sm mt-2 text-amber-700">
                For the best experience on mobile:
              </p>
              <ul className="text-xs mt-1 list-disc list-inside text-amber-700">
                <li>Rotate your device to portrait mode</li>
                <li>Close all other browser tabs</li>
                <li>Add this site to your home screen for full compatibility</li>
              </ul>
            </div>
          )}
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
