
import { UserInfo } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuizQuestion } from '@/lib/types';

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
      // First, save the overall quiz result
      const { data: studentResultData, error: resultError } = await supabase
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
      
      // Now, save individual student answers
      const studentAnswers = questions.map(question => ({
        student_result_id: studentResultData.id,
        question_id: question.id,
        selected_option_id: question.selectedOptionId,
        selected_option_text: question.selectedOptionId 
          ? question.options.find(opt => opt.id === question.selectedOptionId)?.text 
          : null,
        is_correct: question.selectedOptionId 
          ? question.options.find(opt => opt.id === question.selectedOptionId)?.isCorrect 
          : null,
        prn: userInfo.prn,
        quizId: quizId
      }));
      
      const { error: answersError } = await supabase
        .from('student_answers')
        .insert(studentAnswers);
        
      if (answersError) {
        console.error('Error saving student answers:', answersError);
        toast.error('Error saving your answer details');
      } else {
        toast.success('Quiz completed successfully!');
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast.error('Error saving your quiz result');
    }
  };

  return {
    saveQuizResult
  };
};
