
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Brain, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LandingHeroProps {
  onSignUp: () => void;
}

export const LandingHero = ({ onSignUp }: LandingHeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-primary/5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/20 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 py-20 max-w-7xl relative z-10">
        <div className="text-center space-y-8 mb-16">
          {/* Badge */}
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 text-sm font-medium border-0">
            <Brain className="w-4 h-4 mr-2" />
            Powered by Advanced AI Technology
          </Badge>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto">
              Practice Interviews with{' '}
              <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                AI Tutors
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master 11+ interviews and IELTS speaking tests with personalized AI feedback. 
              Build confidence through unlimited practice sessions.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={onSignUp}
              className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Learning Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 h-auto border-2 hover:bg-primary/5 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Trusted by 1000+ students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>95% success rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Available 24/7</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="aspect-video bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 flex items-center justify-center relative">
              {/* Mock Interview Interface */}
              <div className="absolute inset-4 bg-background/95 rounded-2xl border flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                    <span className="text-sm font-medium">11+ Interview Practice</span>
                  </div>
                  <div className="text-sm text-muted-foreground">AI Interviewer</div>
                </div>
                
                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                      <Play className="w-10 h-10 text-primary ml-1" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Interactive AI Interview</h3>
                      <p className="text-muted-foreground text-sm">Click to start your practice session</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-accent/5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Real-time feedback</span>
                    <span>Personalized scoring</span>
                    <span>Unlimited attempts</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-primary/15 to-accent/15 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          </div>
        </div>
      </div>
    </section>
  );
};
