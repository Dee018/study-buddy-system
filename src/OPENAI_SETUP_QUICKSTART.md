# OpenAI API - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. **Copy the key** (you won't be able to see it again!)
   - Format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add to Project

Create a `.env` file in your project root:

```bash
# Create .env file
echo "VITE_OPENAI_API_KEY=your-api-key-here" > .env
```

Or create it manually:

```env
# .env
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Update .gitignore

Ensure `.env` is not committed:

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### Step 4: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 5: Verify

Open browser console (F12) and look for:

```
✅ OpenAI API key loaded from environment
```

**You're done!** 🎉

---

## 🔄 Alternative: Runtime Configuration

If you don't want to use `.env`, set it at runtime:

```javascript
// In browser console (F12)
// Paste this:
openAI.setApiKey('sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', true);

// Refresh page
window.location.reload();
```

---

## 🧪 Test the Connection

```javascript
// In browser console
await openAI.testConnection();
// Returns: true ✅ or false ❌
```

---

## ⚠️ Troubleshooting

### "API key not loaded"
- Restart dev server after creating `.env`
- Check file is named exactly `.env` (not `.env.txt`)
- Verify key starts with `sk-proj-`

### "Unauthorized" error
- Key might be invalid
- Check you copied the full key
- Key might have been revoked

### "Rate limit exceeded"
- Free tier: 3 requests/minute
- Wait 60 seconds or upgrade plan

---

## 💰 Cost Information

**GPT-4o-mini** (recommended):
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens
- ~1000 tokens = 750 words

**Average chat message**: ~500 tokens  
**Cost per message**: ~$0.0003 (less than a penny!)

**100 messages/day** ≈ $0.03/day = **$0.90/month**

---

## 🔐 Security Reminders

- ❌ Never commit `.env` to Git
- ❌ Never share your API key publicly
- ❌ Never put key in client-side code
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Monitor usage dashboard

---

## 📊 Usage Dashboard

Monitor your usage at:
[platform.openai.com/usage](https://platform.openai.com/usage)

Set billing limits:
[platform.openai.com/account/billing/limits](https://platform.openai.com/account/billing/limits)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env` file exists in project root
- [ ] `.env` contains `VITE_OPENAI_API_KEY=sk-proj-...`
- [ ] `.env` is in `.gitignore`
- [ ] Dev server restarted
- [ ] Console shows "✅ OpenAI API key loaded"
- [ ] Chat responses are AI-generated
- [ ] No warning messages in console

---

## 🆘 Need Help?

**Check status**:
```javascript
openAI.getConnectionStatus()
```

**Clear and reset**:
```javascript
openAI.clearApiKey()
localStorage.clear()
window.location.reload()
```

**Test manually**:
```javascript
await openAI.generateResponse("Hello", "test-user", "Beginner")
```

---

Happy coding! 🚀
