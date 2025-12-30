/**
 * Supabase Integration Scrumban Board
 * 
 * Visual tracking of Supabase integration progress
 * Styled based on kanban-r1 documentation
 */

import React from 'react';
import { CheckCircle, Circle, PlayCircle, Eye, Package } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'done' | 'in_review' | 'in_progress' | 'ready' | 'backlog';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

const tasks: Task[] = [
  // DONE
  {
    id: '1',
    title: 'Create Supabase Client',
    description: 'Singleton client with connection monitoring',
    status: 'done',
    priority: 'critical'
  },
  {
    id: '2',
    title: 'Define Database Schema',
    description: '30+ tables with RLS policies and triggers',
    status: 'done',
    priority: 'critical'
  },
  {
    id: '3',
    title: 'Build Data Service Layer',
    description: '5 services: Auth, Progress, Curriculum, Admin, Realtime',
    status: 'done',
    priority: 'critical'
  },
  {
    id: '4',
    title: 'Create Migration Service',
    description: 'localStorage to Supabase migration utilities',
    status: 'done',
    priority: 'high'
  },
  {
    id: '5',
    title: 'Build UI Components',
    description: 'Connection status and integration panel',
    status: 'done',
    priority: 'medium'
  },
  {
    id: '6',
    title: 'Write Documentation',
    description: '15,000+ words of comprehensive guides',
    status: 'done',
    priority: 'high'
  },
  
  // IN REVIEW
  {
    id: '7',
    title: 'Security Audit',
    description: 'Review RLS policies and authentication flow',
    status: 'in_review',
    priority: 'critical'
  },
  {
    id: '8',
    title: 'Performance Testing',
    description: 'Load testing with concurrent users',
    status: 'in_review',
    priority: 'high'
  },
  
  // IN PROGRESS
  {
    id: '9',
    title: 'Run Database Migrations',
    description: 'Execute schema creation in Supabase',
    status: 'in_progress',
    priority: 'critical'
  },
  {
    id: '10',
    title: 'Update Authentication',
    description: 'Replace UUID auth with Supabase Auth',
    status: 'in_progress',
    priority: 'critical'
  },
  {
    id: '11',
    title: 'Integrate Progress Tracking',
    description: 'Replace localStorage with Supabase calls',
    status: 'in_progress',
    priority: 'high'
  },
  
  // READY
  {
    id: '12',
    title: 'Add Real-time Subscriptions',
    description: 'Implement live progress updates',
    status: 'ready',
    priority: 'high'
  },
  {
    id: '13',
    title: 'Integrate Admin Panel',
    description: 'Connect admin tools to Supabase',
    status: 'ready',
    priority: 'medium'
  },
  {
    id: '14',
    title: 'Test Data Migration',
    description: 'Verify migration with sample users',
    status: 'ready',
    priority: 'high'
  },
  
  // BACKLOG
  {
    id: '15',
    title: 'Optimize Query Performance',
    description: 'Add caching and query optimization',
    status: 'backlog',
    priority: 'medium'
  },
  {
    id: '16',
    title: 'Cloud Storage Integration',
    description: 'Enable file uploads for projects',
    status: 'backlog',
    priority: 'low'
  },
  {
    id: '17',
    title: 'Advanced Analytics',
    description: 'Enhanced analytics dashboard',
    status: 'backlog',
    priority: 'medium'
  },
];

export function SupabaseScrumbanBoard() {
  const columns = [
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-mint dark:text-mint', bgColor: 'bg-mint/10 dark:bg-mint/10' },
    { id: 'in_review', label: 'In Review', icon: Eye, color: 'text-gold dark:text-gold', bgColor: 'bg-gold/10 dark:bg-gold/10' },
    { id: 'in_progress', label: 'In Progress', icon: PlayCircle, color: 'text-accent dark:text-accent', bgColor: 'bg-accent/10 dark:bg-accent/10' },
    { id: 'ready', label: 'Ready', icon: Package, color: 'text-primary dark:text-primary', bgColor: 'bg-primary/10 dark:bg-primary/10' },
    { id: 'backlog', label: 'Backlog', icon: Circle, color: 'text-muted-foreground dark:text-muted-foreground', bgColor: 'bg-muted dark:bg-muted' },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-destructive dark:border-l-destructive';
      case 'high':
        return 'border-l-gold dark:border-l-gold';
      case 'medium':
        return 'border-l-accent dark:border-l-accent';
      case 'low':
        return 'border-l-muted-foreground dark:border-l-muted-foreground';
      default:
        return 'border-l-border dark:border-l-border';
    }
  };

  return (
    <div className="bg-card dark:bg-card rounded-xl border-2 border-border dark:border-border p-6">
      <div className="mb-6">
        <h2 className="text-foreground dark:text-foreground mb-2">
          Supabase Integration Progress
        </h2>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          Track implementation status across all phases
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {columns.map((column) => {
          const count = tasks.filter(t => t.status === column.id).length;
          const Icon = column.icon;
          
          return (
            <div
              key={column.id}
              className={`${column.bgColor} rounded-lg p-3 text-center`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${column.color}`} />
                <span className={`text-2xl ${column.color}`}>
                  {count}
                </span>
              </div>
              <div className={`text-xs ${column.color}`}>
                {column.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = tasks.filter(t => t.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.bgColor} rounded-lg p-3 mb-3`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${column.color}`} />
                  <h3 className={`${column.color}`}>
                    {column.label}
                  </h3>
                  <span className={`ml-auto text-sm ${column.color}`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-muted dark:bg-muted rounded-lg p-3 border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer`}
                  >
                    <h4 className="text-sm text-foreground dark:text-foreground mb-1">
                      {task.title}
                    </h4>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {task.description}
                    </p>
                    {task.priority && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          task.priority === 'critical' ? 'bg-destructive/20 dark:bg-destructive/20 text-destructive dark:text-destructive' :
                          task.priority === 'high' ? 'bg-gold/20 dark:bg-gold/20 text-gold dark:text-gold' :
                          task.priority === 'medium' ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent' :
                          'bg-muted-foreground/20 dark:bg-muted-foreground/20 text-muted-foreground dark:text-muted-foreground'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border dark:border-border">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground dark:text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive/20 dark:bg-destructive/20 border-l-4 border-l-destructive dark:border-l-destructive rounded" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gold/20 dark:bg-gold/20 border-l-4 border-l-gold dark:border-l-gold rounded" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent/20 dark:bg-accent/20 border-l-4 border-l-accent dark:border-l-accent rounded" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted-foreground/20 dark:bg-muted-foreground/20 border-l-4 border-l-muted-foreground dark:border-l-muted-foreground rounded" />
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
