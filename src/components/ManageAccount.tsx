import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
// Removed unused UI imports: Switch, Select, Tabs
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useProgress } from '../contexts/ProgressContext';
import { useCertificates } from '../contexts/CertificateContext';
import { toast } from 'sonner@2.0.3';
import {
  User,
  ArrowLeft,
  Save,
  Shield,

  CheckCircle,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Bell,
  Palette,
  Code,
  Globe,

  AlertTriangle,
  KeyRound,
  XCircle
} from 'lucide-react';
import PasswordManager from '../utils/passwordManager';

interface ManageAccountProps {
  onBack: () => void;
}

export function ManageAccount({ onBack }: ManageAccountProps) {
  const { user, profile, updateProfile, changePassword, deleteAccount } = useAuth();
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    loading: preferencesLoading,
  } = usePreferences();
  const {
    userProgress,
    currentStreak,
    moduleProgress,
  } = useProgress();
  const { certificates } = useCertificates();

  // Account state
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);



  useEffect(() => {
    if (profile?.username) {
      setNewUsername(profile.username);
    }
  }, [profile?.username]);

  /**
   * Format relative time for last saved
   */
  const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return date.toLocaleString();
  };



  /**
   * Handle username update
   */
  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername === profile?.username) return;

    if (newUsername.length < 3 || newUsername.length > 20) {
      toast.error('Username must be 3-20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      toast.error('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({ username: newUsername });
      toast.success('Username updated successfully');
      setLastSaved(new Date());
    } catch (error: any) {
      toast.error(error.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle password change
   */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate password against signup requirements
    const validation = PasswordManager.validatePassword(newPassword);
    if (!validation.isValid) {
      toast.error(validation.errors.join('; '));
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');

      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * Handle preference update
   */
  const handlePreferenceUpdate = async (updates: Partial<typeof preferences>) => {
    try {
      await updatePreferences(updates);
      setLastSaved(new Date());
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  /**
   * Handle reset preferences
   */
  const handleResetPreferences = async () => {
    try {
      await resetPreferences();
      toast.success('Preferences reset to defaults');
      setLastSaved(new Date());
    } catch (error) {
      toast.error('Failed to reset preferences');
    }
  };

  /**
   * Handle account deletion with enhanced warnings
   */
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      toast.info('Deleting account and all associated data...');

      await deleteAccount();

      // Success - user will be automatically logged out and redirected
      // No need for success toast as user will be on welcome screen
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast.error(
        error.message ||
        'Failed to delete account. Please contact support if this persists.'
      );
      setDeletingAccount(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Small account stats mapping for UI cards
  const accountStats = {
    accountAge: new Date(profile.created_at).toLocaleDateString(),
    lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Unknown',
    totalSessions: (userProgress as any)?.total_sessions || 0,
    status: { status: (profile as any)?.suspended ? 'Suspended' : 'Active', variant: 'outline', colorClass: (profile as any)?.suspended ? 'border-red-500/50 text-red-500' : 'border-green-500/50 text-green-500' }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button in Upper Right */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl">Account Settings</h1>
            <p className="text-muted-foreground">Update your profile and account settings</p>
          </div>
          <Button variant="ghost" onClick={() => onBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          {/* Left: main controls (password moved here, UUID, then Account Info + Delete) */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-2xl space-y-6">
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <span>Password Management</span>
                  </CardTitle>
                  <CardDescription>View and change your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm">Current Password</label>
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">••••••••••••</div>
                    <p className="text-xs text-muted-foreground">Your password is encrypted and securely stored</p>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h4 className="text-sm font-medium flex items-center space-x-2"><KeyRound className="w-4 h-4" /><span>Change Password</span></h4>

                    <div className="space-y-2">
                      <label htmlFor="current-password" className="text-sm">Current Password</label>
                      <div className="relative flex items-center">
                        <Input id="current-password" className="flex-1 pr-3" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                        <Button type="button" variant="ghost" size="sm" className="ml-2 h-7 w-7 p-0 z-10" onClick={() => setShowCurrentPassword(!showCurrentPassword)} aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}>{showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm">New Password</label>
                      <div className="relative flex items-center">
                        <Input id="new-password" className="flex-1 pr-3" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                        <Button type="button" variant="ghost" size="sm" className="ml-2 h-7 w-7 p-0 z-10" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}>{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm">Confirm New Password</label>
                      <div className="relative flex items-center">
                        <Input id="confirm-password" className="flex-1 pr-3" type={showConfirmPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" />
                        <Button type="button" variant="ghost" size="sm" className="ml-2 h-7 w-7 p-0 z-10" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                      </div>
                      {confirmNewPassword && newPassword && (
                        <p className={`text-xs flex items-center space-x-1 ${newPassword === confirmNewPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {newPassword === confirmNewPassword ? (<><CheckCircle className="w-3 h-3" /><span>Passwords match</span></>) : (<><XCircle className="w-3 h-3" /><span>Passwords do not match</span></>)}
                        </p>
                      )}
                    </div>

                    <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmNewPassword || changingPassword} className="w-full flex items-center justify-center space-x-2">
                      {changingPassword ? (<><RefreshCw className="w-4 h-4 animate-spin" /><span>Changing Password...</span></>) : (<><Save className="w-4 h-4" /><span>Change Password</span></>)}
                    </Button>

                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters with uppercase, lowercase, and special characters.</p>
                  </div>
                </CardContent>
              </Card>



              {/* Account Info + Delete beside each other under UUID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Account Created</span><span className="font-medium">{accountStats.accountAge}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Login</span><span className="font-medium">{accountStats.lastLogin}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Sessions</span><span className="font-medium">{accountStats.totalSessions}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Account Status</span><Badge variant={accountStats.status.variant as any} className={accountStats.status.colorClass}>{accountStats.status.status}</Badge></div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/30 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300"><Trash2 className="w-5 h-5" /><span>Delete Account</span></CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">Permanently remove your account and data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. This action is permanent.</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full flex items-center justify-center space-x-2"><Trash2 className="w-4 h-4" /><span>Delete Account</span></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400"><AlertTriangle className="w-5 h-5" /><span>Are you absolutely sure?</span></AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="space-y-3 pt-2">
                              <p className="text-sm text-foreground">This action <strong>cannot be undone</strong>. This will permanently delete your account and remove all your data from our servers.</p>
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">The following will be permanently deleted:</p>
                                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                                  <li>Your entire learning progress and completed modules</li>
                                  <li>All earned XP, badges, and achievements</li>
                                  <li>Your assessment scores and exercise history</li>
                                  <li>Account settings, preferences, and profile data</li>
                                  <li>Your username (cannot be recovered)</li>
                                </ul>
                              </div>
                              <p className="text-xs text-muted-foreground italic">This action is immediate and irreversible. Make sure you want to proceed.</p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">Yes, Delete My Account</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
