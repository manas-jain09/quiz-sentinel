
import { UserInfo, QuizQuestion } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQuizResults = () => {
  const saveQuizResult = async (
    userInfo: UserInfo,
    quizId: string | null,
    score: number,
    totalQuestions: number,
    isCheating: boolean,
    questions: QuizQuestion[]
  ) => {
    if (!userInfo || !quizId) {
      console.error('Missing user info or quiz ID for saving results');
      return;
    }
    
    try {
      // First save the overall quiz result
      const { data: resultData, error: resultError } = await supabase
        .from('student_results')
        .insert({
          name: userInfo.name,
          email: userInfo.email,
          prn: userInfo.prn,
          year: userInfo.year,
          batch: userInfo.batch,
          quiz_id: quizId,
          marks_scored: score,
          total_marks: totalQuestions,
          cheating_status: isCheating ? 'caught-cheating' : 'no-issues'
        })
        .select('id')
        .single();
        
      if (resultError) {
        console.error('Error saving quiz result:', resultError);
        toast.error('Error saving your quiz result');
        return;
      }

      // Then save individual answers
      const studentAnswers = questions.map(question => ({
        student_result_id: resultData.id,
        question_id: question.id,
        selected_option_id: question.selectedOptionId || null,
        is_correct: question.selectedOptionId 
          ? question.options.find(opt => opt.id === question.selectedOptionId)?.isCorrect || false
          : null
      }));

      const { error: answersError } = await supabase
        .from('student_answers')
        .insert(studentAnswers);

      if (answersError) {
        console.error('Error saving answers:', answersError);
        toast.error('Error saving your answers');
        return;
      }

      toast.success('Quiz completed successfully!');
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast.error('Error saving your quiz result');
    }
  };

  return {
    saveQuizResult
  };
};
