
export interface UserInfo {
  name: string;
  email: string;
  prn: string;
  division: string;
  quizCode: string;
}

export interface QuizInstructions {
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore?: number;
  additionalInfo?: string[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  selectedOptionId?: string;
  sectionId?: string;
  imageUrl?: string;
}

export interface QuizSection {
  id: string;
  title: string;
  instructions?: string;
  questions: QuizQuestion[];
}

export interface QuizState {
  isStarted: boolean;
  isCompleted: boolean;
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  questions: QuizQuestion[];
  sections: QuizSection[];
  currentSectionIndex: number;
  score?: number;
  isFullScreenExitWarningShown: boolean;
  fullScreenExitCount: number;
  fullScreenExitTime: number | null;
  isCheating: boolean;
}
