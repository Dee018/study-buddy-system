# 🚀 Supabase Implementation Quick Start Guide

## 📋 Overview

This guide helps you replace all "DISABLED FOR SUPABASE MIGRATION" sections with actual Supabase implementations.

---

## 🔧 Setup (Do First)

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Client File
```typescript
// /utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for database schema (will be auto-generated)
export type Database = {
  public: {
    Tables: {
      user_progress: { /* ... */ };
      users: { /* ... */ };
      // ... other tables
    };
  };
};
```

### 3. Add Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Database Schema

### Core Tables SQL

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  user_code TEXT UNIQUE NOT NULL, -- YCW-XXX-XX-XXXX format
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  avatar_index INTEGER DEFAULT 0,
  bio TEXT,
  display_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- PROGRESS & LEARNING
-- ============================================

-- User progress (main progress tracking)
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_module TEXT,
  completed_modules TEXT[] DEFAULT '{}',
  level TEXT DEFAULT 'Beginner',
  total_xp INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_study_date DATE,
  module_progress JSONB DEFAULT '{}',
  daily_activity JSONB DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);

-- XP transactions (history of XP earned)
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'lesson', 'exercise', 'project', 'assessment'
  source_id TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);

-- ============================================
-- CERTIFICATES
-- ============================================

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL, -- 'module', 'track', 'mastery', 'excellence'
  module_id TEXT,
  file_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);

-- ============================================
-- SESSIONS
-- ============================================

CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- ============================================
-- CONTENT MANAGEMENT
-- ============================================

CREATE TABLE public.content_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  edit_type TEXT NOT NULL, -- 'title', 'description', 'lesson', etc.
  edit_data JSONB NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN
-- ============================================

CREATE TABLE public.deleted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  deletion_reason TEXT,
  deleted_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  data_snapshot JSONB -- Store user data for recovery
);

CREATE TABLE public.issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add similar policies for other tables...

-- Admin policies (assuming admin_role in user metadata)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
  );
```

---

## 🔄 File-by-File Replacement Guide

### 1. `/components/Welcome.tsx` - Authentication

**Find:** Lines 77-99 (theme + user codes)

**Replace with:**
```typescript
import { supabase } from '../utils/supabaseClient';

// Initialize theme from Supabase
useEffect(() => {
  const loadUserPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .single();
      
      const prefersDark = prefs?.theme === 'dark' || (!prefs && true);
      setIsDarkMode(prefersDark);
      
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  loadUserPreferences();
}, []);
```

**Sign Up (Lines 375-382):**
```typescript
// Sign up with Supabase Auth
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: `${signupUsername}@studybuddy.app`, // or use real email
  password: signupPassword,
  options: {
    data: {
      username: signupUsername,
      user_code: userCodeId
    }
  }
});

if (authError) {
  setSignupUsernameError(authError.message);
  return;
}

// Create user profile
const { error: profileError } = await supabase
  .from('users')
  .insert({
    id: authData.user!.id,
    username: signupUsername,
    user_code: userCodeId
  });

// Initialize progress
const { error: progressError } = await supabase
  .from('user_progress')
  .insert({
    user_id: authData.user!.id,
    current_module: 'module_1',
    level: 'Beginner'
  });
```

**Login:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: `${loginUsername}@studybuddy.app`,
  password: loginPassword
});

if (error) {
  setLoginError('Invalid username or password');
  return;
}

// Load user data
const { data: userData } = await supabase
  .from('users')
  .select('username, user_code')
  .eq('id', data.user.id)
  .single();
```

---

### 2. `/utils/progressManager.ts` - User Progress

**loadProgress (Line 113):**
```typescript
static async loadProgress(userId: string): Promise<EnhancedUserProgress> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return this.getDefaultProgress();
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      // Initialize new progress
      const defaultProgress = this.getDefaultProgress();
      await this.saveProgress(userId, defaultProgress);
      return defaultProgress;
    }
    
    return {
      currentModule: data.current_module,
      completedModules: data.completed_modules || [],
      level: data.level,
      totalXP: data.total_xp,
      streakCount: data.streak_count,
      lastStudyDate: data.last_study_date,
      moduleProgress: data.module_progress || {},
      dailyActivity: data.daily_activity || {},
      achievements: data.achievements || []
    };
  } catch (error) {
    console.error('Error loading progress:', error);
    return this.getDefaultProgress();
  }
}
```

**saveProgress (Line 213):**
```typescript
static async saveProgress(
  userId: string, 
  progress: EnhancedUserProgress
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        current_module: progress.currentModule,
        completed_modules: progress.completedModules,
        level: progress.level,
        total_xp: progress.totalXP,
        streak_count: progress.streakCount,
        last_study_date: progress.lastStudyDate,
        module_progress: progress.moduleProgress,
        daily_activity: progress.dailyActivity,
        achievements: progress.achievements,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
    
    // Dispatch event for real-time sync
    window.dispatchEvent(new CustomEvent('progressUpdated', {
      detail: { userId, progress }
    }));
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
}
```

---

### 3. `/utils/certificateService.ts` - Certificates

**generateCertificate (Line 27):**
```typescript
static async generateCertificate(
  userId: string,
  type: CertificateType,
  moduleId?: string
): Promise<Certificate | null> {
  try {
    // Generate PDF (keep existing logic)
    const pdfBlob = await this.createPDFBlob(/* params */);
    
    // Upload to Supabase Storage
    const fileName = `cert_${userId}_${type}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(`${userId}/${fileName}`, pdfBlob);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(uploadData.path);
    
    // Save metadata to database
    const certificate: Certificate = {
      id: crypto.randomUUID(),
      userId,
      type,
      moduleId,
      issuedDate: new Date().toISOString(),
      certificateUrl: publicUrl
    };
    
    const { error: dbError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        certificate_type: type,
        module_id: moduleId,
        file_url: publicUrl
      });
    
    if (dbError) throw dbError;
    
    return certificate;
  } catch (error) {
    console.error('Error generating certificate:', error);
    return null;
  }
}
```

**getCertificates (Line 45):**
```typescript
static async getCertificates(userId: string): Promise<Certificate[]> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(cert => ({
      id: cert.id,
      userId: cert.user_id,
      type: cert.certificate_type,
      moduleId: cert.module_id,
      issuedDate: cert.issued_at,
      certificateUrl: cert.file_url
    }));
  } catch (error) {
    console.error('Error loading certificates:', error);
    return [];
  }
}
```

---

### 4. Real-Time Sync Example

**Add to any component that needs live updates:**
```typescript
import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

function MyComponent({ userId }: { userId: string }) {
  useEffect(() => {
    // Subscribe to progress changes
    const subscription = supabase
      .channel(`progress_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Progress updated:', payload.new);
          // Update local state
          setProgress(payload.new);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
  
  return <div>...</div>;
}
```

---

## 🎯 Implementation Checklist

### Phase 3: Setup
- [ ] Create Supabase project
- [ ] Install `@supabase/supabase-js`
- [ ] Create `/utils/supabaseClient.ts`
- [ ] Add environment variables
- [ ] Run database schema SQL
- [ ] Set up RLS policies
- [ ] Create storage buckets

### Phase 4.1: Authentication (Welcome.tsx)
- [ ] Replace theme loading (lines 77-111)
- [ ] Replace sign up (lines 375-396)
- [ ] Replace login (lines 133-158)
- [ ] Replace username check (isUsernameTaken)
- [ ] Test signup flow
- [ ] Test login flow

### Phase 4.2: Progress (progressManager.ts)
- [ ] Replace loadProgress
- [ ] Replace saveProgress
- [ ] Replace getAllProgress
- [ ] Replace deleteUserProgress
- [ ] Test progress save/load
- [ ] Test multi-device sync

### Phase 4.3: Certificates (certificateService.ts)
- [ ] Set up Storage bucket
- [ ] Replace generateCertificate
- [ ] Replace getCertificates
- [ ] Test PDF upload
- [ ] Test certificate retrieval

### Phase 4.4: Admin (AdminPanel.tsx, adminDataService.ts)
- [ ] Replace getAllUsers
- [ ] Replace getModulePerformance
- [ ] Replace getUserActivity
- [ ] Test admin queries
- [ ] Test RLS for admin

### Phase 4.5: Additional Features
- [ ] Sessions (sessionManager.ts)
- [ ] Analytics (analyticsEngine.ts)
- [ ] Profiles (Profile.tsx, ManageAccount.tsx)
- [ ] Content (contentManager.ts)
- [ ] Error logging (ErrorBoundary.tsx)

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)

---

**Next Step:** Set up Supabase project and run database schema
