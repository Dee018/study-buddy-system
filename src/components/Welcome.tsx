import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { generateUserCode, isValidUserCode, RESERVED_USERNAMES } from '../utils/userCodes';
import { AuthService } from '../utils/supabase/dataService';
import { RESERVED_SYSTEM_USERNAMES, ADMIN_CREDENTIALS } from '../data/mockData';
import { accountInfoManager } from '../utils/accountInfoManager';
import { PasswordManager } from '../utils/passwordManager';
import { ADMIN_CONFIG, isAdminUUID } from '../utils/adminConfig';
import { supabase } from '../utils/supabase/client';
import { BookOpen, Brain, Trophy, Zap, KeyRound, CheckCircle, XCircle, ArrowRight, ArrowLeft, Star, Target, Shield, BarChart3, AlertTriangle, Sun, Moon, Eye, EyeOff, Lock, AlertCircle, Mail } from 'lucide-react';
import { StudyBuddyLogo } from './StudyBuddyLogo';

// Removed unused MacOSWindow imports

interface WelcomeProps {
  onComplete: (userData: { id: string; username: string; level?: string; points?: number; isNewUser?: boolean }) => void;
}

export function Welcome({ onComplete }: WelcomeProps) {
  const [step, setStep] = useState<'intro' | 'choice' | 'signup' | 'login' | 'uuid-login' | 'admin-uuid-verify' | 'new-account-info' | 'password-recovery' | 'password-recovery-verify' | 'password-recovery-reset'>('intro');

  // Separate state for signup form
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupUsernameError, setSignupUsernameError] = useState('');
  const [signupEmailError, setSignupEmailError] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ strength: string; score: number }>({ strength: 'weak', score: 0 });

  // Separate state for login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUsernameError, setLoginUsernameError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Shared states
  const [newUserCode, setNewUserCode] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const { isDark, toggleTheme } = useTheme();

  // Password recovery states
  const [recoveryUUID, setRecoveryUUID] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveredUsername, setRecoveredUsername] = useState('');
  const recoveryEmailRef = useRef<HTMLInputElement | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryEmailUsername, setRecoveryEmailUsername] = useState('');
  const [recoveryEmailError, setRecoveryEmailError] = useState('');
  const [isSendingRecoveryEmail, setIsSendingRecoveryEmail] = useState(false);
  // Secondary login (username + UUID) states
  const [uuidLoginUsername, setUuidLoginUsername] = useState('');
  const [uuidLoginUUID, setUuidLoginUUID] = useState('');
  const [uuidLoginError, setUuidLoginError] = useState('');
  const [isUuidLoginVerifying, setIsUuidLoginVerifying] = useState(false);
  const [_uuidVerified, setUuidVerified] = useState(false);
  const [verifiedUUID, setVerifiedUUID] = useState('');
  const [verifiedUsername, setVerifiedUsername] = useState('');
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [recoveryPreviewUsername, setRecoveryPreviewUsername] = useState<string | null>(null);
  const [recoveryPreviewLoading, setRecoveryPreviewLoading] = useState(false);
  // Loading states for async flows
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isAdminVerifying, setIsAdminVerifying] = useState(false);
  const [isUUIDVerifying, setIsUUIDVerifying] = useState(false);
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);

  // Admin UUID verification states
  const [adminUUID, setAdminUUID] = useState('');
  const [adminUUIDError, setAdminUUIDError] = useState('');
  const [tempAdminUserId, setTempAdminUserId] = useState('');
  const [tempAdminUsername, setTempAdminUsername] = useState('');

  // Refs for auto-focus functionality
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const signupConfirmPasswordRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);

  // Theme handled by ThemeProvider; use `isDark` and `toggleTheme` from `useTheme()`

  // Helper function to check if username is taken
  // SUPABASE TODO: Query users table to check username availability
  const isUsernameTaken = useCallback((username: string): boolean => {
    // Check reserved system usernames
    if (RESERVED_SYSTEM_USERNAMES.has(username)) return true;
    if (RESERVED_USERNAMES.has(username)) return true;

    return false;
  }, []);

  // Helper function to get account data
  const getAccountData = (_userId: string) => {
    // Account data is now managed by Supabase AuthContext
    return null;
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Adaptive Learning Paths',
      description: 'Learner profiles automatically shape a personalized Java journey based on your strengths, learning style, and performance.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: 'Mastery-Based Java Modules',
      description: 'Progress through structured lessons covering essential Java concepts—from basics to OOP—designed for real understanding.'
    },
    {
      icon: <Trophy className="w-8 h-8 text-primary" />,
      title: 'Intelligent Tutoring Support',
      description: 'Get instant guidance, hints, and step-by-step explanations powered by an AI tutor trained to support Java learners.'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: 'Progress, Rewards, & Achievements',
      description: 'Track your growth with dynamic progress indicators and earn badges and points as you master each Java topic.'
    }
  ];

  const generateUsernameSuggestions = useCallback((baseUsername: string) => {
    const suggestions = [];
    const numbers = ['123', '456', '789', '2024', '007', '321', '555'];
    const suffixes = ['Dev', 'Code', 'Pro', 'Master', 'Ninja', 'Geek', 'Coder'];
    const prefixes = ['Java', 'Code', 'Dev', 'Pro'];

    // Add numbers
    for (const num of numbers) {
      const suggestion = baseUsername + num;
      if (!isUsernameTaken(suggestion)) {
        suggestions.push(suggestion);
        if (suggestions.length >= 3) break;
      }
    }

    // Add suffixes if we need more suggestions
    if (suggestions.length < 3) {
      for (const suffix of suffixes) {
        const suggestion = baseUsername + suffix;
        if (!isUsernameTaken(suggestion)) {
          suggestions.push(suggestion);
          if (suggestions.length >= 3) break;
        }
      }
    }

    // Add prefixes if we still need more
    if (suggestions.length < 3) {
      for (const prefix of prefixes) {
        const suggestion = prefix + baseUsername;
        if (!isUsernameTaken(suggestion)) {
          suggestions.push(suggestion);
          if (suggestions.length >= 3) break;
        }
      }
    }

    return suggestions.slice(0, 3);
  }, [isUsernameTaken]);

  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      setSuggestedUsernames([]);
      setIsCheckingUsername(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable(null);
      setSuggestedUsernames([]);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);

    // Use Promise with timeout to prevent hanging
    try {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          if (step === 'signup') { // Only update if still on signup step
            (async () => {
              try {
                const localTaken = isUsernameTaken(value);
                console.log('[Welcome.checkUsernameAvailability] Checking:', { username: value, localTaken });
                // Query server-side user_profiles to see if username exists in auth-backed profiles.
                const serverTaken = await AuthService.usernameExists(value);
                console.log('[Welcome.checkUsernameAvailability] Server result:', { username: value, serverTaken });
                const isAvailable = !localTaken && !serverTaken;
                setUsernameAvailable(isAvailable);
                setIsCheckingUsername(false);
                if (!isAvailable) {
                  setSuggestedUsernames(generateUsernameSuggestions(value));
                } else {
                  setSuggestedUsernames([]);
                }
              } catch (e) {
                // On probe failure, fall back to local-only check (treat unknown as neutral)
                const localTaken = isUsernameTaken(value);
                setUsernameAvailable(localTaken ? false : null);
                setIsCheckingUsername(false);
                if (localTaken) setSuggestedUsernames(generateUsernameSuggestions(value));
                else setSuggestedUsernames([]);
              }
            })();
          }
          resolve(undefined);
        }, 500);

        // Clear timer if component unmounts or step changes
        return () => clearTimeout(timer);
      });
    } catch (error) {
      console.error('Error checking username availability:', error);
      setIsCheckingUsername(false);
    }
  }, [step, isUsernameTaken, generateUsernameSuggestions]);

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setSignupUsernameError('Username must be at least 3 characters long');
      return false;
    }
    if (RESERVED_USERNAMES.has(value)) {
      setSignupUsernameError('This username is reserved and cannot be used');
      return false;
    }
    if (isUsernameTaken(value)) {
      setSignupUsernameError('This username is already taken');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setSignupUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setSignupUsernameError('');
    return true;
  };

  useEffect(() => {
    if (signupUsername && step === 'signup' && signupUsername.length >= 3) {
      const debounceTimer = setTimeout(() => {
        if (signupUsername && step === 'signup') { // Double check to prevent race conditions
          checkUsernameAvailability(signupUsername);
        }
      }, 800);

      return () => clearTimeout(debounceTimer);
    } else if (signupUsername.length < 3) {
      setUsernameAvailable(null);
      setSuggestedUsernames([]);
      setIsCheckingUsername(false);
    }
  }, [signupUsername, step, checkUsernameAvailability]);

  // Password validation effect - ONLY for signup, not for login
  useEffect(() => {
    // Only validate password format during signup, not during login
    if (step === 'signup' && signupPassword) {
      const validation = PasswordManager.validatePassword(signupPassword);
      const strength = PasswordManager.getPasswordStrength(signupPassword);

      setPasswordStrength(strength);

      if (!validation.isValid) {
        setSignupPasswordError(validation.errors[0]);
      } else {
        setSignupPasswordError('');
      }
    } else if (step === 'signup' && !signupPassword) {
      setSignupPasswordError('');
      setPasswordStrength({ strength: 'weak', score: 0 });
    }
  }, [signupPassword, step]);

  // Lookup username preview for typed recovery identifier (no strict UUID format required)
  useEffect(() => {
    let mounted = true;
    if (recoveryUUID) {
      setRecoveryPreviewLoading(true);
      PasswordManager.getUsernameFromUUIDAsync(recoveryUUID)
        .then(u => { if (mounted) setRecoveryPreviewUsername(u); })
        .catch(() => { if (mounted) setRecoveryPreviewUsername(null); })
        .finally(() => { if (mounted) setRecoveryPreviewLoading(false); });
    } else {
      setRecoveryPreviewUsername(null);
      setRecoveryPreviewLoading(false);
    }

    return () => { mounted = false; };
  }, [recoveryUUID]);

  const handleSignup = async () => {
    setIsSignupLoading(true);
    try {
      // Basic email validation
      if (!signupEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
        setSignupEmailError('Please enter a valid email address');
        return;
      }

      // 1️⃣ Validate username & password
      const isUsernameValid = validateUsername(signupUsername);
      const passwordValidation = PasswordManager.validatePassword(signupPassword);

      if (!isUsernameValid) return;
      if (!passwordValidation.isValid) {
        setSignupPasswordError(passwordValidation.errors[0]);
        return;
      }
      if (signupPassword !== signupConfirmPassword) {
        setSignupPasswordError('Passwords do not match');
        return;
      }

      // Check BOTH email and username uniqueness before attempting signup to avoid race conditions
      try {
        setIsCheckingUsername(true);
        
        // Check email availability from user_profiles table
        const emailTaken = await AuthService.emailExists(signupEmail);
        if (emailTaken) {
          setSignupEmailError('Email already registered');
          setIsCheckingUsername(false);
          return;
        }
        
        // Check username availability from user_profiles table
        const usernameTaken = await AuthService.usernameExists(signupUsername);
        if (usernameTaken) {
          setSignupUsernameError('Username already taken');
          setSuggestedUsernames(generateUsernameSuggestions(signupUsername));
          setIsCheckingUsername(false);
          return;
        }
      } catch (e) {
        // ignore probe failures; proceed to signup and let server handle duplicates
      } finally {
        setIsCheckingUsername(false);
      }

      // 2️⃣ Generate a recovery code / UUID
      const recoveryCode = crypto.randomUUID();

      // 3️⃣ Sign up user and create profile/progress internally
      let user: any = null;
      try {
        const res = await AuthService.signUp(signupEmail, signupPassword, signupUsername, recoveryCode);
        user = res?.user ?? null;
      } catch (err: any) {
        const msg = String(err?.message || err || 'An unexpected error occurred. Please try again.');
        // Map server errors to friendly UI messages
        if (msg.includes('Username already taken')) {
          setSignupUsernameError('Username already taken');
          // Re-check username availability against server to ensure UI reflects truth
          try {
            setIsCheckingUsername(true);
            const serverTaken = await AuthService.usernameExists(signupUsername);
            setUsernameAvailable(!serverTaken);
            if (serverTaken) {
              setSuggestedUsernames(generateUsernameSuggestions(signupUsername));
            }
          } catch (probeErr) {
            // ignore probe failures; leave availability state as-is
          } finally {
            setIsCheckingUsername(false);
          }
        } else if (msg.includes('Email already registered') || msg.includes('already registered') || msg.includes('User already registered')) {
          setSignupEmailError('Email already registered');
        } else {
          setSignupEmailError(msg);
        }

        return;
      }

      // Store canonical Supabase user id (UUID) so downstream flows use it
      setNewUserId(user.id || null);

      // 4️⃣ Store hashed password (optional / best-effort)
      try {
        await PasswordManager.storePassword(user.id, signupPassword);
      } catch (err) {
        // Could not persist password in Supabase, continuing in-memory only (silent)
      }

      // 5️⃣ Fetch session directly from Supabase
      const session = await AuthService.getSession();
      if (!session) {
        setSignupUsernameError('Failed to create session. Please log in.');
        return;
      }

      // 6️⃣ Initialize account info & update state
      accountInfoManager.initializeAccount(recoveryCode, signupUsername);
      setNewUserCode(recoveryCode);
      setNewUsername(signupUsername);
      setNewUserEmail(signupEmail);
      
      // Clear all form fields and errors after successful signup
      setSignupEmail('');
      setSignupUsername('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupEmailError('');
      setSignupUsernameError('');
      setSignupPasswordError('');
      setUsernameAvailable(null);
      setSuggestedUsernames([]);
      
      setStep('new-account-info');

    } catch (error: any) {
      console.error('Signup flow error:', error);
      // Friendly mapping for Supabase errors when a user/email/username already exists
      const msg = String(error?.message || error || 'An unexpected error occurred. Please try again.');
      if (/Username already taken/i.test(msg)) {
        setSignupUsernameError('Username already taken');
        // Ensure availability UI is accurate after unexpected errors
        try {
          setIsCheckingUsername(true);
          const serverTaken = await AuthService.usernameExists(signupUsername);
          setUsernameAvailable(!serverTaken);
          if (serverTaken) setSuggestedUsernames(generateUsernameSuggestions(signupUsername));
        } catch (e) {
          // ignore
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (error?.name === 'AuthApiError' || error?.status === 422 || /User already registered/i.test(msg) || /Email already registered/i.test(msg)) {
        setSignupEmailError('Email already registered');
      } else {
        setSignupEmailError(msg);
      }
    } finally {
      setIsSignupLoading(false);
    }
  };



  const handleLogin = async () => {
    setIsLoginLoading(true);
    try {
      // Clear all errors at start
      setLoginError('');
      setLoginUsernameError('');
      setLoginPasswordError('');

      // Basic input validation - only check if fields are filled
      if (!loginUsername || !loginPassword) {
        setLoginError('Please enter both username and password');
        return;
      }

      // Authenticate using Supabase Auth so we obtain canonical UUID
      // Username-only: the app derives an internal email from the username.
      const signInData = await AuthService.signIn(loginUsername, loginPassword);
      const authUser = signInData?.user;

      if (!authUser || !authUser.id) {
        setLoginError('Invalid login credentials');
        return;
      }

      // Check if this user is an admin based on Supabase-backed profile flags.
      // NOTE: ADMIN_CONFIG.UUID is a recovery/admin code, NOT the Supabase auth user id.
      let isAdmin = false;
      let canonicalUsername = loginUsername;
      try {
        const profile = await AuthService.getUserProfile(authUser.id);
        canonicalUsername = (profile as any)?.username || canonicalUsername;
        isAdmin = !!profile && (((profile as any).is_admin === true) || ((profile as any).role === 'admin'));
      } catch (e) {
        // If profile lookup fails, do not treat as admin. (silent)
      }

      if (isAdmin && canonicalUsername === ADMIN_CONFIG.USERNAME) {
        // For admin users, proceed to UUID verification step
        setTempAdminUserId(authUser.id);
        setTempAdminUsername(canonicalUsername);
        setStep('admin-uuid-verify');
        return;
      }

      // For regular users, proceed with normal login flow
      // AuthService.signIn already established a Supabase session above

      // Get account data
      const account = getAccountData(authUser.id) || { username: canonicalUsername, level: 'Beginner', points: 0 };

      // Record login against display user_code where possible
      try {
        const profile = await AuthService.getUserProfile(authUser.id);
        const displayCode = (profile && (profile as any).uuid) || canonicalUsername;
        accountInfoManager.recordLogin(displayCode, canonicalUsername);
      } catch (err) {
        accountInfoManager.recordLogin(canonicalUsername, canonicalUsername);
      }

      try {
        // Use default export from the progress manager
        const ProgressSyncManager = (await import('../utils/progressSyncManager')).default;

        // Prefer an app-provided COURSE_CONFIG if available, otherwise fall back to a minimal one
        const COURSE_CONFIG: { id: string; lessons: string[]; exercises: string[] }[] = (window as any).__COURSE_CONFIG || [
          { id: 'module_1', lessons: [], exercises: [] }
        ];

        // 1️⃣ Load existing progress (will populate cache and notify subscribers)
        let progress = await ProgressSyncManager.initUserProgress(authUser.id);

        // 2️⃣ If empty or missing module entries, initialize defaults and re-hydrate
        if (!progress || !progress.moduleProgress || Object.keys(progress.moduleProgress).length === 0) {
          await ProgressSyncManager.initDefaultProgressForUser(authUser.id, COURSE_CONFIG);
          // re-fetch/rehydrate so cache and subscribers get the final state
          progress = await ProgressSyncManager.initUserProgress(authUser.id);
        }

        // initUserProgress already notifies subscribers; no emitProgressUpdate method exists.
      } catch (e) {
        // Progress hydration failed after login (silent)
      }


      // Complete login process
      onComplete({
        id: authUser.id,
        username: canonicalUsername,
        level: account.level,
        points: account.points,
        isNewUser: false
      });
    } catch (error) {
      console.error('Error during login:', error);
      const msg = String((error as any)?.message || error);
      // Map common auth failures to a friendly message
      if (/invalid login credentials/i.test(msg) || /incorrect username|incorrect password|user not found|no user found|email not found/i.test(msg)) {
        setLoginError('Invalid login credentials');
        return;
      }
      if (loginUsername === ADMIN_CONFIG.USERNAME) {
        const expectedEmail = AuthService.generateInternalEmail(ADMIN_CONFIG.USERNAME);

        if (/email not confirmed/i.test(msg)) {
          setLoginError(
            `Admin auth user exists but email is not confirmed in Supabase Auth.\n\n` +
            `Fix: Supabase Dashboard → Authentication → Users → open ${expectedEmail} → confirm email.\n` +
            `Then try logging in again.\n\n` +
            `If you want to avoid this in dev, adjust Supabase Auth settings to not require email confirmation.`
          );
          return;
        }

        if (/invalid login credentials/i.test(msg)) {
          setLoginError(
            `Admin login failed in Supabase Auth. Ensure an auth user exists for ${expectedEmail} and reset its password in Supabase Dashboard → Authentication → Users.`
          );
          return;
        }
      }

      setLoginError('An error occurred. Please try again or contact support.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleAdminUUIDVerification = async () => {
    setIsAdminVerifying(true);
    try {
      setAdminUUIDError('');

      // Validate UUID input
      if (!adminUUID) {
        setAdminUUIDError('Please enter your admin UUID');
        return;
      }

      // Validate UUID format
      if (!isValidUserCode(adminUUID)) {
        setAdminUUIDError('Invalid UUID format. Expected format: ABC-123-XY-7890');
        return;
      }

      // Verify UUID matches admin UUID
      if (adminUUID.toUpperCase() !== ADMIN_CONFIG.UUID) {
        setAdminUUIDError('Invalid admin UUID. Access denied.');
        return;
      }

      // UUID verified - do NOT sign in again here.
      // Supabase session established during the initial login is the only source of truth.
      const session = await AuthService.getSession();
      const sessionUserId = session?.user?.id;
      if (!sessionUserId || !tempAdminUserId || sessionUserId !== tempAdminUserId) {
        setAdminUUIDError('Admin session is not active. Please log in again.');
        return;
      }

      // Confirm admin privileges from Supabase profile (server truth)
      const profile = await AuthService.getUserProfile(sessionUserId);
      const isAdmin = !!profile && (((profile as any).is_admin === true) || ((profile as any).role === 'admin'));
      if (!isAdmin) {
        setAdminUUIDError('This account is not authorized as admin.');
        return;
      }

      // Get account data
      const account = getAccountData(tempAdminUserId) || { username: tempAdminUsername, level: 'Beginner', points: 0 };

      // Record login
      accountInfoManager.recordLogin(tempAdminUserId, tempAdminUsername);

      // Complete admin login process
      onComplete({
        id: sessionUserId,
        username: tempAdminUsername,
        level: account.level,
        points: account.points,
        isNewUser: false
      });
    } catch (error) {
      console.error('Error during admin UUID verification:', error);
      setAdminUUIDError('An error occurred. Please try again.');
    } finally {
      setIsAdminVerifying(false);
    }
  };

  const handleUuidLogin = async () => {
    setIsUuidLoginVerifying(true);
    try {
      setUuidLoginError('');

      if (!uuidLoginUsername || !uuidLoginUUID) {
        setUuidLoginError('Username and UUID are required');
        return;
      }

      // Prevent admin bypass via recovery UUID
      if (isAdminUUID(uuidLoginUUID.toUpperCase())) {
        setUuidLoginError('Admin accounts cannot use UUID login. Please use standard login.');
        return;
      }

      // Request a short-lived Supabase session token from admin API
      const loginResp = await AuthService.recoveryLogin(uuidLoginUsername, uuidLoginUUID);
      if (!loginResp || !loginResp.ok || !loginResp.access_token) {
        setUuidLoginError(loginResp?.error || 'Invalid username or UUID');
        return;
      }

      // Establish Supabase session on client using returned access_token
      try {
        const { data, error } = await supabase.auth.setSession({ access_token: loginResp.access_token });
        if (error) {
          console.error('Failed to set Supabase session from recovery token', error);
          setUuidLoginError('Failed to establish session');
          return;
        }

        // Reload session/profile and complete login in app
        const session = await AuthService.getSession();
        const authUser = session?.user;
        if (!authUser || !authUser.id) {
          setUuidLoginError('Failed to establish authenticated session');
          return;
        }

        const profile = await AuthService.getUserProfile(authUser.id);
        const canonicalUsername = (profile as any)?.username || uuidLoginUsername;

        // Record login and hydrate progress
        try { accountInfoManager.recordLogin((profile as any)?.uuid || authUser.id, canonicalUsername); } catch (e) { }

        const account = getAccountData(authUser.id) || { username: canonicalUsername, level: 'Beginner', points: 0 };
        onComplete({ id: authUser.id, username: canonicalUsername, level: account.level, points: account.points, isNewUser: false });
        return;
      } catch (e) {
        console.error('Error establishing Supabase session:', e);
        setUuidLoginError('Failed to establish session');
        return;
      }
    } catch (err) {
      console.error('Error during UUID login:', err);
      setUuidLoginError('An error occurred during UUID login. Please try again.');
    } finally {
      setIsUuidLoginVerifying(false);
    }
  };

  const handleUUIDVerification = async () => {
    setIsUUIDVerifying(true);
    try {
      setRecoveryError('');

      if (!recoveryUUID) {
        setRecoveryError('Please enter your account identifier');
        return;
      }

      // No strict format validation — accept free-form identifiers (email, username, or code)

      // ADMIN PROTECTION: Prevent password reset for admin account
      if (isAdminUUID(recoveryUUID.toUpperCase())) {
        setRecoveryError('Admin account cannot be modified through password recovery. Please contact system administrator.');
        return;
      }

      // Resolve the identifier to a username
      const username = await PasswordManager.getUsernameFromUUIDAsync(recoveryUUID);
      if (!username) {
        setRecoveryError('No account found for that identifier. Please verify and try again.');
        return;
      }

      // UUID verified successfully!
      setVerifiedUUID(recoveryUUID);
      setVerifiedUsername(username);
      setUuidVerified(true);
      setRecoveryError('');

      // Move to password reset screen
      setStep('password-recovery-reset');
    } catch (error) {
      console.error('Error during UUID verification:', error);
      setRecoveryError('An error occurred during verification. Please try again.');
    } finally {
      setIsUUIDVerifying(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    setRecoveryError('');
    setRecoveryEmailError('');
    if (!recoveryEmail || !recoveryEmailUsername) {
      setRecoveryEmailError('Please provide both email and username');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
      setRecoveryEmailError('Please enter a valid email address');
      return;
    }

    setIsSendingRecoveryEmail(true);
    try {
      const r = await AuthService.sendPasswordResetByEmail(recoveryEmail, recoveryEmailUsername);
      if (!r.ok) {
        setRecoveryError(r.error || 'Failed to send reset email');
      } else {
        setRecoverySuccess(true);
      }
    } catch (e: any) {
      setRecoveryError(String(e?.message || e || 'Failed to send reset email'));
    } finally {
      setIsSendingRecoveryEmail(false);
    }
  };

  const handlePasswordRecovery = async () => {
    setIsPasswordResetting(true);
    try {
      setRecoveryError('');

      if (!verifiedUUID || !newPassword) {
        setRecoveryError('New password is required');
        return;
      }

      // Validate password (basic check)
      const passwordValidation = PasswordManager.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        setRecoveryError(passwordValidation.errors[0]);
        return;
      }

      // Reset password - This replaces the old password
      const result = await AuthService.resetPasswordWithUUID(verifiedUUID, newPassword);

      if (!result) {
        setRecoveryError('Password recovery failed');
        return;
      }

      // Show success state with verified username
      setRecoveredUsername(verifiedUsername);
      setRecoverySuccess(true);

      // Auto-login after 2 seconds with NEW password
      setTimeout(async () => {
        const account = getAccountData(verifiedUUID);
        if (account) {
          try {
            const signInRes = await AuthService.signIn(account.username, newPassword);
            if (signInRes && signInRes.user) {
              accountInfoManager.recordLogin(verifiedUUID, account.username);

              onComplete({
                id: verifiedUUID,
                username: account.username,
                level: account.level,
                points: account.points,
                isNewUser: false
              });
            } else {
              setRecoveryError('Password was reset but auto-login failed. Please log in manually with your new password.');
              setRecoverySuccess(false);
            }
          } catch (err) {
            console.error('Auto-login after password reset failed', err);
            setRecoveryError('Auto-login after password reset failed. Please log in manually.');
            setRecoverySuccess(false);
          }
        }
      }, 2000);
    } catch (error) {
      console.error('Error during password recovery:', error);
      setRecoveryError('An error occurred during password recovery. Please try again.');
    } finally {
      setIsPasswordResetting(false);
    }
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-card border-2 border-primary/40 hover:border-primary hover:bg-primary/10 shadow-lg transition-all duration-300"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </Button>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-1/4 right-16 w-20 h-20 bg-primary rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-primary rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-16 right-1/3 w-24 h-24 bg-primary rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
          {/* Gamified Logo and Title */}
          <div className="space-y-6">
            <div className="relative">
              <div className="transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <StudyBuddyLogo
                  size="4xl"
                  variant="glow"
                  className="mx-auto"
                  animate={true}
                  withBackground={false}
                />
              </div>
              {/* Enhanced floating elements around logo */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center animate-bounce delay-300 shadow-lg">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <div className="absolute top-2 left-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-full animate-pulse opacity-80 shadow-md"></div>
              <div className="absolute bottom-4 right-6 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-300 rounded-full animate-pulse delay-700 opacity-80 shadow-md"></div>
              <div className="absolute top-1/2 -left-4 w-2 h-2 bg-gradient-to-br from-green-400 to-green-300 rounded-full animate-pulse delay-1000 opacity-70"></div>
              <div className="absolute top-1/4 -right-2 w-2 h-2 bg-gradient-to-br from-pink-400 to-pink-300 rounded-full animate-pulse delay-500 opacity-70"></div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-pulse">
                Study Buddy
              </h1>
              <p className="text-2xl text-muted-foreground">Your AI-Powered Java Learning Adventure! 🚀</p>
              <div className="flex justify-center items-center space-x-2 text-lg">
                <span className="animate-bounce">🎯</span>
                <span className="text-primary">Ready to become a Java Master?</span>
                <span className="animate-bounce delay-150">🏆</span>
              </div>
            </div>
          </div>

          {/* Start Journey Button - Centered */}
          <div className="flex justify-center">
            <div className="relative inline-block">
              <Button
                size="lg"
                className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300 rounded-2xl"
                onClick={() => setStep('choice')}
              >
                🚀 Start Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Floating elements around button */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-xs">🎯</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce delay-500">
                <span className="text-white text-xs">⚡</span>
              </div>
            </div>
          </div>

          {/* Gamified Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      {feature.icon}
                    </div>
                    {/* Floating badge for gamification */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>

                </CardContent>
              </Card>
            ))}
          </div>


        </div>
      </div>
    );
  }

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" withBackground={false} />
            <div>
              <h1 className="text-3xl mb-2">Choose Your Path</h1>
              <p className="text-muted-foreground">How would you like to get started with Study Buddy?</p>
            </div>
          </div>

          {/* Path Options - Aligned Heights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer transition-all hover:shadow-2xl hover:border-primary/60 group hover:-translate-y-2 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 h-full" onClick={() => setStep('signup')}>
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="relative mx-auto w-fit">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-accent/40 transition-all duration-300 shadow-lg">
                      <Trophy className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl group-hover:text-primary transition-colors text-[21px]">🚀 Create Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Start your epic Java learning adventure from scratch with a brand new account
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground space-y-1 bg-primary/5 dark:bg-primary/10 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>Personalized learning path</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="w-3 h-3 text-primary" />
                      <span>Track your progress</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Trophy className="w-3 h-3 text-primary" />
                      <span>Earn badges and points</span>
                    </div>
                  </div>
                  <Button className="w-full group-hover:bg-primary/90 group-hover:scale-105 transition-all duration-300 bg-primary text-white shadow-lg h-12">
                    🎯 Begin Your Quest
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-2xl hover:border-primary/60 group hover:-translate-y-2 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 h-full" onClick={() => setStep('login')}>
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="relative mx-auto w-fit">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent/20 to-primary/30 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent/30 group-hover:to-primary/40 transition-all duration-300 shadow-lg">
                      <KeyRound className="w-10 h-10 text-accent" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl group-hover:text-accent transition-colors text-[21px]">🔑 Return to Adventure</h3>
                    <p className="text-sm text-muted-foreground">
                      Continue your epic learning journey with your existing Study Buddy account
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground space-y-1 bg-accent/5 dark:bg-accent/10 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Shield className="w-3 h-3 text-accent" />
                      <span>Secure user code + username login</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <BarChart3 className="w-3 h-3 text-accent" />
                      <span>Access your progress</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <BookOpen className="w-3 h-3 text-accent" />
                      <span>Resume where you left off</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10 group-hover:scale-105 transition-all duration-300 border-accent/50 h-12">
                    🎓 Continue Quest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to Intro */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('intro')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Introduction
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" withBackground={false} />
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Choose a unique username to get started with your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="signup-email">Email</label>
              <div className="relative">
                <Input
                  id="signup-email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (signupEmailError) setSignupEmailError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && signupEmail) {
                      e.preventDefault();
                      signupPasswordRef.current?.focus();
                    }
                  }}
                  className={`${signupEmailError ? 'border-destructive' : ''} pr-10`}
                />
              </div>
              {signupEmailError && <p className="text-sm text-destructive">{signupEmailError}</p>}

              <label htmlFor="signup-username">Username</label>
              <div className="relative">
                <Input
                  id="signup-username"
                  placeholder="Enter your username"
                  value={signupUsername}
                  onChange={(e) => {
                    setSignupUsername(e.target.value);
                    if (signupUsernameError) validateUsername(e.target.value);
                  }}
                  onBlur={() => {
                    if (signupUsername && signupUsername.length >= 3) {
                      // Immediately probe server for authoritative availability on blur
                      setIsCheckingUsername(true);
                      void checkUsernameAvailability(signupUsername);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && signupUsername && usernameAvailable === true && !isCheckingUsername) {
                      e.preventDefault();
                      // Auto-focus to password field
                      signupPasswordRef.current?.focus();
                    }
                  }}
                  className={`${signupUsernameError ? 'border-destructive' : usernameAvailable === true ? 'border-green-500' : usernameAvailable === false ? 'border-destructive' : ''} pr-10`}
                />
                {signupUsername.length >= 3 && (
                  <div className="absolute right-3 top-3">
                    {isCheckingUsername ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : usernameAvailable === true ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ) : null}
                  </div>
                )}
              </div>

              {signupUsernameError && (
                <p className="text-sm text-destructive">{signupUsernameError}</p>
              )}

              {usernameAvailable === true && !isCheckingUsername && (
                <div className="text-sm text-green-500 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Username is available!</span>
                </div>
              )}

              {isCheckingUsername && (
                <div className="text-sm text-muted-foreground flex items-center space-x-1">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Checking availability...</span>
                </div>
              )}

              {usernameAvailable === false && !signupUsernameError && !isCheckingUsername && (
                <div className="space-y-2">
                  <div className="text-sm text-destructive flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Username is already taken</span>
                  </div>
                  {suggestedUsernames.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Try these suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedUsernames.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSignupUsername(suggestion);
                              setUsernameAvailable(true);
                              setSuggestedUsernames([]);
                            }}
                            className="text-xs"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Choose a unique username for your Study Buddy account (3-20 characters, letters, numbers, and underscores only)
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  ref={signupPasswordRef}
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    setSignupPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && signupPassword) {
                      e.preventDefault();
                      // Auto-focus to confirm password field
                      signupConfirmPasswordRef.current?.focus();
                    }
                  }}
                  className={signupPasswordError ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {signupPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Strength:</span>
                    <Badge
                      className={
                        passwordStrength.strength === 'weak' ? 'bg-red-500 text-white' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-500 text-white' :
                            passwordStrength.strength === 'strong' ? 'bg-blue-500 text-white' :
                              'bg-green-500 text-white'
                      }
                    >
                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                    </Badge>
                  </div>
                  <Progress
                    value={(passwordStrength.score / 8) * 100}
                    className="h-2"
                  />
                </div>
              )}

              {signupPasswordError && (
                <p className="text-sm text-destructive">{signupPasswordError}</p>
              )}

              <p className="text-xs text-muted-foreground">
                Minimum 8 characters with uppercase, lowercase, and special characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="signup-confirmPassword"
                  ref={signupConfirmPasswordRef}
                  type={showSignupConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    setSignupPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && signupPassword && signupConfirmPassword && usernameAvailable === true && signupPassword === signupConfirmPassword) {
                      e.preventDefault();
                      // Trigger signup when all fields are valid
                      handleSignup();
                    }
                  }}
                  className={signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                >
                  {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {signupPassword && signupConfirmPassword && (
                <div className="flex items-center space-x-1">
                  {signupPassword === signupConfirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <Button
                className="w-full"
                onClick={handleSignup}
                disabled={!signupEmail || !signupUsername || usernameAvailable !== true || isCheckingUsername || !signupPassword || !signupConfirmPassword || signupPassword !== signupConfirmPassword || signupPasswordError !== '' || signupEmailError !== '' || isSignupLoading}
              >
                {isSignupLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Create Account & Start Learning
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('choice')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Path Selection
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4 border-t space-y-2">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-1 text-green-700 dark:text-green-300">
                  <Shield className="w-3 h-3" />
                  <span>Your account data is secure and protected</span>
                </div>
                <div className="mt-1 flex items-center justify-center space-x-1">
                  <KeyRound className="w-3 h-3 text-blue-500" />
                  <span>A unique user code will be auto-generated for your account</span>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <span className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span>Start with 0 XP</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span>Beginner Level</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-purple-500" />
                  <span>Ready to Level Up!</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="relative inline-block">
              <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" animate={true} withBackground={false} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
            </div>
            <CardTitle>Access Your Account</CardTitle>
            <CardDescription>
              Enter your username and password to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{loginError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="login-username">Username</label>
              <Input
                id="login-username"
                placeholder="Enter your username"
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  setLoginUsernameError('');
                  setLoginError(''); // Clear login error when user types
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && loginUsername) {
                    e.preventDefault();
                    // Auto-focus to password field
                    loginPasswordRef.current?.focus();
                  }
                }}
                className={loginUsernameError ? 'border-destructive' : ''}
              />
              {loginUsernameError && (
                <p className="text-sm text-destructive">{loginUsernameError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  ref={loginPasswordRef}
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginPasswordError('');
                    setLoginError(''); // Clear login error when user types
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && loginUsername && loginPassword) {
                      e.preventDefault();
                      // Trigger login
                      handleLogin();
                    }
                  }}
                  className={loginPasswordError ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {loginPasswordError && (
                <p className="text-sm text-destructive">{loginPasswordError}</p>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={!loginUsername || !loginPassword || isLoginLoading}
              >
                {isLoginLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Access Account
                  </>
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setStep('password-recovery');
                    // Prefill username from login input to speed up recovery
                    setRecoveryEmailUsername(loginUsername || '');
                    // focus email input when UI renders
                    setTimeout(() => recoveryEmailRef.current?.focus(), 120);
                  }}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  <KeyRound className="w-3 h-3 mr-1" />
                  Forgot password
                </Button>
              </div>



              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('choice')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Path Selection
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
              <p>🔒 Session limited to one device per account</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'admin-uuid-verify') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Admin Security Verification</CardTitle>
              <CardDescription className="mt-2">
                Additional authentication required for administrator access
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Notice */}
            <Alert className="border-primary/30 bg-primary/5">
              <Shield className="w-4 h-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Enhanced Security:</strong> Admin accounts require UUID verification for additional protection.
              </AlertDescription>
            </Alert>

            {/* Admin UUID Error Alert */}
            {adminUUIDError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{adminUUIDError}</span>
                </p>
              </div>
            )}

            {/* UUID Input */}
            <div className="space-y-2">
              <Label htmlFor="admin-uuid">Admin UUID</Label>
              <Input
                id="admin-uuid"
                type="text"
                placeholder="ABC-123-XY-7890"
                value={adminUUID}
                onChange={(e) => {
                  const input = e.target.value;
                  // Remove all non-alphanumeric characters
                  const cleanInput = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();

                  // Format with dashes: ABC-123-XY-7890
                  let formatted = '';
                  if (cleanInput.length > 0) {
                    formatted += cleanInput.substring(0, 3); // First 3 letters
                  }
                  if (cleanInput.length > 3) {
                    formatted += '-' + cleanInput.substring(3, 6); // 3 numbers
                  }
                  if (cleanInput.length > 6) {
                    formatted += '-' + cleanInput.substring(6, 8); // 2 letters
                  }
                  if (cleanInput.length > 8) {
                    formatted += '-' + cleanInput.substring(8, 12); // 4 numbers
                  }

                  setAdminUUID(formatted);
                  setAdminUUIDError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminUUID) {
                    e.preventDefault();
                    handleAdminUUIDVerification();
                  }
                }}
                className={`font-mono ${adminUUIDError ? 'border-destructive' : ''}`}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter your unique admin UUID to access the Admin Dashboard
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                onClick={handleAdminUUIDVerification}
                disabled={!adminUUID || isAdminVerifying}
              >
                {isAdminVerifying ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify & Access Admin Dashboard
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('login');
                    setAdminUUID('');
                    setAdminUUIDError('');
                    setLoginPassword('');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
              <p className="flex items-center justify-center space-x-2">
                <Lock className="w-3 h-3" />
                <span>Two-factor authentication active for admin accounts</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // UUID Login (secondary login) - ask for username + UUID and complete locally
  if (step === 'uuid-login') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="relative inline-block">
              <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" withBackground={false} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
            </div>
            <CardTitle>Secondary Login</CardTitle>
            <CardDescription>
              Sign in using your username and recovery UUID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uuidLoginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{uuidLoginError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="uuid-login-username">Username</Label>
              <Input
                id="uuid-login-username"
                placeholder="Enter your username"
                value={uuidLoginUsername}
                onChange={(e) => { setUuidLoginUsername(e.target.value); setUuidLoginError(''); }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uuid-login-uuid">Account UUID</Label>
              <Input
                id="uuid-login-uuid"
                placeholder="Enter your recovery UUID"
                value={uuidLoginUUID}
                onChange={(e) => { setUuidLoginUUID(e.target.value); setUuidLoginError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && uuidLoginUsername && uuidLoginUUID) { e.preventDefault(); handleUuidLogin(); } }}
              />
            </div>

            <div className="space-y-4 pt-4">
              <Button className="w-full" onClick={handleUuidLogin} disabled={!uuidLoginUsername || !uuidLoginUUID || isUuidLoginVerifying}>
                {isUuidLoginVerifying ? 'Verifying...' : 'Sign in'}
              </Button>

              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={() => setStep('login')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'new-account-info') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-500 rounded-xl flex items-center justify-center relative">
                <CheckCircle className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-green-600">Account Created Successfully!</CardTitle>
              <CardDescription>
                Welcome to Study Buddy! Your account is now ready.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-primary/10 rounded-lg p-4 space-y-3">
              <h3 className="text-lg">Your Account Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-background rounded border">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-mono text-primary">{newUserEmail}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded border">
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="text-primary">{newUsername}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">Beginner Level</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground">0 Points</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground">Ready to Learn</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                🎯 Your Java learning adventure starts now!
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => onComplete({
                    id: newUserId || newUserCode,
                    username: newUsername,
                    level: 'Beginner',
                    points: 0,
                    isNewUser: true
                  })}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-3"
                  size="lg"
                >
                  🚀 Start Journey
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password Recovery Screen - Step 1: Email + Username (preferred)
  if (step === 'password-recovery' || step === 'password-recovery-verify') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="relative inline-block">
              <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" withBackground={false} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter the email and username for your account and we'll send a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recoveryError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{recoveryError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <Input
                id="recovery-email"
                placeholder="you@example.com"
                value={recoveryEmail}
                ref={recoveryEmailRef}
                onChange={(e) => { setRecoveryEmail(e.target.value); setRecoveryError(''); setRecoveryEmailError(''); }}
              />
              <Label htmlFor="recovery-email-username">Username</Label>
              <Input
                id="recovery-email-username"
                placeholder="yourusername"
                value={recoveryEmailUsername}
                onChange={(e) => { setRecoveryEmailUsername(e.target.value); setRecoveryError(''); setRecoveryEmailError(''); }}
              />
              {recoveryEmailError && <p className="text-sm text-destructive">{recoveryEmailError}</p>}
            </div>

            {recoverySuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-semibold">Reset Email Sent</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Check your email for the password reset link. The link will take you to the reset page where you can set a new password.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <Button
                className="w-full"
                onClick={handleSendPasswordResetEmail}
                disabled={!recoveryEmail || !recoveryEmailUsername || isSendingRecoveryEmail}
              >
                {isSendingRecoveryEmail ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Email
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('login');
                    setRecoveryEmail('');
                    setRecoveryEmailUsername('');
                    setRecoveryError('');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password Recovery Screen - Step 2: Create New Password
  if (step === 'password-recovery-reset') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        {/* Theme Toggle Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg border-2 border-primary/30 hover:border-primary/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{isDark ? 'Light' : 'Dark'}</span>
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="relative inline-block">
              <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" withBackground={false} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
            </div>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Step 2 of 2: Set a new secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recoveryError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{recoveryError}</p>
              </div>
            )}

            {recoverySuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-semibold">Password Reset Successful!</span>
                </div>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <p>✓ UUID verified for account: <strong>{recoveredUsername}</strong></p>
                  <p>✓ New password has replaced your previous password</p>
                  <p>✓ Your new password is now required for all future logins</p>
                  <p className="pt-2 mt-2 border-t border-green-300 dark:border-green-700">
                    Logging you in with new credentials...
                  </p>
                </div>
              </div>
            )}

            {/* Account Verified Badge */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-2 border-green-500">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300 font-semibold">Account Verified</span>
              </div>
              <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                <p><strong>Account:</strong> {verifiedUsername}</p>
                <p><strong>UUID:</strong> {verifiedUUID}</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Password Requirements</span>
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one special character</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showRecoveryPassword ? "text" : "password"}
                  placeholder="Create a new secure password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setRecoveryError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPassword) {
                      e.preventDefault();
                      const validation = PasswordManager.validatePassword(newPassword);
                      if (validation.isValid) handlePasswordRecovery();
                      else setRecoveryError(validation.errors[0]);
                    }
                  }}
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                >
                  {showRecoveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This will replace your previous password
              </p>
            </div>

            {/* Validate new password against PasswordManager rules before enabling submit */}
            {newPassword && !PasswordManager.validatePassword(newPassword).isValid && (
              <p className="text-sm text-destructive">{PasswordManager.validatePassword(newPassword).errors[0]}</p>
            )}

            <div className="space-y-4 pt-4">
              <Button
                className="w-full"
                onClick={handlePasswordRecovery}
                disabled={!newPassword || !PasswordManager.validatePassword(newPassword).isValid || isPasswordResetting}
              >
                {isPasswordResetting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting...
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('password-recovery');
                    setNewPassword('');
                    setRecoveryError('');
                    setUuidVerified(false);
                    setVerifiedUUID('');
                    setVerifiedUsername('');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Verification
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
              <p>🔒 Your new password will be required for all future logins</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}