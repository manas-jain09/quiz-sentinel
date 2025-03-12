
import { useState } from 'react';
import { UserInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface QuizFormProps {
  onSubmit: (userData: UserInfo) => void;
}

const QuizForm = ({ onSubmit }: QuizFormProps) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    email: '',
    prn: '',
    division: '',
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
    
    // Here you would verify the quiz code with Supabase
    // This is a placeholder for the actual implementation
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, we'll just pass the data through
      onSubmit(formData);
    } catch (error) {
      toast.error('Failed to join quiz. Please try again.');
      console.error('Error joining quiz:', error);
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
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Input
              id="division"
              name="division"
              placeholder="Your division"
              value={formData.division}
              onChange={handleChange}
              className="input-field"
              required
            />
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
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-quiz-red hover:bg-quiz-red-light"
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Continue"}
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
