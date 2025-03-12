
import { UserInfo } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export const useQuizResults = () => {
  const saveQuizResult = async (
    userInfo: UserInfo,
    quizId: string | null,
    score: number,
    totalQuestions: number,
    isCheating: boolean
  ) => {
    if (!userInfo) return;
    
    try {
      const { error } = await supabase
        .from('student_results')
        .insert({
          name: userInfo.name,
          email: userInfo.email,
          prn: userInfo.prn,
          division: userInfo.division,
          quiz_id: quizId,
          marks_scored: score,
          total_marks: totalQuestions,
          cheating_status: isCheating ? 'caught-cheating' : 'no-issues'
        });
        
      if (error) {
        console.error('Error saving quiz result:', error);
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  return {
    saveQuizResult
  };
};
