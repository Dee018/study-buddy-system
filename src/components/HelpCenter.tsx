import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Footer } from './Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HelpCenterProps {
  onNavigate: (screen: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  faqs: FAQItem[];
}

export function HelpCenter({ onNavigate }: HelpCenterProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqCategories: FAQCategory[] = [
    {
      title: 'Getting Started',
      icon: '🚀',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click on "Create Account" on the welcome page and enter your username. A unique UUID will be generated for you automatically. Make sure to save your UUID for future logins.'
        },
        {
          question: 'How do I track my progress?',
          answer: 'Your progress is automatically saved as you complete lessons and exercises. Visit the Progress Tracker to see detailed analytics of your learning journey, including modules completed, XP earned, and daily activity.'
        },
        {
          question: 'What are the different learning levels?',
          answer: 'There are three levels: Beginner (🌱), Learner (🚀), and Advanced (👑). You progress through levels by completing modules in each track. Each level unlocks new content and challenges.'
        }
      ]
    },
    {
      title: 'Learning Modules',
      icon: '📚',
      faqs: [
        {
          question: 'How are modules structured?',
          answer: 'Each module contains multiple lessons, interactive exercises, and projects. Lessons teach concepts, exercises test your understanding, and projects help you apply what you\'ve learned in real-world scenarios.'
        },
        {
          question: 'Can I skip ahead to advanced modules?',
          answer: 'Modules must be completed in sequence within each track. This ensures you have the foundational knowledge needed for more advanced topics. Complete all Beginner modules to unlock Learner modules, and all Learner modules to access Advanced content.'
        },
        {
          question: 'What happens when I complete a module?',
          answer: 'When you complete a module, you earn XP points, unlock the next module, and your progress is saved. You can always revisit completed modules to review concepts.'
        }
      ]
    },
    {
      title: 'Assessments',
      icon: '🎯',
      faqs: [
        {
          question: 'What are assessments?',
          answer: 'Assessments are comprehensive tests that evaluate your understanding of Java concepts. They include multiple-choice questions, code completion tasks, and problem-solving challenges.'
        },
        {
          question: 'Are there anti-cheating measures?',
          answer: 'Yes, assessments include copy-paste prevention and single-device session management to ensure fair evaluation. These measures help maintain the integrity of your learning journey.'
        },
        {
          question: 'Can I retake an assessment?',
          answer: 'Yes, you can retake assessments to improve your score. Each attempt helps reinforce your learning and identify areas that need more practice.'
        }
      ]
    },
    {
      title: 'AI Tutor',
      icon: '🤖',
      faqs: [
        {
          question: 'How does the AI Tutor work?',
          answer: 'The AI Tutor is powered by advanced language models that can help explain Java concepts, debug code, and answer your programming questions. Simply type your question and get instant, personalized assistance.'
        },
        {
          question: 'What kind of questions can I ask?',
          answer: 'You can ask about Java syntax, concepts, best practices, debugging help, and explanations of error messages. The AI Tutor is designed to provide educational guidance tailored to your learning level.'
        },
        {
          question: 'Is the AI Tutor available 24/7?',
          answer: 'Yes, the AI Tutor is available whenever you need help, providing instant support for your learning journey at any time.'
        }
      ]
    },
    {
      title: 'Points & Gamification',
      icon: '✨',
      faqs: [
        {
          question: 'How do I earn XP points?',
          answer: 'You earn XP points by completing lessons, exercises, and projects. Each activity awards different amounts of XP based on difficulty and completion quality.'
        },
        {
          question: 'What can I do with XP points?',
          answer: 'XP points track your overall progress and contribute to leveling up. They serve as a measure of your learning journey and unlock new achievements.'
        },
        {
          question: 'How do I maintain my streak?',
          answer: 'Log in daily and complete at least one learning activity to maintain your streak. Streaks are tracked in your timezone and reset at midnight.'
        }
      ]
    },
    {
      title: 'Technical Issues',
      icon: '🔧',
      faqs: [
        {
          question: 'What should I do if I encounter an error?',
          answer: 'If you encounter an error, try refreshing the page first. If the issue persists, use the "Report Issue" feature to submit a detailed bug report. Include information about what you were doing when the error occurred.'
        },
        {
          question: 'My progress isn\'t saving. What should I do?',
          answer: 'Make sure you\'re logged in with your correct UUID. Your progress is automatically saved after each activity. If issues persist, check your browser\'s local storage settings and report the issue.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Use the password recovery feature on the login page. You\'ll need your UUID and registered email to reset your password securely.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Title */}
            <div className="text-center space-y-4 px-4">
              <h1>Help Center</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about using Study Buddy
              </p>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-xl md:text-2xl">{category.title}</h2>
                  </div>

                  {/* FAQ Items */}
                  <div className="space-y-3">
                    {category.faqs.map((faq, faqIndex) => {
                      const itemId = `${categoryIndex}-${faqIndex}`;
                      const isExpanded = expandedItems[itemId];

                      return (
                        <Card
                          key={itemId}
                          className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 via-primary/5 to-accent/3 hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                          onClick={() => toggleItem(itemId)}
                          style={{ borderRadius: '16px' }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base pr-4">
                                {faq.question}
                              </CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                          {isExpanded && (
                            <CardContent className="pt-0">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Support Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-xl">Still need help?</h3>
                <p className="text-muted-foreground">
                  If you couldn't find the answer you're looking for, feel free to contact our support team or report an issue.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Contact Us
                  </button>
                  <button
                    onClick={() => onNavigate('report')}
                    className="px-6 py-2 border-2 border-primary/40 text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Report Issue
                  </button>
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
