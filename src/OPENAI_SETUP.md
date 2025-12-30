# OpenAI Integration Setup Guide

## Overview
The Java Study Buddy system now uses OpenAI's GPT models for the AI Assistant feature. This provides intelligent, context-aware responses for Java programming questions.

## Current Configuration
- **Model**: GPT-4o-mini (cost-effective and fast)
- **API Endpoint**: https://api.openai.com/v1/chat/completions
- **Features**: 
  - Personalized learning based on student level
  - Conversation context awareness
  - Topic identification and tracking
  - Learning profile building

## Setting Up Your OpenAI API Key

### Step 1: Get Your API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy your API key (it won't be shown again!)

### Step 2: Add API Key to the Application

Open `/utils/openAI.ts` and replace the placeholder:

```typescript
private apiKey: string = 'YOUR_OPENAI_API_KEY_HERE';
```

With your actual API key:

```typescript
private apiKey: string = 'sk-...your-actual-key...';
```

### Step 3: (Recommended) Use Environment Variables

For production deployments, use environment variables instead of hardcoding:

1. Create a `.env` file in your project root:
```
OPENAI_API_KEY=sk-...your-actual-key...
```

2. Update `/utils/openAI.ts`:
```typescript
private apiKey: string = import.meta.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
```

## Model Options

You can change the model by modifying the `model` property in `/utils/openAI.ts`:

### Available Models:
- **gpt-4o-mini** (Current) - Cost-effective, fast, great for educational use
- **gpt-4o** - More powerful, better reasoning
- **gpt-3.5-turbo** - Faster, more economical for simple queries

To change:
```typescript
private model: string = 'gpt-4o-mini'; // Change this line
```

## Cost Management

### Estimated Costs (as of 2024):
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **GPT-4o**: ~$2.50 per 1M input tokens, ~$10.00 per 1M output tokens

### Cost Optimization Tips:
1. Use GPT-4o-mini for most educational queries
2. Limit conversation history (currently set to last 50 messages)
3. Set up usage limits in your OpenAI account dashboard
4. Monitor usage regularly through OpenAI dashboard

## Testing Without API Key

The system includes fallback responses that work without an API key:
- Pre-programmed responses for common Java questions
- Topic identification and personalization
- Learning profile tracking

This allows you to test the system without OpenAI integration. Simply leave the API key as the default placeholder.

## Runtime Configuration

You can change the API key or model at runtime using:

```typescript
import { openAI } from './utils/openAI';

// Update API key
openAI.setApiKey('your-new-api-key');

// Update model
openAI.setModel('gpt-4o');
```

## Features Comparison

### With OpenAI API:
✅ Real-time AI responses
✅ Advanced reasoning and explanations
✅ Code generation and debugging
✅ Context-aware follow-ups
✅ Natural conversation flow

### Without API (Fallback):
✅ Pre-programmed Java responses
✅ Topic identification
✅ Learning profile tracking
✅ Personalized suggestions
❌ Limited to pre-defined knowledge
❌ Less natural conversation

## Troubleshooting

### API Key Not Working:
1. Verify the key is correct (starts with 'sk-')
2. Check you have billing enabled in OpenAI account
3. Ensure you haven't exceeded rate limits
4. Check browser console for specific error messages

### Rate Limit Errors:
1. Reduce request frequency
2. Consider upgrading OpenAI tier
3. Implement request queuing in the application

### CORS Issues:
If deploying to production, you may need to proxy requests through your backend to avoid CORS issues and keep API keys secure.

## Security Best Practices

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Never commit API keys to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use backend proxy in production**
   - Don't expose API keys in client-side code
   - Implement server-side API calls
   - Add rate limiting and authentication

3. **Monitor usage**
   - Set up billing alerts in OpenAI dashboard
   - Track API usage regularly
   - Implement usage caps

4. **Rotate keys regularly**
   - Create new keys periodically
   - Revoke old keys
   - Update all deployments

## Next Steps

1. Get your OpenAI API key
2. Add it to the application
3. Test the AI Assistant in the Chat section
4. Monitor usage and costs
5. Consider implementing backend proxy for production

## Support

For OpenAI API issues:
- [OpenAI Documentation](https://platform.openai.com/docs)
- [OpenAI Community](https://community.openai.com/)
- [API Status Page](https://status.openai.com/)

For Study Buddy integration issues:
- Check browser console for errors
- Review `/utils/openAI.ts` for configuration
- Test fallback responses without API key
