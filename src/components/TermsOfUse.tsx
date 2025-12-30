import React from 'react';
import { Card, CardContent } from './ui/card';
import { Footer } from './Footer';
import { FileText, Users, AlertCircle, Shield, CheckCircle, XCircle } from 'lucide-react';

interface TermsOfUseProps {
  onNavigate: (screen: string) => void;
}

export function TermsOfUse({ onNavigate }: TermsOfUseProps) {
  const sections = [
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: 'Acceptance of Terms',
      content: `By accessing and using Study Buddy, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Use, please do not use the platform.

These terms apply to all users of Study Buddy, including students, educators, and visitors. Your continued use of the platform constitutes acceptance of these terms as they may be modified from time to time.`
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: 'User Accounts and Responsibilities',
      content: `Account Creation:
• You must create an account using a unique username
• A UUID will be generated for authentication purposes
• You are responsible for maintaining the confidentiality of your UUID
• You must be at least 13 years old to use Study Buddy

Account Security:
• Keep your UUID and password secure and confidential
• Notify us immediately of any unauthorized access
• You are responsible for all activities under your account
• Do not share your account credentials with others

Accurate Information:
• Provide accurate and complete information during registration
• Update your information as needed to keep it current
• Do not impersonate others or create false identities`
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
      title: 'Acceptable Use',
      content: `You agree to use Study Buddy only for lawful purposes and in accordance with these Terms. You agree NOT to:

• Use the platform for any illegal or unauthorized purpose
• Attempt to gain unauthorized access to any systems or data
• Interfere with or disrupt the platform's operation
• Upload malicious code, viruses, or harmful content
• Harass, abuse, or harm other users
• Violate any applicable laws or regulations
• Circumvent anti-cheating measures during assessments
• Use automated tools to access or scrape content
• Reverse engineer or attempt to extract source code
• Share or distribute platform content without permission`
    },
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: 'Academic Integrity',
      content: `Study Buddy is designed to support genuine learning. You agree to:

Assessment Integrity:
• Complete assessments independently without unauthorized help
• Not use prohibited resources during assessments
• Not share assessment questions or answers with others
• Respect copy-paste prevention and security measures

Honest Progress:
• Earn XP points and achievements through genuine effort
• Not exploit bugs or glitches for unfair advantage
• Report any issues that could affect fairness
• Complete modules honestly and thoroughly

Consequences:
Violations of academic integrity may result in account suspension, progress reset, or permanent ban from the platform.`
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: 'Intellectual Property',
      content: `Ownership:
• All content on Study Buddy is owned by Study Buddy or its licensors
• This includes curriculum, exercises, projects, and platform design
• Study Buddy name, logo, and branding are our trademarks

Your License:
• We grant you a limited, non-exclusive license to use the platform
• This license is for personal, educational use only
• You may not redistribute, sell, or commercially exploit content

Your Content:
• You retain ownership of code and projects you create
• By using the platform, you grant us a license to store and display your work
• We may use anonymized data to improve our services`
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-primary" />,
      title: 'Disclaimers and Limitations',
      content: `Service Availability:
• Study Buddy is provided "as is" without warranties
• We do not guarantee uninterrupted or error-free service
• We may modify or discontinue features at any time

Educational Nature:
• Study Buddy is for educational purposes only
• We do not guarantee employment outcomes or certifications
• Learning outcomes depend on individual effort and circumstances

Limitation of Liability:
• We are not liable for indirect, incidental, or consequential damages
• Our liability is limited to the amount you paid (if any) for services
• We are not responsible for user-generated content or third-party services

External Links:
• Our platform may contain links to third-party websites
• We are not responsible for external content or privacy practices
• Use third-party services at your own risk`
    },
    {
      icon: <XCircle className="w-5 h-5 text-primary" />,
      title: 'Termination',
      content: `We reserve the right to:
• Suspend or terminate accounts that violate these terms
• Remove content that violates our policies
• Modify or discontinue the platform with notice

You may terminate your account at any time by:
• Contacting us through the Contact Us page
• Requesting account deletion and data removal

Upon termination:
• Your access to the platform will be revoked
• Your data may be retained as required by law
• Certain provisions of these terms will survive termination`
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
              <h1>Terms of Use</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Last updated: January 19, 2025
              </p>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Please read these Terms of Use carefully before using Study Buddy. These terms govern your use of our platform and constitute a legally binding agreement between you and Study Buddy.
              </p>
            </div>

            {/* Important Notice */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="text-xl">Agreement to Terms</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      By using Study Buddy, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, you must not use our platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms Sections */}
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

            {/* Changes to Terms */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h2 className="text-xl md:text-2xl">Changes to Terms</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms of Use at any time. We will notify users of any material changes by posting the updated terms on this page and updating the "Last updated" date. Your continued use of Study Buddy after changes constitutes acceptance of the modified terms.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h2 className="text-xl md:text-2xl">Governing Law and Disputes</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These Terms of Use shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of Study Buddy shall be resolved through good faith negotiations. If resolution cannot be reached, disputes may be submitted to binding arbitration or appropriate legal proceedings.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <h3 className="text-xl">Questions About These Terms?</h3>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about these Terms of Use, please contact us.
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
