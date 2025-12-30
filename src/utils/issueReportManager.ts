// Issue Report Manager - Handles storage and retrieval of user-submitted issues

export type IssueType = 'bug' | 'feature' | 'help' | 'feedback';

export interface IssueReport {
  id: string;
  userId: string;
  username: string;
  type: IssueType;
  subject: string;
  description: string;
  timestamp: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  screenshot?: string; // Base64 encoded screenshot
}

import { supabase } from './supabase/client';

export class IssueReportManager {
  private static readonly REPORTS_KEY = 'study_buddy_issue_reports';

  // Submit a new issue report
  static async submitReport(
    userId: string,
    username: string,
    type: IssueType,
    subject: string,
    description: string,
    screenshot?: string
  ): Promise<IssueReport> {
    try {
      const timestamp = new Date().toISOString();
      const priority = this.determinePriority(type, subject, description);

      // If screenshot is a data URL, try uploading to Supabase Storage and replace with public URL
      let screenshotUrl: string | null = null;
      if (screenshot && typeof window !== 'undefined' && screenshot.startsWith('data:')) {
        try {
          // Convert data URL to Blob
          const res = await fetch(screenshot);
          const blob = await res.blob();
          const ext = blob.type.split('/')[1] || 'png';
          const filename = `issue-${userId || 'anon'}-${Date.now()}.${ext}`;
          // store at root of the bucket to avoid repeating bucket name in object path
          const path = `${filename}`;

          const { error: uploadErr } = await supabase.storage
            .from('issue_screenshots')
            .upload(path, blob, { cacheControl: '3600', upsert: false });

          if (uploadErr) {
            // Improve the debug message so it's actionable
            console.warn('Screenshot upload failed:', uploadErr.message || uploadErr);
            if ((uploadErr as any)?.message?.toString().toLowerCase().includes('bucket')) {
              console.warn('It looks like the storage bucket `issue_screenshots` does not exist. Create it in the Supabase dashboard (Storage → Buckets → New bucket) or via the service-role API/CLI.');
            }
          } else {
            // Get public URL
            try {
              const { data: publicData } = supabase.storage.from('issue_screenshots').getPublicUrl(path);
              screenshotUrl = publicData?.publicUrl || null;
            } catch (e) {
              console.warn('Failed to get public URL for screenshot:', e);
            }
          }
        } catch (e) {
          console.warn('Failed to convert/upload screenshot data URL:', e);
        }
      } else if (screenshot) {
        // If screenshot is already a URL, use it directly
        screenshotUrl = screenshot;
      }

      // Prepare row data matching issue_reports schema (explicit columns only)
      const row: any = {
        user_id: userId || null,
        issue_type: type,
        title: subject,
        description,
        severity: priority, // maps to schema's severity column
        status: 'open',
        screenshot_url: screenshotUrl,
        created_at: timestamp,
        updated_at: timestamp
      };

      // Try inserting into Supabase if configured
      try {
        const { data, error } = await supabase.from('issue_reports').insert(row).select().single();
        if (error) {
          console.warn('Supabase insert error for issue_reports:', error);
        }
        if (data) {
          const report: IssueReport = {
            id: data.id || this.generateReportId(),
            userId: data.user_id || userId,
            username: username || undefined,
            type: (data.issue_type as IssueType) || type,
            subject: data.title || subject,
            description: data.description,
            timestamp: data.created_at || timestamp,
            status: data.status || 'open',
            priority: (data.severity as IssueReport['priority']) || priority,
            adminNotes: data.admin_response || undefined,
            screenshot: data.screenshot_url || undefined
          };

          return report;
        }
      } catch (err) {
        console.warn('Failed to insert issue report into Supabase:', err);
      }

      // Fallback to local generated report when Supabase not available
      const fallback: IssueReport = {
        id: this.generateReportId(),
        userId,
        username,
        type,
        subject,
        description,
        timestamp,
        status: 'open',
        priority,
        ...(screenshot && { screenshot })
      };

      const allReports = this.getAllReports();
      allReports.push(fallback);
      this.saveReports(allReports);

      return fallback;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }

  // Submit user feedback to `user_feedback` table
  static async submitFeedback(
    userId: string,
    feedbackType: string,
    itemId: string | null,
    rating: number | null,
    comment: string | null,
    isHelpful: boolean | null = null
  ) {
    try {
      const row: any = {
        user_id: userId || null,
        feedback_type: feedbackType || 'overall',
        item_id: itemId || null,
        rating: rating || null,
        comment: comment || null,
        is_helpful: isHelpful,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('user_feedback').insert(row).select().single();
      if (error) {
        console.warn('Supabase insert error for user_feedback:', error.message || error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  }

  // Get all issue reports
  // SUPABASE TODO: Query from issue_reports table
  static getAllReports(): IssueReport[] {
    try {
      if (typeof window === 'undefined') return [];

      // DISABLED FOR SUPABASE MIGRATION
      // const data = localStorage.getItem(this.REPORTS_KEY);
      // if (!data) return [];

      // const reports = JSON.parse(data);
      // return Array.isArray(reports) ? reports : [];
      return [];
    } catch (error) {
      console.error('Error loading issue reports:', error);
      return [];
    }
  }

  // Get reports by user
  static getUserReports(userId: string): IssueReport[] {
    try {
      const allReports = this.getAllReports();
      return allReports.filter(report => report.userId === userId);
    } catch (error) {
      console.error('Error loading user reports:', error);
      return [];
    }
  }

  // Get reports by status
  static getReportsByStatus(status: IssueReport['status']): IssueReport[] {
    try {
      const allReports = this.getAllReports();
      return allReports.filter(report => report.status === status);
    } catch (error) {
      console.error('Error filtering reports:', error);
      return [];
    }
  }

  // Get reports by type
  static getReportsByType(type: IssueType): IssueReport[] {
    try {
      const allReports = this.getAllReports();
      return allReports.filter(report => report.type === type);
    } catch (error) {
      console.error('Error filtering reports:', error);
      return [];
    }
  }

  // Update report status
  static updateReportStatus(reportId: string, status: IssueReport['status']): void {
    try {
      const allReports = this.getAllReports();
      const reportIndex = allReports.findIndex(r => r.id === reportId);

      if (reportIndex !== -1) {
        allReports[reportIndex].status = status;
        this.saveReports(allReports);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  }

  // Update report priority
  static updateReportPriority(reportId: string, priority: IssueReport['priority']): void {
    try {
      const allReports = this.getAllReports();
      const reportIndex = allReports.findIndex(r => r.id === reportId);

      if (reportIndex !== -1) {
        allReports[reportIndex].priority = priority;
        this.saveReports(allReports);
      }
    } catch (error) {
      console.error('Error updating report priority:', error);
    }
  }

  // Add admin notes to a report
  static addAdminNotes(reportId: string, notes: string): void {
    try {
      const allReports = this.getAllReports();
      const reportIndex = allReports.findIndex(r => r.id === reportId);

      if (reportIndex !== -1) {
        allReports[reportIndex].adminNotes = notes;
        this.saveReports(allReports);
      }
    } catch (error) {
      console.error('Error adding admin notes:', error);
    }
  }

  // Delete a report
  static deleteReport(reportId: string): void {
    try {
      const allReports = this.getAllReports();
      const filteredReports = allReports.filter(r => r.id !== reportId);
      this.saveReports(filteredReports);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  }

  // Get statistics
  static getStatistics() {
    try {
      const allReports = this.getAllReports();

      return {
        total: allReports.length,
        open: allReports.filter(r => r.status === 'open').length,
        inProgress: allReports.filter(r => r.status === 'in-progress').length,
        resolved: allReports.filter(r => r.status === 'resolved').length,
        closed: allReports.filter(r => r.status === 'closed').length,
        byType: {
          bug: allReports.filter(r => r.type === 'bug').length,
          feature: allReports.filter(r => r.type === 'feature').length,
          help: allReports.filter(r => r.type === 'help').length,
          feedback: allReports.filter(r => r.type === 'feedback').length
        },
        byPriority: {
          high: allReports.filter(r => r.priority === 'high').length,
          medium: allReports.filter(r => r.priority === 'medium').length,
          low: allReports.filter(r => r.priority === 'low').length
        }
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        byType: { bug: 0, feature: 0, help: 0, feedback: 0 },
        byPriority: { high: 0, medium: 0, low: 0 }
      };
    }
  }

  // Private helper methods
  // SUPABASE TODO: Insert into issue_reports table
  private static saveReports(_reports: IssueReport[]): void {
    if (typeof window === 'undefined') return;
    // DISABLED FOR SUPABASE MIGRATION
    // localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
  }

  private static generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static determinePriority(type: IssueType, subject: string, description: string): IssueReport['priority'] {
    // Auto-determine priority based on type and keywords
    const text = `${subject} ${description}`.toLowerCase();

    // High priority keywords
    const highPriorityKeywords = ['crash', 'error', 'broken', 'urgent', 'critical', 'cannot', 'unable', 'stuck'];
    const hasHighPriority = highPriorityKeywords.some(keyword => text.includes(keyword));

    if (type === 'bug' && hasHighPriority) {
      return 'high';
    } else if (type === 'bug' || type === 'help') {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

export default IssueReportManager;

// Async wrappers for migration: return existing sync results as promises
export namespace IssueReportManagerAsync {
  export async function getAllReportsAsync(): Promise<IssueReport[]> {
    try {
      const { data, error } = await supabase
        .from('issue_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase error fetching issue_reports:', error.message || error);
        return IssueReportManager.getAllReports();
      }

      if (!data || !Array.isArray(data)) return [];

      const reports: IssueReport[] = data.map((r: any) => ({
        id: r.id,
        userId: r.user_id || null,
        username: r.username || r.user_name || undefined,
        type: (r.issue_type as IssueType) || 'feedback',
        subject: r.title || r.subject || '',
        description: r.description || '',
        timestamp: r.created_at || r.timestamp,
        status: (r.status as IssueReport['status']) || 'open',
        priority: (r.severity as IssueReport['priority']) || 'low',
        adminNotes: r.admin_response || r.admin_notes || undefined,
        screenshot: r.screenshot_url || undefined
      }));

      return reports;
    } catch (err) {
      console.warn('Failed to load issue reports from Supabase:', err);
      return IssueReportManager.getAllReports();
    }
  }

  export async function getStatisticsAsync() {
    try {
      const reports = await getAllReportsAsync();
      return {
        total: reports.length,
        open: reports.filter(r => r.status === 'open').length,
        inProgress: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        closed: reports.filter(r => r.status === 'closed').length,
        byType: {
          bug: reports.filter(r => r.type === 'bug').length,
          feature: reports.filter(r => r.type === 'feature').length,
          help: reports.filter(r => r.type === 'help').length,
          feedback: reports.filter(r => r.type === 'feedback').length
        },
        byPriority: {
          high: reports.filter(r => r.priority === 'high').length,
          medium: reports.filter(r => r.priority === 'medium').length,
          low: reports.filter(r => r.priority === 'low').length
        }
      };
    } catch (err) {
      console.warn('Failed to compute issue report statistics:', err);
      return IssueReportManager.getStatistics();
    }
  }

  // Async update helpers used by the UI when performing actions
  export async function updateReportStatusAsync(reportId: string, status: IssueReport['status']) {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('issue_reports')
        .update(updates)
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to update report status in Supabase:', err);
      throw err;
    }
  }

  export async function updateReportPriorityAsync(reportId: string, priority: IssueReport['priority']) {
    try {
      const { error } = await supabase
        .from('issue_reports')
        .update({ severity: priority, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to update report priority in Supabase:', err);
      return false;
    }
  }

  export async function addAdminNotesAsync(reportId: string, notes: string) {
    try {
      const { error } = await supabase
        .from('issue_reports')
        .update({ admin_response: notes, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to add admin notes in Supabase:', err);
      return false;
    }
  }

  export async function deleteReportAsync(reportId: string) {
    try {
      const { error } = await supabase.from('issue_reports').delete().eq('id', reportId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to delete report in Supabase:', err);
      return false;
    }
  }
}