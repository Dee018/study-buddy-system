// DEV-ONLY: Lightweight local mock for the admin-delete-user Edge Function
// This mock is intended for local development and testing only. It does NOT
// perform any real deletes on Supabase. For production use, deploy the
// `supabase/functions/admin-delete-user` Edge Function and set
// `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_SECRET` in your Supabase project.
//
// Usage: node supabase/functions/local-admin-delete-server.js
// Listens on port 54321 and responds to POST /functions/v1/admin-delete-user

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // for test request at the bottom
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 54321;
const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.VITE_ADMIN_SECRET || '';

app.post('/functions/v1/admin-delete-user', (req, res) => {
  const headerSecret = req.headers['x-admin-secret'] || req.headers['x-admin_secret'];
  if (ADMIN_SECRET && String(headerSecret) !== ADMIN_SECRET) {
    console.warn('[local-admin-delete] invalid admin secret header');
    return res.status(403).json({ error: 'forbidden' });
  }

  const body = req.body || {};
  console.log('[local-admin-delete] received request body:', body);

  // Simulate archive payload
  const archiveRecord = {
    id: uuidv4(),
    user_id: body.userId || uuidv4(),
    uuid: body.userId || uuidv4(),
    username: body.username || 'mockuser',
    email: body.email || 'mock@example.com',
    reason: body.reason || 'manual-test',
    deleted_by: body.deletedBy || uuidv4(),
    deleted_at: new Date().toISOString(),
  };

  console.log('[local-admin-delete] simulated archive record:', archiveRecord);

  // Simulate processing delay
  setTimeout(() => {
    return res.json({
      ok: true,
      message: 'mock delete performed',
      archived: archiveRecord,
      deleted_tables: {
        user_progress: { ok: true, rows: 1 },
        user_passwords: { ok: true, rows: 1 },
        user_accounts: { ok: true, rows: 1 },
        user_profiles: { ok: true, rows: 1 },
      },
      auth_deleted: { ok: true },
    });
  }, 300);
});

app.get('/', (req, res) => res.send('local-admin-delete mock running'));

app.listen(PORT, async () => {
  console.log(`[local-admin-delete] mock server listening on http://localhost:${PORT}`);

  // Optional: run a built-in test request
  if (process.env.RUN_TEST === '1') {
    try {
      const testPayload = {
        userId: uuidv4(),
        username: 'testuser1',
        email: 'testuser1@example.com',
        reason: 'manual-test',
        deletedBy: uuidv4(),
      };
      const response = await fetch(`http://localhost:${PORT}/functions/v1/admin-delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify(testPayload),
      });
      const data = await response.json();
      console.log('[local-admin-delete] built-in test response:', data);
    } catch (e) {
      console.error('[local-admin-delete] test request failed:', e);
    }
  }
});
