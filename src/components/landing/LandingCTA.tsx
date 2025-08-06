
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Rocket, Users, Award, BookOpen, Star } from 'lucide-react';

interface LandingCTAProps {
  onSignUp: () => void;
}

export const LandingCTA = ({ onSignUp }: LandingCTAProps) => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 lg:p-16">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="flex justify-center">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 text-base border-0">
                  <Rocket className="w-5 h-5 mr-2" />
                  Ready to Excel in Your Interviews?
                </Badge>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold max-w-5xl mx-auto leading-tight">
                  Join the{' '}
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    AI Learning Revolution
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Transform your interview skills with personalized AI tutoring that adapts to your learning style and goals.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid md:grid-cols-4 gap-8 py-8">
                {[
                  { icon: Users, stat: '1000+', label: 'Students Helped' },
                  { icon: Award, stat: '95%', label: 'Success Rate' },
                  { icon: BookOpen, stat: '24/7', label: 'Available' },
                  { icon: Star, stat: '4.9/5', label: 'Rating' }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-primary/20 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{item.stat}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg" 
                  onClick={onSignUp}
                  className="text-xl px-10 py-6 h-auto gap-3 group shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Start Your AI Tutoring Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  Watch Student Success Stories
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap justify-center items-center gap-8 pt-8">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-success/10 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-primary/10 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>Start practicing in under 2 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-accent/20 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span>No subscription required</span>
                </div>
              </div>

              {/* Final Testimonial */}
              <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 rounded-2xl p-8 mt-12 max-w-4xl mx-auto">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl font-medium text-foreground italic mb-4">
                  "The AI feedback is incredibly detailed and helped my son improve his confidence dramatically. 
                  He went from being nervous to excited about his 11+ interview!"
                </blockquote>
                <div className="text-muted-foreground">
                  <div className="font-semibold">Emma Thompson</div>
                  <div className="text-sm">Parent of successful 11+ student</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
