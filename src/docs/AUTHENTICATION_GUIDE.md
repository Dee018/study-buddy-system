# Authentication System Guide

## Quick Start

### Using Authentication in Components

```typescript
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

function MyComponent() {
  const { 
    user, 
    profile, 
    signIn, 
    signUp, 
    signOut, 
    loading, 
    error 
  } = useAuth();

  // Component logic here
}
```

---

## Common Operations

### 1. User Registration

```typescript
const handleSignUp = async () => {
  try {
    const username = 'john_doe';
    const password = 'SecurePass123!';
    const uuid = generateUserCode(); // Generate unique UUID

    await signUp(username, password, uuid);
    
    toast.success('Account created successfully!');
    // User is automatically signed in after signup
    
  } catch (error) {
    toast.error(error.message || 'Sign up failed');
  }
};
```

### 2. User Login

```typescript
const handleLogin = async () => {
  try {
    const username = 'john_doe';
    const password = 'SecurePass123!';

    await signIn(username, password);
    
    toast.success('Welcome back!');
    
  } catch (error) {
    toast.error('Invalid username or password');
  }
};
```

### 3. User Logout

```typescript
const handleLogout = async () => {
  try {
    await signOut();
    toast.success('Logged out successfully');
    // Redirect to welcome screen
    
  } catch (error) {
    toast.error('Logout failed');
  }
};
```

### 4. Password Recovery - Step 1: Verify UUID

```typescript
const handleVerifyUUID = async () => {
  try {
    const uuid = 'ABC-123-XYZ-789'; // User provides this
    
    const result = await verifyRecoveryUUID(uuid);
    
    if (result) {
      console.log('Account found:', result.username);
      setVerifiedUser(result);
      setStep('reset-password');
    } else {
      toast.error('Invalid recovery UUID');
    }
    
  } catch (error) {
    toast.error('Verification failed');
  }
};
```

### 5. Password Recovery - Step 2: Reset Password

```typescript
const handleResetPassword = async () => {
  try {
    const uuid = verifiedUser.uuid;
    const newPassword = 'NewSecurePass456!';
    
    const success = await resetPassword(uuid, newPassword);
    
    if (success) {
      toast.success('Password reset successfully!');
      setStep('login');
    }
    
  } catch (error) {
    toast.error('Password reset failed');
  }
};
```

---

## Accessing User Data

### Current User Information

```typescript
const { user, profile } = useAuth();

// Auth user (from Supabase Auth)
console.log(user?.id);          // Supabase user ID
console.log(user?.email);       // username@studybuddy.local (internal)

// User profile (from database)
console.log(profile?.username); // Display username
console.log(profile?.uuid);     // Recovery UUID
console.log(profile?.role);     // 'learner' or 'admin'
console.log(profile?.created_at);
console.log(profile?.last_login);
```

### Checking Authentication Status

```typescript
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  return <LoginPrompt />;
}

return <AuthenticatedContent />;
```

### Role-Based Access

```typescript
const { profile } = useAuth();

const isAdmin = profile?.role === 'admin';
const isLearner = profile?.role === 'learner';

if (isAdmin) {
  // Show admin features
}
```

---

## Error Handling

### Using Error State

```typescript
const { error, clearError } = useAuth();

useEffect(() => {
  if (error) {
    toast.error(error);
    clearError(); // Clear after showing
  }
}, [error, clearError]);
```

### Try-Catch Pattern

```typescript
const handleAction = async () => {
  try {
    await signIn(username, password);
  } catch (error) {
    if (error.message.includes('Invalid login')) {
      toast.error('Wrong username or password');
    } else if (error.message.includes('network')) {
      toast.error('Connection failed. Please try again');
    } else {
      toast.error('An error occurred');
    }
  }
};
```

---

## Loading States

### During Authentication Operations

```typescript
const { loading } = useAuth();

return (
  <Button 
    onClick={handleLogin} 
    disabled={loading}
  >
    {loading ? 'Signing in...' : 'Sign In'}
  </Button>
);
```

### Global Loading Indicator

```typescript
const { loading } = useAuth();

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">Loading...</div>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
❌ BAD:
await signIn(username, password);

✅ GOOD:
try {
  await signIn(username, password);
} catch (error) {
  console.error('Login error:', error);
  toast.error(error.message);
}
```

### 2. Provide User Feedback

```typescript
✅ GOOD:
const handleSignUp = async () => {
  toast.loading('Creating account...');
  
  try {
    await signUp(username, password, uuid);
    toast.success('Account created!');
  } catch (error) {
    toast.error('Sign up failed');
  }
};
```

### 3. Validate Before Submitting

```typescript
✅ GOOD:
const handleLogin = async () => {
  if (!username || !password) {
    toast.error('Please fill in all fields');
    return;
  }
  
  if (password.length < 8) {
    toast.error('Password must be at least 8 characters');
    return;
  }
  
  await signIn(username, password);
};
```

### 4. Clear Sensitive Data

```typescript
✅ GOOD:
const handleLogout = async () => {
  await signOut();
  
  // Clear local state
  setUsername('');
  setPassword('');
  
  // Redirect
  navigate('/welcome');
};
```

---

## Security Considerations

### Password Requirements

```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

const validatePassword = (password: string) => {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return 'Password too short';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Must include uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Must include lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Must include number';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Must include special character';
  }
  return null; // Valid
};
```

### Username Requirements

```typescript
const USERNAME_REQUIREMENTS = {
  minLength: 3,
  maxLength: 20,
  allowedChars: /^[a-zA-Z0-9_-]+$/,
};

const validateUsername = (username: string) => {
  if (username.length < USERNAME_REQUIREMENTS.minLength) {
    return 'Username too short';
  }
  if (username.length > USERNAME_REQUIREMENTS.maxLength) {
    return 'Username too long';
  }
  if (!USERNAME_REQUIREMENTS.allowedChars.test(username)) {
    return 'Username contains invalid characters';
  }
  return null; // Valid
};
```

### UUID Security

```typescript
// DON'T expose UUID publicly
❌ BAD:
<div>Your recovery UUID: {profile.uuid}</div>

// DO show only when needed
✅ GOOD:
<Button onClick={() => setShowUUID(true)}>
  Show Recovery UUID
</Button>

{showUUID && (
  <div className="p-4 bg-yellow-100">
    <p className="text-sm">⚠️ Keep this secret and secure!</p>
    <code className="block mt-2 p-2 bg-white">
      {profile.uuid}
    </code>
    <Button onClick={copyToClipboard}>Copy UUID</Button>
  </div>
)}
```

---

## Advanced Usage

### Session Refresh

```typescript
const { refreshUser } = useAuth();

// Refresh user data after profile update
const handleProfileUpdate = async () => {
  await updateUserProfile(userId, newData);
  await refreshUser(); // Reload profile from database
};
```

### Conditional Rendering

```typescript
const { user, profile } = useAuth();

return (
  <>
    {!user && <WelcomeScreen />}
    {user && profile?.role === 'admin' && <AdminDashboard />}
    {user && profile?.role === 'learner' && <LearningHub />}
  </>
);
```

### Protected Routes

```typescript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/welcome" />;
  
  return children;
};

// Usage
<ProtectedRoute>
  <LearningHub />
</ProtectedRoute>
```

---

## Troubleshooting

### Issue: User stays null after signup

```typescript
// Check if profile was created
const { user, profile } = useAuth();
console.log('User:', user);
console.log('Profile:', profile);

// If user exists but profile is null:
// - Check database user_profiles table
// - Verify RLS policies allow INSERT
// - Check Supabase logs for errors
```

### Issue: Sign in fails silently

```typescript
// Add detailed error logging
try {
  await signIn(username, password);
} catch (error) {
  console.error('Full error:', error);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
}
```

### Issue: Loading state never clears

```typescript
// Check for errors in useEffect
useEffect(() => {
  loadSession();
}, []); // Missing dependencies can cause issues

// Ensure try-catch-finally in all async operations
try {
  await signIn(username, password);
} catch (error) {
  console.error(error);
} finally {
  setLoading(false); // Always clear loading
}
```

---

## Testing

### Mock Authentication Context

```typescript
import { AuthContext } from '../contexts/AuthContext';

const mockAuthValue = {
  user: { id: 'test-user-id' },
  profile: { username: 'testuser', role: 'learner' },
  session: null,
  loading: false,
  error: null,
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  refreshUser: jest.fn(),
  clearError: jest.fn(),
  verifyRecoveryUUID: jest.fn(),
  resetPassword: jest.fn(),
};

// In test
<AuthContext.Provider value={mockAuthValue}>
  <ComponentUnderTest />
</AuthContext.Provider>
```

---

## Migration from localStorage

### Before (localStorage):

```typescript
const user = JSON.parse(localStorage.getItem('user'));
const session = JSON.parse(localStorage.getItem('session'));
```

### After (Context):

```typescript
const { user, profile, session } = useAuth();
```

---

## Summary

✅ Use `useAuth()` hook in all components
✅ Always handle errors with try-catch
✅ Provide loading states for better UX
✅ Validate inputs before submission
✅ Keep UUIDs secure and private
✅ Clear sensitive data on logout
✅ Use TypeScript for type safety

For more details, see:
- `/contexts/AuthContext.tsx` - Implementation
- `/utils/supabase/dataService.ts` - API methods
- `/PHASE_2_COMPLETION_SUMMARY.md` - Migration guide
