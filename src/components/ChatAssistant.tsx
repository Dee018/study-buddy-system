import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Code,
  HelpCircle,
  Target,
  ThumbsUp,
  ThumbsDown,
  Brain,

  ChevronDown
} from 'lucide-react';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { openAI, type APIConnectionStatus } from '../utils/openAI';

interface ChatAssistantProps {
  onNavigate: (screen: string) => void;
  userId?: string;
  userLevel?: string;
  username?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  topic?: string;
  feedback?: 'helpful' | 'not-helpful' | null;
}

export function ChatAssistant({ onNavigate: _onNavigate, userId = 'guest', userLevel = 'Beginner', username = 'Student' }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello, ${username}! 👋 I'm your enhanced Study Buddy AI Assistant, powered by OpenAI! 🤖✨

I'm designed to be your personal Java learning companion, adapting to your ${userLevel.toLowerCase()} level and continuously learning from our conversations to provide increasingly personalized assistance.

**Here's how I can assist you:**
• 🎯 **Java Programming Concepts** – Explanations tailored to your current skill level
• 📚 **Study Strategies** – Personalized learning paths and effective study techniques
• 🔧 **Code Debugging** – Problem-solving techniques and troubleshooting guidance
• 💡 **Smart Recommendations** – Suggestions based on your learning progress and goals

What would you like to explore today? Feel free to ask me anything about Java programming!`,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "What are Java data types?",
        "Explain object-oriented programming",
        "Help me with loops in Java",
        "How do I debug my code?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [, setLearningInsights] = useState<{ strengths: string[], improvements: string[], suggestions: string[] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [, setApiStatus] = useState<APIConnectionStatus>(openAI.getConnectionStatus());

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const checkScrollPosition = () => {
    if (!scrollAreaRef.current) return;

    // Find the viewport element within the ScrollArea
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    if (!scrollAreaRef.current) return;

    // Find the viewport element within the ScrollArea
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    viewport.addEventListener('scroll', checkScrollPosition);
    return () => viewport.removeEventListener('scroll', checkScrollPosition);
  }, []);

  useEffect(() => {
    // Load learning insights when component mounts
    const insights = openAI.getLearningInsights(userId);
    setLearningInsights(insights);

    // Check API connection status
    const status = openAI.getConnectionStatus();
    setApiStatus(status);
  }, [userId]);

  // suggestedQuestions removed (unused) — kept suggestions inline where needed

  // (intentionally omitted) helper for random suggestions removed to avoid unused-vars warning

  const generateResponse = async (userMessage: string): Promise<{ response: string; suggestions: string[]; topic: string }> => {
    // Prefer server-side AI endpoint for security (keeps API keys on the server).
    try {
      const resp = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userMessage, userLevel })
      });

      if (resp.ok) {
        const json = await resp.json();
        return {
          response: json.response || json.data || json.answer || '',
          suggestions: json.suggestions || [],
          topic: json.topic || 'general'
        };
      }

      // If server returns an error, fall back to client-side OpenAI service
      console.warn('Server /api/ai/respond returned', resp.status, await resp.text());
    } catch (err) {
      console.warn('Server /api/ai/respond failed, falling back to client openAI:', err);
    }

    // Fallback: use client-side openAI implementation (requires VITE_OPENAI_API_KEY)
    try {
      return await openAI.generateResponse(userMessage, userId, userLevel);
    } catch (error) {
      console.error('Error generating OpenAI response (client fallback):', error);
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Please try asking again! 🤔",
        suggestions: [
          "What are Java basics?",
          "Help with object-oriented programming",
          "Java debugging tips"
        ],
        topic: 'general'
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Generate response using OpenAI
      const { response, suggestions, topic } = await generateResponse(currentInput);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        suggestions,
        topic,
        feedback: null
      };

      setMessages(prev => [...prev, botMessage]);

      // Update learning insights after each interaction
      const newInsights = openAI.getLearningInsights(userId);
      setLearningInsights(newInsights);

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error. Please try your question again! 🤔",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ["What are Java basics?", "Help with debugging", "Explain OOP concepts"]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleFeedback = (messageId: string, wasHelpful: boolean) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, feedback: wasHelpful ? 'helpful' : 'not-helpful' }
        : msg
    ));

    // Record feedback with OpenAI service
    openAI.recordFeedback(userId, messageId, wasHelpful);

    // Update learning insights
    const newInsights = openAI.getLearningInsights(userId);
    setLearningInsights(newInsights);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="border-primary/20 mb-4 sm:mb-8">
          <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative inline-block">
                <StudyBuddyLogo
                  size="4xl"
                  variant="minimal"
                  className="w-24 h-24 sm:w-32 sm:h-32"
                  animate={true}
                  withBackground={false}
                />
                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 text-xl sm:text-2xl">
                  <span>Study Buddy Assistant</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    OpenAI Powered
                  </Badge>
                </CardTitle>
                <p className="text-base sm:text-lg text-muted-foreground mt-2">
                  Your intelligent Java learning companion 🤖✨
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>



        {/* Chat Interface */}
        <Card className="border-primary/10 overflow-hidden">
          <CardContent className="p-0">
            {/* Messages Area - Fixed height with internal scrolling and scroll button */}
            <div className="relative h-[28rem] sm:h-[32rem] flex flex-col border-b overflow-hidden">
              <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[85%] sm:max-w-[80%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                          }`}>
                          {message.sender === 'user' ? (
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </div>
                        <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 break-words overflow-hidden ${message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}>
                          <div className={`prose prose-sm dark:prose-invert max-w-none break-words ${message.sender === 'bot' ? 'ai-message' : ''
                            }`}>
                            <div className={`whitespace-pre-wrap break-words leading-relaxed overflow-wrap-anywhere text-xs sm:text-sm ${message.sender === 'user'
                              ? 'font-medium text-primary-foreground'
                              : 'font-normal text-foreground'
                              }`}>
                              {message.text}
                            </div>
                          </div>

                          {/* Feedback buttons for bot messages */}
                          {message.sender === 'bot' && message.id !== '1' && (
                            <div className="mt-2 sm:mt-3 pt-2 border-t border-border/50">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Was this helpful?</p>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(message.id, true)}
                                    className={`h-6 w-6 p-0 ${message.feedback === 'helpful' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : ''}`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(message.id, false)}
                                    className={`h-6 w-6 p-0 ${message.feedback === 'not-helpful' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''}`}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {message.suggestions && (
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
                              <p className="text-xs text-muted-foreground mb-2 flex items-center">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Try asking:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs px-2 py-1 h-auto hover:bg-primary/10 break-words"
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="rounded-2xl px-4 py-3 bg-muted">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Scroll to Bottom Button */}
              {showScrollButton && (
                <Button
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full p-0 shadow-lg z-10 bg-primary text-primary-foreground hover:scale-110 hover:bg-primary/90 transition-all duration-300 border-2 border-background dark:border-background"
                  aria-label="Scroll to latest message"
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="p-4 bg-background">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about Java programming..."
                    className="pr-12"
                    disabled={isTyping}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Action Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleSuggestionClick("What are Java data types?")}
                >
                  <Code className="w-3 h-3 mr-1" />
                  Data Types
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleSuggestionClick("Explain object-oriented programming")}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  OOP Concepts
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleSuggestionClick("Help me with loops in Java")}
                >
                  <Target className="w-3 h-3 mr-1" />
                  Loops
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleSuggestionClick("How do I debug my code?")}
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Debugging
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}