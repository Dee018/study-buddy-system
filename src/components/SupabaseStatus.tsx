/**
 * Supabase Status Component
 * 
 * Displays real-time connection status and health indicators
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { getConnectionHealth } from '../utils/supabase/client';

interface SupabaseStatusProps {
  variant?: 'compact' | 'full';
  showLatency?: boolean;
  className?: string;
}

export function SupabaseStatus({
  variant = 'compact',
  showLatency = false,
  className = ''
}: SupabaseStatusProps) {
  const [status, setStatus] = useState<{
    connected: boolean;
    latency: number;
    status: 'healthy' | 'slow' | 'disconnected';
  }>({
    connected: false,
    latency: 0,
    status: 'disconnected'
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    const health = await getConnectionHealth();
    setStatus(health);
    setChecking(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {status.connected ? (
          <>
            <CheckCircle className="w-4 h-4 text-mint dark:text-mint" />
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">
              Connected
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-destructive dark:text-destructive" />
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">
              Offline
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-card dark:bg-card border-border dark:border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-foreground dark:text-foreground">Database Connection</h3>
        <div className="flex items-center gap-2">
          {status.status === 'healthy' && (
            <Wifi className="w-5 h-5 icon-success" />
          )}
          {status.status === 'slow' && (
            <AlertCircle className="w-5 h-5 icon-warning" />
          )}
          {status.status === 'disconnected' && (
            <WifiOff className="w-5 h-5 icon-destructive" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Status:</span>
          <span className={`text-sm ${status.connected
              ? 'text-mint dark:text-mint'
              : 'text-destructive dark:text-destructive'
            }`}>
            {status.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {showLatency && status.connected && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">Latency:</span>
            <span className={`text-sm ${status.latency < 200
                ? 'text-mint dark:text-mint'
                : status.latency < 1000
                  ? 'text-gold dark:text-gold'
                  : 'text-destructive dark:text-destructive'
              }`}>
              {status.latency}ms
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">Health:</span>
          <span className={`text-sm capitalize ${status.status === 'healthy'
              ? 'text-mint dark:text-mint'
              : status.status === 'slow'
                ? 'text-gold dark:text-gold'
                : 'text-destructive dark:text-destructive'
            }`}>
            {status.status}
          </span>
        </div>
      </div>

      {checking && (
        <div className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
          Checking connection...
        </div>
      )}
    </div>
  );
}
