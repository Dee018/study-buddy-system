import React, { useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Download, 
  Award, 
  Sparkles, 
  Calendar,
  Trophy,
  Zap,
  Star,
  CheckCircle2
} from 'lucide-react';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { toast } from 'sonner@2.0.3';

export type CertificateType = 'module' | 'course' | 'milestone' | 'excellence';

export interface CertificateData {
  recipientName: string;
  recipientId: string;
  certificateType: CertificateType;
  title: string;
  description: string;
  completionDate: Date;
  moduleTitle?: string;
  totalXP?: number;
  totalHours?: number;
  grade?: number;
  skills?: string[];
  certificateId?: string;
}

interface CertificateProps {
  data: CertificateData;
  onClose?: () => void;
  showDownloadButton?: boolean;
}

export function Certificate({ data, onClose, showDownloadButton = true }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Generate unique certificate ID
  const certificateId = data.certificateId || `JSBC-${data.certificateType.toUpperCase()}-${Date.now()}`;
  
  // Format date
  const formattedDate = data.completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get certificate color scheme based on type
  const getColorScheme = () => {
    switch (data.certificateType) {
      case 'module':
        return {
          gradient: 'from-purple-600 via-purple-500 to-indigo-600',
          accentGradient: 'from-purple-400 to-indigo-500',
          borderColor: 'border-purple-500/30',
          icon: Trophy
        };
      case 'course':
        return {
          gradient: 'from-amber-500 via-orange-500 to-red-500',
          accentGradient: 'from-amber-400 to-orange-500',
          borderColor: 'border-amber-500/30',
          icon: Award
        };
      case 'milestone':
        return {
          gradient: 'from-blue-600 via-cyan-500 to-teal-600',
          accentGradient: 'from-blue-400 to-cyan-500',
          borderColor: 'border-blue-500/30',
          icon: Star
        };
      case 'excellence':
        return {
          gradient: 'from-yellow-500 via-amber-500 to-orange-600',
          accentGradient: 'from-yellow-400 to-amber-500',
          borderColor: 'border-yellow-500/30',
          icon: Sparkles
        };
      default:
        return {
          gradient: 'from-purple-600 via-purple-500 to-indigo-600',
          accentGradient: 'from-purple-400 to-indigo-500',
          borderColor: 'border-purple-500/30',
          icon: Award
        };
    }
  };

  const scheme = getColorScheme();
  const IconComponent = scheme.icon;

  // Download certificate as image
  const handleDownload = async () => {
    try {
      // For now, we'll create a simple text representation
      // In a production app, you'd use html2canvas or similar library
      const certificateText = `
========================================
       JAVA STUDY BUDDY
       CERTIFICATE OF COMPLETION
========================================

This certifies that

${data.recipientName}

has successfully completed

${data.title}

${data.description}

Completion Date: ${formattedDate}
Certificate ID: ${certificateId}
${data.totalXP ? `Total XP Earned: ${data.totalXP}` : ''}
${data.totalHours ? `Study Hours: ${data.totalHours}` : ''}
${data.grade ? `Final Grade: ${data.grade}%` : ''}

========================================
      Java Study Buddy Learning Platform
========================================
      `;

      // Create a blob and download
      const blob = new Blob([certificateText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  // Share certificate
  const handleShare = () => {
    const shareText = `I just earned a certificate from Java Study Buddy! 🎓\n${data.title}\nCertificate ID: ${certificateId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Java Study Buddy Certificate',
        text: shareText,
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText);
        toast.success('Certificate details copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Certificate details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-4xl my-8">
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-0">
            {/* Certificate Design */}
            <div 
              ref={certificateRef}
              className="relative bg-gradient-to-br from-background via-background to-secondary/20 overflow-hidden"
            >
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${scheme.gradient} rounded-full blur-3xl`} />
                <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${scheme.gradient} rounded-full blur-3xl`} />
              </div>

              {/* Decorative Border Pattern */}
              <div className={`absolute inset-0 border-8 ${scheme.borderColor} opacity-30`}>
                <div className={`absolute inset-4 border-2 ${scheme.borderColor}`} />
              </div>

              {/* Corner Decorations */}
              <div className="absolute top-8 left-8 opacity-20">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute top-8 right-8 opacity-20">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute bottom-8 left-8 opacity-20">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute bottom-8 right-8 opacity-20">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 space-y-8 text-center">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <StudyBuddyLogo size="lg" />
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r ${scheme.accentGradient} text-white shadow-lg`}>
                    <IconComponent className="w-5 h-5" />
                    <span className="font-bold tracking-wide uppercase text-sm">Certificate of Completion</span>
                  </div>
                </div>

                {/* Recipient Section */}
                <div className="space-y-6">
                  <p className="text-lg text-muted-foreground tracking-wide">
                    This certifies that
                  </p>
                  
                  <div className="space-y-2">
                    <h2 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${scheme.gradient} bg-clip-text text-transparent`}>
                      {data.recipientName}
                    </h2>
                    <div className="flex justify-center">
                      <div className={`h-1 w-64 bg-gradient-to-r ${scheme.accentGradient} rounded-full`} />
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground tracking-wide">
                    has successfully completed
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-bold">
                      {data.title}
                    </h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      {data.description}
                    </p>
                  </div>
                </div>

                {/* Achievement Metrics */}
                {(data.totalXP || data.totalHours || data.grade || data.skills) && (
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    {data.totalXP && (
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        <Zap className="w-4 h-4 mr-2" />
                        {data.totalXP} XP Earned
                      </Badge>
                    )}
                    {data.totalHours && (
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {data.totalHours} Study Hours
                      </Badge>
                    )}
                    {data.grade && (
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {data.grade}% Score
                      </Badge>
                    )}
                  </div>
                )}

                {/* Skills Earned */}
                {data.skills && data.skills.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Skills Mastered:</p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                      {data.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Information */}
                <div className="pt-8 space-y-4 border-t border-border/50">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Issued: {formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span className="font-mono">ID: {certificateId}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Java Study Buddy Learning Platform • Empowering Developers Worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {showDownloadButton && (
              <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-border bg-secondary/20">
                <Button
                  onClick={handleDownload}
                  className="flex-1"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Share Achievement
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="lg"
                  >
                    Close
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
