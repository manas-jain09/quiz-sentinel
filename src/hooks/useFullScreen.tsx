
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useFullScreen = (onCheatingDetected: () => void) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenExitCount, setFullScreenExitCount] = useState(0);
  const [fullScreenExitTime, setFullScreenExitTime] = useState<number | null>(null);
  const [isWarningShown, setIsWarningShown] = useState(false);

  // Function to check if the document is in fullscreen mode
  const checkFullScreen = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }, []);

  // Function to request fullscreen
  const requestFullScreen = useCallback(() => {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  }, []);

  // Function to exit fullscreen
  const exitFullScreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }, []);

  // Handler for fullscreen change
  const handleFullScreenChange = useCallback(() => {
    const isCurrentlyFullScreen = checkFullScreen();
    setIsFullScreen(isCurrentlyFullScreen);

    // If exited fullscreen and quiz is in progress
    if (!isCurrentlyFullScreen) {
      setFullScreenExitCount(prev => prev + 1);
      setFullScreenExitTime(Date.now());

      if (fullScreenExitCount === 0) {
        // First exit - show warning
        setIsWarningShown(true);
        toast.warning("Warning: Please return to fullscreen mode to continue the quiz", {
          duration: 5000,
        });
      } else if (fullScreenExitCount >= 1) {
        // Second exit - mark as cheating
        onCheatingDetected();
        toast.error("Quiz terminated: Multiple fullscreen exits detected", {
          duration: 5000,
        });
      }
    } else {
      // Reset the exit time when returning to fullscreen
      setFullScreenExitTime(null);
    }
  }, [checkFullScreen, fullScreenExitCount, onCheatingDetected]);

  // Effect to check fullscreen status after 30 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (fullScreenExitTime !== null) {
      timer = setTimeout(() => {
        if (!checkFullScreen()) {
          // User has been outside fullscreen for 30+ seconds
          onCheatingDetected();
          toast.error("Quiz terminated: Extended period outside fullscreen", {
            duration: 5000,
          });
        }
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fullScreenExitTime, checkFullScreen, onCheatingDetected]);

  // Add fullscreen change event listeners
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [handleFullScreenChange]);

  return {
    isFullScreen,
    fullScreenExitCount,
    isWarningShown,
    setIsWarningShown,
    requestFullScreen,
    exitFullScreen
  };
};
