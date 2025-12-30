import React from 'react';
import { Card, CardContent } from './ui/card';
import { Footer } from './Footer';
import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (screen: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  const sections = [
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: 'Information We Collect',
      content: `We collect information that you provide directly to us, including:
      
• Username and account credentials (UUID-based authentication)
• Learning progress and activity data
• Assessment results and exercise completions
• AI Tutor conversation history for improving our services
• Device and session information for security purposes

We do not collect sensitive personal information such as real names, addresses, or payment information. Study Buddy is not designed for collecting Personally Identifiable Information (PII).`
    },
    {
      icon: <Eye className="w-5 h-5 text-primary" />,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:

• Provide, maintain, and improve Study Buddy services
• Track your learning progress and provide personalized content
• Generate analytics and insights about your learning journey
• Ensure platform security through session management
• Respond to your support requests and communications
• Detect and prevent fraudulent or unauthorized activity

We do not sell your personal information to third parties.`
    },
    {
      icon: <Lock className="w-5 h-5 text-primary" />,
      title: 'Data Security',
      content: `We implement industry-standard security measures to protect your data:

• UUID-based authentication system
• Single-device session management
• Encrypted data storage in browser local storage
• Secure password recovery mechanisms
• Copy-paste prevention during assessments to maintain integrity
• Regular security audits and updates

While we strive to protect your information, no system is 100% secure. Please use a strong password and keep your UUID confidential.`
    },
    {
      icon: <Database className="w-5 h-5 text-primary" />,
      title: 'Data Storage and Retention',
      content: `Your learning data is stored locally in your browser using local storage technology. This includes:

• Module completion status
• Exercise and project submissions
• XP points and achievement history
• Daily activity and streak tracking
• AI Tutor conversation history

Data is retained as long as your account remains active. You can request deletion of your data by contacting us through the Contact Us page.`
    },
    {
      icon: <UserCheck className="w-5 h-5 text-primary" />,
      title: 'Your Rights and Choices',
      content: `You have the following rights regarding your data:

• Access: Request a copy of your personal data
• Correction: Update or correct inaccurate information
• Deletion: Request deletion of your account and associated data
• Export: Download your learning progress and achievements
• Opt-out: Decline certain data collection features

To exercise these rights, please contact us using the Contact Us page.`
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: 'Third-Party Services',
      content: `Study Buddy may use third-party services for:

• AI-powered tutoring (OpenAI)
• Analytics and performance monitoring
• Error tracking and debugging

These services may collect limited data necessary for their operation. We ensure all third-party providers comply with applicable privacy regulations and maintain appropriate security standards.`
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
              <h1>Privacy Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Last updated: January 19, 2025
              </p>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                At Study Buddy, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our Java learning platform.
              </p>
            </div>

            {/* Important Notice */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="text-xl">Important Notice</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Study Buddy is an educational platform designed for learning Java programming. 
                      We are not designed to collect, store, or process Personally Identifiable Information (PII) 
                      or sensitive personal data. Please do not enter any sensitive information such as social 
                      security numbers, financial data, or health information into the platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card 
                  key={index}
                  className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 via-primary/5 to-accent/3"
                >
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {section.icon}
                      </div>
                      <h2>{section.title}</h2>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Updates to Policy */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h2 className="text-xl md:text-2xl">Changes to This Privacy Policy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                  advised to review this Privacy Policy periodically for any changes.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <h3 className="text-xl">Questions About Privacy?</h3>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about this Privacy Policy or how we handle your data, 
                  please don't hesitate to contact us.
                </p>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </button>
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