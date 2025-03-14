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
          console.log('Quiz completed, showing results with score:', quizState.score);
          console.log('Questions for results:', quizState.questions);
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
        
        if (!quizState.sections || quizState.sections.length === 0) {
          console.error("No sections available", { quizState });
          return (
            <div className="p-6 max-w-md mx-auto">
              <div className="text-quiz-red p-4 border border-quiz-red rounded-md bg-red-50">
                <h3 className="font-bold">Quiz Data Error</h3>
                <p>No sections found for this quiz. Please try again.</p>
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

        const currentSection = quizState.sections[quizState.currentSectionIndex];
        if (!currentSection || !currentSection.questions) {
          console.error("Invalid section or questions", { 
            sectionIndex: quizState.currentSectionIndex,
            sections: quizState.sections 
          });
          return (
            <div className="p-6 max-w-md mx-auto">
              <div className="text-quiz-red p-4 border border-quiz-red rounded-md bg-red-50">
                <h3 className="font-bold">Quiz Data Error</h3>
                <p>The selected section is not available. Please try again.</p>
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
        
        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) {
          console.error("No current question found", { 
            sectionIndex: quizState.currentSectionIndex,
            questionIndex: quizState.currentQuestionIndex,
            sections: quizState.sections 
          });
          
          return (
            <div className="p-6 max-w-md mx-auto">
              <div className="text-quiz-red p-4 border border-quiz-red rounded-md bg-red-50">
                <h3 className="font-bold">Quiz Content Error</h3>
                <p>No questions available for this section. Please try again or contact support.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-quiz-red text-white rounded hover:bg-quiz-red-light"
                >
                  Restart Quiz
                </button>
              </div>
            </div>
          );
        }
        
        const isLastSection = quizState.currentSectionIndex === quizState.sections.length - 1;
        
        return (
          <QuizContent
            currentQuestion={currentQuestion}
            currentQuestionIndex={quizState.currentQuestionIndex}
            totalQuestions={currentSection.questions.length}
            formatTimeRemaining={formatTimeRemaining}
            onOptionSelect={selectOption}
            onNext={nextQuestion}
            onPrevious={previousQuestion}
            onSubmit={handleSubmitPrompt}
            currentSectionTitle={currentSection.title || "Questions"}
            currentSection={quizState.currentSectionIndex + 1}
            totalSections={quizState.sections.length}
            isLastSection={isLastSection}
          />
        );
      }}
    </QuizStateProvider>
  );
};

export default Quiz;
