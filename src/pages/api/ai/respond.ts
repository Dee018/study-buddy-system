import type { NextApiRequest, NextApiResponse } from 'next';
import { openAI } from '../../../utils/openAI';
// Use global fetch when available (Node 18+). Dynamically import 'node-fetch' as fallback.

type SuccessBody = {
  response: string;
  suggestions: string[];
  topic: string;
};

type ErrorBody = { error: string };

async function safeParseBody(body: any) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessBody | ErrorBody>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Resolve server-side OpenAI key (try process.env, then VITE var, then dotenv)
  let OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    try {
      // Dynamically load dotenv to pick up .env in development (no-op in production)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dotenv = await import('dotenv').catch(() => null);
      if (dotenv && dotenv.config) {
        dotenv.config();
        OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!OPENAI_KEY) {
    console.error('[api/ai/respond] missing OPENAI_API_KEY on server (tried env and .env)');
    return res.status(500).json({ error: 'Server not configured for OpenAI' });
  }

  const parsed = await safeParseBody(req.body);
  console.debug('[api/ai/respond] parsed body:', parsed);
  const userMessage = (parsed.userMessage || '').toString().trim();
  const userId = typeof parsed.userId === 'string' ? parsed.userId : 'anonymous';
  const userLevel = typeof parsed.userLevel === 'string' ? parsed.userLevel : 'Beginner';

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  // Try the app's openAI wrapper first, but fall back to a direct server call
  try {
    const result = await openAI.generateResponse(userMessage, userId, userLevel);
    const response = typeof result?.response === 'string' ? result.response : String(result?.response ?? '');
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions.map(String) : [];
    const topic = typeof result?.topic === 'string' ? result.topic : (result?.topic ? String(result.topic) : 'general');
    return res.status(200).json({ response, suggestions, topic });
  } catch (wrapperErr) {
    console.error('[api/ai/respond] openAI.generateResponse failed, falling back to direct API call', wrapperErr);
    // In dev, include error details in logs and (optionally) in response to aid debugging
    const wrapperMsg = wrapperErr?.message || String(wrapperErr);
    try {
      // Direct call to OpenAI REST API as a robust fallback
      const payload = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: `You are Study Buddy AI assistant for a ${userLevel} user.` }, { role: 'user', content: userMessage }],
        max_tokens: 800,
        temperature: 0.7
      };

      const fetchFn = (globalThis as any).fetch ?? (await import('node-fetch').then(m => m.default || m));
      const resp = await fetchFn('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const bodyText = await resp.text();
        console.error('[api/ai/respond] OpenAI REST error', resp.status, bodyText);
        const errMsg = `OpenAI API error: ${resp.status}`;
        if (process.env.NODE_ENV !== 'production') {
          return res.status(502).json({ error: errMsg + ' - ' + bodyText });
        }
        return res.status(502).json({ error: errMsg });
      }

      const data = await resp.json();
      const aiText = String((data?.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || '');

      // No structured suggestions/topic available from fallback; return defaults
      return res.status(200).json({ response: aiText, suggestions: [], topic: 'general' });
    } catch (directErr: any) {
      console.error('[api/ai/respond] fallback direct OpenAI call failed:', directErr);
      const devMsg = directErr?.message || String(directErr || 'Failed to generate AI response');
      if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json({ error: devMsg + ' | wrapper: ' + wrapperMsg });
      }
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }
  }
}

