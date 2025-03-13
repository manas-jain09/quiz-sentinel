
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="container max-w-4xl px-4 py-10 animate-slide-up">
        <div className="text-center space-y-6">
          <div className="inline-block mb-4">
            <div className="text-xs font-semibold text-quiz-red tracking-widest uppercase">Secure Assessment Platform</div>
            <h1 className="text-5xl md:text-6xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-quiz-red to-quiz-red-light">
              ArenaHQ Battlegrounds
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A secure quiz platform with anti-cheating features, designed for academic integrity and seamless assessment experiences.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Link to="/quiz">
              <Button 
                size="lg" 
                className="bg-quiz-red hover:bg-quiz-red-light flex items-center gap-2"
              >
                Take a Quiz
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Fullscreen Monitoring</h3>
              <p className="text-muted-foreground">Ensures students remain in fullscreen mode throughout the assessment</p>
            </div>
            
            <div className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Randomized Questions</h3>
              <p className="text-muted-foreground">Each student receives questions in a different order to prevent sharing</p>
            </div>
            
            <div className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Timed Assessments</h3>
              <p className="text-muted-foreground">Automatically submits when timer expires to enforce time limits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
