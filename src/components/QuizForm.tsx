
import { useState } from 'react';
import { UserInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface QuizFormProps {
  onSubmit: (userData: UserInfo) => Promise<void>;
  loading?: boolean;
}

const QuizForm = ({ onSubmit, loading = false }: QuizFormProps) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    email: '',
    prn: '',
    year: '',
    batch: '',
    quizCode: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.prn || !formData.division || !formData.quizCode) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Pass the data to parent component for quiz loading
      await onSubmit(formData);
    } catch (error) {
      console.error('Error joining quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join quiz. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up shadow-lg border-gray-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Join Quiz</CardTitle>
        <CardDescription className="text-center">
          Enter your details to start the quiz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Rahul"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isLoading || loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@mitwpu.edu.in"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isLoading || loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prn">PRN</Label>
            <Input
              id="prn"
              name="prn"
              placeholder="Your PRN number"
              value={formData.prn}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isLoading || loading}
            />
          </div>
          
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full rounded-md border-gray-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 h-10 px-3 py-2 text-sm ${errors.year ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                >
                  <option value="">Select Year</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                  <option value="Fourth">Fourth</option>
                </select>
                {errors.year && <p className="text-contest-red text-xs mt-1">{errors.year}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="Enter your batch"
                  className={`form-input-highlight ${errors.batch ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                />
                {errors.batch && <p className="text-contest-red text-xs mt-1">{errors.batch}</p>}
              </div>
          
          <div className="space-y-2">
            <Label htmlFor="quizCode">Quiz Code</Label>
            <Input
              id="quizCode"
              name="quizCode"
              placeholder="Enter quiz code"
              value={formData.quizCode}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isLoading || loading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-quiz-red hover:bg-quiz-red-light"
            disabled={isLoading || loading}
          >
            {isLoading || loading ? "Joining..." : "Continue"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Make sure to enter the correct quiz code provided by your instructor
      </CardFooter>
    </Card>
  );
};

export default QuizForm;
