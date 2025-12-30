/*
Simple admin endpoint to update Supabase Auth user email using service-role key.
Run this as a small secure service (e.g. Cloud Run, Vercel Serverless, or a protected VM).
Set env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

POST /update-auth-email
body: { userId: string, email: string }
*/

const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

app.post('/update-auth-email', async (req, res) => {
  try {
    const { userId, email, username } = req.body || {};
    if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

    // Require Authorization header with the user's access token and verify it
    const authHeader = (req.headers.authorization || '').toString();
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Bearer token' });
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');

    // Verify the access token corresponds to the same userId
    const verify = await supabaseAdmin.auth.getUser(accessToken);
    if (verify.error) {
      console.error('Token verification failed', verify.error);
      return res.status(401).json({ error: 'Invalid access token' });
    }
    const tokenUser = verify.data?.user;
    if (!tokenUser || tokenUser.id !== userId) {
      return res.status(403).json({ error: 'Forbidden: token does not belong to requested user' });
    }

    // Use admin API to update user by id
    const resp = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: email,
      user_metadata: { username: username }
    });

    if (resp.error) {
      console.error('admin.updateUserById error', resp.error);
      return res.status(500).json({ error: resp.error.message || 'Admin update failed' });
    }

    return res.json({ user: resp.user || null });
  } catch (err) {
    console.error('update-auth-email handler error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log('Admin update server listening on', port));
