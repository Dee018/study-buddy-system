# AI Chatbot - Complete Flow Diagrams

## 🗺️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     STUDY BUDDY CHATBOT                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐             │
│  │ ChatAssistant  │──────│ OpenAI Service   │             │
│  │  Component     │      │   (Singleton)     │             │
│  └────────────────┘      └──────────────────┘             │
│         │                         │                         │
│         │                         ├──→ Environment Vars     │
│         │                         ├──→ localStorage         │
│         │                         ├──→ OpenAI API          │
│         │                         └──→ Fallback Logic      │
│         │                                                   │
│  ┌─────▼──────────────────────────────────────────┐       │
│  │            User Interface                       │       │
│  │  • Message Display                              │       │
│  │  • Input Field                                  │       │
│  │  • Quick Actions                                │       │
│  │  • Status Indicators                            │       │
│  │  • Feedback Buttons                             │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow - Complete Journey

### **Scenario 1: No API Key Configured** (Default State)

```
┌─────────────┐
│    USER     │
│  Types Msg  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  ChatAssistant.handleSendMessage()   │
│  • Creates user message object       │
│  • Adds to messages array            │
│  • Clears input field                │
│  • Sets isTyping = true              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  openAI.generateResponse()           │
│  • Gets/creates user context         │
│  • Gets/creates learning profile     │
│  • Identifies message topic          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  CHECK: Is API key configured?       │
│  apiKey === '' → NO                  │
└──────┬───────────────────────────────┘
       │ NO
       ▼
┌──────────────────────────────────────┐
│  ⚠️ Log Warning                      │
│  "OpenAI API key not configured"     │
│  (Console only, not shown to user)   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  generateFallbackResponse()          │
│  • Analyzes user message             │
│  • Checks user knowledge level       │
│  • Selects appropriate response      │
│  • Personalizes based on history     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Returns Response Object             │
│  {                                   │
│    response: "Helpful content...",   │
│    suggestions: ["Q1", "Q2", "Q3"],  │
│    topic: "java-basics"              │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Creates Bot Message                 │
│  • Adds response to messages         │
│  • Includes suggestions              │
│  • Sets topic metadata               │
│  • feedback = null                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Updates Learning Profile            │
│  • Updates knowledge scores          │
│  • Records recent topics             │
│  • Saves to localStorage             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  UI Updates                          │
│  • Message appears in chat           │
│  • Typing indicator disappears       │
│  • Suggestions shown                 │
│  • Feedback buttons displayed        │
│  • Scroll to bottom                  │
└──────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│    USER     │
│  Sees Reply │
└─────────────┘
```

---

### **Scenario 2: API Key Configured** (Production Mode)

```
┌─────────────┐
│    USER     │
│  Types Msg  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  ChatAssistant.handleSendMessage()   │
│  (Same as above)                     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  openAI.generateResponse()           │
│  (Same as above)                     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  CHECK: Is API key configured?       │
│  apiKey !== '' → YES ✅              │
└──────┬───────────────────────────────┘
       │ YES
       ▼
┌──────────────────────────────────────┐
│  buildContextualPrompt()             │
│  • Creates system prompt             │
│  • Includes user profile             │
│  • Adds conversation history         │
│  • Adds current message              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  fetch(api.openai.com)               │
│  POST /v1/chat/completions           │
│  {                                   │
│    model: "gpt-4o-mini",             │
│    messages: [...],                  │
│    temperature: 0.7,                 │
│    max_tokens: 1000                  │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  CHECK: Response OK?                 │
└──────┬────────────┬──────────────────┘
       │ YES        │ NO
       ▼            ▼
   ┌────────┐  ┌────────────────────┐
   │Success │  │  Log Error         │
   └───┬────┘  │  Use Fallback      │
       │       └────────┬───────────┘
       │                │
       └────────┬───────┘
                ▼
┌──────────────────────────────────────┐
│  Extract AI Response                 │
│  data.choices[0].message.content     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  generateContextualSuggestions()     │
│  • Based on topic                    │
│  • Based on knowledge gaps           │
│  • Returns 3 suggestions             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Update Conversation History         │
│  • Add user message                  │
│  • Add AI response                   │
│  • Keep last 50 messages             │
│  • Save to localStorage              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Update Learning Profile             │
│  • Increment knowledge score         │
│  • Update recent topics              │
│  • Generate insights                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Update Connection Status            │
│  connectionStatus.isConnected = true │
│  connectionStatus.usingFallback = NO │
│  connectionStatus.lastChecked = NOW  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Returns Response Object             │
│  {                                   │
│    response: "AI-generated...",      │
│    suggestions: ["...", "...", ...], │
│    topic: "detected-topic"           │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  UI Updates (same as Scenario 1)    │
└──────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│    USER     │
│  Sees Reply │
└─────────────┘
```

---

### **Scenario 3: API Call Fails** (Error Recovery)

```
┌─────────────┐
│    USER     │
│  Types Msg  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Normal flow starts...               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  fetch(api.openai.com)               │
│  POST /v1/chat/completions           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  ❌ Network Error                    │
│  OR                                  │
│  ❌ 401 Unauthorized                 │
│  OR                                  │
│  ❌ 429 Rate Limit                   │
│  OR                                  │
│  ❌ 500 Server Error                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  CATCH Error                         │
│  console.error("OpenAI API error")   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Update Connection Status            │
│  connectionStatus.isConnected = NO   │
│  connectionStatus.usingFallback = YES│
│  connectionStatus.lastError = error  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  generateFallbackResponse()          │
│  • Uses built-in knowledge           │
│  • Maintains quality                 │
│  • Personalizes based on history     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Returns Graceful Response           │
│  {                                   │
│    response: "Helpful fallback...",  │
│    suggestions: [...],               │
│    topic: "topic"                    │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  UI Updates                          │
│  • Normal message display            │
│  • Optional: "Offline Mode" badge    │
│  • No scary error messages           │
└──────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│    USER     │
│  Sees Reply │
│  (Unaware   │
│  of issue)  │
└─────────────┘
```

---

## 🔐 API Key Configuration Flow

### **Environment Variable Path**

```
┌─────────────────────┐
│  Developer creates  │
│    .env file        │
│                     │
│  VITE_OPENAI_API_   │
│  KEY=sk-proj-...    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Vite Build Process │
│  Reads .env at      │
│  compile time       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  import.meta.env    │
│  .VITE_OPENAI_API_  │
│  KEY                │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenAIService      │
│  constructor()      │
│  initializeAPIKey() │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  apiKey set ✅      │
│  isConfigured: true │
│  usingFallback: NO  │
└─────────────────────┘
```

### **Runtime Configuration Path**

```
┌─────────────────────┐
│  Developer/Admin    │
│  opens console      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  openAI.setApiKey(  │
│    'sk-proj-...',   │
│    persist: true    │
│  )                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  apiKey set ✅      │
│  Saved to          │
│  localStorage       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Refresh page or    │
│  make API call      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  API key loaded     │
│  from localStorage  │
│  isConfigured: true │
└─────────────────────┘
```

### **localStorage Initialization**

```
┌─────────────────────┐
│  Page Load          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenAIService      │
│  constructor()      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  initializeAPIKey() │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Check:             │
│  1. import.meta.env?│
│     NO ↓            │
│  2. localStorage?   │
│     YES ✅          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Load from          │
│  localStorage       │
│  'openai_api_key'   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  apiKey set ✅      │
│  isConfigured: true │
│  Log success        │
└─────────────────────┘
```

---

## 🎯 Topic Identification Flow

```
┌─────────────────────┐
│  User Message       │
│  "How do loops work │
│   in Java?"         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  identifyTopic()    │
│  • Convert to lower │
│  • Check keywords   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Keyword Matching                        │
│                                          │
│  topicKeywords = {                       │
│    'java-basics': [                      │
│      'variable', 'data type', 'syntax',  │
│      'primitive', 'string', 'basic'      │
│    ],                                    │
│    'object-oriented-programming': [...], │
│    'data-structures': [...],             │
│    'algorithms': [...],                  │
│    ...                                   │
│  }                                       │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Message contains   │
│  'loop' keyword     │
│  → Match found!     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Return topic:      │
│  'java-basics'      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Context     │
│  recentTopics =     │
│  ['java-basics',... │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Select Response    │
│  based on topic     │
│  and knowledge level│
└─────────────────────┘
```

---

## 📊 Learning Profile Update Flow

```
┌─────────────────────┐
│  User Interaction   │
│  Completed          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  updateLearning     │
│  Profile()          │
│  • userId           │
│  • topic            │
│  • wasSuccessful    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Get/Create Profile │
│  for user           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Update Knowledge Score              │
│                                      │
│  IF successful:                      │
│    score += 5 (max 100)              │
│  ELSE:                               │
│    score -= 2 (min 0)                │
│                                      │
│  knowledgeAreas[topic] = newScore    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Update Recent      │
│  Topics             │
│  [topic, ...old]    │
│  .slice(0, 5)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Save to            │
│  localStorage       │
│  'openai_learning_  │
│  profiles'          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Profile Updated ✅ │
│  Ready for next     │
│  interaction        │
└─────────────────────┘
```

---

## 🔄 Feedback Loop Flow

```
┌─────────────────────┐
│  User clicks        │
│  👍 or 👎           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  handleFeedback()   │
│  • messageId        │
│  • wasHelpful       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Message     │
│  feedback property  │
│  in state           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  openAI.record      │
│  Feedback()         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Find message in    │
│  conversation       │
│  history            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update entry:      │
│  • wasHelpful       │
│  • userFeedback     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Learning    │
│  Profile based on   │
│  feedback           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Save changes to    │
│  localStorage       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  UI shows button    │
│  as selected        │
│  (green or red)     │
└─────────────────────┘
```

---

## 🎨 UI State Machine

```
                    ┌─────────────┐
                    │   INITIAL   │
                    │   STATE     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐     ┌──────────────────┐
    │  API Configured  │     │ No API (Default) │
    │    isConfigured  │     │  usingFallback   │
    │    = true        │     │  = true          │
    └────────┬─────────┘     └────────┬─────────┘
             │                        │
             │                        │
    ┌────────▼─────────┐     ┌────────▼─────────┐
    │ Test Connection  │     │  Ready to Use    │
    │  at startup      │     │  (Fallback Mode) │
    └────────┬─────────┘     └────────┬─────────┘
             │                        │
        ┌────┴────┐                  │
        │         │                  │
        ▼         ▼                  │
    ┌────────┐ ┌────────┐            │
    │Success │ │ Failed │            │
    │        │ │        │            │
    └───┬────┘ └───┬────┘            │
        │          │                 │
        ▼          ▼                 │
    ┌────────────────┐               │
    │   CONNECTED    │               │
    │  isConnected   │◄──────────────┘
    │   = true       │
    │  Using OpenAI  │
    └────────┬───────┘
             │
             │ (User sends message)
             │
    ┌────────▼─────────┐
    │    PROCESSING    │
    │   isTyping=true  │
    └────────┬─────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
    ┌────────┐ ┌────────┐
    │API Call│ │Fallback│
    │        │ │        │
    └───┬────┘ └───┬────┘
        │          │
        └────┬─────┘
             │
             ▼
    ┌────────────────┐
    │   RESPONDED    │
    │  isTyping=false│
    │  Message shown │
    └────────────────┘
```

---

## 🔍 Connection Status Check Flow

```
┌─────────────────────┐
│  getConnection      │
│  Status()           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Return Object:     │
│  {                  │
│    isConfigured,    │
│    isConnected,     │
│    usingFallback,   │
│    lastError,       │
│    lastChecked      │
│  }                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  UI reads status    │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
┌──────────┐ ┌──────────┐
│ Connected│ │ Fallback │
│   Mode   │ │   Mode   │
└─────┬────┘ └─────┬────┘
      │            │
      ▼            ▼
┌──────────┐ ┌──────────┐
│Show Green│ │Show Yellow│
│  Badge   │ │  Banner  │
└──────────┘ └──────────┘
```

---

## 📋 Summary Flow Chart

```
┌──────────────────────────────────────────────────────────┐
│                    USER SENDS MESSAGE                     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ API Configured?│
                 └───────┬────────┘
                    ┌────┴────┐
                    │         │
                 YES│         │NO
                    ▼         ▼
         ┌──────────────┐  ┌──────────────┐
         │  Call OpenAI │  │Use Fallback  │
         │     API      │  │  Responses   │
         └──────┬───────┘  └──────┬───────┘
                │                  │
            ┌───┴───┐              │
            │       │              │
         SUCCESS  ERROR            │
            │       │              │
            ▼       ▼              │
         ┌──────────────────────┐  │
         │   AI Response        │  │
         └──────────┬───────────┘  │
                    │              │
                    └──────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Display Reply │
                  │  to User       │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Update Profile│
                  │  Save History  │
                  └────────────────┘
```

---

These flow diagrams provide a complete visual representation of how the chatbot system works, including all error handling, configuration paths, and user interaction flows!
