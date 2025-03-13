
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

        if (!userInfo) {
          return <QuizForm onSubmit={handleUserRegistration} loading={quizLoading} />;
        }
        
        if (quizLoading) {
          return <div className="flex justify-center items-center py-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-quiz-red/30 mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <p className="mt-4 text-gray-600">Loading quiz data...</p>
            </div>
          </div>;
        }
        
        if (quizError) {
          console.error("Quiz error:", quizError);
          return (
            <div className="p-6 max-w-md mx-auto">
              <div className="text-quiz-red p-4 border border-quiz-red rounded-md bg-red-50">
                <h3 className="font-bold">Error Loading Quiz</h3>
                <p>{quizError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-quiz-red text-white rounded hover:bg-quiz-red-light"
                >
                  Try Again
                </button>
              </div>
            </div>
          );
        }
        
        // Check if we have quiz data before proceeding
        if (!quizData || !quizData.sections || quizData.sections.length === 0) {
          return (
            <div className="p-6 max-w-md mx-auto">
              <div className="text-quiz-red p-4 border border-quiz-red rounded-md bg-red-50">
                <h3 className="font-bold">Quiz Data Error</h3>
                <p>Unable to load quiz content. The quiz may not exist or may have been removed.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-quiz-red text-white rounded hover:bg-quiz-red-light"
                >
                  Try Again
                </button>
              </div>
            </div>
          );
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
          console.error("No current question found", { 
            sectionIndex: quizState.currentSectionIndex,
            questionIndex: quizState.currentQuestionIndex,
            sections: quizState.sections 
          });
          
          return <div className="p-4 text-center">
            <div className="text-red-500 mb-2">Error: No questions available</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-quiz-red text-white rounded"
            >
              Restart Quiz
            </button>
          </div>;
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
