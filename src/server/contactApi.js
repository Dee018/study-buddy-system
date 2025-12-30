const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Attempt to load a local .env for convenience during development (optional)
try {
  // eslint-disable-next-line global-require
  require('dotenv').config();
  console.log('Loaded .env (if present)');
} catch (e) {
  // dotenv not installed or failed; continue - env may be provided by the shell
}

// Read configuration from environment (allow VITE_* fallbacks for local dev)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const PORT = process.env.PORT || 4001;

// Fail fast: if critical supabase config is missing, exit with a helpful error.
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('FATAL: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set.');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY (service role) in the environment.');
  console.error('Example (PowerShell):');
  console.error('$env:SUPABASE_URL="https://your-project.supabase.co"; $env:SUPABASE_SERVICE_KEY="<service-role-key>"; npm run start:api');
  // Exit so the server does not start and return intermittent 500s.
  process.exit(1);
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    // NOTE: `SUPABASE_SERVICE_KEY` should be a Supabase service-role key
    // (admin/service role) so the server can perform inserts/updates on behalf
    // of the application. Keep this key secret and do not expose it to clients.
  } catch (e) {
    console.warn('Failed to create Supabase client:', e && (e.message || e));
    supabase = null;
  }
} else {
  supabase = null;
}

// Startup environment debug (safe: do not print secret values)
console.log('Contact API startup: SUPABASE_URL set?', !!SUPABASE_URL, 'SUPABASE_SERVICE_KEY set?', !!SUPABASE_SERVICE_KEY);

// Optional debug flag to enable extra diagnostic output for recovery handler
const DEBUG_RECOVERY = !!process.env.DEBUG_RECOVERY;

// Email notifications are disabled in this API. Messages are persisted to
// `support_messages` and admins should review that table. No external email
// provider (e.g., SendGrid) will be called by this service.
console.log('Contact API startup: email notifications are disabled; messages will be persisted only.');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple healthcheck
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// POST /api/contact
// Expects JSON: { name, email, subject, message }
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    try {
      console.log('Contact API received POST from', req.ip, 'body:', JSON.stringify({ name, email, subject, message }));
    } catch (e) {
      console.log('Contact API received POST (could not stringify body)');
    }
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert into Supabase table `support_messages` (create this table in your DB)
    // Columns: id (uuid), name text, email text, subject text, message text, handled boolean default false, created_at timestamptz default now()
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Supabase keys missing; cannot persist message');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const { data, error } = await supabase
      .from('support_messages')
      .insert([{ name, email, subject, message, handled: false }])
      .select('id, created_at');

    // Normalize insert result (supabase may return array or object)
    let insertedId = null;
    try {
      console.log('Supabase insert result raw:', JSON.stringify({ data, error }));
      if (data) {
        if (Array.isArray(data)) {
          insertedId = data[0] && data[0].id ? data[0].id : null;
        } else if (data.id) {
          insertedId = data.id;
        }
      }
    } catch (e) {
      console.log('Supabase insert result (non-serializable)');
    }

    // Capture created_at when available to aid lookups
    let insertedCreatedAt = null;
    try {
      if (data) {
        if (Array.isArray(data) && data[0] && data[0].created_at) insertedCreatedAt = data[0].created_at;
        else if (data.created_at) insertedCreatedAt = data.created_at;
      }
    } catch (e) {
      // ignore
    }

    // Primary record id (may be null); we'll attempt fallbacks below
    let recordId = insertedId || null;
    if (!recordId) {
      try {
        const lookup = await supabase
          .from('support_messages')
          .select('id, created_at')
          .eq('email', email)
          .eq('subject', subject)
          .eq('message', message)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lookup && lookup.data && lookup.data.id) {
          recordId = lookup.data.id;
          console.log('Fallback lookup found record id', recordId);
        } else {
          console.log('Fallback lookup did not find record for email/subject');
        }
      } catch (luErr) {
        console.error('Fallback lookup failed', luErr && (luErr.message || luErr));
      }
    }

    if (error) {
      try {
        console.error('Supabase insert error:', error && (error.message || error));
        try { console.error('Supabase insert error details:', JSON.stringify(error)); } catch (e) { /* ignore */ }
      } catch (e) {
        console.error('Supabase insert error (failed to stringify)', e && e.message);
      }
      return res.status(500).json({ error: 'Failed to store message' });
    }

    // Email notifications are intentionally disabled. Record the disabled state
    // so calling code can inspect the result if needed.
    let notificationResult = { ok: false, reason: 'notifications_disabled' };
    let notificationSent = false;

    // If we still don't have a recordId, try one more time to locate the inserted row
    if (!recordId) {
      try {
        if (insertedCreatedAt) {
          const byTime = await supabase
            .from('support_messages')
            .select('id')
            .eq('created_at', insertedCreatedAt)
            .maybeSingle();
          if (byTime && byTime.data && byTime.data.id) {
            recordId = byTime.data.id;
            console.log('Post-send lookup by created_at found id', recordId);
          }
        }

        if (!recordId) {
          const lookupAfter = await supabase
            .from('support_messages')
            .select('id, created_at')
            .eq('email', email)
            .eq('subject', subject)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (lookupAfter && lookupAfter.data && lookupAfter.data.id) {
            recordId = lookupAfter.data.id;
            console.log('Post-send fallback lookup found record id', recordId);
          }
        }
      } catch (postLuErr) {
        console.error('Post-send fallback lookup failed', postLuErr && (postLuErr.message || postLuErr));
      }
    }

    // Update the record with notification status and response (best-effort)
    try {
      // Sanitize notificationResult to a JSON-friendly shape before persisting
      const notificationPayload = {
        ok: !!(notificationResult && notificationResult.ok),
        statusCode: notificationResult && notificationResult.statusCode ? notificationResult.statusCode : null,
        error: notificationResult && notificationResult.error ? String(notificationResult.error) : null,
        responseBody: notificationResult && notificationResult.responseBody ? notificationResult.responseBody : null
      };

      const upd = await supabase
        .from('support_messages')
        .update({ notification_sent: notificationSent, notification_response: notificationPayload })
        .eq('id', recordId)
        .select('id, notification_sent');

      if (upd && upd.error) {
        console.error('Failed to update notification columns (supabase error):', upd.error);
      } else {
        console.log('Updated support_messages notification fields for id', recordId, 'payload:', notificationPayload);
      }
    } catch (uErr) {
      console.error('Failed to update notification columns (exception)', uErr && (uErr.message || uErr));
    }

    console.log('Contact API response for id', recordId, 'notificationSent:', notificationSent);
    // Temporary debug payload to help diagnose why sends aren't persisted from the frontend.
    // Remove or restrict this in production.
    return res.json({
      ok: true,
      id: recordId,
      notificationSent,
      notificationResult,
      debug: {
        insertedData: data || null,
        insertedId: insertedId || null,
        insertedCreatedAt: insertedCreatedAt || null,
        recordIdFound: recordId || null
      }
    });
  } catch (err) {
    console.error('Contact API error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Admin password reset endpoint
// POST /api/admin/reset-password
// Body: { identifier: string, newPassword: string }
// Protect with header 'x-admin-key' equal to process.env.ADMIN_API_KEY
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const adminKey = process.env.ADMIN_API_KEY || null;
    const provided = req.headers['x-admin-key'] || req.headers['X-Admin-Key'] || null;
    if (!adminKey || !provided || provided !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { identifier, newPassword } = req.body || {};
    if (!identifier || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    if (!supabase) return res.status(500).json({ error: 'Server missing Supabase configuration' });

    // UUID-only resolution (do not accept username or email)
    try {
      const { data: profile } = await supabase.from('user_profiles').select('id, uuid, username, email').eq('uuid', identifier).maybeSingle();
      if (!profile) return res.status(404).json({ error: 'Account not found' });

      // Use admin API to update user's password using service role
      try {
        const resp = await supabase.auth.admin.updateUserById(profile.id, { password: newPassword });
        if (resp.error) {
          console.error('admin.reset-password updateUserById error', resp.error);
          return res.status(500).json({ error: resp.error.message || 'Admin update failed' });
        }
        return res.json({ ok: true, user: resp.user || null });
      } catch (err) {
        console.error('admin.reset-password exception', err && (err.message || err));
        return res.status(500).json({ error: err && (err.message || String(err)) });
      }
    } catch (err) {
      console.error('admin.reset-password lookup error', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  } catch (err) {
    console.error('admin.reset-password handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Public recovery endpoint used by the client during password recovery.
// Accepts { uuid, newPassword } and uses the service role to update the auth user's password.
// Note: this endpoint intentionally performs a UUID-only lookup.
app.post('/api/recovery/reset', async (req, res) => {
  try {
    const { uuid, username, newPassword } = req.body || {};
    if (!uuid || !username || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    if (!supabase) return res.status(500).json({ error: 'Server missing Supabase configuration' });

    // Resolve uuid -> profile
    const { data: profile, error: profileError } = await supabase.from('user_profiles').select('id, email, uuid, username').eq('uuid', uuid).maybeSingle();
    if (profileError) {
      console.error('recovery.reset profile lookup error', profileError);
      return res.status(500).json({ error: 'Profile lookup failed' });
    }
    if (!profile) return res.status(404).json({ error: 'Account not found' });

    // Masked uuid for logs
    const masked = typeof uuid === 'string' && uuid.length > 8 ? `${uuid.slice(0, 6)}...${uuid.slice(-4)}` : uuid;
    console.log('recovery.reset request for uuid (masked):', masked, 'resolved profile.id:', profile.id, 'profile.username:', profile.username);

    // Verify supplied username matches profile.username (case-insensitive)
    if (typeof username !== 'string' || username.toLowerCase() !== (profile.username || '').toLowerCase()) {
      console.warn('recovery.reset username mismatch for uuid', masked, 'expected:', username, 'found:', profile.username);
      return res.status(404).json({ error: 'Account not found' });
    }

    // Extra verification: check that profile.id corresponds to an auth user
    try {
      const userCheck = await supabase.auth.admin.getUserById(profile.id);
      if (userCheck && userCheck.error) {
        console.error('recovery.reset admin.getUserById error', userCheck.error);
        if (DEBUG_RECOVERY) return res.status(500).json({ error: 'Auth lookup error', detail: userCheck.error });
        return res.status(500).json({ error: 'Auth lookup failed' });
      }
      if (!userCheck || !userCheck.data || !userCheck.data.user) {
        console.error('recovery.reset auth user not found for profile.id', profile.id);
        return res.status(500).json({ error: 'Auth user not found for profile id' });
      }
      if (DEBUG_RECOVERY) console.log('recovery.reset auth user found (id):', userCheck.data.user.id);
    } catch (chkErr) {
      console.error('recovery.reset auth lookup exception', chkErr && (chkErr.message || chkErr));
      return res.status(500).json({ error: 'Auth lookup exception' });
    }

    // Use admin API (service role) to update password
    try {
      const resp = await supabase.auth.admin.updateUserById(profile.id, { password: newPassword });
      if (resp.error) {
        console.error('recovery.reset updateUserById error', resp.error);
        if (DEBUG_RECOVERY) return res.status(500).json({ error: 'Admin update failed', detail: resp.error });
        return res.status(500).json({ error: resp.error.message || 'Admin update failed' });
      }
      console.log('recovery.reset password updated for auth id', profile.id);
      return res.json({ ok: true });
    } catch (err) {
      console.error('recovery.reset exception', err && (err.message || err));
      return res.status(500).json({ error: err && (err.message || String(err)) });
    }
  } catch (err) {
    console.error('recovery.reset handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// New: issue a short-lived recovery token after verifying username+uuid
// POST /api/recovery/verify
// Body: { username, uuid }
// Returns: { ok: true, token }
app.post('/api/recovery/verify', async (req, res) => {
  try {
    const { username, uuid } = req.body || {};
    if (!username || !uuid) return res.status(400).json({ error: 'Missing fields' });

    if (!supabase) return res.status(500).json({ error: 'Server missing Supabase configuration' });

    // Lookup profile by uuid
    const { data: profile, error: profileError } = await supabase.from('user_profiles').select('id, username, uuid').eq('uuid', uuid).maybeSingle();
    if (profileError) {
      console.error('recovery.verify profile lookup error', profileError);
      return res.status(500).json({ error: 'Profile lookup failed' });
    }
    if (!profile) return res.status(404).json({ error: 'Account not found' });

    if ((profile.username || '').toLowerCase() !== String(username).toLowerCase()) {
      console.warn('recovery.verify username mismatch for uuid', uuid, 'expected:', username, 'found:', profile.username);
      return res.status(404).json({ error: 'Account not found' });
    }

    // Create a short-lived token and persist it to DB (table: recovery_tokens)
    // Schema expected: id (uuid), user_id (uuid), token (text), expires_at timestamptz, used boolean default false, created_at timestamptz default now()
    const crypto = require('crypto');
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    try {
      const { data: insertData, error: insertError } = await supabase.from('recovery_tokens').insert([{ user_id: profile.id, token, expires_at: expiresAt, used: false }]).select('id').maybeSingle();
      if (insertError) {
        console.warn('recovery.verify could not persist token:', insertError);
        // Fall back: still return token but warn in logs (DB table may be missing)
      }
    } catch (e) {
      console.warn('recovery.verify persistence exception (non-fatal)', e && (e.message || e));
    }

    // Return token to client (short-lived)
    return res.json({ ok: true, token });
  } catch (err) {
    console.error('recovery.verify handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// New: Exchange valid username+uuid for a short-lived Supabase session token
// POST /api/recovery/login
// Body: { username, uuid }
// Response: { ok: true, access_token, expires_in }
app.post('/api/recovery/login', async (req, res) => {
  try {
    const { username, uuid } = req.body || {};
    if (!username || !uuid) return res.status(400).json({ error: 'Missing fields' });

    if (!supabase) return res.status(500).json({ error: 'Server missing Supabase configuration' });

    // Lookup profile by uuid
    const { data: profile, error: profileError } = await supabase.from('user_profiles').select('id, username, uuid, email').eq('uuid', uuid).maybeSingle();
    if (profileError) {
      console.error('recovery.login profile lookup error', profileError);
      return res.status(500).json({ error: 'Profile lookup failed' });
    }
    if (!profile) return res.status(404).json({ error: 'Account not found' });

    if ((profile.username || '').toLowerCase() !== String(username).toLowerCase()) {
      console.warn('recovery.login username mismatch for uuid', uuid, 'expected:', username, 'found:', profile.username);
      return res.status(404).json({ error: 'Account not found' });
    }

    // Require JWT secret to mint a Supabase-compatible session token
    const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_KEY;
    if (!jwtSecret) {
      console.error('recovery.login missing SUPABASE_JWT_SECRET or SUPABASE_SERVICE_KEY');
      return res.status(500).json({ error: 'Server not configured to issue sessions' });
    }

    // Create a short-lived JWT for the user. This token tries to follow Supabase's
    // session format by including the user's id as `sub` and `aud` as 'authenticated'.
    // NOTE: This requires that the project accepts JWTs signed with this secret.
    try {
      const jwt = require('jsonwebtoken');
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 60 * 5; // 5 minutes
      const payload = {
        sub: profile.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: profile.email || null,
        exp: now + expiresIn,
        iat: now
      };

      const accessToken = jwt.sign(payload, jwtSecret, { algorithm: 'HS256' });

      // Return token to client. Client will call supabase.auth.setSession({ access_token })
      return res.json({ ok: true, access_token: accessToken, expires_in: expiresIn });
    } catch (e) {
      console.error('recovery.login token generation failed', e && (e.message || e));
      return res.status(500).json({ error: 'Token generation failed' });
    }
  } catch (err) {
    console.error('recovery.login handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// New: change password using a recovery token issued by /api/recovery/verify
// POST /api/recovery/change
// Body: { token, newPassword }
app.post('/api/recovery/change', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    if (!supabase) return res.status(500).json({ error: 'Server missing Supabase configuration' });

    // Lookup token in DB (if table exists) and validate expiry/used
    let tokenRow = null;
    try {
      const { data: tr, error: trErr } = await supabase.from('recovery_tokens').select('id, user_id, token, expires_at, used').eq('token', token).maybeSingle();
      if (trErr) {
        console.warn('recovery.change token lookup error', trErr);
      } else {
        tokenRow = tr;
      }
    } catch (e) {
      console.warn('recovery.change token lookup exception (continuing without DB check)', e && (e.message || e));
    }

    // If DB provided a token row, validate it
    if (tokenRow) {
      if (tokenRow.used) return res.status(400).json({ error: 'Token already used' });
      if (new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });
    }

    // Determine user id: prefer tokenRow.user_id, otherwise reject (we require token persistence for security)
    if (!tokenRow || !tokenRow.user_id) {
      console.error('recovery.change no token row or missing user_id; token persistence is required for this flow');
      return res.status(500).json({ error: 'Recovery token verification failed' });
    }

    const userId = tokenRow.user_id;

    // Use admin API to update user's password
    try {
      const resp = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
      if (resp.error) {
        console.error('recovery.change updateUserById error', resp.error);
        return res.status(500).json({ error: resp.error.message || 'Admin update failed' });
      }

      // Mark token as used (best-effort)
      try {
        await supabase.from('recovery_tokens').update({ used: true }).eq('token', token);
      } catch (e) {
        console.warn('recovery.change failed to mark token used', e && (e.message || e));
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error('recovery.change exception', err && (err.message || err));
      return res.status(500).json({ error: 'Admin update failed' });
    }
  } catch (err) {
    console.error('recovery.change handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact API listening on http://localhost:${PORT}`);
});
