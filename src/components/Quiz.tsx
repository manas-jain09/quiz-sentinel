
import { ReactNode } from 'react';
import QuizForm from './QuizForm';
import Instructions from './Instructions';
import QuizResults from './QuizResults';
import QuizContent from './quiz/QuizContent';
import { QuizStateProvider } from './quiz/QuizStateProvider';

const Quiz = () => {
  return (
    <QuizStateProvider>
      {(state) => {
        const {
          quizData,
          quizLoading,
          quizError,
          userInfo,
          quizState,
          handleUserRegistration,
          startQuiz,
          nextQuestion,
          previousQuestion,
          selectOption,
          handleSubmitPrompt,
          formatTimeRemaining,
          getCurrentQuestion
        } = state;

        if (quizLoading) {
          return <div className="flex justify-center items-center py-10">Loading quiz...</div>;
        }
        
        if (quizError) {
          return <div className="text-quiz-red p-4 border border-quiz-red rounded-md">{quizError}</div>;
        }
        
        if (!userInfo) {
          return <QuizForm onSubmit={handleUserRegistration} />;
        }
        
        if (quizState.isCompleted) {
          return (
            <QuizResults
              score={quizState.score || 0}
              totalQuestions={quizState.questions.length}
              userInfo={userInfo}
              questions={quizState.questions}
              isCheating={quizState.isCheating}
              onReturnHome={() => window.location.reload()}
            />
          );
        }
        
        if (!quizState.isStarted) {
          return (
            <Instructions
              instructions={quizData.instructions}
              userInfo={userInfo}
              onStart={startQuiz}
            />
          );
        }
        
        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) {
          return <div>Error: No questions available</div>;
        }
        
        const currentSection = quizState.sections[quizState.currentSectionIndex];
        const currentSectionQuestions = currentSection?.questions || [];
        
        return (
          <QuizContent
            currentQuestion={currentQuestion}
            currentQuestionIndex={quizState.currentQuestionIndex}
            totalQuestions={currentSectionQuestions.length}
            formatTimeRemaining={formatTimeRemaining}
            onOptionSelect={selectOption}
            onNext={nextQuestion}
            onPrevious={previousQuestion}
            onSubmit={handleSubmitPrompt}
            currentSectionTitle={currentSection?.title || "Questions"}
            currentSection={quizState.currentSectionIndex + 1}
            totalSections={quizState.sections.length}
          />
        );
      }}
    </QuizStateProvider>
  );
};

export default Quiz;
