
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from './use-mobile';

export const useFullScreen = (onCheatingDetected: () => void) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenExitCount, setFullScreenExitCount] = useState(0);
  const [fullScreenExitTime, setFullScreenExitTime] = useState<number | null>(null);
  const [isWarningShown, setIsWarningShown] = useState(false);
  const isMobile = useIsMobile();

  // Function to check if the document is in fullscreen mode
  const checkFullScreen = useCallback(() => {
    // For desktop browsers
    const standardFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    // For iOS Safari and some mobile browsers that don't support standard fullscreen API
    const mobileFullscreen = isMobile && (
      window.navigator.standalone || // iOS home screen web app
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.innerHeight === window.screen.height) // Rough estimate for fullscreen on mobile
    );

    return standardFullscreen || mobileFullscreen;
  }, [isMobile]);

  // Function to request fullscreen
  const requestFullScreen = useCallback(() => {
    const elem = document.documentElement;
    
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }

      // Special handling for mobile
      if (isMobile) {
        // For iOS devices, provide instructions if fullscreen isn't supported
        if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
          toast.info("For best experience on iOS, add this page to your home screen and open it from there", {
            duration: 5000,
          });
        }
        
        // Try to enter fullscreen with screen orientation API for better mobile experience
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            (screen.orientation as any).lock('portrait');
          } catch (e) {
            console.warn("Could not lock screen orientation:", e);
          }
        }
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      toast.error("Couldn't enter fullscreen mode. Please try again or use a different browser.");
    }
  }, [isMobile]);

  // Function to exit fullscreen
  const exitFullScreen = useCallback(() => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      
      // Release orientation lock if it was set
      if (screen.orientation && (screen.orientation as any).unlock) {
        try {
          (screen.orientation as any).unlock();
        } catch (e) {
          console.warn("Could not unlock screen orientation:", e);
        }
      }
    } catch (error) {
      console.error("Exiting fullscreen failed:", error);
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
    
    // For mobile, we need additional checks since fullscreen events might not fire
    if (isMobile) {
      window.addEventListener('resize', handleFullScreenChange);
      window.addEventListener('orientationchange', handleFullScreenChange);
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
      
      if (isMobile) {
        window.removeEventListener('resize', handleFullScreenChange);
        window.removeEventListener('orientationchange', handleFullScreenChange);
      }
    };
  }, [handleFullScreenChange, isMobile]);

  return {
    isFullScreen,
    fullScreenExitCount,
    isWarningShown,
    setIsWarningShown,
    requestFullScreen,
    exitFullScreen
  };
};
