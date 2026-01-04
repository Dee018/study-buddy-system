import express from "express";
import { Pool } from "pg";

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Initialize database pool; DATABASE_URL is optional if you don't use DB features
let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      max: 3,
      query_timeout: 5000,
    } as any);
    console.log("[aiEndpoint] Database pool initialized");
  } catch (err) {
    console.error("[aiEndpoint] Failed to init database pool:", err);
    pool = null;
  }
} else {
  console.warn("[aiEndpoint] DATABASE_URL not set; database features will be disabled");
}

type LearningProfile = {
  knowledgeAreas: { [key: string]: number };
  learningPatterns?: string[];
  frequentQuestions?: string[];
  lastActiveTopics?: string[];
  personalizedSuggestions?: string[];
};

function defaultLearningProfile(): LearningProfile {
  return {
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
}

function detectTopic(message: string): string {
  const topicKeywords: { [k: string]: string[] } = {
    "java-basics": ["variable", "data type", "syntax", "primitive", "string", "basic"],
    "object-oriented-programming": ["class", "object", "inheritance", "polymorphism", "encapsulation", "abstraction", "oop"],
    "data-structures": ["array", "list", "arraylist", "linkedlist", "queue", "stack", "map", "hashmap"],
    algorithms: ["sort", "search", "algorithm", "complexity", "big o", "recursion"],
    "exception-handling": ["exception", "try", "catch", "finally", "throw", "throws", "error"],
    collections: ["collection", "set", "hashset", "iterator", "stream", "lambda"],
    multithreading: ["thread", "concurrent", "synchronization", "parallel", "async"],
    debugging: ["debug", "error", "bug", "troubleshoot", "fix", "problem"],
  };

  const lower = message.toLowerCase();
  for (const [topic, keys] of Object.entries(topicKeywords)) {
    if (keys.some((k) => lower.includes(k))) return topic;
  }
  return "general";
}

function generateSuggestions(topic: string, profile: LearningProfile): string[] {
  const base: { [k: string]: string[] } = {
    "java-basics": ["What's the difference between = and == in Java?", "How do I work with String methods?", "Explain variable scope in Java"],
    "object-oriented-programming": ["Show me inheritance with examples", "What's method overriding vs overloading?", "How do interfaces work in Java?"],
    "data-structures": ["When should I use ArrayList vs LinkedList?", "How do HashMaps work internally?", "Explain the Collections framework"],
    debugging: ["How to read stack traces effectively?", "What are common Java exceptions?", "Best practices for error handling"],
  };

  const suggestions = base[topic] || ["What Java concept should I learn next?", "Help me understand object-oriented programming", "Show me Java best practices"];

  const weakAreas = Object.entries(profile.knowledgeAreas)
    .filter(([_, s]) => s < 40)
    .map(([t]) => t);

  if (weakAreas.length && base[weakAreas[0]]) suggestions.push(base[weakAreas[0]][0]);
  return suggestions.slice(0, 3);
}

async function fetchLearningProfile(userId: string): Promise<LearningProfile> {
  try {
    if (!pool) return defaultLearningProfile();
    const { rows } = await pool.query("SELECT profile_data FROM learning_profiles WHERE user_id = $1 LIMIT 1", [userId]);
    if (!rows || rows.length === 0) return defaultLearningProfile();
    const row = rows[0];
    if (!row || !row.profile_data) return defaultLearningProfile();
    return row.profile_data as LearningProfile;
  } catch (err) {
    console.warn("fetchLearningProfile error:", err);
    return defaultLearningProfile();
  }
}

async function fetchRecentActivities(userId: string) {
  try {
    if (!pool) return [];
    const { rows } = await pool.query(
      "SELECT type, metadata, created_at FROM user_activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId],
    );
    return rows;
  } catch (err) {
    console.warn("fetchRecentActivities error:", err);
    return [];
  }
}

async function fetchAssessments(userId: string) {
  try {
    if (!pool) return [];
    const { rows } = await pool.query(
      "SELECT assessment_name, score, details, taken_at FROM assessments WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 5",
      [userId],
    );
    return rows;
  } catch (err) {
    console.warn("fetchAssessments error:", err);
    return [];
  }
}

async function fetchConversationHistory(userId: string) {
  try {
    if (!pool) return [];
    const { rows } = await pool.query(
      "SELECT message_id, user_message, ai_response, topic, timestamp FROM conversations WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10",
      [userId],
    );
    return rows;
  } catch (err) {
    console.warn("fetchConversationHistory error:", err);
    return [];
  }
}

function buildSystemPrompt(profile: LearningProfile, recentTopics: string[], userLevel: string) {
  const strengths = Object.entries(profile.knowledgeAreas)
    .filter(([, score]) => score > 70)
    .map(([t]) => t.replace("-", " "))
    .join(", ") || "Still building foundation";

  const needs = Object.entries(profile.knowledgeAreas)
    .filter(([, score]) => score < 40)
    .map(([t]) => t.replace("-", " "))
    .join(", ") || "None identified";

  return `You are Study Buddy AI, an expert Java programming tutor integrated into a learning platform.\n\nSTUDENT PROFILE:\n- Level: ${userLevel}\n- Recent topics: ${recentTopics.slice(0, 3).join(", ") || "None"}\n- Knowledge strengths: ${strengths}\n- Areas needing work: ${needs}\n\nProvide personalized, concise answers. Include Java code examples when appropriate. Keep explanations actionable.`;
}

async function callOpenAIApi(messages: any[]): Promise<string | null> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured on the server");

  const body = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const resp = await fetch(OPENAI_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${t}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || null;
  return content;
}

async function persistConversation(userId: string, userMessage: string, aiResponse: string, topic: string) {
  try {
    if (!pool) return; // Skip if no database
    await pool.query(
      `INSERT INTO conversations (user_id, user_message, ai_response, topic, timestamp) VALUES ($1, $2, $3, $4, now())`,
      [userId, userMessage, aiResponse, topic],
    );
  } catch (err) {
    console.warn("persistConversation error:", err);
  }
}

router.post("/respond", async (req, res) => {
  try {
    console.log("[aiEndpoint] /respond hit");
    const { userId, userMessage, userLevel } = req.body;
    if (!userId || !userMessage) return res.status(400).json({ error: "userId and userMessage are required" });

    const [profile, activities, assessments, history] = await Promise.all([
      fetchLearningProfile(userId),
      fetchRecentActivities(userId),
      fetchAssessments(userId),
      fetchConversationHistory(userId),
    ]);

    const topic = detectTopic(userMessage);

    const systemPrompt = buildSystemPrompt(profile, profile.lastActiveTopics || activities.map((a: any) => a.type || ""), userLevel || "Learner");

    const messages: any[] = [{ role: "system", content: systemPrompt }];

    (history || []).slice(0, 6).reverse().forEach((h: any) => {
      messages.push({ role: "user", content: h.user_message });
      messages.push({ role: "assistant", content: h.ai_response });
    });

    messages.push({ role: "user", content: userMessage });

    let aiResponse: string | null = null;
    try {
      aiResponse = await callOpenAIApi(messages);
    } catch (err) {
      console.error("OpenAI call failed:", err);
      aiResponse = `Sorry — I'm unable to reach the AI service right now. Meanwhile: ${generateSuggestions(topic, profile).join(" | ")}`;
    }

    await persistConversation(userId, userMessage, aiResponse || "", topic);

    const suggestions = generateSuggestions(topic, profile);

    return res.json({ response: aiResponse, suggestions, topic });
  } catch (error: any) {
    console.error("/api/ai/respond error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
