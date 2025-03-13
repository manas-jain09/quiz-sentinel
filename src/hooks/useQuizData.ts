
import { useState, useEffect } from 'react';
import { QuizInstructions, QuizQuestion, QuizSection } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizData {
  instructions: QuizInstructions;
  questions: QuizQuestion[];
  sections: QuizSection[];
}

export const useQuizData = () => {
  const [quizData, setQuizData] = useState<QuizData>({
    instructions: {
      title: "",
      description: "",
      duration: 30,
      totalQuestions: 0,
      additionalInfo: []
    },
    questions: [],
    sections: []
  });
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const fetchQuiz = async (quizCode: string) => {
    try {
      setQuizLoading(true);
      setQuizError(null);
      
      console.log('Fetching quiz with code:', quizCode);
      
      // Get the quiz data
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', quizCode)
        .maybeSingle();
      
      if (quizError) {
        console.error('Quiz fetch error:', quizError);
        throw new Error(`Error fetching quiz: ${quizError.message}`);
      }
      
      if (!quizData) {
        console.error('Quiz not found with code:', quizCode);
        throw new Error(`Quiz not found with code: ${quizCode}`);
      }
      
      console.log('Quiz data found:', quizData);
      
      // Check if the quiz is active based on start and end dates
      const now = new Date();
      const startDate = quizData.start_date_time ? new Date(quizData.start_date_time) : null;
      const endDate = quizData.end_date_time ? new Date(quizData.end_date_time) : null;
      
      if (startDate && now < startDate) {
        throw new Error(`This quiz is not active yet. It starts on ${startDate.toLocaleString()}`);
      }
      
      if (endDate && now > endDate) {
        throw new Error(`This quiz has ended on ${endDate.toLocaleString()}`);
      }
      
      // Fetch the sections for this quiz
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('display_order');
      
      if (sectionsError) {
        console.error('Sections fetch error:', sectionsError);
        throw new Error(`Error fetching sections: ${sectionsError.message}`);
      }
      
      if (!sectionsData || sectionsData.length === 0) {
        console.error('No sections found for quiz ID:', quizData.id);
        throw new Error('No sections found for this quiz');
      }
      
      console.log('Sections found:', sectionsData.length);
      
      let allQuestions: QuizQuestion[] = [];
      let quizSections: QuizSection[] = [];
      
      // For each section, fetch its questions
      for (const section of sectionsData) {
        console.log('Fetching questions for section:', section.id);
        
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('section_id', section.id)
          .order('display_order');
          
        if (questionsError) {
          console.error('Questions fetch error:', questionsError);
          throw new Error(`Error fetching questions: ${questionsError.message}`);
        }
        
        if (!questionsData || questionsData.length === 0) {
          console.warn('No questions found for section:', section.id);
          continue;
        }
        
        console.log('Questions found for section:', questionsData.length);
        
        const sectionQuestions: QuizQuestion[] = [];
        
        // For each question, fetch its options
        for (const question of questionsData) {
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .eq('question_id', question.id)
            .order('display_order');
            
          if (optionsError) {
            console.error('Options fetch error for question', question.id, optionsError);
            throw new Error(`Error fetching options: ${optionsError.message}`);
          }
          
          if (!optionsData || optionsData.length === 0) {
            console.warn('No options found for question:', question.id);
            continue;
          }
          
          console.log('Options found for question:', optionsData.length);
          
          const formattedQuestion: QuizQuestion = {
            id: question.id,
            text: question.text,
            sectionId: section.id,
            options: optionsData.map(option => ({
              id: option.id,
              text: option.text,
              isCorrect: option.is_correct
            }))
          };
          
          // Shuffle options
          formattedQuestion.options = [...formattedQuestion.options].sort(() => Math.random() - 0.5);
          
          allQuestions.push(formattedQuestion);
          sectionQuestions.push(formattedQuestion);
        }
        
        if (sectionQuestions.length > 0) {
          quizSections.push({
            id: section.id,
            title: section.title,
            instructions: section.instructions || undefined,
            questions: sectionQuestions
          });
        }
      }
      
      if (allQuestions.length === 0) {
        throw new Error('No questions found for this quiz');
      }
      
      console.log('Total questions loaded:', allQuestions.length);
      console.log('Total sections loaded:', quizSections.length);
      
      setQuizData({
        instructions: {
          title: quizData.title,
          description: quizData.instructions || '',
          duration: quizData.duration,
          totalQuestions: allQuestions.length,
          additionalInfo: []
        },
        questions: allQuestions,
        sections: quizSections
      });
      
      setQuizLoading(false);
      return quizSections; // Return the sections to the caller
    } catch (error) {
      console.error('Error fetching quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz';
      setQuizError(errorMessage);
      toast.error(errorMessage);
      setQuizLoading(false);
      throw error;
    }
  };

  return {
    quizData,
    quizLoading,
    quizError,
    fetchQuiz
  };
};
