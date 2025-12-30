import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { CheckCircle, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { PasswordManager } from '../utils/passwordManager';

export default function ResetPassword(): JSX.Element {
  const { isDark, toggleTheme } = useTheme();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const sp = url.searchParams;
      const token = sp.get('access_token') || sp.get('accessToken') || null;
      const refresh = sp.get('refresh_token') || sp.get('refreshToken') || null;
      if (token) {
        setAccessToken(token);
        if (refresh) setRefreshToken(refresh);
        return;
      }

      if (window.location.hash && window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
        const hToken = hashParams.get('access_token') || hashParams.get('accessToken');
        const hRefresh = hashParams.get('refresh_token') || hashParams.get('refreshToken');
        if (hToken) {
          setAccessToken(hToken);
          if (hRefresh) setRefreshToken(hRefresh);
          return;
        }
      }
      setAccessToken(null);
    } catch (e) {
      setAccessToken(null);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const validation = PasswordManager.validatePassword(password);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (accessToken) {
        try {
          // @ts-ignore
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || undefined });
        } catch (e) {
          console.warn('setSession failed', e);
        }
      }

      // @ts-ignore
      const { data, error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) {
        setError(upErr.message || String(upErr));
        setLoading(false);
        return;
      }

      setSuccess(true);
      const dest = '/login?password_reset=success';
      window.setTimeout(() => { window.location.href = dest; }, 1000);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="relative inline-block">
            <StudyBuddyLogo size="3xl" variant="minimal" className="mx-auto" withBackground={false} />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Set a new secure password for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-semibold">Password Reset Successful</span>
              </div>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <p>Your password has been updated. You will be redirected shortly to the sign in page.</p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!accessToken && (
                <div className="mb-2 text-sm text-muted-foreground">
                  No reset token found in the URL. If you clicked a reset link, ensure the link includes the access_token query or fragment and try again. You can request another reset from the login page.
                </div>
              )}

              <div>
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a new secure password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    autoFocus
                    className="pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters, include uppercase, lowercase and a special character.</p>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <div className="relative">
                  <Input id="confirm-password" className="pr-12" type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Updating…' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
