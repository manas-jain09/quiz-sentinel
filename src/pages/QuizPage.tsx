
import Quiz from '@/components/Quiz';
import { useSearchParams } from 'react-router-dom';

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const quizId = searchParams.get('quizId') || '';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-quiz-red to-quiz-red-light">
          ArenaQuiz
        </h1>
        <Quiz userId={userId} quizId={quizId} />
      </div>
    </div>
  );
};

export default QuizPage;
