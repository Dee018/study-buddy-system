import React from 'react';
import { Card, CardContent } from './ui/card';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { Footer } from './Footer';
import { BookOpen, Target, Users, Zap } from 'lucide-react';

interface AboutProps {
  onNavigate: (screen: string) => void;
}

export function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Logo Section */}
            <div className="flex justify-center">
              <div className="transition-transform duration-500 hover:scale-110 float-animate">
                <StudyBuddyLogo 
                  size="lg" 
                  animate={true} 
                  variant="floating"
                  withBackground={true}
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-4 px-4">
              <h1>About Study Buddy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your intelligent companion for mastering Java programming through adaptive learning and personalized guidance.
              </p>
            </div>

            {/* Mission Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-8 md:p-10 space-y-4">
                <h2 className="text-2xl text-center">Our Mission</h2>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Study Buddy is designed to revolutionize the way students learn Java programming. 
                  We combine cutting-edge AI technology with proven educational methodologies to create 
                  a personalized learning experience that adapts to your pace and learning style.
                </p>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/10 via-primary/10 to-accent/5 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl">Comprehensive Curriculum</h3>
                  <p className="text-sm text-muted-foreground">
                    From Java fundamentals to advanced topics, our 8-module structured curriculum covers everything you need to become proficient.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/10 via-primary/10 to-accent/5 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl">Adaptive Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI-powered system adapts to your learning pace, providing personalized feedback and content delivery.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/10 via-primary/10 to-accent/5 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl">Gamified Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay motivated with points, levels, and achievements as you progress through your Java learning journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/10 via-primary/10 to-accent/5 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl">24/7 AI Tutor</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant help with coding questions, explanations, and guidance whenever you need it.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Why Study Buddy Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-8 md:p-10 space-y-6">
                <h2 className="text-2xl text-center">Why Study Buddy?</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Structured Learning Path:</span> Follow a carefully designed 8-module curriculum that takes you from beginner to advanced level.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Hands-On Practice:</span> Apply what you learn with interactive exercises and real-world projects.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Progress Tracking:</span> Monitor your learning journey with detailed analytics and visual progress indicators.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Secure & Private:</span> Your data is protected with advanced security measures including session management and UUID-based authentication.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
