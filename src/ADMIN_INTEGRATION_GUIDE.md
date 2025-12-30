# 🛡️ Admin System Integration Guide

## Quick Start

This guide shows you how to integrate the new Supabase-based admin system into your components.

---

## Step 1: Add AdminProvider to App

Wrap your app with the AdminProvider:

### Update `/App.tsx` or `/AppProviders.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { AdminProvider } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurriculumProvider>
        <ProgressProvider>
          <AdminProvider>  {/* Add AdminProvider here */}
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AdminProvider>
        </ProgressProvider>
      </CurriculumProvider>
    </AuthProvider>
  );
}
```

**Provider Order:**
1. AuthProvider (authentication - first)
2. CurriculumProvider (content)
3. ProgressProvider (tracking)
4. AdminProvider (admin features - needs all above)
5. ThemeProvider (visual - last)

---

## Step 2: Protect Admin Routes

Add admin access protection:

```typescript
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Usage in router
<Route path="/admin" element={
  <AdminRoute>
    <AdminPanel />
  </AdminRoute>
} />
```

---

## Step 3: Update AdminPanel

### Before (localStorage + Utils):

```typescript
import { AdminDataService } from '../utils/adminDataService';
import { IssueReportManager } from '../utils/issueReportManager';
import { DeletedUsersManager } from '../utils/deletedUsersManager';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const allUsers = AdminDataService.getAllUsers();
    const allIssues = IssueReportManager.getAllIssues();
    setUsers(allUsers);
    setIssues(allIssues);
  }, []);

  return <div>...</div>;
}
```

### After (AdminContext):

```typescript
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';

function AdminPanel() {
  const { profile } = useAuth();
  const {
    users,
    deletedUsers,
    issueReports,
    analytics,
    contentStats,
    loading,
    error,
    subscribeToIssues,
    subscribeToUsers,
  } = useAdmin();

  // Check admin access
  if (profile?.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubIssues = subscribeToIssues();
    const unsubUsers = subscribeToUsers();

    return () => {
      unsubIssues();
      unsubUsers();
    };
  }, [subscribeToIssues, subscribeToUsers]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Users" 
          value={analytics?.totalUsers || 0} 
          icon={Users}
        />
        <StatCard 
          title="Active Users" 
          value={analytics?.activeUsers || 0} 
          icon={Activity}
        />
        <StatCard 
          title="Open Issues" 
          value={analytics?.issuesOpen || 0} 
          icon={AlertTriangle}
        />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="content">
          <ContentModerationPanel />
        </TabsContent>

        <TabsContent value="issues">
          <IssueReportsPanel />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Step 4: User Management Panel

### Complete Implementation:

```typescript
import { useAdmin } from '../contexts/AdminContext';
import { toast } from 'sonner@2.0.3';

function UserManagementPanel() {
  const {
    users,
    deletedUsers,
    deleteUser,
    restoreUser,
    updateUserRole,
    getDormantUsers,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showDormant, setShowDormant] = useState(false);
  const [dormantUsers, setDormantUsers] = useState([]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Load dormant users
  const loadDormantUsers = async () => {
    try {
      const dormant = await getDormantUsers();
      setDormantUsers(dormant);
      setShowDormant(true);
    } catch (error) {
      toast.error('Failed to load dormant users');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This will archive their account.`)) {
      return;
    }

    try {
      await deleteUser(userId, 'Manual deletion by admin');
      toast.success(`User "${username}" deleted and archived`);
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  // Restore user
  const handleRestoreUser = async (deletedUserId: string, username: string) => {
    if (!confirm(`Restore user "${username}"?`)) return;

    try {
      await restoreUser(deletedUserId);
      toast.success(`User "${username}" restored successfully`);
    } catch (error) {
      toast.error('Failed to restore user');
      console.error(error);
    }
  };

  // Change user role
  const handleRoleChange = async (userId: string, username: string, newRole: 'learner' | 'admin') => {
    if (!confirm(`Change "${username}" role to "${newRole}"?`)) return;

    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="learner">Learners</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={loadDormantUsers}>
          Show Dormant Users
        </Button>
      </div>

      {/* Active Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.last_login).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'destructive'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, user.username, value as any)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="learner">Learner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dormant Users (if shown) */}
      {showDormant && dormantUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dormant Users (90+ days inactive)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dormantUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Last login: {new Date(user.last_login).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.username)}
                  >
                    Archive
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deleted Users */}
      {deletedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deleted Users ({deletedUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Deletion Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {new Date(user.deleted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.deletion_type === 'admin' ? 'default' : 'secondary'}>
                        {user.deletion_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.can_restore ? (
                        <Button
                          size="sm"
                          onClick={() => handleRestoreUser(user.id, user.username)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Cannot restore
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Step 5: Content Moderation Panel

```typescript
function ContentModerationPanel() {
  const {
    getUnpublishedContent,
    publishContent,
    unpublishContent,
  } = useAdmin();

  const { modules } = useCurriculum();
  const [unpublished, setUnpublished] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnpublishedContent();
  }, []);

  const loadUnpublishedContent = async () => {
    setLoading(true);
    try {
      const content = await getUnpublishedContent();
      setUnpublished(content);
    } catch (error) {
      toast.error('Failed to load unpublished content');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (type: 'module' | 'lesson' | 'exercise', id: string, title: string) => {
    try {
      await publishContent(type, id);
      toast.success(`"${title}" published successfully`);
      await loadUnpublishedContent();
    } catch (error) {
      toast.error('Failed to publish content');
    }
  };

  const handleUnpublish = async (type: 'module' | 'lesson' | 'exercise', id: string, title: string) => {
    if (!confirm(`Unpublish "${title}"? Learners will no longer see this content.`)) {
      return;
    }

    try {
      await unpublishContent(type, id);
      toast.success(`"${title}" unpublished`);
      await loadUnpublishedContent();
    } catch (error) {
      toast.error('Failed to unpublish content');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Published Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Published Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {modules.filter(m => m.is_published).map(module => (
              <div key={module.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{module.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Week {module.week_number} • {module.lessonCount || 0} lessons • {module.exerciseCount || 0} exercises
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Published</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnpublish('module', module.id, module.title)}
                  >
                    Unpublish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Draft Modules */}
      {unpublished && unpublished.modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Modules ({unpublished.modules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unpublished.modules.map((module: any) => (
                <div key={module.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{module.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Week {module.week_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Draft</Badge>
                    <Button
                      size="sm"
                      onClick={() => handlePublish('module', module.id, module.title)}
                    >
                      Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Lessons */}
      {unpublished && unpublished.lessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Lessons ({unpublished.lessons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unpublished.lessons.map((lesson: any) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {lesson.xp_reward} XP
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePublish('lesson', lesson.id, lesson.title)}
                  >
                    Publish
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Step 6: Issue Reports Panel

```typescript
function IssueReportsPanel() {
  const {
    issueReports,
    updateIssueStatus,
    assignIssue,
  } = useAdmin();

  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredIssues = statusFilter === 'all'
    ? issueReports
    : issueReports.filter(issue => issue.status === statusFilter);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await updateIssueStatus(issueId, newStatus as any);
      toast.success('Issue status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssign = async (issueId: string) => {
    if (!user?.id) return;

    try {
      await assignIssue(issueId, user.id);
      toast.success('Issue assigned to you');
    } catch (error) {
      toast.error('Failed to assign issue');
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {issueReports.filter(i => i.status === 'open').length}
              </p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {issueReports.filter(i => i.status === 'in_progress').length}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {issueReports.filter(i => i.status === 'resolved').length}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {issueReports.filter(i => i.status === 'closed').length}
              </p>
              <p className="text-sm text-muted-foreground">Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Issues</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      {/* Issue List */}
      <div className="space-y-4">
        {filteredIssues.map(issue => (
          <Card key={issue.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{issue.title}</CardTitle>
                  <CardDescription>
                    {issue.issue_type} • Priority: {issue.priority} • 
                    Created {new Date(issue.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={
                  issue.status === 'open' ? 'destructive' :
                  issue.status === 'in_progress' ? 'default' :
                  issue.status === 'resolved' ? 'success' : 'secondary'
                }>
                  {issue.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{issue.description}</p>

              <div className="flex items-center gap-2">
                {issue.status === 'open' && (
                  <Button
                    size="sm"
                    onClick={() => handleAssign(issue.id)}
                  >
                    Assign to Me
                  </Button>
                )}

                <Select
                  value={issue.status}
                  onValueChange={(value) => handleStatusChange(issue.id, value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {issue.resolved_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Resolved on {new Date(issue.resolved_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Step 7: Analytics Panel

```typescript
function AnalyticsPanel() {
  const {
    analytics,
    contentStats,
    getUserActivity,
    exportData,
    refreshAnalytics,
  } = useAdmin();

  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserActivity();
  }, []);

  const loadUserActivity = async () => {
    setLoading(true);
    try {
      const activity = await getUserActivity(30);
      setUserActivity(activity);
    } catch (error) {
      toast.error('Failed to load user activity');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'users' | 'progress' | 'issues' | 'all') => {
    try {
      await exportData(type);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (!analytics || !contentStats) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-bold">{analytics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active (30d):</span>
                <span className="font-bold">{analytics.activeUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Published:</span>
                <span className="font-bold">{contentStats.publishedModules}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Drafts:</span>
                <span className="font-bold">{contentStats.draftModules}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Lessons:</span>
                <span className="font-bold">{contentStats.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Exercises:</span>
                <span className="font-bold">{contentStats.totalExercises}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total XP:</span>
                <span className="font-bold">{analytics.totalXP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completions:</span>
                <span className="font-bold">{analytics.totalCompletions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users by XP */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by XP</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Modules</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivity
                .sort((a, b) => b.totalXP - a.totalXP)
                .slice(0, 10)
                .map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.totalXP.toLocaleString()}</TableCell>
                    <TableCell>Level {user.level}</TableCell>
                    <TableCell>{user.completedModules}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleExport('users')}>
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button onClick={() => handleExport('progress')}>
              <Download className="w-4 h-4 mr-2" />
              Export Progress
            </Button>
            <Button onClick={() => handleExport('issues')}>
              <Download className="w-4 h-4 mr-2" />
              Export Issues
            </Button>
            <Button onClick={() => handleExport('all')} variant="default">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <Button onClick={refreshAnalytics} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Analytics
      </Button>
    </div>
  );
}
```

---

## Migration Checklist

### Remove Old Imports:
- [ ] Remove `import { AdminDataService }`
- [ ] Remove `import { IssueReportManager }`
- [ ] Remove `import { DeletedUsersManager }`
- [ ] Remove `import { CurriculumManager }`
- [ ] Remove all localStorage access

### Add New Imports:
- [ ] `import { useAdmin } from '../contexts/AdminContext'`
- [ ] `import { useAuth } from '../contexts/AuthContext'`
- [ ] `import { useCurriculum } from '../contexts/CurriculumContext'`

### Update Operations:
- [ ] Replace `AdminDataService.getAllUsers()` → `useAdmin().getAllUsers()`
- [ ] Replace `IssueReportManager.getAllIssues()` → `useAdmin().issueReports`
- [ ] Replace `DeletedUsersManager.getDeleted()` → `useAdmin().deletedUsers`
- [ ] Add real-time subscriptions
- [ ] Add loading/error states

### Testing:
- [ ] Admin can view dashboard
- [ ] Admin can delete users
- [ ] Admin can restore users
- [ ] Admin can change roles
- [ ] Admin can publish/unpublish content
- [ ] Admin can manage issues
- [ ] Real-time updates work
- [ ] Export functionality works

---

## Summary

You now have everything you need to integrate the admin system:

✅ AdminProvider setup  
✅ useAdmin() hook usage  
✅ User management (delete/restore/role change)  
✅ Content moderation (publish/unpublish)  
✅ Issue tracking (status/assignment)  
✅ Analytics dashboard  
✅ Real-time updates  
✅ Data export  

**Next:** Update AdminPanel and related components, remove deprecated utils, and test thoroughly!
