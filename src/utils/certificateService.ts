// Minimal CertificateService stub to satisfy imports during migration/type-check
export const CertificateService = {
  async generateCertificate(userId: string, moduleId: string) {
    return { success: true, url: `https://example.com/certs/${userId}/${moduleId}` };
  },
  // Synchronous accessor used by UI components
  getUserCertificates(userId: string) {
    return [] as any[];
  },
  async listCertificates(userId: string) {
    return [] as any[];
  },
  async downloadCertificate(certId: string) {
    return { success: true };
  }
};

export default CertificateService;
