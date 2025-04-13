
import { UserInfo } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQuizResults = () => {
  const saveQuizResult = async (
    userInfo: UserInfo,
    quizId: string | null,
    score: number,
    totalQuestions: number,
    isCheating: boolean
  ) => {
    if (!userInfo || !quizId) {
      console.error('Missing user info or quiz ID for saving results');
      return;
    }
    
    try {
      const { error } = await supabase
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
        });
        
      if (error) {
        console.error('Error saving quiz result:', error);
        toast.error('Error saving your quiz result');
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
