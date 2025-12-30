# ⚡ Quick Start Guide - Phase 3 Implementation

**Goal:** Get authentication working with Supabase in the next 2 hours.

---

## 🚀 Step-by-Step Implementation

### Step 1: Create Supabase Database (15 minutes)

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `/docs/SUPABASE_SCHEMA.sql`
5. Paste and click **Run**
6. Verify:
   - ✅ Tables created in **Table Editor**
   - ✅ No errors in output
   - ✅ RLS enabled on tables

---

### Step 2: Create Admin Account (10 minutes)

1. Go to **Authentication** → **Users**
2. Click **Add User** (manual)
3. Fill in:
   - **Email:** `useradministrator123@studybuddy.local`
   - **Password:** [Create a strong password - save it!]
   - **Auto Confirm User:** ✅ Yes
4. Click **Create User**
5. **Copy the User ID** (you'll need this!)
6. Go to **SQL Editor** → **New Query**
7. Run this SQL (replace `[USER_ID]` with actual ID):

```sql
INSERT INTO user_profiles (id, uuid, username, email, role)
VALUES (
  '[PASTE_USER_ID_HERE]',
  'YCW-158-KA-4678',
  'UserAdministrator123',
  'useradministrator123@studybuddy.local',
  'admin'
);

INSERT INTO user_progress (user_id, completed_modules, total_xp, level)
VALUES (
  '[PASTE_USER_ID_HERE]',
  ARRAY[]::TEXT[],
  0,
  1
);
```

8. Verify in **Table Editor** → `user_profiles` → Should see admin user

---

### Step 3: Update Welcome.tsx (60 minutes)

#### 3.1: Add Import Statements

At the top of `/components/Welcome.tsx`, add:

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { toast } from 'sonner@2.0.3';
```

#### 3.2: Add Hooks in Component

Inside `Welcome` component, add after existing state declarations:

```typescript
export function Welcome({ onComplete }: WelcomeProps) {
  // ... existing state ...
  
  // NEW: Add auth hooks
  const { signUp, signIn, verifyRecoveryUUID, resetPassword, loading: authLoading, error: authError } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // ... rest of component ...
}
```

#### 3.3: Update handleSignup Function

Replace the existing `handleSignup` function with:

```typescript
const handleSignup = async () => {
  try {
    const isUsernameValid = validateUsername(signupUsername);
    const passwordValidation = PasswordManager.validatePassword(signupPassword);

    // Validate inputs
    if (!isUsernameValid) {
      return;
    }

    if (!passwordValidation.isValid) {
      setSignupPasswordError(passwordValidation.errors[0]);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupPasswordError('Passwords do not match');
      return;
    }

    if (usernameAvailable === true) {
      // Generate UUID for the user
      const userCodeId = generateUserCode();
      
      try {
        // Sign up with Supabase
        await signUp(signupUsername, signupPassword, userCodeId);
        
        // Success! Show account info
        setNewUserCode(userCodeId);
        setNewUsername(signupUsername);
        setStep('new-account-info');
        
        showSuccess('Account created successfully! 🎉');
        
      } catch (error) {
        console.error('Signup error:', error);
        setSignupUsernameError(error.message || 'Account creation failed. Please try again.');
        showError('Failed to create account');
      }
    }
  } catch (error) {
    console.error('Error during signup:', error);
    setSignupUsernameError('An error occurred during account creation. Please try again.');
    showError('An unexpected error occurred');
  }
};
```

#### 3.4: Update handleLogin Function

Replace the existing `handleLogin` function with:

```typescript
const handleLogin = async () => {
  try {
    // Clear all errors at start
    setLoginError('');
    setLoginUsernameError('');
    setLoginPasswordError('');

    // Basic input validation
    if (!loginUsername || !loginPassword) {
      setLoginError('Please enter both username and password');
      return;
    }

    try {
      // Sign in with Supabase
      await signIn(loginUsername, loginPassword);
      
      showSuccess(`Welcome back, ${loginUsername}! 🎉`);
      
      // The useAuth context will handle setting the user
      // App.tsx will detect the user and call onComplete
      // For now, we need to call onComplete manually:
      
      // Note: This will be refactored in App.tsx update
      // For now, create a minimal user object
      onComplete({
        id: 'temp-id', // Will be replaced by real Supabase user ID
        username: loginUsername,
        level: 'Beginner',
        points: 0,
        isNewUser: false
      });
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Incorrect username or password. Please try again.');
      showError('Login failed');
    }
  } catch (error) {
    console.error('Error during login:', error);
    setLoginError('An error occurred during login. Please try again.');
    showError('An unexpected error occurred');
  }
};
```

#### 3.5: Update Password Recovery - Verify UUID

Replace the UUID verification logic with:

```typescript
const handleVerifyUUID = async () => {
  try {
    setRecoveryError('');
    
    if (!recoveryUUID || recoveryUUID.trim().length === 0) {
      setRecoveryError('Please enter your recovery UUID');
      return;
    }
    
    const result = await verifyRecoveryUUID(recoveryUUID.trim());
    
    if (result) {
      setRecoveredUsername(result.username);
      setUuidVerified(true);
      setVerifiedUUID(recoveryUUID.trim());
      setVerifiedUsername(result.username);
      setStep('password-recovery-reset');
      showSuccess(`Account found: ${result.username}`);
    } else {
      setRecoveryError('Invalid recovery UUID. Please check and try again.');
      showError('UUID not found');
    }
  } catch (error) {
    console.error('UUID verification error:', error);
    setRecoveryError('Failed to verify UUID. Please try again.');
    showError('Verification failed');
  }
};
```

#### 3.6: Update Password Recovery - Reset Password

Add this new function for password reset:

```typescript
const handleResetPassword = async () => {
  try {
    setRecoveryError('');
    
    if (!newPassword) {
      setRecoveryError('Please enter a new password');
      return;
    }
    
    // Validate password
    const passwordValidation = PasswordManager.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setRecoveryError(passwordValidation.errors[0]);
      return;
    }
    
    const success = await resetPassword(verifiedUUID, newPassword);
    
    if (success) {
      setRecoverySuccess(true);
      showSuccess('Password reset successfully! 🎉');
      
      // Clear sensitive data
      setNewPassword('');
      setVerifiedUUID('');
      setRecoveryUUID('');
      
      // Go to login after 2 seconds
      setTimeout(() => {
        setStep('login');
        setRecoverySuccess(false);
      }, 2000);
    }
  } catch (error) {
    console.error('Password reset error:', error);
    setRecoveryError(error.message || 'Failed to reset password. Please try again.');
    showError('Password reset failed');
  }
};
```

#### 3.7: Update Account Info Complete Button

In the `new-account-info` step, update the button click handler:

```typescript
<Button 
  className="w-full"
  onClick={() => {
    // User is already logged in from signup
    // Just need to call onComplete with user data
    onComplete({
      id: 'temp-id', // Will be replaced by real ID
      username: newUsername,
      level: 'Beginner',
      points: 0,
      isNewUser: true
    });
  }}
>
  Start Learning Journey
  <ArrowRight className="ml-2 w-4 h-4" />
</Button>
```

---

### Step 4: Update App.tsx (30 minutes)

#### 4.1: Wrap AppContent with Auth Check

Open `/App.tsx` and find the `AppContent` function. Update it to use `useAuth`:

```typescript
function AppContent() {
  // Add at the top of AppContent
  const { user, profile, loading: authLoading } = useAuth();
  
  // ... existing state declarations ...
  
  // Add early return for loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If no user, show Welcome
  if (!user && currentScreen !== 'welcome') {
    setCurrentScreen('welcome');
  }
  
  // ... rest of component logic ...
}
```

#### 4.2: Update handleWelcomeComplete

Replace the `handleWelcomeComplete` function:

```typescript
const handleWelcomeComplete = async (data: UserData) => {
  try {
    // User is already authenticated via AuthContext
    // Just update local state with profile data
    if (profile) {
      setUserData({
        id: profile.id,
        username: profile.username,
        level: 'Beginner', // Will be calculated from progress
        points: 0, // Will be loaded from database
        isNewUser: data.isNewUser
      });
      
      // Check if admin
      setIsAdmin(profile.role === 'admin');
      setCurrentScreen('learning');
    }
  } catch (error) {
    console.error('Error completing welcome:', error);
    toast.error('Failed to initialize account. Please try again.');
  }
};
```

---

### Step 5: Test Everything (15 minutes)

#### Test Sign Up:
1. Open app in browser
2. Click "Create New Account"
3. Enter username: `testuser1`
4. Enter password: `TestPass123!`
5. Confirm password
6. Click "Create Account"
7. Should see success message
8. Should show account info with UUID
9. Click "Start Learning"
10. Should redirect to Learning Hub

#### Test Sign In:
1. Refresh page (should show Welcome again)
2. Click "Access Existing Account"
3. Enter username: `testuser1`
4. Enter password: `TestPass123!`
5. Click "Sign In"
6. Should show success message
7. Should redirect to Learning Hub

#### Test Admin Login:
1. Refresh page
2. Click "Access Existing Account"
3. Enter username: `UserAdministrator123`
4. Enter password: [your admin password]
5. Should redirect to Admin Panel

#### Test Password Recovery:
1. Create a test account and save the UUID
2. Refresh page
3. Click "Forgot Password?"
4. Enter your UUID
5. Should show your username
6. Enter new password
7. Should show success
8. Try logging in with new password

---

## 🔍 Troubleshooting

### Error: "useAuth must be used within an AuthProvider"

**Solution:**
1. Make sure `App.tsx` exports the wrapped version:
```typescript
export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
```

2. Check `/AppProviders.tsx` has correct provider order:
```typescript
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider>
          <ProgressProvider>
            <CurriculumProvider>
              {children}
            </CurriculumProvider>
          </ProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
```

---

### Error: "Invalid login credentials"

**Possible causes:**
1. Wrong password
2. Username case mismatch
3. User doesn't exist in database

**Solution:**
1. Check Supabase → Authentication → Users
2. Verify user exists
3. Try creating new account
4. Check browser console for detailed error

---

### Error: Table "user_profiles" doesn't exist

**Solution:**
1. Go to Supabase → SQL Editor
2. Run the schema SQL again from `/docs/SUPABASE_SCHEMA.sql`
3. Refresh Table Editor to verify

---

### UUID Verification Not Working

**Solution:**
1. Check Supabase → Table Editor → `user_profiles`
2. Verify `uuid` column has value
3. Try copying UUID exactly from database
4. Check for extra spaces in input

---

### Session Not Persisting

**Solution:**
1. Check browser console for errors
2. Verify Supabase client is configured correctly in `/utils/supabase/client.ts`
3. Check that `getSession()` is being called in `AuthContext`
4. Try clearing browser cookies and localStorage

---

## ✅ Success Checklist

- [ ] Database tables created
- [ ] Admin account created and can log in
- [ ] Test user can sign up
- [ ] Test user can log in
- [ ] Password recovery works
- [ ] Session persists on refresh
- [ ] No console errors
- [ ] Toast notifications show properly
- [ ] Loading states display correctly
- [ ] Admin panel accessible to admin only

---

## 🎯 What's Next?

After completing Phase 3:

1. **Remove Old Code:**
   - Delete `/utils/sessionManager.ts`
   - Delete `/utils/passwordManager.ts` localStorage methods
   - Clean up commented code

2. **Add Features:**
   - Username availability check (real-time)
   - "Remember me" functionality
   - Account deletion
   - Profile editing

3. **Phase 4:**
   - Migrate progress system
   - Use `ProgressService` instead of localStorage
   - Real-time progress sync
   - Multi-device support

---

## 📚 References

- **Authentication Guide:** `/docs/AUTHENTICATION_GUIDE.md`
- **Phase 2 Summary:** `/PHASE_2_COMPLETION_SUMMARY.md`
- **Full Roadmap:** `/MIGRATION_ROADMAP.md`
- **Visual Guide:** `/PHASE_2_VISUAL_SUMMARY.md`
- **Database Schema:** `/docs/SUPABASE_SCHEMA.sql`

---

## 💡 Pro Tips

1. **Test in Incognito:** Prevents cached data from interfering
2. **Check Supabase Logs:** Real-time logs show all database queries
3. **Use TypeScript:** Let the types guide you - fix all type errors
4. **Console Debugging:** Add `console.log` liberally while testing
5. **One Change at a Time:** Don't change multiple things simultaneously
6. **Commit Often:** Small commits make it easy to rollback

---

## 🎉 You're Ready!

Everything you need to complete Phase 3 is here. Follow the steps, test thoroughly, and don't hesitate to reference the documentation.

**Let's ship it! 🚀**

---

*Last Updated: December 21, 2025*  
*Estimated Time: 2 hours*  
*Difficulty: Intermediate*
