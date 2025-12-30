/**
 * Supabase Integration Panel
 * 
 * Admin panel component showing integration status and controls
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, CheckCircle, XCircle, AlertCircle, RefreshCw, 
  Download, Upload, Shield, Activity, Users, BookOpen 
} from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import { getConnectionHealth } from '../utils/supabase/client';
import { AdminService } from '../utils/supabase/dataService';

export function SupabaseIntegrationPanel() {
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthData, analyticsData] = await Promise.all([
        getConnectionHealth(),
        AdminService.getSystemAnalytics()
      ]);
      setHealth(healthData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load Supabase data:', error);
    } finally {
      setLoading(false);
    }
  };

  const integrationFeatures = [
    {
      name: 'Authentication',
      status: true,
      icon: Shield,
      description: 'Supabase Auth with email/password',
      details: 'JWT-based authentication with 30-min timeout'
    },
    {
      name: 'User Progress',
      status: true,
      icon: Activity,
      description: 'Real-time progress tracking',
      details: 'Automatic sync across all devices'
    },
    {
      name: 'Curriculum Storage',
      status: true,
      icon: BookOpen,
      description: 'Cloud-based curriculum management',
      details: 'Admin CRUD operations enabled'
    },
    {
      name: 'User Management',
      status: true,
      icon: Users,
      description: 'Complete user lifecycle',
      details: 'Includes deletion archive and restoration'
    },
    {
      name: 'Real-time Sync',
      status: health?.connected || false,
      icon: RefreshCw,
      description: 'Live updates across sessions',
      details: `Latency: ${health?.latency || 0}ms`
    },
    {
      name: 'Analytics',
      status: true,
      icon: Database,
      description: 'System-wide analytics',
      details: 'Track all user activities and progress'
    }
  ];

  return (
    <div className="bg-card dark:bg-card rounded-xl border-2 border-border dark:border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 icon-primary" />
          <div>
            <h2 className="text-foreground dark:text-foreground">Supabase Integration</h2>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Cloud database and real-time backend
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        <SupabaseStatus variant="full" showLatency={true} />
      </div>

      {/* System Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted dark:bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">
              Total Users
            </div>
            <div className="text-2xl text-foreground dark:text-foreground">
              {analytics.totalUsers}
            </div>
          </div>
          <div className="bg-muted dark:bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">
              Active Users
            </div>
            <div className="text-2xl text-mint dark:text-mint">
              {analytics.activeUsers}
            </div>
          </div>
          <div className="bg-muted dark:bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">
              Total XP
            </div>
            <div className="text-2xl text-gold dark:text-gold">
              {analytics.totalXP.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted dark:bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">
              Completions
            </div>
            <div className="text-2xl text-accent dark:text-accent">
              {analytics.totalCompletions}
            </div>
          </div>
        </div>
      )}

      {/* Integration Features */}
      <div className="space-y-3">
        <h3 className="text-foreground dark:text-foreground mb-3">Integration Features</h3>
        
        {integrationFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-muted dark:bg-muted rounded-lg"
          >
            <div className="mt-1">
              {feature.status ? (
                <CheckCircle className="w-5 h-5 text-mint dark:text-mint" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive dark:text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <feature.icon className="w-4 h-4 text-primary dark:text-primary" />
                <span className="text-foreground dark:text-foreground">
                  {feature.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">
                {feature.description}
              </p>
              <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/70">
                {feature.details}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border dark:border-border">
        <h3 className="text-foreground dark:text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary dark:bg-secondary text-secondary-foreground dark:text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary dark:bg-secondary text-secondary-foreground dark:text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary dark:bg-secondary text-secondary-foreground dark:text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity">
            <Activity className="w-4 h-4" />
            View Logs
          </button>
        </div>
      </div>

      {/* Integration Guide Link */}
      <div className="mt-6 p-4 bg-accent/10 dark:bg-accent/10 rounded-lg border border-accent dark:border-accent">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent dark:text-accent mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground dark:text-foreground mb-2">
              <strong>Integration Documentation Available</strong>
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-3">
              Complete guide for Supabase integration, migration, and troubleshooting.
            </p>
            <a
              href="/SUPABASE_INTEGRATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary dark:text-primary hover:underline"
            >
              View Integration Guide →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
