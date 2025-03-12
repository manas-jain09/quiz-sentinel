
import { useState, useEffect } from 'react';
import { QuizInstructions, QuizQuestion } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface QuizData {
  instructions: QuizInstructions;
  questions: QuizQuestion[];
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
    questions: []
  });
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const fetchQuiz = async (quizCode: string) => {
    try {
      setQuizLoading(true);
      setQuizError(null);
      
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', quizCode)
        .single();
      
      if (quizError) throw new Error(quizError.message);
      if (!quizData) throw new Error('Quiz not found');
      
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('display_order');
      
      if (sectionsError) throw new Error(sectionsError.message);
      
      let allQuestions: QuizQuestion[] = [];
      
      for (const section of sectionsData) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('section_id', section.id)
          .order('display_order');
          
        if (questionsError) throw new Error(questionsError.message);
        
        for (const question of questionsData) {
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .eq('question_id', question.id)
            .order('display_order');
            
          if (optionsError) throw new Error(optionsError.message);
          
          allQuestions.push({
            id: question.id,
            text: question.text,
            options: optionsData.map(option => ({
              id: option.id,
              text: option.text,
              isCorrect: option.is_correct
            }))
          });
        }
      }
      
      allQuestions = allQuestions.map(question => ({
        ...question,
        options: [...question.options].sort(() => Math.random() - 0.5)
      }));
      
      setQuizData({
        instructions: {
          title: quizData.title,
          description: quizData.instructions || '',
          duration: quizData.duration,
          totalQuestions: allQuestions.length,
          additionalInfo: []
        },
        questions: allQuestions
      });
      
      setQuizLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setQuizError(error instanceof Error ? error.message : 'Failed to load quiz');
      setQuizLoading(false);
    }
  };

  return {
    quizData,
    quizLoading,
    quizError,
    fetchQuiz
  };
};
