/**
 * Certificate Context
 * 
 * Manages certificate generation, storage, and retrieval
 * Uses Supabase Storage for certificate images/PDFs
 * Tracks certificate metadata in database
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from './AuthContext';
import { useProgress } from './ProgressContext';

// ============================================================================
// TYPES
// ============================================================================

export type CertificateType =
  | 'module_completion'
  | 'track_completion'
  | 'excellence'
  | 'achievement';

export interface Certificate {
  id: string;
  user_id: string;
  certificate_type: CertificateType;
  title: string;
  description: string;
  module_id?: string;
  module_title?: string;
  earned_at: string;
  certificate_data?: {
    xp_earned?: number;
    completion_rate?: number;
    time_spent_hours?: number;
    grade?: string;
    skills?: string[];
  };
  storage_path?: string; // Path in Supabase Storage
  download_url?: string; // Public URL for download
}

export interface CertificateContextType {
  // State
  certificates: Certificate[];
  loading: boolean;
  error: string | null;

  // Certificate Operations
  getCertificates: () => Promise<Certificate[]>;
  getCertificate: (certificateId: string) => Certificate | null;
  generateCertificate: (
    type: CertificateType,
    title: string,
    description: string,
    moduleId?: string,
    moduleTitle?: string,
    metadata?: Record<string, any>
  ) => Promise<Certificate>;
  downloadCertificate: (certificateId: string) => Promise<void>;
  deleteCertificate: (certificateId: string) => Promise<void>;

  // Certificate Generation Helpers
  checkModuleCertificate: (moduleId: string) => Promise<boolean>;
  generateModuleCertificate: (moduleId: string) => Promise<Certificate>;
  generateTrackCertificate: (trackName: string) => Promise<Certificate>;

  // Utilities
  clearError: () => void;
  refreshCertificates: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CertificateContext = createContext<CertificateContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function CertificateProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  
  // Use try-catch to handle potential useProgress initialization issues
  let userProgress: any = null;
  let moduleProgress: any = null;
  
  try {
    const progressContext = useProgress();
    userProgress = progressContext?.userProgress;
    moduleProgress = progressContext?.moduleProgress;
  } catch (e) {
    // If ProgressProvider is not initialized yet, continue without it
    console.debug('[CertificateProvider] ProgressContext not ready yet', e);
  }

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user certificates on mount
   */
  const loadCertificatesCallback = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (fetchError) throw fetchError;

      const certificatesWithUrls = await Promise.all(
        (data || []).map(async (cert) => {
          if (cert.storage_path) {
            const { data: urlData } = await supabase.storage
              .from('certificates')
              .createSignedUrl(cert.storage_path, 3600);

            return {
              ...cert,
              download_url: urlData?.signedUrl,
            };
          }
          return cert;
        })
      );

      setCertificates(certificatesWithUrls);
    } catch (err) {
      console.error('Error loading certificates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadCertificatesCallback();
    }
  }, [user?.id, loadCertificatesCallback]);

  /**
   * Load certificates from database
   */
  const loadCertificates = useCallback(async () => {
    // Backwards-compatible named function used elsewhere; delegate to the stable callback
    await loadCertificatesCallback();
  }, [loadCertificatesCallback]);


  /**
   * Get all certificates
   */
  const getCertificates = useCallback(async (): Promise<Certificate[]> => {
    await loadCertificates();
    return certificates;
  }, [certificates, loadCertificates]);

  /**
   * Get certificate by ID
   */
  const getCertificate = useCallback((certificateId: string): Certificate | null => {
    return certificates.find(cert => cert.id === certificateId) || null;
  }, [certificates]);

  /**
   * Generate certificate image (SVG or Canvas-based)
   */
  const generateCertificateImage = async (
    username: string,
    title: string,
    description: string,
    earnedAt: string
  ): Promise<Blob> => {
    // Create SVG certificate
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="800" height="600" fill="#f8f9fa"/>
        
        <!-- Border -->
        <rect x="20" y="20" width="760" height="560" 
              fill="none" stroke="#6366f1" stroke-width="3"/>
        
        <!-- Inner Border -->
        <rect x="40" y="40" width="720" height="520" 
              fill="none" stroke="#6366f1" stroke-width="1"/>
        
        <!-- Title -->
        <text x="400" y="100" 
              font-family="Arial, sans-serif" 
              font-size="48" 
              font-weight="bold" 
              fill="#1f2937" 
              text-anchor="middle">
          Certificate of Achievement
        </text>
        
        <!-- Subtitle -->
        <text x="400" y="160" 
              font-family="Arial, sans-serif" 
              font-size="20" 
              fill="#6b7280" 
              text-anchor="middle">
          This is to certify that
        </text>
        
        <!-- Username -->
        <text x="400" y="240" 
              font-family="Arial, sans-serif" 
              font-size="36" 
              font-weight="bold" 
              fill="#6366f1" 
              text-anchor="middle">
          ${username}
        </text>
        
        <!-- Achievement -->
        <text x="400" y="300" 
              font-family="Arial, sans-serif" 
              font-size="20" 
              fill="#6b7280" 
              text-anchor="middle">
          has successfully completed
        </text>
        
        <!-- Module/Track Title -->
        <text x="400" y="360" 
              font-family="Arial, sans-serif" 
              font-size="28" 
              font-weight="bold" 
              fill="#1f2937" 
              text-anchor="middle">
          ${title}
        </text>
        
        <!-- Description -->
        <text x="400" y="410" 
              font-family="Arial, sans-serif" 
              font-size="16" 
              fill="#6b7280" 
              text-anchor="middle">
          ${description}
        </text>
        
        <!-- Date -->
        <text x="400" y="500" 
              font-family="Arial, sans-serif" 
              font-size="16" 
              fill="#6b7280" 
              text-anchor="middle">
          Awarded on ${new Date(earnedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
        </text>
        
        <!-- Signature Line -->
        <line x1="200" y1="540" x2="350" y2="540" 
              stroke="#6b7280" stroke-width="1"/>
        <text x="275" y="555" 
              font-family="Arial, sans-serif" 
              font-size="12" 
              fill="#6b7280" 
              text-anchor="middle">
          Java Study Buddy
        </text>
      </svg>
    `;

    // Convert SVG to Blob
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return blob;
  };

  /**
   * Generate and save certificate
   */
  const generateCertificate = useCallback(async (
    type: CertificateType,
    title: string,
    description: string,
    moduleId?: string,
    moduleTitle?: string,
    metadata?: Record<string, any>
  ): Promise<Certificate> => {
    if (!user?.id || !profile?.username) {
      throw new Error('User must be authenticated to generate certificate');
    }

    try {
      setLoading(true);
      setError(null);

      const earnedAt = new Date().toISOString();

      // Generate certificate image
      const imageBlob = await generateCertificateImage(
        profile.username,
        title,
        description,
        earnedAt
      );

      // Upload to Supabase Storage
      const fileName = `${user.id}/${type}_${Date.now()}.svg`;
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, imageBlob, {
          contentType: 'image/svg+xml',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create certificate record in database
      const { data: certificateData, error: createError } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          certificate_type: type,
          title,
          description,
          module_id: moduleId,
          module_title: moduleTitle,
          earned_at: earnedAt,
          storage_path: fileName,
          certificate_data: metadata,
        })
        .select()
        .maybeSingle();

      if (createError) throw createError;

      // Generate signed URL
      const { data: urlData } = await supabase.storage
        .from('certificates')
        .createSignedUrl(fileName, 3600);

      const newCertificate: Certificate = {
        ...certificateData,
        download_url: urlData?.signedUrl,
      };

      // Add to local state
      setCertificates(prev => [newCertificate, ...prev]);

      return newCertificate;
    } catch (err) {
      console.error('Error generating certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.username]);

  /**
   * Download certificate
   */
  const downloadCertificate = useCallback(async (certificateId: string) => {
    try {
      const certificate = certificates.find(cert => cert.id === certificateId);
      if (!certificate) throw new Error('Certificate not found');

      if (!certificate.storage_path) {
        throw new Error('Certificate file not available');
      }

      // Download from Supabase Storage
      const { data, error: downloadError } = await supabase.storage
        .from('certificates')
        .download(certificate.storage_path);

      if (downloadError) throw downloadError;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.title.replace(/\s+/g, '_')}_Certificate.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to download certificate');
      throw err;
    }
  }, [certificates]);

  /**
   * Delete certificate
   */
  const deleteCertificate = useCallback(async (certificateId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      const certificate = certificates.find(cert => cert.id === certificateId);
      if (!certificate) throw new Error('Certificate not found');

      // Delete from storage if exists
      if (certificate.storage_path) {
        await supabase.storage
          .from('certificates')
          .remove([certificate.storage_path]);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [certificates, user?.id]);

  /**
   * Check if user already has certificate for module
   */
  const checkModuleCertificate = useCallback(async (moduleId: string): Promise<boolean> => {
    const existingCert = certificates.find(
      cert => cert.module_id === moduleId && cert.certificate_type === 'module_completion'
    );
    return !!existingCert;
  }, [certificates]);

  /**
   * Generate module completion certificate
   */
  const generateModuleCertificate = useCallback(async (moduleId: string): Promise<Certificate> => {
    // Check if already has certificate
    const hasCert = await checkModuleCertificate(moduleId);
    if (hasCert) {
      throw new Error('Certificate already exists for this module');
    }

    // Get module progress
    const progress = moduleProgress[moduleId];
    if (!progress || progress.progress_percentage < 100) {
      throw new Error('Module must be completed to earn certificate');
    }

    // Generate certificate
    const certificate = await generateCertificate(
      'module_completion',
      progress.module_id, // Should be module title, enhance with actual module data
      'for successful completion of all lessons and exercises',
      moduleId,
      progress.module_id,
      {
        completion_rate: progress.progress_percentage,
        lessons_completed: progress.completed_lessons?.length || 0,
        exercises_completed: progress.exercises_completed?.length || 0,
      }
    );

    return certificate;
  }, [moduleProgress, checkModuleCertificate, generateCertificate]);

  /**
   * Generate track completion certificate
   */
  const generateTrackCertificate = useCallback(async (trackName: string): Promise<Certificate> => {
    // Generate certificate
    const certificate = await generateCertificate(
      'track_completion',
      `${trackName} Track`,
      'for completing all modules in the learning track',
      undefined,
      undefined,
      {
        track_name: trackName,
        total_xp: userProgress?.total_xp || 0,
        level: userProgress?.level || 1,
      }
    );

    return certificate;
  }, [userProgress, generateCertificate]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh certificates from database
   */
  const refreshCertificates = useCallback(async () => {
    await loadCertificates();
  }, [loadCertificates]);

  const value: CertificateContextType = {
    // State
    certificates,
    loading,
    error,

    // Certificate Operations
    getCertificates,
    getCertificate,
    generateCertificate,
    downloadCertificate,
    deleteCertificate,

    // Certificate Generation Helpers
    checkModuleCertificate,
    generateModuleCertificate,
    generateTrackCertificate,

    // Utilities
    clearError,
    refreshCertificates,
  };

  return <CertificateContext.Provider value={value}>{children}</CertificateContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access certificate context
 * Must be used within CertificateProvider
 */
export function useCertificates() {
  const context = useContext(CertificateContext);

  if (!context) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }

  return context;
}
