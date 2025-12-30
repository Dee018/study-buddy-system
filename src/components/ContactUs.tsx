import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Footer } from './Footer';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ContactUsProps {
  onNavigate: (screen: string) => void;
}

export function ContactUs({ onNavigate }: ContactUsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to backend API which stores the message (and can send email)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('API error');

      setIsSubmitted(true);
      toast.success('Message sent — support will get back to you shortly.');

      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Contact API failed, falling back to mailto', err);

      // Fallback: open user's mail client
      try {
        const to = 'studybuddy.official025@gmail.com';
        const subject = formData.subject && formData.subject.trim().length > 0 ? formData.subject : 'Support request from Study Buddy user';
        const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`;
        const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
        toast('Opening your mail client...');
      } catch (e) {
        toast.error('Could not send message. Please email studybuddy.official025@gmail.com');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Title */}
            <div className="text-center space-y-4 px-4">
              <h1>Contact Us</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 via-primary/5 to-accent/3">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Send us a message</CardTitle>
                  </div>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting || isSubmitted}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting || isSubmitted}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting || isSubmitted}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more..."
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting || isSubmitted}
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      disabled={isSubmitting || isSubmitted}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : isSubmitted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Message Sent!
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 via-primary/5 to-accent/3">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle>Email Support</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      For general inquiries and support:
                    </p>
                    <p className="text-sm">
                      <a href="mailto:studybuddy.official025@gmail.com" className="text-primary hover:underline">
                        studybuddy.official025@gmail.com
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24-48 hours during business days.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 via-primary/5 to-accent/3">
                  <CardHeader>
                    <CardTitle>Other Ways to Get Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm mb-2">📚 Help Center</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Browse our comprehensive FAQ and guides.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('help')}
                        className="w-full"
                      >
                        Visit Help Center
                      </Button>
                    </div>

                    <div>
                      <h4 className="text-sm mb-2">🚩 Report an Issue</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Found a bug or technical problem?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('report')}
                        className="w-full"
                      >
                        Report Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                  <CardContent className="p-6 space-y-3">
                    <h4 className="text-sm">📍 Office Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM (EST)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Saturday - Sunday: Closed
                    </p>
                    <p className="text-xs text-muted-foreground pt-2">
                      Note: Response times may vary during weekends and holidays.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
