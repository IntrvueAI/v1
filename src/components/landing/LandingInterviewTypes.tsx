
import { GraduationCap, MessageCircle, Plus, BookOpen, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const LandingInterviewTypes = () => {
  const interviewTypes = [
    {
      icon: GraduationCap,
      title: "11+ School Interviews",
      description: "Master grammar school and private school entrance interviews with confidence",
      available: true,
      popular: true,
      features: ["Academic questioning", "Confidence building", "School-specific prep", "Mock scenarios"],
      studentCount: "500+",
      successRate: "94%"
    },
    {
      icon: MessageCircle,
      title: "IELTS Speaking Test",
      description: "Excel in your IELTS speaking examination with targeted practice sessions",
      available: true,
      popular: false,
      features: ["All 3 parts covered", "Band score prediction", "Accent improvement", "Fluency training"],
      studentCount: "300+",
      successRate: "91%"
    },
    {
      icon: Plus,
      title: "More Coming Soon",
      description: "We're expanding our AI tutoring to cover more exam types and interviews",
      available: false,
      popular: false,
      features: ["University interviews", "Job interview prep", "Professional exams", "Custom scenarios"],
      studentCount: "Soon",
      successRate: "Coming"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium text-sm">Specialized AI Tutoring</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold">
            Choose Your Learning Path
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI tutors specialize in different types of interviews and exams, providing targeted preparation for your specific goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {interviewTypes.map((type, index) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={index} 
                className={`relative group transition-all duration-500 border-2 overflow-hidden ${
                  type.popular 
                    ? 'border-primary/30 shadow-lg hover:shadow-2xl hover:border-primary/50' 
                    : type.available 
                    ? 'border-border hover:border-primary/20 hover:shadow-xl' 
                    : 'border-border/50 opacity-75'
                } ${type.available ? 'hover:scale-105' : ''}`}
              >
                {type.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {!type.available && (
                  <div className="absolute -top-3 right-4 z-10">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground border">
                      Coming Soon
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center transition-all duration-500 ${
                      type.available 
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20' 
                        : 'bg-muted/50'
                    }`}>
                      <IconComponent className={`w-10 h-10 transition-all duration-500 ${
                        type.available 
                          ? 'text-primary group-hover:scale-110' 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{type.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  {type.available && (
                    <div className="flex justify-center gap-8 py-4 border-y border-border/50">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="font-bold text-primary">{type.studentCount}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Star className="w-4 h-4 text-success" />
                          <span className="font-bold text-success">{type.successRate}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      What You'll Master
                    </h4>
                    <ul className="space-y-2">
                      {type.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            type.available ? 'bg-primary' : 'bg-muted-foreground'
                          }`} />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    {type.available ? (
                      <Button 
                        className="w-full group/btn" 
                        variant={type.popular ? "default" : "outline"}
                        size="lg"
                      >
                        <span>Start {type.title}</span>
                        <div className="ml-2 transition-transform group-hover/btn:translate-x-1">→</div>
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        size="lg" 
                        disabled
                      >
                        Notify Me When Available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-accent/20 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              New interview types added monthly - 
              <span className="text-primary ml-1">sign up to stay updated!</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
