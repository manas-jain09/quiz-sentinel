
import Quiz from '@/components/Quiz';

const QuizPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-quiz-red to-quiz-red-light">
          Quiz Sentinel
        </h1>
        <Quiz />
      </div>
    </div>
  );
};

export default QuizPage;
