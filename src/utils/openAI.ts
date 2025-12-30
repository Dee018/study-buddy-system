// OpenAI Integration for Study Buddy
// This module handles communication with OpenAI API and manages learning context
// Supports both paid (OpenAI) and free (HuggingFace, Together AI, Ollama) API providers

// Free API Provider Types
type FreeAPIProvider =
  | "huggingface"
  | "together"
  | "ollama"
  | "none";

interface FreeAPIConfig {
  provider: FreeAPIProvider;
  apiKey?: string;
  endpoint?: string; // For custom endpoints like local Ollama
  model?: string;
  isAvailable: boolean;
  lastChecked: Date;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  userLevel: string;
  recentTopics: string[];
  preferredLearningStyle: string;
  commonMistakes: string[];
  conversationHistory: ConversationEntry[];
}

interface ConversationEntry {
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  topic: string;
  wasHelpful?: boolean;
  userFeedback?: string;
}

interface LearningProfile {
  userId: string;
  knowledgeAreas: { [key: string]: number }; // Topic -> proficiency level (0-100)
  learningPatterns: string[];
  frequentQuestions: string[];
  lastActiveTopics: string[];
  personalizedSuggestions: string[];
}

interface APIConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  usingFallback: boolean;
  freeAPIConfig: FreeAPIConfig;
  lastError?: string;
  lastChecked?: Date;
}

class OpenAIService {
  private static instance: OpenAIService;
  private conversationContexts: Map<
    string,
    ConversationContext
  > = new Map();
  private learningProfiles: Map<string, LearningProfile> =
    new Map();

  // API Configuration - reads from environment or localStorage
  private apiKey: string = "";
  private apiEndpoint: string =
    "https://api.openai.com/v1/chat/completions";
  private model: string = "gpt-4o-mini"; // Using GPT-4o-mini for cost-effectiveness

  // Free API Configuration
  private freeAPIConfig: FreeAPIConfig = {
    provider: "none",
    isAvailable: false,
    lastChecked: new Date(),
  };

  // Connection status tracking
  private connectionStatus: APIConnectionStatus = {
    isConfigured: false,
    isConnected: false,
    usingFallback: true,
    freeAPIConfig: {
      provider: "none",
      isAvailable: false,
      lastChecked: new Date(),
    },
  };

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private constructor() {
    this.initializeAPIKey();
    this.initializeFreeAPI();
    this.loadStoredData();
  }

  /**
   * Initialize API key from environment variables or localStorage
   * Priority: process.env > import.meta.env > localStorage > fallback
   */
  private initializeAPIKey() {
    try {
      // Prefer server-side env var when available (Node backend)
      let nodeEnvKey: string | undefined;
      try {
        nodeEnvKey = (globalThis as any)?.process?.env?.OPENAI_API_KEY;
      } catch (e) {
        nodeEnvKey = undefined;
      }

      // Try to get from Vite/React env (client)
      const clientEnvKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;

      // Try localStorage as backup (for runtime configuration in browser)
      let storedKey: string | null = null;
      try {
        storedKey = localStorage.getItem("openai_api_key");
      } catch (e) {
        storedKey = null;
      }

      const chosenKey = nodeEnvKey || clientEnvKey || (storedKey || undefined);

      if (chosenKey && chosenKey !== "YOUR_OPENAI_API_KEY_HERE") {
        this.apiKey = chosenKey;
        this.connectionStatus.isConfigured = true;
        // OpenAI API key loaded (server or client)
      } else {
        this.apiKey = "";
        this.connectionStatus.isConfigured = false;
        this.connectionStatus.usingFallback = true;
        // API key not configured - using intelligent fallback system
      }

      this.connectionStatus.lastChecked = new Date();
    } catch (error) {
      console.error(
        "Error initializing OpenAI API key:",
        error,
      );
      this.connectionStatus.isConfigured = false;
      this.connectionStatus.usingFallback = true;
    }
  }

  /**
   * Initialize free API provider from localStorage or environment
   */
  private initializeFreeAPI() {
    try {
      const storedProvider = localStorage.getItem(
        "free_api_provider",
      );
      const storedKey = localStorage.getItem("free_api_key");
      const storedEndpoint = localStorage.getItem(
        "free_api_endpoint",
      );

      if (storedProvider) {
        this.freeAPIConfig.provider =
          storedProvider as FreeAPIProvider;
        this.freeAPIConfig.apiKey = storedKey || undefined;
        this.freeAPIConfig.endpoint =
          storedEndpoint || undefined;

        // Set default models for each provider
        this.setProviderDefaults(this.freeAPIConfig.provider);

        // Test connection
        this.testFreeAPIConnection().then((isConnected) => {
          if (isConnected) {
            // Free API provider available (silent)
          }
        });
      }
    } catch (error) {
      console.error("Error initializing free API:", error);
    }
  }

  /**
   * Set default configuration for a free API provider
   */
  private setProviderDefaults(provider: FreeAPIProvider) {
    const defaults: {
      [key in FreeAPIProvider]: Partial<FreeAPIConfig>;
    } = {
      huggingface: {
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        endpoint:
          "https://api-inference.huggingface.co/models/",
      },
      together: {
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        endpoint:
          "https://api.together.xyz/v1/chat/completions",
      },
      ollama: {
        model: "mistral",
        endpoint: "http://localhost:11434/api/generate",
      },
      none: {},
    };

    const config = defaults[provider];
    this.freeAPIConfig = {
      ...this.freeAPIConfig,
      ...config,
      provider,
    } as FreeAPIConfig;
  }

  /**
   * Detect provider from API key format
   */
  private detectProviderFromKey(
    apiKey: string,
  ): FreeAPIProvider {
    if (apiKey.startsWith("hf_")) return "huggingface";
    if (apiKey.startsWith("together_")) return "together";
    if (apiKey === "local") return "ollama";
    return "none";
  }

  /**
   * Test free API connection
   */
  private async testFreeAPIConnection(): Promise<boolean> {
    if (
      this.freeAPIConfig.provider === "none" ||
      !this.freeAPIConfig.apiKey
    ) {
      return false;
    }

    try {
      const result = await this.callFreeAPI(
        [{ role: "user", content: "What is 2+2?" }],
        this.freeAPIConfig.provider,
      );
      this.freeAPIConfig.isAvailable = !!result;
      this.freeAPIConfig.lastChecked = new Date();
      return !!result;
    } catch (error) {
      console.warn(
        `Free API "${this.freeAPIConfig.provider}" connection test failed:`,
        error,
      );
      this.freeAPIConfig.isAvailable = false;
      this.freeAPIConfig.lastChecked = new Date();
      return false;
    }
  }

  /**
   * Call free API based on provider type
   */
  private async callFreeAPI(
    messages: any[],
    provider: FreeAPIProvider,
  ): Promise<string | null> {
    try {
      switch (provider) {
        case "huggingface":
          return await this.callHuggingFaceAPI(messages);
        case "together":
          return await this.callTogetherAI(messages);
        case "ollama":
          return await this.callOllamaAPI(messages);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error calling ${provider} API:`, error);
      return null;
    }
  }

  /**
   * Call HuggingFace Inference API
   */
  private async callHuggingFaceAPI(
    messages: any[],
  ): Promise<string | null> {
    if (
      !this.freeAPIConfig.apiKey ||
      !this.freeAPIConfig.endpoint ||
      !this.freeAPIConfig.model
    ) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.freeAPIConfig.endpoint}${this.freeAPIConfig.model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.freeAPIConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: this.formatMessagesToText(messages),
            parameters: {
              max_new_tokens: 500,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(
          "HuggingFace API error:",
          response.status,
          error,
        );
        return null;
      }

      const data = await response.json();
      return data[0]?.generated_text || null;
    } catch (error) {
      console.error("HuggingFace API call failed:", error);
      return null;
    }
  }

  /**
   * Call Together AI API
   */
  private async callTogetherAI(
    messages: any[],
  ): Promise<string | null> {
    if (
      !this.freeAPIConfig.apiKey ||
      !this.freeAPIConfig.endpoint
    ) {
      return null;
    }

    try {
      const response = await fetch(
        this.freeAPIConfig.endpoint,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.freeAPIConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.freeAPIConfig.model,
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(
          "Together AI error:",
          response.status,
          error,
        );
        return null;
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("Together AI call failed:", error);
      return null;
    }
  }

  /**
   * Call local Ollama API
   */
  private async callOllamaAPI(
    messages: any[],
  ): Promise<string | null> {
    if (
      !this.freeAPIConfig.endpoint ||
      !this.freeAPIConfig.model
    ) {
      return null;
    }

    try {
      const response = await fetch(
        this.freeAPIConfig.endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.freeAPIConfig.model,
            prompt: this.formatMessagesToText(messages),
            stream: false,
          }),
        },
      );

      if (!response.ok) {
        console.error("Ollama API error:", response.status);
        return null;
      }

      const data = await response.json();
      return data.response || null;
    } catch (error) {
      console.error("Ollama API call failed:", error);
      return null;
    }
  }

  /**
   * Format messages array to text for APIs that expect text input
   */
  private formatMessagesToText(messages: any[]): string {
    return messages
      .filter((m) => m.role !== "system")
      .map(
        (m) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
      )
      .join("\n");
  } /**
   * Get current API connection status
   */
  getConnectionStatus(): APIConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if API is properly configured
   */
  isConfigured(): boolean {
    return (
      this.connectionStatus.isConfigured &&
      this.apiKey.length > 0
    );
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 5,
        }),
      });

      const isConnected = response.ok;
      this.connectionStatus.isConnected = isConnected;
      this.connectionStatus.usingFallback = !isConnected;
      this.connectionStatus.lastChecked = new Date();

      if (!isConnected) {
        this.connectionStatus.lastError = `HTTP ${response.status}: ${response.statusText}`;
      }

      return isConnected;
    } catch (error) {
      this.connectionStatus.isConnected = false;
      this.connectionStatus.usingFallback = true;
      this.connectionStatus.lastError =
        error instanceof Error
          ? error.message
          : "Unknown error";
      this.connectionStatus.lastChecked = new Date();
      return false;
    }
  }

  private loadStoredData() {
    try {
      // Load conversation contexts from localStorage
      const storedContexts = localStorage.getItem(
        "openai_conversation_contexts",
      );
      if (storedContexts) {
        const contexts = JSON.parse(storedContexts);
        Object.entries(contexts).forEach(
          ([key, value]: [string, any]) => {
            this.conversationContexts.set(key, {
              ...value,
              conversationHistory:
                value.conversationHistory?.map(
                  (entry: any) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp),
                  }),
                ) || [],
            });
          },
        );
      }

      // Load learning profiles from localStorage
      const storedProfiles = localStorage.getItem(
        "openai_learning_profiles",
      );
      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        Object.entries(profiles).forEach(([key, value]) => {
          this.learningProfiles.set(
            key,
            value as LearningProfile,
          );
        });
      }
    } catch (error) {
      console.error("Error loading stored OpenAI data:", error);
    }
  }

  private saveData() {
    try {
      // Save conversation contexts
      const contextsObj: { [key: string]: any } = {};
      this.conversationContexts.forEach((value, key) => {
        contextsObj[key] = value;
      });
      localStorage.setItem(
        "openai_conversation_contexts",
        JSON.stringify(contextsObj),
      );

      // Save learning profiles
      const profilesObj: { [key: string]: any } = {};
      this.learningProfiles.forEach((value, key) => {
        profilesObj[key] = value;
      });
      localStorage.setItem(
        "openai_learning_profiles",
        JSON.stringify(profilesObj),
      );
    } catch (error) {
      console.error("Error saving OpenAI data:", error);
    }
  }

  private getOrCreateContext(
    userId: string,
    userLevel: string,
  ): ConversationContext {
    let context = this.conversationContexts.get(userId);
    if (!context) {
      context = {
        userId,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userLevel,
        recentTopics: [],
        preferredLearningStyle: "balanced",
        commonMistakes: [],
        conversationHistory: [],
      };
      this.conversationContexts.set(userId, context);
    }
    return context;
  }

  private getOrCreateLearningProfile(
    userId: string,
  ): LearningProfile {
    let profile = this.learningProfiles.get(userId);
    if (!profile) {
      profile = {
        userId,
        knowledgeAreas: {
          "java-basics": 0,
          "object-oriented-programming": 0,
          "data-structures": 0,
          algorithms: 0,
          "exception-handling": 0,
          collections: 0,
          multithreading: 0,
          debugging: 0,
        },
        learningPatterns: [],
        frequentQuestions: [],
        lastActiveTopics: [],
        personalizedSuggestions: [],
      };
      this.learningProfiles.set(userId, profile);
    }
    return profile;
  }

  private identifyTopic(message: string): string {
    const topicKeywords = {
      "java-basics": [
        "variable",
        "data type",
        "syntax",
        "primitive",
        "string",
        "basic",
      ],
      "object-oriented-programming": [
        "class",
        "object",
        "inheritance",
        "polymorphism",
        "encapsulation",
        "abstraction",
        "oop",
      ],
      "data-structures": [
        "array",
        "list",
        "arraylist",
        "linkedlist",
        "queue",
        "stack",
        "map",
        "hashmap",
      ],
      algorithms: [
        "sort",
        "search",
        "algorithm",
        "complexity",
        "big o",
        "recursion",
      ],
      "exception-handling": [
        "exception",
        "try",
        "catch",
        "finally",
        "throw",
        "throws",
        "error",
      ],
      collections: [
        "collection",
        "set",
        "hashset",
        "iterator",
        "stream",
        "lambda",
      ],
      multithreading: [
        "thread",
        "concurrent",
        "synchronization",
        "parallel",
        "async",
      ],
      debugging: [
        "debug",
        "error",
        "bug",
        "troubleshoot",
        "fix",
        "problem",
      ],
    };

    const lowerMessage = message.toLowerCase();
    for (const [topic, keywords] of Object.entries(
      topicKeywords,
    )) {
      if (
        keywords.some((keyword) =>
          lowerMessage.includes(keyword),
        )
      ) {
        return topic;
      }
    }
    return "general";
  }

  private updateLearningProfile(
    userId: string,
    topic: string,
    wasSuccessful: boolean,
  ) {
    const profile = this.getOrCreateLearningProfile(userId);

    // Update knowledge area proficiency
    if (profile.knowledgeAreas[topic] !== undefined) {
      if (wasSuccessful) {
        profile.knowledgeAreas[topic] = Math.min(
          100,
          profile.knowledgeAreas[topic] + 5,
        );
      } else {
        profile.knowledgeAreas[topic] = Math.max(
          0,
          profile.knowledgeAreas[topic] - 2,
        );
      }
    }

    // Update recent topics
    profile.lastActiveTopics = [
      topic,
      ...profile.lastActiveTopics.filter((t) => t !== topic),
    ].slice(0, 5);

    this.saveData();
  }

  private buildContextualPrompt(
    userMessage: string,
    context: ConversationContext,
    profile: LearningProfile,
  ): any[] {
    const systemPrompt = `You are Study Buddy AI, an expert Java programming tutor and mentor specialized in adaptive learning. You are integrated into a comprehensive Java learning platform.

STUDENT PROFILE:
- Level: ${context.userLevel}
- Recent topics: ${context.recentTopics.slice(0, 3).join(", ") || "None"}
- Knowledge strengths: ${Object.entries(profile.knowledgeAreas)
        .filter(([_, score]) => score > 70)
        .map(([topic, _]) => topic.replace("-", " "))
        .join(", ") || "Still building foundation"
      }
- Areas needing work: ${Object.entries(profile.knowledgeAreas)
        .filter(([_, score]) => score < 40)
        .map(([topic, _]) => topic.replace("-", " "))
        .join(", ") || "None identified"
      }

INSTRUCTIONS:
1. Provide personalized responses based on the student's level and knowledge profile
2. Reference previous conversations when relevant
3. Adapt explanations to their demonstrated understanding
4. Always include practical Java code examples when appropriate
5. Use emojis and engaging formatting to maintain motivation
6. Offer progressive learning suggestions based on their current knowledge
7. If they're struggling with a concept, break it down into smaller steps
8. Celebrate their progress and acknowledge their learning journey

Format your responses using Markdown for better readability. Use code blocks with \`\`\`java for Java code examples.`;

    // Build messages array with conversation history
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add recent conversation history (last 6 messages for context)
    const recentHistory = context.conversationHistory.slice(-6);
    recentHistory.forEach((entry) => {
      messages.push({
        role: "user",
        content: entry.userMessage,
      });
      messages.push({
        role: "assistant",
        content: entry.aiResponse,
      });
    });

    // Add current message
    messages.push({ role: "user", content: userMessage });

    return messages;
  }

  async generateResponse(
    userMessage: string,
    userId: string,
    userLevel: string,
  ): Promise<{
    response: string;
    suggestions: string[];
    topic: string;
  }> {
    try {
      const context = this.getOrCreateContext(
        userId,
        userLevel,
      );
      const profile = this.getOrCreateLearningProfile(userId);
      const topic = this.identifyTopic(userMessage);

      // Update recent topics
      context.recentTopics = [
        topic,
        ...context.recentTopics.filter((t) => t !== topic),
      ].slice(0, 5);

      // Try OpenAI API first (if configured)
      if (this.isConfigured()) {
        const openAIResponse = await this.callOpenAIAPI(
          userMessage,
          context,
          profile,
        );
        if (openAIResponse) {
          const suggestions =
            this.generateContextualSuggestions(
              topic,
              context,
              profile,
            );
          this.recordConversation(
            context,
            userMessage,
            openAIResponse,
            topic,
          );
          this.updateLearningProfile(userId, topic, true);
          this.saveData();

          return {
            response: openAIResponse,
            suggestions,
            topic,
          };
        }
      }

      // Try free API providers (if available)
      if (
        this.freeAPIConfig.provider !== "none" &&
        this.freeAPIConfig.isAvailable &&
        this.freeAPIConfig.apiKey
      ) {
        const freeAPIResponse = await this.callFreeAPI(
          this.buildContextualMessages(
            userMessage,
            context,
            profile,
          ),
          this.freeAPIConfig.provider,
        );

        if (freeAPIResponse) {
          this.connectionStatus.usingFallback = false;
          const suggestions =
            this.generateContextualSuggestions(
              topic,
              context,
              profile,
            );
          this.recordConversation(
            context,
            userMessage,
            freeAPIResponse,
            topic,
          );
          this.updateLearningProfile(userId, topic, true);
          this.saveData();

          // Using free API for response (silent)
          return {
            response: freeAPIResponse,
            suggestions,
            topic,
          };
        }
      }

      // Fall back to local responses
      this.connectionStatus.usingFallback = true;
      return this.generateFallbackResponse(
        userMessage,
        context,
        profile,
        topic,
      );
    } catch (error) {
      console.error("Error generating response:", error);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.usingFallback = true;
      this.connectionStatus.lastError =
        error instanceof Error
          ? error.message
          : "Unknown error";

      const context = this.getOrCreateContext(
        userId,
        userLevel,
      );
      const profile = this.getOrCreateLearningProfile(userId);
      const topic = this.identifyTopic(userMessage);
      return this.generateFallbackResponse(
        userMessage,
        context,
        profile,
        topic,
      );
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAIAPI(
    userMessage: string,
    context: ConversationContext,
    profile: LearningProfile,
  ): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const messages = this.buildContextualPrompt(
        userMessage,
        context,
        profile,
      );

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "OpenAI API error:",
          response.status,
          response.statusText,
          errorText,
        );
        this.connectionStatus.isConnected = false;
        this.connectionStatus.usingFallback = true;
        this.connectionStatus.lastError = `HTTP ${response.status}: ${response.statusText}`;
        return null;
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (aiResponse) {
        this.connectionStatus.isConnected = true;
        this.connectionStatus.usingFallback = false;
        this.connectionStatus.lastError = undefined;
        this.connectionStatus.lastChecked = new Date();
      }

      return aiResponse || null;
    } catch (error) {
      console.error("OpenAI API call failed:", error);
      return null;
    }
  }

  /**
   * Build messages array for chat APIs
   */
  private buildContextualMessages(
    userMessage: string,
    context: ConversationContext,
    profile: LearningProfile,
  ): any[] {
    return this.buildContextualPrompt(
      userMessage,
      context,
      profile,
    );
  }

  /**
   * Record conversation to history
   */
  private recordConversation(
    context: ConversationContext,
    userMessage: string,
    aiResponse: string,
    topic: string,
  ) {
    const conversationEntry: ConversationEntry = {
      timestamp: new Date(),
      userMessage,
      aiResponse,
      topic,
    };
    context.conversationHistory.push(conversationEntry);

    if (context.conversationHistory.length > 50) {
      context.conversationHistory =
        context.conversationHistory.slice(-50);
    }
  }
  private async generateFallbackResponse(
    userMessage: string,
    context: ConversationContext,
    profile: LearningProfile,
    topic: string,
  ): Promise<{
    response: string;
    suggestions: string[];
    topic: string;
  }> {
    const lowerMessage = userMessage.toLowerCase();

    // Check if this is a follow-up question
    const isFollowUp =
      context.conversationHistory.length > 0 &&
      context.conversationHistory[
        context.conversationHistory.length - 1
      ].topic === topic;
    // intentionally mark for lint (used logically but not referenced later)
    void isFollowUp;

    // Personalization based on level
    const levelPrefix = this.getLevelAwarePrefix(
      context.userLevel,
    );

    let response = "";

    // Enhanced responses with personalization
    if (lowerMessage.includes("data type")) {
      const knowledgeLevel =
        profile.knowledgeAreas["java-basics"] || 0;
      response = this.getDataTypesResponse(
        knowledgeLevel,
        context.userLevel,
      );
    } else if (
      lowerMessage.includes("oop") ||
      lowerMessage.includes("object-oriented")
    ) {
      const knowledgeLevel =
        profile.knowledgeAreas["object-oriented-programming"] ||
        0;
      response = this.getOOPResponse(
        knowledgeLevel,
        context.userLevel,
      );
    } else if (lowerMessage.includes("loop")) {
      const knowledgeLevel =
        profile.knowledgeAreas["java-basics"] || 0;
      response = this.getLoopsResponse(
        knowledgeLevel,
        context.userLevel,
      );
    } else if (lowerMessage.includes("debug")) {
      const knowledgeLevel =
        profile.knowledgeAreas["debugging"] || 0;
      response = this.getDebuggingResponse(
        knowledgeLevel,
        context.userLevel,
      );
    } else {
      response = this.getPersonalizedGenericResponse(
        userMessage,
        context,
        profile,
      );
    }

    const fullResponse =
      levelPrefix +
      response +
      this.addProgressiveNext(
        profile.knowledgeAreas[topic] || 0,
        topic,
      );
    const suggestions = this.generateContextualSuggestions(
      topic,
      context,
      profile,
    );

    // Add to conversation history
    const conversationEntry: ConversationEntry = {
      timestamp: new Date(),
      userMessage,
      aiResponse: fullResponse,
      topic,
    };
    context.conversationHistory.push(conversationEntry);

    if (context.conversationHistory.length > 50) {
      context.conversationHistory =
        context.conversationHistory.slice(-50);
    }

    this.updateLearningProfile(context.userId, topic, true);
    this.saveData();

    return { response: fullResponse, suggestions, topic };
  }

  private getLevelAwarePrefix(userLevel: string): string {
    switch (userLevel) {
      case "Beginner":
        return "🌱 **Excellent question for building your Java foundation!** ";
      case "Learner":
        return "🚀 **Great topic to expand your programming skills!** ";
      case "Expert":
        return "👑 **Let's explore this advanced concept in depth!** ";
      default:
        return "💡 **I'm happy to help you with that!** ";
    }
  }

  private getDataTypesResponse(
    knowledgeLevel: number,
    _userLevel: string,
  ): string {
    if (knowledgeLevel < 30) {
      return `Java has two main categories of data types that are fundamental to programming:

🎯 **Primitive Types** (Built into Java):
• \`int\` - whole numbers (e.g., 42, -17)
• \`double\` - decimal numbers (e.g., 3.14, 2.5)
• \`boolean\` - true or false values
• \`char\` - single characters (e.g., 'A', '7')

📦 **Reference Types** (Objects):
• \`String\` - text data (e.g., "Hello World")
• Arrays - collections of data
• Custom objects from classes you create

**Quick Example:**
\`\`\`java
int age = 25;           // primitive
String name = "Alex";   // reference type
\`\`\``;
    } else if (knowledgeLevel < 70) {
      return `Building on your Java data types knowledge! Let's explore the details:

🔢 **Primitive Types & Their Ranges:**
• \`byte\` - 8 bits (-128 to 127)
• \`short\` - 16 bits (-32,768 to 32,767)
• \`int\` - 32 bits (~-2.1 billion to 2.1 billion)
• \`long\` - 64 bits (massive range, suffix with L)
• \`float\` - 32-bit decimals (suffix with f)
• \`double\` - 64-bit decimals (default for decimals)

🎭 **Memory & Performance:**
• Primitives are stored directly in memory (faster)
• Reference types store addresses to objects (more flexible)
• Autoboxing converts primitives to wrapper classes automatically

**Advanced Example:**
\`\`\`java
long bigNumber = 1234567890L;
Integer wrappedInt = 42;  // Autoboxing
int primitiveInt = wrappedInt;  // Unboxing
\`\`\``;
    } else {
      return `Excellent! You're ready for advanced data type concepts:

⚡ **Memory Management Deep Dive:**
• Stack vs Heap storage patterns
• Object reference semantics
• Immutability concepts (String pool)
• Generic type erasure implications

🔧 **Best Practices:**
• Use primitives for performance-critical code
• Leverage wrapper classes for collections
• Understand when autoboxing occurs
• Consider memory footprint in large datasets

**Expert Example:**
\`\`\`java
// Efficient primitive array
int[] numbers = new int[1000000];

// vs. Wrapper array (higher memory cost)
Integer[] boxedNumbers = new Integer[1000000];
\`\`\``;
    }
  }

  private getOOPResponse(
    knowledgeLevel: number,
    _userLevel: string,
  ): string {
    if (knowledgeLevel < 30) {
      return `Object-Oriented Programming (OOP) is like building with LEGO blocks! 🧱

🏗️ **The Four Pillars:**

**1. Encapsulation** - Keeping data safe inside classes
\`\`\`java
public class Car {
    private String engine;  // hidden from outside
    
    public void startCar() {  // controlled access
        engine = "running";
    }
}
\`\`\`

**2. Inheritance** - Child classes get parent abilities
\`\`\`java
class Vehicle {
    void move() { }
}

class Car extends Vehicle {  // Car inherits move()
    void honk() { }
}
\`\`\`

**3. Polymorphism** - Same method, different behaviors
**4. Abstraction** - Hiding complex details

Think of it as creating blueprints (classes) to build objects!`;
    } else {
      return `Advanced OOP concepts - you're mastering the art of object design! 🎨

🔧 **Design Principles (SOLID):**
• Single Responsibility - Each class has one job
• Open/Closed - Open for extension, closed for modification
• Liskov Substitution - Subtypes must be substitutable
• Interface Segregation - Many specific interfaces > one general
• Dependency Inversion - Depend on abstractions, not concretions

**Advanced Polymorphism:**
\`\`\`java
interface Drawable {
    void draw();
}

class Circle implements Drawable {
    @Override
    public void draw() { /* circle logic */ }
}

// Runtime polymorphism
Drawable shape = new Circle();
shape.draw();  // Calls Circle's implementation
\`\`\`

🏛️ **Design Patterns:** Ready to explore Factory, Observer, Strategy patterns?`;
    }
  }

  private getLoopsResponse(
    knowledgeLevel: number,
    _userLevel: string,
  ): string {
    if (knowledgeLevel < 30) {
      return `Loops are like giving instructions to repeat tasks! 🔄

**For Loop** - When you know how many times:
\`\`\`java
for (int i = 0; i < 5; i++) {
    System.out.println("Count: " + i);
}
// Prints: Count: 0, Count: 1, Count: 2, Count: 3, Count: 4
\`\`\`

**While Loop** - Keep going while condition is true:
\`\`\`java
int countdown = 3;
while (countdown > 0) {
    System.out.println(countdown);
    countdown--;  // Don't forget this!
}
\`\`\`

**Enhanced For Loop** - Perfect for arrays:
\`\`\`java
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
\`\`\`

💡 **Remember:** Always make sure your condition eventually becomes false to avoid infinite loops!`;
    } else {
      return `Advanced looping techniques and optimizations! ⚡

**Stream API (Modern Java):**
\`\`\`java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.stream()
     .filter(name -> name.length() > 3)
     .forEach(System.out::println);
\`\`\`

**Performance Considerations:**
• Enhanced for-loops are generally fastest for arrays
• Iterator pattern for LinkedList traversal
• Parallel streams for CPU-intensive operations
• Break and continue for loop control

**Nested Loop Optimization:**
\`\`\`java
// Instead of O(n²) nested loops, consider:
Set<Integer> lookup = new HashSet<>(list1);
for (int item : list2) {
    if (lookup.contains(item)) {  // O(1) instead of O(n)
        // found match
    }
}
\`\`\``;
    }
  }

  private getDebuggingResponse(
    knowledgeLevel: number,
    _userLevel: string,
  ): string {
    if (knowledgeLevel < 30) {
      return `Debugging is like being a detective! 🔍 Let's solve those code mysteries:

**Step 1: Read the Error Message**
\`\`\`
Exception in thread "main" java.lang.NullPointerException
    at MyClass.methodName(MyClass.java:42)
\`\`\`
↳ This tells you EXACTLY where the problem is (line 42)!

**Step 2: Print Debugging**
\`\`\`java
System.out.println("Value of x: " + x);
System.out.println("Reached this point");
\`\`\`

**Step 3: Check Your Logic**
• Are you using = instead of == for comparison?
• Did you initialize your variables?
• Are your loop conditions correct?

**Step 4: Test Small Parts**
Break your code into smaller methods and test each one separately!

🎯 **Pro Tip:** Explain your code to a rubber duck (or friend) - you'll often spot the bug while talking!`;
    } else {
      return `Advanced debugging strategies for complex applications! 🛠️

**IDE Debugging Tools:**
• Breakpoints with conditions
• Watch expressions for variable monitoring
• Step into/over/out navigation
• Evaluate expressions at runtime

**Logging Best Practices:**
\`\`\`java
import java.util.logging.Logger;

private static final Logger LOGGER = Logger.getLogger(MyClass.class.getName());

public void processData(List<String> data) {
    LOGGER.info("Processing " + data.size() + " items");
    // ... processing logic
    LOGGER.fine("Intermediate result: " + result);
}
\`\`\`

**Advanced Techniques:**
• Thread dumps for concurrency issues
• Memory profiling for performance problems
• Unit tests as debugging tools
• Stack trace analysis for root cause identification

**Exception Handling Strategy:**
• Fail fast with meaningful error messages
• Use custom exceptions for business logic errors
• Log context information, not just error messages`;
    }
  }

  private getPersonalizedGenericResponse(
    userMessage: string,
    context: ConversationContext,
    profile: LearningProfile,
  ): string {
    const strongAreas = Object.entries(profile.knowledgeAreas)
      .filter(([_, score]) => score > 60)
      .map(([topic, _]) => topic.replace("-", " "));

    const weakAreas = Object.entries(profile.knowledgeAreas)
      .filter(([_, score]) => score < 40)
      .map(([topic, _]) => topic.replace("-", " "));

    return `I'm continuously learning to help you better! 🤔 

Based on our conversations, I can see you're doing well with: ${strongAreas.length > 0 ? strongAreas.join(", ") : "building your foundation"}.

${weakAreas.length > 0 ? `We could work more on: ${weakAreas.slice(0, 2).join(", ")}.` : ""}

Here are some Java topics I can definitely help you master:
• **Fundamentals:** Variables, data types, operators
• **Control Flow:** Loops, conditionals, method calls
• **OOP Concepts:** Classes, objects, inheritance, polymorphism
• **Data Structures:** Arrays, Lists, Maps, Sets
• **Exception Handling:** Try-catch, custom exceptions
• **Advanced Topics:** Streams, lambdas, multithreading

What specific aspect would you like to explore? I'll tailor my explanation to your current level! 🎯`;
  }

  private addProgressiveNext(
    knowledgeLevel: number,
    _topic: string,
  ): string {
    if (knowledgeLevel < 30) {
      return `\n\n🎯 **Next Steps:** Try creating a simple example using these concepts!`;
    } else if (knowledgeLevel < 70) {
      return `\n\n🚀 **Ready for More?** Let's explore practical applications and best practices!`;
    } else {
      return `\n\n👑 **Master Level:** Consider advanced patterns, performance optimization, or teaching others!`;
    }
  }

  private generateContextualSuggestions(
    topic: string,
    context: ConversationContext,
    profile: LearningProfile,
  ): string[] {
    const baseTopicSuggestions: { [key: string]: string[] } = {
      "java-basics": [
        "What's the difference between = and == in Java?",
        "How do I work with String methods?",
        "Explain variable scope in Java",
      ],
      "object-oriented-programming": [
        "Show me inheritance with examples",
        "What's method overriding vs overloading?",
        "How do interfaces work in Java?",
      ],
      "data-structures": [
        "When should I use ArrayList vs LinkedList?",
        "How do HashMaps work internally?",
        "Explain the Collections framework",
      ],
      debugging: [
        "How to read stack traces effectively?",
        "What are common Java exceptions?",
        "Best practices for error handling",
      ],
    };

    const suggestions = baseTopicSuggestions[topic] || [
      "What Java concept should I learn next?",
      "Help me understand object-oriented programming",
      "Show me Java best practices",
    ];

    // Add personalized suggestions based on knowledge gaps
    const weakAreas = Object.entries(profile.knowledgeAreas)
      .filter(([_, score]) => score < 40)
      .map(([areaTopic, _]) => areaTopic);

    if (
      weakAreas.length > 0 &&
      baseTopicSuggestions[weakAreas[0]]
    ) {
      suggestions.push(baseTopicSuggestions[weakAreas[0]][0]);
    }

    return suggestions.slice(0, 3);
  }

  recordFeedback(
    userId: string,
    messageId: string,
    wasHelpful: boolean,
    feedback?: string,
  ) {
    const context = this.conversationContexts.get(userId);
    if (context) {
      const entry = context.conversationHistory.find(
        (h) => h.timestamp.getTime().toString() === messageId,
      );
      if (entry) {
        entry.wasHelpful = wasHelpful;
        entry.userFeedback = feedback;

        // Update learning based on feedback
        this.updateLearningProfile(
          userId,
          entry.topic,
          wasHelpful,
        );
        this.saveData();
      }
    }
  }

  getLearningInsights(userId: string): {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  } {
    const profile = this.getOrCreateLearningProfile(userId);

    const strengths = Object.entries(profile.knowledgeAreas)
      .filter(([_, score]) => score > 70)
      .map(([topic, _]) => topic.replace("-", " "));

    const improvements = Object.entries(profile.knowledgeAreas)
      .filter(([_, score]) => score < 40)
      .map(([topic, _]) => topic.replace("-", " "));

    const suggestions = profile.personalizedSuggestions.slice(
      0,
      3,
    );

    return { strengths, improvements, suggestions };
  }

  /**
   * Set free API provider configuration
   */
  async setFreeAPIProvider(
    provider: FreeAPIProvider,
    apiKey?: string,
    endpoint?: string,
  ): Promise<boolean> {
    this.freeAPIConfig.provider = provider;
    this.freeAPIConfig.apiKey = apiKey;
    this.freeAPIConfig.endpoint = endpoint;

    this.setProviderDefaults(provider);

    // Store configuration
    localStorage.setItem("free_api_provider", provider);
    if (apiKey) {
      localStorage.setItem("free_api_key", apiKey);
    }
    if (endpoint) {
      localStorage.setItem("free_api_endpoint", endpoint);
    }

    // Test connection
    const isConnected = await this.testFreeAPIConnection();

    if (isConnected) {
      // Free API provider configured and tested (silent)
    } else {
      console.warn(
        `⚠️ Free API provider "${provider}" configuration failed connection test`,
      );
    }

    return isConnected;
  }

  /**
   * Get available free API providers
   */
  getAvailableFreeProviders(): Array<{
    name: FreeAPIProvider;
    displayName: string;
    description: string;
    signupUrl: string;
    documentationUrl: string;
  }> {
    return [
      {
        name: "huggingface",
        displayName: "HuggingFace Inference API",
        description:
          "Free tier with rate limits. Sign up for a free API key.",
        signupUrl: "https://huggingface.co/join",
        documentationUrl:
          "https://huggingface.co/docs/api-inference/quicktour",
      },
      {
        name: "together",
        displayName: "Together AI",
        description:
          "Free tier with credits. Sign up for free $5 credits.",
        signupUrl: "https://www.together.ai/",
        documentationUrl:
          "https://docs.together.ai/docs/quickstart",
      },
      {
        name: "ollama",
        displayName: "Local Ollama (Self-Hosted)",
        description:
          "Run locally on your machine. No API key required.",
        signupUrl: "https://ollama.ai",
        documentationUrl: "https://github.com/ollama/ollama",
      },
    ];
  }

  /**
   * Get current free API configuration status
   */
  getFreeAPIStatus(): FreeAPIConfig {
    return { ...this.freeAPIConfig };
  }

  /**
   * Clear free API configuration
   */
  clearFreeAPI() {
    this.freeAPIConfig.provider = "none";
    this.freeAPIConfig.apiKey = undefined;
    this.freeAPIConfig.endpoint = undefined;
    this.freeAPIConfig.isAvailable = false;

    localStorage.removeItem("free_api_provider");
    localStorage.removeItem("free_api_key");
    localStorage.removeItem("free_api_endpoint");

    // Free API configuration cleared (silent)
  } /**
   * Clear stored API key
   */
  clearApiKey() {
    this.apiKey = "";
    this.connectionStatus.isConfigured = false;
    this.connectionStatus.usingFallback = true;
    localStorage.removeItem("openai_api_key");
    // OpenAI API key cleared (silent)
  }

  /**
   * Set model at runtime
   */
  setModel(model: string) {
    this.model = model;
    // OpenAI model set (silent)
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }
}

export const openAI = OpenAIService.getInstance();
export type {
  ConversationContext,
  ConversationEntry,
  LearningProfile,
  APIConnectionStatus,
  FreeAPIConfig,
  FreeAPIProvider,
};