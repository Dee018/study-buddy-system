# 🎨 Supporting Features Integration Guide

## Quick Start

This guide shows you how to integrate user preferences, certificates, analytics, and auto-save into your components.

---

## Step 1: Add Providers to App

Add all supporting feature providers:

### Update `/App.tsx` or `/AppProviders.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { AdminProvider } from './contexts/AdminContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { CertificateProvider } from './contexts/CertificateContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AutoSaveProvider } from './contexts/AutoSaveContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PreferencesProvider>  {/* Theme and settings */}
        <CurriculumProvider>
          <ProgressProvider>
            <CertificateProvider>  {/* Certificates */}
              <AnalyticsProvider>  {/* Event tracking */}
                <AutoSaveProvider>  {/* Auto-save functionality */}
                  <AdminProvider>
                    {children}
                  </AdminProvider>
                </AutoSaveProvider>
              </AnalyticsProvider>
            </CertificateProvider>
          </ProgressProvider>
        </CurriculumProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
```

**Provider Order:**
1. AuthProvider (authentication - first)
2. PreferencesProvider (needs user for persistence)
3. CurriculumProvider (content)
4. ProgressProvider (tracking)
5. CertificateProvider (needs progress)
6. AnalyticsProvider (tracks all interactions)
7. AutoSaveProvider (saves user work)
8. AdminProvider (admin features - last)

---

## Step 2: Theme Management

### Update Theme Toggle Component:

```typescript
import { usePreferences } from '../contexts/PreferencesContext';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = usePreferences();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('light')}
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-4 h-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('system')}
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Or simple toggle button
function SimpleThemeToggle() {
  const { toggleTheme, theme } = usePreferences();

  return (
    <Button onClick={toggleTheme}>
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}
```

---

## Step 3: Update ManageAccount Component

### Before (localStorage):

```typescript
import { getTheme, setTheme } from '../utils/themeUtils';

function ManageAccount() {
  const [theme, setCurrentTheme] = useState(getTheme());

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  return <div>{/* Settings UI */}</div>;
}
```

### After (PreferencesContext):

```typescript
import { usePreferences } from '../contexts/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

function ManageAccount() {
  const { user, profile } = useAuth();
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    loading,
  } = usePreferences();

  const handlePreferenceChange = async (updates: Partial<UserPreferences>) => {
    try {
      await updatePreferences(updates);
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all preferences to defaults?')) return;

    try {
      await resetPreferences();
      toast.success('Preferences reset to defaults');
    } catch (error) {
      toast.error('Failed to reset preferences');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={profile?.username} disabled />
          </div>
          <div>
            <Label>Recovery UUID</Label>
            <div className="flex gap-2">
              <Input value={profile?.uuid} disabled />
              <Button onClick={() => navigator.clipboard.writeText(profile?.uuid || '')}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Save this UUID for password recovery
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => handlePreferenceChange({ theme: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Font Size</Label>
            <Select
              value={preferences.fontSize}
              onValueChange={(value) => handlePreferenceChange({ fontSize: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Compact Mode</Label>
            <Switch
              checked={preferences.compactMode}
              onCheckedChange={(checked) => handlePreferenceChange({ compactMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Reduced Motion</Label>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => handlePreferenceChange({ reducedMotion: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Code Editor Theme</Label>
            <Select
              value={preferences.codeTheme}
              onValueChange={(value) => handlePreferenceChange({ codeTheme: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">VS Code Dark</SelectItem>
                <SelectItem value="vs-light">VS Code Light</SelectItem>
                <SelectItem value="monokai">Monokai</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto-Advance to Next Lesson</Label>
            <Switch
              checked={preferences.autoAdvance}
              onCheckedChange={(checked) => handlePreferenceChange({ autoAdvance: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Hints</Label>
            <Switch
              checked={preferences.showHints}
              onCheckedChange={(checked) => handlePreferenceChange({ showHints: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange({ emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Progress Reminders</Label>
            <Switch
              checked={preferences.progressReminders}
              onCheckedChange={(checked) => handlePreferenceChange({ progressReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Weekly Digest</Label>
            <Switch
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) => handlePreferenceChange({ weeklyDigest: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Public Profile</Label>
            <Switch
              checked={preferences.profilePublic}
              onCheckedChange={(checked) => handlePreferenceChange({ profilePublic: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Progress to Others</Label>
            <Switch
              checked={preferences.showProgressToOthers}
              onCheckedChange={(checked) => handlePreferenceChange({ showProgressToOthers: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button onClick={handleReset} variant="outline" disabled={loading}>
        Reset All Preferences
      </Button>
    </div>
  );
}
```

---

## Step 4: Integrate Auto-Save in Code Editors

### Exercise Editor with Auto-Save:

```typescript
import { useAutoSave } from '../contexts/AutoSaveContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Check, RefreshCw, AlertTriangle } from 'lucide-react';

function ExerciseEditor({ exerciseId, initialCode }: { exerciseId: string; initialCode: string }) {
  const {
    saveStatus,
    lastSaved,
    enableAutoSave,
    loadSavedContent,
    forceSave,
  } = useAutoSave();

  const { trackEvent } = useAnalytics();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Load saved content on mount
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);

      // Try to load saved content
      const saved = await loadSavedContent('exercise', exerciseId);

      if (saved && saved.saved_content !== initialCode) {
        // Ask user if they want to restore
        if (confirm('You have unsaved work. Would you like to restore it?')) {
          setCode(saved.saved_content);
          toast.info('Restored previous work');
        } else {
          setCode(initialCode);
        }
      } else {
        setCode(initialCode);
      }

      setLoading(false);

      // Track event
      trackEvent('exercise_start', 'Exercise Opened', {
        exercise_id: exerciseId,
        has_saved_work: !!saved,
      });
    };

    loadContent();
  }, [exerciseId, initialCode]);

  // Enable auto-save when code changes
  useEffect(() => {
    if (!loading && code) {
      const cleanup = enableAutoSave('exercise', exerciseId, code, 5000);
      return cleanup;
    }
  }, [code, loading, exerciseId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Track code run events
    if (newCode.includes('System.out.println')) {
      trackEvent('code_run', 'Code Executed', {
        exercise_id: exerciseId,
        code_length: newCode.length,
      });
    }
  };

  const handleSubmit = async () => {
    // Force save before submission
    await forceSave();

    // Track submission
    trackEvent('exercise_submit', 'Exercise Submitted', {
      exercise_id: exerciseId,
      code_length: code.length,
    });

    // Submit code...
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-muted-foreground">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && lastSaved && (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Saved {formatRelativeTime(lastSaved)}
              </span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Save failed</span>
            </>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={handleCodeChange}
        language="java"
        height="500px"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSubmit}>
          Submit Solution
        </Button>
        <Button variant="outline" onClick={() => setCode(initialCode)}>
          Reset Code
        </Button>
      </div>
    </div>
  );
}

// Helper function for relative time
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return date.toLocaleString();
}
```

---

## Step 5: Add Certificate Generation

### Module Completion with Certificate:

```typescript
import { useCertificates } from '../contexts/CertificateContext';
import { useProgress } from '../contexts/ProgressContext';
import { Award, Download } from 'lucide-react';

function ModuleCompleteModal({ moduleId, moduleName }: { moduleId: string; moduleName: string }) {
  const {
    generateModuleCertificate,
    checkModuleCertificate,
    downloadCertificate,
  } = useCertificates();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateCertificateIfNeeded();
  }, [moduleId]);

  const generateCertificateIfNeeded = async () => {
    // Check if already has certificate
    const hasCert = await checkModuleCertificate(moduleId);

    if (!hasCert) {
      setGenerating(true);
      try {
        const cert = await generateModuleCertificate(moduleId);
        setCertificate(cert);
        toast.success('Certificate earned!');
      } catch (error) {
        console.error('Failed to generate certificate:', error);
      } finally {
        setGenerating(false);
      }
    }
  };

  if (generating) {
    return (
      <div className="text-center p-6">
        <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p>Generating your certificate...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <CardTitle className="text-2xl">Module Completed!</CardTitle>
        <CardDescription>
          Congratulations on completing {moduleName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {certificate && (
          <>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Your certificate is ready
              </p>
              <p className="font-semibold">{certificate.title}</p>
            </div>

            <Button
              onClick={() => downloadCertificate(certificate.id)}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </>
        )}

        <Button onClick={() => {/* Navigate to next module */}} variant="outline" className="w-full">
          Continue Learning
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Certificate Gallery in Profile:

```typescript
function CertificateGallery() {
  const { certificates, downloadCertificate } = useCertificates();

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">No Certificates Yet</p>
          <p className="text-muted-foreground">
            Complete modules to earn certificates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map(cert => (
        <Card key={cert.id} className="overflow-hidden">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 text-white">
            <Award className="w-12 h-12 mb-4" />
            <h3 className="font-bold text-lg">{cert.title}</h3>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              {cert.description}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span>{cert.certificate_type.replace('_', ' ')}</span>
              <span>{new Date(cert.earned_at).toLocaleDateString()}</span>
            </div>
            <Button
              onClick={() => downloadCertificate(cert.id)}
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Step 6: Analytics Dashboard

### User Analytics Display:

```typescript
import { useAnalytics } from '../contexts/AnalyticsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AnalyticsDashboard() {
  const {
    getUserEvents,
    getSessionHistory,
    getMostActiveTimeOfDay,
    getWeeklyActivity,
    getTimeSpentByModule,
  } = useAnalytics();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [events, sessions, activeTime, weeklyActivity, timeByModule] = await Promise.all([
        getUserEvents(30),
        getSessionHistory(50),
        getMostActiveTimeOfDay(),
        getWeeklyActivity(),
        getTimeSpentByModule(),
      ]);

      setStats({
        totalEvents: events.length,
        totalSessions: sessions.length,
        activeTime,
        weeklyActivity,
        timeByModule,
        averageSessionDuration: sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length / 60,
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">
              Avg {Math.round(stats.averageSessionDuration)} minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stats.activeTime}</p>
            <p className="text-sm text-muted-foreground">Your peak learning time</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.weeklyActivity).map(([day, count]) => ({
              day,
              sessions: count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time by Module */}
      <Card>
        <CardHeader>
          <CardTitle>Time Spent by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.timeByModule).map(([moduleId, minutes]: [string, any]) => (
              <div key={moduleId} className="flex items-center justify-between">
                <span className="text-sm">{moduleId}</span>
                <span className="text-sm font-medium">{Math.round(minutes)} min</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Migration Checklist

### Remove Old Imports:
- [ ] Remove `import { getTheme, setTheme } from '../utils/themeUtils'`
- [ ] Remove `import certificateService`
- [ ] Remove `import analyticsEngine`
- [ ] Remove `import autoSaveManager`
- [ ] Remove all localStorage.getItem/setItem calls

### Add New Imports:
- [ ] `import { usePreferences } from '../contexts/PreferencesContext'`
- [ ] `import { useCertificates } from '../contexts/CertificateContext'`
- [ ] `import { useAnalytics } from '../contexts/AnalyticsContext'`
- [ ] `import { useAutoSave } from '../contexts/AutoSaveContext'`

### Update Components:
- [ ] ManageAccount → Use usePreferences()
- [ ] Theme toggle → Use theme state
- [ ] Exercise editors → Add auto-save
- [ ] Module completion → Generate certificates
- [ ] Profile → Display certificates
- [ ] Profile → Show analytics

### Testing:
- [ ] Theme persists across sessions
- [ ] Preferences sync across devices
- [ ] Certificates generate correctly
- [ ] Auto-save triggers on code changes
- [ ] Analytics events tracked
- [ ] Save status indicators work

---

## Summary

You now have everything to integrate supporting features:

✅ PreferencesProvider setup  
✅ usePreferences() hook usage  
✅ CertificateProvider with SVG generation  
✅ useCertificates() hook usage  
✅ AnalyticsProvider with event tracking  
✅ useAnalytics() hook usage  
✅ AutoSaveProvider with real-time sync  
✅ useAutoSave() hook usage  

**Next:** Update components, remove deprecated utils, and test all features!
